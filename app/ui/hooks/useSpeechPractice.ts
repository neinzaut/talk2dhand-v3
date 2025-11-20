import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import { useWhisperRecognition } from "./useWhisperRecognition"

export interface UseSpeechPracticeOptions {
  correctAnswer: string
  language: "ASL" | "FSL"
}

const BASE_VARIANTS: Record<string, string[]> = {
  a: ["a", "ay", "ei", "ey"],
  b: ["b", "bee", "be"],
  c: ["c", "see", "sea", "cee"],
  d: ["d", "dee", "di", "the"],
  e: ["e", "ee"],
  f: ["f", "ef"],
  g: ["g", "gee", "ji"],
  h: ["h", "aitch"],
  i: ["i", "eye", "ai"],
  j: ["j", "jay", "je"],
  k: ["k", "kay", "kei"],
  l: ["l", "el"],
  m: ["m", "em"],
  n: ["n", "en"],
  o: ["o", "oh"],
  p: ["p", "pee", "pi"],
  q: ["q", "cue", "queue", "kyu"],
  r: ["r", "ar", "are"],
  s: ["s", "es"],
  t: ["t", "tee", "ti"],
  u: ["u", "you", "yoo", "yu"],
  v: ["v", "vee", "vi"],
  w: ["w", "double you", "doubleyou", "doubleu", "dubyu"],
  x: ["x", "ex"],
  y: ["y", "why", "wai"],
  z: ["z", "zee", "zed", "zi", "zay"],
}

const FSL_EXTRA_VARIANTS: Record<string, string[]> = {
  ch: ["ch", "tse", "che", "tsi", "ci", "cha", "chu", "chuh", "c-h", "ciao"],
  ng: ["ng", "eng", "ing", "nga", "nang", "n-g", "nguh"],
  ñ: ["ñ", "enye", "enyeh", "n-ye", "enyee", "enyay", "and yeah"],
}

const buildLetterLookup = (language: "ASL" | "FSL") => {
  const map: Record<string, string> = {}
  let maxTokens = 1

  const variants = {
    ...BASE_VARIANTS,
    ...(language === "FSL" ? FSL_EXTRA_VARIANTS : {}),
  }

  Object.entries(variants).forEach(([letter, forms]) => {
    forms.forEach((variant) => {
      const normalized = variant.trim().toLowerCase().replace(/\s+/g, " ")
      map[normalized] = letter
      map[normalized.replace(/\s+/g, "")] = letter
      const tokens = normalized.split(" ").length
      if (tokens > maxTokens) maxTokens = tokens
    })
    map[letter] = letter
  })

  return { map, maxTokens }
}

export function useSpeechPractice({ correctAnswer, language }: UseSpeechPracticeOptions) {
  const [spokenText, setSpokenText] = useState("")
  const [feedback, setFeedback] = useState("")
  const [micAllowed, setMicAllowed] = useState(true)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const { map: letterLookup, maxTokens } = useMemo(() => buildLetterLookup(language), [language])

  // Reset state when correctAnswer changes (user selects a new sign)
  useEffect(() => {
    setSpokenText("")
    setFeedback("")
    setIsCorrect(null)
  }, [correctAnswer])

  const normalizeTranscription = (input: string) =>
    input
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:"'-]/g, "")
      .replace(/\s+/g, " ")
      // Normalize common Whisper mis-hearings so "let there" still maps to a letter
      .replace(/\b(?:let\s*(?:there|their|her|er)|latter|later|leather)\b/g, "letter")

  const interpretLetter = (phrase: string) => {
    if (!phrase) return ""
    const cleaned = phrase.replace(/[^a-z0-9ñ\s]/g, " ").replace(/\s+/g, " ").trim()
    if (!cleaned) return ""

    const tokens = cleaned.split(" ").filter(Boolean)
    if (tokens.length === 0) return ""

    for (let size = Math.min(maxTokens, tokens.length); size >= 1; size--) {
      for (let start = tokens.length - size; start >= 0; start--) {
        const chunk = tokens.slice(start, start + size).join(" ")
        if (letterLookup[chunk]) return letterLookup[chunk]
      }
    }

    const squashed = tokens.join("")
    if (letterLookup[squashed]) return letterLookup[squashed]

    const lastToken = tokens[tokens.length - 1]
    if (lastToken && lastToken.length === 1) {
      return lastToken
    }
    return ""
  }

  const extractCandidateLetter = (normalizedInput: string) => {
    const interpreted = interpretLetter(normalizedInput)
    return {
      letter: interpreted,
      invalid: interpreted === "",
    }
  }

  // Use Whisper for offline speech recognition
  const whisper = useWhisperRecognition({
    language: language === "FSL" ? "fil" : "en",
    onResult: (text) => {
      console.log("📝 Whisper result:", text)
      const normalized = normalizeTranscription(text)
      const { letter, invalid } = extractCandidateLetter(normalized)

      if (invalid || !letter) {
        console.warn("⚠️ Invalid input detected:", text)
        setSpokenText("Invalid input")
        setFeedback("⚠️ Invalid input. Please say only the letter name.")
        setIsCorrect(null)
        toast.error("⚠️ Invalid input. Please say only the letter.")
        return
      }

      const displayText = letter.toUpperCase()
      setSpokenText(displayText)
      checkAnswer(letter)
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
    const cleanInput = normalizeTranscription(input)
    
    const cleanAnswer = correctAnswer
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:"'-]/g, "")
      .replace(/\s+/g, " ")
    
    console.log("Normalized input:", cleanInput)
    console.log("Cleaned answer:", cleanAnswer)

    const { letter } = extractCandidateLetter(cleanInput)
    const spokenLetter = letter?.toLowerCase() || ""
    const correct = spokenLetter === cleanAnswer

    console.log("Extracted letter:", spokenLetter, "| Expected:", cleanAnswer)

    console.log("Is correct?", correct)
    setIsCorrect(correct)
    
    if (correct) {
      setFeedback("✅ Correct!")
      toast.success("✅ Correct!")
    } else {
      setFeedback(`❌ Incorrect. Expected "${correctAnswer}".`)
      if (spokenLetter) {
        toast.error(`❌ Incorrect. You said "${spokenLetter.toUpperCase()}". Expected: "${cleanAnswer.toUpperCase()}"`)
      } else {
        toast.error("❌ Please say only the letter name.")
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

  const isListening = whisper.isRecording

  return {
    spokenText,
    feedback,
    isListening,
    isRecording: whisper.isRecording,
    isProcessing: whisper.isProcessing,
    micAllowed,
    isCorrect,
    isModelLoading: whisper.isModelLoading,
    startListening,
    stopListening,
    resetFeedback,
  }
}
