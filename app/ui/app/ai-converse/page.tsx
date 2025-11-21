"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { 
  Wifi, WifiOff, Trash2, Video, Send, X, HelpCircle
} from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { StickFigureAvatar } from "@/components/ai-converse/StickFigureAvatar"
import { HowToUseModal } from "@/components/how-to-use-modal"

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

      // Add stable signs to detected words
      if (
        confidence > 0.65 &&
        recognizedSign &&
        recognizedSign !== lastStableSign
      ) {
        setLastStableSign(recognizedSign)
        addDetectedWord(recognizedSign, confidence)
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
    <div className="flex flex-col h-full">
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
      <main className="h-auto flex overflow-hidden">
        {/* Chat Area */}
        <div className="bottom-0 left-0 w-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
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
                          {/* Stick Figure Avatar */}
                          <StickFigureAvatar 
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

        {/* Camera Feed (Right Panel) */}
        <Card className="w-80 rounded-none border-l flex flex-col overflow-y-auto">
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
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{width: `${currentConfidence * 100}%`}}
                  />
                </div>
              )}
            </div>

            {/* Live Avatar Display */}
            <div className="p-4 border-t">
              <div className="text-xs text-muted-foreground mb-2">
                Live Sign Preview:
              </div>
              <div className="bg-white rounded-lg border aspect-video flex items-center justify-center">
                <StickFigureAvatar 
                  gloss={currentSign !== "Waiting..." && currentSign !== "Listening..." ? currentSign : ""} 
                  autoPlay={true}
                />
              </div>
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
            <li>Detected signs appear above the input - click them to build your message</li>
            <li>Send your message to get an AI response with animated stick-figure avatar</li>
            <li>Your conversation history is displayed in the chat area</li>
          </ol>
        </div>
      </HowToUseModal>
    </div>
  )
}

export default AIConversePage
