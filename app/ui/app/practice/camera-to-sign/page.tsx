"use client"


import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { HowToUseModal } from "@/components/how-to-use-modal";

type ScreenshotResult = {
  image: string;
  expected: string;
  predicted: string;
};

function getRandomSignsFromList(signList: string[], count = 5): string[] {
  const shuffled = [...signList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    if (!started || round >= 5) return;
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleCapture();
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, [round, started]);

  function handleCapture() {
    // Capture screenshot from video
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/png");
        // Simulate prediction
        const predicted = predictSign(imageDataUrl);
        setScreenshots((prev: ScreenshotResult[]) => [
          ...prev,
          { image: imageDataUrl, expected: signs[round], predicted },
        ]);
        if (predicted === signs[round]) setScore((s) => s + 1);
      }
    }
    // Next round or show results
    setTimeout(() => {
      if (round < 4) {
        setRound((r) => r + 1);
      } else {
        setShowResults(true);
      }
    }, 800);
  }

  function handleRestart() {
    setSigns(getRandomSignsFromList(signList, 5));
    setScreenshots([]);
    setScore(0);
    setRound(0);
    setShowResults(false);
    setStarted(false);
  }

  function handleStart() {
    setSigns(getRandomSignsFromList(signList, 5));
    setStarted(true);
  }

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
                <div className="mb-2 text-lg font-semibold">
                  Sign {round + 1} of 5
                </div>
                <div className="mb-3 text-5xl font-bold text-blue-600 bg-blue-50 rounded-lg px-8 py-4 shadow">
                  {signs[round]}
                </div>
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
            <div className="mb-4 text-lg">Score: <span className="font-bold">{score} / 5</span></div>
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