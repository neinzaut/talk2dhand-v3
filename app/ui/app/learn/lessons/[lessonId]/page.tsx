"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { ArrowLeft, HelpCircle, CheckCircle, Circle } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useParams, useRouter } from "next/navigation"
import { HowToUseModal } from "@/components/how-to-use-modal"
import { Progress } from "@/components/shared/progress"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import QuizComponent from "@/components/learn-quiz/QuizComponent";

type SignStatus = "idle" | "correct" | "incorrect"

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { getCurrentModules, completeSubLesson, currentLanguage } = useAppStore()
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
  const [annotatedImage, setAnnotatedImage] = useState<string>("");
  const [backendError, setBackendError] = useState<string>("");
  const [clientId] = useState(() => `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);


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

  // Utility function to shuffle an array (used by other components)
  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };



  // Initialize camera function
  const initCamera = async () => {
    setIsInitializing(true)
    setCameraError(null)
    setShowStartButton(false)
    console.log('[initCamera] Initializing...');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('[initCamera] getUserMedia unsupported');
        throw new Error('getUserMedia is not supported in this browser');
      }
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[initCamera] Got camera stream:', stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('[initCamera] Set video srcObject:', videoRef.current);
        videoRef.current.oncanplay = () => {
          console.log('[initCamera] videoRef oncanplay fired');
          videoRef.current?.play().then(() => {
            console.log('[initCamera] Video playing, camera ready');
            setIsCameraReady(true);
            setIsInitializing(false);
          }).catch(err => {
            console.error('[initCamera] Error playing video:', err);
            setCameraError('Failed to start video playback');
            setIsInitializing(false);
            setShowStartButton(true);
          });
        };
        videoRef.current.onerror = (e) => {
          console.error('[initCamera] Video element error:', e);
          setCameraError('Failed to load video stream');
          setIsInitializing(false);
          setShowStartButton(true);
        };
      } else {
        console.warn('[initCamera] videoRef.current is null');
      }
    } catch (error) {
      console.error('[initCamera] Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. Please check permissions.';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        }
      }
      setCameraError(errorMessage);
      setIsInitializing(false);
      setShowStartButton(true);
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

  // Stop camera and detection when navigating away from practice
  useEffect(() => {
    if (currentSubLesson?.type !== "practice") {
      // Stop camera stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
      
      // Clear detection interval
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
      }
      
      // Reset camera states
      setIsCameraReady(false)
      setShowStartButton(true)
      setCameraError(null)
      setSelectedSignId(null)
      setDetectedSign("")
      setAnnotatedImage("")
      setBackendError("")
    }
  }, [currentSubLesson?.type])

  // Send frame to backend for detection
  const detectSign = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady || !selectedSignId) {
      console.warn('[detectSign] precondition failed', {
        video: !!videoRef.current,
        canvas: !!canvasRef.current,
        isCameraReady,
        selectedSignId
      });
      return;
    }
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Check if video is actually playing and has dimensions
    if (!video.videoWidth || !video.videoHeight) {
      console.warn('[detectSign] Video not ready, skipping detection', {
        width: video.videoWidth, height: video.videoHeight
      });
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('[detectSign] No canvas context');
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    console.log('[detectSign] video/canvas', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });
    console.log('[detectSign] imageData length:', imageData.length, 'preview:', imageData.slice(0, 50));
    // Only send valid images
    if (!imageData || imageData.length < 1000) {
      console.warn('[detectSign] image capture is blank or failed, not sending.');
      return;
    }
    try {
      // Determine which API to use based on lesson
      const isDynamicPhrases = lesson.id === "lesson-3";
      const apiUrl = isDynamicPhrases ? 'http://localhost:5008/predict' : 'http://localhost:8000/predict';
      
      const requestBody = isDynamicPhrases 
        ? { 
            image: imageData, 
            clientId: clientId,
            language: currentLanguage === "asl" ? "english" : "filipino"
          }
        : { image: imageData.split(',')[1] };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) throw new Error(`[detectSign] Backend error: ${response.status}`);
      const data = await response.json();
      
      if (data && data.prediction) {
        setDetectedSign(data.prediction.toUpperCase());
        setBackendError("");
        if (data.annotated_image) setAnnotatedImage(data.annotated_image);
        
        const predictedSign = data.prediction.toLowerCase();
        const expectedSign = selectedSignId.toLowerCase();
        
        if (predictedSign === expectedSign) {
          setSignStatuses((prev) => ({ ...prev, [selectedSignId]: 'correct' }));
          if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
          }
          setTimeout(() => {
            setSelectedSignId(null);
            setDetectedSign('');
            setAnnotatedImage("");
          }, 1000);
        } else {
          setSignStatuses((prev) => ({ ...prev, [selectedSignId]: 'incorrect' }));
        }
      } else if (data && data.success === false && data.error) {
        setDetectedSign('');
        setAnnotatedImage("");
        setBackendError(data.error);
      } else {
        setDetectedSign('');
        setAnnotatedImage("");
      }
    } catch (error) {
      console.error('[detectSign] Error detecting sign:', error);
      setDetectedSign('');
      setAnnotatedImage("");
      setBackendError('Failed to contact backend or process frame.');
    }
  }

  // Start/stop detection based on selected sign
  useEffect(() => {
    if (selectedSignId && isCameraReady) {
      // Use shorter interval for dynamic phrases to capture sequences better
      const interval = lesson.id === "lesson-3" ? 500 : 1000;
      detectionIntervalRef.current = setInterval(() => {
        detectSign()
      }, interval)
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
  }, [selectedSignId, isCameraReady, lesson.id])

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
      setTimer(0)
      setAnnotatedImage("")
      setBackendError("")
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
      setTimer(0)
      setAnnotatedImage("")
      setBackendError("")
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
                  {Array.isArray(currentSubLesson.videos) && currentSubLesson.videos.length > 0 && (
                    <div className="mt-10">
                      <h4 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-4">Watch</h4>
                      <p className="text-base leading-relaxed mb-6 text-gray-700 dark:text-gray-300">
                        Watch this short video to see how facial expressions, eye gaze, and body posture work together in real ASL conversation. Notice how each phrase combines hand movements with emotion and rhythm — this helps you understand not just what is being signed, but how meaning is expressed.
                      </p>
                      <div className="flex justify-center">
                        {currentSubLesson.videos.map((vid) => (
                          <div key={(vid.youtubeId || vid.url || vid.label) ?? Math.random()} className="w-full max-w-2xl">
                            <div className="aspect-video w-full overflow-hidden rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                              {vid.youtubeId ? (
                                <iframe
                                  className="w-full h-full"
                                  src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                                  title={vid.label || "Video"}
                                  loading="lazy"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                />
                              ) : vid.url ? (
                                <iframe
                                  className="w-full h-full"
                                  src={vid.url}
                                  title={vid.label || "Video"}
                                  loading="lazy"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                />
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
        </div>
              </CardContent>
            </Card>
      </div>
        )

      case "practice":
        return (
      <div className="max-w-4xl mx-auto space-y-6">
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
                {!selectedSignId && !isInitializing && !backendError && (
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
          <QuizComponent 
            signs={lesson.signs} 
            currentLanguage={currentLanguage}
            onComplete={(score) => {
              handleCompleteSubLesson();
              handleNext();
            }} 
          />
        );

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
              onClick={() => {
                setCurrentSubLessonIndex(index)
                // Reset states when navigating directly to a sublesson
                setSignStatuses({})
                setSelectedSignId(null)
                setDetectedSign("")
                setShowStartButton(true)
                setIsCameraReady(false)
                setTimer(0)
                setAnnotatedImage("")
                setBackendError("")
              }}
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
