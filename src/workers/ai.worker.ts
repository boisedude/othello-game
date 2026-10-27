/**
 * AI worker: runs the opponent's search off the main thread.
 * Receives { id, args: [board, player, difficulty] } and answers { id, move }.
 */

import { getAIMove } from '@/lib/aiStrategies'

type AIArgs = Parameters<typeof getAIMove>

interface RequestMessage {
  id: number
  args: AIArgs
}

self.onmessage = (event: MessageEvent<RequestMessage>) => {
  const { id, args } = event.data
  try {
    const move = getAIMove(...args)
    self.postMessage({ id, move })
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) })
  }
}
