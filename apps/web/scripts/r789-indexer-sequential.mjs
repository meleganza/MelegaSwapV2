#!/usr/bin/env node
/**
 * R789 — sequential production indexer invocations with trigger + health poll telemetry.
 * External POST may return 504 while the orchestrator completes; poll /api/indexer/health for lastOrchestratorRun.
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function loadEnvFile(relPath) {
  try {
    const raw = await readFile(path.join(__dirname, '..', relPath), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
      const current = process.env[key]
      if (!current || String(current).trim().length === 0) process.env[key] = value
    }
  } catch {
    /* optional env file */
  }
}

await loadEnvFile('.env.r773-prod')
await loadEnvFile('.env.production.local')

const OUT = path.join(__dirname, '../docs/runtime/r789-indexer-sequential-runs.json')
const BASE = (process.env.R789_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const SECRET = (process.env.INDEXER_CRON_SECRET || process.env.CRON_SECRET || '').trim()
const HAS_SECRET = SECRET.length >= 16
const USE_VERCEL_CRON = process.env.R789_USE_VERCEL_CRON === '1' || !HAS_SECRET
const RUNS = Number(process.env.R789_INDEXER_RUNS || 10)
const DELAY_MS = Number(process.env.R789_INDEXER_DELAY_MS || 5000)
const POLL_MS = Number(process.env.R789_INDEXER_POLL_MS || 5000)
const POLL_TIMEOUT_MS = Number(process.env.R789_INDEXER_POLL_TIMEOUT_MS || 290_000)

async function fetchCoverage() {
  const res = await fetch(`${BASE}/api/indexer/coverage`, {
    headers: { 'x-vercel-protection-bypass': BYPASS },
  })
  if (!res.ok) return null
  return res.json()
}

async function fetchHealth() {
  const res = await fetch(`${BASE}/api/indexer/health`, {
    headers: { 'x-vercel-protection-bypass': BYPASS },
  })
  if (!res.ok) return null
  return res.json()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForOrchestratorRun(previousCapturedAt, startedAt) {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    const health = await fetchHealth()
    const run = health?.lastOrchestratorRun
    if (
      run?.capturedAt &&
      run.capturedAt !== previousCapturedAt &&
      new Date(run.capturedAt).getTime() >= startedAt - 2000
    ) {
      return { health, run, pollElapsedMs: POLL_TIMEOUT_MS - (deadline - Date.now()) }
    }
    await sleep(POLL_MS)
  }
  return { health: await fetchHealth(), run: null, pollElapsedMs: POLL_TIMEOUT_MS, timedOut: true }
}

async function runOnce(n) {
  const coverageBefore = await fetchCoverage()
  const healthBefore = await fetchHealth()
  const previousCapturedAt = healthBefore?.lastOrchestratorRun?.capturedAt ?? null
  const started = Date.now()
  const headers = {
    'x-vercel-protection-bypass': BYPASS,
    accept: 'application/json',
  }
  if (HAS_SECRET) headers.authorization = `Bearer ${SECRET}`
  if (USE_VERCEL_CRON) headers['x-vercel-cron'] = '1'

  let httpStatus = 0
  let triggerBody = {}
  try {
    const res = await fetch(`${BASE}/api/indexer/run/`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(70_000),
    })
    httpStatus = res.status
    triggerBody = await res.json().catch(() => ({}))
    if (res.ok) {
      const coverageAfter = await fetchCoverage()
      return {
        run: n,
        timestamp: new Date().toISOString(),
        mode: 'direct-response',
        httpStatus,
        ok: triggerBody.ok !== false,
        elapsedMs: Date.now() - started,
        budgetMs: triggerBody.budgetMs,
        stoppedBeforeDeadline: triggerBody.stoppedBeforeDeadline,
        partialProgress: triggerBody.partialProgress,
        providerUsed: triggerBody.providerUsed,
        featuredPairProcessed: Boolean(triggerBody.featured),
        protocolActivityProcessed: Boolean(triggerBody.protocolActivity),
        tier1Processed: Boolean(triggerBody.tier1Job),
        tier2Processed: Boolean(triggerBody.tier2Job),
        rangesScanned:
          (triggerBody.forwardRangesProcessed ?? 0) + (triggerBody.gapRangesProcessed ?? 0),
        eventsAdded: triggerBody.addedEvents,
        candlesAdded: triggerBody.addedCandles,
        cursorsBefore: triggerBody.cursorsBefore,
        cursorsAfter: triggerBody.cursorsAfter,
        nextWorkItem: triggerBody.nextWorkItem,
        stageTimings: triggerBody.stageTimings,
        failureReason: triggerBody.reason || triggerBody.error,
        coverageBefore: coverageBefore?.bootstrapWindow,
        coverageAfter: coverageAfter?.bootstrapWindow,
        raw: triggerBody,
      }
    }
  } catch (e) {
    httpStatus = httpStatus || 504
    triggerBody = { triggerError: e instanceof Error ? e.message : String(e) }
  }

  const polled = await waitForOrchestratorRun(previousCapturedAt, started)
  const coverageAfter = await fetchCoverage()
  const run = polled.run
  const ok =
    Boolean(run?.ok) &&
    run?.stoppedBeforeDeadline !== false &&
    !polled.timedOut &&
    (httpStatus === 200 || httpStatus === 504 || httpStatus === 0)

  return {
    run: n,
    timestamp: new Date().toISOString(),
    mode: 'trigger-poll',
    httpStatus: httpStatus || 504,
    triggerAccepted: httpStatus === 504 || httpStatus === 200,
    ok,
    elapsedMs: Date.now() - started,
    pollElapsedMs: polled.pollElapsedMs,
    pollTimedOut: Boolean(polled.timedOut),
    budgetMs: run?.budgetMs,
    stoppedBeforeDeadline: run?.stoppedBeforeDeadline,
    partialProgress: run?.partialProgress,
    providerUsed: run?.providerUsed,
    featuredPairProcessed: run?.pairJobsProcessed ? run.pairJobsProcessed >= 1 : undefined,
    protocolActivityProcessed: undefined,
    tier1Processed: run?.pairJobsProcessed ? run.pairJobsProcessed >= 2 : undefined,
    tier2Processed: run?.pairJobsProcessed ? run.pairJobsProcessed >= 3 : undefined,
    rangesScanned: undefined,
    eventsAdded: run?.addedEvents,
    candlesAdded: run?.addedCandles,
    cursorsBefore: run?.cursorsBefore,
    cursorsAfter: run?.cursorsAfter,
    nextWorkItem: run?.nextWorkItem,
    stageTimings: run?.stageTimings,
    failureReason: polled.timedOut ? 'poll-timeout' : run?.ok === false ? 'orchestrator-not-ok' : triggerBody,
    coverageBefore: coverageBefore?.bootstrapWindow,
    coverageAfter: coverageAfter?.bootstrapWindow,
    healthBefore: {
      lastSuccessfulSync: healthBefore?.lastSuccessfulSync,
      lastIndexedBlock: healthBefore?.lastIndexedBlock,
      lastOrchestratorRun: healthBefore?.lastOrchestratorRun?.capturedAt,
    },
    healthAfter: {
      lastSuccessfulSync: polled.health?.lastSuccessfulSync,
      lastIndexedBlock: polled.health?.lastIndexedBlock,
      lastOrchestratorRun: polled.health?.lastOrchestratorRun,
    },
    raw: { triggerBody, orchestratorRun: run },
  }
}

