import { create } from "zustand"

export type Language = "asl" | "fsl"

export interface Sign {
  id: string
  label: string
  imageUrl: string
}

export interface Lesson {
  id: string
  title: string
  subtitle: string
  icon: string
  completed: boolean
  progress: number
  signs: Sign[]
}

export interface Module {
  id: string
  title: string
  description: string
  progress: number
  lessons: Lesson[]
}

export interface LeaderboardEntry {
  id: string
  name: string
  xp: number
  change: number
}

interface LanguageData {
  modules: Module[]
  leaderboard: LeaderboardEntry[]
}

interface AppState {
  // User data
  streak: number
  totalXP: number
  currentLanguage: Language
  currentLessonId: string | null

  // Language-specific data
  languageData: Record<Language, LanguageData>

  // Actions
  incrementStreak: () => void
  addXP: (amount: number) => void
  setLanguage: (language: Language) => void
  getCurrentModules: () => Module[]
  getCurrentLeaderboard: () => LeaderboardEntry[]
  setCurrentLesson: (lessonId: string) => void
  getCurrentLesson: () => Lesson | null
  updateLessonProgress: (lessonId: string, progress: number) => void
  completeLesson: (lessonId: string) => void
}

const mockDataASL: LanguageData = {
  modules: [
    {
      id: "module-1",
      title: "Module 1",
      description: "Basics of American Sign Language",
      progress: 40,
      lessons: [
        {
          id: "lesson-1",
          title: "Lesson 1: Alphabets",
          subtitle: "Learn how to sign letters!",
          icon: "aα\naA",
          completed: true,
          progress: 100,
          signs: [
            { id: "a", label: "A", imageUrl: "/asl-letter-a-hand-sign.jpg" },
            { id: "b", label: "B", imageUrl: "/asl-letter-b-hand-sign.jpg" },
            { id: "c", label: "C", imageUrl: "/asl-letter-c-hand-sign.jpg" },
          ],
        },
        {
          id: "lesson-2",
          title: "Lesson 2: Numbers",
          subtitle: "Learn how to sign numbers!",
          icon: "1️⃣2️⃣\n3️⃣4️⃣",
          completed: false,
          progress: 60,
          signs: [
            { id: "0", label: "0", imageUrl: "/asl-number-0-hand-sign.jpg" },
            { id: "1", label: "1", imageUrl: "/asl-number-1-hand-sign.jpg" },
            { id: "2", label: "2", imageUrl: "/asl-number-2-hand-sign.jpg" },
            { id: "3", label: "3", imageUrl: "/asl-number-3-hand-sign.jpg" },
            { id: "4", label: "4", imageUrl: "/asl-number-4-hand-sign.jpg" },
            { id: "5", label: "5", imageUrl: "/asl-number-5-hand-sign.jpg" },
            { id: "6", label: "6", imageUrl: "/asl-number-6-hand-sign.jpg" },
            { id: "7", label: "7", imageUrl: "/asl-number-7-hand-sign.jpg" },
            { id: "8", label: "8", imageUrl: "/asl-number-8-hand-sign.jpg" },
            { id: "9", label: "9", imageUrl: "/asl-number-9-hand-sign.jpg" },
            { id: "10", label: "10", imageUrl: "/asl-number-10-hand-sign.jpg" },
          ],
        },
        {
          id: "lesson-3",
          title: "Lesson 3: Phrases",
          subtitle: "Learn how to sign words or phrases!",
          icon: "❓",
          completed: false,
          progress: 0,
          signs: [],
        },
        {
          id: "lesson-4",
          title: "Lesson 4: Grammar",
          subtitle: "Learn grammar and syntax in sign!",
          icon: "📝",
          completed: false,
          progress: 0,
          signs: [],
        },
      ],
    },
  ],
  leaderboard: [
    { id: "1", name: "Juju Dunca", xp: 2855, change: 3 },
    { id: "2", name: "Juju Dunca", xp: 2855, change: -3 },
    { id: "3", name: "Juju Dunca", xp: 2855, change: 3 },
    { id: "4", name: "Juju Dunca", xp: 2855, change: 3 },
    { id: "5", name: "Juju Dunca", xp: 2855, change: -3 },
    { id: "6", name: "Juju Dunca", xp: 2855, change: 3 },
    { id: "7", name: "Juju Dunca", xp: 2855, change: 3 },
  ],
}

