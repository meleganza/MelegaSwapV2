/**
 * Bounded parallel quote orchestration.
 * One slow venue must never block the whole cycle indefinitely.
 */

export interface LatencyBudget {
  /** Time-to-first usable quote target (ms). */
  initialResponseMs: number
  /** Per-adapter quote timeout (ms). */
  quoteTimeoutMs: number
  /** Quote older than this is stale (ms). */
  staleQuoteMs: number
  /** Route comparison budget (ms). */
  comparisonMs: number
  /** Extra wait after first quote before returning (ms). */
  fallbackWaitMs: number
  /** Hard cap for the whole collection cycle (ms). */
  overallBudgetMs: number
}

/**
 * Recommended defaults — configurable. Not production-tuned from live telemetry.
 * Chosen to keep SmartSwap feeling interactive while allowing slow adapters to fail independently.
 */
export const DEFAULT_LATENCY_BUDGET: LatencyBudget = {
  initialResponseMs: 400,
  quoteTimeoutMs: 1_200,
  staleQuoteMs: 15_000,
  comparisonMs: 50,
  fallbackWaitMs: 250,
  overallBudgetMs: 1_800,
}

export type BoundedTaskResult<T> =
  | { id: string; status: 'ok'; value: T; durationMs: number }
  | { id: string; status: 'timeout'; durationMs: number }
  | { id: string; status: 'error'; error: string; durationMs: number }
  | { id: string; status: 'cancelled'; durationMs: number }

export async function collectBoundedParallel<T>(
  tasks: Array<{ id: string; run: (signal: AbortSignal) => Promise<T> }>,
  budget: LatencyBudget = DEFAULT_LATENCY_BUDGET,
  now: () => number = Date.now,
): Promise<BoundedTaskResult<T>[]> {
  const cycle = new AbortController()
  const overallTimer = setTimeout(() => cycle.abort(), budget.overallBudgetMs)
  const started = now()

  try {
    return await Promise.all(
      tasks.map(async (task) => {
        const local = new AbortController()
        const onAbort = () => local.abort()
        cycle.signal.addEventListener('abort', onAbort)
        const timeout = setTimeout(() => local.abort(), budget.quoteTimeoutMs)
        const t0 = now()
        try {
          const value = await Promise.race([
            task.run(local.signal),
            new Promise<T>((_, reject) => {
              local.signal.addEventListener('abort', () => reject(new Error('ADAPTER_TIMEOUT')))
            }),
          ])
          return { id: task.id, status: 'ok' as const, value, durationMs: now() - t0 }
        } catch (cause) {
          const durationMs = now() - t0
          const message = cause instanceof Error ? cause.message : String(cause)
          if (cycle.signal.aborted && message === 'ADAPTER_TIMEOUT') {
            return { id: task.id, status: 'cancelled' as const, durationMs }
          }
          if (message === 'ADAPTER_TIMEOUT' || local.signal.aborted) {
            return { id: task.id, status: 'timeout' as const, durationMs }
          }
          return { id: task.id, status: 'error' as const, error: message, durationMs }
        } finally {
          clearTimeout(timeout)
          cycle.signal.removeEventListener('abort', onAbort)
        }
      }),
    )
  } finally {
    clearTimeout(overallTimer)
    void started
  }
}
