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

      // Use Whisper base model for better short-phrase detection
      // whisper-tiny.en is too aggressive at filtering, base.en handles short phrases better
      // For FSL, users still speak letter names in English (e.g., "A", "B", "Ch", "Ng")
      // so we use the English model for both ASL and FSL
      const modelName = "Xenova/whisper-base.en"
      
      console.log("🤖 Loading model:", modelName)
      
      transcriber.current = await pipeline(
        "automatic-speech-recognition",
        modelName,
        { 
          quantized: true, // Use quantized model for smaller size
          // revision: "main", // Use latest version
        }
      )
      
      console.log("✅ Model loaded, type:", typeof transcriber.current)

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
      let audioData = audioBuffer.getChannelData(0)
      
      console.log("🎵 Audio data length:", audioData.length)
      console.log("🎵 Audio duration:", audioBuffer.duration, "seconds")
      console.log("🎵 Sample rate:", audioBuffer.sampleRate)
      
      // Trim silence from beginning and end
      const threshold = 0.003
      let start = 0
      let end = audioData.length - 1
      
      // Find first non-silent sample
      while (start < audioData.length && Math.abs(audioData[start]) < threshold) {
        start++
      }
      
      // Find last non-silent sample
      while (end > start && Math.abs(audioData[end]) < threshold) {
        end--
      }
      
      // Add small padding (approx. 0.1s) to avoid trimming spoken letters
      start = Math.max(0, start - 1600)
      end = Math.min(audioData.length - 1, end + 1600)
      
      // Extract trimmed audio
      if (start < end) {
        audioData = audioData.slice(start, end + 1)
        console.log("✂️ Trimmed audio from", start, "to", end, "= new length:", audioData.length, "samples")
      }
      
      // Check if audio is too short (allow 0.3 seconds minimum for "Letter A")
      if (audioData.length < 4800) { // Less than 0.3 seconds at 16kHz
        console.warn("⚠️ Audio too short:", audioData.length, "samples (", audioBuffer.duration.toFixed(2), "seconds)")
        toast.warning("⚠️ Audio too short. Please say 'Letter' + the letter.")
        setIsProcessing(false)
        return
      }

      // Check if audio is silent (all zeros or very low amplitude)
      const maxAmplitude = Math.max(...Array.from(audioData).map(Math.abs))
      const avgAmplitude = Array.from(audioData).reduce((sum, val) => sum + Math.abs(val), 0) / audioData.length
      console.log("🔊 Max amplitude:", maxAmplitude)
      console.log("🔊 Avg amplitude:", avgAmplitude)
      
      // Normalize audio to use full dynamic range (helps Whisper detect speech)
      if (maxAmplitude > 0.01) {
        const normalized = new Float32Array(audioData.length)
        const normFactor = 0.95 / maxAmplitude // Normalize to 95% to avoid clipping
        for (let i = 0; i < audioData.length; i++) {
          normalized[i] = audioData[i] * normFactor
        }
        audioData = normalized
        console.log("📊 Normalized audio, peak factor:", normFactor.toFixed(3))
      }
      
      if (maxAmplitude < 0.01) {
        console.warn("⚠️ Audio appears to be silent (max amplitude too low)")
        toast.warning("⚠️ No speech detected. Please speak louder.")
        setIsProcessing(false)
        return
      }
      
      if (avgAmplitude < 0.001) {
        console.warn("⚠️ Audio appears to be mostly silent (avg amplitude too low)")
        toast.warning("⚠️ Audio too quiet. Please speak louder.")
        setIsProcessing(false)
        return
      }

      console.log("🤖 Running Whisper transcription...")
      console.log("🎵 Passing audio to Whisper - length:", audioData.length, "samples")
      console.log("🎵 Audio format: Float32Array, first few samples:", audioData.slice(0, 10))
      
      // Run Whisper transcription with optimized settings for short phrases
      try {
        const result = await model(audioData, {
          language: "english", // Always use English for ASL/FSL letters
          task: "transcribe",
          return_timestamps: false,
          chunk_length_s: 10, // Shorter chunks for better short-phrase detection
          stride_length_s: 2,
          initial_prompt: "Letter A. Letter B. Letter C.", // Hint at expected format
          // Parameters to improve short phrase detection
          max_new_tokens: 30, // Limit output length for short phrases
          temperature: 0.0, // Deterministic output (no randomness)
          compression_ratio_threshold: 1.8, // Lower threshold to accept more results
          logprob_threshold: -0.5, // Lower threshold to accept more results
          no_speech_threshold: 0.3, // Lower threshold (was 0.6) - more lenient on silence detection
        }) as any
        
        console.log("✅ Whisper completed successfully")

        console.log("📋 Raw Whisper result:", result)
        console.log("📋 Result type:", typeof result)
        console.log("📋 Result keys:", result ? Object.keys(result) : "null")
        
        // Extract text more carefully
        let text = ""
        if (typeof result === "string") {
          text = result.trim()
        } else if (result && typeof result === "object") {
          text = (result.text || result[0]?.text || "").toString().trim()
        }
        
        console.log("📝 Transcription result:", text)
        console.log("📝 Text length:", text.length)

        setTranscript(text)
        setIsProcessing(false)

        if (text && text.length > 0) {
          console.log("✅ Successfully transcribed:", text)
          toast.success(`✅ Detected: "${text}"`)
          if (onResult) onResult(text)
        } else {
          console.warn("⚠️ Empty transcription result")
          console.warn("⚠️ Audio was:", audioData.length, "samples at", audioBuffer.sampleRate, "Hz")
          toast.warning("⚠️ No speech detected. Please say 'Letter' + the letter name clearly.")
        }
      } catch (transcribeErr) {
        console.error("❌ Whisper transcription error:", transcribeErr)
        throw transcribeErr
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
