"use client"


import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { HowToUseModal } from "@/components/how-to-use-modal";

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
    
    fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Data }),
    })
      .then((response) => response.json())
      .then((data) => {
        let predicted = "No hand detected";
        let landmarks = [];
        
        if (data.success) {
          predicted = data.prediction;
          landmarks = data.landmarks;
          console.log("[Capture] Hand landmarks:", landmarks);
        } else {
          console.log("[Capture] No hand detected:", data.error);
        }

        setScreenshots((prev: ScreenshotResult[]) => [
          ...prev,
          { image: imageDataUrl, expected: signs[currentRound], predicted },
        ]);
        
        if (predicted === signs[currentRound]) {
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
    <div className="flex flex-col items-center min-h-[80vh] justify-center py-8">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        {/* How to Use Button */}
        <button
          className="absolute top-4 right-4 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-4 py-2 rounded-full text-sm shadow"
          onClick={() => setHowToOpen(true)}
        >
          How to Use?
        </button>
        <HowToUseModal open={howToOpen} onOpenChange={setHowToOpen} />
        <h1 className="text-3xl font-bold mb-2">Camera-to-Sign</h1>
        <p className="text-base text-muted-foreground mb-4 text-center">
          Use your camera to perform a sign shown on screen. You have 5 seconds for each. At the end, see your score and feedback!
        </p>
        {!showResults ? (
          <div className="flex flex-col items-center w-full">
            {!started ? (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded text-xl mb-6 mt-2"
                onClick={handleStart}
                disabled={signList.length === 0}
              >
                Start
              </button>
            ) : (
              <>
                {round < signs.length && (
                  <>
                    <div className="mb-2 text-lg font-semibold">
                      Sign {round + 1} of {signs.length}
                    </div>
                    <div className="mb-3 text-5xl font-bold text-blue-600 bg-blue-50 rounded-lg px-8 py-4 shadow">
                      {signs[round]}
                    </div>
                  </>
                )}
                <div className="mb-3 text-lg">Show this sign to your camera!</div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-80 h-60 rounded-lg bg-black object-cover mb-4"
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div className="text-lg font-mono mb-2">Time left: <span className="font-bold">{countdown > 0 ? countdown : 0}</span>s</div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-4">Results</h2>
            <div className="mb-4 text-lg">Score: <span className="font-bold">{score} / {signs.length}</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {screenshots.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center bg-white rounded-lg shadow p-4 border border-blue-100 max-w-xs">
                  <div className="font-bold text-lg mb-2">Item {idx + 1}</div>
                  <img src={item.image} alt={`Sign ${idx + 1}`} className="w-40 h-32 object-contain border-2 border-blue-300 mb-2" />
                  <div className="mb-1">Expected: <span className="font-bold">{item.expected}</span></div>
                  <div>Predicted: <span className={item.predicted === item.expected ? "font-bold text-green-600" : "font-bold text-red-600"}>{item.predicted}</span></div>
                  {item.predicted !== item.expected && (
                    <div className="mt-1 text-sm text-red-500">Mismatch</div>
                  )}
                </div>
              ))}
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded mt-2"
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraToSignPage;