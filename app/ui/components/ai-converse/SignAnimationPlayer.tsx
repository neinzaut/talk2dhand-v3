"use client"

import { useEffect, useState, useCallback } from "react"
import { RotateCcw, SkipBack, SkipForward } from "lucide-react"
import { parseGloss, type GlossToken } from "@/lib/glossParser"

interface SignAnimationPlayerProps {
  gloss: string
  autoPlay?: boolean
  onComplete?: () => void
  className?: string
}

export function SignAnimationPlayer({
  gloss,
  autoPlay = false,
  onComplete,
  className = "",
}: SignAnimationPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false) // Changed to false by default - manual controll
  const [speed, setSpeed] = useState(1) // 0.5x, 1x, 1.5x, 2x
  const [tokens, setTokens] = useState<GlossToken[]>([])

  // Parse gloss on mount or change
  useEffect(() => {
    const parsed = parseGloss(gloss)
    setTokens(parsed.tokens)
    setCurrentIndex(0)
    setIsPlaying(false) // Don't auto-play on gloss change
  }, [gloss])

  // No automatic animation loop - removed the auto-advance useEffect

  const handleReplay = useCallback(() => {
    setCurrentIndex(0)
  }, [])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIndex = Math.min(tokens.length - 1, prev + 1)
      if (nextIndex === tokens.length - 1 && prev === tokens.length - 1) {
        // Already at the end
        onComplete?.()
      }
      return nextIndex
    })
  }, [tokens.length, onComplete])

  const handleSpeedChange = useCallback(() => {
    const speeds = [0.5, 1, 1.5, 2]
    const currentSpeedIndex = speeds.indexOf(speed)
    const nextSpeed = speeds[(currentSpeedIndex + 1) % speeds.length]
    setSpeed(nextSpeed)
  }, [speed])

  // Note: Speed is kept for future use if auto-play is re-enabled
  // Currently controls are manual (next/previous buttons)

  if (tokens.length === 0) {
    return (
      <div className={`text-center text-muted-foreground ${className}`}>
        No signs to display
      </div>
    )
  }

  const currentToken = tokens[currentIndex]
  const progress = ((currentIndex + 1) / tokens.length) * 100

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Sign Display with Animation */}
      <div className="relative flex items-center justify-center min-h-[200px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-8">
        <div className="text-center space-y-4">
          {/* Avatar/Icon Placeholder */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <span className="text-3xl">🤟</span>
            </div>
          </div>

          {/* Animated Sign Word */}
          <div
            className="text-5xl md:text-7xl font-bold transition-all duration-300 ease-in-out"
            style={{
              color: currentToken.isPunctuation
                ? "rgb(156, 163, 175)"
                : "rgb(37, 99, 235)",
              transform: isPlaying ? "scale(1.1)" : "scale(1)",
              opacity: isPlaying ? 1 : 0.8,
            }}
            key={currentIndex}
          >
            {currentToken.word}
          </div>

          {/* Sign Counter */}
          <div className="text-sm text-muted-foreground mb-2">
            Current Sign: {currentIndex + 1} of {tokens.length}
          </div>

          {/* Navigation Arrows - Under Current Sign */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg"
              title="Previous sign"
            >
              <SkipBack className="h-6 w-6" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex >= tokens.length - 1}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg"
              title="Next sign"
            >
              <SkipForward className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Other Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleReplay}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Restart from beginning"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          onClick={handleSpeedChange}
          className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
          title="Change playback speed"
        >
          {speed}x
        </button>
      </div>

      {/* Full Sequence Display */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 max-h-32 overflow-y-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {tokens.map((token, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                index === currentIndex
                  ? "bg-blue-600 text-white scale-110 shadow-md"
                  : index < currentIndex
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              {token.word}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
