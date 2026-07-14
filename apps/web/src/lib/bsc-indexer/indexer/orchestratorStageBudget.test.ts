import { describe, expect, it, vi, afterEach } from 'vitest'
import { IndexerDeadline } from './indexerDeadline'
import {
  STAGE_BUDGET_HEAD_EDGE_MS,
  type FeaturedCoverageContext,
  resolveOrchestratorStageMode,
  resolveStageDeadline,
  shouldRunTierStages,
} from './orchestratorStageBudget'

const interiorGapCtx: FeaturedCoverageContext = {
  bootstrapFloor: 100,
  forwardHigh: 400,
  gapFillCursor: 300,
  coverageRanges: [
    { fromBlock: 100, toBlock: 150 },
    { fromBlock: 200, toBlock: 250 },
  ],
}

const headEdgeCtx: FeaturedCoverageContext = {
  bootstrapFloor: 100,
  forwardHigh: 400,
  gapFillCursor: 300,
  coverageRanges: [{ fromBlock: 100, toBlock: 300 }],
}

describe('TEST 1 — INTERIOR GAP MODE', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns interior-gap when a genuine historical interior gap exists', () => {
    expect(resolveOrchestratorStageMode(interiorGapCtx)).toBe('interior-gap')
  })

  it('does not cap featured sync with the 30-second head-edge budget', () => {
    vi.useFakeTimers()
    const global = new IndexerDeadline(Date.now(), 240_000)
    const featured = resolveStageDeadline(global, 'interior-gap')
    expect(featured.budgetMs).toBe(240_000)
    expect(featured.parent).toBeUndefined()
  })

  it('keeps tier execution gated on existing bootstrap eligibility', () => {
    expect(shouldRunTierStages('interior-gap', false)).toBe(false)
    expect(shouldRunTierStages('interior-gap', true)).toBe(true)
  })
})

describe('TEST 2 — HEAD-EDGE-ONLY MODE', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns head-edge-only when coverage is contiguous through gapFillCursor', () => {
    expect(resolveOrchestratorStageMode(headEdgeCtx)).toBe('head-edge-only')
  })

  it('assigns a 30-second child deadline to each orchestrator stage', () => {
    vi.useFakeTimers()
    const global = new IndexerDeadline(Date.now(), 240_000)
    const stages = ['featured', 'protocol', 'tier1', 'tier2'] as const
    for (const _stage of stages) {
      const child = resolveStageDeadline(global, 'head-edge-only')
      expect(child.budgetMs).toBe(STAGE_BUDGET_HEAD_EDGE_MS)
      expect(child.parent).toBe(global)
    }
  })
})

describe('TEST 3 — PARENT DEADLINE BOUND', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('never lets a child stage budget exceed parent remaining time', () => {
    vi.useFakeTimers()
    const global = new IndexerDeadline(Date.now(), 20_000)
    vi.advanceTimersByTime(12_000)
    const stage = IndexerDeadline.forStage(global, STAGE_BUDGET_HEAD_EDGE_MS)
    expect(stage.budgetMs).toBe(8_000)
  })

  it('stops the child when the parent deadline stops', () => {
    vi.useFakeTimers()
    const global = new IndexerDeadline(Date.now(), 10_000)
    const stage = IndexerDeadline.forStage(global, STAGE_BUDGET_HEAD_EDGE_MS)
    vi.advanceTimersByTime(9_500)
    expect(global.shouldStop(1_000)).toBe(true)
    expect(stage.shouldStop(1_000)).toBe(true)
  })
})

describe('TEST 4 — TIER ELIGIBILITY', () => {
  it('permits tier stages in head-edge-only mode without bootstrap completion', () => {
    expect(shouldRunTierStages('head-edge-only', false)).toBe(true)
  })

  it('does not bypass bootstrap-complete requirement in interior-gap mode', () => {
    expect(shouldRunTierStages('interior-gap', false)).toBe(false)
    expect(shouldRunTierStages('interior-gap', true)).toBe(true)
  })
})

describe('TEST 5 — NO CHECKPOINT FABRICATION', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not treat a locally expired stage deadline as bootstrap completion', () => {
    vi.useFakeTimers()
    const global = new IndexerDeadline(Date.now(), 240_000)
    const featured = resolveStageDeadline(global, 'head-edge-only')
    vi.advanceTimersByTime(29_500)
    expect(featured.shouldStop(1_000)).toBe(true)
    expect(shouldRunTierStages('interior-gap', false)).toBe(false)
  })

  it('does not mutate coverage context or mode when a stage deadline expires', () => {
    vi.useFakeTimers()
    const ctxBefore = { ...interiorGapCtx, coverageRanges: [...interiorGapCtx.coverageRanges] }
    const modeBefore = resolveOrchestratorStageMode(ctxBefore)
    expect(modeBefore).toBe('interior-gap')

    const global = new IndexerDeadline(Date.now(), 240_000)
    const featured = resolveStageDeadline(global, 'head-edge-only')
    vi.advanceTimersByTime(29_500)
    expect(featured.shouldStop(1_000)).toBe(true)

    expect(resolveOrchestratorStageMode(ctxBefore)).toBe('interior-gap')
    expect(ctxBefore).toEqual(interiorGapCtx)
    expect(global.snapshot().stoppedBeforeDeadline).toBe(false)
  })

  it('does not convert an interior gap into head-edge-only from deadline pressure alone', () => {
    vi.useFakeTimers()
    expect(resolveOrchestratorStageMode(interiorGapCtx)).toBe('interior-gap')

    const global = new IndexerDeadline(Date.now(), 5_000)
    const featured = resolveStageDeadline(global, 'interior-gap')
    vi.advanceTimersByTime(5_000)
    expect(featured.shouldStop(1_000)).toBe(true)

    expect(resolveOrchestratorStageMode(interiorGapCtx)).toBe('interior-gap')
    expect(shouldRunTierStages('interior-gap', false)).toBe(false)
  })
})
