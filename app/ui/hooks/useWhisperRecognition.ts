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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") 
          ? "audio/webm" 
          : "audio/mp4"
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log("🛑 Recording stopped, processing audio...")
        stream.getTracks().forEach(track => track.stop())
        await processAudio()
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      toast.info("🎙️ Recording... Click stop when done.")

      // Auto-stop after 5 seconds
      setTimeout(() => {
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
    }
  }, [])

  // Process recorded audio with Whisper
  const processAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      console.warn("⚠️ No audio data to process")
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

      // Run Whisper transcription
      const result = await model(audioData, {
        language: language === "en" ? "english" : undefined,
        task: "transcribe",
        return_timestamps: false,
      }) as any

      const text = ((result.text || result[0]?.text || "") as string).trim()
      console.log("📝 Transcription result:", text)

      setTranscript(text)
      setIsProcessing(false)

      if (text) {
        toast.success(`✅ Detected: "${text}"`)
        if (onResult) onResult(text)
      } else {
        toast.warning("⚠️ No speech detected. Please try again.")
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
