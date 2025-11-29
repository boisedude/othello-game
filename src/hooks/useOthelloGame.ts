/**
 * Othello Game Hook
 * Main game state management with disc-flipping animations
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState, Difficulty, GameMode, ValidMove } from '@/types/othello.types'
import { createInitialGameState } from '@/lib/gameStateHelper'
import { makeMove, isValidMove } from '@/lib/othelloRules'
import { getAIMove } from '@/lib/aiStrategies'

const AI_MOVE_DELAY = 800 // ms - Longer delay to appreciate disc flips
const FLIP_ANIMATION_DELAY = 100 // ms - Delay before state update to show flip animation

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
                } catch (error) {
                  console.error('AI move execution failed:', error)
                  return prevState
                }
              })
              setIsAnimating(false)
              setLastFlippedDiscs([])
              animationTimeoutRef.current = null
            }, FLIP_ANIMATION_DELAY)
          }
        } catch (error) {
          console.error('AI move failed:', error)
          setIsAnimating(false)
        } finally {
          aiMoveScheduledRef.current = false
        }
      }, AI_MOVE_DELAY)
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
        console.warn('Invalid move attempted:', { row, col })
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
            } catch (error) {
              console.error('Move execution failed:', error)
              return prevState
            }
          })
          setIsAnimating(false)
          setLastFlippedDiscs([])
          animationTimeoutRef.current = null
        }, FLIP_ANIMATION_DELAY)
      } catch (error) {
        console.error('Error handling move:', error)
        setIsAnimating(false)
        setLastFlippedDiscs([])
      }
    },
    [gameState.board, gameState.status, gameState.currentPlayer, gameState.validMoves, isAnimating]
  )

  /**
   * Checks if a move is valid (for hover preview)
   */
  const checkValidMove = useCallback(
    (row: number, col: number): ValidMove | null => {
      return gameState.validMoves.find(m => m.row === row && m.col === col) || null
    },
    [gameState.validMoves]
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
    checkValidMove,
    startNewGame,
    changeDifficulty,
  }
}
