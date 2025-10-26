import os
import numpy as np

try:
    # Prefer the lightweight tflite-runtime if available
    from tflite_runtime.interpreter import Interpreter
    TFLITE_RUNTIME = True
except Exception:
    # Fallback to TensorFlow's lite interpreter
    import tensorflow as tf
    Interpreter = tf.lite.Interpreter
    TFLITE_RUNTIME = False


class ASLKeypointRecognizer:
    """Small wrapper to load the keypoint classifier TFLite model and run
    inference on preprocessed landmarks.

    Usage:
      recognizer = ASLKeypointRecognizer(model_path, labels_path)
      pre = recognizer.preprocess_landmarks(landmark_points)  # flattened normalized list
      out = recognizer.predict(pre)

    The recognizer will try to load a TFLite interpreter. If you prefer the
    Keras model (`.keras`) you can load it directly in your code and adapt the
    input shape to match (this wrapper focuses on the TFLite flow used by the
    project).
    """

    def __init__(
        self,
        model_path="model/keypoint_classifier/keypoint_classifier.tflite",
        labels_path="model/keypoint_classifier/keypoint_classifier_label.csv",
        num_threads=1,
    ):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")

        self.model_path = model_path
        self.labels = self._load_labels(labels_path)

        # Create interpreter
        self.interpreter = Interpreter(model_path=model_path, num_threads=num_threads)
        self.interpreter.allocate_tensors()
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()

    def _load_labels(self, labels_path):
        if labels_path and os.path.exists(labels_path):
            with open(labels_path, "r", encoding="utf-8-sig") as f:
                return [line.strip() for line in f if line.strip()]
        return None

    def predict(self, preprocessed_landmark_list):
        """Run inference on a single preprocessed landmark vector.

        Args:
          preprocessed_landmark_list: 1D list or numpy array of floats (normalized),
            shape should match the model input (this project's model expects 1 x N).

        Returns:
          dict: {index, label (or None), confidence (float), probs (list)}
        """
        arr = np.array([preprocessed_landmark_list], dtype=np.float32)

        input_index = self.input_details[0]["index"]
        self.interpreter.set_tensor(input_index, arr)
        self.interpreter.invoke()

        output_index = self.output_details[0]["index"]
        result = self.interpreter.get_tensor(output_index)

        probs = self._softmax(np.squeeze(result))
        idx = int(np.argmax(probs))
        label = self.labels[idx] if self.labels is not None and idx < len(self.labels) else None

        return {"index": idx, "label": label, "confidence": float(probs[idx]), "probs": probs.tolist()}

    @staticmethod
    def _softmax(x):
        e_x = np.exp(x - np.max(x))
        return e_x / e_x.sum(axis=-1)

    @staticmethod
    def preprocess_landmarks(landmark_point):
        """Convert a list of (x,y) landmark points to the flattened, normalized
        1D list expected by the model. This mirrors the preprocessing used in
        the original project (`app.py`).

        Args:
          landmark_point: list of [x, y] pairs (pixel coordinates) or tuples.

        Returns:
          list of floats (normalized, shape N)
        """
        temp_landmark_list = [list(p) for p in landmark_point]

        # Convert to relative coordinates (use first point as base)
        base_x, base_y = 0, 0
        for index, landmark in enumerate(temp_landmark_list):
            if index == 0:
                base_x, base_y = landmark[0], landmark[1]

            temp_landmark_list[index][0] = temp_landmark_list[index][0] - base_x
            temp_landmark_list[index][1] = temp_landmark_list[index][1] - base_y

        # Flatten
        flat = list(np.array(temp_landmark_list).reshape(-1).tolist())

        # Normalize
        max_value = max(list(map(abs, flat))) if len(flat) > 0 else 1.0
        if max_value == 0:
            max_value = 1.0

        normalized = [v / max_value for v in flat]

        return normalized

    @staticmethod
    def landmarks_from_mediapipe(image, hand_landmarks):
        """Helper to convert MediaPipe hand landmarks to a list of pixel (x,y)
        coordinates. `image` is a numpy array (H,W,3) used to scale normalized
        coordinates to pixels. This mirrors `calc_landmark_list` in `app.py`.
        """
        image_width, image_height = image.shape[1], image.shape[0]
        landmark_point = []

        for _, landmark in enumerate(hand_landmarks.landmark):
            landmark_x = min(int(landmark.x * image_width), image_width - 1)
            landmark_y = min(int(landmark.y * image_height), image_height - 1)
            landmark_point.append([landmark_x, landmark_y])

        return landmark_point


if __name__ == "__main__":
    # Quick demo when run directly (requires model + labels next to this file)
    import cv2 as cv
    import mediapipe as mp

    recognizer = ASLKeypointRecognizer()

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1)

    cap = cv.VideoCapture(0)
    while True:
        ret, img = cap.read()
        if not ret:
            break
        img = cv.flip(img, 1)
        img_rgb = cv.cvtColor(img, cv.COLOR_BGR2RGB)
        results = hands.process(img_rgb)
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                lm = ASLKeypointRecognizer.landmarks_from_mediapipe(img, hand_landmarks)
                pre = ASLKeypointRecognizer.preprocess_landmarks(lm)
                out = recognizer.predict(pre)
                cv.putText(img, f"{out['label']} ({out['confidence']:.2f})", (10,30), cv.FONT_HERSHEY_SIMPLEX, 1.0, (0,255,0),2)
        cv.imshow('ASL demo', img)
        if cv.waitKey(1) & 0xFF == 27:
            break
    cap.release()
    cv.destroyAllWindows()
