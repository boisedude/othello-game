/**
 * Tutorial Component
 * Interactive walkthrough for first-time Othello players
 */

import { useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { STORAGE_KEYS } from '@/lib/storageKeys'

interface TutorialProps {
  open: boolean
  opponentName: string
  onClose: () => void
  onComplete: () => void
}

interface TutorialStep {
  title: string
  description: string
  tip?: string
  image?: React.ReactNode
}

// Mini board visualization component
function MiniBoard({
  cells,
  highlights = [],
}: {
  cells: (0 | 1 | 2 | 'dot' | null)[][]
  highlights?: { row: number; col: number }[]
}) {
  const getCellContent = (cell: 0 | 1 | 2 | 'dot' | null) => {
    if (cell === 1) {
      return <div className="h-full w-full rounded-full bg-gradient-to-br from-gray-800 to-black shadow-md" />
    }
    if (cell === 2) {
      return <div className="h-full w-full rounded-full bg-gradient-to-br from-white to-gray-100 shadow-md ring-1 ring-gray-300" />
    }
    if (cell === 'dot') {
      return <div className="h-2 w-2 rounded-full bg-primary/70" />
    }
    return null
  }

  const isHighlighted = (row: number, col: number) => {
    return highlights.find(h => h.row === row && h.col === col)
  }

  return (
    <div className="inline-block rounded-md bg-[#5b4333] p-1">
      <div className="grid grid-cols-4 gap-px bg-[#0f3d28]">
        {cells.map((rowCells, row) =>
          rowCells.map((cell, col) => {
            const highlight = isHighlighted(row, col)
            return (
              <div
                key={`${row}-${col}`}
                className={`flex h-8 w-8 items-center justify-center bg-[#1d6040] ${
                  highlight ? 'ring-2 ring-inset ring-primary' : ''
                }`}
              >
                {getCellContent(cell)}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function getSteps(opponent: string): TutorialStep[] {
  return [
  {
    title: 'Welcome to Othello',
    description:
      'Othello (also known as Reversi) is a classic strategy game where you compete to have the most discs on the board. It takes a minute to learn.',
    image: (
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-gray-800 to-black shadow-lg" />
          <div className="mt-2 text-sm font-semibold ">You (Black)</div>
        </div>
        <div className="text-muted-foreground">vs</div>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-white to-gray-100 shadow-lg ring-1 ring-gray-300" />
          <div className="mt-2 text-sm font-semibold">{opponent} (White)</div>
        </div>
      </div>
    ),
  },
  {
    title: 'The starting position',
    description:
      'The game begins with 4 discs in the center: 2 black and 2 white, placed diagonally. Black always moves first.',
    tip: 'The 8x8 board starts nearly empty, giving you room to plan.',
    image: (
      <div className="flex justify-center py-4">
        <MiniBoard
          cells={[
            [null, null, null, null],
            [null, 2, 1, null],
            [null, 1, 2, null],
            [null, null, null, null],
          ]}
        />
      </div>
    ),
  },
  {
    title: 'Making a move',
    description:
      'To place a disc, you must "sandwich" at least one opponent disc between your new disc and an existing disc of yours. The sandwiched discs flip to your colour.',
    tip: 'Small dots show where you can legally move. If you have no legal moves, your turn is skipped.',
    image: (
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="text-center">
          <div className="mb-2 text-sm text-muted-foreground">Before</div>
          <MiniBoard
            cells={[
              [null, null, 'dot', null],
              [null, 2, 1, null],
              [null, 1, 2, null],
              [null, null, null, null],
            ]}
          />
        </div>
        <div className="text-2xl text-muted-foreground">→</div>
        <div className="text-center">
          <div className="mb-2 text-sm text-muted-foreground">After</div>
          <MiniBoard
            cells={[
              [null, null, 1, null],
              [null, 2, 1, null],
              [null, 1, 1, null],
              [null, null, null, null],
            ]}
          />
        </div>
      </div>
    ),
  },
  {
    title: 'Flipping in all directions',
    description:
      'You can flip discs in any direction: horizontal, vertical, or diagonal. A single move can flip several lines of discs at once.',
    tip: 'Look for moves that flip discs in more than one direction.',
    image: (
      <div className="flex justify-center py-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
          <div>Horizontal →</div>
          <div>Vertical ↓</div>
          <div>Diagonal ↘</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Valid move hints',
    description:
      'Dots appear on squares where you can legally place a disc. These are your only options each turn.',
    tip: 'With no dots, your turn is skipped and your opponent moves. The game continues until neither player can move.',
    image: (
      <div className="flex justify-center py-4">
        <MiniBoard
          cells={[
            ['dot', null, null, 'dot'],
            [null, 2, 1, null],
            [null, 1, 2, null],
            ['dot', null, null, 'dot'],
          ]}
        />
      </div>
    ),
  },
  {
    title: 'Corner strategy',
    description:
      'Corners are valuable. Once you capture a corner, it can never be flipped. Corners also help you control the edges.',
    tip: 'Avoid placing discs next to empty corners - you might give your opponent the corner!',
    image: (
      <div className="flex justify-center py-4">
        <div className="inline-block rounded-md bg-[#5b4333] p-1">
          <div className="grid grid-cols-4 gap-px bg-[#0f3d28]">
            {[
              [1, null, null, 2],
              [null, null, null, null],
              [null, null, null, null],
              [1, null, null, null],
            ].map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const isCorner = (rowIdx === 0 || rowIdx === 3) && (colIdx === 0 || colIdx === 3)
                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`flex h-8 w-8 items-center justify-center bg-[#1d6040] ${
                      isCorner ? 'ring-2 ring-inset ring-primary' : ''
                    }`}
                  >
                    {cell === 1 && (
                      <div className="h-full w-full rounded-full bg-gradient-to-br from-gray-800 to-black shadow-md" />
                    )}
                    {cell === 2 && (
                      <div className="h-full w-full rounded-full bg-gradient-to-br from-white to-gray-100 shadow-md ring-1 ring-gray-300" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
        <div className="ml-4 self-center text-sm text-muted-foreground">
          Corners are ringed
        </div>
      </div>
    ),
  },
  {
    title: 'How to win',
    description:
      'The game ends when the board is full OR neither player can move. The player with the most discs wins. A tie is possible but rare.',
    tip: 'Having more discs early does not mean you are winning. Position and corners matter more.',
  },
  {
    title: 'Choose your opponent',
    description:
      'Bella is the easiest and makes random moves, Coop plays tactically, and Bentley thinks six moves ahead.',
    tip: 'Start with Bella to learn. Click the opponent chip at the top to switch at any time.',
  },
  {
    title: 'Ready to play',
    description:
      "You now know the basics of Othello! Remember: capture corners, think ahead, and don't just count discs - control the board. Good luck.",
    tip: 'Shortcuts: N new game, U undo, L stats, H this guide, M sound. Click "How to play" any time to see this again.',
  },
  ]
}

export function Tutorial({ open, opponentName, onClose, onComplete }: TutorialProps) {
  const tutorialSteps = useMemo(() => getSteps(opponentName), [opponentName])
  const [currentStep, setCurrentStep] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const step = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1

  // Reset state when closing the dialog
  const handleClose = useCallback(() => {
    // Any dismissal counts: the tutorial only auto-opens on the first visit
    try {
      localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true')
    } catch {
      // storage unavailable
    }
    setCurrentStep(0)
    setDontShowAgain(false)
    onClose()
  }, [onClose])

  const handleNext = useCallback(() => {
    if (isLastStep) {
      if (dontShowAgain) {
        localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true')
      }
      onComplete()
      handleClose()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }, [isLastStep, dontShowAgain, onComplete, handleClose])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true')
    }
    onComplete()
    handleClose()
  }, [dontShowAgain, onComplete, handleClose])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {tutorialSteps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {step.image && <div className="py-2">{step.image}</div>}

          <p className="text-center text-muted-foreground">{step.description}</p>

          {step.tip && (
            <p className="rounded-md border bg-secondary p-3 text-sm text-muted-foreground">
              {step.tip}
            </p>
          )}

          <div className="flex justify-center gap-2 pt-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className="flex h-6 items-center"
                aria-label={`Go to step ${index + 1}`}
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-6 bg-primary'
                      : index < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-muted'
                  }`}
                />
              </button>
            ))}
          </div>

          {isLastStep && (
            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <label
                htmlFor="dontShowAgain"
                className="flex min-h-11 items-center text-sm text-muted-foreground"
              >
                Don't show this again
              </label>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:space-x-0">
          <Button variant="ghost" onClick={handleSkip} className="h-11 sm:w-auto">
            Skip
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} className="h-11">
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="h-11">
              {isLastStep ? 'Play' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
