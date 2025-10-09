"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useParams, useRouter } from "next/navigation"
import { HowToUseModal } from "@/components/how-to-use-modal"
import { cn } from "@/lib/utils"

type SignStatus = "idle" | "correct" | "incorrect"

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { getCurrentModules, updateLessonProgress } = useAppStore()
  const modules = getCurrentModules()

  const [selectedSignId, setSelectedSignId] = useState<string | null>(null)
  const [signStatuses, setSignStatuses] = useState<Record<string, SignStatus>>({})
  const [detectedSign, setDetectedSign] = useState<string>("")
  const [timer, setTimer] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [showStartButton, setShowStartButton] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Find the lesson
  let lesson = null
  for (const module of modules) {
    const found = module.lessons.find((l) => l.id === params.lessonId)
    if (found) {
      lesson = found
      break
    }
  }

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Initialize camera function
  const initCamera = async () => {
    setIsInitializing(true)
    setCameraError(null)
    setShowStartButton(false)
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser")
      }

      // Simple, reliable constraints
      const constraints = {
        video: {
          width: 640,
          height: 480,
          facingMode: "user"
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsCameraReady(true)
                setIsInitializing(false)
                console.log("Camera started successfully")
              })
              .catch(err => {
                console.error("Error playing video:", err)
                setCameraError("Failed to start video playback")
                setIsInitializing(false)
                setShowStartButton(true)
              })
          }
        }

        // Handle video errors
        videoRef.current.onerror = (e) => {
          console.error("Video element error:", e)
          setCameraError("Failed to load video stream")
          setIsInitializing(false)
          setShowStartButton(true)
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      let errorMessage = "Unable to access camera. Please check permissions."
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Camera access denied. Please allow camera permissions and try again."
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera found. Please connect a camera and try again."
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is already in use by another application."
        }
      }
      
      setCameraError(errorMessage)
      setIsInitializing(false)
      setShowStartButton(true)
    }
  }

  // Stop camera function
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraReady(false)
    setShowStartButton(true)
    setCameraError(null)
  }

  // Cleanup function
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [stream])

  // Send frame to backend for detection
  const detectSign = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady || !selectedSignId) {
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    try {
      const imageData = canvas.toDataURL("image/jpeg")
      
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: imageData })
      })
      
      const data = await response.json()
      
      if (data.success && data.prediction) {
        const predictedSign = data.prediction.toLowerCase()
        setDetectedSign(data.prediction.toUpperCase())
        
        // Check if prediction matches selected sign
        if (predictedSign === selectedSignId.toLowerCase()) {
          setSignStatuses((prev) => ({ ...prev, [selectedSignId]: "correct" }))
          
          // Stop detection and move to next sign after 1 second
          if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current)
            detectionIntervalRef.current = null
          }
          
          setTimeout(() => {
            setSelectedSignId(null)
            setDetectedSign("")
          }, 1000)
        }
      }
    } catch (error) {
      console.error("Error detecting sign:", error)
    }
  }

  // Start/stop detection based on selected sign
  useEffect(() => {
    if (selectedSignId && isCameraReady) {
      // Start detection
      detectionIntervalRef.current = setInterval(() => {
        detectSign()
      }, 1000) // Detect every second
    } else {
      // Stop detection
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
      }
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
      }
    }
  }, [selectedSignId, isCameraReady])

  if (!lesson) {
    return <div>Lesson not found</div>
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSignSelect = (signId: string) => {
    setSelectedSignId(signId)
    setSignStatuses((prev) => ({ ...prev, [signId]: "idle" }))
    setDetectedSign("")
  }

  const getSignBorderColor = (signId: string) => {
    const status = signStatuses[signId]
    if (status === "correct") return "border-green-500"
    if (status === "incorrect") return "border-red-500"
    if (selectedSignId === signId) return "border-orange-500"
    return "border-gray-300"
  }

  const completedSigns = Object.values(signStatuses).filter((s) => s === "correct").length
  const progress = lesson.signs.length > 0 ? Math.round((completedSigns / lesson.signs.length) * 100) : 0

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="default" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-4xl font-bold text-primary">{lesson.title.split(":")[1]?.trim() || lesson.title}</h1>
        </div>
        <Button variant="default" className="gap-2" onClick={() => setIsModalOpen(true)}>
          <HelpCircle className="h-4 w-4" />
          How to Use?
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Timer */}
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Timer: {formatTime(timer)}</p>
        </div>

        {/* Camera Feed */}
        <Card
          className={cn(
            "overflow-hidden border-8 transition-colors",
            selectedSignId && signStatuses[selectedSignId] === "correct" && "border-green-500",
            selectedSignId && signStatuses[selectedSignId] === "incorrect" && "border-red-500",
            (!selectedSignId || signStatuses[selectedSignId] === "idle") && "border-orange-500",
          )}
        >
          <div className="aspect-video bg-gray-900 flex items-center justify-center relative overflow-hidden rounded-lg">
            {cameraError ? (
              <div className="text-white text-center p-6">
                <div className="text-4xl mb-4">📹</div>
                <p className="text-xl mb-2">Camera Error</p>
                <p className="text-sm text-red-400 mb-6 max-w-md">{cameraError}</p>
                <Button 
                  onClick={initCamera}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            ) : showStartButton ? (
              <div className="text-white text-center p-6">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-2xl mb-2">Ready to Practice?</p>
                <p className="text-sm text-gray-400 mb-8 max-w-md">
                  Click the button below to start your camera for real-time sign recognition
                </p>
                <Button 
                  onClick={initCamera}
                  variant="default"
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
                >
                  Start Camera
                </Button>
              </div>
            ) : isInitializing ? (
              <div className="text-white text-center p-6">
                <div className="animate-spin text-4xl mb-4">📹</div>
                <p className="text-xl mb-2">Initializing Camera...</p>
                <p className="text-sm text-gray-400">Please allow camera access when prompted</p>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Camera controls */}
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={stopCamera}
                    variant="default"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Stop Camera
                  </Button>
                </div>
                
                {/* Overlay when no sign is selected */}
                {!selectedSignId && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-white text-xl mb-2">Camera Ready!</p>
                      <p className="text-gray-300">Select a sign below to start practicing</p>
                    </div>
                  </div>
                )}
                
                {/* Success overlay when sign is detected */}
                {selectedSignId && signStatuses[selectedSignId] === "correct" && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-80 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">✅</div>
                      <p className="text-xl font-bold">Great job!</p>
                      <p className="text-sm">Sign detected correctly</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Detected Sign */}
        {detectedSign && (
          <div className="text-center">
            <p className="text-xl font-bold">Detected: {detectedSign}</p>
          </div>
        )}

        {/* Sign Selection Grid */}
        <div className="grid grid-cols-7 gap-4">
          {lesson.signs.map((sign) => (
            <button
              key={sign.id}
              onClick={() => handleSignSelect(sign.id)}
              disabled={signStatuses[sign.id] === "correct"}
              className={cn(
                "aspect-square rounded-lg border-4 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                getSignBorderColor(sign.id),
              )}
            >
              <img
                src={sign.imageUrl || "/placeholder.svg"}
                alt={`Sign for ${sign.label}`}
                className="w-full h-full object-cover rounded"
              />
              <p className="text-center font-bold mt-1">{sign.label}</p>
            </button>
          ))}
        </div>

        {/* Next Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={() => {
              updateLessonProgress(lesson.id, progress)
              router.back()
            }}
          >
            NEXT
          </Button>
        </div>
      </div>

      <HowToUseModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
