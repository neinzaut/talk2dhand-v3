import { useState, useRef, useCallback } from "react"
import { pipeline, AutomaticSpeechRecognitionPipeline } from "@xenova/transformers"
import { toast } from "react-toastify"

export interface UseWhisperRecognitionOptions {
  language?: string // "en" for English, "fil" for Filipino
  onResult?: (text: string) => void
  onError?: (error: string) => void
}

export function useWhisperRecognition({
  language = "en",
  onResult,
  onError,
}: UseWhisperRecognitionOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const transcriber = useRef<AutomaticSpeechRecognitionPipeline | null>(null)
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Whisper model (lazy loading)
  const initializeModel = useCallback(async () => {
    if (transcriber.current) return transcriber.current

    try {
      setIsModelLoading(true)
      console.log("🤖 Loading Whisper model... This may take a minute on first load.")
      toast.info("🤖 Loading speech recognition model... Please wait.")

      // Use Whisper tiny model for faster loading (distil-whisper for even smaller)
      // Options: "Xenova/whisper-tiny", "Xenova/whisper-tiny.en", "Xenova/distil-whisper-large-v3"
      const modelName = language === "en" ? "Xenova/whisper-tiny.en" : "Xenova/whisper-tiny"
      
      transcriber.current = await pipeline(
        "automatic-speech-recognition",
        modelName,
        { quantized: true } // Use quantized model for smaller size
      )

      console.log("✅ Whisper model loaded successfully!")
      toast.success("✅ Speech recognition ready!")
      setIsModelLoading(false)
      return transcriber.current
    } catch (err) {
      console.error("❌ Failed to load Whisper model:", err)
      const errorMsg = "Failed to load speech recognition model. Please refresh and try again."
      setError(errorMsg)
      setIsModelLoading(false)
      toast.error(errorMsg)
      if (onError) onError(errorMsg)
      throw err
    }
  }, [language, onError])

  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      console.log("🎤 Starting audio recording...")
      setError(null)
      audioChunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      })
      
      // Create MediaRecorder with best available format
      let mimeType = "audio/webm;codecs=opus"
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm"
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4"
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "" // Let browser choose
          }
        }
      }
      
      console.log("🎙️ Using MIME type:", mimeType || "default")
      
      const mediaRecorder = new MediaRecorder(stream, 
        mimeType ? { mimeType } : undefined
      )

      mediaRecorder.ondataavailable = (event) => {
        console.log("📦 Data available:", event.data.size, "bytes")
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log("🛑 Recording stopped, total chunks:", audioChunksRef.current.length)
        stream.getTracks().forEach(track => {
          track.stop()
          console.log("🔇 Track stopped:", track.kind)
        })
        await processAudio()
      }

      // Start with timeslice to get data periodically
      mediaRecorder.start(100) // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      console.log("✅ Recording started")
      
      // Auto-stop after 5 seconds
      autoStopTimeoutRef.current = setTimeout(() => {
        console.log("⏱️ Auto-stopping after 5 seconds")
        if (mediaRecorder.state === "recording") {
          stopRecording()
        }
      }, 5000)

    } catch (err) {
      console.error("❌ Failed to start recording:", err)
      const errorMsg = "Failed to access microphone. Please check permissions."
      setError(errorMsg)
      toast.error(errorMsg)
      if (onError) onError(errorMsg)
    }
  }, [onError])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("⏹️ Stopping recording...")
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Clear auto-stop timeout
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current)
        autoStopTimeoutRef.current = null
      }
    }
  }, [])

  // Process recorded audio with Whisper
  const processAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      console.warn("⚠️ No audio data to process")
      toast.warning("⚠️ No audio detected. Please try again.")
      return
    }

    try {
      setIsProcessing(true)
      console.log("🔄 Processing audio with Whisper...")

      // Ensure model is loaded
      const model = await initializeModel()
      if (!model) throw new Error("Model not initialized")

      // Create blob from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
      console.log("📦 Audio blob size:", audioBlob.size, "bytes")

      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer()
      
      // Decode audio
      const audioContext = new AudioContext({ sampleRate: 16000 })
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // Get audio data as Float32Array (required by Whisper)
      const audioData = audioBuffer.getChannelData(0)
      
      console.log("🎵 Audio data length:", audioData.length)
      console.log("🎵 Audio duration:", audioBuffer.duration, "seconds")
      console.log("🎵 Sample rate:", audioBuffer.sampleRate)
      
      // Check if audio is too short
      if (audioData.length < 1600) { // Less than 0.1 seconds at 16kHz
        console.warn("⚠️ Audio too short:", audioData.length, "samples")
        toast.warning("⚠️ Audio too short. Please speak longer.")
        setIsProcessing(false)
        return
      }

      // Check if audio is silent (all zeros or very low amplitude)
      const maxAmplitude = Math.max(...Array.from(audioData).map(Math.abs))
      console.log("🔊 Max amplitude:", maxAmplitude)
      
      if (maxAmplitude < 0.01) {
        console.warn("⚠️ Audio appears to be silent")
        toast.warning("⚠️ No speech detected. Please speak louder.")
        setIsProcessing(false)
        return
      }

      console.log("🤖 Running Whisper transcription...")
      
      // Run Whisper transcription
      const result = await model(audioData, {
        language: language === "en" ? "english" : undefined,
        task: "transcribe",
        return_timestamps: false,
        chunk_length_s: 30,
        stride_length_s: 5,
      }) as any

      console.log("📋 Raw Whisper result:", result)
      
      const text = ((result.text || result[0]?.text || "") as string).trim()
      console.log("📝 Transcription result:", text)

      setTranscript(text)
      setIsProcessing(false)

      if (text) {
        toast.success(`✅ Detected: "${text}"`)
        if (onResult) onResult(text)
      } else {
        console.warn("⚠️ Empty transcription result")
        toast.warning("⚠️ No speech detected. Please try speaking more clearly.")
      }

    } catch (err) {
      console.error("❌ Failed to process audio:", err)
      const errorMsg = "Failed to process audio. Please try again."
      setError(errorMsg)
      setIsProcessing(false)
      toast.error(errorMsg)
      if (onError) onError(errorMsg)
    }
  }, [initializeModel, language, onResult, onError])

  // Toggle recording
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  return {
    isRecording,
    isProcessing,
    isModelLoading,
    transcript,
    error,
    startRecording,
    stopRecording,
    toggleRecording,
  }
}
