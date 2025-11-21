"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { 
  Wifi, WifiOff, Trash2, Video, Send, X
} from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { SignAnimationPlayer } from "@/components/ai-converse/SignAnimationPlayer"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: number
  gloss?: string
}

interface DetectedWord {
  word: string
  confidence: number
  timestamp: number
}

const MESSAGES_KEY = "talk2dhand-ai-messages"
const MAX_MESSAGES = 50
const MAX_DETECTED_WORDS = 10

// Ensure the header and footer stick to the top and bottom respectively
const AIConversePage = () => {
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

  // Detected words buffer with selection
  const [detectedWords, setDetectedWords] = useState<DetectedWord[]>([])
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const [selectedWordsOrder, setSelectedWordsOrder] = useState<string[]>([])

  // Message composition
  const [messageInput, setMessageInput] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isGettingResponse, setIsGettingResponse] = useState(false)
  const [currentGloss, setCurrentGloss] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Clear messages on mount (hard refresh)
  useEffect(() => {
    localStorage.removeItem(MESSAGES_KEY)
    setMessages([])
  }, [])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const limited = messages.slice(-MAX_MESSAGES)
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(limited))
      } catch (error) {
        console.error("Failed to save messages:", error)
      }
    }
  }, [messages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

      // Add stable signs to detected words
      if (
        data.confidence > 0.6 &&
        data.result !== "Listening..." &&
        data.result !== lastStableSign
      ) {
        setLastStableSign(data.result)
        addDetectedWord(data.result, data.confidence)
      }
    } catch (error) {
      console.error("Detection error:", error)
      // Continue listening silently on errors
    } finally {
      setIsProcessing(false)
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

  // Add word to detected words buffer
  const addDetectedWord = (word: string, confidence: number) => {
    if (confidence < 0.5) return
    
    setDetectedWords((prev) => {
      if (prev.some((w) => w.word.toLowerCase() === word.toLowerCase())) {
        return prev
      }
      
      const newWords = [
        ...prev,
        { word, confidence, timestamp: Date.now() }
      ].slice(-MAX_DETECTED_WORDS)
      
      return newWords
    })
  }

  // Toggle word selection with order tracking
  const toggleWordSelection = (word: string) => {
    setSelectedWords((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(word)) {
        newSet.delete(word)
        const newOrder = selectedWordsOrder.filter((w) => w !== word)
        setSelectedWordsOrder(newOrder)
        // Update text field
        setMessageInput(newOrder.join(" "))
      } else {
        newSet.add(word)
        const newOrder = [...selectedWordsOrder, word]
        setSelectedWordsOrder(newOrder)
        // Update text field
        setMessageInput(newOrder.join(" "))
      }
      return newSet
    })
  }

  // Clear detected words
  const clearDetectedWords = () => {
    setDetectedWords([])
    setSelectedWords(new Set())
    setSelectedWordsOrder([])
    setMessageInput("")
  }

  // Clear selected words
  const clearSelectedWords = () => {
    setSelectedWords(new Set())
    setSelectedWordsOrder([])
    setMessageInput("")
  }

  // Send message
  const sendMessage = async () => {
    const trimmedInput = messageInput.trim()
    if (!trimmedInput || isGettingResponse) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: trimmedInput,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessageInput("")

    // Get AI response
    if (!isOnline) {
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: "⚠️ WiFi needed for AI responses",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    try {
      setIsGettingResponse(true)

      const backendUrl = process.env.NEXT_PUBLIC_AI_CONVERSE_API || "http://localhost:8100"
      
      const response = await fetch(`${backendUrl}/infer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: "text",
          payload: trimmedInput,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        const errorMsg = errorData.detail || "AI response failed"
        console.error("Backend error:", errorMsg)
        throw new Error(errorMsg)
      }

      const data = await response.json()
      const glossResponse = data.result

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: glossResponse,
        gloss: glossResponse,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setCurrentGloss(glossResponse)
    } catch (error) {
      console.error("AI response error:", error)
      const errorText = error instanceof Error ? error.message : "Error getting AI response"
      const isRateLimit = errorText.includes("429") || errorText.includes("quota") || errorText.includes("rate limit")
      
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: isRateLimit 
          ? "⚠️ Rate limit reached. All API keys are temporarily exhausted. Please wait a moment and try again."
          : `Error: ${errorText}`,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGettingResponse(false)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Clear all messages
  const clearAllMessages = () => {
    if (confirm("Clear all messages?")) {
      setMessages([])
      localStorage.removeItem(MESSAGES_KEY)
      setCurrentGloss(null)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-md z-10">
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Converse</h1>
              <p className="text-sm text-muted-foreground">
                Practice sign language conversations with AI assistance
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center gap-2 text-amber-800">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">⚠️ WiFi needed for AI responses</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow overflow-hidden flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden mr-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Video className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg">No messages yet. Start a conversation!</p>
                <p className="text-sm mt-2">Sign something or type a message below</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white border shadow-sm"
                      }`}
                    >
                      {message.type === "ai" && message.gloss ? (
                        <div className="space-y-3">
                          {/* 3D Avatar Placeholder */}
                          <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-300">
                            <Video className="h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600 text-center font-medium">3D Avatar</p>
                            <p className="text-xs text-gray-500 text-center mt-1">Avatar will appear here and sign the response</p>
                          </div>
                          {/* Gloss Text Animation */}
                          <SignAnimationPlayer 
                            gloss={message.gloss} 
                            autoPlay={false}
                          />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      <div
                        className={`text-xs mt-1 ${
                          message.type === "user" ? "text-blue-100" : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Detected Words + Input Bar */}
          <div className="border-t bg-white">
            {/* Detected Words Row */}
            {detectedWords.length > 0 && (
              <div className="border-b bg-gray-50 px-6 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Detected Signs ({detectedWords.length}) - Click to add to message
                  </span>
                  <div className="flex gap-2">
                    {selectedWords.size > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={clearSelectedWords}
                        className="h-6 text-xs"
                      >
                        Clear Selected
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={clearDetectedWords}
                      className="h-6 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detectedWords.map((word, index) => {
                    const isSelected = selectedWords.has(word.word)
                    const selectionOrder = isSelected 
                      ? selectedWordsOrder.indexOf(word.word) + 1 
                      : null
                    
                    return (
                      <button
                        key={`${word.word}-${index}`}
                        onClick={() => toggleWordSelection(word.word)}
                        className={`relative px-3 py-1 rounded-full text-sm transition-colors ${
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-white border hover:border-blue-300"
                        }`}
                      >
                        {isSelected && selectionOrder && (
                          <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {selectionOrder}
                          </span>
                        )}
                        {word.word}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4">
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message or use detected signs..."
                  className="flex-1 resize-none rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={isGettingResponse}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || isGettingResponse}
                  size="lg"
                  className="px-6"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Feed (Fixed Right) */}
        <Card className="fixed right-0 top-0 bottom-0 w-96 rounded-none border-l flex flex-col" style={{marginTop: 'var(--header-height, 73px)'}}>
          {/* Header */}
          <div className="flex items-center gap-2 p-4 border-b">
            <Video className="h-5 w-5" />
            <h3 className="font-semibold">Sign Recognition</h3>
          </div>

            {/* Camera View */}
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraReady ? 'block' : 'hidden'}`}
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
                      <p className="text-red-400 text-sm mb-2">{cameraError}</p>
                      <Button onClick={initCamera} size="sm">
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Online indicator */}
              <div className="absolute top-2 right-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-400" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-400" />
                )}
              </div>
            </div>

            {/* Current Sign Display */}
            <div className="p-4 bg-gray-50">
              <div className="text-xs text-muted-foreground mb-1">
                Detected Sign:
              </div>
              <div className="text-xl font-bold mb-2">{currentSign}</div>
              {currentConfidence > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{width: `${currentConfidence * 100}%`}}
                  />
                </div>
              )}
            </div>

            {/* Clear Button */}
            <div className="p-4 border-t mt-auto">
              <Button
                variant="default"
                size="sm"
                onClick={clearAllMessages}
                disabled={messages.length === 0}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </Card>
      </main>
    </div>
  )
}

export default AIConversePage
