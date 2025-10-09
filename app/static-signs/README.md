# Static Signs Recognition Service

This service provides sign language recognition using TensorFlow and MediaPipe.

## Requirements

- Python 3.10
- TensorFlow 2.10.0
- MediaPipe 0.8.9.1
- Flask 2.0.1

## Running with Docker (Recommended)

The easiest way to run this service is using Docker, which ensures the correct Python version and dependencies:

### Using Docker Compose

```bash
# From the app directory
cd app
docker-compose up -d

# View logs
docker-compose logs -f static-signs

# Stop the service
docker-compose down
```

### Using Docker directly

```bash
# Build the image
cd app/static-signs
docker build -t static-signs .

# Run the container
docker run -p 8000:8000 -v $(pwd)/hand_landmarks.h5:/app/hand_landmarks.h5:ro static-signs
```

## Running Locally (Not Recommended)

If you must run locally, ensure you have Python 3.10:

### On Windows

```powershell
# Create virtual environment with Python 3.10
py -3.10 -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python simple_server.py
```

### On Linux/Mac

```bash
# Create virtual environment with Python 3.10
python3.10 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python simple_server.py
```

## API Endpoints

### Health Check
```
GET /health
```

Returns the status of the service and whether the model is loaded.

### Predict
```
POST /predict
Content-Type: application/json

{
  "image": "base64_encoded_image"
}
```

Returns the predicted sign language character with confidence score.

## Docker Environment

The Docker container:
- Uses Python 3.10 slim image
- Installs all required system dependencies for OpenCV
- Exposes port 8000
- Mounts the model file as read-only
- Automatically restarts on failure

## Troubleshooting

### Model not loading
- Ensure `hand_landmarks.h5` exists in the `static-signs` directory
- Check Docker logs: `docker-compose logs static-signs`

### Port already in use
- Change the port mapping in `docker-compose.yaml`: `"8001:8000"` (use port 8001 instead)

### Container won't start
- Check logs: `docker-compose logs static-signs`
- Rebuild the image: `docker-compose build --no-cache static-signs`
