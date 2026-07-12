import type { NextApiHandler } from 'next'
import { runIndexerOrchestrator, type IndexerRunReport } from 'lib/bsc-indexer/indexer/indexerOrchestrator'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'

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
    },
  })
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization
  const cronSecrets = [process.env.CRON_SECRET, process.env.INDEXER_CRON_SECRET].filter(Boolean)
  const vercelCron = req.headers['x-vercel-cron'] === '1'

  if (!vercelCron) {
    const authorized = cronSecrets.some((secret) => auth === `Bearer ${secret}`)
    if (!authorized) {
      return res.status(401).json({ error: 'Unauthorized indexer run' })
    }
  }

  try {
    const report = await runIndexerOrchestrator()
    await persistOrchestratorSummary(report)
    return res.status(200).json(report)
  } catch (e) {
    return res.status(502).json({
      ok: false,
      reason: e instanceof Error ? e.message : 'Indexer sync failed',
    })
  }
}

export default handler
