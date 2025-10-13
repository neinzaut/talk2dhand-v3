# Docker Setup Guide for Talk2DHand

## Overview

Talk2DHand provides two Docker configurations that work independently without conflicts:

1. **Production Setup** (`docker-compose.yaml`) - Full containerized stack
2. **Development Setup** (`docker-compose.dev.yaml`) - Backend services only, UI runs natively

## Quick Reference

| Setup | Use Case | UI Location | Backend Location | Hot Reload |
|-------|----------|-------------|------------------|------------|
| **Production** | Deployment, Testing | Docker Container | Docker Container | ❌ |
| **Development** | Active Development | Native (npm) | Docker Container | ✅ |

## Architecture Comparison

### Production Setup
```
┌─────────────────────────────────────────────────────────┐
│                Docker Network (talk2dhand-network)     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ UI Container │  │ Static Signs │  │Dynamic Phrases│ │
│  │   :3000      │  │   :8000      │  │   :5008      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Development Setup
```
┌─────────────────────────────────────────────────────────┐
│ Host Machine                                            │
│  ┌──────────────┐                                      │
│  │ UI (Native)  │  ← Hot reload enabled                │
│  │   :3000      │                                      │
│  └──────────────┘                                      │
└─────────────────────────────────────────────────────────┘
           │
           ▼ (connects to localhost:8000, :5008)
┌─────────────────────────────────────────────────────────┐
│                Docker Network (talk2dhand-network)     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ Static Signs │  │Dynamic Phrases│ ← Hot reload      │
│  │   :8000      │  │   :5008      │   enabled         │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## Container Naming Strategy

The two setups use **different container names** to prevent conflicts:

| Service | Production | Development |
|---------|------------|-------------|
| UI | `talk2dhand-ui` | N/A (native) |
| Static Signs | `talk2dhand-static-signs` | `talk2dhand-static-signs-dev` |
| Dynamic Phrases | `talk2dhand-dynamic-phrases` | `talk2dhand-dynamic-phrases-dev` |

## Setup Instructions

### Option 1: Production Setup (Full Docker)

**Use when:** Deploying, testing full stack, or when you don't need hot reload.

```powershell
# Start all services
docker-compose up -d

# Access at:
# - UI: http://localhost:3000
# - Static Signs API: http://localhost:8000  
# - Dynamic Phrases API: http://localhost:5008

# Stop all services
docker-compose down
```

### Option 2: Development Setup (Hybrid)

**Use when:** Actively developing, need hot reload, frequent UI changes.

#### Method A: Using PowerShell Script (Recommended)
```powershell
# Automated setup - starts backend + UI
.\dev-start.ps1

# Stop with Ctrl+C (stops UI), then:
.\dev-stop.ps1
```

#### Method B: Manual Setup
```powershell
# 1. Start backend services only
docker-compose -f docker-compose.dev.yaml up -d

# 2. In another terminal, start UI natively
cd ui
npm install  # First time only
npm run dev

# Access at:
# - UI: http://localhost:3000 (with hot reload)
# - Static Signs API: http://localhost:8000
# - Dynamic Phrases API: http://localhost:5008
```

## Key Differences

| Feature | Production | Development |
|---------|------------|-------------|
| **UI Hot Reload** | ❌ | ✅ |
| **Backend Hot Reload** | ❌ | ✅ |
| **Container Count** | 3 | 2 |
| **Startup Time** | Slower | Faster |
| **Resource Usage** | Higher | Lower |
| **Network Config** | Internal Docker | Localhost |

## Environment Variables

### Production (docker-compose.yaml)
```yaml
environment:
  - NEXT_PUBLIC_STATIC_SIGNS_API=http://static-signs:8000
  - NEXT_PUBLIC_DYNAMIC_PHRASES_API=http://dynamic-phrases:5008
  - NODE_ENV=production
```

