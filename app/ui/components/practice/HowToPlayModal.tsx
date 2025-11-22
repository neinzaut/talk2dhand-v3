import React from "react";
import { Button } from "@/components/shared/button";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6 max-w-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]" data-state="open">
        <h2 className="text-2xl font-bold text-center">How to Play</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-2xl">🎯</span>
            <p className="text-gray-700"><span className="font-semibold">Match</span> each unlabelled sign to its correct label</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
            <span className="text-2xl">⏰</span>
            <p className="text-gray-700"><span className="font-semibold">60 seconds</span> per round — beat the clock!</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <span className="text-2xl">⭐</span>
            <p className="text-gray-700"><span className="font-semibold">Score points</span> for each correct match</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <span className="text-2xl">🏆</span>
            <p className="text-gray-700"><span className="font-semibold">Complete all rounds</span> to finish the game</p>
          </div>
        </div>
        <Button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg rounded-full mx-auto flex justify-center items-center"
        >
          <span className="w-full text-center">Close</span>
        </Button>
      </div>
    </div>
  );
};