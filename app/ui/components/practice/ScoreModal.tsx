import React from "react";
import { Button } from "@/components/shared/button";
import Image from "next/image";

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
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl space-y-6 max-w-lg">
        {isGameOver && (
          <>
            {/* Fun feedback icon based on performance */}
            <div className="flex justify-center mb-2">
              {(() => {
                const percent = score / (cardsPerRound * maxRounds);
                if (percent === 1) {
                  return <Image src="/icons/excellent.png" alt="Excellent" width={64} height={64} />;
                } else if (percent >= 0.8) {
                  return <Image src="/icons/fine.png" alt="Fine" width={64} height={64} />;
                } else if (percent >= 0.5) {
                  return <Image src="/icons/good.png" alt="Good" width={64} height={64} />;
                } else {
                  return <Image src="/icons/bad.png" alt="Bad" width={64} height={64} />;
                }
              })()}
            </div>
            <h2 className="text-3xl font-extrabold text-center mb-2">Game Over!</h2>
            <span className="text-xl font-semibold text-center block mb-2">Total Score: <span className="text-blue-700">{score} / {cardsPerRound * maxRounds}</span></span>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-center mb-1">Breakdown</h3>
              <ul className="text-center">
                {roundScores.map((rs, i) => (
                  <li key={i} className="text-base">Round {i + 1}: <span className="font-semibold text-blue-700">{rs}</span> / {cardsPerRound}</li>
                ))}
              </ul>
            </div>
            <Button
              onClick={onPlayAgain}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg rounded-full mx-auto flex justify-center items-center"
            >
              <span className="w-full text-center">Play Again</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};