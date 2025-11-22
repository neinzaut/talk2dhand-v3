"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

interface LevelUpModalProps {
  level: number
  onComplete: () => void
}

export function LevelUpModal({ level, onComplete }: LevelUpModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)

    // Auto-dismiss after 3s
    const timer = setTimeout(() => {
      setIsVisible(false)
      // Wait for exit animation before calling onComplete
      setTimeout(onComplete, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative transform rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 shadow-2xl transition-all duration-500 ${
          isVisible ? "scale-100 rotate-0" : "scale-50 rotate-12"
        }`}
      >
        <div className="rounded-3xl bg-white px-16 py-12">
          <div className="flex flex-col items-center gap-6">
            {/* Sparkles icon */}
            <div className="relative">
              <Sparkles className="h-20 w-20 text-orange-500 animate-pulse" />
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="h-20 w-20 text-orange-300 opacity-75" />
              </div>
            </div>

            {/* Level up text */}
            <div className="text-center">
              <h2 className="mb-2 text-4xl font-bold text-gray-900">
                Level Up!
              </h2>
              <p className="text-lg text-gray-600">
                You've reached
              </p>
            </div>

            {/* Level badge */}
            <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-12 py-6 shadow-lg">
              <div className="text-center">
                <p className="text-sm font-semibold text-orange-100">
                  LEVEL
                </p>
                <p className="text-6xl font-bold text-white">
                  {level}
                </p>
              </div>
            </div>

            {/* Congratulations message */}
            <p className="text-center text-sm text-gray-500">
              Keep up the great work!
            </p>
          </div>
        </div>
      </div>

      {/* Confetti effect (decorative elements) */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-3 w-3 animate-bounce rounded-full bg-orange-400 opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
