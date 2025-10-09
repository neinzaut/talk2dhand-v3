// Type definitions for the app store

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

export interface LanguageData {
  modules: Module[]
  leaderboard: LeaderboardEntry[]
}

export interface AppState {
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

