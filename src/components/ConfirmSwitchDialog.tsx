// Confirmation shown before a change of opponent or mode throws away a game in progress

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmSwitchDialogProps {
  open: boolean
  title: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmSwitchDialog({ open, title, onConfirm, onCancel }: ConfirmSwitchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={next => !next && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>
            This ends the game in progress. It will not be counted in your stats.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-center sm:space-x-0">
          <Button onClick={onConfirm} className="h-11">
            Start new game
          </Button>
          <Button onClick={onCancel} variant="ghost" className="h-11">
            Keep playing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
