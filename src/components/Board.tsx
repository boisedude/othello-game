/**
 * Board Component
 * Renders the 8x8 Othello game board on green felt in a matte wooden frame
 */

import { useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { Board as BoardType, Move, ValidMove, Player, GameStatus } from '@/types/othello.types'
import { BOARD_SIZE } from '@/types/othello.types'
import { Cell } from './Cell'

interface BoardProps {
  board: BoardType
  validMoves: ValidMove[]
  lastMove?: Move
  lastFlippedDiscs: Array<{ row: number; col: number }>
  onCellClick: (row: number, col: number) => void
  disabled?: boolean
  className?: string
  gameStatus?: GameStatus
  winner?: Player | null
}

export function Board({
  board,
  validMoves,
  lastMove,
  lastFlippedDiscs,
  onCellClick,
  disabled = false,
  className,
  gameStatus = 'playing',
  winner = null,
}: BoardProps) {
  // Create a Set for O(1) valid move lookups
  const validMoveSet = useMemo(() => {
    return new Set(validMoves.map(m => `${m.row},${m.col}`))
  }, [validMoves])

  // Create a Map for O(1) flipped disc lookups with index for delay calculation
  const flippedDiscsMap = useMemo(() => {
    const map = new Map<string, number>()
    lastFlippedDiscs.forEach((d, index) => {
      map.set(`${d.row},${d.col}`, index)
    })
    return map
  }, [lastFlippedDiscs])

  const isValidMove = useCallback((row: number, col: number): boolean => {
    return validMoveSet.has(`${row},${col}`)
  }, [validMoveSet])

  const isFlipping = useCallback((row: number, col: number): boolean => {
    return flippedDiscsMap.has(`${row},${col}`)
  }, [flippedDiscsMap])

  const getFlipDelay = useCallback((row: number, col: number): number => {
    // Calculate delay based on position in the flipped discs array for chain effect
    const index = flippedDiscsMap.get(`${row},${col}`)
    return index !== undefined ? Math.min(index, 7) : 0 // Cap at 7 for the delay classes
  }, [flippedDiscsMap])

  const isLastMove = useCallback((row: number, col: number): boolean => {
    return lastMove?.row === row && lastMove?.col === col
  }, [lastMove])

  // Check if this disc belongs to the winner (for game end animation)
  const isWinningDisc = useCallback((row: number, col: number): boolean => {
    if (gameStatus !== 'won' || winner === null) return false
    return board[row][col] === winner
  }, [gameStatus, winner, board])

  return (
    // Matte wooden frame with coordinate labels in its margin
    <div
      className={cn(
        'arcade-board relative mx-auto bg-[#5b4333] p-6 sm:p-7',
        className
      )}
    >
      {/* Column labels */}
      <div
        className="pointer-events-none absolute inset-x-6 top-0 flex h-6 text-xs text-muted-foreground sm:inset-x-7 sm:h-7"
        aria-hidden="true"
      >
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div key={i} className="flex flex-1 items-center justify-center">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      {/* Row labels */}
      <div
        className="pointer-events-none absolute inset-y-6 left-0 flex w-6 flex-col text-xs text-muted-foreground sm:inset-y-7 sm:w-7"
        aria-hidden="true"
      >
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div key={i} className="flex flex-1 items-center justify-center">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Felt with hairline grid */}
      <div
        role="grid"
        aria-label="Othello game board"
        className="relative grid aspect-square w-full gap-px overflow-hidden rounded-[2px] border border-[#0f3d28] bg-[#0f3d28]"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        }}
      >
        {board.map((row, rowIndex) => (
          <div key={rowIndex} role="row" className="contents">
            {row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                player={cell}
                row={rowIndex}
                col={colIndex}
                isValidMove={isValidMove(rowIndex, colIndex)}
                isFlipping={isFlipping(rowIndex, colIndex)}
                flipDelay={getFlipDelay(rowIndex, colIndex)}
                isLastMove={isLastMove(rowIndex, colIndex)}
                isWinningDisc={isWinningDisc(rowIndex, colIndex)}
                onClick={onCellClick}
                disabled={disabled}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
