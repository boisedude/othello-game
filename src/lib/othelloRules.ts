/**
 * Othello (Reversi) Game Rules Engine
 * Handles board setup, move validation, disc flipping, and win conditions
 */

import type {
  Board,
  Player,
  ValidMove,
  GameState,
  Direction,
} from '@/types/othello.types'
import { BOARD_SIZE, DIRECTIONS } from '@/types/othello.types'

/**
 * Creates an empty 8x8 board
 */
export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))
}

/**
 * Creates initial Othello board with 4 discs in center
 * Initial setup:
 *   3 4
 * 3 W B
 * 4 B W
 */
export function createInitialBoard(): Board {
  const board = createEmptyBoard()
  const mid = Math.floor(BOARD_SIZE / 2)

  // Place initial 4 discs
  board[mid - 1][mid - 1] = 2 // White (top-left)
  board[mid - 1][mid] = 1     // Black (top-right)
  board[mid][mid - 1] = 1     // Black (bottom-left)
  board[mid][mid] = 2         // White (bottom-right)

  return board
}

/**
 * Checks if a position is within board bounds
 */
export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

/**
 * Gets the opponent player
 */
export function getOpponent(player: Player): Player {
  return player === 1 ? 2 : 1
}

/**
 * Checks if placing a disc at (row, col) would flip discs in a given direction
 * Returns the positions that would be flipped in that direction
 */
function checkDirection(
  board: Board,
  row: number,
  col: number,
  player: Player,
  direction: Direction
): Array<{ row: number; col: number }> {
  const [dr, dc] = direction
  const opponent = getOpponent(player)
  const flipped: Array<{ row: number; col: number }> = []

  let r = row + dr
  let c = col + dc

  // First, we need to find at least one opponent disc
  while (isValidPosition(r, c) && board[r][c] === opponent) {
    flipped.push({ row: r, col: c })
    r += dr
    c += dc
  }

  // Then, we need to find one of our own discs to sandwich the opponent's discs
  if (isValidPosition(r, c) && board[r][c] === player && flipped.length > 0) {
    return flipped
  }

  return []
}

/**
 * Gets all discs that would be flipped if player places a disc at (row, col)
 */
export function getFlippedDiscs(
  board: Board,
  row: number,
  col: number,
  player: Player
): Array<{ row: number; col: number }> {
  if (!isValidPosition(row, col) || board[row][col] !== null) {
    return []
  }

  const allFlipped: Array<{ row: number; col: number }> = []

  for (const direction of DIRECTIONS) {
    const flipped = checkDirection(board, row, col, player, direction)
    allFlipped.push(...flipped)
  }

  return allFlipped
}

/**
 * Checks if a move is valid (would flip at least one disc)
 */
export function isValidMove(
  board: Board,
  row: number,
  col: number,
  player: Player
): boolean {
  return getFlippedDiscs(board, row, col, player).length > 0
}

/**
 * Gets all valid moves for a player
 */
export function getValidMoves(board: Board, player: Player): ValidMove[] {
  const validMoves: ValidMove[] = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const flippedPositions = getFlippedDiscs(board, row, col, player)
      if (flippedPositions.length > 0) {
        validMoves.push({
          row,
          col,
          flipsCount: flippedPositions.length,
          flippedPositions,
        })
      }
    }
  }

  return validMoves
}

/**
 * Executes a move and returns the new board state with flipped discs
 */
export function executeMove(
  board: Board,
  row: number,
  col: number,
  player: Player
): Board {
  const flippedDiscs = getFlippedDiscs(board, row, col, player)

  if (flippedDiscs.length === 0) {
    // Invalid move, return board unchanged
    return board
  }

  // Create new board (immutable update)
  const newBoard = board.map((r) => [...r])

  // Place the new disc
  newBoard[row][col] = player

  // Flip all opponent discs
  for (const { row: r, col: c } of flippedDiscs) {
    newBoard[r][c] = player
  }

  return newBoard
}

/**
 * Counts discs for each player
 */
export function countDiscs(board: Board): { black: number; white: number } {
  let black = 0
  let white = 0

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 1) black++
      else if (board[row][col] === 2) white++
    }
  }

  return { black, white }
}

/**
 * Checks if the board is full
 */
export function isBoardFull(board: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) return false
    }
  }
  return true
}

/**
 * Checks if the game is over
 * Game ends when:
 * 1. Board is full, OR
 * 2. Neither player has valid moves
 */
export function isGameOver(board: Board): boolean {
  if (isBoardFull(board)) return true

  // Check if either player has valid moves
  const player1HasMoves = getValidMoves(board, 1).length > 0
  const player2HasMoves = getValidMoves(board, 2).length > 0

  return !player1HasMoves && !player2HasMoves
}

/**
 * Determines the winner
 * Returns 1 if black wins, 2 if white wins, null if draw
 */
export function getWinner(board: Board): Player | null {
  const { black, white } = countDiscs(board)

  if (black > white) return 1
  if (white > black) return 2
  return null // Draw
}

/**
 * Creates a complete game state after a move
 */
export function makeMove(
  currentState: GameState,
  row: number,
  col: number
): GameState {
  const { board, currentPlayer, moveHistory } = currentState

  // Execute the move
  const newBoard = executeMove(board, row, col, currentPlayer)

  // Count discs
  const { black, white } = countDiscs(newBoard)

  // Add move to history
  const newMoveHistory = [
    ...moveHistory,
    { row, col, player: currentPlayer },
  ]

  // Determine next player
  const opponent = getOpponent(currentPlayer)
  const opponentHasMoves = getValidMoves(newBoard, opponent).length > 0
  const currentPlayerHasMoves = getValidMoves(newBoard, currentPlayer).length > 0

  // Next player logic:
  // - If opponent has moves, switch to opponent
  // - If opponent has no moves but current player has moves, stay with current player
  // - If neither has moves, game is over
  let nextPlayer = currentPlayer
  if (opponentHasMoves) {
    nextPlayer = opponent
  } else if (!currentPlayerHasMoves) {
    // Neither player has moves, game over
    nextPlayer = currentPlayer // Doesn't matter, game is ending
  }

  // Check game over
  const gameOver = isGameOver(newBoard)
  const winner = gameOver ? getWinner(newBoard) : null

  return {
    ...currentState,
    board: newBoard,
    currentPlayer: nextPlayer,
    status: gameOver ? (winner === null ? 'draw' : 'won') : 'playing',
    winner,
    lastMove: { row, col, player: currentPlayer },
    moveHistory: newMoveHistory,
    blackCount: black,
    whiteCount: white,
    validMoves: getValidMoves(newBoard, nextPlayer),
  }
}

/**
 * Simulates a move without modifying the original board
 * Used by AI for lookahead
 */
export function simulateMove(
  board: Board,
  row: number,
  col: number,
  player: Player
): Board {
  return executeMove(board, row, col, player)
}

/**
 * Debug function to print board (only in development)
 */
export function printBoard(board: Board): void {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    console.log('  0 1 2 3 4 5 6 7')
    board.forEach((row, i) => {
      const rowStr = row.map((cell) => (cell === 1 ? 'B' : cell === 2 ? 'W' : '.')).join(' ')
      console.log(`${i} ${rowStr}`)
    })
    const { black, white } = countDiscs(board)
    console.log(`Black: ${black}, White: ${white}`)
  }
}
