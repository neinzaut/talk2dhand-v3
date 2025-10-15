"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/shared/dialog"
import { useEffect, useState } from "react"

interface HowToUseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HowToUseModal({ open, onOpenChange }: HowToUseModalProps) {
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
          <DialogDescription className="text-base space-y-4 pt-4">
            <div>
              <h3 className="font-bold text-lg mb-2">Quiz Rules</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>You will be shown 10 sign language gestures</li>
                <li>Each question has 4 possible answers</li>
                <li>You have 10 seconds to answer each question</li>
                <li>Score is based on correct answers only</li>
              </ol>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Interface Guide</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="font-bold">Progress Bar</span> - Shows your position in the quiz
                </li>
                <li>
                  <span className="font-bold">Timer</span> - Countdown for each question
                </li>
                <li>
                  <span className="font-bold">Score</span> - Shown at the end with detailed review
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Tips</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Look carefully at each sign gesture before answering</li>
                <li>Don't rush - use the full time if needed</li>
                <li>Review your answers at the end to learn from mistakes</li>
                <li>Practice regularly to improve your recognition skills</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