async function main() {
  await mkdir(path.dirname(OUT), { recursive: true })
  const runs = []
  for (let i = 1; i <= RUNS; i += 1) {
    try {
      const row = await runOnce(i)
      runs.push(row)
      console.log(
        `[r789-indexer] ${i}/${RUNS} ok=${row.ok} mode=${row.mode} status=${row.httpStatus} elapsed=${row.elapsedMs}ms events=${row.eventsAdded ?? 0} stopped=${row.stoppedBeforeDeadline ?? '?'}`,
      )
      if (!row.ok) {
        console.error(`[r789-indexer] run ${i} failed:`, row.failureReason || row.httpStatus)
        break
      }
    } catch (e) {
      runs.push({
        run: i,
        timestamp: new Date().toISOString(),
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      })
      break
    }
    if (i < RUNS) await sleep(DELAY_MS)
  }
  const report = {
    mission: 'R789',
    base: BASE,
    capturedAt: new Date().toISOString(),
    authMode: HAS_SECRET ? 'bearer' : 'vercel-cron-trigger-poll',
    requestedRuns: RUNS,
    completedRuns: runs.length,
    cleanSequentialRuns: runs.filter(
      (r) =>
        r.ok &&
        r.httpStatus === 200 &&
        r.elapsedMs < (r.budgetMs ?? 60_000) + 15_000 &&
        !r.failureReason,
    ).length,
    runs,
  }
  await writeFile(OUT, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ completed: report.completedRuns, clean: report.cleanSequentialRuns }, null, 2))
  process.exit(report.cleanSequentialRuns >= RUNS ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
