/**
 * Othello Game Hook
 * Main game state management with disc-flipping animations
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState, Difficulty, GameMode } from '@/types/othello.types'
import { ANIMATION_TIMING } from '@/types/othello.types'
import { createInitialGameState } from '@/lib/gameStateHelper'
import { makeMove, isValidMove } from '@/lib/othelloRules'
import { getAIMove } from '@/lib/aiStrategies'

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
                  return makeMove(prevState, aiMove.row, aiMove.col)
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
              return makeMove(prevState, row, col)
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

  return {
    gameState,
    isAnimating,
    lastFlippedDiscs,
    handlePlayerMove,
    startNewGame,
    changeDifficulty,
  }
}
