import os
import numpy as np
import pickle


class NumberRecognizer:
    """Wrapper to load the number model (pickled scikit-learn model) and run
    inference on preprocessed landmarks.

    Usage:
      recognizer = NumberRecognizer(model_path)
      preprocessed = recognizer.preprocess_landmarks(hand_landmarks, image_shape, handedness)
      out = recognizer.predict(preprocessed)
    """

    def __init__(self, model_path="model/numbers/fingerspelling/number_model.p"):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Number model file not found: {model_path}")

        self.model_path = model_path
        self.model = None
        self.load_model()

    def load_model(self):
        """Load the pickled scikit-learn model."""
        try:
            with open(self.model_path, "rb") as f:
                model_dict = pickle.load(f)
                self.model = model_dict.get("model")
            
            if self.model is None:
                raise RuntimeError("Loaded pickle doesn't contain 'model' key")
            
            print(f"NumberRecognizer: Model loaded successfully from {self.model_path}")
        except Exception as e:
            print(f"NumberRecognizer: ERROR loading model: {str(e)}")
            raise

    def predict(self, preprocessed_landmark_list):
        """Run inference on a preprocessed landmark vector.

        Args:
          preprocessed_landmark_list: 1D list or numpy array of floats (normalized),
            shape should match the model input (42 features: 21 landmarks × 2 coords).

        Returns:
          dict: {label (str), confidence (float), raw_prediction}
        """
        try:
            arr = np.asarray(preprocessed_landmark_list)
            if arr.ndim == 1:
                arr = arr.reshape(1, -1)
            
            pred = self.model.predict(arr)
            label = str(pred[0])
            
            # Try to get prediction probability if available
            confidence = 1.0
            if hasattr(self.model, "predict_proba"):
                try:
                    proba = self.model.predict_proba(arr)
                    confidence = float(np.max(proba))
                except Exception:
                    pass
            
            return {
                "label": label,
                "confidence": confidence,
                "raw_prediction": pred[0]
            }
        except Exception as e:
            print(f"NumberRecognizer: Error during prediction: {str(e)}")
            return {
                "label": None,
                "confidence": 0.0,
                "raw_prediction": None
            }

    @staticmethod
    def preprocess_landmarks(hand_landmarks, image_shape, handedness=None):
        """Convert MediaPipe hand landmarks to the feature vector expected by the number model.
        
        This matches the preprocessing used in run_number_model.py:
        - Extract x, y values from landmarks
        - Flip x values for left hand
        - Normalize by subtracting min x and min y
        
        Args:
          hand_landmarks: MediaPipe hand landmarks object
          image_shape: (height, width) tuple of the image
          handedness: 'Left' or 'Right' (optional, for flipping)
        
        Returns:
          list of floats (42 features: 21 landmarks × 2 coords)
        """
        h, w = image_shape[0], image_shape[1]
        
        # Extract normalized x, y values (0-1 range)
        x_values = [lm.x for lm in hand_landmarks.landmark]
        y_values = [lm.y for lm in hand_landmarks.landmark]
        
        # Flip for left hand to match training convention
        if handedness == 'Left':
            x_values = [1.0 - xx for xx in x_values]
        
        # Normalize by subtracting min values (relative to bounding box)
        min_x = min(x_values)
        min_y = min(y_values)
        
        data_aux = []
        for i in range(len(hand_landmarks.landmark)):
            data_aux.append(x_values[i] - min_x)
            data_aux.append(y_values[i] - min_y)
        
        return data_aux
