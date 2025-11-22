"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { 
  Wifi, WifiOff, Trash2, Video, Send, X, HelpCircle, RotateCcw, SkipBack, SkipForward
} from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { SkeletonPoseViewer } from "@/components/ai-converse/SkeletonPoseViewer"
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

  // Tab state
  const [activeTab, setActiveTab] = useState<"converse" | "translate">("converse")

  // AI Translate state
  const [translateInput, setTranslateInput] = useState<string>("")
  const [translatedGloss, setTranslatedGloss] = useState<string>("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translateError, setTranslateError] = useState<string | null>(null)

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
  const [avatarSpeed, setAvatarSpeed] = useState(1)
  const [shouldReplayAvatar, setShouldReplayAvatar] = useState(false)
  const [selectedMessageGloss, setSelectedMessageGloss] = useState<string | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [glossTokens, setGlossTokens] = useState<string[]>([])

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

  // Parse gloss into tokens when selectedMessageGloss changes
  useEffect(() => {
    if (selectedMessageGloss) {
      const tokens = selectedMessageGloss.split(/\s+/).filter(token => token.length > 0)
      setGlossTokens(tokens)
      setCurrentWordIndex(0)
    } else {
      setGlossTokens([])
      setCurrentWordIndex(0)
    }
  }, [selectedMessageGloss])

  // Navigation handlers
  const handlePreviousSign = () => {
    setCurrentWordIndex(prev => Math.max(0, prev - 1))
  }

  const handleNextSign = () => {
    setCurrentWordIndex(prev => Math.min(glossTokens.length - 1, prev + 1))
  }

  // Clear all messages
  const clearAllMessages = () => {
    if (confirm("Clear all messages?")) {
      setMessages([])
      localStorage.removeItem(MESSAGES_KEY)
      setCurrentGloss(null)
    }
  }

  // Translate text to ASL GLOSS
  const translateToGloss = async () => {
    const trimmedInput = translateInput.trim()
    if (!trimmedInput || isTranslating) return

    if (!isOnline) {
      setTranslateError("⚠️ WiFi needed for translation")
      return
    }

    try {
      setIsTranslating(true)
      setTranslateError(null)

      const backendUrl = process.env.NEXT_PUBLIC_AI_CONVERSE_API || "http://localhost:8100"
      
      const response = await fetch(`${backendUrl}/translate-gloss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmedInput,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        const errorMsg = errorData.detail || "Translation failed"
        console.error("Backend error:", errorMsg)
        throw new Error(errorMsg)
      }

      const data = await response.json()
      const gloss = data.gloss

      setTranslatedGloss(gloss)
    } catch (error) {
      console.error("Translation error:", error)
      const errorText = error instanceof Error ? error.message : "Error translating text"
      const isRateLimit = errorText.includes("429") || errorText.includes("quota") || errorText.includes("rate limit")
      
      setTranslateError(isRateLimit 
        ? "⚠️ Rate limit reached. All API keys are temporarily exhausted. Please wait a moment and try again."
        : `Error: ${errorText}`)
    } finally {
      setIsTranslating(false)
    }
  }

  // Handle Enter key in translate input
  const handleTranslateKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      translateToGloss()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-md z-10">
        {/* Tab Navigation */}
        <div className="border-b bg-white px-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("converse")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "converse"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                AI Converse
              </button>
              <button
                onClick={() => setActiveTab("translate")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "translate"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                AI Translate
              </button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setHowToOpen(true)}
              className="bg-blue-100 text-blue-600 hover:bg-blue-200 font-semibold"
            >
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

      {/* AI Converse Tab */}
      {activeTab === "converse" && (
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
                          : "bg-white border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      }`}
                      onClick={() => {
                        if (message.type === "ai" && message.gloss) {
                          setSelectedMessageGloss(message.gloss)
                          setCurrentSign(message.gloss.split(/\s+/)[0] || "")
                          setShouldReplayAvatar(prev => !prev)
                        }
                      }}
                    >
                      {message.type === "ai" && message.gloss ? (
                        <div className="space-y-3">
                          {/* 2D Skeleton Pose Viewer */}
                          <SkeletonPoseViewer 
                            gloss={message.gloss} 
                            autoplay={true}
                            loop={true}
                            showCurrentWord={true}
                            width={400}
                          />
                          <p className="text-xs text-muted-foreground text-center">Click to preview in Live Sign Preview</p>
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
        <Card className="w-95 rounded-none border-l flex flex-col overflow-y-auto">
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
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isInitializing ? "Starting Camera..." : "Start Camera"}
                    </Button>
                  )}
                  {cameraError && (
                    <div className="text-center p-4">
                      <p className="text-red-400 text-sm mb-2">{cameraError}</p>
                      <Button onClick={initCamera} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
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
            <div className="p-4 border-t flex-1 flex flex-col">
              <div className="text-xs text-muted-foreground mb-2">
                Live Sign Preview:
              </div>
              <div className="bg-white rounded-lg border aspect-video flex items-center justify-center mb-3">
                <SkeletonPoseViewer 
                  gloss={glossTokens.length > 0 ? glossTokens[currentWordIndex] : (selectedMessageGloss || (currentSign !== "Waiting..." && currentSign !== "Listening..." ? currentSign : ""))} 
                  autoplay={true}
                  loop={false}
                  showCurrentWord={true}
                  speed={avatarSpeed}
                  width={400}
                  key={glossTokens.length > 0 ? `${currentWordIndex}-${glossTokens[currentWordIndex]}-${shouldReplayAvatar}` : (shouldReplayAvatar ? Date.now() : (selectedMessageGloss || currentSign))}
                  onCurrentWordChange={(word) => setCurrentSign(word)}
                />
              </div>
              
              {/* Animation Controls */}
              <div className="space-y-2">
                {/* Current Word Display */}
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Current Sign:</div>
                  <div className="text-lg font-bold text-blue-600">
                    {glossTokens.length > 0 ? glossTokens[currentWordIndex] : (currentSign !== "Waiting..." && currentSign !== "Listening..." ? currentSign : "—")}
                  </div>
                  {glossTokens.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {currentWordIndex + 1} of {glossTokens.length}
                    </div>
                  )}
                </div>

                {/* Navigation Arrows - Under Current Sign */}
                <div className="flex items-center justify-center gap-6">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handlePreviousSign}
                    disabled={glossTokens.length === 0 || currentWordIndex === 0}
                    className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg"
                    title="Previous sign"
                  >
                    <SkipBack className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleNextSign}
                    disabled={glossTokens.length === 0 || currentWordIndex >= glossTokens.length - 1}
                    className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg"
                    title="Next sign"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                </div>
                
                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShouldReplayAvatar(!shouldReplayAvatar)}
                    disabled={glossTokens.length === 0 && (!currentSign || currentSign === "Waiting..." || currentSign === "Listening...")}
                    className="flex-1"
                    title="Replay animation"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Replay
                  </Button>
                  
                  {/* Speed Controls */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setAvatarSpeed(Math.max(0.5, avatarSpeed - 0.25))}
                      disabled={avatarSpeed <= 0.5}
                      className="h-7 w-7 p-0"
                      title="Slow down"
                    >
                      −
                    </Button>
                    <span className="text-xs font-medium min-w-[3rem] text-center">
                      {avatarSpeed}x
                    </span>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setAvatarSpeed(Math.min(2, avatarSpeed + 0.25))}
                      disabled={avatarSpeed >= 2}
                      className="h-7 w-7 p-0"
                      title="Speed up"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
      </main>
      )}

      {/* AI Translate Tab */}
      {activeTab === "translate" && (
      <main className="h-auto flex overflow-hidden">
        <Card className="flex-1 flex flex-col mx-6 my-4">
          <div className="flex-1 flex gap-4 p-6">
            {/* Left Side - Text Input */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-3">Enter Text to Translate</h3>
              <textarea
                value={translateInput}
                onChange={(e) => setTranslateInput(e.target.value)}
                onKeyDown={handleTranslateKeyPress}
                placeholder={currentLanguage === "asl" 
                  ? "Type in English (e.g., Hello, how are you today?)..." 
                  : "Type in Filipino (e.g., Kamusta ka ngayong araw?)..."}
                className="flex-1 resize-none border rounded-lg p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTranslating || !isOnline}
              />
              {translateError && (
                <div className="mt-2 text-sm text-red-600">{translateError}</div>
              )}
              <Button
                onClick={translateToGloss}
                disabled={!translateInput.trim() || isTranslating || !isOnline}
                className="mt-3 w-full"
              >
                {isTranslating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Translating...
                  </>
                ) : (
                  "Translate"
                )}
              </Button>
            </div>
            
            {/* Vertical Divider */}
            <div className="w-px bg-gray-200" />
            
            {/* Right Side - 2D Pose Avatar */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-3">Translation</h3>
              {translatedGloss ? (
                <>
                  <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border mb-3">
                    <SkeletonPoseViewer
                      gloss={translatedGloss}
                      autoplay={true}
                      loop={true}
                      showCurrentWord={true}
                      width={400}
                      speed={avatarSpeed}
                      key={translatedGloss}
                    />
                  </div>
                  <div className="bg-white rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground mb-1">Translation:</div>
                    <div className="text-base font-mono font-semibold text-blue-600">
                      {translatedGloss}
                    </div>
                  </div>
                  
                  {/* Speed Controls */}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="text-sm text-muted-foreground">Speed:</span>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setAvatarSpeed(Math.max(0.5, avatarSpeed - 0.25))}
                      disabled={avatarSpeed <= 0.5}
                      className="h-7 w-7 p-0"
                      title="Slow down"
                    >
                      -
                    </Button>
                    <span className="text-sm font-medium min-w-[3rem] text-center">
                      {avatarSpeed.toFixed(2)}x
                    </span>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setAvatarSpeed(Math.min(2, avatarSpeed + 0.25))}
                      disabled={avatarSpeed >= 2}
                      className="h-7 w-7 p-0"
                      title="Speed up"
                    >
                      +
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground bg-gray-50 rounded-lg border">
                  <div>
                    <svg width="80" height="80" viewBox="0 0 120 120" className="mx-auto mb-3 opacity-30">
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
                    <p>Enter text on the left to see translation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
      )}

      {/* How To Use Modal */}
      <HowToUseModal
        open={howToOpen}
        onOpenChange={setHowToOpen}
      >
        <div className="text-base space-y-3 pt-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">💬</span>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Converse Tab</p>
                <p className="text-sm text-gray-700">Start camera → Perform signs → Click detected words to build message → Send to get AI response with animated avatar</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">🔤</span>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Translate Tab</p>
                <p className="text-sm text-gray-700">Type text in English (ASL) or Filipino (FSL) → Get sign language gloss translation → Watch animated demonstration</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <span className="text-2xl">🌐</span>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Language Selection</p>
                <p className="text-sm text-gray-700">Use the dropdown in top navigation to switch between ASL (🇺🇸) and FSL (🇵🇭)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Playback Controls</p>
                <p className="text-sm text-gray-700">Adjust animation speed, replay, or navigate through sign sequences</p>
              </div>
            </div>
          </div>
        </div>
      </HowToUseModal>
    </div>
  )
}

export default AIConversePage
