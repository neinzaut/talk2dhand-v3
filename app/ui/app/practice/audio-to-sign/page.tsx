"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/store/app-store"
import { Mic, Shuffle, Keyboard } from "lucide-react"
import { HowToUseModal } from "@/components/how-to-use-modal"
import { toast } from "react-toastify"
import { useSpeechPractice } from "@/hooks/useSpeechPractice"

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
  // Filter out FSL-specific letters (ch, ng, ñ) when in ASL mode
  const allSigns = lesson?.signs || []
  const signs = currentLanguage === "asl" 
    ? allSigns.filter(sign => !['ch', 'ng', 'enye'].includes(sign.id))
    : allSigns

  const [selectedSignId, setSelectedSignId] = useState<string | null>(null)
  const [signStatuses, setSignStatuses] = useState<Record<string, SignStatus>>({})
  const [detectedText, setDetectedText] = useState<string>("")
  const [textInput, setTextInput] = useState<string>("")
  const [inputMode, setInputMode] = useState<"mic" | "text">("mic")
  const [lastCheckedSignId, setLastCheckedSignId] = useState<string | null>(null)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  
  // Auto-select first sign on mount to avoid null ID
  useEffect(() => {
    if (!selectedSignId && signs.length > 0) {
      console.log("🎯 Auto-selecting first sign:", signs[0].id)
      setSelectedSignId(signs[0].id)
    }
  }, [signs, selectedSignId])
  
  // Log when selected sign changes (not on every render)
  useEffect(() => {
    if (selectedSignId) {
      const sign = signs.find(s => s.id === selectedSignId)
      console.log("🏷️ Selected sign changed:", sign?.label, "for ID:", selectedSignId)
    }
  }, [selectedSignId, signs])
  
  // speech hook will handle mic and recognition
  // Memoize to prevent unnecessary recalculations
  const currentSignLabel = (() => {
    const s = signs.find(s => s.id === selectedSignId)
    return s?.label || ""
  })()

  const {
    spokenText,
    feedback,
    isListening,
    isRecording,
    isProcessing,
    micAllowed,
    isCorrect,
    isModelLoading,
    startListening,
    stopListening,
    resetFeedback,
  } = useSpeechPractice({ correctAnswer: currentSignLabel, language: currentLanguage === "asl" ? "ASL" : "FSL" })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shuffledSigns, setShuffledSigns] = useState(signs)

  // Update sign status when answer is checked (only for the sign that was actually checked)
  useEffect(() => {
    if (selectedSignId && isCorrect !== null && lastCheckedSignId === selectedSignId) {
      setSignStatuses(prev => ({ 
        ...prev, 
        [selectedSignId]: isCorrect ? "correct" : "incorrect" 
      }))
    }
  }, [isCorrect, selectedSignId, lastCheckedSignId])

  // Microphone speech recognition logic
  const startMic = () => {
    console.log("🎯 Start mic clicked")
    console.log("Selected sign ID:", selectedSignId)
    console.log("Current sign label:", currentSignLabel)
    
    if (!selectedSignId) {
      toast.error("Please select a sign before using the microphone.")
      return
    }
    // Show instruction to user
    toast.info(`🎤 Say: "${currentSignLabel}"`, { autoClose: 2000 })
    
    // reset previous feedback and detected text
    setDetectedText("")
    setTextInput("")
    setLastCheckedSignId(selectedSignId)
    resetFeedback()
    startListening()
  }

  // Text input check logic
  const checkTextInput = () => {
    if (!selectedSignId) {
      toast.error("Please select a sign before submitting.")
      return
    }
    
    if (!textInput.trim()) {
      toast.error("Please type your answer.")
      return
    }

    console.log("📝 Checking text input:", textInput)
    console.log("Expected:", currentSignLabel)
    
    const normalizedInput = textInput.trim().toLowerCase()
    const normalizedAnswer = currentSignLabel.trim().toLowerCase()
    
    // Check for "letter X" format or just "X"
    const letterPattern = /^letter\s+([a-z0-9]+)$/i
    const match = normalizedInput.match(letterPattern)
    
    let correct = false
    if (match) {
      correct = match[1].toLowerCase() === normalizedAnswer
    } else {
      // Allow just the letter too
      correct = normalizedInput === normalizedAnswer
    }
    
    console.log("Is correct?", correct)
    
    // Track which sign was checked and update sign status
    setLastCheckedSignId(selectedSignId)
    setSignStatuses(prev => ({ 
      ...prev, 
      [selectedSignId]: correct ? "correct" : "incorrect" 
    }))
    
    // Show feedback
    if (correct) {
      toast.success("✅ Correct!")
    } else {
      toast.error(`❌ Incorrect. Expected: "${currentSignLabel}"`)
    }
    
    // Clear input
    setTextInput("")
  }

  // Handle Enter key in text input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkTextInput()
    }
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
    setTextInput("")
    setSignStatuses({})
    setLastCheckedSignId(null)
  }

  // Keep shuffledSigns in sync with signs if language changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  if (shuffledSigns.length !== signs.length) setShuffledSigns(signs)

  const handleSignSelect = (signId: string) => {
    if (selectedSignId === signId) {
      setSelectedSignId(null)
      setDetectedText("")
      setTextInput("")
      setLastCheckedSignId(null)
      resetFeedback()
    } else {
      setSelectedSignId(signId)
      setDetectedText("")
      setTextInput("")
      setLastCheckedSignId(null)
      resetFeedback()
      // Don't set status to idle - preserve correct/incorrect status
    }
  }

  const getSignBorderColor = (signId: string) => {
    // Selected sign always gets orange border
    if (selectedSignId === signId) return "border-orange-500"
    
    // Otherwise show correct/incorrect status
    const status = signStatuses[signId]
    if (status === "correct") return "border-green-500"
    if (status === "incorrect") return "border-red-500"
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
          {/* Input Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-lg transition ${
                inputMode === "mic" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setInputMode("mic")}
            >
              <Mic className="inline h-4 w-4 mr-2" />
              Voice
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition ${
                inputMode === "text" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setInputMode("text")}
            >
              <Keyboard className="inline h-4 w-4 mr-2" />
              Keyboard
            </button>
          </div>

          {/* Microphone Mode */}
          {inputMode === "mic" && (
            <>
              {isModelLoading && (
                <div className="mb-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-blue-600 font-semibold mt-2">Loading AI model... (First time only, ~50MB)</p>
                  <p className="text-gray-500 text-sm">This may take 1-2 minutes. The model will be cached for future use.</p>
                </div>
              )}
              
              <div className="flex gap-4 items-center">
                {/* Record button */}
                <button
                  className={`rounded-full p-6 shadow-md transition-all ${
                    isModelLoading
                      ? "bg-gray-300 cursor-not-allowed"
                      : isRecording 
                      ? "bg-red-500 animate-pulse" 
                      : selectedSignId 
                      ? "bg-blue-500 hover:bg-blue-600 cursor-pointer" 
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                  onClick={startMic}
                  disabled={!selectedSignId || isModelLoading || isRecording || isProcessing}
                  aria-label="Start microphone"
                >
                  <Mic className={`h-12 w-12 ${isRecording ? "text-white" : selectedSignId && !isModelLoading ? "text-white" : "text-gray-500"}`} />
                </button>
                
                {/* Stop button - only show when recording */}
                {isRecording && (
                  <button
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
                    onClick={stopListening}
                    aria-label="Stop recording"
                  >
                    ⏹️ Stop
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-700 mt-4">
                {isRecording
                  ? "🎙️ Recording... Click STOP when done!"
                  : isProcessing
                  ? "⏳ Processing your answer..."
                  : `Detected: ${spokenText || detectedText || "..."}`}
              </h2>
              {isProcessing && (
                <div className="mt-2 flex items-center gap-2 text-blue-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <p className="font-semibold text-sm">Hang tight—analyzing what you just said.</p>
                </div>
              )}
              <p className="text-gray-500 mt-2 text-center max-w-md">
                <strong>How to use:</strong> Select a sign, click 🎤, then clearly say <strong>only the letter name</strong><br/>
                (e.g., <strong>"A"</strong>, <strong>"B"</strong>{currentLanguage === "fsl" && <>, <strong>"Ch"</strong>, <strong>"Ng"</strong>, <strong>"Ñ"</strong></>}). 
                Click <strong>⏹️ Stop</strong> when finished, or it will auto-stop after 5 seconds. <span className="text-blue-600">Works offline!</span>
              </p>
            </>
          )}

          {/* Text Input Mode */}
          {inputMode === "text" && (
            <>
              <div className="rounded-full bg-green-100 p-6 shadow-md">
                <Keyboard className="h-12 w-12 text-green-600" />
              </div>
              <div className="mt-4 w-full max-w-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type the sign name..."
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    disabled={!selectedSignId}
                  />
                  <button
                    onClick={checkTextInput}
                    disabled={!selectedSignId || !textInput.trim()}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      selectedSignId && textInput.trim()
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Check
                  </button>
                </div>
              </div>
              <p className="text-gray-500 mt-2 text-center">
                Select a sign below, type its name, and press Enter or click Check.
              </p>
            </>
          )}
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
              setTextInput("")
              setLastCheckedSignId(null)
              resetFeedback()
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
        {/* DEBUGGING */}
      <div className="mt-6 flex flex-col items-center">
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="text-sm text-gray-400 hover:text-gray-800 pb-2"
        >
          {showDebugInfo ? "Hide" : "Show"} More Information
        </button>
        
        {showDebugInfo && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 w-full">
            <h3 className="font-bold text-lg mb-2">🔍 Detailed Information:</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Recognition Engine:</strong> 🤖 Whisper AI (Offline-capable)</p>
              <p><strong>Model Status:</strong> {isModelLoading ? "⏳ Loading..." : "✅ Ready"}</p>
              <p><strong>Mic Allowed:</strong> {micAllowed ? "✅ Yes" : "❌ No"}</p>
              <p><strong>Is Listening:</strong> {isListening ? "🎙️ Yes" : "❌ No"}</p>
              <p><strong>Input Mode:</strong> {inputMode === "mic" ? "🎤 Voice" : "⌨️ Keyboard"}</p>
              <p><strong>Selected Sign:</strong> {selectedSignId || "None"}</p>
              <p><strong>Target Answer:</strong> {currentSignLabel || "None"}</p>
              <p><strong>Your Input:</strong> {spokenText || textInput || "..."}</p>
              <p><strong>Result:</strong> {feedback || "..."}</p>
              <p><strong>Status:</strong> {isCorrect === null ? "Not checked" : isCorrect ? "✅ Correct" : "❌ Incorrect"}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">Check browser console (F12) for detailed logs</p>
          </div>
        )}
      </div>

      {/* <div className="mt-4">
        {!micAllowed && <p className="text-red-500 font-bold text-lg">{feedback}</p>}
        {spokenText && <p className="text-blue-700 font-semibold text-lg">You said: "{spokenText}"</p>}
        {feedback && micAllowed && <p className="text-gray-800 font-semibold text-lg">{feedback}</p>}
      </div> */}

      <HowToUseModal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="text-base space-y-4 pt-4">
          <div>
            <p className="font-bold text-lg mb-2">🎙️ Voice Recognition (Offline AI)</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Select a sign, click 🎤 microphone, say the letter clearly</li>
              <li>AI transcribes and checks automatically (uses Whisper AI)</li>
              <li>First use: downloads ~50MB model (1-2 min), then cached</li>
              <li>Stop button or 5-second auto-stop available</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-lg mb-2">⌨️ Text Input Mode</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Select a sign and type the letter name</li>
              <li>Press Enter or click Check to verify</li>
              <li>Perfect for silent practice</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-lg mb-2">Tips</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use <Shuffle className="inline h-3 w-3 align-text-bottom" /> to shuffle the grid</li>
              <li>Green = correct, Red = incorrect, Orange = selected</li>
            </ul>
          </div>
        </div>
      </HowToUseModal>
    </div>
  )
}