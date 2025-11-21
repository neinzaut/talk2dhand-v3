"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { Trash2, Video, MessageSquare, RotateCcw, HelpCircle, Wifi, WifiOff } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { StickFigureAvatar } from "@/components/ai-converse/StickFigureAvatar"
import { HowToUseModal } from "@/components/how-to-use-modal"

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
  const [howToOpen, setHowToOpen] = useState(false)
  const clientId = useRef("ai-converse-" + Date.now()).current

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
  const [replayGloss, setReplayGloss] = useState<string | null>(null)

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
      const backendUrl = process.env.NEXT_PUBLIC_DYNAMIC_PHRASES_API || "http://localhost:5008"
      
      const response = await fetch(`${backendUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageData,
          clientId: clientId,
          language: "english",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Detection failed")
      }

      const data = await response.json()
      const recognizedSign = data.english_prediction || ""
      const confidence = data.confidence || 0
      
      setCurrentSign(recognizedSign || "Listening...")
      setCurrentConfidence(confidence)

      // Check if we have a stable, new sign
      if (
        confidence > 0.65 &&
        recognizedSign &&
        recognizedSign !== lastStableSign
      ) {
        setLastStableSign(recognizedSign)
        // Automatically get AI response
        await getAIResponse(recognizedSign)
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
    <div className="h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Converse</h1>
              <p className="text-muted-foreground">
                Practice sign language conversations with AI assistance
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setHowToOpen(true)}
              className="gap-2"
            >
              <HelpCircle className="h-5 w-5" />
              How to Use
            </Button>
          </div>
        </div>
      </div>

      {/* Online/Offline Indicator */}
      {!isOnline && (
        <div className="container mx-auto px-6 pt-4 max-w-7xl">
          <Card className="p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">⚠️ WiFi needed for AI responses</span>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-6 py-6 max-w-7xl h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Left Panel: Camera + Recognition + AI Response */}
        <div className="space-y-6">{/* Camera Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Sign Recognition</h2>
            </div>

            {/* Camera View */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
              {/* eslint-disable-next-line react/forbid-dom-props */}
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
                  {/* eslint-disable-next-line react/forbid-dom-props */}
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
            <div className="min-h-[100px]">
              {isGettingResponse ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Thinking...
                </div>
              ) : (replayGloss || aiResponse) ? (
                <StickFigureAvatar 
                  gloss={replayGloss || aiResponse} 
                  autoPlay={true}
                  onComplete={() => setReplayGloss(null)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center px-4">
                  {/* Empty state stick figure SVG */}
                  <svg width="120" height="120" viewBox="0 0 120 120" className="mb-4 opacity-30">
                    <circle cx="60" cy="20" r="12" fill="#9CA3AF" />
                    <line x1="60" y1="32" x2="60" y2="70" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
                    <line x1="45" y1="40" x2="75" y2="40" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
                    <line x1="45" y1="40" x2="38" y2="60" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
                    <line x1="38" y1="60" x2="35" y2="80" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
                    <line x1="75" y1="40" x2="82" y2="60" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
                    <line x1="82" y1="60" x2="85" y2="80" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="35" cy="80" r="5" fill="#9CA3AF" />
                    <circle cx="85" cy="80" r="5" fill="#9CA3AF" />
                  </svg>
                  <p className="text-muted-foreground text-lg font-medium">
                    Avatar will sign responses here
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Start chatting!
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Panel: Conversation History */}
        <div className="flex flex-col h-full">
          <Card className="p-6 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Conversation History</h2>
              <Button
                variant="default"
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
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-medium text-muted-foreground">
                            AI responded:
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setReplayGloss(entry.aiResponse)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            title="Replay signs"
                            className="h-6 px-2"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Replay
                          </Button>
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
      </div>

      {/* How To Use Modal */}
      <HowToUseModal
        open={howToOpen}
        onOpenChange={setHowToOpen}
      >
        <div className="text-base space-y-4 pt-4">
          <h3 className="font-bold text-lg mb-2">How to Use AI Converse</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click &apos;Start Camera&apos; to enable your webcam</li>
            <li>Perform signs from the dynamic phrases set (hello, thankyou, food, drink, etc.)</li>
            <li>The AI will recognize your signs and respond with sign language animations</li>
            <li>Watch the stick-figure avatar demonstrate the AI&apos;s response</li>
            <li>Your conversation history is saved automatically</li>
          </ol>
        </div>
      </HowToUseModal>
    </div>
  )
}
