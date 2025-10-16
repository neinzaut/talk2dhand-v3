"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/app-store"
import { aslData } from "@/store/data/asl-data"
import { fslData } from "@/store/data/fsl-data"

type SignStatus = "idle" | "correct" | "incorrect"

export default function TextToSignPage() {
  const router = useRouter()
  const currentLanguage = useAppStore((state) => state.currentLanguage)

  // Toggle for letter display mode
  const [showSignImages, setShowSignImages] = useState(false)

  const [inputText, setInputText] = useState("")
  const [letters, setLetters] = useState<string[]>([])
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number | null>(null)
  const [signStatuses, setSignStatuses] = useState<Record<number, SignStatus>>({})
  const [detectedSign, setDetectedSign] = useState<string>("")
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [showStartButton, setShowStartButton] = useState(true)
  const [annotatedImage, setAnnotatedImage] = useState<string>("")
  const [backendError, setBackendError] = useState<string>("")
  const [isPracticing, setIsPracticing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize camera function
  const initCamera = async () => {
    setIsInitializing(true)
    setCameraError(null)
    setShowStartButton(false)
    console.log('[initCamera] Initializing...')
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('[initCamera] getUserMedia unsupported')
        throw new Error('getUserMedia is not supported in this browser')
      }
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('[initCamera] Got camera stream:', stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        console.log('[initCamera] Set video srcObject:', videoRef.current)
        videoRef.current.oncanplay = () => {
          console.log('[initCamera] videoRef oncanplay fired')
          videoRef.current?.play().then(() => {
            console.log('[initCamera] Video playing, camera ready')
            setIsCameraReady(true)
            setIsInitializing(false)
          }).catch(err => {
            console.error('[initCamera] Error playing video:', err)
            setCameraError('Failed to start video playback')
            setIsInitializing(false)
            setShowStartButton(true)
          })
        }
        videoRef.current.onerror = (e) => {
          console.error('[initCamera] Video element error:', e)
          setCameraError('Failed to load video stream')
          setIsInitializing(false)
          setShowStartButton(true)
        }
      } else {
        console.warn('[initCamera] videoRef.current is null')
      }
    } catch (error) {
      console.error('[initCamera] Error accessing camera:', error)
      let errorMessage = 'Unable to access camera. Please check permissions.'
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions and try again.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.'
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
    if (!videoRef.current || !canvasRef.current || !isCameraReady || currentLetterIndex === null) {
      console.warn('[detectSign] precondition failed', {
        video: !!videoRef.current,
        canvas: !!canvasRef.current,
        isCameraReady,
        currentLetterIndex
      })
      return
    }
    const canvas = canvasRef.current
    const video = videoRef.current

    // Check if video is actually playing and has dimensions
    if (!video.videoWidth || !video.videoHeight) {
      console.warn('[detectSign] Video not ready, skipping detection', {
        width: video.videoWidth, height: video.videoHeight
      })
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.warn('[detectSign] No canvas context')
      return
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = canvas.toDataURL('image/jpeg')
    console.log('[detectSign] video/canvas', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    })
    console.log('[detectSign] imageData length:', imageData.length, 'preview:', imageData.slice(0, 50))
    // Only send valid images
    if (!imageData || imageData.length < 1000) {
      console.warn('[detectSign] image capture is blank or failed, not sending.')
      return
    }
    try {
      const apiUrl = 'http://localhost:8000/predict'
      const requestBody = { image: imageData.split(',')[1] }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) throw new Error(`[detectSign] Backend error: ${response.status}`)
      const data = await response.json()
      
      if (data && data.prediction) {
        setDetectedSign(data.prediction.toUpperCase())
        setBackendError("")
        if (data.annotated_image) setAnnotatedImage(data.annotated_image)
        
        const predictedSign = data.prediction.toLowerCase()
        const expectedSign = letters[currentLetterIndex].toLowerCase()
        
        if (predictedSign === expectedSign) {
          setSignStatuses((prev) => ({ ...prev, [currentLetterIndex]: 'correct' }))
          if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current)
            detectionIntervalRef.current = null
          }
          setTimeout(() => {
            // Move to next letter
            if (currentLetterIndex < letters.length - 1) {
              setCurrentLetterIndex(currentLetterIndex + 1)
            } else {
              // All letters completed
              setCurrentLetterIndex(null)
              setDetectedSign('')
              setAnnotatedImage("")
            }
          }, 1000)
        } else {
          setSignStatuses((prev) => ({ ...prev, [currentLetterIndex]: 'incorrect' }))
        }
      } else if (data && data.success === false && data.error) {
        setDetectedSign('')
        setAnnotatedImage("")
        setBackendError(data.error)
      } else {
        setDetectedSign('')
        setAnnotatedImage("")
      }
    } catch (error) {
      console.error('[detectSign] Error detecting sign:', error)
      setDetectedSign('')
      setAnnotatedImage("")
      setBackendError('Failed to contact backend or process frame.')
    }
  }

  // Start/stop detection based on current letter
  useEffect(() => {
    if (currentLetterIndex !== null && isCameraReady && isPracticing) {
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
  }, [currentLetterIndex, isCameraReady, isPracticing])

  const handleSubmit = () => {
    if (!inputText.trim()) return
    
    // Convert input to array of letters/numbers (filter out spaces and special chars if needed)
    const chars = inputText.toUpperCase().split('').filter(char => /[A-Z0-9]/.test(char))
    setLetters(chars)
    setSignStatuses({})
    setCurrentLetterIndex(0)
    setIsPracticing(true)
    setDetectedSign('')
    setAnnotatedImage("")
    setBackendError("")
    
    // Initialize camera if not already ready
    if (!isCameraReady && !showStartButton) {
      initCamera()
    }
  }

  const handleClear = () => {
    setInputText("")
    setLetters([])
    setCurrentLetterIndex(null)
    setSignStatuses({})
    setDetectedSign('')
    setAnnotatedImage("")
    setBackendError("")
    setIsPracticing(false)
  }

  const handleLetterClick = (index: number) => {
    if (signStatuses[index] === "correct") return // Can't select already correct letters
    setCurrentLetterIndex(index)
    setSignStatuses((prev) => ({ ...prev, [index]: "idle" }))
    setDetectedSign("")
    setAnnotatedImage("")
    setBackendError("")
  }

  const getLetterBorderColor = (index: number) => {
    const status = signStatuses[index]
    if (status === "correct") return "border-green-500 bg-green-50"
    if (status === "incorrect") return "border-red-500 bg-red-50"
    if (currentLetterIndex === index) return "border-orange-500 bg-orange-50"
    return "border-gray-300 bg-white"
  }

  const completedLetters = Object.values(signStatuses).filter((s) => s === "correct").length
  const practiceProgress = letters.length > 0 ? Math.round((completedLetters / letters.length) * 100) : 0

  // Get the correct sign data for the current language
  const signData = currentLanguage === "asl"
    ? [...aslData.modules[0].lessons[0].signs, ...aslData.modules[0].lessons[1].signs]
    : [...fslData.modules[0].lessons[0].signs]

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="default" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold">Text-to-Sign</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Type a word, then sign each letter correctly
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Input Section */}
        {!isPracticing && (
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <div className="space-y-4">
              <label className="text-2xl font-bold text-gray-800 block mb-2">Enter a word or phrase to sign:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Type here..."
                  className="flex-1 px-4 py-3 text-lg border-2 border-blue-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!inputText.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-lg rounded-none rounded-r-lg shadow-sm"
                >
                  Go
                </Button>
                <Button
                  onClick={handleClear}
                  className="ml-2 px-6 py-3 text-lg rounded-lg border-blue-200 bg-white hover:bg-blue-50"
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Toggle for letter display mode */}
        {isPracticing && (
          <div className="flex justify-center mb-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSignImages}
                onChange={() => setShowSignImages((v) => !v)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-base font-medium text-gray-700">Show sign images</span>
            </label>
          </div>
        )}

        {/* Practice Section */}
        {isPracticing && (
          <>
            {/* Letters Display */}
            {letters.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                {letters.map((letter, index) => {
                  const sign = signData.find(s => s.label.toUpperCase() === letter.toUpperCase())
                  return (
                    <button
                      key={index}
                      onClick={() => handleLetterClick(index)}
                      disabled={signStatuses[index] === "correct"}
                      className={cn(
                        "w-16 h-16 rounded-xl border-4 transition-all hover:scale-105 disabled:cursor-not-allowed flex items-center justify-center text-2xl font-bold bg-white",
                        getLetterBorderColor(index)
                      )}
                    >
                      {showSignImages && sign && sign.imageUrl ? (
                        <img src={sign.imageUrl} alt={sign.label} className="w-12 h-12 object-contain" />
                      ) : (
                        letter
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Camera Section */}
            <Card
              className={cn(
                "overflow-hidden border-8 transition-colors",
                currentLetterIndex !== null && signStatuses[currentLetterIndex] === "correct" && "border-green-500",
                currentLetterIndex !== null && signStatuses[currentLetterIndex] === "incorrect" && "border-red-500",
                (currentLetterIndex === null || signStatuses[currentLetterIndex] === "idle") && "border-orange-500",
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
                ) : (
                  <>
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ display: annotatedImage ? "none" : "block" }}
                      />
                      {annotatedImage && (
                        <img
                          src={annotatedImage}
                          alt="Backend annotated hand landmarks"
                          className="absolute top-0 left-0 w-full h-full object-cover z-30"
                        />
                      )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    {isInitializing && (
                      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
                        <div className="text-white text-center">
                          <p className="text-xl mb-2">Initializing Camera...</p>
                          <p className="text-sm text-gray-400">Please allow camera access</p>
                        </div>
                      </div>
                    )}
                    {backendError && !isInitializing && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="rounded bg-red-700/70 text-white px-6 py-3 text-lg font-semibold shadow-lg border border-red-400/60">
                          {backendError}
                        </span>
                      </div>
                    )}
                    {currentLetterIndex === null && !isInitializing && !backendError && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <p className="text-white text-xl">Select a letter above to start</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Detection Feedback */}
            {detectedSign && (
              <div className="text-center">
                <p className="text-xl font-bold">Detected: {detectedSign}</p>
              </div>
            )}

            {/* Progress indicator */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress:</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{practiceProgress}%</span>
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-2">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${practiceProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Real-time detection active</span>
              </div>
            </div>

            {/* Restart Button */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleClear}
                className="px-6 py-2"
              >
                Try Another Word
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}