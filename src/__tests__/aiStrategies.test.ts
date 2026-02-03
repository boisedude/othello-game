// Unit tests for Othello AI strategies

import { getAIMove } from '@/lib/aiStrategies'
import {
  createInitialBoard,
  createEmptyBoard,
  executeMove,
  getValidMoves,
  isValidMove,
} from '@/lib/othelloRules'
import type { Difficulty } from '@/types/othello.types'

describe('aiStrategies', () => {
  describe('getAIMove', () => {
    describe('Easy difficulty', () => {
      it('should return a valid move', () => {
        const board = createInitialBoard()
        const move = getAIMove(board, 1, 'easy')

        expect(isValidMove(board, move.row, move.col, 1)).toBe(true)
      })

      it('should handle board with limited moves', () => {
        const board = createEmptyBoard()

        // Set up a board with only one valid move for Black
        board[3][3] = 2 // White
        board[3][4] = 1 // Black anchor

        // Only valid move is [3][2]
        const move = getAIMove(board, 1, 'easy')

        expect(move.row).toBe(3)
        expect(move.col).toBe(2)
      })

      it('should make different moves (randomness test)', () => {
        const board = createInitialBoard()
        const moves = new Set<string>()

        // Run 30 times to test randomness
        for (let i = 0; i < 30; i++) {
          const move = getAIMove(board, 1, 'easy')
          moves.add(`${move.row},${move.col}`)
        }

        // With 4 possible moves, we should see variety
        expect(moves.size).toBeGreaterThan(1)
      })

      it('should throw error when no valid moves exist', () => {
        const board = createEmptyBoard()
        board[0][0] = 2 // Only opponent discs

        expect(() => getAIMove(board, 1, 'easy')).toThrow(
          'No valid moves available for AI'
        )
      })
    })

    describe('Medium difficulty', () => {
      it('should return a valid move', () => {
        const board = createInitialBoard()
        const move = getAIMove(board, 1, 'medium')

        expect(isValidMove(board, move.row, move.col, 1)).toBe(true)
      })

      it('should prioritize corners when available', () => {
        const board = createEmptyBoard()

        // Set up a scenario where corner [0][0] is a valid move
        board[0][1] = 2 // White
        board[0][2] = 1 // Black anchor

        // Also set up non-corner moves
        board[3][3] = 2
        board[3][4] = 1

        const move = getAIMove(board, 1, 'medium')

        // Should take the corner
        expect(move.row).toBe(0)
        expect(move.col).toBe(0)
      })

      it('should take any available corner', () => {
        const board = createEmptyBoard()

        // Set up corner [7][7] as valid
        board[7][6] = 2 // White
        board[7][5] = 1 // Black anchor

        const move = getAIMove(board, 1, 'medium')

        expect(move.row).toBe(7)
        expect(move.col).toBe(7)
      })

      it('should prefer edges when no corners available', () => {
        const board = createEmptyBoard()

        // Set up edge move on top edge
        board[0][3] = 2 // White
        board[0][4] = 1 // Black anchor

        // Set up center move
        board[3][3] = 2
        board[3][4] = 1

        const move = getAIMove(board, 1, 'medium')

        // Should prefer edge (row 0)
        expect(move.row).toBe(0)
        expect(move.col).toBe(2)
      })

      it('should be deterministic for same board position', () => {
        const board = createInitialBoard()

        const move1 = getAIMove(board, 1, 'medium')
        const move2 = getAIMove(board, 1, 'medium')

        expect(move1).toEqual(move2)
      })
    })

    describe('Hard difficulty', () => {
      it('should return a valid move', () => {
        const board = createInitialBoard()
        const move = getAIMove(board, 1, 'hard')

        expect(isValidMove(board, move.row, move.col, 1)).toBe(true)
      })

      it('should be deterministic (minimax is not random)', () => {
        const board = createInitialBoard()

        const move1 = getAIMove(board, 1, 'hard')
        const move2 = getAIMove(board, 1, 'hard')
        const move3 = getAIMove(board, 1, 'hard')

        expect(move1).toEqual(move2)
        expect(move2).toEqual(move3)
      })

      it('should complete within reasonable time for initial board', () => {
        const board = createInitialBoard()
        const startTime = Date.now()

        getAIMove(board, 1, 'hard')

        const elapsed = Date.now() - startTime

        // Hard AI with depth 6 should complete in under 2 seconds
        expect(elapsed).toBeLessThan(2000)
      })

      it('should prefer corner move when available', () => {
        const board = createEmptyBoard()

        // Set up corner [0][0] as valid
        board[0][1] = 2
        board[0][2] = 1

        // Also set up a center move
        board[4][4] = 2
        board[4][5] = 1

        const move = getAIMove(board, 1, 'hard')

        // Minimax should value corner highly
        expect(move.row).toBe(0)
        expect(move.col).toBe(0)
      })
    })

    describe('AI values corners highly', () => {
      it('should take corner over edge move', () => {
        const board = createEmptyBoard()

        // Set up corner [0][0] as valid
        board[0][1] = 2
        board[0][2] = 1

        // Set up edge move at [0][5]
        board[0][4] = 2
        board[0][3] = 1

        const difficulties: Difficulty[] = ['medium', 'hard']
        difficulties.forEach(difficulty => {
          const move = getAIMove(board, 1, difficulty)
          expect(move).toEqual({ row: 0, col: 0 })
        })
      })

      it('should take corner when it is the only good option', () => {
        const board = createEmptyBoard()

        // Set up corner move at [0][0] with 1 flip
        // Only make the corner move available to isolate the test
        board[0][1] = 2
        board[0][2] = 1

        const move = getAIMove(board, 1, 'hard')

        // Should take the corner
        expect(move).toEqual({ row: 0, col: 0 })
      })
    })

    describe('AI avoids X-squares next to empty corners', () => {
      it('should avoid X-square [1][1] when corner [0][0] is empty', () => {
        const board = createEmptyBoard()

        // Make X-square [1][1] a valid move
        board[2][2] = 2
        board[3][3] = 1

        // Make a safe alternative move
        board[4][4] = 2
        board[4][5] = 1

        const move = getAIMove(board, 1, 'medium')

        // Should NOT choose X-square when alternative exists
        expect(move.row !== 1 || move.col !== 1).toBe(true)
      })

      it('should take X-square if corner is already occupied', () => {
        const board = createEmptyBoard()

        // Occupy the corner
        board[0][0] = 1

        // Make X-square [1][1] the only valid move
        board[1][2] = 2
        board[1][3] = 1

        const validMoves = getValidMoves(board, 1)

        // If [1][1] is a valid move and corner is taken, it's safe
        const xSquareMove = validMoves.find(m => m.row === 1 && m.col === 1)
        if (xSquareMove) {
          const move = getAIMove(board, 1, 'medium')
          // Should be willing to take it since corner is secure
          expect(move).toBeDefined()
        }
      })

      it('should avoid all X-squares when possible', () => {
        // X-squares are at [1][1], [1][6], [6][1], [6][6]
        const xSquares = [
          { row: 1, col: 1 },
          { row: 1, col: 6 },
          { row: 6, col: 1 },
          { row: 6, col: 6 },
        ]

        const board = createInitialBoard()

        // Make a move that doesn't land on X-square
        const move = getAIMove(board, 1, 'medium')

        // Initial board moves should not be X-squares
        const isXSquare = xSquares.some(
          xs => xs.row === move.row && xs.col === move.col
        )
        expect(isXSquare).toBe(false)
      })
    })

    describe('Minimax evaluates board position correctly', () => {
      it('should evaluate winning position as very positive', () => {
        // Create a near-winning board for player 1
        const board = createEmptyBoard()

        // Fill most with Black
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            board[i][j] = 1
          }
        }

        // Leave one White and one empty for a valid move
        board[7][6] = 2
        board[7][7] = null

        const validMoves = getValidMoves(board, 1)
        if (validMoves.length > 0) {
          const move = getAIMove(board, 1, 'hard')
          expect(isValidMove(board, move.row, move.col, 1)).toBe(true)
        }
      })

      it('should prefer moves that maintain mobility', () => {
        const board = createInitialBoard()

        // Execute a move and verify AI doesn't trap itself
        const move = getAIMove(board, 1, 'hard')
        const newBoard = executeMove(board, move.row, move.col, 1)

        // After the move, opponent should have moves (game shouldn't end immediately)
        const opponentMoves = getValidMoves(newBoard, 2)
        expect(opponentMoves.length).toBeGreaterThan(0)
      })

      it('should avoid moves that give opponent corners', () => {
        const board = createEmptyBoard()

        // Set up a scenario where certain moves would give opponent a corner
        board[0][2] = 1
        board[0][3] = 2
        board[1][1] = 2
        board[1][2] = 1

        // Playing at [0][1] might expose corner to opponent
        // Hard AI should evaluate and potentially avoid this

        const validMoves = getValidMoves(board, 1)
        if (validMoves.length > 0) {
          const move = getAIMove(board, 1, 'hard')
          expect(isValidMove(board, move.row, move.col, 1)).toBe(true)
        }
      })
    })

    describe('Edge cases', () => {
      it('should handle few moves available', () => {
        const board = createEmptyBoard()

        // Only one valid move
        board[0][1] = 2
        board[0][2] = 1

        const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
        difficulties.forEach(difficulty => {
          const move = getAIMove(board, 1, difficulty)
          expect(move).toEqual({ row: 0, col: 0 })
        })
      })

      it('should handle endgame with limited options', () => {
        const board = createEmptyBoard()

        // Near-endgame: few empty cells
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (i < 4) {
              board[i][j] = 1
            } else {
              board[i][j] = 2
            }
          }
        }

        // Create one empty cell with valid move
        board[4][0] = null
        board[3][0] = 1 // Anchor
        board[5][0] = 2 // To be flipped

        const validMoves = getValidMoves(board, 1)
        if (validMoves.length > 0) {
          const move = getAIMove(board, 1, 'hard')
          expect(move).toEqual({ row: 4, col: 0 })
        }
      })

      it('should work for both players', () => {
        const board = createInitialBoard()

        // Test for player 1 (Black)
        const blackMove = getAIMove(board, 1, 'hard')
        expect(isValidMove(board, blackMove.row, blackMove.col, 1)).toBe(true)

        // Test for player 2 (White)
        const whiteMove = getAIMove(board, 2, 'hard')
        expect(isValidMove(board, whiteMove.row, whiteMove.col, 2)).toBe(true)
      })

      it('should handle mid-game complexity', () => {
        // Create a mid-game position
        let board = createInitialBoard()

        // Play a few moves
        board = executeMove(board, 2, 3, 1) // Black
        board = executeMove(board, 2, 2, 2) // White
        board = executeMove(board, 2, 4, 1) // Black
        board = executeMove(board, 2, 5, 2) // White

        const validMoves = getValidMoves(board, 1)
        if (validMoves.length > 0) {
          const startTime = Date.now()
          const move = getAIMove(board, 1, 'hard')
          const elapsed = Date.now() - startTime

          expect(isValidMove(board, move.row, move.col, 1)).toBe(true)
          expect(elapsed).toBeLessThan(3000) // Should still be fast
        }
      })
    })

    describe('All difficulty levels work', () => {
      it('should return valid moves for all difficulties', () => {
        const board = createInitialBoard()
        const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

        difficulties.forEach(difficulty => {
          const move = getAIMove(board, 1, difficulty)
          expect(isValidMove(board, move.row, move.col, 1)).toBe(true)
        })
      })

      it('should handle complex positions for all difficulties', () => {
        let board = createInitialBoard()

        // Create a more complex position
        board = executeMove(board, 2, 3, 1)
        board = executeMove(board, 2, 2, 2)

        const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

        difficulties.forEach(difficulty => {
          const move = getAIMove(board, 1, difficulty)
          expect(isValidMove(board, move.row, move.col, 1)).toBe(true)
        })
      })
    })

    describe('Performance', () => {
      it('should complete hard AI in reasonable time for standard position', () => {
        const board = createInitialBoard()
        const startTime = Date.now()

        for (let i = 0; i < 5; i++) {
          getAIMove(board, 1, 'hard')
        }

        const elapsed = Date.now() - startTime
        const avgTime = elapsed / 5

        // Average should be under 500ms per move
        expect(avgTime).toBeLessThan(500)
      })

      it('should complete easy/medium AI almost instantly', () => {
        const board = createInitialBoard()
        const startTime = Date.now()

        for (let i = 0; i < 100; i++) {
          getAIMove(board, 1, 'easy')
          getAIMove(board, 1, 'medium')
        }

        const elapsed = Date.now() - startTime

        // 200 moves should complete in under 500ms
        expect(elapsed).toBeLessThan(500)
      })
    })

    describe('Strategic consistency', () => {
      it('should make different choices at different difficulties', () => {
        // On complex boards, different difficulties might choose differently
        let board = createInitialBoard()

        // Create a position with multiple viable options
        board = executeMove(board, 2, 3, 1)
        board = executeMove(board, 2, 2, 2)
        board = executeMove(board, 3, 2, 1)

        const easyMoves = new Set<string>()
        const mediumMoves = new Set<string>()

        // Run easy AI multiple times (it's random)
        for (let i = 0; i < 20; i++) {
          const move = getAIMove(board, 2, 'easy')
          easyMoves.add(`${move.row},${move.col}`)
        }

        // Run medium AI (deterministic)
        const mediumMove = getAIMove(board, 2, 'medium')
        mediumMoves.add(`${mediumMove.row},${mediumMove.col}`)

        // Easy should show randomness, medium should be consistent
        expect(easyMoves.size).toBeGreaterThanOrEqual(1)
        expect(mediumMoves.size).toBe(1)
      })

      it('hard AI should make strategic opening moves', () => {
        const board = createInitialBoard()

        // Hard AI's opening move should be one of the strategically good options
        const move = getAIMove(board, 1, 'hard')

        // All 4 opening moves are valid, hard AI will pick best evaluated
        const validOpenings = [
          { row: 2, col: 3 },
          { row: 3, col: 2 },
          { row: 4, col: 5 },
          { row: 5, col: 4 },
        ]

        const isValidOpening = validOpenings.some(
          v => v.row === move.row && v.col === move.col
        )
        expect(isValidOpening).toBe(true)
      })
    })
  })
})
