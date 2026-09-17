import { FEATURED_PAIR_SLUG, REORG_SAFETY_BLOCKS } from '../constants'
import { resolveIndexerStorage } from '../storage'
import { getBlockNumber } from '../rpc/chunkedLogs'
import { IndexerDeadline, SAFE_EXECUTION_BUDGET_MS } from './indexerDeadline'
import { runFeaturedPairSync } from './featuredPairSync'
import { loadTierPairInventory } from './tierInventory'
import { runTierPairSync } from './tierPairSync'
import {
  TIER1_JOBS_PER_INVOCATION,
  TIER2_JOBS_PER_INVOCATION,
  loadTierSchedulerState,
  runBoundedRotatingBatch,
  saveTierSchedulerState,
} from './tierScheduler'
import { PROTOCOL_ACTIVITY_MIN_REMAINING_MS, syncProtocolActivityRecent } from './protocolActivitySync'
import { LB_PROGRAM_SYNC_MIN_REMAINING_MS, syncLbProgramInventory } from 'lib/liquidity-builder-indexer'
import { isBootstrapWindowComplete } from './bootstrapWindow'
import {
  resolveOrchestratorStageMode,
  resolveStageDeadline,
  shouldRunTierStages,
} from './orchestratorStageBudget'

export interface IndexerRunReport {
  ok: boolean
  partialProgress: boolean
  elapsedMs: number
  budgetMs: number
  stoppedBeforeDeadline: boolean
  addedEvents: number
  addedCandles: number
  forwardRangesProcessed: number
  gapRangesProcessed: number
  pairJobsProcessed: number
  featured: Awaited<ReturnType<typeof runFeaturedPairSync>> | null
  tier1Job: Awaited<ReturnType<typeof runTierPairSync>> | null
  tier2Job: Awaited<ReturnType<typeof runTierPairSync>> | null
  protocolActivity: Awaited<ReturnType<typeof syncProtocolActivityRecent>> | null
  lbPrograms: Awaited<ReturnType<typeof syncLbProgramInventory>> | null
  cursorsBefore: Record<string, number | null>
  cursorsAfter: Record<string, number | null>
  nextWorkItem: string
  providerUsed?: string
  stageTimings: Array<{ stage: string; elapsedMs: number }>
  featuredBootstrapComplete?: boolean
  adaptiveTelemetry?: import('./adaptiveGapScan').AdaptiveScanTelemetry
  activeTierSize: number
  tier2CandidatesConsidered: number
  tier2JobsAttempted: number
  tier2JobsCompleted: number
  batchStoppedByDeadline: boolean
  nextRotationIndex: number
  tier3Count: number
}

