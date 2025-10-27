"""Simple camera demo for the ISLR TFLite model.

Requirements:
  pip install mediapipe opencv-python pandas

Run from the `webapp` folder with the venv activated:
  python run_camera.py

This script:
 - Loads the TFLite model via `module.islr.model.IsolatedASLRecognition`
 - Prints available signs from `module/islr/dict_sign.csv`
 - Captures the camera, extracts landmarks using MediaPipe Holistic,
   buffers a small number of frames, and calls `predict` to get the
   recognized sign. Predictions are printed to the terminal and
   overlaid on the video window.
"""
import time
import os
import cv2
import pandas as pd
import numpy as np
import mediapipe as mp
from collections import deque

from module.islr import model as islr_model


BUFFER_SIZE = 18  # number of frames to buffer before predicting
SMOOTHING_WINDOW = 5  # how many recent predictions to keep for smoothing
STABILITY_COUNT = 3   # how many of those must agree to consider stable
PROB_THRESHOLD = 0.7   # minimum model confidence to consider a prediction
MOVE_THRESHOLD = 0.06  # minimum average hand movement to consider 'active' (tune as needed)


class LandmarkData:
    def __init__(self, timeInSeconds, frameNumber,
                 poseLandmarks=None, faceLandmarks=None,
                 leftHandLandmarks=None, rightHandLandmarks=None):
        # Fields expected by webapp/module/islr/model.py
        self.timeInSeconds = timeInSeconds
        self.frameNumber = frameNumber
        self.poseLandmarks = poseLandmarks
        self.faceLandmarks = faceLandmarks
        self.leftHandLandmarks = leftHandLandmarks
        self.rightHandLandmarks = rightHandLandmarks


def print_available_signs(dict_csv_path: str):
    try:
        df = pd.read_csv(dict_csv_path)
        signs = df['sign'].tolist()
        print(f"Available signs ({len(signs)}):")
        print(", ".join(signs))
    except Exception as e:
        print(f"Could not read dict_sign.csv at {dict_csv_path}: {e}")


