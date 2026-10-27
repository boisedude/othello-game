import { StrictMode, createElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { useOthelloGame } from '@/hooks/useOthelloGame'
import { createEmptyBoard, makeMove, getValidMoves } from '@/lib/othelloRules'
import { createInitialGameState } from '@/lib/gameStateHelper'
import type { Board } from '@/types/othello.types'

// aiClient uses import.meta (worker URL), which Jest does not compile. The mock answers
// at once, or holds the answer until the test releases it.
const mockHeld: Array<() => void> = []
const mockHold = { value: false }
jest.mock('@/lib/aiClient', () => ({
  requestAIMove: (...args: unknown[]) =>
    new Promise(resolve => {
      const { getAIMove } = jest.requireActual('@/lib/aiStrategies')
      const move = getAIMove(...(args as Parameters<typeof getAIMove>))
      if (mockHold.value) mockHeld.push(() => resolve(move))
      else resolve(move)
    }),
}))

function stateWith(board: Board, currentPlayer: 1 | 2) {
  const base = createInitialGameState('pvc', 'hard')
  return { ...base, board, currentPlayer, validMoves: getValidMoves(board, currentPlayer) }
}

// Minimal renderHook (the repo has no testing-library/react)
function renderHook<T>(hook: () => T, opts: { wrapper?: React.ComponentType<{ children: React.ReactNode }> } = {}) {
  const result = { current: undefined as unknown as T }
  function Probe() {
    result.current = hook()
    return null
  }
  const container = document.createElement('div')
  const root = createRoot(container)
  const Wrapper = opts.wrapper
  act(() => {
    root.render(Wrapper ? createElement(Wrapper, null, createElement(Probe)) : createElement(Probe))
  })
  return { result, unmount: () => act(() => root.unmount()) }
}

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('passes and game end', () => {
  it('player keeps the turn when the opponent has no reply', () => {
    // Row 0: B W . . . . . .  -> black plays (0,2), white has no move afterwards
    const board = createEmptyBoard()
    board[0][0] = 1
    board[0][1] = 2
    const next = makeMove(stateWith(board, 1), 0, 2)
    expect(next.board[0].slice(0, 3)).toEqual([1, 1, 1])
    expect(next.status).toBe('won') // white has no discs and nobody can move
    expect(next.winner).toBe(1)
    expect(next.blackCount).toBe(3)
    expect(next.whiteCount).toBe(0)
  })

  it('the same player moves again after an opponent pass, game continues', () => {
    // Black: (0,0), (7,7). White: (0,1), (7,6) and (6,6)... build: after black plays (0,2) white has no moves
    // but black still has the (7,5) capture available.
    const board = createEmptyBoard()
    board[0][0] = 1
    board[0][1] = 2
    board[7][7] = 1
    board[7][6] = 2
    const next = makeMove(stateWith(board, 1), 0, 2)
    expect(next.status).toBe('playing')
    expect(next.currentPlayer).toBe(1)
    expect(next.validMoves.map(m => `${m.row},${m.col}`)).toEqual(['7,5'])
  })

  it('game ends on count when neither side can move; equal counts are a draw', () => {
    const board = createEmptyBoard()
    board[0][0] = 1
    board[0][1] = 2
    board[7][5] = 2
    board[7][6] = 2
    board[7][7] = 2
    const next = makeMove(stateWith(board, 1), 0, 2)
    expect(next.blackCount).toBe(3)
    expect(next.whiteCount).toBe(3)
    expect(next.status).toBe('draw')
    expect(next.winner).toBeNull()
  })
})

describe('AI scheduling under StrictMode', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockHold.value = false
    mockHeld.length = 0
  })
  afterEach(() => jest.useRealTimers())

  it('the opponent still replies after effects are re-run', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => createElement(StrictMode, null, children)
    const { result } = renderHook(() => useOthelloGame('medium'), { wrapper })
    const first = result.current.gameState.validMoves[0]
    act(() => result.current.handlePlayerMove(first.row, first.col))
    for (let i = 0; i < 60; i++) {
      await act(async () => {
        jest.advanceTimersByTime(100)
      })
    }
    expect(result.current.gameState.moveHistory.length).toBe(2)
    expect(result.current.gameState.currentPlayer).toBe(1)
  })

  it('drops a late answer after a new game starts', async () => {
    mockHold.value = true
    const { result } = renderHook(() => useOthelloGame('medium'))
    const first = result.current.gameState.validMoves[0]
    act(() => result.current.handlePlayerMove(first.row, first.col))
    for (let i = 0; i < 20; i++) {
      await act(async () => {
        jest.advanceTimersByTime(100)
      })
    }
    expect(mockHeld.length).toBeGreaterThan(0)
    act(() => result.current.startNewGame('pvc', 'medium'))
    await act(async () => {
      mockHeld.forEach(release => release())
      jest.advanceTimersByTime(2000)
    })
    expect(result.current.gameState.moveHistory.length).toBe(0)
    expect(result.current.gameState.currentPlayer).toBe(1)
    expect(result.current.isAnimating).toBe(false)
  })
})
