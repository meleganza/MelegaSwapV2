import { FEATURED_PAIR_SLUG } from '../constants'
import { IndexerDeadline, SAFE_EXECUTION_BUDGET_MS } from './indexerDeadline'
import { runFeaturedPairSync } from './featuredPairSync'
import { loadTierPairInventory } from './tierInventory'
import { runTierPairSync } from './tierPairSync'
import { loadTierSchedulerState, pickRotatingPair, saveTierSchedulerState } from './tierScheduler'
import { PROTOCOL_ACTIVITY_MIN_REMAINING_MS, syncProtocolActivityRecent } from './protocolActivitySync'
import { isBootstrapWindowComplete } from './bootstrapWindow'

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
  cursorsBefore: Record<string, number | null>
  cursorsAfter: Record<string, number | null>
  nextWorkItem: string
  providerUsed?: string
  stageTimings: Array<{ stage: string; elapsedMs: number }>
  featuredBootstrapComplete?: boolean
  adaptiveTelemetry?: import('./adaptiveGapScan').AdaptiveScanTelemetry
}

export async function runIndexerOrchestrator(
  budgetMs: number = SAFE_EXECUTION_BUDGET_MS,
): Promise<IndexerRunReport> {
  const deadline = new IndexerDeadline(Date.now(), budgetMs)
  let addedEvents = 0
  let addedCandles = 0
  let forwardRangesProcessed = 0
  let gapRangesProcessed = 0
  let pairJobsProcessed = 0
  let featured: IndexerRunReport['featured'] = null
  let tier1Job: IndexerRunReport['tier1Job'] = null
  let tier2Job: IndexerRunReport['tier2Job'] = null
  let protocolActivity: IndexerRunReport['protocolActivity'] = null
  const cursorsBefore: Record<string, number | null> = {}
  const cursorsAfter: Record<string, number | null> = {}

  deadline.markStage('init')
  featured = await runFeaturedPairSync(deadline)
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

  if (
    featuredBootstrapComplete &&
    !deadline.shouldStop() &&
    deadline.remainingMs() > PROTOCOL_ACTIVITY_MIN_REMAINING_MS
  ) {
    protocolActivity = await syncProtocolActivityRecent(deadline)
    deadline.markStage('protocol-activity')
  }

  if (featuredBootstrapComplete && !deadline.shouldStop()) {
    const inventory = await loadTierPairInventory()
    const scheduler = await loadTierSchedulerState()
    const tier1Candidates = inventory.tier1.filter((p) => p.slug !== FEATURED_PAIR_SLUG)
    const tier2Candidates = inventory.tier2

    const tier1Pick = pickRotatingPair(tier1Candidates, scheduler.tier1RotationIndex)
    if (tier1Pick.pair) {
      tier1Job = await runTierPairSync(tier1Pick.pair, deadline)
      addedEvents += tier1Job.addedEvents
      pairJobsProcessed += 1
      scheduler.tier1RotationIndex = tier1Pick.nextIndex
      scheduler.lastProviderResult = tier1Job.health.providerUsed
      cursorsAfter[tier1Pick.pair.slug] = tier1Job.checkpoint.gapFillCursor ?? null
      deadline.markStage('tier1-sync')
    }

    if (!deadline.shouldStop()) {
      const tier2Pick = pickRotatingPair(tier2Candidates, scheduler.tier2RotationIndex)
      if (tier2Pick.pair) {
        tier2Job = await runTierPairSync(tier2Pick.pair, deadline)
        addedEvents += tier2Job.addedEvents
        pairJobsProcessed += 1
        scheduler.tier2RotationIndex = tier2Pick.nextIndex
        scheduler.lastProviderResult = tier2Job.health.providerUsed
        cursorsAfter[tier2Pick.pair.slug] = tier2Job.checkpoint.gapFillCursor ?? null
        deadline.markStage('tier2-sync')
      }
    }

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
    cursorsBefore,
    cursorsAfter,
    nextWorkItem,
    providerUsed: featured?.health.providerUsed,
    stageTimings: snap.stages,
    featuredBootstrapComplete,
    adaptiveTelemetry: featured?.adaptiveTelemetry,
  }
}
