/**
 * Othello Game Page
 * Main game interface for Othello
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ANIMATION_TIMING, ARCADE_URL } from '@/types/othello.types'
import { Board } from '@/components/Board'
import { GameControls } from '@/components/GameControls'
import { VictoryDialog } from '@/components/VictoryDialog'
import { LeaderboardDialog } from '@/components/LeaderboardDialog'
import { Tutorial } from '@/components/Tutorial'
import { OpponentChip } from '@/components/OpponentChip'
import { ConfirmSwitchDialog } from '@/components/ConfirmSwitchDialog'
import type { Difficulty } from '@/types/othello.types'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, VolumeIcon, VolumeOffIcon, HelpIcon } from '@shared/icons'
import { useOthelloGame } from '@/hooks/useOthelloGame'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGameAudio } from '@/hooks/useGameAudio'
import { useCharacterSelection } from '@/hooks/useCharacterSelection'
import { useBentleyStats } from '@/hooks/useBentleyStats'
import { getInitialDifficulty, hasCharacterParam } from '@/lib/characterParam'
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
  } = useOthelloGame(getInitialDifficulty())

  const { character, changeCharacter } = useCharacterSelection(gameState.difficulty)
  const { recordBentleyWin: recordLocalBentleyWin, recordBentleyLoss: recordLocalBentleyLoss, recordBentleyDraw } = useBentleyStats()
  const { stats, recordWin, recordLoss, recordDraw, updatePlayerName, resetStats } = useLeaderboard()
  const { isMuted, toggleMute, playDiscPlace, playDiscFlip, playVictory, playDefeat, playDraw } =
    useGameAudio()

  const [showVictoryDialog, setShowVictoryDialog] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  // Show tutorial automatically for first-time users (lazy initialization)
  const [showTutorial, setShowTutorial] = useState(() => {
    // Never auto-open when the arcade launched us with a character
    if (hasCharacterParam()) return false
    try {
      return localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED) !== 'true'
    } catch {
      return true
    }
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
          }
        } else if (gameState.winner === 2) {
          // AI wins
          playDefeat()
          recordLoss(totalFlips)

          // Track Bentley stats if playing on hard
          if (gameState.difficulty === 'hard') {
            recordLocalBentleyLoss(margin, totalFlips) // Local stats
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
    gameState.mode,
    setShowVictoryDialog,
  ])

  // Changing opponent always starts a fresh game; with a game in progress the player
  // confirms first, so the opponent can never change under a running game.
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty | null>(null)
  const applyDifficulty = (difficulty: Difficulty) => {
    setShowVictoryDialog(false)
    changeDifficulty(difficulty)
    changeCharacter(difficulty)
  }
  const handleDifficultyChange = (difficulty: Difficulty) => {
    if (difficulty === gameState.difficulty) return
    if (gameState.status === 'playing' && gameState.moveHistory.length > 0) {
      setPendingDifficulty(difficulty)
    } else {
      applyDifficulty(difficulty)
    }
  }
  const pendingName = pendingDifficulty
    ? { easy: 'Bella', medium: 'Coop', hard: 'Bentley' }[pendingDifficulty]
    : ''

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

  const opponent = character.name
  // A pass: the same player moved twice in a row, so the other side had no legal move
  const lastMoveOwner = gameState.lastMove?.player
  const passed =
    gameState.status === 'playing' &&
    lastMoveOwner !== undefined &&
    lastMoveOwner === gameState.currentPlayer
  const turnText =
    gameState.status === 'won'
      ? gameState.winner === 1
        ? 'You won'
        : `${opponent} won`
      : gameState.status === 'draw'
        ? 'Draw'
        : gameState.currentPlayer === 1
          ? passed
            ? `${opponent} passes, go again`
            : 'Your turn'
          : passed
            ? 'You pass'
            : `${opponent} is thinking`
  const turnActive =
    gameState.status !== 'playing' ? 'over' : gameState.currentPlayer === 1 ? 'you' : 'opponent'

  return (
    <div className="arcade-page">
      <a
        href="#game-board"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
      >
        Skip to game board
      </a>

      <header className="arcade-topbar">
        <div className="flex flex-1 items-center">
          <a
            href={ARCADE_URL}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon size={18} />
            Arcade
          </a>
        </div>
        <h1 className="arcade-display sr-only text-xl sm:not-sr-only">Othello</h1>
        <div className="flex flex-1 items-center justify-end gap-1">
          <OpponentChip
            character={character}
            difficulty={gameState.difficulty}
            onDifficultyChange={handleDifficultyChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={handleShowTutorial}
            aria-label="How to play"
          >
            <HelpIcon />
          </Button>
        </div>
      </header>

      <main className="arcade-stage">
        <div className="arcade-score">
          <div>
            <strong className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded-full bg-black ring-1 ring-white/30"
                aria-hidden="true"
              />
              {gameState.blackCount}
            </strong>
            You
          </div>
          <div className="arcade-turn" data-active={turnActive}>
            {turnText}
          </div>
          <div>
            <strong className="flex items-center justify-end gap-2">
              {gameState.whiteCount}
              <span
                className="inline-block h-4 w-4 rounded-full bg-white ring-1 ring-white/30"
                aria-hidden="true"
              />
            </strong>
            {opponent}
          </div>
        </div>

        <div id="game-board" className="flex w-full justify-center">
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
        </div>

        <GameControls
          onNewGame={handleNewGame}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onShowHelp={handleShowTutorial}
          onUndo={undoMove}
          canUndo={canUndo}
          disabled={isAnimating}
        />
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

      <ConfirmSwitchDialog
        open={pendingDifficulty !== null}
        title={`Play ${pendingName} instead?`}
        onConfirm={() => {
          if (pendingDifficulty) applyDifficulty(pendingDifficulty)
          setPendingDifficulty(null)
        }}
        onCancel={() => setPendingDifficulty(null)}
      />

      {/* Victory Dialog */}
      <VictoryDialog
        open={showVictoryDialog}
        winner={gameState.winner}
        blackCount={gameState.blackCount}
        whiteCount={gameState.whiteCount}
        onPlayAgain={handlePlayAgain}
        onClose={() => setShowVictoryDialog(false)}
        character={character}
        stats={stats}
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
        opponentName={opponent}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </div>
  )
}
