/**
 * Game Controls Component
 * Controls for difficulty selection, new game, undo, leaderboard, etc.
 */

import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import type { Difficulty, GameMode } from '@/types/othello.types'
import type { Character } from '@shared/characters'

interface GameControlsProps {
  difficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
  onNewGame: () => void
  onShowLeaderboard: () => void
  onShowHelp?: () => void
  onUndo?: () => void
  canUndo?: boolean
  disabled?: boolean
  gameMode: GameMode
  currentPlayer: 1 | 2
  blackCount: number
  whiteCount: number
  character: Character
}

export function GameControls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onShowLeaderboard,
  onShowHelp,
  onUndo,
  canUndo = false,
  disabled = false,
  gameMode,
  currentPlayer,
  blackCount,
  whiteCount,
  character,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Difficulty and Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {gameMode === 'pvc' && (
          <div className="flex items-center gap-2">
            <label htmlFor="difficulty" className="text-sm font-medium">
              Your Opponent:
            </label>
            <Select
              value={difficulty}
              onValueChange={value => onDifficultyChange(value as Difficulty)}
            >
              <SelectTrigger id="difficulty" className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">🐕 Bella - Playful Pup</SelectItem>
                <SelectItem value="medium">🎮 Coop - Casual Challenger</SelectItem>
                <SelectItem value="hard">🐺 Bentley - The Mastermind</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={onNewGame} disabled={disabled} variant="default" aria-label="Start a new game">
          New Game
        </Button>

        {onUndo && (
          <Button
            onClick={onUndo}
            disabled={disabled || !canUndo}
            variant="outline"
            aria-label="Undo last move (U)"
          >
            Undo (U)
          </Button>
        )}

        <Button onClick={onShowLeaderboard} disabled={disabled} variant="outline" aria-label="View your statistics">
          📊 Stats
        </Button>

        {onShowHelp && (
          <Button onClick={onShowHelp} disabled={disabled} variant="outline" aria-label="How to play Othello">
            ❓ How to Play
          </Button>
        )}
      </div>

      {/* Bottom Row: Turn Indicator and Disc Counts */}
      <div className="flex flex-wrap items-center justify-center gap-6">
        {/* Turn Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {currentPlayer === 1 ? 'Your Turn' : `${character.name}'s Turn`}
          </span>
          <div
            className={`h-6 w-6 rounded-full shadow-md transition-all ${
              currentPlayer === 1
                ? 'bg-gradient-to-br from-gray-800 to-black ring-2 ring-gray-600'
                : 'bg-gradient-to-br from-white to-gray-100 ring-2 ring-gray-300'
            }`}
          />
        </div>

        {/* Disc Counts */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-gray-800 to-black shadow-md" />
            <span className="text-sm font-medium">
              You: <span className="font-bold">{blackCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-white to-gray-100 shadow-md ring-1 ring-gray-300" />
            <span className="text-sm font-medium">
              {character.name}: <span className="font-bold">{whiteCount}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
