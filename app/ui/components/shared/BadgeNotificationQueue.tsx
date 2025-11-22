"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/store/app-store"
import { BadgeEarnedModal } from "./BadgeEarnedModal"
import type { Badge } from "@/store/types"

export function BadgeNotificationQueue() {
  const {
    badgeNotificationQueue,
    dequeueBadgeNotification,
    xpNotificationQueue,
    levelUpQueue,
  } = useAppStore()
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Only process badge notifications after XP and level-up queues are empty
    const shouldProcess =
      !isProcessing &&
      badgeNotificationQueue.length > 0 &&
      !currentBadge &&
      xpNotificationQueue.length === 0 &&
      levelUpQueue.length === 0

    if (shouldProcess) {
      setIsProcessing(true)
      setCurrentBadge(badgeNotificationQueue[0])
    }
  }, [
    badgeNotificationQueue,
    isProcessing,
    currentBadge,
    xpNotificationQueue,
    levelUpQueue,
  ])

  const handleComplete = () => {
    // Dequeue the badge notification
    dequeueBadgeNotification()
    setCurrentBadge(null)

    // Wait a bit before processing next badge (if any)
    setTimeout(() => {
      setIsProcessing(false)
    }, 500)
  }

  if (!currentBadge) {
    return null
  }

  return <BadgeEarnedModal badge={currentBadge} onComplete={handleComplete} />
}