export async function runIndexerOrchestrator(
  budgetMs: number = SAFE_EXECUTION_BUDGET_MS,
): Promise<IndexerRunReport> {
  const deadline = new IndexerDeadline(Date.now(), budgetMs)
  const storage = resolveIndexerStorage()
  const [checkpoint, chainHead] = await Promise.all([storage.loadCheckpoint(), getBlockNumber()])
  const bootstrapFloor = checkpoint?.bootstrapStartBlock ?? 0
  const coverageCtx = {
    bootstrapFloor,
    forwardHigh: Math.max(0, chainHead - REORG_SAFETY_BLOCKS),
    gapFillCursor: checkpoint?.gapFillCursor ?? checkpoint?.forwardCursor ?? bootstrapFloor,
    coverageRanges: checkpoint?.coverageRanges ?? [],
  }
  const stageMode = resolveOrchestratorStageMode(coverageCtx)

  let addedEvents = 0
  let addedCandles = 0
  let forwardRangesProcessed = 0
  let gapRangesProcessed = 0
  let pairJobsProcessed = 0
  let featured: IndexerRunReport['featured'] = null
  let tier1Job: IndexerRunReport['tier1Job'] = null
  let tier2Job: IndexerRunReport['tier2Job'] = null
  let protocolActivity: IndexerRunReport['protocolActivity'] = null
  let lbPrograms: IndexerRunReport['lbPrograms'] = null
  let activeTierSize = 0
  let tier2CandidatesConsidered = 0
  let tier2JobsAttempted = 0
  let tier2JobsCompleted = 0
  let batchStoppedByDeadline = false
  let nextRotationIndex = 0
  let tier3Count = 0
  const cursorsBefore: Record<string, number | null> = {}
  const cursorsAfter: Record<string, number | null> = {}

  deadline.markStage('init')
  const featuredDeadline = resolveStageDeadline(deadline, stageMode)
  featured = await runFeaturedPairSync(featuredDeadline)
  cursorsBefore[FEATURED_PAIR_SLUG] = featured.checkpoint.gapFillCursor ?? featured.checkpoint.forwardCursor ?? null
  addedEvents += featured.addedEvents
  forwardRangesProcessed += featured.forwardRangesProcessed ?? 0
  gapRangesProcessed += featured.gapRangesProcessed ?? 0
  pairJobsProcessed += 1
  cursorsAfter[FEATURED_PAIR_SLUG] = featured.checkpoint.gapFillCursor ?? featured.checkpoint.forwardCursor ?? null
  deadline.markStage('featured-sync')

  const featuredBootstrapComplete = Boolean(
    featured.coverageSummary &&
      isBootstrapWindowComplete(
        featured.coverageSummary.coveragePercent,
        featured.coverageSummary.gaps,
      ),
  )

  const tierStagesEligible = shouldRunTierStages(stageMode, featuredBootstrapComplete)

  const protocolMinRemaining =
    stageMode === 'head-edge-only' ? 1_000 : PROTOCOL_ACTIVITY_MIN_REMAINING_MS

  if (!deadline.shouldStop() && deadline.remainingMs() > protocolMinRemaining) {
    const protocolDeadline = resolveStageDeadline(deadline, stageMode)
    protocolActivity = await syncProtocolActivityRecent(protocolDeadline)
    deadline.markStage('protocol-activity')
  }

  if (!deadline.shouldStop() && deadline.remainingMs() > LB_PROGRAM_SYNC_MIN_REMAINING_MS) {
    try {
      lbPrograms = await syncLbProgramInventory({ deadline })
      addedEvents += lbPrograms.added ?? 0
      deadline.markStage('lb-programs')
    } catch {
      lbPrograms = {
        ok: false,
        reason: 'LB_SYNC_ERROR',
        added: 0,
        scannedBlocks: 0,
        factoryLogs: 0,
        programLogs: 0,
        feeLogs: 0,
        programCount: 0,
      }
    }
  }

  if (tierStagesEligible && !deadline.shouldStop()) {
    const inventory = await loadTierPairInventory()
    const scheduler = await loadTierSchedulerState()
    const tier1Candidates = inventory.tier1.filter((p) => p.slug !== FEATURED_PAIR_SLUG)
    const tier2Candidates = inventory.tier2
    activeTierSize = inventory.activeTierSize
    tier2CandidatesConsidered = inventory.tier2CandidatesConsidered
    tier3Count = inventory.tier3Count
    nextRotationIndex = scheduler.tier2RotationIndex

    // Wave 03: sync ALL Tier-1 founder/core pairs each cron (not one rotate) so Top Movers
    // can accumulate ≥2 observations beyond MARCO. Cap by remaining deadline.
    const FOUNDER_TIER1_BATCH = Math.min(tier1Candidates.length, TIER1_JOBS_PER_INVOCATION)
    for (let i = 0; i < FOUNDER_TIER1_BATCH && !deadline.shouldStop(); i += 1) {
      const idx = (scheduler.tier1RotationIndex + i) % Math.max(1, tier1Candidates.length)
      const pair = tier1Candidates[idx]
      if (!pair) continue
      const tier1Deadline = resolveStageDeadline(deadline, stageMode)
      const job = await runTierPairSync(pair, tier1Deadline)
      tier1Job = job
      addedEvents += job.addedEvents
      pairJobsProcessed += 1
      scheduler.lastProviderResult = job.health.providerUsed
      cursorsAfter[pair.slug] = job.checkpoint.gapFillCursor ?? null
      deadline.markStage('tier1-sync')
    }
    if (tier1Candidates.length > 0) {
      scheduler.tier1RotationIndex =
        (scheduler.tier1RotationIndex + FOUNDER_TIER1_BATCH) % tier1Candidates.length
    }

    const tier2Batch = await runBoundedRotatingBatch({
      pairs: tier2Candidates,
      rotationIndex: scheduler.tier2RotationIndex,
      maxJobs: TIER2_JOBS_PER_INVOCATION,
      shouldStop: () => deadline.shouldStop(),
      runJob: async (pair) => {
        const tier2Deadline = resolveStageDeadline(deadline, stageMode)
        const job = await runTierPairSync(pair, tier2Deadline)
        tier2Job = job
        addedEvents += job.addedEvents
        pairJobsProcessed += 1
        scheduler.lastProviderResult = job.health.providerUsed
        cursorsAfter[pair.slug] = job.checkpoint.gapFillCursor ?? null
        deadline.markStage('tier2-sync')
      },
    })
    tier2JobsAttempted = tier2Batch.jobsAttempted
    tier2JobsCompleted = tier2Batch.jobsCompleted
    batchStoppedByDeadline = tier2Batch.batchStoppedByDeadline
    scheduler.tier2RotationIndex = tier2Batch.nextRotationIndex
    nextRotationIndex = tier2Batch.nextRotationIndex

    scheduler.lastAttemptedAt = new Date().toISOString()
    if (addedEvents > 0 || pairJobsProcessed > 0) {
      scheduler.lastSuccessfulAt = scheduler.lastAttemptedAt
      scheduler.consecutiveFailures = 0
    } else {
      scheduler.consecutiveFailures += 1
    }
    await saveTierSchedulerState(scheduler)
  }

  const snap = deadline.snapshot()
  const nextWorkItem =
    featured?.coverageSummary && !featured.coverageSummary.complete
      ? `gap-fill:${FEATURED_PAIR_SLUG}:${featured.coverageSummary.gaps[featured.coverageSummary.gaps.length - 1]?.fromBlock ?? 'head'}`
      : tier2Job
        ? `tier2:${tier2Job.slug}`
        : 'forward-live-sync'

  return {
    ok: true,
    partialProgress: snap.stoppedBeforeDeadline || addedEvents > 0 || pairJobsProcessed > 0,
    elapsedMs: snap.elapsedMs,
    budgetMs: snap.budgetMs,
    stoppedBeforeDeadline: snap.stoppedBeforeDeadline,
    addedEvents,
    addedCandles,
    forwardRangesProcessed,
    gapRangesProcessed,
    pairJobsProcessed,
    featured,
    tier1Job,
    tier2Job,
    protocolActivity,
    lbPrograms,
    cursorsBefore,
    cursorsAfter,
    nextWorkItem,
    providerUsed: featured?.health.providerUsed,
    stageTimings: snap.stages,
    featuredBootstrapComplete,
    adaptiveTelemetry: featured?.adaptiveTelemetry,
    activeTierSize,
    tier2CandidatesConsidered,
    tier2JobsAttempted,
    tier2JobsCompleted,
    batchStoppedByDeadline,
    nextRotationIndex,
    tier3Count,
  }
}
