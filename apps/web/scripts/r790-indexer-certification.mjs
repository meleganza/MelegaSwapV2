#!/usr/bin/env node
/**
 * R790 — production indexer certification (sequential, lease-aware, adaptive telemetry).
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
      if (!process.env[key]?.trim()) process.env[key] = value
    }
  } catch {
    /* optional */
  }
}

await loadEnvFile('.env.r773-prod')
await loadEnvFile('.env.production.local')

const OUT_RUNS = path.join(__dirname, '../docs/runtime/r790-indexer-sequential-runs.json')
const OUT_COVERAGE = path.join(__dirname, '../docs/runtime/r790-indexer-coverage.json')
const OUT_LOCK = path.join(__dirname, '../docs/runtime/r790-indexer-lock-proof.json')
const BASE = (process.env.R790_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const SECRET = (process.env.INDEXER_CRON_SECRET || process.env.CRON_SECRET || '').trim()
const HAS_SECRET = SECRET.length >= 16
const RUNS = Number(process.env.R790_INDEXER_RUNS || 10)
const MAX_RUNS = Number(process.env.R790_INDEXER_MAX_RUNS || RUNS)
const DELAY_MS = Number(process.env.R790_INDEXER_DELAY_MS || 5000)
const UNTIL_COMPLETE = process.env.R790_UNTIL_COVERAGE_COMPLETE === '1'

const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

async function fetchJson(url, init) {
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

async function fetchCoverage() {
  const { body } = await fetchJson(`${BASE}/api/indexer/coverage/`)
  return body
}

async function fetchHealth() {
  const { body } = await fetchJson(`${BASE}/api/indexer/health/`)
  return body
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function runOnce(n) {
  const coverageBefore = await fetchCoverage()
  const healthBefore = await fetchHealth()
  const started = Date.now()
  const reqHeaders = { ...headers }
  if (HAS_SECRET) reqHeaders.authorization = `Bearer ${SECRET}`
  else reqHeaders['x-vercel-cron'] = '1'

  const { status, body } = await fetchJson(`${BASE}/api/indexer/run/`, {
    method: 'POST',
    headers: reqHeaders,
    signal: AbortSignal.timeout(120_000),
  })

  const coverageAfter = await fetchCoverage()
  const healthAfter = await fetchHealth()
  const clean =
    status === 200 &&
    !body.skipped &&
    body.ok !== false &&
    (body.elapsedMs ?? 0) < (body.budgetMs ?? 55_000) + 30_000

  return {
    run: n,
    timestamp: new Date().toISOString(),
    httpStatus: status,
    skipped: Boolean(body.skipped),
    skipReason: body.reason ?? null,
    ok: clean,
    elapsedMs: Date.now() - started,
    lockState: body.lockState ?? healthAfter.lockState,
    lockOwner: body.lockOwner ?? healthAfter.lockOwner,
    adaptiveTelemetry: body.adaptiveTelemetry ?? body.featured?.adaptiveTelemetry ?? null,
    gapRangesProcessed: body.gapRangesProcessed,
    featuredBootstrapComplete: body.featuredBootstrapComplete,
    coverageBefore: coverageBefore?.bootstrapWindow,
    coverageAfter: coverageAfter?.bootstrapWindow,
    healthBefore: {
      lastIndexedBlock: healthBefore.lastIndexedBlock,
      lockState: healthBefore.lockState,
    },
    healthAfter: {
      lastIndexedBlock: healthAfter.lastIndexedBlock,
      lockState: healthAfter.lockState,
      lastOrchestratorRun: healthAfter.lastOrchestratorRun,
    },
    raw: body,
  }
}

async function main() {
  await mkdir(path.dirname(OUT_RUNS), { recursive: true })
  const runs = []
  let n = 0
  while (n < MAX_RUNS) {
    n += 1
    const row = await runOnce(n)
    if (row.skipped) {
      console.log(`[r790-indexer] run ${n} skipped (${row.skipReason}); waiting for lease expiry`)
      await sleep(95_000)
      const retry = await runOnce(n)
      runs.push(retry)
      console.log(
        `[r790-indexer] ${n}/${MAX_RUNS} retry status=${retry.httpStatus} ok=${retry.ok} skipped=${retry.skipped} coverage=${retry.coverageAfter?.coveragePercent?.toFixed(2) ?? '?'}%`,
      )
      if (!retry.ok && !retry.skipped) break
      if (UNTIL_COMPLETE && retry.coverageAfter?.complete) break
      if (n < MAX_RUNS) await sleep(DELAY_MS)
      continue
    }
    runs.push(row)
    console.log(
      `[r790-indexer] ${n}/${MAX_RUNS} status=${row.httpStatus} ok=${row.ok} skipped=${row.skipped} coverage=${row.coverageAfter?.coveragePercent?.toFixed(2) ?? '?'}% blocks=${row.coverageAfter?.coveredBlocks ?? '?'}`,
    )
    if (!row.ok && !row.skipped) break
    if (UNTIL_COMPLETE && row.coverageAfter?.complete) break
    if (n < MAX_RUNS) await sleep(DELAY_MS)
  }

  const finalCoverage = await fetchCoverage()
  const finalHealth = await fetchHealth()
  const cleanRuns = runs.filter((r) => r.ok).length
  const blocksAdvanced =
    (runs[runs.length - 1]?.coverageAfter?.coveredBlocks ?? 0) -
    (runs[0]?.coverageBefore?.coveredBlocks ?? 0)

  const report = {
    mission: 'R790',
    base: BASE,
    capturedAt: new Date().toISOString(),
    repositorySha: process.env.R790_REPO_SHA ?? 'unknown',
    requestedRuns: RUNS,
    maxRuns: MAX_RUNS,
    completedRuns: runs.length,
    cleanSequentialRuns: cleanRuns,
    blocksAdvanced,
    runs,
    finalCoverage,
    finalHealth,
  }
  await writeFile(OUT_RUNS, JSON.stringify(report, null, 2))
  await writeFile(OUT_COVERAGE, JSON.stringify({ capturedAt: report.capturedAt, ...finalCoverage }, null, 2))
  await writeFile(
    OUT_LOCK,
    JSON.stringify(
      {
        capturedAt: report.capturedAt,
        lockObservations: runs.map((r) => ({
          run: r.run,
          lockState: r.lockState,
          lockOwner: r.lockOwner,
          skipped: r.skipped,
        })),
        finalHealth: {
          lockState: finalHealth.lockState,
          lockOwner: finalHealth.lockOwner,
          lockExpiresAt: finalHealth.lockExpiresAt,
        },
      },
      null,
      2,
    ),
  )
  console.log(
    JSON.stringify({
      clean: cleanRuns,
      blocksAdvanced,
      coveragePercent: finalCoverage?.bootstrapWindow?.coveragePercent,
      complete: finalCoverage?.bootstrapWindow?.complete,
    }),
  )
  process.exit(cleanRuns >= Math.min(RUNS, runs.length) && !runs.some((r) => r.httpStatus === 504) ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
