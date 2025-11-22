import React from "react";
import { Button } from "@/components/shared/button";
import Image from "next/image";
import { X } from "lucide-react";

interface ScoreModalProps {
  open: boolean;
  score: number;
  roundScores: number[];
  cardsPerRound: number;
  maxRounds: number;
  isGameOver: boolean;
  onPlayAgain: () => void;
  onNextRound?: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  open,
  score,
  roundScores,
  cardsPerRound,
  maxRounds,
  isGameOver,
  onPlayAgain,
  onNextRound,
}) => {
  if (!open) return null;
  
  const percent = score / (cardsPerRound * maxRounds);
  const isPerfect = percent === 1;
  const isGreat = percent >= 0.8;
  const isGood = percent >= 0.5;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
      <div className={`relative bg-gradient-to-br ${
        isPerfect ? 'from-yellow-50 via-orange-50 to-pink-50' :
        isGreat ? 'from-blue-50 via-purple-50 to-pink-50' :
        isGood ? 'from-green-50 via-teal-50 to-blue-50' :
        'from-gray-50 via-slate-50 to-gray-100'
      } p-8 rounded-lg shadow-lg space-y-6 max-w-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`}>
        {/* Close button */}
        <button
          onClick={onPlayAgain}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        {isGameOver && (
          <>
            {/* Animated icon with glow effect */}
            <div className="flex justify-center mb-2">
              <div className={`relative ${isPerfect ? 'animate-bounce' : ''}`}>
                {isPerfect && (
                  <div className="absolute inset-0 animate-ping">
                    <Image src="/icons/excellent.png" alt="Excellent" width={64} height={64} className="opacity-50" />
                  </div>
                )}
                {(() => {
                  if (isPerfect) {
                    return <Image src="/icons/excellent.png" alt="Excellent" width={80} height={80} className="relative drop-shadow-xl" />;
                  } else if (isGreat) {
                    return <Image src="/icons/fine.png" alt="Fine" width={80} height={80} className="relative drop-shadow-lg" />;
                  } else if (isGood) {
                    return <Image src="/icons/good.png" alt="Good" width={80} height={80} className="relative drop-shadow-md" />;
                  } else {
                    return <Image src="/icons/bad.png" alt="Bad" width={80} height={80} className="relative" />;
                  }
                })()}
              </div>
            </div>
            
            {/* Title with emoji */}
            <div className="text-center space-y-2">
              <h2 className={`text-4xl font-black ${
                isPerfect ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500' :
                isGreat ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' :
                isGood ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500' :
                'text-gray-700'
              }`}>
                {isPerfect ? '🎉 Perfect Score! 🎉' :
                 isGreat ? '🌟 Amazing Job! 🌟' :
                 isGood ? '👍 Good Work! 👍' :
                 'Keep Trying!'}
              </h2>
              <p className="text-gray-600 text-sm">
                {isPerfect ? 'You matched all pairs!' :
                 isGreat ? 'Almost perfect!' :
                 isGood ? 'Nice effort!' :
                 'Practice makes perfect!'}
              </p>
            </div>
            
            {/* Score with progress ring effect */}
            <div className="flex justify-center">
              <div className={`relative inline-flex items-center justify-center w-40 h-40 rounded-full ${
                isPerfect ? 'bg-gradient-to-br from-yellow-100 to-orange-100' :
                isGreat ? 'bg-gradient-to-br from-blue-100 to-purple-100' :
                isGood ? 'bg-gradient-to-br from-green-100 to-teal-100' :
                'bg-gray-100'
              } shadow-lg`}>
                <div className="text-center">
                  <div className={`text-5xl font-black ${
                    isPerfect ? 'text-orange-600' :
                    isGreat ? 'text-purple-600' :
                    isGood ? 'text-teal-600' :
                    'text-gray-600'
                  }`}>
                    {score}
                  </div>
                  <div className="text-gray-500 text-sm font-semibold">out of {cardsPerRound * maxRounds}</div>
                  <div className={`text-2xl font-bold mt-1 ${
                    isPerfect ? 'text-orange-500' :
                    isGreat ? 'text-purple-500' :
                    isGood ? 'text-teal-500' :
                    'text-gray-500'
                  }`}>
                    {Math.round(percent * 100)}%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Round breakdown with colorful badges */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-inner">
              <h3 className="text-lg font-bold text-center mb-3 text-gray-700">📊 Round Breakdown</h3>
              <div className="flex justify-center gap-3">
                {roundScores.map((rs, i) => {
                  const roundPercent = rs / cardsPerRound;
                  return (
                    <div key={i} className={`flex flex-col items-center p-3 rounded-xl shadow-md transition-transform hover:scale-105 ${
                      roundPercent === 1 ? 'bg-gradient-to-br from-yellow-100 to-orange-100' :
                      roundPercent >= 0.8 ? 'bg-gradient-to-br from-blue-100 to-purple-100' :
                      roundPercent >= 0.5 ? 'bg-gradient-to-br from-green-100 to-teal-100' :
                      'bg-gray-100'
                    }`}>
                      <span className="text-xs font-semibold text-gray-600 mb-1">Round {i + 1}</span>
                      <span className={`text-2xl font-black ${
                        roundPercent === 1 ? 'text-orange-600' :
                        roundPercent >= 0.8 ? 'text-purple-600' :
                        roundPercent >= 0.5 ? 'text-teal-600' :
                        'text-gray-600'
                      }`}>
                        {rs}
                      </span>
                      <span className="text-xs text-gray-500">/ {cardsPerRound}</span>
                      {roundPercent === 1 && <span className="text-lg mt-1">⭐</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <Button
              onClick={onPlayAgain}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg font-bold rounded-lg shadow-lg"
            >
              Play Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
};