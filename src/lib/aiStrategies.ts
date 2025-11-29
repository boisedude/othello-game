/**
 * Othello AI Strategies - "Coop's Brain"
 * Implements different difficulty levels for the computer opponent
 */

import type { Board, Player, Difficulty, ValidMove } from '@/types/othello.types'
import {
  getValidMoves,
  simulateMove,
  getWinner,
  isGameOver,
  countDiscs,
  getOpponent,
} from './othelloRules'
import { BOARD_SIZE } from '@/types/othello.types'

/**
 * Gets the AI's move based on difficulty level
 * Returns the chosen move { row, col }
 */
export function getAIMove(
  board: Board,
  player: Player,
  difficulty: Difficulty
): { row: number; col: number } {
  const validMoves = getValidMoves(board, player)

  if (validMoves.length === 0) {
    throw new Error('No valid moves available for AI')
  }

  switch (difficulty) {
    case 'easy':
      return getRandomMove(validMoves)
    case 'medium':
      return getGreedyMove(board, player, validMoves)
    case 'hard':
      return getMinimaxMove(board, player, validMoves)
    default:
      return getRandomMove(validMoves)
  }
}

/**
 * Easy AI: Random valid move
 * "Sleepy Coop" - Hung over and barely functional
 */
function getRandomMove(validMoves: ValidMove[]): { row: number; col: number } {
  const move = validMoves[Math.floor(Math.random() * validMoves.length)]
  return { row: move.row, col: move.col }
}

/**
 * Medium AI: Greedy strategy
 * "Caffeinated Coop" - Coffee-powered tactical thinking
 *
 * Priority:
 * 1. Take corner if available
 * 2. Avoid X-squares (diagonally adjacent to corners) unless safe
 * 3. Maximize disc flips
 * 4. Prefer edge positions
 */
function getGreedyMove(
  board: Board,
  _player: Player,
  validMoves: ValidMove[]
): { row: number; col: number } {
  // 1. CORNERS - Highest priority (can never be flipped!)
  const corners = [
    { row: 0, col: 0 },
    { row: 0, col: BOARD_SIZE - 1 },
    { row: BOARD_SIZE - 1, col: 0 },
    { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 },
  ]

  for (const corner of corners) {
    const move = validMoves.find(m => m.row === corner.row && m.col === corner.col)
    if (move) return { row: move.row, col: move.col }
  }

  // 2. Avoid X-squares (diagonally adjacent to empty corners)
  // These are dangerous early game
  const xSquares = [
    { row: 1, col: 1, corner: { row: 0, col: 0 } },
    { row: 1, col: BOARD_SIZE - 2, corner: { row: 0, col: BOARD_SIZE - 1 } },
    { row: BOARD_SIZE - 2, col: 1, corner: { row: BOARD_SIZE - 1, col: 0 } },
    { row: BOARD_SIZE - 2, col: BOARD_SIZE - 2, corner: { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 } },
  ]

  const safeXSquares = xSquares.filter(xs =>
    board[xs.corner.row][xs.corner.col] !== null // Corner is occupied, so X-square is safe
  )

  const nonXSquareMoves = validMoves.filter(move => {
    const isXSquare = xSquares.some(xs => xs.row === move.row && xs.col === move.col)
    const isSafeXSquare = safeXSquares.some(xs => xs.row === move.row && xs.col === move.col)
    return !isXSquare || isSafeXSquare
  })

  const movesToConsider = nonXSquareMoves.length > 0 ? nonXSquareMoves : validMoves

  // 3. EDGES - Good positions (harder to flip)
  const edgeMoves = movesToConsider.filter(
    m =>
      (m.row === 0 || m.row === BOARD_SIZE - 1 || m.col === 0 || m.col === BOARD_SIZE - 1) &&
      !corners.some(c => c.row === m.row && c.col === m.col)
  )

  if (edgeMoves.length > 0) {
    // Among edge moves, prefer those that flip the most discs
    edgeMoves.sort((a, b) => b.flipsCount - a.flipsCount)
    return { row: edgeMoves[0].row, col: edgeMoves[0].col }
  }

  // 4. Maximize flips (greedy approach)
  movesToConsider.sort((a, b) => b.flipsCount - a.flipsCount)
  return { row: movesToConsider[0].row, col: movesToConsider[0].col }
}

