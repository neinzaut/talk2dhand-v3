"""
Lightweight runner for `models/fingerspelling/number_model.p`.
- Opens webcam
- Uses MediaPipe Hands to extract 21 hand landmarks
- Builds the same feature vector used by the project's fingerspelling inference
- Calls number_model.predict() and overlays the predicted label

Keys:
- Esc: quit
- s: save current frame to `number_preview.jpg`

Usage (PowerShell):
. .\.venv\Scripts\Activate.ps1
python tools\run_number_model.py

"""
from pathlib import Path
import sys
FILE = Path(__file__).resolve()
# If the script lives at the project root the models folder will be a child of
# the file's parent. If it lives in a `tools` subfolder (older layout) the
# project root is the parent's parent. Choose the correct candidate.
if (FILE.parent / "models").exists():
    ROOT = FILE.parent
else:
    ROOT = FILE.parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import cv2
import numpy as np
import pickle
import os
# Prevent matplotlib (pulled in by mediapipe) from trying to select a GUI backend
# which can hang on some systems during import. Use a non-interactive backend.
os.environ.setdefault('MPLBACKEND', 'Agg')
import mediapipe as mp
import time

MODEL_PATH = Path("models/fingerspelling/number_model.p")
if not MODEL_PATH.is_absolute():
    MODEL_PATH = ROOT / MODEL_PATH

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Number model not found at {MODEL_PATH}")

print("Loading number model from:", MODEL_PATH)
with open(MODEL_PATH, "rb") as f:
    model_dict = pickle.load(f)
    number_model = model_dict.get("model")

if number_model is None:
    raise RuntimeError("Loaded pickle doesn't contain 'model' key")

mp_hands = mp.solutions.hands

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
if not cap.isOpened():
    print('camera not opened')
    raise SystemExit(1)

with mp_hands.Hands(min_detection_confidence=0.6, min_tracking_confidence=0.5, max_num_hands=1) as hands:
    print('Starting number-model preview. Press ESC to quit.')
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        display = frame.copy()
        predicted = None

        if results.multi_hand_landmarks:
            # Use the first detected hand
            hand = results.multi_hand_landmarks[0]
            x_values = [lm.x for lm in hand.landmark]
            y_values = [lm.y for lm in hand.landmark]
            min_x = int(min(x_values) * w)
            max_x = int(max(x_values) * w)
            min_y = int(min(y_values) * h)
            max_y = int(max(y_values) * h)

            # flip for left hand to match training convention (same as original code)
            handedness = None
            if results.multi_handedness:
                handedness = results.multi_handedness[0].classification[0].label
            if handedness == 'Left':
                x_values = [1.0 - xx for xx in x_values]

            data_aux = []
            for i in range(len(hand.landmark)):
                data_aux.append(x_values[i] - min(x_values))
                data_aux.append(y_values[i] - min(y_values))

            # Predict using the number model
            try:
                pred = number_model.predict([np.asarray(data_aux)])
                predicted = str(pred[0])
            except Exception as e:
                predicted = f"err:{e}"

            # Draw bounding box and prediction
            cv2.rectangle(display, (min_x - 20, min_y - 10), (max_x + 20, max_y + 10), (0,255,255), 2)
            if predicted is not None:
                cv2.putText(display, f"Pred: {predicted}", (min_x, min_y - 20), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0,255,0), 2)

            # draw simple landmarks
            for idx, lm in enumerate(hand.landmark):
                cx = min(int(lm.x * w), w-1)
                cy = min(int(lm.y * h), h-1)
                cv2.circle(display, (cx, cy), 3, (255,255,255), -1)

        cv2.imshow('number-preview', display)
        key = cv2.waitKey(1) & 0xFF
        if key == 27:
            break
        if key == ord('s'):
            cv2.imwrite('number_preview.jpg', display)
            print('Saved number_preview.jpg')

cap.release()
cv2.destroyAllWindows()
