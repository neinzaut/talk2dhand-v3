# Talk2DHand v3

A gamified platform for learning American Sign Language (ASL) and Filipino Sign Language (FSL) with AI-powered conversation practice and real-time sign recognition.

## Architecture

Talk2DHand consists of four main services:

```
┌────────────────────────────────────────────────────────────────────┐
│                    Docker Network (bridge)                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  UI Service  │  │ Static Signs │  │Dynamic Phrase│              │
│  │  (Next.js)   │──│  (Flask)     │──│  (Flask)     │              │
│  │  Port: 3000  │  │  Port: 8000  │  │  Port: 5008  │              │
│  └──────┬───────┘  └──────────────┘  └──────────────┘              │
│         │                                   |                      │
│         │          ┌────────────────────────────────┐              │
│         └──────────│ AI Converse Translate          │              │
│                    │ (FastAPI + Gemini AI)          │              │
│                    │ Port: 8100                     │              │
│                    └────────────────────────────────┘              │
└────────────────────────────────────────────────────────────────────┘
```

### Service Details

- **UI Service** (`app/ui`): Next.js frontend for user interaction and gamification.
- **Static Signs Service** (`app/static-signs`): Flask backend for static sign recognition (alphabet, numbers) using TensorFlow and MediaPipe.
- **Dynamic Phrases Service** (`app/dynamic-phrases`): Flask backend for dynamic phrase recognition using TensorFlow Lite and custom models.
- **AI Converse Translate Service** (`app/ai-converse-translate`): FastAPI backend integrating Google Gemini AI for natural language conversation, ASL/FSL translation, and real-time sign recognition. This service was added to provide advanced AI-powered conversation and translation features, and exposes a unified `/infer` API endpoint for both sign and text input. See its [README](app/ai-converse-translate/README.md) for API details and environment setup.

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
- FastAPI (AI Converse Translate)
- TensorFlow 2.10.0 / 2.15.0 / TFLite
- MediaPipe (Hands & Holistic)
- Google Gemini 2.0 Flash (AI responses)

### DevOps
- Docker & Docker Compose
- Multi-stage builds
- Service isolation

## Quick Start

### Development with Docker (Run in separate terminals)
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
cd app\ui

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Development Locally (No Docker)

**Prerequisites:**
- Python 3.10 (for static-signs service)
- Python 3.11 (for dynamic-phrases service)
- Node.js 18+

**Step 1: Set up Static Signs service**
```powershell
cd app\static-signs
py -3.10 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python setup_models.py  # Download required models
```

**Step 2: Set up Dynamic Phrases service**
```powershell
cd ..\dynamic-phrases
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Ensure module/islr/model.tflite exists
```

**Step 3: Set up UI**
```powershell
cd ..\ui
npm install
```

**Step 4: Run all services (in separate terminals)**

Terminal 1 - Static Signs:
```powershell
cd app\static-signs
.\venv\Scripts\Activate.ps1
python simple_server.py
```

Terminal 2 - Dynamic Phrases:
```powershell
cd app\dynamic-phrases
.\venv\Scripts\Activate.ps1
python app.py
```

Terminal 3 - UI:
```powershell
cd app\ui
npm run dev
```

Access the application at http://localhost:3000

**Note:** Python 3.10 is required for static-signs due to TensorFlow 2.10.0 compatibility. Dynamic-phrases uses Python 3.11 with TensorFlow 2.15.0.


**Important:** Ensure you have a `.env` file in `app/ai-converse-translate/` with your `GOOGLE_API_KEY` for the AI Converse Translate service to work properly in Docker. See [AI Converse Translate README](app/ai-converse-translate/README.md) for details.

## Documentation

- **[DOCKER_GUIDE.md](app/DOCKER_GUIDE.md)** - Complete setup guide
- **[DEVELOPMENT.md](app/DEVELOPMENT.md)** - Development workflow
- **[README.md](app/README.md)** - Service details

## User Guide

For a comprehensive user guide, including step-by-step instructions, features, and troubleshooting, please refer to the official documentation:

- [Talk2DHand User Guide (Google Drive)](https://drive.google.com/file/d/1slQ825nHlUWNZEaXgzTvNlcaEX8k-LTv/view?usp=sharing)

This guide covers:
- Getting started with the platform
- How to use each feature and service
- Tips for effective sign language learning
- Common issues and solutions

If you cannot access the link, please request access from the project owner or check for an updated version in the project documentation.
