# Talk2DHand v3 - Technical Documentation

**Version:** 3.0  
**Last Updated:** November 12, 2025  
**Repository:** neinzaut/talk2dhand-v3  
**Current Branch:** refactor/backend

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Service Documentation](#service-documentation)
6. [Frontend Application](#frontend-application)
7. [Development Environment](#development-environment)
8. [Docker Configuration](#docker-configuration)
9. [API Reference](#api-reference)
10. [State Management](#state-management)
11. [Key Features](#key-features)
12. [Build & Deployment](#build--deployment)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

Talk2DHand v3 is a gamified Learning Management System (LMS) for teaching American Sign Language (ASL) and Filipino Sign Language (FSL). The platform combines real-time sign recognition, AI-powered conversation practice, and interactive learning modules.

### Key Objectives

- Provide an engaging, gamified learning experience for sign language
- Enable real-time sign language recognition using computer vision
- Support both static (fingerspelling) and dynamic (phrases) sign recognition
- Offer AI-powered conversation practice
- Track learner progress with XP, streaks, and leaderboards

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                           │
│                  (talk2dhand-network)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  UI Service   │  │ Static Signs │  │ Dynamic Phrases │  │
│  │  (Next.js)    │──│  (Flask)     │──│    (Flask)      │  │
│  │  Port: 3000   │  │  Port: 8000  │  │   Port: 5008    │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
│         │                   │                    │          │
│         │                   │                    │          │
│    ┌────▼───────────────────▼────────────────────▼────┐    │
│    │         TensorFlow Models & MediaPipe          │    │
│    │    • hand_landmarks.h5 (Static Recognition)    │    │
│    │    • action.h5 (Dynamic Phrase Recognition)    │    │
│    └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Microservices Design

The application follows a **microservices architecture** with three independent services:

1. **UI Service**: User interface and client-side logic
2. **Static Signs Service**: Recognition of static hand shapes (A-Z, 0-9)
3. **Dynamic Phrases Service**: Recognition of dynamic sign language phrases

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.4 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.9.3 | Type-safe JavaScript |
| **Tailwind CSS** | 4.1.14 | Utility-first CSS framework |
| **Zustand** | 5.0.2 | State management |
| **Xenova Transformers** | 2.17.2 | Client-side ML (Whisper speech recognition) |
| **Radix UI** | Various | Headless UI components |

### Backend Services

| Technology | Version | Service | Purpose |
|------------|---------|---------|---------|
| **Python** | 3.10 | Static Signs | Runtime environment |
| **Python** | 3.11 | Dynamic Phrases | Runtime environment |
| **Flask** | 3.0.0 | Both | Web framework |
| **TensorFlow** | 2.10.0 | Static Signs | Deep learning framework |
| **TensorFlow** | 2.15.0 | Dynamic Phrases | Deep learning framework |
| **MediaPipe** | 0.10.9 | Both | Hand/Pose landmark detection |
| **OpenCV** | 4.8.1.78 | Both | Computer vision |

### DevOps & Tools

- **Docker** & **Docker Compose**: Containerization and orchestration
- **Biome**: Code formatting and linting
- **PowerShell**: Automation scripts (Windows)
- **Git**: Version control

### Version Compatibility Notes

**Important:** MediaPipe versions below 0.10.x are no longer available in PyPI. Both services now use MediaPipe 0.10.9, which is compatible with both Python 3.10 and 3.11.

| Service | Python | TensorFlow | MediaPipe | Notes |
|---------|--------|------------|-----------|-------|
| Static Signs | 3.10 | 2.10.0 | 0.10.9 | Stable configuration |
| Dynamic Phrases | 3.11 | 2.15.0 | 0.10.9 | Latest TensorFlow features |

---

## Project Structure

```
talk2dhand-v3/
├── app/                          # Main application directory
│   ├── static-signs/             # Static sign recognition service
│   │   ├── simple_server.py      # Flask server
│   │   ├── run_app.py            # Application runner
│   │   ├── hand_landmarks.h5     # Pre-trained model (A-Z, 0-9)
│   │   ├── requirements.txt      # Python dependencies
│   │   └── Dockerfile            # Container definition
│   │
│   ├── dynamic-phrases/          # Dynamic phrase recognition service
│   │   ├── app.py                # Flask server with WebSocket support
│   │   ├── action.h5             # Pre-trained model (hello, thanks, iloveyou)
│   │   ├── requirements.txt      # Python dependencies
│   │   └── Dockerfile            # Container definition
│   │
│   ├── ui/                       # Frontend application
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── page.tsx          # Home page (redirects to /learn)
│   │   │   ├── learn/            # Learning module
│   │   │   ├── practice/         # Practice games
│   │   │   └── ai-converse/      # AI conversation feature
│   │   ├── components/           # React components
│   │   │   ├── app-sidebar.tsx   # Navigation sidebar
│   │   │   ├── app-header.tsx    # Top header
│   │   │   ├── learn/            # Learning components
│   │   │   ├── practice/         # Practice game components
│   │   │   └── shared/           # Reusable UI components
│   │   ├── store/                # Zustand state management
│   │   │   ├── app-store.ts      # Application state
│   │   │   ├── user-store.ts     # User state
│   │   │   ├── types.ts          # TypeScript types
│   │   │   └── data/             # Static data (lessons, modules)
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useSpeechPractice.ts
│   │   │   └── useWhisperRecognition.ts
│   │   ├── lib/                  # Utility functions
│   │   ├── public/               # Static assets
│   │   │   ├── icons/            # Icons and favicon
│   │   │   └── images/           # Sign language images
│   │   ├── package.json          # NPM dependencies
│   │   ├── tsconfig.json         # TypeScript configuration
│   │   ├── next.config.ts        # Next.js configuration
│   │   └── Dockerfile            # Production container
│   │
│   ├── docker-compose.yaml       # Production Docker setup
│   ├── docker-compose.dev.yaml   # Development Docker setup
│   ├── dev-start.ps1             # Development startup script
│   ├── dev-stop.ps1              # Development cleanup script
│   ├── README.md                 # Service overview
│   ├── DEVELOPMENT.md            # Development guide
│   └── DOCKER_GUIDE.md           # Docker setup guide
│
├── biome.json                    # Biome configuration
├── README.md                     # Project overview
└── .gitignore                    # Git ignore rules
```

---

## Service Documentation

### 1. Static Signs Service

**Purpose:** Recognizes static hand shapes representing letters (A-Z) and numbers (0-9).

**Technology:**
- Python 3.10
- TensorFlow 2.10.0
- MediaPipe 0.10.9 (Hand detection)
- Flask 3.0.0

**Key Features:**
- Real-time hand landmark detection
- 36 classes (A-Z, 0-9)
- Base64 image input
- Thread-safe model singleton pattern
- CORS enabled for cross-origin requests

**Model:**
- File: `hand_landmarks.h5`
- Input: MediaPipe hand landmarks (21 points × 3 coordinates = 63 features)
- Output: Confidence scores for 36 classes

**Endpoints:**
- `GET /health` - Health check
- `POST /predict` - Recognize static sign

**Container:**
- Name: `talk2dhand-static-signs` (production) or `talk2dhand-static-signs-dev` (development)
- Port: 8000
- Base Image: `python:3.10-slim`

---

### 2. Dynamic Phrases Service

**Purpose:** Recognizes dynamic sign language phrases through sequential hand/pose movements.

**Technology:**
- Python 3.11
- TensorFlow 2.15.0
- MediaPipe 0.10.9 (Holistic detection)
- Flask 3.0.0

**Key Features:**
- Temporal sequence analysis (30 frames)
- Multi-language support (English/Tagalog)
- Client session management
- Motion history tracking
- Confidence thresholds and cooldown periods

**Model:**
- File: `action.h5`
- Input: 30 frames × holistic landmarks (pose, face, hands)
- Output: 3 classes (hello, thanks, iloveyou)
- Tagalog translations: kamusta, salamat, mahal kita

**Endpoints:**
- `POST /predict` - Recognize dynamic phrase

**Request Format:**
```json
{
  "image": "base64_encoded_image",
  "clientId": "unique_client_id",
  "language": "english" // or "tagalog"
}
```

**Container:**
- Name: `talk2dhand-dynamic-phrases` (production) or `talk2dhand-dynamic-phrases-dev` (development)
- Port: 5008
- Base Image: `python:3.11-slim`

---

### 3. UI Service

**Purpose:** User-facing web application with learning modules, practice games, and AI features.

**Technology:**
- Next.js 15 (App Router)
- React 19
- TypeScript 5.9.3
- Tailwind CSS 4

**Key Features:**
- Server-side rendering (SSR)
- Client-side state management with Zustand
- Responsive design
- Offline speech recognition (Whisper via Transformers.js)
- Real-time camera integration
- Gamification (XP, streaks, leaderboards)

**Pages:**
- `/` - Home (redirects to `/learn`)
- `/learn` - Learning modules dashboard
- `/learn/lessons/[id]` - Individual lesson viewer
- `/practice` - Practice games hub
  - `/practice/camera-to-sign` - Camera-based sign practice
  - `/practice/text-to-sign` - Text-to-sign translation
  - `/practice/audio-to-sign` - Audio-to-sign translation
  - `/practice/memory-game` - Memory matching game
- `/ai-converse` - AI-powered conversation practice

**Container (Production):**
- Name: `talk2dhand-ui`
- Port: 3000
- Base Image: `node:20-alpine`
- Build: Multi-stage (build → production)

---

## Frontend Application

### App Router Structure

Next.js 15 uses the **App Router** architecture located in `app/ui/app/`:

```
app/
├── layout.tsx              # Root layout (sidebar, header)
├── page.tsx                # Home page
├── globals.css             # Global styles
├── learn/
│   ├── page.tsx            # Module dashboard
│   ├── lessons/
│   │   └── [lessonId]/
│   │       └── page.tsx    # Lesson viewer
│   └── modules/
│       └── [moduleId]/
│           └── page.tsx    # Module details
├── practice/
│   ├── page.tsx            # Practice hub
│   ├── camera-to-sign/
│   ├── text-to-sign/
│   ├── audio-to-sign/
│   └── memory-game/
└── ai-converse/
    └── page.tsx            # AI conversation
```

### Component Architecture

Components are organized by feature:

```
components/
├── shared/                 # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── avatar.tsx
│   └── progress.tsx
├── learn/                  # Learning-specific components
│   ├── QuizComponent.tsx
│   └── GrammarPracticeQuizComponent.tsx
├── practice/               # Practice game components
│   ├── HowToPlayModal.tsx
│   └── ScoreModal.tsx
├── app-sidebar.tsx         # Navigation sidebar
├── app-header.tsx          # Top header
├── daily-quest-card.tsx    # Quest tracking
├── leaderboard-card.tsx    # Leaderboard display
└── how-to-use-modal.tsx    # Tutorial modal
```

### Custom Hooks

**`useSpeechPractice`** (`hooks/useSpeechPractice.ts`)
- Purpose: Speech-based practice validation
- Features:
  - Microphone permission handling
  - Answer checking with fuzzy matching
  - Integration with Whisper recognition
  - Toast notifications for feedback

**`useWhisperRecognition`** (`hooks/useWhisperRecognition.ts`)
- Purpose: Offline speech-to-text using Transformers.js
- Features:
  - Lazy model loading (Whisper Tiny)
  - Audio recording with MediaRecorder
  - Multi-language support (English/Filipino)
  - Automatic silence detection
  - WebWorker-based processing

### Styling

**Tailwind CSS 4** with custom configuration:

```javascript
// tailwind.config.js
import { type Config } from "tailwindcss"

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      fontFamily: {
        sans: ["var(--font-fredoka)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config
```

**Global Styles** (`app/globals.css`):
- Tailwind base, components, utilities
- Custom CSS variables
- Typography defaults
- Background patterns

---

## State Management

### Zustand Stores

**App Store** (`store/app-store.ts`)

Manages application-wide state:

```typescript
interface AppState {
  // User progress
  streak: number
  totalXP: number
  currentLanguage: "asl" | "fsl"
  currentLessonId: string
  isQuizActive: boolean
  
  // Language data
  languageData: Record<Language, LanguageData>
  
  // Actions
  incrementStreak: () => void
  addXP: (amount: number) => void
  setLanguage: (language: Language) => void
  setQuizActive: (isActive: boolean) => void
  getCurrentModules: () => Module[]
  getCurrentLeaderboard: () => LeaderboardEntry[]
  setCurrentLesson: (lessonId: string) => void
  getCurrentLesson: () => Lesson | null
  updateLessonProgress: (lessonId: string, progress: number) => void
  completeLesson: (lessonId: string) => void
  completeSubLesson: (lessonId: string, subLessonId: string) => void
}
```

**User Store** (`store/user-store.ts`)

Manages user-specific data:

```typescript
interface UserState {
  streak: number
  totalXP: number
  currentLesson: string
  incrementStreak: () => void
  addXP: (amount: number) => void
}
```

### Type Definitions

**Core Types** (`store/types.ts`):

```typescript
type Language = "asl" | "fsl"
type SubLessonType = "content" | "practice" | "quiz" | "grammar-practice"

interface Sign {
  id: string
  label: string
  imageUrl: string
}

interface SubLesson {
  id: string
  type: SubLessonType
  title: string
  completed: boolean
  content?: string
  videos?: { label: string; youtubeId?: string; url?: string }[]
}

interface Lesson {
  id: string
  title: string
  subtitle: string
  icon: string
  completed: boolean
  progress: number
  signs: Sign[]
  subLessons: SubLesson[]
}

interface Module {
  id: string
  title: string
  description: string
  progress: number
  lessons: Lesson[]
}

interface LeaderboardEntry {
  id: string
  name: string
  xp: number
  change: number
}
```

### Data Management

Static learning data is stored in:
- `store/data/asl-data.ts` - ASL modules and lessons
- `store/data/fsl-data.ts` - FSL modules and lessons
- `store/data/grammar-quiz.ts` - Grammar quiz questions
- `store/data/grammar-practice.ts` - Grammar practice exercises

---

## Development Environment

### Two Setup Modes

**1. Production Setup** (Full Docker)
- All services containerized
- Best for deployment and full-stack testing
- No hot reload

**2. Development Setup** (Hybrid)
- Backend services in Docker
- Frontend runs natively with `npm run dev`
- Hot reload enabled for all services
- Faster iteration

### Development Scripts

**`dev-start.ps1`** - Start development environment

```powershell
# What it does:
# 1. Checks Docker is running
# 2. Starts backend services (docker-compose.dev.yaml)
# 3. Checks UI dependencies
# 4. Starts UI dev server (npm run dev)

.\dev-start.ps1
```

**`dev-stop.ps1`** - Stop development environment

```powershell
# What it does:
# 1. Stops Docker backend services
# 2. Reminds to stop UI with Ctrl+C

.\dev-stop.ps1
```

### Manual Development Setup

```powershell
# 1. Start backend services
cd app
docker-compose -f docker-compose.dev.yaml up -d

# 2. Start UI (in new terminal)
cd app/ui
npm install  # First time only
npm run dev

# Access at:
# - UI: http://localhost:3000
# - Static Signs API: http://localhost:8000
# - Dynamic Phrases API: http://localhost:5008
```

### Hot Reload Configuration

**Backend Services** (docker-compose.dev.yaml):
```yaml
volumes:
  - ./static-signs/simple_server.py:/app/simple_server.py
  - ./dynamic-phrases/app.py:/app/app.py
```

**Frontend** (Native):
- Next.js dev server automatically watches for changes
- Fast Refresh enabled by default

---

## Docker Configuration

### Container Naming Strategy

To prevent conflicts, production and development use different names:

| Service | Production | Development |
|---------|------------|-------------|
| UI | `talk2dhand-ui` | N/A (native) |
| Static Signs | `talk2dhand-static-signs` | `talk2dhand-static-signs-dev` |
| Dynamic Phrases | `talk2dhand-dynamic-phrases` | `talk2dhand-dynamic-phrases-dev` |

### Production Setup (docker-compose.yaml)

```yaml
services:
  static-signs:
    build: ./static-signs
    container_name: talk2dhand-static-signs
    ports: ["8000:8000"]
    environment:
      - TF_CPP_MIN_LOG_LEVEL=2
    networks: [talk2dhand-network]
    
  dynamic-phrases:
    build: ./dynamic-phrases
    container_name: talk2dhand-dynamic-phrases
    ports: ["5008:5008"]
    environment:
      - TF_CPP_MIN_LOG_LEVEL=2
    networks: [talk2dhand-network]
    
  ui:
    build: ./ui
    container_name: talk2dhand-ui
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_STATIC_SIGNS_API=http://static-signs:8000
      - NEXT_PUBLIC_DYNAMIC_PHRASES_API=http://dynamic-phrases:5008
      - NODE_ENV=production
    depends_on: [static-signs, dynamic-phrases]
    networks: [talk2dhand-network]

networks:
  talk2dhand-network:
    driver: bridge
```

### Development Setup (docker-compose.dev.yaml)

```yaml
services:
  static-signs:
    build: ./static-signs
    container_name: talk2dhand-static-signs-dev
    ports: ["8000:8000"]
    volumes:
      - ./static-signs/simple_server.py:/app/simple_server.py
      - ./static-signs/run_app.py:/app/run_app.py
    networks: [talk2dhand-network]
    
  dynamic-phrases:
    build: ./dynamic-phrases
    container_name: talk2dhand-dynamic-phrases-dev
    ports: ["5008:5008"]
    volumes:
      - ./dynamic-phrases/app.py:/app/app.py
    networks: [talk2dhand-network]

networks:
  talk2dhand-network:
    driver: bridge
```

### Environment Variables

**Production (UI in Docker):**
```bash
NEXT_PUBLIC_STATIC_SIGNS_API=http://static-signs:8000
NEXT_PUBLIC_DYNAMIC_PHRASES_API=http://dynamic-phrases:5008
NODE_ENV=production
```

**Development (UI native):**
```bash
# Automatically uses localhost
NEXT_PUBLIC_STATIC_SIGNS_API=http://localhost:8000
NEXT_PUBLIC_DYNAMIC_PHRASES_API=http://localhost:5008
```

---

## API Reference

### Static Signs API

**Base URL:** `http://localhost:8000`

#### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "service": "static-signs"
}
```

#### Predict Static Sign

```http
POST /predict
Content-Type: application/json
```

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response:**
```json
{
  "prediction": "A",
  "confidence": 0.9876,
  "all_predictions": {
    "A": 0.9876,
    "B": 0.0043,
    "C": 0.0021
  }
}
```

**Error Response:**
```json
{
  "error": "No hand detected in image",
  "details": "MediaPipe could not detect hand landmarks"
}
```

---

### Dynamic Phrases API

**Base URL:** `http://localhost:5008`

#### Predict Dynamic Phrase

```http
POST /predict
Content-Type: application/json
```

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "clientId": "client-12345",
  "language": "english"
}
```

**Parameters:**
- `image` (string, required): Base64-encoded image
- `clientId` (string, required): Unique client identifier for session management
- `language` (string, optional): "english" or "tagalog" (default: "english")

**Response:**
```json
{
  "prediction": "hello",
  "confidence": 0.92,
  "display_text": "hello",
  "status": "detected",
  "language": "english"
}
```

**Response (Tagalog):**
```json
{
  "prediction": "kamusta",
  "confidence": 0.92,
  "display_text": "kamusta",
  "status": "detected",
  "language": "tagalog"
}
```

**Response (Waiting):**
```json
{
  "prediction": "Waiting for hands...",
  "confidence": 0.0,
  "display_text": "Waiting for hands...",
  "status": "waiting"
}
```

**Supported Actions:**
- English: `hello`, `thanks`, `iloveyou`
- Tagalog: `kamusta`, `salamat`, `mahal kita`

---

## Key Features

### 1. Learning Modules

**Structure:**
- Modules → Lessons → SubLessons
- Progress tracking at all levels
- Content types: content, practice, quiz, grammar-practice

**Features:**
- Markdown content rendering
- Video integration (YouTube embeds)
- Sign vocabulary with images
- Interactive quizzes
- Grammar practice exercises

### 2. Practice Games

**Camera-to-Sign**
- Real-time webcam integration
- Calls static signs or dynamic phrases API
- Visual feedback with confidence scores
- XP rewards for correct answers

**Text-to-Sign**
- Input text, view corresponding sign images
- Support for both ASL and FSL
- Character-by-character breakdown

**Audio-to-Sign**
- Offline speech recognition (Whisper)
- Converts spoken words to sign language
- Multi-language support

**Memory Game**
- Match sign images with labels
- Timed gameplay
- Score tracking

### 3. AI Conversation Practice

- AI-powered conversational practice
- Speech recognition integration
- Real-time feedback
- Context-aware responses

### 4. Gamification

**XP System:**
- Earn XP for completing lessons
- Earn XP for practice activities
- Track total XP in user profile

**Streaks:**
- Daily login streak tracking
- Visual streak indicators
- Motivation system

**Leaderboards:**
- Compare progress with other learners
- XP-based ranking
- Change indicators (↑/↓)

---

## Build & Deployment

### Development Build

```powershell
# Using dev scripts (recommended)
.\dev-start.ps1

# Manual
docker-compose -f docker-compose.dev.yaml up -d
cd ui && npm run dev
```

### Production Build

```powershell
# Build and start all services
cd app
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### UI Build Process

**Development:**
```powershell
cd app/ui
npm run dev
# Starts on http://localhost:3000
```

**Production:**
```powershell
cd app/ui
npm run build  # Creates optimized .next build
npm start      # Starts production server
```

### Docker Multi-Stage Build (UI)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Backend Dockerfile Optimization

Both backend services use optimized Dockerfiles that install large packages separately to handle network timeouts:

```dockerfile
# Static Signs Example (Python 3.10)
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install large packages separately with timeout
RUN pip install --no-cache-dir --timeout=1000 tensorflow==2.10.0
RUN pip install --no-cache-dir --timeout=1000 mediapipe==0.10.9
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .
EXPOSE 8000
CMD ["python", "simple_server.py"]
```

---

## Troubleshooting

### Common Issues

#### Port Conflicts

**Symptoms:** Services fail to start, "port already in use" errors

**Solution:**
```powershell
# Check what's using ports
netstat -ano | findstr ":3000"
netstat -ano | findstr ":8000"
netstat -ano | findstr ":5008"

# Stop conflicting services
docker-compose down
docker-compose -f docker-compose.dev.yaml down

# Kill specific process by PID (replace <PID>)
taskkill /PID <PID> /F
```

#### Container Name Conflicts

**Symptoms:** "container name already in use"

**Solution:**
```powershell
# Remove all Talk2DHand containers
docker rm -f $(docker ps -aq --filter "name=talk2dhand")

# Or remove specific container
docker rm -f talk2dhand-ui
docker rm -f talk2dhand-static-signs
docker rm -f talk2dhand-dynamic-phrases
```

#### Model Files Missing

**Symptoms:** Backend services fail to start, 404 errors on predictions

**Solution:**
```powershell
# Ensure model files exist
ls app/static-signs/hand_landmarks.h5
ls app/dynamic-phrases/action.h5

# If missing, models must be provided (not in repository)
```

#### Docker Not Running

**Symptoms:** "Cannot connect to Docker daemon"

**Solution:**
- Start Docker Desktop
- Check Docker service status
- Restart Docker if needed

#### UI Dependencies Issues

**Symptoms:** Module not found errors, build failures

**Solution:**
```powershell
cd app/ui
rm -rf node_modules
rm package-lock.json
npm install
```

#### Hot Reload Not Working

**Symptoms:** Code changes don't reflect in running services

**Solution:**

For backend:
```powershell
# Ensure using dev compose file
docker-compose -f docker-compose.dev.yaml up -d

# Rebuild if needed
docker-compose -f docker-compose.dev.yaml up --build
```

For frontend:
```powershell
# Restart dev server
# Ctrl+C to stop
npm run dev
```

#### TensorFlow/MediaPipe Errors

**Symptoms:** Import errors, model loading failures

**Solution:**
```powershell
# Rebuild containers with no cache
docker-compose build --no-cache static-signs
docker-compose build --no-cache dynamic-phrases
```

#### Pip Timeout During Build

**Symptoms:** `ReadTimeoutError: HTTPSConnectionPool(host='files.pythonhosted.org', port=443): Read timed out.`

This occurs when downloading large packages like TensorFlow or MediaPipe.

**Solution 1: Increase pip timeout**

Add timeout to pip install in Dockerfile:
```dockerfile
RUN pip install --no-cache-dir --timeout=1000 -r requirements.txt
```

**Solution 2: Install packages separately**

Modify Dockerfile to install large packages individually:
```dockerfile
# Install large packages first with longer timeout
RUN pip install --no-cache-dir --timeout=1000 tensorflow==2.15.0
RUN pip install --no-cache-dir --timeout=1000 mediapipe==0.10.9
RUN pip install --no-cache-dir -r requirements.txt
```

**Solution 3: Use Docker BuildKit with retry**

```powershell
# Enable BuildKit and retry failed builds
$env:DOCKER_BUILDKIT=1
docker-compose build --no-cache static-signs
```

**Solution 4: Check network/firewall**
- Ensure stable internet connection
- Check if corporate firewall is blocking PyPI
- Try using a VPN if behind restrictive network
- Temporarily disable antivirus during build

**Solution 5: Use pre-built base image**

Consider creating a base image with dependencies pre-installed:
```dockerfile
# Create base image (run once)
FROM python:3.10-slim AS base
RUN pip install --timeout=1000 tensorflow==2.15.0 mediapipe==0.10.9

# Use in main Dockerfile
FROM your-registry/talk2dhand-base:latest
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

### Performance Optimization

**Backend:**
- Adjust TensorFlow thread settings in code
- Use model quantization for smaller models
- Optimize MediaPipe detection confidence thresholds

**Frontend:**
- Use Next.js Image component for optimized images
- Implement lazy loading for heavy components
- Use dynamic imports for large libraries

**Docker:**
- Use `.dockerignore` to exclude unnecessary files
- Multi-stage builds to reduce image size
- Use specific base image versions

---

## Configuration Files

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./app/*"],
      "@/components/*": ["./components/*"],
      "@/store/*": ["./store/*"],
      "@/lib/*": ["./lib/*"]
    }
  }
}
```

### Next.js Configuration (next.config.ts)

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone", // For Docker
  images: {
    domains: ["localhost"],
  },
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig
```

### Biome Configuration (biome.json)

```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

---

## Security Considerations

### CORS Configuration

Both backend services enable CORS for cross-origin requests:

```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # Allow all origins
```

**Production Note:** Restrict CORS to specific origins:
```python
CORS(app, origins=["https://yourdomain.com"])
```

### Environment Variables

- Never commit `.env` files to repository
- Use `.env.local` for local development
- Use secrets management in production (e.g., Docker secrets, AWS Secrets Manager)

### Model Security

- Model files (`*.h5`) are not version controlled (too large)
- Store models securely, transfer via secure channels
- Validate model integrity before deployment

---

## Performance Metrics

### Expected Response Times

| Service | Endpoint | Expected Time |
|---------|----------|---------------|
| Static Signs | `/predict` | 50-200ms |
| Dynamic Phrases | `/predict` | 100-300ms |
| UI (SSR) | Page load | < 1s |

### Resource Usage

| Service | Memory | CPU |
|---------|--------|-----|
| Static Signs | ~500MB | Low (inference) |
| Dynamic Phrases | ~800MB | Medium (sequence processing) |
| UI | ~200MB | Low |

---

## Future Enhancements

### Planned Features

1. **User Authentication**
   - Firebase or Auth0 integration
   - Persistent user profiles
   - Cloud-synced progress

2. **Real-time Multiplayer**
   - WebSocket-based multiplayer games
   - Live leaderboard updates
   - Friend challenges

3. **Advanced AI Features**
   - GPT-powered conversation scenarios
   - Personalized learning paths
   - Adaptive difficulty

4. **Mobile Application**
   - React Native port
   - Native camera integration
   - Offline-first architecture

5. **Enhanced Analytics**
   - Learning progress analytics
   - Time-on-task tracking
   - Predictive difficulty adjustment

---

## Developer Resources

### Useful Commands

```powershell
# Docker
docker-compose ps                          # List running services
docker-compose logs -f <service>          # Follow logs
docker-compose restart <service>          # Restart service
docker-compose exec <service> /bin/bash   # Shell into container
docker system prune -a                    # Clean up Docker

# NPM
npm run dev                               # Start dev server
npm run build                             # Build production
npm run start                             # Start production server
npm run lint                              # Run linter

# Git
git status                                # Check status
git checkout -b feature/new-feature       # New branch
git add .                                 # Stage changes
git commit -m "message"                   # Commit
git push origin branch-name               # Push to remote
```

### Documentation Links

- **Next.js 15:** https://nextjs.org/docs
- **React 19:** https://react.dev
- **TensorFlow:** https://tensorflow.org
- **MediaPipe:** https://mediapipe.dev
- **Flask:** https://flask.palletsprojects.com
- **Docker:** https://docs.docker.com
- **Zustand:** https://zustand-demo.pmnd.rs

---

## Glossary

| Term | Definition |
|------|------------|
| **ASL** | American Sign Language |
| **FSL** | Filipino Sign Language |
| **XP** | Experience Points (gamification metric) |
| **Streak** | Consecutive days of activity |
| **Module** | Top-level learning unit containing multiple lessons |
| **Lesson** | Mid-level learning unit containing sub-lessons |
| **SubLesson** | Atomic learning unit (content, quiz, practice) |
| **Static Sign** | Fingerspelling or stationary hand shape (A-Z, 0-9) |
| **Dynamic Sign** | Movement-based sign language phrase |
| **MediaPipe** | Google's ML framework for pose/hand detection |
| **Holistic** | MediaPipe model detecting pose, face, and hands |
| **Landmarks** | Detected keypoints (e.g., 21 hand landmarks) |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | Nov 12, 2025 | Refactored backend, improved Docker setup, added dev scripts |
| 2.x | - | Previous architecture |
| 1.x | - | Initial implementation |

---

## Contact & Support

**Repository:** [github.com/neinzaut/talk2dhand-v3](https://github.com/neinzaut/talk2dhand-v3)  
**Branch:** refactor/backend  
**Issues:** Report bugs and feature requests via GitHub Issues

---

**Last Updated:** November 12, 2025  
**Maintained by:** Development Team
