import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useWhisperRecognition } from "./useWhisperRecognition"

export interface UseSpeechPracticeOptions {
  correctAnswer: string
  language: "ASL" | "FSL"
}

export function useSpeechPractice({ correctAnswer, language }: UseSpeechPracticeOptions) {
  const [spokenText, setSpokenText] = useState("")
  const [feedback, setFeedback] = useState("")
  const [micAllowed, setMicAllowed] = useState(true)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // Use Whisper for offline speech recognition
  const whisper = useWhisperRecognition({
    language: language === "FSL" ? "fil" : "en",
    onResult: (text) => {
      console.log("📝 Whisper result:", text)
      setSpokenText(text)
      checkAnswer(text)
    },
    onError: (error) => {
      console.error("❌ Whisper error:", error)
      setFeedback(error)
    },
  })

  useEffect(() => {
    // Request microphone permission on mount
    console.log("🎙️ Checking microphone permission...")
    
    if (!navigator?.mediaDevices?.getUserMedia) {
      console.log("❌ getUserMedia not available")
      setMicAllowed(false)
      setFeedback("⚠️ Microphone not available in this browser.")
      toast.error("⚠️ Microphone not available in this browser.")
      return
    }

    let mounted = true
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        console.log("✅ Microphone permission granted")
        if (!mounted) return
        setMicAllowed(true)
      })
      .catch((err) => {
        console.error("❌ Microphone permission denied:", err)
        if (!mounted) return
        setMicAllowed(false)
        setFeedback("⚠️ Please enable microphone access to use this feature.")
        toast.error("⚠️ Please enable microphone access to use this feature.")
      })

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAnswer = (input: string) => {
    console.log("🔍 Checking answer...")
    console.log("Input:", input)
    console.log("Correct answer:", correctAnswer)
    
    // Remove punctuation and extra whitespace, convert to lowercase
    const cleanInput = input
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:"'-]/g, "") // Remove common punctuation
      .replace(/\s+/g, " ") // Normalize whitespace
    
    const cleanAnswer = correctAnswer
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:"'-]/g, "")
      .replace(/\s+/g, " ")
    
    console.log("Cleaned input:", cleanInput)
    console.log("Cleaned answer:", cleanAnswer)

    // Expected format: "letter [X]"
    const expectedPhrase = `letter ${cleanAnswer}`
    console.log("Expected phrase:", expectedPhrase)
    
    // Check if input matches "letter [X]" format
    const letterPattern = /^letter\s+([a-z0-9]+)$/i
    const match = cleanInput.match(letterPattern)
    
    let correct = false
    if (match) {
      const spokenLetter = match[1].toLowerCase()
      correct = spokenLetter === cleanAnswer
      console.log("Extracted letter:", spokenLetter, "| Expected:", cleanAnswer)
    } else {
      console.log("Input doesn't match 'letter X' format")
    }

    console.log("Is correct?", correct)
    setIsCorrect(correct)
    
    if (correct) {
      setFeedback("✅ Correct!")
      toast.success("✅ Correct!")
    } else {
      setFeedback(`❌ Incorrect. Say: "Letter ${correctAnswer}"`)
      if (match) {
        toast.error(`❌ Incorrect. You said: "Letter ${match[1]}". Expected: "Letter ${correctAnswer}"`)
      } else {
        toast.error(`❌ Please say: "Letter ${correctAnswer}"`)
      }
    }
  }

  const startListening = () => {
    console.log("🎤 startListening called (Whisper mode)")
    console.log("micAllowed:", micAllowed)
    console.log("correctAnswer:", correctAnswer)
    console.log("language:", language)
    
    if (!micAllowed) {
      console.log("❌ Mic not allowed")
      toast.error("⚠️ Microphone permission not granted.")
      return
    }
    
    // Prevent recording when no answer is set (avoids auto-restart bug)
    if (!correctAnswer || correctAnswer.trim() === "") {
      console.log("❌ No correct answer set")
      toast.error("⚠️ Please select a sign first.")
      return
    }

    // Start Whisper recording
    whisper.startRecording()
  }

  const stopListening = () => {
    console.log("⏹️ stopListening called")
    whisper.stopRecording()
  }

  const resetFeedback = () => {
    setSpokenText("")
    setFeedback("")
    setIsCorrect(null)
  }

  const isListening = whisper.isRecording || whisper.isProcessing

  return {
    spokenText,
    feedback,
    isListening,
    micAllowed,
    isCorrect,
    isModelLoading: whisper.isModelLoading,
    startListening,
    stopListening,
    resetFeedback,
  }
}
