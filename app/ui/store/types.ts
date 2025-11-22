// Type definitions for the app store

export type Language = "asl" | "fsl"

export interface Sign {
  id: string
  label: string
  imageUrl: string
}

export type SubLessonType = "content" | "practice" | "quiz" | "grammar-practice"

export interface SubLesson {
  id: string
  type: SubLessonType
  title: string
  completed: boolean
  content?: string // Markdown content for 'content' type
  videos?: { label: string; youtubeId?: string; url?: string }[]
}

export interface Lesson {
  id: string
  title: string
  subtitle: string
  icon: string
  thumbnail?: string
  completed: boolean
  progress: number
  signs: Sign[]
  subLessons: SubLesson[]
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

export interface Badge {
  id: string
  moduleId: string
  languageCode: Language
  name: string
  description: string
  icon: string
  earnedAt: number
}

export interface XPNotification {
  amount: number
  timestamp: number
}

export interface LevelUpNotification {
  newLevel: number
  timestamp: number
}

export interface AppState {
  // User data
  streak: number
  totalXP: number
  currentLanguage: Language
  currentLessonId: string
  
  // Language-specific XP and levels
  aslXP: number
  aslLevel: number
  aslCurrentLevelXP: number
  aslXpToNextLevel: number
  fslXP: number
  fslLevel: number
  fslCurrentLevelXP: number
  fslXpToNextLevel: number
  
  // Gamification
  isStreakActive: boolean
  badges: Badge[]
  xpNotificationQueue: XPNotification[]
  levelUpQueue: LevelUpNotification[]
  badgeNotificationQueue: Badge[]

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
  completeSubLesson: (lessonId: string, subLessonId: string) => void
  getSubLessonById: (lessonId: string, subLessonId: string) => SubLesson | null
  awardBadge: (badge: Badge) => void
  dequeueXPNotification: () => void
  dequeueLevelUpNotification: () => void
  dequeueBadgeNotification: () => void
  getCurrentLanguageStats: () => {
    xp: number
    level: number
    currentLevelXP: number
    xpToNextLevel: number
  }
}

