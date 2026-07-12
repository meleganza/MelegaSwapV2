import { describe, expect, it, vi, afterEach } from 'vitest'
import { IndexerDeadline, SAFE_EXECUTION_BUDGET_MS } from '../indexerDeadline'

describe('IndexerDeadline', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('tracks elapsed and remaining budget', () => {
    vi.useFakeTimers()
    const start = Date.now()
    const deadline = new IndexerDeadline(start, 60_000)
    vi.advanceTimersByTime(10_000)
    expect(deadline.elapsedMs()).toBe(10_000)
    expect(deadline.remainingMs()).toBe(50_000)
    expect(deadline.shouldStop(5_000)).toBe(false)
  })

  it('signals stop before hard timeout margin', () => {
    vi.useFakeTimers()
    const deadline = new IndexerDeadline(Date.now(), 20_000)
    vi.advanceTimersByTime(13_500)
    expect(deadline.shouldStop(8_000)).toBe(true)
  })

  it('records stage timings', () => {
    vi.useFakeTimers()
    const deadline = new IndexerDeadline(Date.now(), SAFE_EXECUTION_BUDGET_MS)
    vi.advanceTimersByTime(100)
    deadline.markStage('forward-sync')
    const snap = deadline.snapshot()
    expect(snap.stages[0]?.stage).toBe('forward-sync')
    expect(snap.stages[0]?.elapsedMs).toBe(100)
  })
})
