/**
 * Cell Component
 * Represents a single cell on the Othello board on a hairline grid
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
        'bg-[#1d6040] transition-colors duration-150',
        // Narrow screens: hairlines drawn inside the cell so the grid needs no gap
        'max-[440px]:shadow-[inset_0_0_0_0.5px_#0f3d28]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
        isValidMove && !disabled && 'cursor-pointer hover:bg-[#22704a]',
        disabled && 'cursor-default',
        isLastMove && 'ring-2 ring-inset ring-primary'
      )}
      aria-label={`Cell at row ${row + 1}, column ${col + 1}${player ? ` has ${player === 1 ? 'black' : 'white'} disc` : ''}${isValidMove ? ' - valid move' : ''}`}
    >
      {/* Valid move hint: a small static dot */}
      {isValidMove && !player && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[18%] w-[18%] rounded-full bg-primary/70" />
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
