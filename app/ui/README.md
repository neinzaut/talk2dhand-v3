# Talk2DHand UI (Frontend)

A Next.js 15 application for learning sign language with gamification features.

## Architecture

### Directory Structure

```
app/ui/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with sidebar & header
│   ├── page.tsx           # Home page (redirects to /learn)
│   ├── learn/             # Learn module pages
│   │   ├── page.tsx       # Main learning dashboard
│   │   ├── modules/[moduleId]/page.tsx
│   │   └── lessons/[lessonId]/page.tsx
│   ├── practice/          # Practice exercises
│   │   └── page.tsx
│   ├── ai-converse/       # AI conversation practice (legacy)
│   │   └── page.tsx
│   ├── ai-converse-translate/ # AI conversation with Gemini (new)
│   │   └── page.tsx
│   └── globals.css        # Global styles with Tailwind
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   ├── avatar.tsx
│   │   ├── dialog.tsx
│   │   └── dropdown-menu.tsx
│   ├── app-sidebar.tsx   # Navigation sidebar
│   ├── app-header.tsx    # Top header with streak & language selector
│   ├── daily-quest-card.tsx
│   ├── leaderboard-card.tsx
│   └── how-to-use-modal.tsx
├── store/                # Zustand state management
│   ├── app-store.ts      # Main app state (lessons, modules, leaderboard)
│   └── user-store.ts     # User-specific state
├── lib/                  # Utilities
│   └── utils.ts          # cn() utility for class merging
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── next-env.d.ts         # Next.js TypeScript declarations

```

## Page Rendering & Data Flow

### Root Layout (`app/layout.tsx`)

**Purpose**: Wraps all pages with persistent UI elements

**No Props** - Server Component

**Renders**:
- `<AppSidebar />` - Fixed left navigation
- `<AppHeader />` - Fixed top header
- `{children}` - Page content (wrapped in Suspense)

**Features**:
- Geist Sans & Mono fonts
- Vercel Analytics
- Global CSS with Tailwind v4

---

### Home Page (`app/page.tsx`)

**Purpose**: Entry point that redirects to main dashboard

**No Props** - Server Component

**Behavior**: Immediately redirects to `/learn`

---

### Learn Page (`app/learn/page.tsx`)

**Purpose**: Main learning dashboard

**No Props** - Client Component (`"use client"`)

**State from Zustand Store**:
```typescript
const { 
  streak,           // number - Current streak count
  totalXP,          // number - Total experience points
  getCurrentModules,     // () => Module[] - Get modules for current language
  getCurrentLeaderboard, // () => LeaderboardEntry[] - Get leaderboard
  getCurrentLesson       // () => Lesson | null - Get current lesson
} = useAppStore()
```

**Props Passed to Child Components**:

1. **`<DailyQuestCard />`**
   ```typescript
   {
     streak: number,    // Current streak (e.g., 5)
     totalXP: number    // Total XP (e.g., 300)
   }
   ```

2. **`<LeaderboardCard />`**
   ```typescript
   {
     leaderboard: LeaderboardEntry[]  // Array of leaderboard entries
   }
   ```
   Where `LeaderboardEntry`:
   ```typescript
   {
     id: string,
     name: string,
     xp: number,
     change: number  // Position change (+/-)
   }
   ```

**Displays**:
- Current lesson progress card (if lesson exists)
- "Already know this?" test card
- Action cards (AI Converse, Daily Practice)
- Module progress with lesson list
- Daily Quest sidebar
- Leaderboard sidebar

---

### App Header (`components/app-header.tsx`)

**No Props** - Client Component

**State from Zustand Store**:
```typescript
const { 
  streak,              // number - Display in header
  currentLanguage,     // Language - "asl" | "fsl"
  setLanguage          // (lang: Language) => void - Switch language
} = useAppStore()
```

**Features**:
- Streak counter with flame icon
- Language dropdown selector (ASL 🇺🇸 / FSL 🇵🇭)
- User avatar (hardcoded "JD")

---

### App Sidebar (`components/app-sidebar.tsx`)

**No Props** - Client Component

**Uses Next.js Router**:
```typescript
const pathname = usePathname()  // Get current route for active state
```

**Navigation Items**:
```typescript
[
  { name: "Learn", href: "/learn", icon: GraduationCap },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "AI Converse", href: "/ai-converse", icon: MessageSquare }
]
```

**Features**:
- Active route highlighting
- Fixed left sidebar (240px width)
- Logo: "Talk 👌 Hand"

---

### Practice Page (`app/practice/page.tsx`)

**No Props** - Server Component

**Status**: Placeholder page

**Displays**: Title and description only

---

### AI Converse Page (`app/ai-converse/page.tsx`)

**No Props** - Client Component (`"use client"`)

**Purpose**: Real-time sign language recognition with AI-powered conversational responses

**Features**:
- Live camera feed for sign language input
- Real-time sign recognition using ISLR model (via Dynamic Phrases API)
- AI-powered conversational responses in ASL gloss format (Gemini 2.0 Flash)
- Conversation history with timestamps and confidence scores
- Offline sign recognition; online AI responses
- Stick figure avatar for visualizing AI responses
- Dual language support (ASL/FSL)

