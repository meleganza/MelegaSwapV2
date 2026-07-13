import type { NextApiHandler } from 'next'
import {
  runIndexerOrchestrator,
  type IndexerRunReport,
} from 'lib/bsc-indexer/indexer/indexerOrchestrator'
import {
  INDEXER_HTTP_GATEWAY_BUDGET_MS,
  SAFE_EXECUTION_BUDGET_MS,
} from 'lib/bsc-indexer/indexer/indexerDeadline'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'
import {
  buildLeaseOwnerId,
  classifyLeaseHealth,
  heartbeatIndexerLease,
  INDEXER_LEASE_HEARTBEAT_INTERVAL_MS,
  INDEXER_LEASE_TTL_MS,
  isLeaseActive,
  readIndexerLease,
  releaseIndexerLease,
  tryAcquireIndexerLease,
} from 'lib/bsc-indexer/indexer/indexerLease'

export const config = {
  maxDuration: 300,
}

async function persistOrchestratorSummary(report: IndexerRunReport): Promise<void> {
  const storage = resolveIndexerStorage()
  const [health, checkpoint] = await Promise.all([storage.loadHealth(), storage.loadCheckpoint()])
  const base = health ?? {
    status: 'syncing' as const,
    storageBackend: storage.backend,
    storageConfigured: storage.configured,
    lastIndexedBlock: checkpoint?.lastIndexedBlock ?? 0,
    chainHead: 0,
    indexingLag: 0,
    eventCounts: {},
  }
  await storage.saveHealth({
    ...base,
    finishedAt: new Date().toISOString(),
    lastOrchestratorRun: {
      capturedAt: new Date().toISOString(),
      ok: report.ok,
      elapsedMs: report.elapsedMs,
      budgetMs: report.budgetMs,
      stoppedBeforeDeadline: report.stoppedBeforeDeadline,
      partialProgress: report.partialProgress,
      addedEvents: report.addedEvents,
      addedCandles: report.addedCandles,
      pairJobsProcessed: report.pairJobsProcessed,
      providerUsed: report.providerUsed,
      nextWorkItem: report.nextWorkItem,
      cursorsBefore: report.cursorsBefore,
      cursorsAfter: report.cursorsAfter,
      stageTimings: report.stageTimings,
      adaptiveTelemetry: report.adaptiveTelemetry,
      featuredBootstrapComplete: report.featuredBootstrapComplete,
    },
  })
}

function resolveInvocationBudget(): number {
  const configured = Number(process.env.INDEXER_HTTP_BUDGET_MS)
  if (Number.isFinite(configured) && configured > 0) return configured
  return INDEXER_HTTP_GATEWAY_BUDGET_MS
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization
  const cronSecrets = [process.env.CRON_SECRET, process.env.INDEXER_CRON_SECRET].filter(Boolean)
  const vercelCron = req.headers['x-vercel-cron'] === '1'
  const fullBudget = req.query.budget === 'full' || vercelCron

  if (!vercelCron) {
    const authorized = cronSecrets.some((secret) => auth === `Bearer ${secret}`)
    if (!authorized) {
      return res.status(401).json({ error: 'Unauthorized indexer run' })
    }
  }

  const runType = vercelCron ? 'vercel-cron' : 'manual'
  const deploymentSha = process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown'
  const ownerId = buildLeaseOwnerId(runType)
  const leaseAttempt = await tryAcquireIndexerLease({ ownerId, runType, deploymentSha })
  if (!leaseAttempt.acquired) {
    const lease = leaseAttempt.lease ?? (await readIndexerLease())
    return res.status(200).json({
      ok: true,
      skipped: true,
      reason: leaseAttempt.reason ?? 'LEASE_ACTIVE_BY_OTHER_WORKER',
      lockState: isLeaseActive(lease) ? 'held' : 'expired',
      lockOwner: lease?.ownerId ?? null,
      lockAcquiredAt: lease?.acquiredAt ?? null,
      lockExpiresAt: lease?.expiresAt ?? null,
      lockHeartbeatAt: lease?.heartbeatAt ?? null,
      lockHealth: classifyLeaseHealth(lease),
      leaseTtlMs: INDEXER_LEASE_TTL_MS,
      leaseHeartbeatIntervalMs: INDEXER_LEASE_HEARTBEAT_INTERVAL_MS,
      activeRunType: lease?.runType ?? null,
      activeDeploymentSha: lease?.deploymentSha ?? null,
    })
  }

  const budgetMs = fullBudget ? SAFE_EXECUTION_BUDGET_MS : resolveInvocationBudget()
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined

  try {
    await heartbeatIndexerLease(ownerId)
    heartbeatTimer = setInterval(() => {
      void heartbeatIndexerLease(ownerId)
    }, INDEXER_LEASE_HEARTBEAT_INTERVAL_MS)
    const report = await runIndexerOrchestrator(budgetMs)
    await persistOrchestratorSummary(report)
    return res.status(200).json({
      ...report,
      lockState: 'acquired',
      lockOwner: ownerId,
      activeRunType: runType,
      activeDeploymentSha: deploymentSha,
      leaseRecoveredFromStale: leaseAttempt.recoveredFromStale ?? false,
    })
  } catch (e) {
    return res.status(502).json({
      ok: false,
      reason: e instanceof Error ? e.message : 'Indexer sync failed',
    })
  } finally {
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    await releaseIndexerLease(ownerId)
  }
}

export default handler
