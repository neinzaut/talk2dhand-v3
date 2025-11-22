"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/store/app-store"
import { XPGainPopup } from "./XPGainPopup"

export function XPNotificationQueue() {
  const { xpNotificationQueue, dequeueXPNotification } = useAppStore()
  const [currentNotification, setCurrentNotification] = useState<{
    amount: number
    timestamp: number
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // If we're not processing and there are notifications in the queue
    if (!isProcessing && xpNotificationQueue.length > 0 && !currentNotification) {
      setIsProcessing(true)
      setCurrentNotification(xpNotificationQueue[0])
    }
  }, [xpNotificationQueue, isProcessing, currentNotification])

  const handleComplete = () => {
    // Dequeue the notification
    dequeueXPNotification()
    setCurrentNotification(null)

    // Wait 0.5s before processing next notification
    setTimeout(() => {
      setIsProcessing(false)
    }, 500)
  }

  if (!currentNotification) {
    return null
  }

  return <XPGainPopup amount={currentNotification.amount} onComplete={handleComplete} />
}
