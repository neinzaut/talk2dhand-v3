"use client"

import { useState, useRef } from "react"
import { useAppStore } from "@/store/app-store"
import { Mic, Shuffle } from "lucide-react"
import { HowToUseModal } from "@/components/how-to-use-modal"
import { toast } from "react-toastify"

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shuffledSigns, setShuffledSigns] = useState(signs)
  const recognitionRef = useRef<any>(null)

  // Microphone speech recognition logic
  const startListening = () => {
    if (!selectedSignId) {
      toast.error("Please select a sign before using the microphone.")
      return
    }

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
        const sign = shuffledSigns.find(s => s.id === selectedSignId)
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

  // Shuffle logic
  const shuffleSigns = () => {
    const arr = [...signs]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setShuffledSigns(arr)
    setSelectedSignId(null)
    setDetectedText("")
    setSignStatuses({})
  }

  // Keep shuffledSigns in sync with signs if language changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  if (shuffledSigns.length !== signs.length) setShuffledSigns(signs)

  const handleSignSelect = (signId: string) => {
    if (selectedSignId === signId) {
      setSelectedSignId(null)
      setDetectedText("")
      setSignStatuses(prev => ({ ...prev, [signId]: "idle" }))
    } else {
      setSelectedSignId(signId)
      setDetectedText("")
      setSignStatuses(prev => ({ ...prev, [signId]: "idle" }))
    }
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
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Audio to Sign</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setIsModalOpen(true)}
        >
          How to Use
        </button>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-blue-100 p-6 shadow-md">
            <Mic className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">Detected: {detectedText || "..."}</h2>
          <p className="text-gray-500 mt-2 text-center">
            Select a sign below, then click the microphone and say its name. Use the shuffle button for varied practice.
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-semibold">Progress</span>
            <span className="text-blue-600 font-bold">{shuffledSigns.length - Object.values(signStatuses).filter(status => status === "correct").length} / {shuffledSigns.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(Object.values(signStatuses).filter(status => status === "correct").length / shuffledSigns.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-center mt-6 gap-4">
          <button
            className="rounded-full bg-orange-100 hover:bg-orange-200 p-2 shadow flex items-center justify-center transition-all"
            onClick={shuffleSigns}
            aria-label="Shuffle signs"
          >
            <Shuffle className="h-6 w-6 text-orange-600" />
          </button>
          <button
            className="rounded-full bg-red-100 hover:bg-red-200 p-2 shadow flex items-center justify-center transition-all"
            onClick={() => {
              setSignStatuses({})
              setSelectedSignId(null)
              setDetectedText("")
            }}
            aria-label="Reset progress"
          >
            <span className="text-red-600 font-semibold">Reset</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-8 gap-4">
        {shuffledSigns.map(sign => (
          <button
            key={sign.id}
            className={`p-1 rounded-lg shadow-md border-4 ${getSignBorderColor(sign.id)} hover:shadow-lg hover:scale-105 transition-transform`}
            onClick={() => handleSignSelect(sign.id)}
          >
            <img src={getUnlabelledImageUrl(sign.id, currentLanguage)} alt="Unlabelled sign" className="w-full h-auto" />
          </button>
        ))}
      </div>

      <HowToUseModal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">How to Use Audio-to-Sign</h2>
          <ul className="list-disc ml-6 space-y-2 text-lg">
            <li>Select a sign from the grid below.</li>
            <li>Click the microphone button and say the name of the sign out loud.</li>
            <li>Watch as your spoken answer is detected and matched to the sign.</li>
            <li>
              Use the{' '}
              <Shuffle className="inline h-4 w-4 text-orange-600 align-text-bottom" />{' '}
              shuffle button to randomize the grid for more challenge.
            </li>
            <li>Green border = correct, red = incorrect, orange = selected.</li>
          </ul>
          <div className="mt-4 text-gray-600 text-sm">Tip: Make sure your browser supports speech recognition and allow microphone access.</div>
        </div>
      </HowToUseModal>
    </div>
  )
}