import React from "react";
import { Button } from "@/components/shared/button";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6 max-w-lg">
        <h2 className="text-2xl font-bold text-center">How to Play</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Match each unlabelled sign to its correct label.</li>
          <li>You have 60 seconds per round.</li>
          <li>Score points for each correct match.</li>
          <li>Complete all rounds to finish the game.</li>
        </ul>
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