def main():
    cwd = os.getcwd()
    model_path = os.path.join('module', 'islr')
    dict_csv_path = os.path.join(model_path, 'dict_sign.csv')

    print("Loading TFLite model (this may take a moment)...")
    recognizer = islr_model.IsolatedASLRecognition(model_path=model_path)
    print_available_signs(dict_csv_path)

    def open_camera():
        # Try common backends and indices on Windows to increase chance of success
        backends = [cv2.CAP_DSHOW, cv2.CAP_MSMF, 0]
        max_index = 4
        for backend in backends:
            for idx in range(0, max_index + 1):
                try:
                    cap_try = cv2.VideoCapture(idx, backend) if backend != 0 else cv2.VideoCapture(idx)
                    if cap_try is None:
                        continue
                    # warm-up read
                    opened = cap_try.isOpened()
                    if not opened:
                        cap_try.release()
                        continue
                    ret, _ = cap_try.read()
                    if ret:
                        print(f"Opened camera index={idx} with backend={backend}")
                        return cap_try
                    else:
                        cap_try.release()
                except Exception:
                    continue
        return None

    cap = open_camera()
    if cap is None:
        print("Cannot open camera. Tried multiple indices and backends.")
        print("Possible causes: another app is using the camera, permissions blocked, or no camera device is present.")
        print("On Windows, check Settings → Privacy & security → Camera and allow access for desktop apps.")
        return

    mp_holistic = mp.solutions.holistic
    holistic = mp_holistic.Holistic(min_detection_confidence=0.5,
                                    min_tracking_confidence=0.5)

    buffer = []
    frame_idx = 0
    start_time = time.time()
    last_printed = ""

    # smoothing state
    recent_preds = deque(maxlen=SMOOTHING_WINDOW)
    last_stable = None

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                # Try to recover by reopening camera once
                print("Failed to grab frame from camera. Attempting to reopen...")
                cap.release()
                time.sleep(0.5)
                cap = open_camera()
                if cap is None:
                    print("Reopen failed. Exiting.")
                    break
                else:
                    continue

            frame_idx += 1
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = holistic.process(image_rgb)

            pose_landmarks = results.pose_landmarks.landmark if results.pose_landmarks else []
            face_landmarks = results.face_landmarks.landmark if results.face_landmarks else []
            left_hand = results.left_hand_landmarks.landmark if results.left_hand_landmarks else []
            right_hand = results.right_hand_landmarks.landmark if results.right_hand_landmarks else []

            ld = LandmarkData(timeInSeconds=time.time() - start_time,
                              frameNumber=frame_idx,
                              poseLandmarks=pose_landmarks,
                              faceLandmarks=face_landmarks,
                              leftHandLandmarks=left_hand,
                              rightHandLandmarks=right_hand)

            buffer.append(ld)
            if len(buffer) > BUFFER_SIZE:
                buffer.pop(0)

            prediction = None
            if len(buffer) >= BUFFER_SIZE:
                try:
                    # compute simple motion energy from hand landmarks
                    def compute_motion(buf):
                        # use wrist (hand landmark 0) movement if available
                        pts = []
                        for d in buf:
                            # prefer right hand, fallback to left hand
                            if getattr(d, 'rightHandLandmarks', None):
                                hand = d.rightHandLandmarks
                            elif getattr(d, 'leftHandLandmarks', None):
                                hand = d.leftHandLandmarks
                            else:
                                hand = []
                            if hand:
                                w = hand[0]
                                pts.append((w.x, w.y))
                        if len(pts) < 2:
                            return 0.0
                        import math
                        diffs = []
                        for i in range(1, len(pts)):
                            dx = pts[i][0] - pts[i-1][0]
                            dy = pts[i][1] - pts[i-1][1]
                            diffs.append(math.hypot(dx, dy))
                        return sum(diffs) / len(diffs)

                    motion = compute_motion(buffer)
                    prediction = None
                    if motion >= MOVE_THRESHOLD:
                        # Replicate the internal flow of webapp/module/islr/model.py here
                        # so camera-side behavior matches the server/model predict stability.
                        try:
                            # Build per-frame landmark DataFrames using the same helper
                            processed_landmarks = [recognizer.create_frame_landmark_df(d) for d in buffer]
                            all_landmarks = pd.concat(processed_landmarks, ignore_index=True).sort_values(
                                by=["frame", "type", "landmark_index"]
                            ).reset_index(drop=True)

                            data_columns = ["x", "y", "z"]
                            frames_count = len(all_landmarks["frame"].unique())
                            xyz_np = all_landmarks[data_columns].to_numpy().reshape(
                                frames_count, 543, len(data_columns)
                            ).astype(np.float32)

                            # Run the TFLite signature runner exactly as model.py
                            prediction_raw = recognizer.model(inputs=xyz_np)
                            outputs = prediction_raw.get('outputs')
                            try:
                                probs = outputs.squeeze()
                            except Exception:
                                probs = outputs

                            sign_index = int(probs.argmax())
                            max_prob = float(probs.max())
                            sign_name = recognizer.ORD2SIGN.get(sign_index, "Unknown Sign")

                            # Minimal post-processing: mirror model label mapping and confidence
                            if sign_name in {"", "jeans"}:
                                sign_name = "No Movement Detected"

                            prediction = {
                                "status": 200,
                                "sign": sign_name,
                                "confidence": max_prob,
                            }
                        except Exception as e:
                            print("Prediction error (model flow):", e)
                            prediction = None
                    else:
                        # idle: clear smoothing buffer so no stale predictions stay
                        recent_preds.clear()
                        last_stable = None
                        prediction = None
                except Exception as e:
                    print("Prediction error:", e)

            # Prepare overlay text and smoothing: only show a sign when it's stable
            sign_text = "Listening..."
            if prediction:
                pred_sign = prediction.get('sign', None)
                conf = prediction.get('confidence', 0.0)
                # only consider predictions above the probability threshold
                if conf >= PROB_THRESHOLD:
                    # push into smoothing window
                    recent_preds.append(pred_sign)

                    # find the most common sign in the window
                    if recent_preds:
                        counts = {}
                        for s in recent_preds:
                            counts[s] = counts.get(s, 0) + 1
                        most_common_sign = max(counts.items(), key=lambda x: x[1])[0]
                        most_common_count = counts[most_common_sign]

                        # require stability and ignore movement-detected/unknown labels
                        ignore_set = {None, '', 'No Movement Detected', 'Unknown Sign', 'jeans'}
                        if most_common_count >= STABILITY_COUNT and most_common_sign not in ignore_set:
                            # stable detection
                            if most_common_sign != last_stable:
                                print(f"Predicted (stable): {most_common_sign} (conf={conf:.2f}, motion={motion:.4f})")
                                last_stable = most_common_sign
                            sign_text = last_stable
                        else:
                            sign_text = "Listening..."
                    else:
                        sign_text = "Listening..."
                else:
                    # model not confident enough
                    sign_text = "Listening..."

            cv2.putText(frame, f"Sign: {sign_text}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)
            # no sentence text overlay (sentence-building removed)

            cv2.imshow('ISLR - Press q to quit', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    finally:
        holistic.close()
        cap.release()
        cv2.destroyAllWindows()


if __name__ == '__main__':
    main()