/**
 * Hard AI: Minimax with alpha-beta pruning
 * "Bentley - The Mastermind"
 */
function getMinimaxMove(
  board: Board,
  player: Player,
  validMoves: ValidMove[]
): { row: number; col: number } {
  const depth = 6 // Search depth
  let bestMove: { row: number; col: number } | null = null
  let bestScore = -Infinity

  // Order moves by strategic preference for better pruning
  const orderedMoves = orderMovesByPreference(validMoves, board)

  for (const move of orderedMoves) {
    const newBoard = simulateMove(board, move.row, move.col, player)
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, player)

    if (score > bestScore) {
      bestScore = score
      bestMove = { row: move.row, col: move.col }
    }
  }

  return bestMove || { row: validMoves[0].row, col: validMoves[0].col }
}

/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: Player
): number {
  const opponent = getOpponent(aiPlayer)

  // Terminal states
  if (isGameOver(board)) {
    const winner = getWinner(board)
    if (winner === aiPlayer) return 10000 + depth // Prefer faster wins
    if (winner === opponent) return -10000 - depth // Avoid faster losses
    return 0 // Draw
  }

  // Depth limit reached
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer)
  }

  const currentPlayer = isMaximizing ? aiPlayer : opponent
  const validMoves = getValidMoves(board, currentPlayer)

  // If current player has no moves, pass turn to opponent
  if (validMoves.length === 0) {
    return minimax(board, depth - 1, alpha, beta, !isMaximizing, aiPlayer)
  }

  const orderedMoves = orderMovesByPreference(validMoves, board)

  if (isMaximizing) {
    let maxScore = -Infinity

    for (const move of orderedMoves) {
      const newBoard = simulateMove(board, move.row, move.col, aiPlayer)
      const score = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer)
      maxScore = Math.max(maxScore, score)
      alpha = Math.max(alpha, score)

      if (beta <= alpha) break // Beta cutoff
    }

    return maxScore
  } else {
    let minScore = Infinity

    for (const move of orderedMoves) {
      const newBoard = simulateMove(board, move.row, move.col, opponent)
      const score = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer)
      minScore = Math.min(minScore, score)
      beta = Math.min(beta, score)

      if (beta <= alpha) break // Alpha cutoff
    }

    return minScore
  }
}

/**
 * Evaluation function for board state
 * Uses classic Othello strategy: position > mobility > disc count
 */
