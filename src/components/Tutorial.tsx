/**
 * Tutorial Component
 * Interactive walkthrough for first-time Othello players
 */

import { useState, useCallback } from 'react'
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
  highlights?: { row: number; col: number; color: string }[]
}) {
  const getCellContent = (cell: 0 | 1 | 2 | 'dot' | null) => {
    if (cell === 1) {
      return <div className="h-full w-full rounded-full bg-gradient-to-br from-gray-800 to-black shadow-md" />
    }
    if (cell === 2) {
      return <div className="h-full w-full rounded-full bg-gradient-to-br from-white to-gray-100 shadow-md ring-1 ring-gray-300" />
    }
    if (cell === 'dot') {
      return <div className="h-2 w-2 rounded-full bg-green-500 opacity-70" />
    }
    return null
  }

  const isHighlighted = (row: number, col: number) => {
    return highlights.find(h => h.row === row && h.col === col)
  }

  return (
    <div className="inline-block rounded-lg bg-green-700 p-1 shadow-lg">
      <div className="grid grid-cols-4 gap-0.5">
        {cells.map((rowCells, row) =>
          rowCells.map((cell, col) => {
            const highlight = isHighlighted(row, col)
            return (
              <div
                key={`${row}-${col}`}
                className={`flex h-8 w-8 items-center justify-center rounded-sm bg-green-600 ${
                  highlight ? `ring-2 ring-${highlight.color}-400` : ''
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

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to Othello!',
    description:
      'Othello (also known as Reversi) is a classic strategy game where you compete to have the most discs on the board. Let me teach you how to play!',
    image: (
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-gray-800 to-black shadow-lg" />
          <div className="mt-2 text-sm font-semibold text-gray-300">You (Black)</div>
        </div>
        <div className="text-3xl text-gray-400">vs</div>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-white to-gray-100 shadow-lg ring-1 ring-gray-300" />
          <div className="mt-2 text-sm font-semibold text-gray-300">AI (White)</div>
        </div>
      </div>
    ),
  },
  {
    title: 'The Starting Position',
    description:
      'The game begins with 4 discs in the center: 2 black and 2 white, placed diagonally. Black always moves first.',
    tip: 'The 8x8 board starts nearly empty, giving you room to strategize!',
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
    title: 'Making a Move',
    description:
      'To place a disc, you must "sandwich" at least one opponent disc between your new disc and an existing disc of yours. The sandwiched discs flip to your color!',
    tip: 'Green dots show where you can legally move. If there are no green dots, you must pass.',
    image: (
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">Before</div>
          <MiniBoard
            cells={[
              [null, null, 'dot', null],
              [null, 2, 1, null],
              [null, 1, 2, null],
              [null, null, null, null],
            ]}
          />
        </div>
        <div className="text-2xl text-gray-400">→</div>
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">After</div>
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
    title: 'Flipping in All Directions',
    description:
      'You can flip discs in any direction: horizontal, vertical, or diagonal. A single move can flip multiple lines of discs at once!',
    tip: 'Look for moves that flip discs in multiple directions for maximum impact.',
    image: (
      <div className="flex justify-center py-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
          <div>Horizontal →</div>
          <div>Vertical ↓</div>
          <div>Diagonal ↘</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Valid Move Indicators',
    description:
      'Green dots appear on squares where you can legally place a disc. These are your only options each turn. If you have no valid moves, you must pass.',
    tip: 'No green dots? Click "Pass" and let your opponent move. The game continues until neither player can move.',
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
    title: 'Corner Strategy',
    description:
      'Corners are extremely valuable! Once you capture a corner, it can never be flipped. Corners also help you control the edges.',
    tip: 'Avoid placing discs next to empty corners - you might give your opponent the corner!',
    image: (
      <div className="flex justify-center py-4">
        <div className="inline-block rounded-lg bg-green-700 p-1 shadow-lg">
          <div className="grid grid-cols-4 gap-0.5">
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
                    className={`flex h-8 w-8 items-center justify-center rounded-sm ${
                      isCorner ? 'bg-yellow-600' : 'bg-green-600'
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
        <div className="ml-4 text-sm text-yellow-400 self-center">
          Corners highlighted in gold
        </div>
      </div>
    ),
  },
  {
    title: 'How to Win',
    description:
      'The game ends when the board is full OR neither player can move. The player with the most discs wins! A tie (draw) is possible but rare.',
    tip: 'Having more discs early does not mean you are winning. Position and corners matter more!',
  },
  {
    title: 'Choose Your Opponent',
    description:
      'Play against three AI opponents with different skill levels: Bella (Easy) makes random moves, Coop (Medium) plays tactically, and Bentley (Hard) thinks 6 moves ahead!',
    tip: 'Start with Bella to learn, then challenge yourself with harder opponents.',
  },
  {
    title: 'Ready to Play!',
    description:
      "You now know the basics of Othello! Remember: capture corners, think ahead, and don't just count discs - control the board. Good luck!",
    tip: 'Press "H" anytime during the game to open this tutorial again.',
  },
]

export function Tutorial({ open, onClose, onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const step = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1

  // Reset state when closing the dialog
  const handleClose = useCallback(() => {
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
      <DialogContent className="sm:max-w-lg bg-gray-900 border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-xl text-green-400">{step.title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Step {currentStep + 1} of {tutorialSteps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Visual */}
          {step.image && <div>{step.image}</div>}

          {/* Description */}
          <p className="text-center text-gray-300">{step.description}</p>

          {/* Tip */}
          {step.tip && (
            <div className="rounded-lg border border-green-800 bg-green-950/50 p-3">
              <div className="mb-1 text-sm font-semibold text-green-400">
                Tip
              </div>
              <p className="text-sm text-green-200">{step.tip}</p>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-green-500'
                    : index < currentStep
                      ? 'w-2 bg-green-500/50'
                      : 'w-2 bg-gray-600'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Don't show again checkbox - only on last step */}
          {isLastStep && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 focus:ring-offset-gray-900"
              />
              <label htmlFor="dontShowAgain" className="text-sm text-gray-400">
                Don't show this tutorial again
              </label>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-800 sm:w-auto"
          >
            Skip Tutorial
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLastStep ? "Let's Play!" : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
