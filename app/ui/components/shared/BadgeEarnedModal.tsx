"use client"

import { useEffect, useState } from "react"
import { Award } from "lucide-react"
import type { Badge } from "@/store/types"

interface BadgeEarnedModalProps {
  badge: Badge
  onComplete: () => void
}

export function BadgeEarnedModal({ badge, onComplete }: BadgeEarnedModalProps) {
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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative transform rounded-3xl bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-1 shadow-2xl transition-all duration-500 ${
          isVisible ? "scale-100 rotate-0" : "scale-50 -rotate-12"
        }`}
      >
        <div className="rounded-3xl bg-white px-12 py-10">
          <div className="flex flex-col items-center gap-4">
            {/* Award icon with badge emoji */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                <span className="text-5xl">{badge.icon}</span>
              </div>
              <div className="absolute -right-2 -top-2">
                <Award className="h-10 w-10 text-yellow-500 drop-shadow-lg" />
              </div>
            </div>

            {/* Badge earned text */}
            <div className="text-center">
              <h2 className="mb-1 text-3xl font-bold text-gray-900">
                Badge Earned!
              </h2>
              <p className="text-sm text-gray-500">
                Achievement Unlocked
              </p>
            </div>

            {/* Badge name */}
            <div className="rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3">
              <p className="text-center text-xl font-bold text-purple-900">
                {badge.name}
              </p>
            </div>

            {/* Badge description */}
            <p className="max-w-sm text-center text-sm text-gray-600">
              {badge.description}
            </p>
          </div>
        </div>
      </div>

      {/* Sparkle decorations */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            <span className="text-2xl">✨</span>
          </div>
        ))}
      </div>
    </div>
  )
}
