import os
import absl.logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import cv2
import mediapipe as mp
import numpy as np
import threading

# Disable TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
absl.logging.set_verbosity(absl.logging.ERROR)

# Import our recognizers
from alphabet_recognizer import AlphabetRecognizer
from number_recognizer import NumberRecognizer

print("Starting unified sign recognition server (alphabet + numbers)...")

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create a singleton class to manage both models
class ModelManager:
    _instance = None
    _lock = threading.Lock()
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        self.alphabet_recognizer = None
        self.number_recognizer = None
        self.alphabet_loaded = False
        self.number_loaded = False
        self.error = None
        self.load_models()
    
    def load_models(self):
        """Load both alphabet and number models."""
        try:
            # Get absolute paths
            current_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Alphabet model paths
            alphabet_model_path = os.path.join(current_dir, "model", "alphabet", "keypoint_classifier", "keypoint_classifier.tflite")
            alphabet_labels_path = os.path.join(current_dir, "model", "alphabet", "keypoint_classifier", "keypoint_classifier_label.csv")
            
            # Number model path
            number_model_path = os.path.join(current_dir, "model", "numbers", "fingerspelling", "number_model.p")
            
            print(f"ModelManager: Current directory: {current_dir}")
            print(f"ModelManager: Alphabet model path: {alphabet_model_path}")
            print(f"ModelManager: Number model path: {number_model_path}")
            
            # Load alphabet model
            if os.path.exists(alphabet_model_path):
                print(f"ModelManager: Loading alphabet model...")
                self.alphabet_recognizer = AlphabetRecognizer(
                    model_path=alphabet_model_path,
                    labels_path=alphabet_labels_path
                )
                self.alphabet_loaded = True
                print(f"ModelManager: Alphabet model loaded successfully!")
            else:
                print(f"ModelManager: WARNING: Alphabet model not found at {alphabet_model_path}")
            
            # Load number model
            if os.path.exists(number_model_path):
                print(f"ModelManager: Loading number model...")
                self.number_recognizer = NumberRecognizer(model_path=number_model_path)
                self.number_loaded = True
                print(f"ModelManager: Number model loaded successfully!")
            else:
                print(f"ModelManager: WARNING: Number model not found at {number_model_path}")
            
            if not self.alphabet_loaded and not self.number_loaded:
                self.error = "No models loaded. Check model file paths."
                print(f"ModelManager: ERROR: {self.error}")
            elif not self.alphabet_loaded:
                self.error = "Alphabet model not loaded"
                print(f"ModelManager: WARNING: {self.error}")
            elif not self.number_loaded:
                self.error = "Number model not loaded"
                print(f"ModelManager: WARNING: {self.error}")
                
        except Exception as e:
            print(f"ModelManager: ERROR loading models: {str(e)}")
            import traceback
            traceback.print_exc()
            self.error = str(e)
    
    def is_model_loaded(self):
        """Check if at least one model is loaded."""
        return (self.alphabet_loaded or self.number_loaded) and (self.alphabet_recognizer is not None or self.number_recognizer is not None)

# Initialize MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Initialize the model manager
model_manager = ModelManager.get_instance()

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint that confirms if models are loaded"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_manager.is_model_loaded(),
        'alphabet_loaded': model_manager.alphabet_loaded,
        'number_loaded': model_manager.number_loaded,
        'message': "Unified sign recognition server is running"
    })

