# Talk2DHand Application Services

This directory contains the backend services for the Talk2DHand sign language learning platform.

## Services Overview

### 1. Static Signs (`static-signs/`)
- **Purpose**: Recognition of static sign language characters (A-Z, 0-9, CH, ENYE, NG)
- **Technology**: Python 3.10, TensorFlow 2.10.0, MediaPipe
- **Port**: 8000
- **Model**: `hand_landmarks.h5`

### 2. Dynamic Phrases (`dynamic-phrases/`)
- **Purpose**: Recognition of dynamic sign language phrases (hello, thanks, iloveyou)
- **Technology**: Python 3.11, TensorFlow 2.15.0, MediaPipe Holistic
- **Port**: 5008
- **Model**: `action.h5` (must be provided)

### 3. UI (`ui/`)
- **Purpose**: Next.js web application for the learning platform
- **Technology**: React, Next.js, TypeScript, Tailwind CSS
- **See**: `ui/README.md` for details

## Running with Docker

All services are containerized for easy deployment and dependency isolation.

### Prerequisites

1. Docker and Docker Compose installed
2. Model files in place:
   - `static-signs/hand_landmarks.h5` ✓ (included)
   - `dynamic-phrases/action.h5` ⚠️ (must be added)

### Quick Start

```bash
# Start all backend services
cd app
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Services

```bash
# Start only static-signs
docker-compose up -d static-signs

# Start only dynamic-phrases
docker-compose up -d dynamic-phrases

# Restart a service
docker-compose restart static-signs

# View logs for specific service
docker-compose logs -f dynamic-phrases
```

## API Endpoints

### Static Signs Service (Port 8000)

**Health Check**
```
GET http://localhost:8000/health
```

**Predict Static Sign**
```
POST http://localhost:8000/predict
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}
```

### Dynamic Phrases Service (Port 5008)

**Predict Dynamic Phrase**
```
POST http://localhost:5008/predict
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,...",
  "clientId": "unique-id",
  "language": "english"
}
```

## Development

### Rebuilding After Changes

```bash
# Rebuild specific service
docker-compose build static-signs

# Rebuild all services
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

### Code Hot-Reloading

The `docker-compose.yaml` is configured with volume mounts for development:
- Changes to `simple_server.py` and `app.py` are reflected immediately
- Model files are mounted as read-only for safety

## Adding the Dynamic Phrases Model

If you're migrating from an old repository:

```bash
# Copy the action.h5 model file
cp /path/to/old/repo/action.h5 app/dynamic-phrases/action.h5

# Verify it's in place
ls -lh app/dynamic-phrases/action.h5

# Rebuild the container
cd app
docker-compose build dynamic-phrases
docker-compose up -d dynamic-phrases
```

## Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs [service-name]

# Check if port is already in use
netstat -ano | findstr "8000"  # Windows
lsof -i :8000                  # Linux/Mac
```

### Model not loading
- Ensure model files exist and have correct permissions
- Check logs for specific error messages
- Verify model file is not corrupted

### High memory usage
- MediaPipe Holistic (dynamic-phrases) is resource-intensive
- Consider limiting container resources in docker-compose.yaml
- Use GPU support if available

## Network Architecture

All services run on the `talk2dhand-network` bridge network:
- Services can communicate using container names
- External access via mapped ports
- UI can call backend services at `http://static-signs:8000` and `http://dynamic-phrases:5008` from within Docker network

## Production Deployment

For production:

1. Remove development volume mounts in `docker-compose.yaml`
2. Set `restart: always` instead of `unless-stopped`
3. Use environment variables for configuration
4. Consider using Docker secrets for sensitive data
5. Add reverse proxy (nginx) for SSL/TLS
6. Set up monitoring and logging

## License

See main project README for license information.

