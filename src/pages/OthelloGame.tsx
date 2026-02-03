/**
 * Othello Game Page
 * Main game interface for Othello - Play Coop!
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ANIMATION_TIMING, ARCADE_URL } from '@/types/othello.types'
import { Board } from '@/components/Board'
import { GameControls } from '@/components/GameControls'
import { VictoryDialog } from '@/components/VictoryDialog'
import { LeaderboardDialog } from '@/components/LeaderboardDialog'
import { Tutorial } from '@/components/Tutorial'
import { useOthelloGame } from '@/hooks/useOthelloGame'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGameAudio } from '@/hooks/useGameAudio'
import { useCharacterSelection } from '@/hooks/useCharacterSelection'
import { useBentleyStats } from '@/hooks/useBentleyStats'
import { useMainSiteBentleyStats } from '@/hooks/useMainSiteBentleyStats'
import { STORAGE_KEYS } from '@/lib/storageKeys'

export function OthelloGame() {
  const {
    gameState,
    isAnimating,
    lastFlippedDiscs,
    handlePlayerMove,
    startNewGame,
    changeDifficulty,
    undoMove,
    canUndo,
  } = useOthelloGame()

  const { character, changeCharacter } = useCharacterSelection(gameState.difficulty)
  const { recordBentleyWin: recordLocalBentleyWin, recordBentleyLoss: recordLocalBentleyLoss, recordBentleyDraw } = useBentleyStats()
  const { recordBentleyWin: recordMainSiteBentleyWin, recordBentleyLoss: recordMainSiteBentleyLoss } = useMainSiteBentleyStats()
  const { stats, recordWin, recordLoss, recordDraw, updatePlayerName, resetStats } = useLeaderboard()
  const { isMuted, toggleMute, playDiscPlace, playDiscFlip, playVictory, playDefeat, playDraw } =
    useGameAudio()

  const [showVictoryDialog, setShowVictoryDialog] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  // Show tutorial automatically for first-time users (lazy initialization)
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED) !== 'true'
  })

  // Play sound when moves are made
  const prevMoveCountRef = useRef(gameState.moveHistory.length)
  useEffect(() => {
    if (gameState.moveHistory.length > prevMoveCountRef.current) {
      playDiscPlace()

      // Play flip sound after a brief delay
      if (lastFlippedDiscs.length > 0) {
        setTimeout(() => playDiscFlip(), ANIMATION_TIMING.SOUND_FLIP_DELAY)
      }
    }
    prevMoveCountRef.current = gameState.moveHistory.length
  }, [gameState.moveHistory.length, lastFlippedDiscs.length, playDiscPlace, playDiscFlip])

  // Track previous status to detect game end
  const prevStatusRef = useRef(gameState.status)

  useEffect(() => {
    // Detect game ending
    if (prevStatusRef.current === 'playing' && gameState.status !== 'playing') {
      // Count total discs flipped (from move history)
      const totalFlips = gameState.moveHistory.length

      // Calculate margin for wins
      const margin = Math.abs(gameState.blackCount - gameState.whiteCount)

      // Check if perfect game (opponent has 0 discs)
      const isPerfect =
        (gameState.winner === 1 && gameState.whiteCount === 0) ||
        (gameState.winner === 2 && gameState.blackCount === 0)

      if (gameState.status === 'won') {
        if (gameState.winner === 1) {
          // Player wins
          playVictory()
          recordWin(margin, totalFlips, isPerfect)

          // Track Bentley stats if playing on hard
          if (gameState.difficulty === 'hard') {
            recordLocalBentleyWin(margin, totalFlips, isPerfect) // Local stats
            recordMainSiteBentleyLoss() // Main site API (player won, Bentley lost)
          }
        } else if (gameState.winner === 2) {
          // AI wins
          playDefeat()
          recordLoss(totalFlips)

          // Track Bentley stats if playing on hard
          if (gameState.difficulty === 'hard') {
            recordLocalBentleyLoss(margin, totalFlips) // Local stats
            recordMainSiteBentleyWin() // Main site API (Bentley won)
          }
        }
      } else if (gameState.status === 'draw') {
        playDraw()
        recordDraw(totalFlips)

        // Track Bentley stats if playing on hard
        if (gameState.difficulty === 'hard') {
          recordBentleyDraw(totalFlips)
        }
      }

      // Show victory dialog - This setState is intentional and safe:
      // We're responding to external state change (game ending) to show UI element
      // This only runs once per game end due to prevStatusRef check
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowVictoryDialog(true)
    }

    prevStatusRef.current = gameState.status
  }, [
    gameState.status,
    gameState.difficulty,
    gameState.winner,
    gameState.moveHistory.length,
    gameState.blackCount,
    gameState.whiteCount,
    playVictory,
    playDefeat,
    playDraw,
    recordWin,
    recordLoss,
    recordDraw,
    recordLocalBentleyWin,
    recordLocalBentleyLoss,
    recordBentleyDraw,
    recordMainSiteBentleyWin,
    recordMainSiteBentleyLoss,
    setShowVictoryDialog,
  ])

  const handleNewGame = useCallback(() => {
    setShowVictoryDialog(false)
    startNewGame()
  }, [startNewGame])

  // handlePlayAgain is the same as handleNewGame - reuse it
  const handlePlayAgain = handleNewGame

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.currentPlayer === 1 && gameState.status === 'playing' && !isAnimating) {
      handlePlayerMove(row, col)
    }
  }, [gameState.currentPlayer, gameState.status, isAnimating, handlePlayerMove])

  const handleShowTutorial = useCallback(() => {
    setShowTutorial(true)
  }, [])

  // Tutorial completion is handled by the Tutorial component (stores in localStorage)
  const handleTutorialComplete = useCallback(() => {
    // No-op - the Tutorial component handles localStorage
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      switch (e.key.toLowerCase()) {
        case 'n':
          handleNewGame()
          break
        case 'l':
          setShowLeaderboard(true)
          break
        case 'm':
          toggleMute()
          break
        case 'h':
          setShowTutorial(true)
          break
        case 'u':
          if (canUndo) {
            undoMove()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleNewGame, toggleMute, canUndo, undoMove])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Return to Arcade Button - Fixed position */}
      <div className="fixed left-4 top-4 z-10">
        <a
          href={ARCADE_URL}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Return to Arcade
        </a>
      </div>

      {/* Header */}
      <header className="border-b border-green-800/30 bg-gray-800/50 py-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 text-2xl">
            ⚫⚪
          </div>
          <div>
            <h1 className="text-3xl font-bold text-green-400">Othello</h1>
            <p className="text-sm text-green-300">Challenge {character.name} • Can you beat {character.id === 'bentley' ? 'him' : character.id === 'bella' ? 'her' : 'him'}?</p>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Board */}
          <Board
            board={gameState.board}
            validMoves={gameState.validMoves}
            lastMove={gameState.lastMove}
            lastFlippedDiscs={lastFlippedDiscs}
            onCellClick={handleCellClick}
            disabled={isAnimating || gameState.status !== 'playing'}
            gameStatus={gameState.status}
            winner={gameState.winner}
          />

          {/* Controls */}
          <GameControls
            difficulty={gameState.difficulty}
            onDifficultyChange={(newDifficulty) => {
              changeDifficulty(newDifficulty)
              changeCharacter(newDifficulty)
            }}
            onNewGame={handleNewGame}
            onShowLeaderboard={() => setShowLeaderboard(true)}
            onShowHelp={handleShowTutorial}
            onUndo={undoMove}
            canUndo={canUndo}
            disabled={isAnimating}
            gameMode={gameState.mode}
            currentPlayer={gameState.currentPlayer}
            blackCount={gameState.blackCount}
            whiteCount={gameState.whiteCount}
            character={character}
          />

          {/* Audio Toggle */}
          <div className="text-center">
            <button
              onClick={toggleMute}
              className="rounded-lg bg-gray-700/50 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇 Muted' : '🔊 Sound On'} (M)
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-center text-xs text-gray-400">
            <p>Keyboard: N = New Game • U = Undo • L = Leaderboard • H = How to Play • M = Mute/Unmute</p>
          </div>
        </div>
      </main>

      {/* Screen Reader Live Region for Accessibility */}
      <div role="status" aria-live="polite" className="sr-only">
        {gameState.status === 'playing' &&
          gameState.currentPlayer === 1 &&
          !isAnimating &&
          'Your turn'}
        {gameState.status === 'playing' &&
          gameState.currentPlayer === 2 &&
          `${character.name} is thinking`}
        {gameState.status === 'won' &&
          gameState.winner === 1 &&
          `You won! Black ${gameState.blackCount}, White ${gameState.whiteCount}`}
        {gameState.status === 'won' &&
          gameState.winner === 2 &&
          `${character.name} won. Black ${gameState.blackCount}, White ${gameState.whiteCount}`}
        {gameState.status === 'draw' &&
          `Game ended in a draw. Black ${gameState.blackCount}, White ${gameState.whiteCount}`}
      </div>

      {/* Victory Dialog */}
      <VictoryDialog
        open={showVictoryDialog}
        winner={gameState.winner}
        blackCount={gameState.blackCount}
        whiteCount={gameState.whiteCount}
        onPlayAgain={handlePlayAgain}
        onClose={() => setShowVictoryDialog(false)}
        character={character}
      />

      {/* Leaderboard Dialog */}
      <LeaderboardDialog
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        stats={stats}
        onResetStats={resetStats}
        onUpdatePlayerName={updatePlayerName}
      />

      {/* Tutorial Dialog */}
      <Tutorial
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </div>
  )
}
