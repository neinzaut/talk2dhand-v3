"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react"
import { parseGloss, getTokenDuration, type GlossToken } from "@/lib/glossParser"
import {
  type SignPose,
  getPoseForSign,
  hasPoseForSign,
  interpolatePose,
  easeInOutCubic,
  easeOutElastic,
  NEUTRAL_POSE,
} from "@/lib/poseKeyframes"

interface StickFigureAvatarProps {
  gloss: string
  autoPlay?: boolean
  onComplete?: () => void
  className?: string
}

const SIGN_DURATION = 1200 // ms for each sign
const PUNCTUATION_DURATION = 400 // ms for punctuation pauses
const TRANSITION_DURATION = 300 // ms for pose transitions

export function StickFigureAvatar({
  gloss,
  autoPlay = false,
  onComplete,
  className = "",
}: StickFigureAvatarProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [speed, setSpeed] = useState(1)
  const [tokens, setTokens] = useState<GlossToken[]>([])
  const [currentPose, setCurrentPose] = useState<SignPose>(NEUTRAL_POSE)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const transitionStartRef = useRef<number>(0)
  const fromPoseRef = useRef<SignPose>(NEUTRAL_POSE)
  const toPoseRef = useRef<SignPose>(NEUTRAL_POSE)

  // Parse gloss on mount or change
  useEffect(() => {
    const parsed = parseGloss(gloss)
    setTokens(parsed.tokens)
    setCurrentIndex(0)
    setIsPlaying(autoPlay)
    setCurrentPose(NEUTRAL_POSE)
  }, [gloss, autoPlay])

  // Draw stick figure on canvas
  const drawStickFigure = useCallback((pose: SignPose, isActive: boolean) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const width = canvas.width
    const height = canvas.height

    // Scale poses to canvas dimensions
    const scale = (point: { x: number; y: number }) => ({
      x: point.x * width,
      y: point.y * height,
    })

    const head = scale(pose.head)
    const leftShoulder = scale(pose.leftShoulder)
    const rightShoulder = scale(pose.rightShoulder)
    const leftElbow = scale(pose.leftElbow)
    const rightElbow = scale(pose.rightElbow)
    const leftWrist = scale(pose.leftWrist)
    const rightWrist = scale(pose.rightWrist)
    const hip = scale(pose.hip)

    // Set line style
    const color = isActive ? "#3B82F6" : "#9CA3AF" // blue when active, gray when transitioning
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 4
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Draw body
    ctx.beginPath()
    ctx.moveTo((leftShoulder.x + rightShoulder.x) / 2, (leftShoulder.y + rightShoulder.y) / 2)
    ctx.lineTo(hip.x, hip.y)
    ctx.stroke()

    // Draw shoulders
    ctx.beginPath()
    ctx.moveTo(leftShoulder.x, leftShoulder.y)
    ctx.lineTo(rightShoulder.x, rightShoulder.y)
    ctx.stroke()

    // Draw left arm
    ctx.beginPath()
    ctx.moveTo(leftShoulder.x, leftShoulder.y)
    ctx.lineTo(leftElbow.x, leftElbow.y)
    ctx.lineTo(leftWrist.x, leftWrist.y)
    ctx.stroke()

    // Draw right arm
    ctx.beginPath()
    ctx.moveTo(rightShoulder.x, rightShoulder.y)
    ctx.lineTo(rightElbow.x, rightElbow.y)
    ctx.lineTo(rightWrist.x, rightWrist.y)
    ctx.stroke()

    // Draw head
    ctx.beginPath()
    ctx.arc(head.x, head.y, 20, 0, 2 * Math.PI)
    ctx.fill()

    // Draw hands (small circles)
    ctx.beginPath()
    ctx.arc(leftWrist.x, leftWrist.y, 8, 0, 2 * Math.PI)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(rightWrist.x, rightWrist.y, 8, 0, 2 * Math.PI)
    ctx.fill()
  }, [])

  // Animation loop for smooth transitions
  useEffect(() => {
    if (!isTransitioning) return

    const animate = (timestamp: number) => {
      if (transitionStartRef.current === 0) {
        transitionStartRef.current = timestamp
      }

      const elapsed = timestamp - transitionStartRef.current
      const progress = Math.min(elapsed / TRANSITION_DURATION, 1)

      // Use elastic easing for hand movements
      const interpolated = interpolatePose(
        fromPoseRef.current,
        toPoseRef.current,
        progress,
        easeOutElastic
      )

      setCurrentPose(interpolated)
      drawStickFigure(interpolated, false)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setIsTransitioning(false)
        transitionStartRef.current = 0
        setCurrentPose(toPoseRef.current)
        drawStickFigure(toPoseRef.current, true)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isTransitioning, drawStickFigure])

  // Redraw when pose changes (non-transition updates)
  useEffect(() => {
    if (!isTransitioning) {
      drawStickFigure(currentPose, isPlaying)
    }
  }, [currentPose, isPlaying, isTransitioning, drawStickFigure])

  // Handle sign transitions
  useEffect(() => {
    if (!isPlaying || tokens.length === 0) return

    const currentToken = tokens[currentIndex]
    if (!currentToken) return

    // Start transition to new pose
    const targetPose = currentToken.isPunctuation
      ? NEUTRAL_POSE
      : getPoseForSign(currentToken.word)

    fromPoseRef.current = currentPose
    toPoseRef.current = targetPose
    setIsTransitioning(true)

    // Calculate duration based on token type
    const baseDuration = currentToken.isPunctuation ? PUNCTUATION_DURATION : SIGN_DURATION
    const duration = baseDuration / speed

    const timer = setTimeout(() => {
      if (currentIndex < tokens.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        setIsPlaying(false)
        onComplete?.()
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [isPlaying, currentIndex, tokens, speed, onComplete, currentPose])

  const handlePlayPause = useCallback(() => {
    if (currentIndex >= tokens.length - 1 && !isPlaying) {
      setCurrentIndex(0)
      setIsPlaying(true)
    } else {
      setIsPlaying((prev) => !prev)
    }
  }, [currentIndex, tokens.length, isPlaying])

  const handleReplay = useCallback(() => {
    setCurrentIndex(0)
    setIsPlaying(true)
  }, [])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(tokens.length - 1, prev + 1))
  }, [tokens.length])

  const handleSpeedChange = useCallback(() => {
    const speeds = [0.5, 1, 1.5, 2]
    const currentSpeedIndex = speeds.indexOf(speed)
    const nextSpeed = speeds[(currentSpeedIndex + 1) % speeds.length]
    setSpeed(nextSpeed)
  }, [speed])

  if (tokens.length === 0) {
    return (
      <div className={`text-center text-muted-foreground ${className}`}>
        No signs to display
      </div>
    )
  }

  const currentToken = tokens[currentIndex]
  const progress = ((currentIndex + 1) / tokens.length) * 100
  const hasDefinedPose = !currentToken.isPunctuation && hasPoseForSign(currentToken.word)

  // Determine label color based on state
  const labelColor = currentToken.isPunctuation
    ? "text-gray-400 dark:text-gray-500"
    : hasDefinedPose
      ? isTransitioning
        ? "text-gray-500 dark:text-gray-400"
        : "text-blue-600 dark:text-blue-400"
      : "text-gray-400 dark:text-gray-500 italic"

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stick Figure Display */}
      <div className="relative flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-8">
        {/* Canvas for stick figure */}
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="mb-4"
        />

        {/* Current Sign Label */}
        <div className="text-center space-y-2">
          <div className={`text-2xl font-bold transition-colors duration-300 ${labelColor}`}>
            {currentToken.word}
            {!hasDefinedPose && !currentToken.isPunctuation && (
              <span className="text-sm ml-2">(neutral)</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Sign {currentIndex + 1} of {tokens.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous sign"
        >
          <SkipBack className="h-5 w-5" />
        </button>

        <button
          onClick={handleReplay}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Replay from start"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          onClick={handlePlayPause}
          className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex >= tokens.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next sign"
        >
          <SkipForward className="h-5 w-5" />
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
                  ? "bg-blue-600 text-white scale-110"
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
