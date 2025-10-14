# Talk2DHand v3

A gamified platform for learning American Sign Language (ASL) and Filipino Sign Language (FSL) with AI-powered conversation practice and real-time sign recognition.

## Architecture

Talk2DHand consists of three main services:

```
┌─────────────────────────────────────────────────────────┐
│                Docker Network (bridge)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  UI Service  │  │ Static Signs │  │Dynamic Phrase│   │
│  │  (Next.js)   │──│  (Flask)     │──│  (Flask)     │   │
│  │  Port: 3000  │  │  Port: 8000  │  │  Port: 5008  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript 5.9.3
- Tailwind CSS v4
- Zustand (State Management)

### Backend Services
- Python 3.10-3.11
- Flask
- TensorFlow 2.10.0 / 2.15.0
- MediaPipe (Hands & Holistic)

### DevOps
- Docker & Docker Compose
- Multi-stage builds
- Service isolation

## Quick Start

### Development (Run in separate terminals)
**Backend Services**
```powershell
# Navigate to the app directory
cd app

# Build and run the backend services (if the containers haven't been built yet)
docker-compose -f docker-compose.dev.yaml up --build

# Run the backend services (if the containers already exist)
docker-compose -f docker-compose.dev.yaml up
```

**Frontend Services**
```powershell
# Navigate to the frontend directory
cd app
cd ui

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Production
```powershell
cd app
docker-compose up -d
```

Access the application at http://localhost:3000.

## Documentation

- **[DOCKER_GUIDE.md](app/DOCKER_GUIDE.md)** - Complete setup guide
- **[DEVELOPMENT.md](app/DEVELOPMENT.md)** - Development workflow
- **[README.md](app/README.md)** - Service details
