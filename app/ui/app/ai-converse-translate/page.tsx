"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { Wifi, WifiOff, Trash2, Video, MessageSquare } from "lucide-react"
import { useAppStore } from "@/store/app-store"

interface ConversationEntry {
  id: string
  timestamp: number
  recognizedSign: string
  aiResponse: string
  confidence: number
}

const STORAGE_KEY = "talk2dhand-ai-converse-history"
const MAX_HISTORY = 50

export default function AIConversePage() {
  const currentLanguage = useAppStore((state) => state.currentLanguage)

  // Online/Offline state
  const [isOnline, setIsOnline] = useState(true)

  // Camera state
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showStartButton, setShowStartButton] = useState(true)

  // Recognition state
  const [currentSign, setCurrentSign] = useState<string>("Waiting...")
  const [currentConfidence, setCurrentConfidence] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastStableSign, setLastStableSign] = useState<string | null>(null)

  // Conversation state
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([])
  const [aiResponse, setAiResponse] = useState<string>("")
  const [isGettingResponse, setIsGettingResponse] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const historyEndRef = useRef<HTMLDivElement>(null)

  // Load conversation history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ConversationEntry[]
        setConversationHistory(parsed.slice(-MAX_HISTORY))
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error)
    }
  }, [])

  // Save conversation history to localStorage (with 50-item limit)
  useEffect(() => {
    if (conversationHistory.length > 0) {
      try {
        const limited = conversationHistory.slice(-MAX_HISTORY)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
      } catch (error) {
        console.error("Failed to save conversation history:", error)
      }
    }
  }, [conversationHistory])

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationHistory])

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Initialize camera
  const initCamera = async () => {
    setIsInitializing(true)
    setCameraError(null)
    setShowStartButton(false)

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser")
      }

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          frameRate: { ideal: 30 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.oncanplay = () => {
          videoRef.current?.play().then(() => {
            setIsCameraReady(true)
            setIsInitializing(false)
          })
        }
      }
    } catch (error) {
      console.error("Camera error:", error)
      let errorMessage = "Unable to access camera. Please check permissions."
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Camera access denied. Please allow camera permissions."
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera found. Please connect a camera."
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is already in use by another application."
        }
      }
      setCameraError(errorMessage)
      setIsInitializing(false)
      setShowStartButton(true)
    }
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [])

  // Detect sign from video frame
  const detectSign = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return

    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video.videoWidth || !video.videoHeight) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = canvas.toDataURL("image/jpeg")

    try {
      setIsProcessing(true)
      const backendUrl = process.env.NEXT_PUBLIC_AI_CONVERSE_API || "http://localhost:8100"
      
      const response = await fetch(`${backendUrl}/infer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: "sign-frame",
          payload: imageData,
          language: currentLanguage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        throw new Error(errorData.detail || "Detection failed")
      }

      const data = await response.json()
      setCurrentSign(data.result)
      setCurrentConfidence(data.confidence)

      // Check if we have a stable, new sign
      if (
        data.confidence > 0.6 &&
        data.result !== "Listening..." &&
        data.result !== lastStableSign
      ) {
        setLastStableSign(data.result)
        // Automatically get AI response
        await getAIResponse(data.result)
      }
    } catch (error) {
      console.error("Detection error:", error)
      // Don't show errors for failed detections, just continue listening
    } finally {
      setIsProcessing(false)
    }
  }

  // Get AI response from Gemini
  const getAIResponse = async (recognizedSign: string) => {
    if (!isOnline) {
      setAiResponse("⚠️ WiFi needed for AI responses")
      return
    }

    try {
      setIsGettingResponse(true)
      setAiResponse("Thinking...")

      const backendUrl = process.env.NEXT_PUBLIC_AI_CONVERSE_API || "http://localhost:8100"
      
      const response = await fetch(`${backendUrl}/infer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: "text",
          payload: recognizedSign,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        throw new Error(errorData.detail || "AI response failed")
      }

      const data = await response.json()
      const glossResponse = data.result

      setAiResponse(glossResponse)

      // Add to conversation history
      const newEntry: ConversationEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        recognizedSign,
        aiResponse: glossResponse,
        confidence: currentConfidence,
      }

      setConversationHistory((prev) => [...prev, newEntry])
    } catch (error) {
      console.error("AI response error:", error)
      setAiResponse("Error getting AI response")
    } finally {
      setIsGettingResponse(false)
    }
  }

  // Start/stop detection polling
  useEffect(() => {
    if (isCameraReady && !detectionIntervalRef.current) {
      detectionIntervalRef.current = setInterval(() => {
        detectSign()
      }, 500)
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
      }
    }
  }, [isCameraReady, currentLanguage])

  // Clear conversation history
  const clearHistory = () => {
    if (confirm("Clear all conversation history?")) {
      setConversationHistory([])
      localStorage.removeItem(STORAGE_KEY)
      setAiResponse("")
      setLastStableSign(null)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Converse</h1>
        <p className="text-muted-foreground">
          Practice sign language conversations with AI assistance
        </p>
      </div>

      {/* Online/Offline Indicator */}
      {!isOnline && (
        <Card className="mb-4 p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <WifiOff className="h-5 w-5" />
            <span className="font-medium">⚠️ WiFi needed for AI responses</span>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Camera & Recognition */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Sign Recognition</h2>
            </div>

            {/* Camera View */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ display: isCameraReady ? "block" : "none" }}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  {showStartButton && (
                    <Button
                      onClick={initCamera}
                      disabled={isInitializing}
                      size="lg"
                    >
                      {isInitializing ? "Starting Camera..." : "Start Camera"}
                    </Button>
                  )}
                  {cameraError && (
                    <div className="text-center p-4">
                      <p className="text-red-400 mb-2">{cameraError}</p>
                      <Button onClick={initCamera} size="sm">
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Online indicator overlay */}
              <div className="absolute top-2 right-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-400" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-400" />
                )}
              </div>
            </div>

            {/* Current Sign Display */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Detected Sign:
              </div>
              <div className="text-2xl font-bold mb-2">{currentSign}</div>
              {currentConfidence > 0 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${currentConfidence * 100}%` }}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* AI Response Panel */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-xl font-semibold">AI Response</h2>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 min-h-[100px] flex items-center justify-center">
              <div className="text-center">
                {isGettingResponse ? (
                  <div className="text-muted-foreground">Thinking...</div>
                ) : aiResponse ? (
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {aiResponse}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    Sign something to start a conversation
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel: Conversation History */}
        <div className="space-y-4">
          <Card className="p-6 h-[calc(100vh-200px)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Conversation History</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                disabled={conversationHistory.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {conversationHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No conversations yet. Start signing!
                </div>
              ) : (
                conversationHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                  >
                    <div className="text-xs text-muted-foreground mb-2">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">
                          You signed:
                        </div>
                        <div className="text-lg font-semibold">
                          {entry.recognizedSign}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">
                          AI responded:
                        </div>
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {entry.aiResponse}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={historyEndRef} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
