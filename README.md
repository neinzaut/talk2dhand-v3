# Talk2DHand v3

A gamified learning platform for American Sign Language (ASL) and Filipino Sign Language (FSL) with AI-powered conversation practice and real-time sign recognition.

## 🎯 Features

- 🎓 **Interactive Learning Modules** - Structured lessons with progress tracking
- 🎯 **Practice Exercises** - Hands-on sign language practice
- 🤖 **AI Conversation** - AI-powered conversation practice
- 📊 **Gamification** - Streaks, XP points, and leaderboards
- 🌐 **Multi-language** - Support for ASL and FSL
- 🎥 **Real-time Recognition** - Static and dynamic sign recognition

## 📦 Project Structure

```
talk2dhand-v3/
├── app/
│   ├── ui/                    # Frontend: Next.js application
│   ├── static-signs/          # Backend: Static sign recognition (Flask + TensorFlow)
│   ├── dynamic-phrases/       # Backend: Dynamic phrase recognition (Flask + TensorFlow)
│   ├── docker-compose.yaml    # Multi-service orchestration
│   └── DOCKER_SETUP.md        # Complete Docker guide
├── README.md                  # This file
└── package.json               # Root dependencies
```

## 🐳 Getting Started with Docker (Recommended)

The easiest way to run Talk2DHand is using Docker, which isolates all services and their dependencies.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed
- At least 4GB RAM available for Docker

### Quick Start

```bash
# 1. Navigate to app directory
cd app

# 2. Build and start all services
docker-compose up -d

# 3. Access the application
# Frontend UI: http://localhost:3000
# Static Signs API: http://localhost:8000
# Dynamic Phrases API: http://localhost:5008

# 4. View logs (optional)
docker-compose logs -f

# 5. Stop services when done
docker-compose down
```

**That's it!** No need to install Node.js, Python, or TensorFlow locally.

📖 **Detailed Guide**: See [app/DOCKER_SETUP.md](app/DOCKER_SETUP.md) for troubleshooting and advanced usage.

## 🛠️ Alternative: Local Development (Without Docker)

If you prefer to run services locally without Docker:

### Frontend Only

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/ui/app/page.tsx`. The page auto-updates as you edit the file.

**Note**: Backend services will not be available unless you run them separately or use Docker.


## 📚 Documentation

- **[app/DOCKER_SETUP.md](app/DOCKER_SETUP.md)** - Complete Docker guide with troubleshooting

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Docker Network (bridge)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  UI Service  │  │ Static Signs │  │Dynamic Phrases│ │
│  │  (Next.js)   │──│  (Flask)     │──│  (Flask)     │ │
│  │  Port: 3000  │  │  Port: 8000  │  │  Port: 5008  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

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

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [TensorFlow Documentation](https://www.tensorflow.org/) - machine learning framework
- [MediaPipe Documentation](https://google.github.io/mediapipe/) - computer vision solutions
- [Docker Documentation](https://docs.docker.com/) - containerization platform
