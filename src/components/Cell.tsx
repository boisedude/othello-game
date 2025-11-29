/**
 * Cell Component
 * Represents a single cell on the Othello board
 */

import { cn } from '@/lib/utils'
import type { Player } from '@/types/othello.types'
import { Disc } from './Disc'

interface CellProps {
  player: Player | null
  row: number
  col: number
  isValidMove: boolean
  isFlipping: boolean
  isLastMove: boolean
  onClick: (row: number, col: number) => void
  onHover?: (row: number, col: number) => void
  onHoverEnd?: () => void
  disabled?: boolean
}

export function Cell({
  player,
  row,
  col,
  isValidMove,
  isFlipping,
  isLastMove,
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

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onHoverEnd}
      disabled={disabled || !isValidMove}
      className={cn(
        'relative flex h-full w-full items-center justify-center',
        'rounded-sm border border-green-800/30 bg-green-700/20',
        'transition-all duration-200',
        isValidMove && !disabled && 'cursor-pointer hover:bg-green-600/30 hover:shadow-md',
        disabled && 'cursor-not-allowed',
        isLastMove && 'ring-2 ring-yellow-400/50 ring-offset-1 ring-offset-green-800'
      )}
      aria-label={`Cell at row ${row + 1}, column ${col + 1}${player ? ` has ${player === 1 ? 'black' : 'white'} disc` : ''}${isValidMove ? ' - valid move' : ''}`}
    >
      {/* Valid move indicator */}
      {isValidMove && !player && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-green-300/40 transition-all duration-200 group-hover:h-4 group-hover:w-4" />
        </div>
      )}

      {/* Disc */}
      {player && (
        <div className="h-[85%] w-[85%] p-1">
          <Disc player={player} isFlipping={isFlipping} />
        </div>
      )}
    </button>
  )
}
