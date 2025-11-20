# Static Signs Recognition Service (Unified Backend)

This service provides unified sign language recognition for both alphabets (A-Z) and numbers (0-9) using improved machine learning models. It combines the alphabet and number models into a single backend service with smart detection logic to automatically determine whether the input is an alphabet or number.

## Features

- **Unified Backend**: Single service for both alphabet and number recognition
- **Smart Detection**: Automatically detects whether input is an alphabet or number
- **Improved Models**: Uses newer, more accurate models from `alphabet/` and `numbers/` directories
- **Confidence-Based Routing**: Uses confidence scores to route to the appropriate model
- **Prevents Misclassification**: Special logic to prevent alphabets from being detected as numbers

## Model Setup

Before running the service, you need to copy the model files to the correct structure:

```bash
# From project root
python app/static-signs/setup_models.py
```

This will create the following structure:
```
app/static-signs/
├── model/
│   ├── alphabet/
│   │   └── keypoint_classifier/
│   │       ├── keypoint_classifier.tflite
│   │       └── keypoint_classifier_label.csv
│   └── numbers/
│       └── fingerspelling/
│           └── number_model.p
```

## Requirements

- Python 3.10
- TensorFlow 2.15.0
- MediaPipe 0.10.9
- Flask 3.0.0
- scikit-learn 1.2.0

## Running with Docker (Recommended)

The easiest way to run this service is using Docker:

### Using Docker Compose

```bash
# From the app directory
cd app
docker-compose up -d static-signs

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
docker run -p 8000:8000 static-signs
```

## Running Locally

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

Returns the status of the service and which models are loaded:

```json
{
  "status": "healthy",
  "model_loaded": true,
  "alphabet_loaded": true,
  "number_loaded": true,
  "message": "Unified sign recognition server is running"
}
```

### Predict

```
POST /predict
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,...",
  "expectedType": "alphabet"  // Optional: "alphabet" or "number"
}
```

**Request Parameters:**
- `image` (string, required): Base64-encoded image (with or without data URI prefix)
- `expectedType` (string, optional): Expected type of sign - `"alphabet"` or `"number"`. When provided, the service prioritizes that model but will fallback to the other model if no match is found.

Returns the predicted sign language character with confidence score and which model was used:

```json
{
  "success": true,
  "prediction": "A",
  "confidence": 0.95,
  "model_used": "alphabet",
  "annotated_image": "data:image/jpeg;base64,...",
  "landmarks": [[x, y, z], ...],
  "all_predictions": {
    "alphabet": {
      "label": "A",
      "confidence": 0.95
    },
    "number": {
      "label": "1",
      "confidence": 0.23
    }
  }
}
```

## Detection Logic

The service uses a priority-based detection system with intelligent fallback:

### When `expectedType` is Provided

**For `expectedType: "alphabet"`:**
1. **Primary**: Tries the alphabet model first
   - Uses prediction if confidence > 0.3 and label is a letter (A-Z)
   - Lower threshold allows for more flexible detection
2. **Fallback**: If alphabet model doesn't produce a valid result, tries the number model
   - Uses number prediction if confidence > 0.5
   - This handles cases where user signs a number instead of expected alphabet
3. **Last Resort**: If both fail but alphabet model has any result, uses it (even with low confidence)

**For `expectedType: "number"`:**
1. **Primary**: Tries the number model first
   - Uses prediction if confidence > 0.3
2. **Fallback**: If number model doesn't produce a valid result, tries the alphabet model
   - Uses alphabet prediction if confidence > 0.5 and label is a letter
   - This handles cases where user signs a letter instead of expected number
3. **Last Resort**: If both fail but number model has any result, uses it (even with low confidence)

### When `expectedType` is Not Provided (Smart Detection)

The service automatically determines which model to use:

1. **Alphabet Priority**: If the alphabet model predicts A-Z with high confidence (>0.75), it uses the alphabet model
2. **Number Comparison**: If the alphabet model predicts 0-9, it compares with the number model:
   - If the number model has significantly higher confidence (>0.15 difference), it uses the number model
   - Otherwise, it prefers the alphabet model (more general)
3. **Confidence Thresholds**: Uses conservative thresholds to avoid false positives
4. **Fallback**: If only one model is available, it uses that model

### Key Features

- **Flexible Detection**: Lower confidence thresholds (0.3) for primary model allow detection even with imperfect hand positions
- **Intelligent Fallback**: If the expected type doesn't match, automatically tries the other model
- **Prevents Misclassification**: Validates that alphabet predictions are actually letters before using them
- **Handles Edge Cases**: Multiple fallback levels ensure a prediction is returned when possible

This logic helps prevent alphabets from being misclassified as numbers while still allowing detection when users sign something different than expected.

## Docker Environment

The Docker container:
- Uses Python 3.10 slim image
- Installs all required system dependencies for OpenCV
- Exposes port 8000
- Automatically loads both models on startup

## Troubleshooting

### Models not loading

- Run the setup script: `python app/static-signs/setup_models.py`
- Ensure model files exist in `app/static-signs/model/`
- Check Docker logs: `docker-compose logs static-signs`

### Port already in use

- Change the port mapping in `docker-compose.yaml`: `"8001:8000"`

### Container won't start

- Check logs: `docker-compose logs static-signs`
- Rebuild the image: `docker-compose build --no-cache static-signs`

### Alphabets detected as numbers

- The detection logic should prevent this, but if it occurs:
  - Check confidence scores in the response
  - Ensure `expectedType` is being passed correctly from the UI
  - Check that both models are loaded correctly (see `/health` endpoint)

### No predictions returned (empty results)

- If you're getting empty predictions:
  - Check that hand is clearly visible in the camera
  - Verify both models are loaded: `GET /health`
  - Lower confidence thresholds may help (currently 0.3 for primary, 0.5 for fallback)
  - Check server logs for error messages

### Model not detecting correctly

- **Alphabet model issues:**
  - Ensure hand is in clear view with good lighting
  - Check that the prediction label is actually a letter (A-Z)
  - Lower confidence threshold (0.3) should catch more cases
  - Fallback to number model will trigger if alphabet fails

- **Number model issues:**
  - Similar to alphabet - ensure clear hand visibility
  - Fallback to alphabet model will trigger if number fails
