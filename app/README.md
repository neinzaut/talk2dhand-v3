# Talk2DHand Application Services

This directory contains all services for the Talk2DHand sign language learning platform.

## Services

| Service | Port | Technology | Purpose |
|---------|------|------------|---------|
| **UI** | 3000 | Next.js + React | Web application frontend |
| **Static Signs** | 8000 | Flask + TensorFlow 2.10 | Static character recognition (A-Z, 0-9) |
| **Dynamic Phrases** | 5008 | Flask + TensorFlow 2.15 | Dynamic phrase recognition (hello, thanks, etc.) |

## Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access:
- UI: http://localhost:3000
- Static Signs API: http://localhost:8000/health
- Dynamic Phrases API: http://localhost:5008/predict

**For detailed documentation, see [DOCKER_SETUP.md](DOCKER_SETUP.md)**

## Development

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for:
- Detailed API documentation
- Rebuilding containers
- Hot-reloading setup
- Troubleshooting guide
- Production deployment tips

