/**
 * Maps the ?character= URL parameter (set by the mcooper.com arcade) to a
 * difficulty. The difficulty is the single source of truth: the displayed
 * opponent and the AI that plays are both derived from it.
 */

import type { Difficulty } from '@/types/othello.types'

const CHARACTER_TO_DIFFICULTY: Record<string, Difficulty> = {
  bella: 'easy',
  coop: 'medium',
  bentley: 'hard',
}

/** Returns the difficulty named by the parameter, or null if absent/unknown. */
export function parseCharacterParam(search: string): Difficulty | null {
  const id = new URLSearchParams(search).get('character')?.trim().toLowerCase()
  if (!id) return null
  return CHARACTER_TO_DIFFICULTY[id] ?? null
}

/** Reads the parameter from the page URL (not the hash router). Defaults to medium (Coop). */
export function getInitialDifficulty(): Difficulty {
  try {
    return parseCharacterParam(window.location.search) ?? 'medium'
  } catch {
    return 'medium'
  }
}

export function hasCharacterParam(): boolean {
  try {
    return parseCharacterParam(window.location.search) !== null
  } catch {
    return false
  }
}
