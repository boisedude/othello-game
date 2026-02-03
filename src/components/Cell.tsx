/**
 * Cell Component
 * Represents a single cell on the Othello board with etched grid lines
 */

import { memo } from 'react'
import { cn } from '@/lib/utils'
import type { Player } from '@/types/othello.types'
import { Disc } from './Disc'

interface CellProps {
  player: Player | null
  row: number
  col: number
  isValidMove: boolean
  isFlipping: boolean
  flipDelay?: number
  isLastMove: boolean
  isWinningDisc?: boolean
  onClick: (row: number, col: number) => void
  onHover?: (row: number, col: number) => void
  onHoverEnd?: () => void
  disabled?: boolean
}

export const Cell = memo(function Cell({
  player,
  row,
  col,
  isValidMove,
  isFlipping,
  flipDelay = 0,
  isLastMove,
  isWinningDisc = false,
  onClick,
  onHover,
  onHoverEnd,
  disabled = false,
}: CellProps) {
  const handleClick = () => {
    if (!disabled && isValidMove) {
      onClick(row, col)
    }
  }

  const handleMouseEnter = () => {
    if (!disabled && isValidMove && onHover) {
      onHover(row, col)
    }
  }

  // Get the flip delay class for chain animation
  const flipDelayClass = `flip-delay-${flipDelay}`

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onHoverEnd}
      disabled={disabled || !isValidMove}
      className={cn(
        'group relative flex h-full w-full items-center justify-center perspective-800',
        // Etched/inlaid grid line effect
        'rounded-[2px] bg-gradient-to-br from-[#1a5f3c] to-[#134830]',
        'shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4),inset_-1px_-1px_1px_rgba(255,255,255,0.08)]',
        'border border-[#0f3d28]/60',
        'transition-all duration-200',
        'focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 focus-visible:ring-offset-green-800 focus-visible:outline-none',
        isValidMove && !disabled && 'cursor-pointer hover:bg-[#1f6b42] hover:shadow-[inset_0_0_8px_rgba(144,238,144,0.2)]',
        disabled && 'cursor-not-allowed',
        isLastMove && 'ring-2 ring-yellow-400/60 ring-inset'
      )}
      aria-label={`Cell at row ${row + 1}, column ${col + 1}${player ? ` has ${player === 1 ? 'black' : 'white'} disc` : ''}${isValidMove ? ' - valid move' : ''}`}
    >
      {/* Valid move indicator - subtle glowing dot */}
      {isValidMove && !player && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'h-3 w-3 rounded-full',
              'bg-gradient-to-br from-green-300/60 to-green-400/40',
              'shadow-[0_0_6px_2px_rgba(134,239,172,0.4)]',
              'animate-valid-move-pulse',
              'group-hover:h-4 group-hover:w-4 group-hover:from-green-200/80 group-hover:to-green-300/60',
              'transition-all duration-150'
            )}
          />
        </div>
      )}

      {/* Disc with 3D perspective container */}
      {player && (
        <div className="h-[85%] w-[85%] preserve-3d">
          <Disc
            player={player}
            isFlipping={isFlipping}
            flipDelayClass={flipDelayClass}
            isNewlyPlaced={isLastMove && !isFlipping}
            isWinning={isWinningDisc}
          />
        </div>
      )}
    </button>
  )
})