def detect_alphabet_or_number(image_rgb, hand_landmarks, handedness=None, expected_type=None):
    """
    Detect alphabet or number based on expected type or smart detection.
    
    Args:
        expected_type: 'alphabet' or 'number' - if provided, uses that model directly
                      None - uses smart detection to determine which model to use
    
    Strategy when expected_type is None:
    1. Try both models and get predictions
    2. If alphabet predicts A-Z with high confidence (>0.75), use alphabet model
    3. If alphabet predicts 0-9, compare with number model
    4. Use confidence thresholds to avoid false positives
    
    Returns:
        dict with keys: prediction, confidence, model_used, all_predictions
    """
    results = {
        'prediction': None,
        'confidence': 0.0,
        'model_used': None,
        'all_predictions': {}
    }
    
    # If expected_type is provided, prioritize that model but fallback to the other if needed
    if expected_type == 'alphabet':
        alphabet_result = None
        number_result = None
        
        # Try alphabet model first
        if model_manager.alphabet_loaded and model_manager.alphabet_recognizer:
            try:
                landmark_points = AlphabetRecognizer.landmarks_from_mediapipe(image_rgb, hand_landmarks)
                preprocessed = AlphabetRecognizer.preprocess_landmarks(landmark_points)
                alphabet_result = model_manager.alphabet_recognizer.predict(preprocessed)
                
                print(f"[Alphabet Detection] Label: {alphabet_result.get('label')}, Confidence: {alphabet_result.get('confidence', 0):.3f}")
                
                if alphabet_result['label']:
                    results['all_predictions']['alphabet'] = {
                        'label': alphabet_result['label'],
                        'confidence': alphabet_result['confidence']
                    }
                    
                    # Use alphabet if confidence is reasonable (lowered threshold)
                    if alphabet_result['confidence'] > 0.3:
                        # Prefer alphabet predictions that are actually letters
                        if alphabet_result['label'].isalpha():
                            print(f"[Alphabet Detection] Using alphabet model: {alphabet_result['label']} (conf: {alphabet_result['confidence']:.3f})")
                            results['prediction'] = alphabet_result['label']
                            results['confidence'] = alphabet_result['confidence']
                            results['model_used'] = 'alphabet'
                            return results
                        else:
                            print(f"[Alphabet Detection] Label '{alphabet_result['label']}' is not a letter, skipping")
                    else:
                        print(f"[Alphabet Detection] Confidence {alphabet_result['confidence']:.3f} below threshold 0.3")
                else:
                    print(f"[Alphabet Detection] No label returned from model")
            except Exception as e:
                print(f"Error in alphabet prediction: {str(e)}")
                import traceback
                traceback.print_exc()
        
        # Fallback: try number model if alphabet didn't work
        if not results['prediction'] and model_manager.number_loaded and model_manager.number_recognizer:
            try:
                print(f"[Alphabet Detection] Trying number model as fallback...")
                image_shape = image_rgb.shape
                preprocessed = NumberRecognizer.preprocess_landmarks(hand_landmarks, image_shape, handedness)
                number_result = model_manager.number_recognizer.predict(preprocessed)
                
                if number_result['label']:
                    results['all_predictions']['number'] = {
                        'label': number_result['label'],
                        'confidence': number_result['confidence']
                    }
                    
                    # Use number if confidence is good
                    if number_result['confidence'] > 0.5:
                        print(f"[Alphabet Detection] Using number model (fallback): {number_result['label']} (conf: {number_result['confidence']:.3f})")
                        results['prediction'] = number_result['label']
                        results['confidence'] = number_result['confidence']
                        results['model_used'] = 'number'
                        return results
            except Exception as e:
                print(f"Error in number prediction (fallback): {str(e)}")
                import traceback
                traceback.print_exc()
        
        # If we still have an alphabet result (even with low confidence), use it as last resort
        if not results['prediction'] and alphabet_result and alphabet_result['label']:
            print(f"[Alphabet Detection] Using alphabet model (last resort): {alphabet_result['label']} (conf: {alphabet_result['confidence']:.3f})")
            results['prediction'] = alphabet_result['label']
            results['confidence'] = alphabet_result['confidence']
            results['model_used'] = 'alphabet'
            return results
        
        if not results['prediction']:
            print(f"[Alphabet Detection] No valid prediction found after all attempts")
        
        return results
    
    if expected_type == 'number':
        alphabet_result = None
        number_result = None
        
        # Try number model first
        if model_manager.number_loaded and model_manager.number_recognizer:
            try:
                image_shape = image_rgb.shape
                preprocessed = NumberRecognizer.preprocess_landmarks(hand_landmarks, image_shape, handedness)
                number_result = model_manager.number_recognizer.predict(preprocessed)
                
                if number_result['label']:
                    results['all_predictions']['number'] = {
                        'label': number_result['label'],
                        'confidence': number_result['confidence']
                    }
                    
                    # Use number if confidence is reasonable
                    if number_result['confidence'] > 0.3:
                        results['prediction'] = number_result['label']
                        results['confidence'] = number_result['confidence']
                        results['model_used'] = 'number'
                        return results
            except Exception as e:
                print(f"Error in number prediction: {str(e)}")
        
        # Fallback: try alphabet model if number didn't work
        if not results['prediction'] and model_manager.alphabet_loaded and model_manager.alphabet_recognizer:
            try:
                landmark_points = AlphabetRecognizer.landmarks_from_mediapipe(image_rgb, hand_landmarks)
                preprocessed = AlphabetRecognizer.preprocess_landmarks(landmark_points)
                alphabet_result = model_manager.alphabet_recognizer.predict(preprocessed)
                
                if alphabet_result['label']:
                    results['all_predictions']['alphabet'] = {
                        'label': alphabet_result['label'],
                        'confidence': alphabet_result['confidence']
                    }
                    
                    # Use alphabet if confidence is good and it's actually a letter
                    if alphabet_result['confidence'] > 0.5 and alphabet_result['label'].isalpha():
                        results['prediction'] = alphabet_result['label']
                        results['confidence'] = alphabet_result['confidence']
                        results['model_used'] = 'alphabet'
                        return results
            except Exception as e:
                print(f"Error in alphabet prediction (fallback): {str(e)}")
        
        # If we still have a number result (even with low confidence), use it as last resort
        if not results['prediction'] and number_result and number_result['label']:
            results['prediction'] = number_result['label']
            results['confidence'] = number_result['confidence']
            results['model_used'] = 'number'
            return results
        
        return results
    
    # Smart detection (expected_type is None)
    alphabet_result = None
    number_result = None
    
    # Try alphabet model if available
    if model_manager.alphabet_loaded and model_manager.alphabet_recognizer:
        try:
            # Convert MediaPipe landmarks to pixel coordinates
            landmark_points = AlphabetRecognizer.landmarks_from_mediapipe(image_rgb, hand_landmarks)
            # Preprocess for alphabet model
            preprocessed = AlphabetRecognizer.preprocess_landmarks(landmark_points)
            # Predict
            alphabet_result = model_manager.alphabet_recognizer.predict(preprocessed)
            
            if alphabet_result['label']:
                results['all_predictions']['alphabet'] = {
                    'label': alphabet_result['label'],
                    'confidence': alphabet_result['confidence']
                }
        except Exception as e:
            print(f"Error in alphabet prediction: {str(e)}")
    
    # Try number model if available
    if model_manager.number_loaded and model_manager.number_recognizer:
        try:
            # Preprocess for number model
            image_shape = image_rgb.shape
            preprocessed = NumberRecognizer.preprocess_landmarks(hand_landmarks, image_shape, handedness)
            # Predict
            number_result = model_manager.number_recognizer.predict(preprocessed)
            
            if number_result['label']:
                results['all_predictions']['number'] = {
                    'label': number_result['label'],
                    'confidence': number_result['confidence']
                }
        except Exception as e:
            print(f"Error in number prediction: {str(e)}")
    
    # Decision logic with improved detection
    if alphabet_result and alphabet_result['label']:
        alphabet_label = alphabet_result['label']
        alphabet_conf = alphabet_result['confidence']
        
        # If alphabet predicts A-Z with high confidence, use it
        if alphabet_label.isalpha() and alphabet_conf > 0.75:
            results['prediction'] = alphabet_label
            results['confidence'] = alphabet_conf
            results['model_used'] = 'alphabet'
            return results
        
        # If alphabet predicts 0-9, compare with number model
        if alphabet_label.isdigit():
            if number_result and number_result['label']:
                number_conf = number_result['confidence']
                number_label = number_result['label']
                
                # If number model has significantly higher confidence, use it
                # This helps avoid alphabets being misclassified as numbers
                if number_conf > alphabet_conf + 0.15 and number_conf > 0.6:
                    results['prediction'] = number_label
                    results['confidence'] = number_conf
                    results['model_used'] = 'number'
                else:
                    # Prefer alphabet model for numbers (it's more general)
                    # But only if confidence is reasonable
                    if alphabet_conf > 0.6:
                        results['prediction'] = alphabet_label
                        results['confidence'] = alphabet_conf
                        results['model_used'] = 'alphabet'
                    elif number_conf > 0.6:
                        results['prediction'] = number_label
                        results['confidence'] = number_conf
                        results['model_used'] = 'number'
            else:
                # No number model, use alphabet if confidence is good
                if alphabet_conf > 0.6:
                    results['prediction'] = alphabet_label
                    results['confidence'] = alphabet_conf
                    results['model_used'] = 'alphabet'
            return results
    
    # If alphabet didn't give a good result, try number model
    if number_result and number_result['label']:
        number_conf = number_result['confidence']
        number_label = number_result['label']
        
        # Use number model if confidence is reasonable
        # But be more conservative to avoid false positives
        if number_conf > 0.65:
            results['prediction'] = number_label
            results['confidence'] = number_conf
            results['model_used'] = 'number'
            return results
    
    # Fallback: use alphabet if available (even with lower confidence)
    if alphabet_result and alphabet_result['label']:
        alphabet_conf = alphabet_result['confidence']
        # Only use if confidence is at least moderate
        if alphabet_conf > 0.5:
            results['prediction'] = alphabet_result['label']
            results['confidence'] = alphabet_conf
            results['model_used'] = 'alphabet'
            return results
    
    # No valid prediction
    return results

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint to predict signs from base64 image"""
    try:
        data = request.get_json()
        print("Received prediction request")
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'No image data provided'
            }), 400
        
        # Process the image
        try:
            # Check if models are loaded
            if not model_manager.is_model_loaded():
                return jsonify({
                    'success': False,
                    'error': 'Models not available'
                }), 500
            
            # Convert base64 to image
            image_data = data.get('image', '')
            if not image_data or len(image_data) < 10:
                return jsonify({'success': False, 'error': 'Image data is empty or invalid'}), 400
            
            if ',' in image_data:
                image_data = image_data.split(',', 1)[1]
            
            try:
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
                image_np = np.array(image)
            except Exception as e:
                print(f'Error decoding image: {e}')
                import traceback
                traceback.print_exc()
                return jsonify({'success': False, 'error': f'Image decode error: {str(e)}'}), 400
            
            # Convert to RGB (important for MediaPipe)
            image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
            
            # Create a new MediaPipe Hands instance for each request
            with mp_hands.Hands(
                static_image_mode=True,
                max_num_hands=1,
                min_detection_confidence=0.5
            ) as hands:
                # Process with MediaPipe
                results = hands.process(image_rgb.copy())
            
            if results.multi_hand_landmarks:
                # Create a copy of the image for drawing
                annotated_image = image_rgb.copy()
                
                # Draw hand landmarks
                for hand_landmarks in results.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(
                        annotated_image,
                        hand_landmarks,
                        mp_hands.HAND_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                        mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
                    )
                
                # Convert annotated image to base64
                _, buffer = cv2.imencode('.jpg', cv2.cvtColor(annotated_image, cv2.COLOR_RGB2BGR))
                annotated_image_base64 = base64.b64encode(buffer).decode('utf-8')
                
                # Get handedness if available
                handedness = None
                if results.multi_handedness:
                    handedness = results.multi_handedness[0].classification[0].label
                
                # Use the first detected hand
                hand_landmarks = results.multi_hand_landmarks[0]
                
                # Get expected type from request (optional)
                expected_type = data.get('expectedType', None)
                if expected_type:
                    expected_type = expected_type.lower()
                    if expected_type not in ['alphabet', 'number']:
                        expected_type = None
                
                # Detect alphabet or number
                detection_result = detect_alphabet_or_number(image_rgb, hand_landmarks, handedness, expected_type)
                
                if detection_result['prediction']:
                    predicted_character = detection_result['prediction']
                    confidence = detection_result['confidence']
                    model_used = detection_result['model_used']
                    
                    print(f"Prediction successful: {predicted_character} (confidence: {confidence:.3f}, model: {model_used})")
                    
                    # Extract landmarks for response
                    landmarks = []
                    for landmark in hand_landmarks.landmark:
                        landmarks.append([landmark.x, landmark.y, landmark.z])
                    
                    return jsonify({
                        'success': True,
                        'prediction': predicted_character,
                        'confidence': confidence,
                        'model_used': model_used,
                        'annotated_image': f'data:image/jpeg;base64,{annotated_image_base64}',
                        'landmarks': landmarks,
                        'all_predictions': detection_result.get('all_predictions', {})
                    })
                else:
                    print("No valid prediction from models")
                    return jsonify({
                        'success': False,
                        'error': 'No valid prediction'
                    })
            else:
                print("No hand detected in image")
                return jsonify({
                    'success': False,
                    'error': 'No hand detected'
                })
                
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({
                'success': False,
                'error': f'Error processing image: {str(e)}'
            })
            
    except Exception as e:
        print(f"Error in predict endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Run the app on port 8000
if __name__ == '__main__':
    print(f"Flask app starting with models_loaded={model_manager.is_model_loaded()}")
    app.run(host='0.0.0.0', port=8000, debug=False)
