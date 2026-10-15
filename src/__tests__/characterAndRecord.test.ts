import { parseCharacterParam } from '@/lib/characterParam'
import { recordArcadeResult } from '@/lib/arcadeResult'
import { getAIMove } from '@/lib/aiStrategies'
import { createInitialBoard } from '@/lib/othelloRules'
import { recordPlayerBeatBentley, recordBentleyBeatPlayer } from '@shared/arcadeRecord'

jest.mock('@shared/arcadeRecord', () => ({
  recordPlayerBeatBentley: jest.fn(() => Promise.resolve()),
  recordBentleyBeatPlayer: jest.fn(() => Promise.resolve()),
}))

describe('parseCharacterParam', () => {
  it('maps characters to difficulty', () => {
    expect(parseCharacterParam('?character=bentley')).toBe('hard')
    expect(parseCharacterParam('?character=bella')).toBe('easy')
    expect(parseCharacterParam('?character=coop')).toBe('medium')
    expect(parseCharacterParam('?x=1&character=BENTLEY')).toBe('hard')
  })
  it('returns null when absent or unknown', () => {
    expect(parseCharacterParam('')).toBeNull()
    expect(parseCharacterParam('?character=nobody')).toBeNull()
  })
})

describe('recordArcadeResult', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Bentley win posts recordBentleyBeatPlayer once', () => {
    recordArcadeResult('pvc', 'hard', 'won', 2)
    expect(recordBentleyBeatPlayer).toHaveBeenCalledTimes(1)
    expect(recordPlayerBeatBentley).not.toHaveBeenCalled()
  })
  it('player win posts recordPlayerBeatBentley once', () => {
    recordArcadeResult('pvc', 'hard', 'won', 1)
    expect(recordPlayerBeatBentley).toHaveBeenCalledTimes(1)
    expect(recordBentleyBeatPlayer).not.toHaveBeenCalled()
  })
  it('posts nothing for draws, other opponents, PvP, or unfinished games', () => {
    recordArcadeResult('pvc', 'hard', 'draw', null)
    recordArcadeResult('pvc', 'easy', 'won', 1)
    recordArcadeResult('pvc', 'medium', 'won', 2)
    recordArcadeResult('pvp', 'hard', 'won', 1)
    recordArcadeResult('pvc', 'hard', 'playing', null)
    expect(recordPlayerBeatBentley).not.toHaveBeenCalled()
    expect(recordBentleyBeatPlayer).not.toHaveBeenCalled()
  })
})

describe('hard AI time cap', () => {
  it('replies quickly from the opening', () => {
    const start = Date.now()
    const move = getAIMove(createInitialBoard(), 1, 'hard')
    expect(move).toHaveProperty('row')
    expect(Date.now() - start).toBeLessThan(3000)
  })
})
