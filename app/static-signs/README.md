# Sign Language Recognition API

This folder contains the backend server for the sign language recognition application.

## Important Files

### Essential Files (DO NOT DELETE)
- **simple_server.py** - The main Flask server that provides the sign recognition API
- **hand_landmarks.h5** - The trained TensorFlow model for sign language recognition
- **requirements.txt** - List of Python dependencies needed for the backend
- **run_app.py** - Script to run both frontend and backend in one command

### How to Run the Application

The easiest way to run the entire application (both frontend and backend) is to use:

```bash
cd api
python run_app.py
```

This will:
1. Start the backend server on port 8000
2. Start the frontend on port 8081
3. Open a browser window automatically
4. Handle shutting down all processes when you press Ctrl+C

### Running the Backend Manually

If you need to run only the backend:

```bash
python simple_server.py
```

The server will run on http://localhost:8000 with these endpoints:
- `/health` - Health check endpoint
- `/predict` - Endpoint that accepts base64-encoded images and returns sign predictions

#
## Troubleshooting

If you encounter issues:

1. Make sure you have installed the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Check that the model file `hand_landmarks.h5` is in the api directory

3. Verify the server is running by accessing http://localhost:8000/health in your browser

4. If the model isn't loading, check the console output for specific error messages

## API Documentation

### Health Check
- **URL**: `/health`
- **Method**: GET
- **Response**: JSON with model status
  ```json
  {
    "status": "healthy",
    "model_loaded": true,
    "message": "Sign recognition server is running"
  }
  ```

### Predict Sign
- **URL**: `/predict`
- **Method**: POST
- **Body**: JSON with base64 encoded image
  ```json
  {
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QB..."
  }
  ```
- **Response**: JSON with prediction results
  ```json
  {
    "success": true,
    "prediction": "A",
    "confidence": 0.97,
    "annotated_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QB..."
  }
  ``` 