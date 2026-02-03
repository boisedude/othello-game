/**
 * Board Position Constants for Othello AI
 * Defines strategic board positions used in AI evaluation
 */

import { BOARD_SIZE } from '@/types/othello.types'

/**
 * Corner positions - highest value positions that can never be flipped
 */
export const CORNERS = [
  { row: 0, col: 0 },
  { row: 0, col: BOARD_SIZE - 1 },
  { row: BOARD_SIZE - 1, col: 0 },
  { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 },
] as const

/**
 * Corner positions as [row, col] tuples for board evaluation
 */
export const CORNER_POSITIONS = [
  [0, 0],
  [0, BOARD_SIZE - 1],
  [BOARD_SIZE - 1, 0],
  [BOARD_SIZE - 1, BOARD_SIZE - 1],
] as const

/**
 * X-squares - diagonally adjacent to corners
 * Dangerous positions when the adjacent corner is empty
 */
export const X_SQUARES = [
  { row: 1, col: 1, corner: { row: 0, col: 0 } },
  { row: 1, col: BOARD_SIZE - 2, corner: { row: 0, col: BOARD_SIZE - 1 } },
  { row: BOARD_SIZE - 2, col: 1, corner: { row: BOARD_SIZE - 1, col: 0 } },
  { row: BOARD_SIZE - 2, col: BOARD_SIZE - 2, corner: { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 } },
] as const

/**
 * X-squares with positions as [row, col] tuples for board evaluation
 */
export const X_SQUARE_POSITIONS = [
  { pos: [1, 1] as const, corner: [0, 0] as const },
  { pos: [1, BOARD_SIZE - 2] as const, corner: [0, BOARD_SIZE - 1] as const },
  { pos: [BOARD_SIZE - 2, 1] as const, corner: [BOARD_SIZE - 1, 0] as const },
  { pos: [BOARD_SIZE - 2, BOARD_SIZE - 2] as const, corner: [BOARD_SIZE - 1, BOARD_SIZE - 1] as const },
] as const

/**
 * C-squares - orthogonally adjacent to corners
 * Penalty positions when the adjacent corner is empty
 */
export const C_SQUARE_POSITIONS = [
  { pos: [0, 1] as const, corner: [0, 0] as const },
  { pos: [1, 0] as const, corner: [0, 0] as const },
  { pos: [0, BOARD_SIZE - 2] as const, corner: [0, BOARD_SIZE - 1] as const },
  { pos: [1, BOARD_SIZE - 1] as const, corner: [0, BOARD_SIZE - 1] as const },
  { pos: [BOARD_SIZE - 2, 0] as const, corner: [BOARD_SIZE - 1, 0] as const },
  { pos: [BOARD_SIZE - 1, 1] as const, corner: [BOARD_SIZE - 1, 0] as const },
  { pos: [BOARD_SIZE - 1, BOARD_SIZE - 2] as const, corner: [BOARD_SIZE - 1, BOARD_SIZE - 1] as const },
  { pos: [BOARD_SIZE - 2, BOARD_SIZE - 1] as const, corner: [BOARD_SIZE - 1, BOARD_SIZE - 1] as const },
] as const

