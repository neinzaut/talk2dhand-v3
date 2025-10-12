"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { ArrowLeft, HelpCircle, CheckCircle, Circle } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useParams, useRouter } from "next/navigation"
import { HowToUseModal } from "@/components/how-to-use-modal"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type SignStatus = "idle" | "correct" | "incorrect"

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { getCurrentModules, completeSubLesson } = useAppStore()
  const modules = getCurrentModules()

  const [currentSubLessonIndex, setCurrentSubLessonIndex] = useState(0)
  const [selectedSignId, setSelectedSignId] = useState<string | null>(null)
  const [signStatuses, setSignStatuses] = useState<Record<string, SignStatus>>({})
  const [detectedSign, setDetectedSign] = useState<string>("")
  const [timer, setTimer] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [showStartButton, setShowStartButton] = useState(true)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  
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

  if (!lesson) {
    return <div>Lesson not found</div>
  }

  const currentSubLesson = lesson.subLessons[currentSubLessonIndex]

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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser")
      }

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          frameRate: { ideal: 30 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        videoRef.current.oncanplay = () => {
          videoRef.current?.play().then(() => {
            setIsCameraReady(true)
            setIsInitializing(false)
          }).catch(err => {
            console.error("Error playing video:", err)
            setCameraError("Failed to start video playback")
            setIsInitializing(false)
            setShowStartButton(true)
          })
        }

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

  // Cleanup function
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [])

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
        
        if (predictedSign === selectedSignId.toLowerCase()) {
          setSignStatuses((prev) => ({ ...prev, [selectedSignId]: "correct" }))
          
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
      detectionIntervalRef.current = setInterval(() => {
        detectSign()
      }, 1000)
    } else {
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
  const practiceProgress = lesson.signs.length > 0 ? Math.round((completedSigns / lesson.signs.length) * 100) : 0

  const handleCompleteSubLesson = () => {
    if (currentSubLesson && !currentSubLesson.completed) {
      completeSubLesson(lesson.id, currentSubLesson.id)
    }
  }

  const handleNext = () => {
    handleCompleteSubLesson()
    
    if (currentSubLessonIndex < lesson.subLessons.length - 1) {
      setCurrentSubLessonIndex(currentSubLessonIndex + 1)
      // Reset states for next sublesson
      setSignStatuses({})
      setSelectedSignId(null)
      setDetectedSign("")
      setShowStartButton(true)
      setIsCameraReady(false)
    } else {
      router.back()
    }
  }

  const handlePrevious = () => {
    if (currentSubLessonIndex > 0) {
      setCurrentSubLessonIndex(currentSubLessonIndex - 1)
      setSignStatuses({})
      setSelectedSignId(null)
      setDetectedSign("")
      setShowStartButton(true)
      setIsCameraReady(false)
    }
  }

  const renderSubLessonContent = () => {
    if (!currentSubLesson) return null

    switch (currentSubLesson.type) {
      case "content":
  return (
          <div className="max-w-5xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-4 prose-h4:text-xl prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-3 prose-p:text-base prose-p:leading-relaxed prose-p:mb-4 prose-ul:my-4 prose-li:my-2 prose-strong:text-orange-600 dark:prose-strong:text-orange-400 prose-table:my-6 prose-th:bg-orange-50 dark:prose-th:bg-orange-900/20 prose-th:p-3 prose-td:p-3 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50/50 dark:prose-blockquote:bg-orange-900/10 prose-blockquote:py-2 prose-blockquote:px-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h3: ({ children }) => (
                        <h3 className="text-3xl font-bold text-primary mb-6 mt-8 first:mt-0 border-b-2 border-orange-200 pb-2">
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-xl font-semibold text-primary mt-6 mb-3">
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => (
                        <p className="text-base leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-4 space-y-2 list-disc list-outside ml-6">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                          {children}
                        </li>
                      ),
                      table: ({ children }) => (
                        <div className="my-8 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                          <table className="w-full border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-orange-100 dark:bg-orange-900/30">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          {children}
                        </td>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10 py-3 px-4 my-6 rounded-r-lg">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {currentSubLesson.content || ""}
                  </ReactMarkdown>
        </div>
              </CardContent>
            </Card>
      </div>
        )

      case "practice":
        return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Timer: {formatTime(timer)}</p>
        </div>

        <Card
          className={cn(
            "overflow-hidden border-8 transition-colors",
            selectedSignId && signStatuses[selectedSignId] === "correct" && "border-green-500",
            selectedSignId && signStatuses[selectedSignId] === "incorrect" && "border-red-500",
            (!selectedSignId || signStatuses[selectedSignId] === "idle") && "border-orange-500",
          )}
        >
          <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
            {cameraError ? (
              <div className="text-white text-center p-4">
                <p className="text-xl mb-2">Camera Error</p>
                <p className="text-sm text-red-400 mb-4">{cameraError}</p>
                <Button 
                  onClick={initCamera}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </Button>
              </div>
            ) : showStartButton ? (
              <div className="text-white text-center p-4">
                <p className="text-xl mb-4">Ready to start practicing?</p>
                <p className="text-sm text-gray-400 mb-6">Click the button below to initialize your camera</p>
                <Button 
                  onClick={initCamera}
                  variant="default"
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
                >
                  Start Camera
                </Button>
              </div>
            ) : isInitializing ? (
              <div className="text-white text-center">
                <p className="text-xl mb-2">Initializing Camera...</p>
                <p className="text-sm text-gray-400">Please allow camera access</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {!selectedSignId && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <p className="text-white text-xl">Select a sign below to start</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {detectedSign && (
          <div className="text-center">
            <p className="text-xl font-bold">Detected: {detectedSign}</p>
          </div>
        )}

        {/* Progress indicator */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Practice Progress:</span>
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{practiceProgress}%</span>
            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-2">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${practiceProgress}%` }}
              />
            </div>
          </div>
        </div>

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
            </button>
          ))}
        </div>
          </div>
        )

      case "quiz":
        return (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{currentSubLesson.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-lg text-center text-muted-foreground">
                    Quiz coming soon! Click Next to continue.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="default" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-4xl font-bold text-primary">{lesson.title.split(":")[1]?.trim() || lesson.title}</h1>
        </div>
        <Button 
          variant="default" 
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md px-6 py-2" 
          onClick={() => setIsModalOpen(true)}
        >
          <HelpCircle className="h-5 w-5" />
          How to Use?
        </Button>
      </div>

      {/* SubLesson Navigation */}
      <div className="mb-8 flex justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          {lesson.subLessons.map((subLesson, index) => (
            <button
              key={subLesson.id}
              onClick={() => setCurrentSubLessonIndex(index)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-lg border-2 transition-all min-w-[200px] justify-start hover:shadow-md",
                index === currentSubLessonIndex && "border-orange-500 bg-orange-50 dark:bg-orange-900/30 shadow-sm",
                index !== currentSubLessonIndex && "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700"
              )}
            >
              <div className="flex items-center justify-center w-6 h-6">
                {subLesson.completed ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className={cn(
                  "text-xs uppercase tracking-wide font-semibold",
                  index === currentSubLessonIndex ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"
                )}>
                  {index === 0 ? "Learn" : index === 1 ? "Practice" : "Quiz"}
                </span>
                <span className={cn(
                  "text-sm font-medium",
                  index === currentSubLessonIndex ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-300"
                )}>
                  {subLesson.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Lesson Progress</span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{lesson.progress}%</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${lesson.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SubLesson Content */}
      {renderSubLessonContent()}

      {/* Navigation Buttons */}
      <div className="mt-8 max-w-5xl mx-auto flex justify-between items-center gap-4">
        <Button
          size="lg"
          onClick={handlePrevious}
          disabled={currentSubLessonIndex === 0}
          className="px-8 disabled:opacity-40 bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold shadow-md"
          variant="default"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          PREVIOUS
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          {currentSubLessonIndex + 1} of {lesson.subLessons.length}
        </div>

          <Button
            size="lg"
          onClick={handleNext}
          className="px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md"
        >
          {currentSubLessonIndex === lesson.subLessons.length - 1 ? "FINISH" : "NEXT"}
          {currentSubLessonIndex < lesson.subLessons.length - 1 && (
            <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
          )}
          </Button>
      </div>

      <HowToUseModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
