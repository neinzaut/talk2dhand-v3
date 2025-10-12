import { create } from "zustand"
import type { AppState } from "./types"
import { aslData } from "./data/asl-data"
import { fslData } from "./data/fsl-data"

export * from "./types"

export const useAppStore = create<AppState>((set, get) => ({
  streak: 5,
  totalXP: 300,
  currentLanguage: "asl",
  currentLessonId: "lesson-2",
  languageData: {
    asl: aslData,
    fsl: fslData,
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
