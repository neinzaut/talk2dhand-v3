"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/shared/dialog"
import { useEffect, useState } from "react"

interface HowToUseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
}

export function HowToUseModal({ open, onOpenChange, children }: HowToUseModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">How to Use?</DialogTitle>
          {children || (
            <div className="text-base space-y-3 pt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Quiz Format</p>
                    <p className="text-sm text-gray-700">10 sign language gestures • 4 answer choices each • 10 seconds per question</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Progress Bar</p>
                    <p className="text-sm text-gray-700">Track your position in the quiz as you answer each question</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Timer Countdown</p>
                    <p className="text-sm text-gray-700">Beat the clock! Answer before time runs out</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Final Score</p>
                    <p className="text-sm text-gray-700">See your results with detailed review at the end</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
