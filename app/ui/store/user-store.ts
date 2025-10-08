"use client"

import { create } from "zustand"

interface UserState {
  streak: number
  totalXP: number
  currentLesson: string
  incrementStreak: () => void
  addXP: (amount: number) => void
}

export const useUserStore = create<UserState>((set) => ({
  streak: 5,
  totalXP: 300,
  currentLesson: "Lesson 1",
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),
}))
