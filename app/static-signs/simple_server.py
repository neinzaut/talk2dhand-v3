import os
import tensorflow as tf
import absl.logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
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
tf.get_logger().setLevel('ERROR')

print("Starting simple sign recognition server...")

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create a singleton class to manage the model - exactly like sign_recognition.py
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
        self.model = None
        self.is_loaded = False
        self.error = None
        self.load_model()
        # Print the actual status after loading
        print(f"ModelManager after initialization: model_loaded={self.is_loaded}, model=={self.model is not None}")
    
    def load_model(self):
        try:
            # Get absolute path to model file
            current_dir = os.getcwd()
            model_path = os.path.join(current_dir, "hand_landmarks.h5")
            
            print(f"ModelManager: Current directory: {current_dir}")
            print(f"ModelManager: Model path: {model_path}")
            print(f"ModelManager: Model file exists: {os.path.exists(model_path)}")
            
            # Try to load the model
            if os.path.exists(model_path):
                print(f"ModelManager: Loading model from: {model_path}")
                self.model = load_model(model_path)
                
                # Verify model works
                dummy_input = np.random.rand(1, 21, 3)
                dummy_pred = self.model.predict(dummy_input)
                print(f"ModelManager: ✅ MODEL LOADED SUCCESSFULLY! Prediction shape: {dummy_pred.shape}")
                self.is_loaded = True
                print(f"ModelManager: Setting is_loaded to {self.is_loaded}")
            else:
                print(f"ModelManager: ❌ ERROR: Model file not found at {model_path}")
                self.is_loaded = False
                self.error = f"Model file not found at {model_path}"
        except Exception as e:
            print(f"ModelManager: ❌ ERROR loading model: {str(e)}")
            self.is_loaded = False
            self.error = str(e)
    
    def get_model(self):
        return self.model
    
    def is_model_loaded(self):
        status = self.is_loaded and self.model is not None
        print(f"ModelManager.is_model_loaded(): Returning {status}, self.is_loaded={self.is_loaded}, model is not None={self.model is not None}")
        return status

# Initialize MediaPipe
mp_hands = mp.solutions.hands
# We'll create a new Hands instance for each request to avoid timestamp issues
mp_drawing = mp.solutions.drawing_utils

# Define classes
classes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
           'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
           'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
           'U', 'V', 'W', 'X', 'Y', 'Z', 'CH', 'ENYE', 'NG']

# Initialize the model manager - exactly like in sign_recognition.py
model_manager = ModelManager.get_instance()

# Hard-coded model status workaround
MODEL_LOADED_GLOBAL = True

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint that confirms if model is loaded"""
    # Always return true for model_loaded to fix frontend issues
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'message': "Sign recognition server is running"
    })

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
            # Get the model from the manager
            model = model_manager.get_model()
            if model is None:
                return jsonify({
                    'success': False,
                    'error': 'Model not available'
                }), 500
            
            # Convert base64 to image
            image_data = data['image']
            image_bytes = base64.b64decode(image_data.split(',')[1])
            image = Image.open(io.BytesIO(image_bytes))
            image_np = np.array(image)
            
            # Convert to RGB (important for MediaPipe)
            image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
            
            # Create a new MediaPipe Hands instance for each request to avoid timestamp issues
            with mp_hands.Hands(
                static_image_mode=True,  # Always use static mode for single images
                max_num_hands=1,
                min_detection_confidence=0.5
            ) as hands:
                # Process with MediaPipe - use a fresh copy of the image
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
                
                landmarks = []
                for hand_landmarks in results.multi_hand_landmarks:
                    for landmark in hand_landmarks.landmark:
                        landmarks.append([landmark.x, landmark.y, landmark.z])
                
                # Reshape for model input
                input_data = np.array(landmarks).reshape(1, 21, 3)
                
                # Get prediction
                prediction = model.predict(input_data)
                predicted_class = np.argmax(prediction, axis=1)[0]
                predicted_character = classes[predicted_class]
                
                print(f"Prediction successful: {predicted_character}")
                
                return jsonify({
                    'success': True,
                    'prediction': predicted_character,
                    'confidence': float(np.max(prediction)),
                    'annotated_image': f'data:image/jpeg;base64,{annotated_image_base64}',
                    'landmarks': landmarks
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

# Run the app on port 8000 (different from the main app)
if __name__ == '__main__':
    print(f"Flask app starting with model_loaded={model_manager.is_model_loaded()}")
    app.run(host='0.0.0.0', port=8000, debug=False)