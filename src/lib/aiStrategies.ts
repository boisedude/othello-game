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
import { BOARD_SIZE, AI_CONFIG } from '@/types/othello.types'
import {
  CORNERS,
  CORNER_POSITIONS,
  X_SQUARES,
  X_SQUARE_POSITIONS,
  C_SQUARE_POSITIONS,
} from './boardPositions'

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
  for (const corner of CORNERS) {
    const move = validMoves.find(m => m.row === corner.row && m.col === corner.col)
    if (move) return { row: move.row, col: move.col }
  }

  // 2. Avoid X-squares (diagonally adjacent to empty corners)
  // These are dangerous early game
  const safeXSquares = X_SQUARES.filter(xs =>
    board[xs.corner.row][xs.corner.col] !== null // Corner is occupied, so X-square is safe
  )

  const nonXSquareMoves = validMoves.filter(move => {
    const isMoveXSquare = X_SQUARES.some(xs => xs.row === move.row && xs.col === move.col)
    const isSafeXSquare = safeXSquares.some(xs => xs.row === move.row && xs.col === move.col)
    return !isMoveXSquare || isSafeXSquare
  })

  const movesToConsider = nonXSquareMoves.length > 0 ? nonXSquareMoves : validMoves

  // 3. EDGES - Good positions (harder to flip)
  const edgeMoves = movesToConsider.filter(
    m =>
      (m.row === 0 || m.row === BOARD_SIZE - 1 || m.col === 0 || m.col === BOARD_SIZE - 1) &&
      !CORNERS.some(c => c.row === m.row && c.col === m.col)
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
  const depth = AI_CONFIG.HARD_SEARCH_DEPTH
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
    if (winner === aiPlayer) return AI_CONFIG.WIN_SCORE + depth // Prefer faster wins
    if (winner === opponent) return AI_CONFIG.LOSS_SCORE - depth // Avoid faster losses
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

  // 1. CORNERS (highest value positions)
  for (const [row, col] of CORNER_POSITIONS) {
    if (board[row][col] === player) score += AI_CONFIG.CORNER_VALUE
    else if (board[row][col] === opponent) score -= AI_CONFIG.CORNER_VALUE
  }

  // 2. X-SQUARES (cells diagonally adjacent to corners - penalty if corner is empty)
  for (const xs of X_SQUARE_POSITIONS) {
    const [xRow, xCol] = xs.pos
    const [cRow, cCol] = xs.corner
    if (board[cRow][cCol] === null) {
      // Corner is empty, X-square is dangerous
      if (board[xRow][xCol] === player) score -= AI_CONFIG.X_SQUARE_PENALTY
      else if (board[xRow][xCol] === opponent) score += AI_CONFIG.X_SQUARE_PENALTY
    }
  }

  // 3. C-SQUARES (cells adjacent to corners - penalty if corner is empty)
  for (const cs of C_SQUARE_POSITIONS) {
    const [cRow, cCol] = cs.pos
    const [cornerRow, cornerCol] = cs.corner
    if (board[cornerRow][cornerCol] === null) {
      if (board[cRow][cCol] === player) score -= AI_CONFIG.C_SQUARE_PENALTY
      else if (board[cRow][cCol] === opponent) score += AI_CONFIG.C_SQUARE_PENALTY
    }
  }

  // 4. EDGES (excluding corners and C-squares)
  for (let i = 2; i < BOARD_SIZE - 2; i++) {
    // Top and bottom edges
    if (board[0][i] === player) score += AI_CONFIG.EDGE_VALUE
    else if (board[0][i] === opponent) score -= AI_CONFIG.EDGE_VALUE
    if (board[BOARD_SIZE - 1][i] === player) score += AI_CONFIG.EDGE_VALUE
    else if (board[BOARD_SIZE - 1][i] === opponent) score -= AI_CONFIG.EDGE_VALUE

    // Left and right edges
    if (board[i][0] === player) score += AI_CONFIG.EDGE_VALUE
    else if (board[i][0] === opponent) score -= AI_CONFIG.EDGE_VALUE
    if (board[i][BOARD_SIZE - 1] === player) score += AI_CONFIG.EDGE_VALUE
    else if (board[i][BOARD_SIZE - 1] === opponent) score -= AI_CONFIG.EDGE_VALUE
  }

  // 5. MOBILITY (number of valid moves)
  const playerMoves = getValidMoves(board, player).length
  const opponentMoves = getValidMoves(board, opponent).length
  score += (playerMoves - opponentMoves) * AI_CONFIG.MOBILITY_WEIGHT

  // 6. DISC COUNT (less important than position)
  const { black, white } = countDiscs(board)
  const playerDiscs = player === 1 ? black : white
  const opponentDiscs = player === 1 ? white : black
  score += (playerDiscs - opponentDiscs) * AI_CONFIG.DISC_COUNT_WEIGHT

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
    if (CORNERS.some(c => c.row === row && c.col === col)) {
      return AI_CONFIG.CORNER_PRIORITY
    }

    // Edges
    if (row === 0 || row === BOARD_SIZE - 1 || col === 0 || col === BOARD_SIZE - 1) {
      return AI_CONFIG.EDGE_PRIORITY
    }

    // X-squares (lowest priority unless corner is taken)
    const xSquareMatch = X_SQUARES.find(xs => xs.row === row && xs.col === col)
    if (xSquareMatch && board[xSquareMatch.corner.row][xSquareMatch.corner.col] === null) {
      return AI_CONFIG.X_SQUARE_PRIORITY
    }

    // Center region
    const distanceFromCenter = Math.abs(row - BOARD_SIZE / 2) + Math.abs(col - BOARD_SIZE / 2)
    return AI_CONFIG.CENTER_BASE_PRIORITY - distanceFromCenter * AI_CONFIG.CENTER_DISTANCE_MULTIPLIER
  }

  return [...moves].sort((a, b) => getMovePriority(b) - getMovePriority(a))
}
