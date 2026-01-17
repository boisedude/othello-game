/**
 * Board Component
 * Renders the 8x8 Othello game board
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Board as BoardType, Move, ValidMove } from '@/types/othello.types'
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
}

export function Board({
  board,
  validMoves,
  lastMove,
  lastFlippedDiscs,
  onCellClick,
  disabled = false,
  className,
}: BoardProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(m => m.row === row && m.col === col)
  }

  const isFlipping = (row: number, col: number): boolean => {
    return lastFlippedDiscs.some(d => d.row === row && d.col === col)
  }

  const isLastMove = (row: number, col: number): boolean => {
    return lastMove?.row === row && lastMove?.col === col
  }

  return (
    <div
      role="grid"
      aria-label="Othello game board"
      className={cn(
        'relative mx-auto grid aspect-square w-full max-w-2xl gap-1 rounded-lg p-4',
        'bg-gradient-to-br from-green-800 via-green-700 to-green-900',
        'shadow-2xl',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            player={cell}
            row={rowIndex}
            col={colIndex}
            isValidMove={isValidMove(rowIndex, colIndex)}
            isFlipping={isFlipping(rowIndex, colIndex)}
            isLastMove={isLastMove(rowIndex, colIndex)}
            onClick={onCellClick}
            onHover={(r, c) => setHoveredCell({ row: r, col: c })}
            onHoverEnd={() => setHoveredCell(null)}
            disabled={disabled}
          />
        ))
      )}

      {/* Row and column labels */}
      <div className="absolute -left-8 top-0 flex h-full flex-col justify-around text-xs text-green-200">
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div key={i} className="flex items-center">
            {i + 1}
          </div>
        ))}
      </div>
      <div className="absolute -top-8 left-0 flex w-full justify-around text-xs text-green-200">
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div key={i} className="flex items-center">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      {/* Hover preview info */}
      {hoveredCell && isValidMove(hoveredCell.row, hoveredCell.col) && (() => {
        const hoveredMove = validMoves.find(m => m.row === hoveredCell.row && m.col === hoveredCell.col)
        const flipsCount = hoveredMove?.flipsCount || 0
        return (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/75 px-2 py-1 text-xs text-white">
            {flipsCount} disc{flipsCount !== 1 ? 's' : ''} will flip
          </div>
        )
      })()}
    </div>
  )
}
