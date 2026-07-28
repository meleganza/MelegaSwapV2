/**
 * Live 3-cycle durable indexer verification against BSC mainnet.
 * Usage: BSC_RPC_URL=... BSC_INDEXER_DATA_DIR=... node --import tsx run-live-cycles.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = __dirname
const webRoot = path.resolve(__dirname, '../../..')

async function loadOrchestrator() {
  const href = pathToFileURL(path.join(webRoot, 'src/lib/bsc-indexer/indexer/indexerOrchestrator.ts')).href
  const mod = await import(href)
  const fn = mod.runIndexerOrchestrator ?? mod.default?.runIndexerOrchestrator
  if (typeof fn !== 'function') throw new Error(`runIndexerOrchestrator missing from ${href}`)
  return fn
}

async function loadStorage() {
  const href = pathToFileURL(path.join(webRoot, 'src/lib/bsc-indexer/storage/index.ts')).href
  const mod = await import(href)
  const fn = mod.resolveIndexerStorage ?? mod.default?.resolveIndexerStorage
  if (typeof fn !== 'function') {
    throw new Error(`resolveIndexerStorage missing from ${href}; keys=${Object.keys(mod).join(',')}`)
  }
  return fn
}

async function snapshot(label, resolveIndexerStorage) {
  const storage = resolveIndexerStorage()
  const [checkpoint, health, eventCounts] = await Promise.all([
    storage.loadCheckpoint(),
    storage.loadHealth(),
    storage.countEvents(),
  ])
  const events = await storage.listEvents({ limit: 5000 })
  const ids = events.map((e) => `${e.chainId}:${e.txHash}:${e.logIndex}`)
  const unique = new Set(ids)
  return {
    label,
    capturedAt: new Date().toISOString(),
    storageBackend: storage.backend,
    storageConfigured: storage.configured,
    lastIndexedBlock: checkpoint?.lastIndexedBlock ?? 0,
    gapFillCursor: checkpoint?.gapFillCursor ?? null,
    phase: checkpoint?.phase,
    resetReason: checkpoint?.resetReason,
    coverageRanges: checkpoint?.coverageRanges?.length ?? 0,
    eventCounts,
    eventTotal: events.length,
    uniqueEventIds: unique.size,
    duplicateIds: ids.length - unique.size,
    healthStatus: health?.status,
    sampleSwapBlocks: events
      .filter((e) => e.eventType === 'Swap')
      .slice(0, 5)
      .map((e) => e.blockNumber),
  }
}

async function main() {
  if (!process.env.BSC_RPC_URL) throw new Error('BSC_RPC_URL required')
  const runIndexerOrchestrator = await loadOrchestrator()
  const resolveIndexerStorage = await loadStorage()
  const cycles = []

  for (let i = 1; i <= 3; i += 1) {
    const before = await snapshot(`cycle-${i}-before`, resolveIndexerStorage)
    const started = Date.now()
    const result = await runIndexerOrchestrator(i === 1 ? 120_000 : 90_000)
    const after = await snapshot(`cycle-${i}-after`, resolveIndexerStorage)
    const cycle = {
      cycle: i,
      elapsedMs: Date.now() - started,
      before,
      after,
      result: {
        ok: result?.ok,
        addedEvents: result?.addedEvents,
        addedCandles: result?.addedCandles,
        partialProgress: result?.partialProgress,
        pairJobsProcessed: result?.pairJobsProcessed,
        featuredBootstrapComplete: result?.featuredBootstrapComplete,
        cursorsAfter: result?.cursorsAfter,
        nextWorkItem: result?.nextWorkItem,
      },
    }
    cycles.push(cycle)
    const name =
      i === 1 ? 'backfill-cycle-1.json' : i === 2 ? 'backfill-cycle-2.json' : 'incremental-cycle-3.json'
    fs.writeFileSync(path.join(outDir, name), JSON.stringify(cycle, null, 2))
    console.log(JSON.stringify({ cycle: i, swaps: after.eventCounts?.Swap, lastIndexedBlock: after.lastIndexedBlock, added: result?.addedEvents }, null, 2))
  }

  const c1 = cycles[0].after
  const c2 = cycles[1].after
  const c3 = cycles[2].after
  const idempotency = {
    capturedAt: new Date().toISOString(),
    cycle1EventTotal: c1.eventTotal,
    cycle2EventTotal: c2.eventTotal,
    cycle3EventTotal: c3.eventTotal,
    cycle1Unique: c1.uniqueEventIds,
    cycle2Unique: c2.uniqueEventIds,
    cycle3Unique: c3.uniqueEventIds,
    duplicatesAnyCycle: [c1, c2, c3].some((c) => c.duplicateIds > 0),
    swapCounts: [c1, c2, c3].map((c) => c.eventCounts?.Swap ?? 0),
    nonDecreasingSwaps:
      (c2.eventCounts?.Swap ?? 0) >= (c1.eventCounts?.Swap ?? 0) &&
      (c3.eventCounts?.Swap ?? 0) >= (c2.eventCounts?.Swap ?? 0),
    lastIndexedBlocks: [c1, c2, c3].map((c) => c.lastIndexedBlock),
  }
  fs.writeFileSync(path.join(outDir, 'idempotency-proof.json'), JSON.stringify(idempotency, null, 2))
  fs.writeFileSync(
    path.join(outDir, 'checkpoint-proof.json'),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        neverResetToZero: [c1, c2, c3].every((c) => c.lastIndexedBlock > 0),
        phases: [c1, c2, c3].map((c) => c.phase),
        resetReasons: [c1, c2, c3].map((c) => c.resetReason ?? null),
        gapFillCursors: [c1, c2, c3].map((c) => c.gapFillCursor),
        lastIndexedBlocks: idempotency.lastIndexedBlocks,
      },
      null,
      2,
    ),
  )
  console.log('DONE', idempotency)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
