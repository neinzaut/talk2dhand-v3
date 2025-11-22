import { create } from "zustand"
import type { AppState } from "./types"
import { aslData } from "./data/asl-data"
import { fslData } from "./data/fsl-data"

export * from "./types"

// Level thresholds
const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, maxXP: 100 },
  { level: 2, minXP: 100, maxXP: 300 },
  { level: 3, minXP: 300, maxXP: Infinity },
]

const calculateLevelInfo = (totalXP: number) => {
  let level = 1
  let currentLevelXP = totalXP
  let xpToNextLevel = 100

  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXP >= threshold.minXP && totalXP < threshold.maxXP) {
      level = threshold.level
      currentLevelXP = totalXP - threshold.minXP
      xpToNextLevel = threshold.maxXP === Infinity ? 0 : threshold.maxXP - totalXP
      break
    } else if (totalXP >= threshold.maxXP && threshold.maxXP !== Infinity) {
      level = threshold.level
      currentLevelXP = threshold.maxXP - threshold.minXP
      xpToNextLevel = 0
    }
  }

  return { level, currentLevelXP, xpToNextLevel }
}

export const useAppStore = create<AppState>((set, get) => ({
  streak: 5,
  totalXP: 300,
  currentLanguage: "asl",
  currentLessonId: "lesson-2",
  
  // Language-specific XP and levels
  aslXP: 0,
  aslLevel: 1,
  aslCurrentLevelXP: 0,
  aslXpToNextLevel: 100,
  fslXP: 0,
  fslLevel: 1,
  fslCurrentLevelXP: 0,
  fslXpToNextLevel: 100,
  
  // Gamification
  isStreakActive: false,
  badges: [],
  xpNotificationQueue: [],
  levelUpQueue: [],
  badgeNotificationQueue: [],
  
  languageData: {
    asl: aslData,
    fsl: fslData,
  },

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  
  addXP: (amount) => {
    const state = get()
    const isFirstXP = !state.isStreakActive && (state.aslXP === 0 && state.fslXP === 0)
    const currentLang = state.currentLanguage
    
    // Determine which language's XP to update
    const xpKey = currentLang === "asl" ? "aslXP" : "fslXP"
    const levelKey = currentLang === "asl" ? "aslLevel" : "fslLevel"
    const currentLevelXPKey = currentLang === "asl" ? "aslCurrentLevelXP" : "fslCurrentLevelXP"
    const xpToNextLevelKey = currentLang === "asl" ? "aslXpToNextLevel" : "fslXpToNextLevel"
    
    const oldXP = state[xpKey]
    const oldLevel = state[levelKey]
    const newXP = oldXP + amount
    
    const { level: newLevel, currentLevelXP, xpToNextLevel } = calculateLevelInfo(newXP)
    
    // Check if level changed
    const leveledUp = newLevel > oldLevel
    const levelsGained: number[] = []
    
    if (leveledUp) {
      for (let i = oldLevel + 1; i <= newLevel; i++) {
        levelsGained.push(i)
      }
    }
    
    set((state) => ({
      [xpKey]: newXP,
      [levelKey]: newLevel,
      [currentLevelXPKey]: currentLevelXP,
      [xpToNextLevelKey]: xpToNextLevel,
      totalXP: state.totalXP + amount,
      isStreakActive: isFirstXP || state.isStreakActive,
      xpNotificationQueue: leveledUp 
        ? [] // Clear XP queue when leveling up
        : [...state.xpNotificationQueue, { amount, timestamp: Date.now() }],
      levelUpQueue: leveledUp
        ? [...state.levelUpQueue, ...levelsGained.map(lvl => ({ newLevel: lvl, timestamp: Date.now() }))]
        : state.levelUpQueue,
    }))
  },
  
  awardBadge: (badge) => {
    const state = get()
    
    // Check for duplicates
    const exists = state.badges.some(
      (b) => b.moduleId === badge.moduleId && b.languageCode === badge.languageCode
    )
    
    if (!exists) {
      set((state) => ({
        badges: [...state.badges, { ...badge, earnedAt: Date.now() }],
        badgeNotificationQueue: [...state.badgeNotificationQueue, badge],
      }))
    }
  },
  
  dequeueXPNotification: () => {
    set((state) => ({
      xpNotificationQueue: state.xpNotificationQueue.slice(1),
    }))
  },
  
  dequeueLevelUpNotification: () => {
    set((state) => ({
      levelUpQueue: state.levelUpQueue.slice(1),
    }))
  },
  
  dequeueBadgeNotification: () => {
    set((state) => ({
      badgeNotificationQueue: state.badgeNotificationQueue.slice(1),
    }))
  },
  
  getCurrentLanguageStats: () => {
    const state = get()
    const lang = state.currentLanguage
    
    if (lang === "asl") {
      return {
        xp: state.aslXP,
        level: state.aslLevel,
        currentLevelXP: state.aslCurrentLevelXP,
        xpToNextLevel: state.aslXpToNextLevel,
      }
    } else {
      return {
        xp: state.fslXP,
        level: state.fslLevel,
        currentLevelXP: state.fslCurrentLevelXP,
        xpToNextLevel: state.fslXpToNextLevel,
      }
    }
  },
  
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

  completeSubLesson: (lessonId, subLessonId) => {
    set((state) => {
      const newLanguageData = { ...state.languageData }
      const modules = newLanguageData[state.currentLanguage].modules

      for (const module of modules) {
        const lesson = module.lessons.find((l) => l.id === lessonId)
        if (lesson) {
          const subLesson = lesson.subLessons.find((sl) => sl.id === subLessonId)
          if (subLesson) {
            subLesson.completed = true

            // Calculate lesson progress based on completed sublessons
            const completedSubLessons = lesson.subLessons.filter((sl) => sl.completed).length
            const totalSubLessons = lesson.subLessons.length
            lesson.progress = Math.round((completedSubLessons / totalSubLessons) * 100)
            lesson.completed = lesson.progress === 100
            
            // Calculate module progress based on completed lessons
            const completedLessons = module.lessons.filter((l) => l.completed).length
            const totalLessons = module.lessons.length
            const oldModuleProgress = module.progress
            const newModuleProgress = Math.round((completedLessons / totalLessons) * 100)
            module.progress = newModuleProgress
            
            // Check if module just reached 100%
            if (oldModuleProgress < 100 && newModuleProgress === 100) {
              // Award bonus XP and badge for module completion
              setTimeout(() => {
                const currentState = get()
                currentState.addXP(100)
                
                // Import and award badge
                import("./data/badges").then(({ createModuleBadge }) => {
                  const badge = createModuleBadge(module.id, state.currentLanguage, module.title)
                  get().awardBadge(badge)
                })
              }, 100)
            }
          }
          break
        }
      }

      return { languageData: newLanguageData }
    })
  },

  getSubLessonById: (lessonId, subLessonId) => {
    const state = get()
    const modules = state.languageData[state.currentLanguage].modules

    for (const module of modules) {
      const lesson = module.lessons.find((l) => l.id === lessonId)
      if (lesson) {
        const subLesson = lesson.subLessons.find((sl) => sl.id === subLessonId)
        return subLesson || null
      }
    }
    return null
  },
}))
