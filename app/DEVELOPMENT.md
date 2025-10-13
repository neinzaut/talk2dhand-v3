# Development Scripts for Talk2DHand

> **📖 For complete Docker setup documentation, see [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)**

This directory contains scripts to make development easier by running the UI natively while keeping backend services in Docker.

## Quick Start (Recommended)

### Using PowerShell Scripts
```powershell
# Start everything (backend + UI with hot reload)
.\dev-start.ps1

# Stop everything
.\dev-stop.ps1
```

### Manual Setup
```powershell
# 1. Start backend services only
docker-compose -f docker-compose.dev.yaml up -d

# 2. Start UI development server
cd ui
npm install  # Only needed first time or when dependencies change
npm run dev
```

### Access Points
- **UI**: http://localhost:3000 (Next.js dev server with hot-reload)
- **Static Signs API**: http://localhost:8000
- **Dynamic Phrases API**: http://localhost:5008

## Development Workflow

### Making UI Changes
- Edit files in `/app/ui/`
- Changes will hot-reload automatically
- No need to rebuild containers

### Making Backend Changes
- Edit files in `/app/static-signs/` or `/app/dynamic-phrases/`
- Changes will hot-reload automatically (volumes are mounted)
- If you change dependencies, rebuild: `docker-compose -f docker-compose.dev.yaml up --build`

### Stopping Services
```powershell
# Stop backend services
docker-compose -f docker-compose.dev.yaml down

# Stop UI (Ctrl+C in the terminal running npm run dev)
```

## Environment Configuration

The UI uses `.env.local` to connect to localhost backend services instead of Docker network addresses.

## Production Deployment

For production, use the main `docker-compose.yaml` which containerizes everything:
```powershell
docker-compose up -d
```

## Troubleshooting

### Backend Connection Issues
- Ensure backend containers are running: `docker-compose -f docker-compose.dev.yaml ps`
- Check backend logs: `docker-compose -f docker-compose.dev.yaml logs`

### Port Conflicts
- If ports 3000, 8000, or 5008 are in use, stop other services or modify the ports in the compose file

### Dependencies Issues
- Delete `node_modules` and run `npm install` again
- For backend: rebuild containers with `--no-cache` flag