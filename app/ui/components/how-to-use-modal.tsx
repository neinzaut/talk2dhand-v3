import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/shared/dialog"

interface HowToUseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HowToUseModal({ open, onOpenChange }: HowToUseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">How to Use?</DialogTitle>
          <DialogDescription className="text-base space-y-4 pt-4">
            <div>
              <h3 className="font-bold text-lg mb-2">Getting Started</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Select a sign from the grid below the camera</li>
                <li>Position your hand in front of the camera</li>
                <li>Perform the sign gesture</li>
                <li>Wait for the system to detect your sign</li>
              </ol>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Visual Feedback</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="text-green-500 font-bold">Green border</span> - Correct sign detected!
                </li>
                <li>
                  <span className="text-red-500 font-bold">Red border</span> - Incorrect sign, try again
                </li>
                <li>
                  <span className="text-orange-500 font-bold">Orange border</span> - Currently detecting
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Tips</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Ensure good lighting for better detection</li>
                <li>Keep your hand clearly visible in the camera frame</li>
                <li>You can retry incorrect signs until you get them right</li>
                <li>Take your time - there's no rush!</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
