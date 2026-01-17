/**
 * Othello (Reversi) Game Type Definitions
 */

// Player identifiers
export type Player = 1 | 2 // 1 = Black (Player), 2 = White (Coop)
export type CellValue = Player | null

// Game board: 8x8 grid
export const BOARD_SIZE = 8

// AI Configuration Constants
export const AI_CONFIG = {
  // Search depths for minimax
  HARD_SEARCH_DEPTH: 6,

  // Scoring weights for board evaluation
  CORNER_VALUE: 100,
  X_SQUARE_PENALTY: 25,  // Penalty when adjacent corner is empty
  C_SQUARE_PENALTY: 20,  // Penalty when adjacent corner is empty
  EDGE_VALUE: 5,
  MOBILITY_WEIGHT: 2,
  DISC_COUNT_WEIGHT: 1,

  // Win/loss evaluation scores
  WIN_SCORE: 10000,
  LOSS_SCORE: -10000,

  // Move ordering priorities
  CORNER_PRIORITY: 1000,
  EDGE_PRIORITY: 500,
  X_SQUARE_PRIORITY: -100,
  CENTER_BASE_PRIORITY: 100,
  CENTER_DISTANCE_MULTIPLIER: 10,

  // Close call threshold (for statistics)
  CLOSE_CALL_MARGIN: 3,
} as const

// Animation Timing Constants (in milliseconds)
export const ANIMATION_TIMING = {
  AI_MOVE_DELAY: 800,        // Delay before AI makes a move
  FLIP_ANIMATION_DELAY: 100, // Delay before state update to show flip animation
  SOUND_FLIP_DELAY: 150,     // Delay before playing flip sound after disc placement
} as const

// Board state (8x8 grid)
export type Board = CellValue[][]

// Game status
export type GameStatus = 'playing' | 'won' | 'draw'

// Game mode
export type GameMode = 'pvp' | 'pvc' // Player vs Player or Player vs Computer

// AI difficulty levels with personality
export type Difficulty = 'easy' | 'medium' | 'hard'

// Move representation
export interface Move {
  row: number // 0-7
  col: number // 0-7
  player: Player
}

// Disc flipping result
export interface FlipResult {
  flippedDiscs: Array<{ row: number; col: number }>
  newBoard: Board
}

// Valid move with metadata
export interface ValidMove {
  row: number
  col: number
  flipsCount: number // Number of discs that would be flipped
  flippedPositions: Array<{ row: number; col: number }>
}

// Complete game state
export interface GameState {
  board: Board
  currentPlayer: Player
  status: GameStatus
  winner: Player | null
  mode: GameMode
  difficulty: Difficulty
  moveHistory: Move[]
  lastMove?: Move
  blackCount: number // Player's disc count
  whiteCount: number // Coop's disc count
  validMoves: ValidMove[] // Valid moves for current player
}

// Leaderboard entry
export interface LeaderboardEntry {
  playerName: string
  wins: number
  losses: number
  draws: number
  winStreak: number
  longestWinStreak: number
  largestMargin: number // Biggest disc count difference
  perfectGames: number // Games where opponent had 0 discs
  totalGames: number
  totalDiscsFlipped: number
}

// Achievement
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  unlocked: boolean
  unlockedAt?: number
}

// Achievement progress
export interface AchievementProgress {
  firstVictory: boolean
  perfectGame: boolean // Win with opponent having 0 discs
  domination: boolean // Win with 50+ disc margin
  massFlip: boolean // Flip 10+ discs in one move
  unstoppable: boolean // 5 win streak
  legendary: boolean // 10 win streak
  cornerMaster: boolean // Control all 4 corners in a game
  strategist: boolean // Beat hard AI
  comeback: boolean // Win after being down by 20+ discs
}

// Saved game state
export interface SavedGame extends GameState {
  savedAt: number
}

// Direction vectors for checking valid moves (8 directions)
export const DIRECTIONS = [
  [-1, -1], // NW
  [-1, 0],  // N
  [-1, 1],  // NE
  [0, -1],  // W
  [0, 1],   // E
  [1, -1],  // SW
  [1, 0],   // S
  [1, 1],   // SE
] as const

export type Direction = typeof DIRECTIONS[number]
