"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/shared/dialog"
import { Button } from "@/components/shared/button"

interface ChNgConfirmationDialogProps {
  isOpen: boolean
  digraph: string // "Ch" or "Ng"
  onChoice: (choice: "single" | "separate") => void
  onCancel: () => void
}

export function ChNgConfirmationDialog({ isOpen, digraph, onChoice, onCancel }: ChNgConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">"{digraph}" Detected</DialogTitle>
          <DialogDescription className="text-base pt-2">
            How would you like to treat "{digraph}" in Filipino Sign Language?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={() => onChoice("single")}
            className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600"
          >
            <div className="flex flex-col items-center">
              <span className="font-bold">Single Letter</span>
              <span className="text-sm font-normal opacity-90">Treat "{digraph}" as one letter</span>
            </div>
          </Button>
          
          <Button
            onClick={() => onChoice("separate")}
            variant="default"
            className="w-full py-6 text-lg"
          >
            <div className="flex flex-col items-center">
              <span className="font-bold">Separate Letters</span>
              <span className="text-sm font-normal opacity-90">
                Treat as "{digraph[0]}" and "{digraph[1]}"
              </span>
            </div>
          </Button>
        </div>

        <DialogFooter>
          <Button
            variant="default"
            onClick={onCancel}
            className="w-full border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