**Backend Integration**:
- Sign Recognition: `POST http://localhost:5008/predict`
- AI Responses: `POST http://localhost:8100/infer` (via Next.js API route)

**State Management**:
- LocalStorage for conversation history persistence
- Real-time camera and MediaPipe processing
- Network status detection for online/offline features

---

## State Management (Zustand)

### App Store (`store/app-store.ts`)

**Primary store for application state**

**State**:
```typescript
{
  streak: number                    // User's current streak
  totalXP: number                   // Total experience points
  currentLanguage: "asl" | "fsl"    // Selected language
  currentLessonId: string | null    // ID of current lesson
  languageData: {                   // Separate data per language
    asl: { modules, leaderboard },
    fsl: { modules, leaderboard }
  }
}
```

**Actions**:
- `incrementStreak()` - Increase streak by 1
- `addXP(amount)` - Add XP
- `setLanguage(language)` - Switch language
- `getCurrentModules()` - Get modules for current language
- `getCurrentLeaderboard()` - Get leaderboard for current language
- `setCurrentLesson(lessonId)` - Set active lesson
- `getCurrentLesson()` - Get current lesson object
- `updateLessonProgress(lessonId, progress)` - Update lesson progress %
- `completeLesson(lessonId)` - Mark lesson as completed

**Data Models**:
```typescript
Module {
  id: string
  title: string
  description: string
  progress: number        // 0-100
  lessons: Lesson[]
}

Lesson {
  id: string
  title: string
  subtitle: string
  icon: string           // Emoji or text icon
  completed: boolean
  progress: number       // 0-100
  signs: Sign[]
}

Sign {
  id: string
  label: string
  imageUrl: string
}

LeaderboardEntry {
  id: string
  name: string
  xp: number
  change: number        // Position change
}
```

### User Store (`store/user-store.ts`)

**Status**: Legacy/unused (data moved to app-store)

---

## Component Props Reference

### UI Components (shadcn/ui style)

All UI components accept standard HTML attributes plus `className` for styling:

**`<Button />`**
```typescript
{
  variant?: "default" | "outline" | "link"
  size?: "default" | "sm" | "lg"
  className?: string
  ...buttonProps
}
```

**`<Card />`, `<CardHeader />`, `<CardTitle />`, `<CardContent />`, `<CardFooter />`**
```typescript
{
  className?: string
  ...divProps  // or headingProps for CardTitle
}
```

**`<Progress />`**
```typescript
{
  value: number        // 0-100
  className?: string
}
```

**`<Avatar />`, `<AvatarImage />`, `<AvatarFallback />`**
```typescript
{
  className?: string
  ...divProps
}
```

**`<DropdownMenu />`, `<DropdownMenuTrigger />`, `<DropdownMenuContent />`, `<DropdownMenuItem />`**
- Uses Radix UI primitives
- No required props, accepts standard HTML attributes

**`<Dialog />`, `<DialogContent />`, `<DialogHeader />`, `<DialogTitle />`, `<DialogDescription />`**
- Uses Radix UI primitives
- No required props, accepts standard HTML attributes

---

## Styling

**Framework**: Tailwind CSS v4 with `@tailwindcss/postcss`

**Theme**: Uses CSS variables for colors (defined in `globals.css`)
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--muted`, `--muted-foreground`
- `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`

**Utility**: `cn()` function merges Tailwind classes intelligently (handles conflicts)

---

## TypeScript Configuration

**Path Aliases** (defined in `tsconfig.json`):
```typescript
"@/*"           -> "./*"
"@/components/*" -> "./components/*"
"@/store/*"     -> "./store/*"
"@/lib/*"       -> "./lib/*"
```

**Example Import**:
```typescript
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/app-store"
import { cn } from "@/lib/utils"
```

---

## Running the App

From the **project root** (`talk2dhand-v3/`):

```bash
npm run dev    # Runs: cd app/ui && next dev
npm run build  # Runs: cd app/ui && next build
npm run start  # Runs: cd app/ui && next start
```

The app runs on `http://localhost:3000`

---

## Key Features

1. **Multi-language Support**: Switch between ASL and FSL with separate content
2. **Gamification**: Streaks, XP, leaderboards
3. **Progress Tracking**: Module and lesson completion tracking
4. **Responsive Layout**: Fixed sidebar (240px) + header (64px) + main content
5. **Type Safety**: Full TypeScript with strict mode
6. **Modern Stack**: Next.js 15, React 19, Tailwind v4, Zustand

---

## Future Integration Points

Pages marked as placeholders ready for backend integration:
- `/practice` - Connect to practice exercise API
- `/ai-converse` - Connect to AI conversation API
- `/learn/lessons/[lessonId]` - Connect to sign recognition backend
- `/learn/modules/[moduleId]` - Full module view

Backend services expected at:
- `app/static-signs/` - Static sign recognition service
- `app/dynamic-signs/` - Dynamic sign recognition service
