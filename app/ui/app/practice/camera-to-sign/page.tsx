"use client"


import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { HowToUseModal } from "@/components/how-to-use-modal";
import { getExpectedType } from "@/lib/utils"


type ScreenshotResult = {
  image: string;
  expected: string;
  predicted: string;
};


function getRandomSignsFromList(signList: string[], count = 5): string[] {
  // Ensure unique signs
  const unique = Array.from(new Set(signList));
  const shuffled = unique.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function CameraToSignPage() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [signs, setSigns] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<ScreenshotResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [howToOpen, setHowToOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureTriggeredRef = useRef<boolean>(false);

  // Get current language and sign list from store
  const currentLanguage = useAppStore((s) => s.currentLanguage);
  const languageData = useAppStore((s) => s.languageData);
  // Get all alphabet and number signs for the current language
  const signList = React.useMemo(() => {
    const modules = languageData[currentLanguage]?.modules || [];
    let allSigns: string[] = [];
    modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        if (lesson.title.toLowerCase().includes("alphabet") || lesson.title.toLowerCase().includes("alpabeto") || lesson.title.toLowerCase().includes("number")) {
          allSigns = allSigns.concat(lesson.signs.map((s) => s.label));
        }
      });
    });
    return allSigns;
  }, [languageData, currentLanguage]);

  // Simulate prediction (replace with real model call)
  function predictSign(imageDataUrl: string): string {
    // For demo, randomly return correct or 'No hand detected'
    return Math.random() > 0.3 ? signs[round] : "No hand detected";
  }

  // Start camera when started
  useEffect(() => {
    if (started && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      });
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        streamRef.current = null;
      }
    };
  }, [started]);

  // Countdown logic
  useEffect(() => {
    if (!started || round >= signs.length || capturing) return;
    
    console.log(`[Countdown] Starting for round ${round}`);
    setCountdown(5);
    let hasCaptured = false; // Local flag to prevent double capture
    
    let countdownValue = 5;
    const timer = setInterval(() => {
      countdownValue--;
      setCountdown(countdownValue);
      
      if (countdownValue === 0 && !hasCaptured) {
        hasCaptured = true;
        clearInterval(timer);
        console.log(`[Countdown] Reached 0, triggering capture for round ${round}`);
        // Trigger capture immediately
        setCapturing(true);
      }
    }, 1000);
    
    timerRef.current = timer;
    
    return () => {
      console.log(`[Countdown] Cleanup for round ${round}`);
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [round, started, signs.length, capturing]);

  // Perform capture - runs when capturing flag is set to true
  useEffect(() => {
    if (!capturing || !started || round >= signs.length) return;
    
    const currentRound = round;
    console.log(`[Capture] Starting for round ${currentRound}, expected sign: ${signs[currentRound]}`);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      setCapturing(false);
      return;
    }
    
    // Check if video is actually playing and has dimensions
    if (!video.videoWidth || !video.videoHeight) {
      console.warn('[Capture] Video not ready, skipping');
      setCapturing(false);
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      setCapturing(false);
      return;
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    
    // Only send valid images
    if (!imageDataUrl || imageDataUrl.length < 1000) {
      console.warn('[Capture] Image is blank or failed');
      setCapturing(false);
      return;
    }

    // Send image to backend for prediction - send only base64 part
    const base64Data = imageDataUrl.split(',')[1];
    
    // Determine expected type from the current sign
    const expectedSign = signs[currentRound];
    const expectedType = getExpectedType(expectedSign);
    
    // FSL-specific letter mappings (FSL letters that map to ASL equivalents)
    const fslLetterMapping: Record<string, string> = {
      'CH': 'H',      // CH maps to H
      'Ñ': 'P',       // Ñ (enye) maps to P
      'NG': 'V',      // NG maps to V
    };
    
    // Reverse mapping for display purposes
    const fslDisplayMapping: Record<string, string> = {
      'H': 'CH',
      'P': 'Ñ',
      'V': 'NG',
    };
    
    const requestBody: { image: string; expectedType?: string; confidenceThreshold?: number } = { image: base64Data };
    if (expectedType) {
      requestBody.expectedType = expectedType;
      // Lower confidence threshold for practice mode to be more permissive
      requestBody.confidenceThreshold = 0.05;
    }
    
    fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        let predicted = "No hand detected";
        let landmarks = [];
        
        if (data.success) {
          predicted = data.prediction;
          landmarks = data.landmarks;
          console.log("[Capture] Hand landmarks:", landmarks);
          
          // If we're expecting an FSL special letter and detected its mapped equivalent, display the FSL letter
          if (fslLetterMapping[expectedSign] && predicted === fslLetterMapping[expectedSign]) {
            predicted = fslDisplayMapping[predicted] || predicted;
          }
        } else {
          console.log("[Capture] No hand detected:", data.error);
        }

        setScreenshots((prev: ScreenshotResult[]) => [
          ...prev,
          { image: imageDataUrl, expected: signs[currentRound], predicted },
        ]);
        
        // Check if prediction matches expected (considering FSL mappings)
        let isCorrect = predicted === signs[currentRound];
        if (!isCorrect && fslLetterMapping[expectedSign]) {
          // Check if the raw prediction matches the mapped letter
          isCorrect = data.prediction === fslLetterMapping[expectedSign];
        }
        
        if (isCorrect) {
          setScore((s) => s + 1);
        }

        // Next round or show results
        if (currentRound < signs.length - 1) {
          console.log(`[Capture] Moving to next round: ${currentRound + 1}`);
          setCapturing(false);
          setRound(currentRound + 1);
        } else {
          console.log("[Capture] Showing results");
          setShowResults(true);
        }
      })
      .catch((error) => {
        console.error("[Capture] Error calling backend:", error);
        // Still progress to next round even on error
        setScreenshots((prev: ScreenshotResult[]) => [
          ...prev,
          { image: imageDataUrl, expected: signs[currentRound], predicted: "Error" },
        ]);
        
        if (currentRound < signs.length - 1) {
          setCapturing(false);
          setRound(currentRound + 1);
        } else {
          setShowResults(true);
        }
      });
  }, [capturing, started, round, signs]);

  const handleRestart = useCallback(() => {
    const newSigns = getRandomSignsFromList(signList, 5);
    setSigns(newSigns);
    setScreenshots([]);
    setScore(0);
    setRound(0);
    setCapturing(false);
    setShowResults(false);
    setStarted(false);
  }, [signList]);

  const handleStart = useCallback(() => {
    const newSigns = getRandomSignsFromList(signList, 5);
    console.log("Starting with signs:", newSigns);
    setSigns(newSigns);
    setCapturing(false);
    setStarted(true);
  }, [signList]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Camera-to-Sign</h1>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6">
        {!showResults ? (
          <>
            {!started ? (
              <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                {/* Left side - Instructions */}
                <div className="lg:w-1/3 space-y-4 flex flex-col pt-12">
                  <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">📋 Instructions</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>Click <strong>Start</strong> to begin the challenge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>Allow camera access when prompted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>Perform each sign shown within 5 seconds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">4.</span>
                        <span>Review your results and try again!</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-purple-900 mb-3">💡 Tips for Success</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span>Ensure good lighting on your hands</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span>Position your hand in the center of the frame</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span>Hold the sign steady for recognition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span>Use a plain background when possible</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right side - Start button */}
                <div className="lg:w-2/3 flex flex-col">
                  <div className="text-center space-y-6 py-12 flex flex-col items-center justify-center h-full">
                    <div className="text-8xl mb-4">📹</div>
                    <h2 className="text-2xl font-bold text-gray-800">Ready to Practice?</h2>
                    <p className="text-gray-600 max-w-md">
                      Click the button below to start your camera practice session
                    </p>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-12 rounded-lg text-xl shadow-lg transition-all hover:scale-105"
                      onClick={handleStart}
                      disabled={signList.length === 0}
                    >
                      Start Practice
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center max-w-lg mx-auto space-y-6">
                <div className="text-center w-full">
                  <div className="text-lg text-gray-600 mb-2">
                    Sign {round + 1} of {signs.length}
                  </div>
                  <div className="bg-blue-500 rounded-xl px-8 py-4 shadow-lg inline-block mb-4">
                    <span className="text-6xl font-bold text-white">{signs[round]}</span>
                  </div>
                </div>

                <p className="text-lg text-gray-700 text-center">Show this sign to your camera!</p>

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video rounded-lg bg-black object-cover shadow-lg border-4 border-blue-300"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="text-2xl font-mono text-gray-700">
                  Time left: <span className="text-blue-600">{countdown > 0 ? countdown : 0}s</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold mb-4 text-gray-800">Results</h2>
              <div className="text-xl mb-3 text-gray-700">
                {score === signs.length ? (
                  <span className="text-green-600">Perfect Score!</span>
                ) : score >= signs.length * 0.7 ? (
                  <span className="text-blue-600">Great Job!</span>
                ) : score >= signs.length * 0.5 ? (
                  <span className="text-orange-600">Good Effort!</span>
                ) : (
                  <span className="text-gray-600">Keep Practicing!</span>
                )}
              </div>
              <div className="text-2xl font-semibold text-blue-600">
                Score: {score} / {signs.length}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
              {screenshots.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col items-center rounded-lg shadow p-4 border-2 ${
                    item.predicted === item.expected 
                      ? 'border-green-400' 
                      : 'border-red-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">
                      {item.predicted === item.expected ? '✅' : '❌'}
                    </span>
                    <span className="text-lg text-gray-800">Sign {idx + 1}</span>
                  </div>
                  
                  <img 
                    src={item.image} 
                    alt={`Sign ${idx + 1}`} 
                    className="w-full h-40 object-contain rounded-lg border-2 border-gray-300 mb-3 bg-white"
                  />
                  
                  <div className="space-y-1 text-center w-full">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-600">Expected:</span>
                      <span className="font-bold text-lg text-gray-800">{item.expected}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-600">You signed:</span>
                      <span className={`font-bold text-lg ${
                        item.predicted === item.expected ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.predicted}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-10 rounded-lg text-lg shadow transition"
              onClick={handleRestart}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraToSignPage;