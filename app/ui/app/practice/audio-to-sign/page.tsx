"use client"

import { useState, useRef } from "react"
import { useAppStore } from "@/store/app-store"
import { cn } from "@/lib/utils"
import { Mic, CheckCircle, Circle } from "lucide-react"

const getUnlabelledImageUrl = (signId: string, language: string) => {
  if (language === "asl") return `/images/asl-unlabelled/${signId}.png`
  if (language === "fsl") return `/images/fsl-unlabelled/${signId}.png`
  return ""
}

type SignStatus = "idle" | "correct" | "incorrect"

export default function AudioToSignPage() {
  const { currentLanguage, getCurrentModules } = useAppStore()
  // Get all signs from first module, first lesson (alphabets)
  const modules = getCurrentModules()
  const lesson = modules[0]?.lessons[0]
  const signs = lesson?.signs || []

  const [selectedSignId, setSelectedSignId] = useState<string | null>(null)
  const [signStatuses, setSignStatuses] = useState<Record<string, SignStatus>>({})
  const [detectedText, setDetectedText] = useState<string>("")
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Microphone speech recognition logic
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser.')
      return
    }
    setDetectedText("")
    setIsListening(true)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = currentLanguage === "asl" ? "en-US" : "fil-PH"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim()
      setDetectedText(transcript)
      setIsListening(false)
      // Check answer
      if (selectedSignId) {
        const sign = signs.find(s => s.id === selectedSignId)
        if (sign) {
          const correct = transcript.toLowerCase() === sign.label.toLowerCase()
          setSignStatuses(prev => ({ ...prev, [selectedSignId]: correct ? "correct" : "incorrect" }))
        }
      }
    }
    recognition.onerror = () => {
      setIsListening(false)
    }
    recognition.onend = () => {
      setIsListening(false)
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  const handleSignSelect = (signId: string) => {
    setSelectedSignId(signId)
    setDetectedText("")
    setSignStatuses(prev => ({ ...prev, [signId]: "idle" }))
  }

  const getSignBorderColor = (signId: string) => {
    const status = signStatuses[signId]
    if (status === "correct") return "border-green-500"
    if (status === "incorrect") return "border-red-500"
    if (selectedSignId === signId) return "border-orange-500"
    return "border-gray-300"
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Practice by Audio</h1>
      <div className="flex flex-col items-center mb-8">
        <div className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-md p-6 w-full max-w-xl">
          <button
            className={cn(
              "rounded-full bg-blue-100 hover:bg-blue-200 p-6 shadow-lg border-4 border-blue-400 flex items-center justify-center transition-all",
              isListening && "animate-pulse border-blue-600"
            )}
            onClick={startListening}
            disabled={isListening || !selectedSignId}
            aria-label="Start audio input"
          >
            <Mic className="h-12 w-12 text-blue-600" />
          </button>
          <div className="text-2xl font-semibold text-gray-700 mt-2">
            Detected: {detectedText ? <span className="text-blue-700">{detectedText}</span> : <span className="text-gray-400">...</span>}
          </div>
          <div className="text-sm text-gray-500">Select a sign below, then click the microphone and say its name.</div>
        </div>
      </div>
      <div className="grid grid-cols-8 gap-4 justify-center">
        {signs.map(sign => (
          <button
            key={sign.id}
            className={cn(
              "aspect-square w-20 h-20 rounded-xl border-4 flex items-center justify-center bg-white shadow-md transition-all",
              getSignBorderColor(sign.id),
              selectedSignId === sign.id && "ring-2 ring-orange-400"
            )}
            onClick={() => handleSignSelect(sign.id)}
            aria-label={`Select sign ${sign.label}`}
          >
            <img
              src={getUnlabelledImageUrl(sign.id, currentLanguage)}
              alt={`Sign for ${sign.label}`}
              className="w-16 h-16 object-contain"
            />
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span className="text-green-700 font-semibold">Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-6 w-6 text-orange-500" />
            <span className="text-orange-700 font-semibold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-6 w-6 text-red-500" />
            <span className="text-red-700 font-semibold">Incorrect</span>
          </div>
        </div>
      </div>
    </div>
  )
}