# AI Converse Translate Service

AI-powered sign language recognition and conversation service for Talk2DHand v3. This service provides real-time sign language recognition using the ISLR (Isolated Sign Language Recognition) model and AI-powered conversational responses in ASL gloss format using Google Gemini.

## Features

- **Sign Recognition**: Real-time recognition of sign language from video frames
- **AI Conversation**: Gemini-powered responses in ASL gloss format
- **Dual Language Support**: ASL and FSL (Filipino Sign Language) label translation
- **REST API**: Simple, contract-based HTTP API following `AI_CONVERSE_TRANSLATE_RULES.md`
- **Offline-Ready**: Sign recognition works offline; AI responses require internet

## Architecture

This service follows a microservice architecture pattern:

- **Backend**: FastAPI (Python 3.11)
- **Model**: TensorFlow Lite ISLR model (shared from `dynamic-phrases`)
- **AI**: Google Gemini 2.0 Flash
- **Pose Detection**: MediaPipe Holistic (pose, face, hands)
- **Container**: Docker with shared model volume mount

## API Endpoints

### `POST /infer`

Unified inference endpoint handling both sign recognition and AI conversation.

#### Request Format

```json
{
  "input_type": "sign-frame" | "text",
  "payload": "<base64 image or text>",
  "language": "asl" | "fsl"  // optional, defaults to "asl"
}
```

#### Response Format

```json
{
  "output_type": "asl" | "fsl" | "gloss",
  "result": "<recognized sign or AI response>",
  "confidence": 0.0
}
```

#### Examples

**Sign Recognition**
```bash
curl -X POST http://localhost:8100/infer \
  -H "Content-Type: application/json" \
  -d '{
    "input_type": "sign-frame",
    "payload": "data:image/jpeg;base64,/9j/4AAQ...",
    "language": "asl"
  }'
```

Response:
```json
{
  "output_type": "asl",
  "result": "hello",
  "confidence": 0.85
}
```

**AI Conversation**
```bash
curl -X POST http://localhost:8100/infer \
  -H "Content-Type: application/json" \
  -d '{
    "input_type": "text",
    "payload": "hello"
  }'
```

Response:
```json
{
  "output_type": "gloss",
  "result": "HELLO YOU HOW?",
  "confidence": 1.0
}
```

### `GET /health`

Health check endpoint.

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "mediapipe_ready": true,
  "model_path": "/app/shared-models/islr"
}
```

## Setup

### Environment Variables

Create a `.env` file in the service directory:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### Docker Deployment

The service is configured in `docker-compose.yaml`:

```yaml
ai-converse-translate-service:
  build: ./ai-converse-translate
  container_name: ai-converse-translate-service
  ports:
    - "8100:8100"
  volumes:
    - ./dynamic-phrases/module/islr:/app/shared-models/islr:ro
  environment:
    - TF_CPP_MIN_LOG_LEVEL=2
    - PYTHONUNBUFFERED=1
  networks:
    - talk2dhand-network
```

### Running the Service

**Production:**
```bash
cd app
docker-compose up ai-converse-translate-service
```

**Development (with hot-reload):**
```bash
cd app
docker-compose -f docker-compose.dev.yaml up ai-converse-translate-service
```

**Standalone (without Docker):**
```bash
cd app/ai-converse-translate
pip install -r requirements.txt
python app.py
```

## Recognition Parameters

The service uses these tunable parameters for sign recognition:

| Parameter | Value | Description |
|-----------|-------|-------------|
| `BUFFER_SIZE` | 18 | Number of frames required for prediction |
| `SMOOTHING_WINDOW` | 5 | Number of recent predictions to smooth |
| `STABILITY_COUNT` | 3 | Consecutive predictions needed for stability |
| `PROB_THRESHOLD` | 0.7 | Minimum confidence for valid prediction |
| `MOVE_THRESHOLD` | 0.06 | Minimum hand motion to trigger prediction |

## ASL/FSL Language Support

The service supports both ASL and FSL, but **uses the same model**. FSL support is implemented as label translation:

```python
FILIPINO_LABELS = {
    "hello": "Kumusta",
    "thankyou": "Salamat",
    "thanks": "Salamat",
    "you": "Ikaw",
    # ... more mappings
}
```

When `language: "fsl"` is specified, recognized English signs are mapped to Filipino labels for display purposes.

## Gemini AI Integration

The service uses Google Gemini 2.0 Flash for AI responses. The system instruction ensures responses follow strict ASL gloss grammar:

- **Topic-Comment Order**: Start with topic, then comment
- **WH-Words at End**: Questions place WH-words last
- **No "To Be" Verbs**: Removed (is, am, are, etc.)
- **No Articles**: Removed (a, an, the)
- **ALL CAPS**: Gloss format convention
- **Bilingual**: Handles both English and Tagalog input

Example conversation:
```
User signs: "hello"
AI responds: "HELLO YOU HOW?"