### Development (Native UI)
The UI automatically uses localhost URLs when running natively:
- `http://localhost:8000` for static signs
- `http://localhost:5008` for dynamic phrases

## Switching Between Setups

You can safely switch between setups without conflicts:

```powershell
# Stop production setup
docker-compose down

# Start development setup
.\dev-start.ps1

# Or vice versa:
.\dev-stop.ps1
docker-compose up -d
```

## Volume Mounts for Hot Reload

### Development Setup
```yaml
# Backend services have volume mounts enabled
volumes:
  - ./static-signs/simple_server.py:/app/simple_server.py
  - ./dynamic-phrases/app.py:/app/app.py
```

### Production Setup
```yaml
# Volume mounts are commented out (no hot reload)
# volumes:
#   - ./static-signs/simple_server.py:/app/simple_server.py
```

## Troubleshooting

### Port Conflicts
Both setups use the same ports (3000, 8000, 5008). Make sure to stop one before starting the other:

```powershell
# Check what's using ports
netstat -ano | findstr ":3000"
netstat -ano | findstr ":8000"
netstat -ano | findstr ":5008"

# Stop all Talk2DHand containers
docker stop $(docker ps -q --filter "name=talk2dhand")
```

### Container Name Conflicts
If you see container name conflicts, clean up:

```powershell
# Remove all Talk2DHand containers
docker rm -f $(docker ps -aq --filter "name=talk2dhand")

# Or remove specific containers
docker rm -f talk2dhand-ui talk2dhand-static-signs talk2dhand-dynamic-phrases
```

### Model Files Missing
Both setups require the same model files:
- `static-signs/hand_landmarks.h5` ✅
- `dynamic-phrases/action.h5` ✅

### Network Issues
Both setups use the same Docker network but different connection methods:

```powershell
# Reset Docker network if needed
docker network rm talk2dhand-network
docker-compose up  # Will recreate network
```

## Performance Considerations

### Memory Usage
- **Production**: ~2-3GB (all containers)
- **Development**: ~1-2GB (backend only) + native Node.js

### CPU Usage
- **Development** is more efficient as UI runs natively
- **Production** has more overhead but better isolation

## Development Workflow Recommendations

### Daily Development
```powershell
# Morning: Start dev environment
.\dev-start.ps1

# Work on UI changes (hot reload active)
# Work on backend changes (hot reload active)

# Evening: Stop dev environment
# Ctrl+C to stop UI, then:
.\dev-stop.ps1
```

### Testing Before Deployment
```powershell
# Stop development
.\dev-stop.ps1

# Test production setup
docker-compose up -d

# Verify everything works
# Then deploy or continue development
```

### Making Backend Changes
```powershell
# Development: Changes auto-reload
# Just edit files in static-signs/ or dynamic-phrases/

# Production: Need to rebuild
docker-compose build static-signs
docker-compose up -d static-signs
```

## Best Practices

1. **Use development setup** for daily coding
2. **Use production setup** for testing before deployment
3. **Always stop one setup** before starting the other
4. **Use the PowerShell scripts** for convenience
5. **Check container status** with `docker ps` when troubleshooting

## Commands Reference

```powershell
# Development (Recommended)
.\dev-start.ps1                              # Start everything
.\dev-stop.ps1                               # Stop everything

# Development (Manual)
docker-compose -f docker-compose.dev.yaml up -d    # Backend only
docker-compose -f docker-compose.dev.yaml down     # Stop backend

# Production
docker-compose up -d                         # Start all
docker-compose down                          # Stop all

# Monitoring
docker-compose ps                            # Check status
docker-compose logs -f                       # Watch logs
docker stats                                 # Resource usage

# Cleanup
docker-compose down -v                       # Remove volumes
docker system prune                          # Clean Docker
```

## Next Steps

1. Choose your preferred setup based on your needs
2. Run the appropriate commands
3. Access the application at http://localhost:3000

---

**💡 Tip:** Use the development setup for daily work and production setup for final testing before deployment.