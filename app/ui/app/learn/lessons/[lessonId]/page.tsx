"use client"

import { useState, useEffect } from "react"
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

  // Find the lesson
  let lesson = null
  for (const module of modules) {
    const found = module.lessons.find((l) => l.id === params.lessonId)
    if (found) {
      lesson = found
      break
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

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

    // Simulate camera detection after 2 seconds
    setTimeout(() => {
      // Simulate random correct/incorrect detection
      const isCorrect = Math.random() > 0.3
      setDetectedSign(signId.toUpperCase())
      setSignStatuses((prev) => ({ ...prev, [signId]: isCorrect ? "correct" : "incorrect" }))

      if (isCorrect) {
        // Move to next sign after 1 second
        setTimeout(() => {
          setSelectedSignId(null)
          setDetectedSign("")
        }, 1000)
      }
    }, 2000)
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
          <Button variant="outline" size="icon" onClick={() => router.back()}>
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
          <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
            <div className="text-white text-center">
              <p className="text-xl mb-2">Camera Feed</p>
              <p className="text-sm text-gray-400">
                {selectedSignId ? "Detecting hand signs..." : "Select a sign below to start"}
              </p>
            </div>
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
