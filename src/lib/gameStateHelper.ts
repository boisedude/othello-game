/**
 * Game State Helper Functions
 * Creates and manages initial game state
 */

import type { GameState, GameMode, Difficulty } from '@/types/othello.types'
import { createInitialBoard, getValidMoves, countDiscs } from './othelloRules'

/**
 * Creates the initial game state
 */
export function createInitialGameState(
  mode: GameMode = 'pvc',
  difficulty: Difficulty = 'medium'
): GameState {
  const board = createInitialBoard()
  const { black, white } = countDiscs(board)

  return {
    board,
    currentPlayer: 1, // Black (Player) always starts
    status: 'playing',
    winner: null,
    mode,
    difficulty,
    moveHistory: [],
    blackCount: black,
    whiteCount: white,
    validMoves: getValidMoves(board, 1),
  }
}
