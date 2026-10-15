/**
 * Posts a finished game to the arcade-wide Bentley record.
 * Only decisive human-vs-Bentley games count (no draws, no PvP).
 */

import { recordPlayerBeatBentley, recordBentleyBeatPlayer } from '@shared/arcadeRecord'
import type { Difficulty, GameMode, GameStatus } from '@/types/othello.types'

export function recordArcadeResult(
  mode: GameMode,
  difficulty: Difficulty,
  status: GameStatus,
  winner: 1 | 2 | null
): void {
  if (mode !== 'pvc' || difficulty !== 'hard' || status !== 'won') return
  if (winner === 1) void recordPlayerBeatBentley()
  else if (winner === 2) void recordBentleyBeatPlayer()
}
