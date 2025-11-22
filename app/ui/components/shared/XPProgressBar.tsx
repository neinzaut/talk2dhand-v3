"use client"

import { useEffect, useState } from "react"

interface XPProgressBarProps {
  currentXP: number
  maxXP: number
  level: number
  animated?: boolean
  height?: string
  showPercentage?: boolean
}

export function XPProgressBar({
  currentXP,
  maxXP,
  level,
  animated = true,
  height = "h-3",
  showPercentage = false,
}: XPProgressBarProps) {
  const [displayXP, setDisplayXP] = useState(animated ? 0 : currentXP)
  
  // Calculate percentage, capping at 100%
  const percentage = Math.min(Math.round((currentXP / maxXP) * 100), 100)
  const displayPercentage = Math.min(Math.round((displayXP / maxXP) * 100), 100)

  useEffect(() => {
    if (animated) {
      // Animate from 0 to currentXP over 0.8s
      const duration = 800
      const startTime = Date.now()
      const startXP = displayXP

      const animate = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease-out cubic easing
        const eased = 1 - Math.pow(1 - progress, 3)
        const newXP = startXP + (currentXP - startXP) * eased

        setDisplayXP(newXP)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    } else {
      setDisplayXP(currentXP)
    }
  }, [currentXP, animated])

  return (
    <div className="w-full">
      <div className={`relative ${height} w-full overflow-hidden rounded-full bg-gray-200`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 ease-out"
          style={{ width: `${displayPercentage}%` }}
        >
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
      {showPercentage && (
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {Math.round(displayXP)} / {maxXP} XP ({displayPercentage}%)
        </div>
      )}
    </div>
  )
}