const mockDataFSL: LanguageData = {
  modules: [
    {
      id: "module-1",
      title: "Module 1",
      description: "Basics of Filipino Sign Language",
      progress: 25,
      lessons: [
        {
          id: "lesson-1",
          title: "Lesson 1: Alpabeto",
          subtitle: "Matuto kung paano mag-sign ng mga titik!",
          icon: "aα\naA",
          completed: true,
          progress: 100,
          signs: [],
        },
        {
          id: "lesson-2",
          title: "Lesson 2: Mga Numero",
          subtitle: "Matuto kung paano mag-sign ng mga numero!",
          icon: "1️⃣2️⃣\n3️⃣4️⃣",
          completed: false,
          progress: 25,
          signs: [],
        },
        {
          id: "lesson-3",
          title: "Lesson 3: Mga Parirala",
          subtitle: "Matuto kung paano mag-sign ng mga salita!",
          icon: "❓",
          completed: false,
          progress: 0,
          signs: [],
        },
        {
          id: "lesson-4",
          title: "Lesson 4: Gramatika",
          subtitle: "Matuto ng gramatika sa sign language!",
          icon: "📝",
          completed: false,
          progress: 0,
          signs: [],
        },
      ],
    },
  ],
  leaderboard: [
    { id: "1", name: "Maria Santos", xp: 3200, change: 5 },
    { id: "2", name: "Juan Cruz", xp: 2950, change: 2 },
    { id: "3", name: "Ana Reyes", xp: 2800, change: -1 },
    { id: "4", name: "Pedro Garcia", xp: 2650, change: 4 },
    { id: "5", name: "Sofia Ramos", xp: 2500, change: 3 },
    { id: "6", name: "Miguel Torres", xp: 2400, change: -2 },
    { id: "7", name: "Isabella Lopez", xp: 2300, change: 1 },
  ],
}

export const useAppStore = create<AppState>((set, get) => ({
  streak: 5,
  totalXP: 300,
  currentLanguage: "asl",
  currentLessonId: "lesson-2",
  languageData: {
    asl: mockDataASL,
    fsl: mockDataFSL,
  },

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),
  setLanguage: (language) => set({ currentLanguage: language }),

  getCurrentModules: () => {
    const state = get()
    return state.languageData[state.currentLanguage].modules
  },

  getCurrentLeaderboard: () => {
    const state = get()
    return state.languageData[state.currentLanguage].leaderboard
  },

  setCurrentLesson: (lessonId) => set({ currentLessonId: lessonId }),

  getCurrentLesson: () => {
    const state = get()
    const modules = state.languageData[state.currentLanguage].modules
    for (const module of modules) {
      const lesson = module.lessons.find((l) => l.id === state.currentLessonId)
      if (lesson) return lesson
    }
    return null
  },

  updateLessonProgress: (lessonId, progress) => {
    set((state) => {
      const newLanguageData = { ...state.languageData }
      const modules = newLanguageData[state.currentLanguage].modules

      for (const module of modules) {
        const lesson = module.lessons.find((l) => l.id === lessonId)
        if (lesson) {
          lesson.progress = progress
          break
        }
      }

      return { languageData: newLanguageData }
    })
  },

  completeLesson: (lessonId) => {
    set((state) => {
      const newLanguageData = { ...state.languageData }
      const modules = newLanguageData[state.currentLanguage].modules

      for (const module of modules) {
        const lesson = module.lessons.find((l) => l.id === lessonId)
        if (lesson) {
          lesson.completed = true
          lesson.progress = 100
          break
        }
      }

      return { languageData: newLanguageData }
    })
  },
}))