User signs: "thankyou"
AI responds: "WELCOME YOU GOOD"
```

## Frontend Integration

The frontend **must** access this service through the Next.js API route handler at `/app/api/ai-converse-translate/route.ts`. Direct calls to the container are prohibited per `AI_CONVERSE_TRANSLATE_RULES.md`.

**Correct:**
```typescript
const response = await fetch("/api/ai-converse-translate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    input_type: "sign-frame",
    payload: imageData
  })
})
```

**Incorrect (blocked by rules):**
```typescript
// ❌ DO NOT DO THIS
const response = await fetch("http://localhost:8100/infer", ...)
```

## Error Handling

The service returns appropriate HTTP status codes:

- `200 OK`: Successful inference
- `400 Bad Request`: Invalid input_type or missing payload
- `500 Internal Server Error`: Model error, API error, or processing failure
- `503 Service Unavailable`: Service not ready (model not loaded)

## Logging

The service logs key events:

```
INFO: Initializing AI Converse Translate Service...
INFO: ISLR model loaded from: /app/shared-models/islr
INFO: MediaPipe Holistic initialized
INFO: Available signs (250): hello, thankyou, you, where...
INFO: Stable prediction: hello (conf=0.85)
INFO: User: hello -> Gemini: HELLO YOU HOW?
```

## Dependencies

Core dependencies (see `requirements.txt`):

- `fastapi==0.104.1` - Web framework
- `uvicorn==0.24.0` - ASGI server
- `tensorflow==2.15.0` - Model inference
- `mediapipe==0.10.9` - Pose/hand detection
- `opencv-python==4.8.1.78` - Image processing
- `google-generativeai==0.3.2` - Gemini AI
- `python-dotenv==1.0.0` - Environment variables

## Performance

- **Sign Recognition**: ~500ms per frame (includes model inference)
- **AI Response**: ~1-2s (depends on Gemini API latency)
- **Memory**: ~1.5GB (TensorFlow + MediaPipe models)
- **CPU**: Optimized for CPU inference (no GPU required)

## Troubleshooting

**Model not found:**
```
ERROR: Failed to initialize service: No such file or directory: '/app/shared-models/islr/model.tflite'
```
Solution: Ensure the volume mount is correct and model files exist in `dynamic-phrases/module/islr/`

**Gemini API error:**
```
ERROR: Gemini API error: GOOGLE_API_KEY not found in environment
```
Solution: Add your API key to the `.env` file

**Low confidence predictions:**
- Ensure good lighting
- Sign clearly with full hand visibility
- Wait for full 18-frame buffer
- Check `PROB_THRESHOLD` setting

## OpenAPI Schema

FastAPI automatically generates OpenAPI documentation at:
- Swagger UI: http://localhost:8100/docs
- ReDoc: http://localhost:8100/redoc
- OpenAPI JSON: http://localhost:8100/openapi.json

## Contributing

When modifying this service:

1. **Follow the contract**: All responses must match `{output_type, result, confidence}`
2. **Update this README**: Document any endpoint changes
3. **Update OpenAPI schema**: Regenerate if adding endpoints
4. **Test both languages**: Verify ASL and FSL label mappings
5. **Test offline mode**: Ensure sign recognition works without internet
