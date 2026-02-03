/**
 * Board Component
 * Renders the 8x8 Othello game board with premium felt texture and wooden frame
 */

import { useState, useMemo, useCallback } from 'react'
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
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

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
    // Outer wooden frame
    <div
      className={cn(
        'relative mx-auto w-full max-w-2xl rounded-xl p-3 sm:p-4 wooden-frame',
        className
      )}
    >
      {/* Frame corner decorations */}
      <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 opacity-60" />
      <div className="absolute right-2 top-2 h-4 w-4 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 opacity-60" />
      <div className="absolute bottom-2 left-2 h-4 w-4 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 opacity-60" />
      <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 opacity-60" />

      {/* Inner felt board */}
      <div
        role="grid"
        aria-label="Othello game board"
        className={cn(
          'relative grid aspect-square w-full gap-0.5 rounded-lg p-2',
          'bg-gradient-to-br from-[#247a4d] via-[#1a5f3c] to-[#134830]',
          'board-felt-texture',
          'shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]'
        )}
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
                onHover={(r, c) => setHoveredCell({ row: r, col: c })}
                onHoverEnd={() => setHoveredCell(null)}
                disabled={disabled}
              />
            ))}
          </div>
        ))}

        {/* Row labels - inside the felt area */}
        <div className="pointer-events-none absolute -left-6 top-0 flex h-full flex-col justify-around py-2 text-xs font-semibold text-green-200/80">
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div key={i} className="flex items-center justify-center">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Column labels - inside the felt area */}
        <div className="pointer-events-none absolute -top-6 left-0 flex w-full justify-around px-2 text-xs font-semibold text-green-200/80">
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div key={i} className="flex items-center justify-center">
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {/* Hover preview info */}
        {hoveredCell && isValidMove(hoveredCell.row, hoveredCell.col) && (() => {
          const hoveredMove = validMoves.find(m => m.row === hoveredCell.row && m.col === hoveredCell.col)
          const flipsCount = hoveredMove?.flipsCount || 0
          return (
            <div className="absolute -bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
              <span className="text-yellow-400">{flipsCount}</span> disc{flipsCount !== 1 ? 's' : ''} will flip
            </div>
          )
        })()}
      </div>
    </div>
  )
}
