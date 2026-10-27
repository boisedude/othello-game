import { parseCharacterParam } from '@/lib/characterParam'
import { getAIMove } from '@/lib/aiStrategies'
import { createInitialBoard } from '@/lib/othelloRules'

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

describe('hard AI time cap', () => {
  it('replies quickly from the opening', () => {
    const start = Date.now()
    const move = getAIMove(createInitialBoard(), 1, 'hard')
    expect(move).toHaveProperty('row')
    expect(Date.now() - start).toBeLessThan(3000)
  })
})
