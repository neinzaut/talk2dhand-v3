# Docker Setup Guide for Talk2DHand

> **⚠️ This file is deprecated. Please use [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for complete Docker setup documentation.**

## Quick Migration

This file has been replaced by a comprehensive guide that covers both production and development setups:

- **Production Setup** (full Docker stack) - Use `docker-compose.yaml`
- **Development Setup** (hybrid approach) - Use `docker-compose.dev.yaml` or `dev-start.ps1`

## Legacy Information

This document previously described the production Docker setup. The new consolidated guide includes:

- Clear separation between production and development workflows
- Container naming strategy to prevent conflicts
- Performance comparisons and recommendations
- Comprehensive troubleshooting section

## Prerequisites

- Docker installed (version 20.10+)  
- Docker Compose installed (version 2.0+)
- At least 4GB RAM available for Docker

## Quick Start

### 1. Build all containers

```bash
cd app
docker-compose build
```

### 2. Start all services

```bash
docker-compose up
```

Or run in detached mode (background):

```bash
docker-compose up -d
```

### 3. Access the application

- **Frontend UI**: http://localhost:3000
- **Static Signs API**: http://localhost:8000
- **Dynamic Phrases API**: http://localhost:5008

## Individual Service Commands

### Start specific services

```bash
# Only UI
docker-compose up ui

# Only backend services
docker-compose up static-signs dynamic-phrases

# Specific service
docker-compose up static-signs
```

### Rebuild specific service

```bash
docker-compose build ui
docker-compose build static-signs
docker-compose build dynamic-phrases
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ui
docker-compose logs -f dynamic-phrases
```

### Stop services

```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop ui
```

## Development Mode

For hot-reload during development, uncomment volume mounts in `docker-compose.yaml`:

```yaml
# UI development
volumes:
  - ./ui/app:/app/app
  - ./ui/components:/app/components
  - ./ui/store:/app/store

# Backend development
volumes:
  - ./dynamic-phrases/app.py:/app/app.py
```

Then restart:

```bash
docker-compose restart ui
docker-compose restart dynamic-phrases
```

## Environment Variables

The UI container uses these environment variables (set in docker-compose.yaml):

- `NEXT_PUBLIC_STATIC_SIGNS_API`: Backend API for static signs
- `NEXT_PUBLIC_DYNAMIC_PHRASES_API`: Backend API for dynamic phrases

Access in your Next.js code:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_DYNAMIC_PHRASES_API;
```

## Troubleshooting

### Container fails to build

```bash
# Clean build (no cache)
docker-compose build --no-cache

# Check logs
docker-compose logs <service-name>
```

### Port already in use

```bash
# Find process using the port
# Windows PowerShell:
netstat -ano | findstr :3000

# Kill the process or change port in docker-compose.yaml
ports:
  - "3001:3000"  # Map to different host port
```

### Model file not found

Ensure model files exist:
- `static-signs/hand_landmarks.h5` ✅
- `dynamic-phrases/action.h5` ✅

Build will fail if models are missing (by design).

### Network issues between containers

```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up
```

### Out of disk space

```bash
# Clean up unused Docker resources
docker system prune -a

# Remove all stopped containers and unused images
docker container prune
docker image prune -a
```

## Production Deployment

For production, consider:

1. **Set resource limits** in docker-compose.yaml:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
```

2. **Use production environment variables**:
```yaml
environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

3. **Set up reverse proxy** (nginx) for SSL/TLS
4. **Enable health checks**
5. **Set up logging** and monitoring

## Useful Commands Reference

```bash
# Build and start
docker-compose up --build

# Restart a service
docker-compose restart <service>

# Execute command in running container
docker-compose exec ui sh
docker-compose exec dynamic-phrases bash

# View resource usage
docker stats

# Inspect a service
docker-compose ps
docker inspect talk2dhand-ui
```

## Container Details

| Service | Port | Base Image | Model File |
|---------|------|------------|------------|
| ui | 3000 | node:20-alpine | - |
| static-signs | 8000 | python:3.11-slim | hand_landmarks.h5 |
| dynamic-phrases | 5008 | python:3.11-slim | action.h5 |

## Verification

After starting services, verify everything is working:

```bash
# Check if all containers are running
docker-compose ps

# Test static signs health
curl http://localhost:8000/health
# Expected: {"status": "healthy", "model_loaded": true}

# Test UI
# Open http://localhost:3000 in browser
```

## Common Commands Cheat Sheet

```bash
# First time setup
cd app
docker-compose build
docker-compose up -d

# Daily development
docker-compose start          # Start existing containers
docker-compose stop           # Stop without removing
docker-compose restart        # Quick restart

# Viewing and debugging
docker-compose logs -f        # Watch logs
docker-compose ps             # Check status
docker stats                  # Resource usage

# Cleanup
docker-compose down           # Stop and remove containers
docker-compose down -v        # Also remove volumes
docker system prune -a        # Clean up everything
```

## Next Steps

1. Build the containers: `docker-compose build`
2. Start services: `docker-compose up -d`
3. Access UI at http://localhost:3000
4. Check logs: `docker-compose logs -f`
5. Begin development!

