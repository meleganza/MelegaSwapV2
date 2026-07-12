#!/usr/bin/env node
/**
 * R789 — sequential production indexer invocations with full telemetry.
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
      if (!process.env[key]) process.env[key] = value
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
const HAS_SECRET = SECRET.length > 0
const USE_VERCEL_CRON = process.env.R789_USE_VERCEL_CRON === '1' || !HAS_SECRET
const RUNS = Number(process.env.R789_INDEXER_RUNS || 10)
const DELAY_MS = Number(process.env.R789_INDEXER_DELAY_MS || 3000)

if (!HAS_SECRET && !USE_VERCEL_CRON) {
  console.error('INDEXER_CRON_SECRET or CRON_SECRET required (or set R789_USE_VERCEL_CRON=1)')
  process.exit(1)
}

async function fetchCoverage() {
  const res = await fetch(`${BASE}/api/indexer/coverage`, {
    headers: { 'x-vercel-protection-bypass': BYPASS },
  })
  if (!res.ok) return null
  return res.json()
}

async function runOnce(n) {
  const coverageBefore = await fetchCoverage()
  const started = Date.now()
  const headers = {
    'x-vercel-protection-bypass': BYPASS,
    accept: 'application/json',
  }
  if (HAS_SECRET) headers.authorization = `Bearer ${SECRET}`
  if (USE_VERCEL_CRON) headers['x-vercel-cron'] = '1'

  const res = await fetch(`${BASE}/api/indexer/run/`, {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(285_000),
  })
  const elapsedMs = Date.now() - started
  const json = await res.json().catch(() => ({}))
  const coverageAfter = await fetchCoverage()
  return {
    run: n,
    timestamp: new Date().toISOString(),
    httpStatus: res.status,
    ok: res.ok && json.ok !== false,
    elapsedMs,
    budgetMs: json.budgetMs,
    stoppedBeforeDeadline: json.stoppedBeforeDeadline,
    partialProgress: json.partialProgress,
    providerUsed: json.providerUsed,
    featuredPairProcessed: json.featuredPairProcessed,
    protocolActivityProcessed: json.protocolActivityProcessed,
    tier1Processed: json.tier1Processed,
    tier2Processed: json.tier2Processed,
    rangesScanned: json.rangesScanned,
    eventsAdded: json.eventsAdded,
    candlesAdded: json.candlesAdded,
    cursorsBefore: json.cursorsBefore,
    cursorsAfter: json.cursorsAfter,
    nextWorkItem: json.nextWorkItem,
    stageTimings: json.stageTimings,
    failureReason: json.reason || json.error,
    coverageBefore: coverageBefore?.bootstrapWindow,
    coverageAfter: coverageAfter?.bootstrapWindow,
    raw: json,
  }
}

async function main() {
  await mkdir(path.dirname(OUT), { recursive: true })
  const runs = []
  let cleanStreak = 0
  for (let i = 1; i <= RUNS; i += 1) {
    try {
      const row = await runOnce(i)
      runs.push(row)
      const clean =
        row.ok &&
        row.httpStatus === 200 &&
        row.stoppedBeforeDeadline !== false &&
        row.elapsedMs < 285000
      cleanStreak = clean ? cleanStreak + 1 : 0
      console.log(
        `[r789-indexer] ${i}/${RUNS} ok=${row.ok} status=${row.httpStatus} elapsed=${row.elapsedMs}ms events=${row.eventsAdded ?? 0} partial=${row.partialProgress ?? false}`,
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
    if (i < RUNS) await new Promise((r) => setTimeout(r, DELAY_MS))
  }
  const report = {
    mission: 'R789',
    base: BASE,
    capturedAt: new Date().toISOString(),
    requestedRuns: RUNS,
    completedRuns: runs.length,
    cleanSequentialRuns: runs.filter(
      (r) => r.ok && r.httpStatus === 200 && r.stoppedBeforeDeadline !== false && r.elapsedMs < 295000,
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
