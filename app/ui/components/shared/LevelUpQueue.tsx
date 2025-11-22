"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/store/app-store"
import { LevelUpModal } from "./LevelUpModal"

export function LevelUpQueue() {
  const { levelUpQueue, dequeueLevelUpNotification, xpNotificationQueue } = useAppStore()
  const [currentLevelUp, setCurrentLevelUp] = useState<{
    newLevel: number
    timestamp: number
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // If we're not processing and there are level-ups in the queue
    // Level-up interrupts XP notifications, so we don't need to wait
    if (!isProcessing && levelUpQueue.length > 0 && !currentLevelUp) {
      setIsProcessing(true)
      setCurrentLevelUp(levelUpQueue[0])
    }
  }, [levelUpQueue, isProcessing, currentLevelUp])

  const handleComplete = () => {
    // Dequeue the level-up notification
    dequeueLevelUpNotification()
    setCurrentLevelUp(null)

    // Wait a bit before processing next level-up (if any)
    setTimeout(() => {
      setIsProcessing(false)
    }, 300)
  }

  if (!currentLevelUp) {
    return null
  }

  return <LevelUpModal level={currentLevelUp.newLevel} onComplete={handleComplete} />
}
