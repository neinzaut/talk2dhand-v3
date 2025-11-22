"use client"

import { useEffect, useState } from "react"

interface XPGainPopupProps {
  amount: number
  onComplete: () => void
}

export function XPGainPopup({ amount, onComplete }: XPGainPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true)

    // Auto-dismiss after 1.5s
    const timer = setTimeout(() => {
      setIsVisible(false)
      // Wait for exit animation before calling onComplete
      setTimeout(onComplete, 300)
    }, 1500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 transform transition-all duration-500 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 opacity-0"
      }`}
    >
      <div className="rounded-lg bg-blue-600 px-6 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-semibold text-white">+{amount}</span>
          <span className="text-lg text-white">XP</span>
        </div>
      </div>
    </div>
  )
}
