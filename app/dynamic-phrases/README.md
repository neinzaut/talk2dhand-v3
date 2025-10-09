# Dynamic Phrases Recognition Service

This service provides dynamic sign language phrase recognition (hello, thanks, iloveyou) using TensorFlow and MediaPipe Holistic.

## Requirements

- Python 3.11
- TensorFlow 2.15.0
- MediaPipe 0.10.9
- Flask 3.0.0
- **action.h5** model file (required, not included in repository)

## Important: Model File

This service requires an `action.h5` model file to function. Place it in the `app/dynamic-phrases/` directory before building the container.

If you're migrating from an old repository, copy the `action.h5` file to this directory:
```bash
cp /path/to/old/repo/action.h5 app/dynamic-phrases/action.h5
```

## Running with Docker (Recommended)

The easiest way to run this service is using Docker, which ensures the correct Python version and dependencies:

### Using Docker Compose

```bash
# From the app directory
cd app
docker-compose up -d

# View logs for dynamic-phrases service
docker-compose logs -f dynamic-phrases

# Stop all services
docker-compose down
```

### Using Docker directly

```bash
# Build the image
cd app/dynamic-phrases
docker build -t dynamic-phrases .

# Run the container
docker run -p 5008:5008 -v $(pwd)/action.h5:/app/action.h5:ro dynamic-phrases
```

## Running Locally (Not Recommended)

If you must run locally, ensure you have Python 3.11:

### On Windows

```powershell
# Create virtual environment with Python 3.11
py -3.11 -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

### On Linux/Mac

```bash
# Create virtual environment with Python 3.11
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

## API Endpoints

### Predict
```
POST /predict
Content-Type: application/json

{
  "image": "base64_encoded_image",
  "clientId": "unique_client_id",
  "language": "english" // or "tagalog"
}
```

Returns the predicted sign with confidence score and annotated frame.

### Forward to Angular (Legacy)
```
POST /forward_to_angular
Content-Type: application/json

{
  "text": "message to forward"
}
```

This endpoint is from the old repository and may not be needed for the new UI integration.

## Docker Environment

The Docker container:
- Uses Python 3.11 slim image
- Installs all required system dependencies for OpenCV and MediaPipe
- Exposes port 5008
- Mounts the model file as read-only
- Automatically restarts on failure

## Integrating with UI

This service is designed to be called by the Next.js UI application. Example integration:

```typescript
// In your Next.js component
const predictPhrase = async (imageData: string) => {
  const response = await fetch('http://localhost:5008/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageData,
      clientId: 'unique-client-id',
      language: 'english'
    })
  });
  
  const result = await response.json();
  return result;
};
```

## Supported Phrases

The model recognizes three dynamic phrases:
- **hello** (kamusta in Tagalog)
- **thanks** (salamat in Tagalog)
- **iloveyou** (mahal kita in Tagalog)

## Troubleshooting

### Model not loading
- Ensure `action.h5` exists in the `dynamic-phrases` directory
- Check Docker logs: `docker-compose logs dynamic-phrases`
- Verify the model file is not corrupted

### Port already in use
- Change the port mapping in `docker-compose.yaml`: `"5009:5008"` (use port 5009 instead)

### Container won't start
- Check logs: `docker-compose logs dynamic-phrases`
- Rebuild the image: `docker-compose build --no-cache dynamic-phrases`

### High CPU usage
- MediaPipe Holistic uses significant CPU for full-body tracking
- Consider using a machine with GPU support for better performance
- Adjust `model_complexity` in app.py if needed (currently set to 0 for performance)

## Converting Model to TensorFlow.js (Optional)

If you want to run the model in the browser, use the conversion script:

```bash
# Inside the container or virtual environment
python convert_model.py
```

This will create a `tfjs_model` directory with the converted model.
