/**
 * Othello Game Hook
 * Main game state management with disc-flipping animations
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState, Difficulty, GameMode, UndoState } from '@/types/othello.types'
import { ANIMATION_TIMING } from '@/types/othello.types'
import { createInitialGameState } from '@/lib/gameStateHelper'
import { makeMove, isValidMove } from '@/lib/othelloRules'
import { getAIMove } from '@/lib/aiStrategies'

/**
 * Creates an undo state snapshot from the current game state
 */
function createUndoState(state: GameState): UndoState {
  return {
    board: state.board.map(row => [...row]), // Deep copy board
    currentPlayer: state.currentPlayer,
    status: state.status,
    blackCount: state.blackCount,
    whiteCount: state.whiteCount,
    validMoves: state.validMoves.map(m => ({ ...m, flippedPositions: [...m.flippedPositions] })),
    lastMove: state.lastMove ? { ...state.lastMove } : undefined,
    moveHistory: state.moveHistory.map(m => ({ ...m })),
  }
}

export function useOthelloGame(initialDifficulty: Difficulty = 'medium') {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState('pvc', initialDifficulty)
  )
  const [isAnimating, setIsAnimating] = useState(false)
  const [lastFlippedDiscs, setLastFlippedDiscs] = useState<Array<{ row: number; col: number }>>([])

  const aiMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const aiMoveScheduledRef = useRef(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Handle AI move when it's AI's turn (Player 2 = White = Coop)
  useEffect(() => {
    if (
      gameState.currentPlayer === 2 &&
      gameState.status === 'playing' &&
      gameState.mode === 'pvc' &&
      !isAnimating &&
      !aiMoveScheduledRef.current
    ) {
      aiMoveScheduledRef.current = true

      aiMoveTimeoutRef.current = setTimeout(() => {
        try {
          const aiMove = getAIMove(gameState.board, 2, gameState.difficulty)

          if (isValidMove(gameState.board, aiMove.row, aiMove.col, 2)) {
            // Find the flipped discs for animation
            const validMove = gameState.validMoves.find(
              m => m.row === aiMove.row && m.col === aiMove.col
            )

            setIsAnimating(true)
            setLastFlippedDiscs(validMove?.flippedPositions || [])

            animationTimeoutRef.current = setTimeout(() => {
              setGameState(prevState => {
                try {
                  // Save undo state before AI move
                  const undoState = createUndoState(prevState)
                  const newState = makeMove(prevState, aiMove.row, aiMove.col)
                  return {
                    ...newState,
                    undoHistory: [...prevState.undoHistory, undoState],
                  }
                } catch {
                  // AI move execution failed - return unchanged state
                  return prevState
                }
              })
              setIsAnimating(false)
              setLastFlippedDiscs([])
              animationTimeoutRef.current = null
            }, ANIMATION_TIMING.FLIP_ANIMATION_DELAY)
          }
        } catch {
          // AI move failed - reset animation state
          setIsAnimating(false)
        } finally {
          aiMoveScheduledRef.current = false
        }
      }, ANIMATION_TIMING.AI_MOVE_DELAY)
    }

    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
        aiMoveTimeoutRef.current = null
      }
    }
  }, [
    gameState.currentPlayer,
    gameState.status,
    gameState.mode,
    gameState.board,
    gameState.difficulty,
    gameState.validMoves,
    isAnimating,
  ])

  /**
   * Handles player's move
   */
  const handlePlayerMove = useCallback(
    (row: number, col: number) => {
      if (isAnimating || gameState.status !== 'playing' || gameState.currentPlayer !== 1) {
        return
      }

      if (!isValidMove(gameState.board, row, col, 1)) {
        return
      }

      try {
        // Find the flipped discs for animation
        const validMove = gameState.validMoves.find(m => m.row === row && m.col === col)

        setIsAnimating(true)
        setLastFlippedDiscs(validMove?.flippedPositions || [])

        animationTimeoutRef.current = setTimeout(() => {
          setGameState(prevState => {
            try {
              // Save undo state before player move
              const undoState = createUndoState(prevState)
              const newState = makeMove(prevState, row, col)
              return {
                ...newState,
                undoHistory: [...prevState.undoHistory, undoState],
              }
            } catch {
              // Move execution failed - return unchanged state
              return prevState
            }
          })
          setIsAnimating(false)
          setLastFlippedDiscs([])
          animationTimeoutRef.current = null
        }, ANIMATION_TIMING.FLIP_ANIMATION_DELAY)
      } catch {
        // Error handling move - reset animation state
        setIsAnimating(false)
        setLastFlippedDiscs([])
      }
    },
    [gameState.board, gameState.status, gameState.currentPlayer, gameState.validMoves, isAnimating]
  )

  /**
   * Starts a new game
   */
  const startNewGame = useCallback(
    (mode: GameMode = 'pvc', difficulty?: Difficulty) => {
      // Clear any pending AI moves and animations
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
        aiMoveTimeoutRef.current = null
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
        animationTimeoutRef.current = null
      }
      aiMoveScheduledRef.current = false
      setIsAnimating(false)
      setLastFlippedDiscs([])

      const newDifficulty = difficulty ?? gameState.difficulty
      setGameState(createInitialGameState(mode, newDifficulty))
    },
    [gameState.difficulty]
  )

  /**
   * Changes AI difficulty (starts new game)
   */
  const changeDifficulty = useCallback(
    (difficulty: Difficulty) => {
      startNewGame('pvc', difficulty)
    },
    [startNewGame]
  )

  /**
   * Undo the last move(s)
   * In VS AI mode: Undo both player's move AND AI's response (if any)
   * In PvP mode: Undo single move
   */
  const undoMove = useCallback(() => {
    // Don't allow undo during animation or if not playing
    if (isAnimating || gameState.status !== 'playing') {
      return
    }

    // Clear any pending AI moves
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current)
      aiMoveTimeoutRef.current = null
    }
    aiMoveScheduledRef.current = false

    setGameState(prevState => {
      if (prevState.undoHistory.length === 0) {
        return prevState
      }

      // In VS AI mode, we need to undo to the last state where it was player 1's turn
      // This means undoing both the AI's move and the player's move that triggered it
      if (prevState.mode === 'pvc') {
        // Find the most recent state where it was player 1's turn
        let undoCount = 0
        for (let i = prevState.undoHistory.length - 1; i >= 0; i--) {
          undoCount++
          if (prevState.undoHistory[i].currentPlayer === 1) {
            break
          }
        }

        // If we're currently on player 1's turn after AI passed, just undo one move
        if (prevState.currentPlayer === 1 && undoCount > 0) {
          const targetIndex = prevState.undoHistory.length - undoCount
          if (targetIndex < 0) {
            return prevState
          }
          const undoState = prevState.undoHistory[targetIndex]
          return {
            ...prevState,
            board: undoState.board.map(row => [...row]),
            currentPlayer: undoState.currentPlayer,
            status: undoState.status,
            blackCount: undoState.blackCount,
            whiteCount: undoState.whiteCount,
            validMoves: undoState.validMoves,
            lastMove: undoState.lastMove,
            moveHistory: undoState.moveHistory,
            winner: null,
            undoHistory: prevState.undoHistory.slice(0, targetIndex),
          }
        }

        // If it's AI's turn (player 2), undo just the player's last move
        if (prevState.currentPlayer === 2) {
          const undoState = prevState.undoHistory[prevState.undoHistory.length - 1]
          return {
            ...prevState,
            board: undoState.board.map(row => [...row]),
            currentPlayer: undoState.currentPlayer,
            status: undoState.status,
            blackCount: undoState.blackCount,
            whiteCount: undoState.whiteCount,
            validMoves: undoState.validMoves,
            lastMove: undoState.lastMove,
            moveHistory: undoState.moveHistory,
            winner: null,
            undoHistory: prevState.undoHistory.slice(0, -1),
          }
        }
      }

      // In PvP mode or fallback: just undo the last move
      const undoState = prevState.undoHistory[prevState.undoHistory.length - 1]
      return {
        ...prevState,
        board: undoState.board.map(row => [...row]),
        currentPlayer: undoState.currentPlayer,
        status: undoState.status,
        blackCount: undoState.blackCount,
        whiteCount: undoState.whiteCount,
        validMoves: undoState.validMoves,
        lastMove: undoState.lastMove,
        moveHistory: undoState.moveHistory,
        winner: null,
        undoHistory: prevState.undoHistory.slice(0, -1),
      }
    })
  }, [isAnimating, gameState.status])

  /**
   * Check if undo is available
   * In VS AI mode: Can undo when it's player's turn and there's history
   * In PvP mode: Can undo when there's history
   */
  const canUndo =
    !isAnimating &&
    gameState.status === 'playing' &&
    gameState.undoHistory.length > 0 &&
    (gameState.mode === 'pvp' || gameState.currentPlayer === 1)

  return {
    gameState,
    isAnimating,
    lastFlippedDiscs,
    handlePlayerMove,
    startNewGame,
    changeDifficulty,
    undoMove,
    canUndo,
  }
}
