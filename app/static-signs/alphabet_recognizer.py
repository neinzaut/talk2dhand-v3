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


class AlphabetRecognizer:
    """Wrapper to load the keypoint classifier TFLite model and run
    inference on preprocessed landmarks.

    Usage:
      recognizer = AlphabetRecognizer(model_path, labels_path)
      pre = recognizer.preprocess_landmarks(landmark_points)  # flattened normalized list
      out = recognizer.predict(pre)
    """

    def __init__(
        self,
        model_path="model/alphabet/keypoint_classifier/keypoint_classifier.tflite",
        labels_path="model/alphabet/keypoint_classifier/keypoint_classifier_label.csv",
        num_threads=1,
    ):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Alphabet model file not found: {model_path}")

        self.model_path = model_path
        self.labels = self._load_labels(labels_path)

        # Create interpreter
        self.interpreter = Interpreter(model_path=model_path, num_threads=num_threads)
        self.interpreter.allocate_tensors()
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()
        
        print(f"AlphabetRecognizer: Model loaded successfully from {model_path}")

    def _load_labels(self, labels_path):
        if labels_path and os.path.exists(labels_path):
            with open(labels_path, "r", encoding="utf-8-sig") as f:
                labels = [line.strip() for line in f if line.strip()]
                print(f"AlphabetRecognizer: Loaded {len(labels)} labels")
                return labels
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