function evaluateBoard(board: Board, player: Player): number {
  const opponent = getOpponent(player)
  let score = 0

  // 1. CORNERS (worth 100 points each)
  const corners = [
    [0, 0],
    [0, BOARD_SIZE - 1],
    [BOARD_SIZE - 1, 0],
    [BOARD_SIZE - 1, BOARD_SIZE - 1],
  ]
  for (const [row, col] of corners) {
    if (board[row][col] === player) score += 100
    else if (board[row][col] === opponent) score -= 100
  }

  // 2. X-SQUARES (cells diagonally adjacent to corners - worth -25 if corner is empty)
  const xSquares = [
    { pos: [1, 1], corner: [0, 0] },
    { pos: [1, BOARD_SIZE - 2], corner: [0, BOARD_SIZE - 1] },
    { pos: [BOARD_SIZE - 2, 1], corner: [BOARD_SIZE - 1, 0] },
    { pos: [BOARD_SIZE - 2, BOARD_SIZE - 2], corner: [BOARD_SIZE - 1, BOARD_SIZE - 1] },
  ]
  for (const xs of xSquares) {
    const [xRow, xCol] = xs.pos
    const [cRow, cCol] = xs.corner
    if (board[cRow][cCol] === null) {
      // Corner is empty, X-square is dangerous
      if (board[xRow][xCol] === player) score -= 25
      else if (board[xRow][xCol] === opponent) score += 25
    }
  }

  // 3. C-SQUARES (cells adjacent to corners - worth -20 if corner is empty)
  const cSquares = [
    { pos: [0, 1], corner: [0, 0] },
    { pos: [1, 0], corner: [0, 0] },
    { pos: [0, BOARD_SIZE - 2], corner: [0, BOARD_SIZE - 1] },
    { pos: [1, BOARD_SIZE - 1], corner: [0, BOARD_SIZE - 1] },
    { pos: [BOARD_SIZE - 2, 0], corner: [BOARD_SIZE - 1, 0] },
    { pos: [BOARD_SIZE - 1, 1], corner: [BOARD_SIZE - 1, 0] },
    { pos: [BOARD_SIZE - 1, BOARD_SIZE - 2], corner: [BOARD_SIZE - 1, BOARD_SIZE - 1] },
    { pos: [BOARD_SIZE - 2, BOARD_SIZE - 1], corner: [BOARD_SIZE - 1, BOARD_SIZE - 1] },
  ]
  for (const cs of cSquares) {
    const [cRow, cCol] = cs.pos
    const [cornerRow, cornerCol] = cs.corner
    if (board[cornerRow][cornerCol] === null) {
      if (board[cRow][cCol] === player) score -= 20
      else if (board[cRow][cCol] === opponent) score += 20
    }
  }

  // 4. EDGES (worth 5 points each, excluding corners and C-squares)
  for (let i = 2; i < BOARD_SIZE - 2; i++) {
    // Top and bottom edges
    if (board[0][i] === player) score += 5
    else if (board[0][i] === opponent) score -= 5
    if (board[BOARD_SIZE - 1][i] === player) score += 5
    else if (board[BOARD_SIZE - 1][i] === opponent) score -= 5

    // Left and right edges
    if (board[i][0] === player) score += 5
    else if (board[i][0] === opponent) score -= 5
    if (board[i][BOARD_SIZE - 1] === player) score += 5
    else if (board[i][BOARD_SIZE - 1] === opponent) score -= 5
  }

  // 5. MOBILITY (number of valid moves - worth 2 points per move)
  const playerMoves = getValidMoves(board, player).length
  const opponentMoves = getValidMoves(board, opponent).length
  score += (playerMoves - opponentMoves) * 2

  // 6. DISC COUNT (less important than position, worth 1 point per disc)
  const { black, white } = countDiscs(board)
  const playerDiscs = player === 1 ? black : white
  const opponentDiscs = player === 1 ? white : black
  score += (playerDiscs - opponentDiscs)

  return score
}

/**
 * Orders moves by strategic preference
 * Priority: Corners > Edges > Center > X-squares
 * Helps with alpha-beta pruning efficiency
 */
function orderMovesByPreference(moves: ValidMove[], board: Board): ValidMove[] {
  const getMovePriority = (move: ValidMove): number => {
    const { row, col } = move

    // Corners (highest priority)
    if (
      (row === 0 && col === 0) ||
      (row === 0 && col === BOARD_SIZE - 1) ||
      (row === BOARD_SIZE - 1 && col === 0) ||
      (row === BOARD_SIZE - 1 && col === BOARD_SIZE - 1)
    ) {
      return 1000
    }

    // Edges
    if (row === 0 || row === BOARD_SIZE - 1 || col === 0 || col === BOARD_SIZE - 1) {
      return 500
    }

    // X-squares (lowest priority unless corner is taken)
    const isXSquare =
      (row === 1 && col === 1 && board[0][0] === null) ||
      (row === 1 && col === BOARD_SIZE - 2 && board[0][BOARD_SIZE - 1] === null) ||
      (row === BOARD_SIZE - 2 && col === 1 && board[BOARD_SIZE - 1][0] === null) ||
      (row === BOARD_SIZE - 2 && col === BOARD_SIZE - 2 && board[BOARD_SIZE - 1][BOARD_SIZE - 1] === null)

    if (isXSquare) {
      return -100
    }

    // Center region
    const distanceFromCenter = Math.abs(row - BOARD_SIZE / 2) + Math.abs(col - BOARD_SIZE / 2)
    return 100 - distanceFromCenter * 10
  }

  return [...moves].sort((a, b) => getMovePriority(b) - getMovePriority(a))
}
