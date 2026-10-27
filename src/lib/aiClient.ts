/**
 * AI client: asks a web worker for the opponent's move so the search never
 * blocks the main thread. Falls back to a synchronous call when workers are
 * unavailable or fail.
 */

import { getAIMove } from '@/lib/aiStrategies'

type AIArgs = Parameters<typeof getAIMove>
type AIMove = ReturnType<typeof getAIMove>

interface Pending {
  args: AIArgs
  resolve: (move: AIMove) => void
  reject: (error: unknown) => void
}

let worker: Worker | null = null
let workerBroken = false
let nextId = 1
const pending = new Map<number, Pending>()

function runSync({ args, resolve, reject }: Pending) {
  try {
    resolve(getAIMove(...args))
  } catch (error) {
    reject(error)
  }
}

/** Worker died: answer everything in flight synchronously and stop using it. */
function abandonWorker() {
  workerBroken = true
  worker?.terminate()
  worker = null
  const waiting = [...pending.values()]
  pending.clear()
  waiting.forEach(runSync)
}

function getWorker(): Worker | null {
  if (workerBroken || typeof Worker === 'undefined') return null
  if (worker) return worker
  try {
    const created = new Worker(new URL('../workers/ai.worker.ts', import.meta.url), {
      type: 'module',
    })
    created.onmessage = (event: MessageEvent<{ id: number; move?: AIMove; error?: string }>) => {
      const entry = pending.get(event.data.id)
      if (!entry) return
      pending.delete(event.data.id)
      if (event.data.move) entry.resolve(event.data.move)
      else entry.reject(new Error(event.data.error ?? 'AI worker failed'))
    }
    created.onerror = abandonWorker
    created.onmessageerror = abandonWorker
    worker = created
    return worker
  } catch {
    workerBroken = true
    return null
  }
}

export function requestAIMove(...args: AIArgs): Promise<AIMove> {
  return new Promise<AIMove>((resolve, reject) => {
    const entry: Pending = { args, resolve, reject }
    const w = getWorker()
    if (!w) return runSync(entry)
    const id = nextId++
    pending.set(id, entry)
    try {
      w.postMessage({ id, args })
    } catch {
      pending.delete(id)
      runSync(entry)
    }
  })
}
