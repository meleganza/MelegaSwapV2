#!/usr/bin/env node
/** R791A — indexer convergence evidence only (no UI). Max 5 sequential production runs. */
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveIndexerRunAuthHeaders } from './indexerRunAuth.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r791a-indexer-convergence.json')
const BASE = (process.env.R791A_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const MAX_RUNS = 5
const RUNS = Math.min(MAX_RUNS, Math.max(1, Number(process.env.R791A_RUNS || MAX_RUNS)))
const REPO_SHA = process.env.R791A_REPO_SHA || 'unknown'
const READ_TIMEOUT_MS = 30_000
const RUN_TIMEOUT_MS = 300_000
const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

function runAuthHeaders() {
  return resolveIndexerRunAuthHeaders(headers)
}

async function getJson(url, init, timeoutMs = READ_TIMEOUT_MS) {
  const res = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(timeoutMs),
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

function isUnexpectedStatus(status) {
  return status === 504 || status < 200 || status >= 300
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function isLeaseHeldByOther(body) {
  return (
    body?.reason === 'LEASE_ACTIVE_BY_OTHER_WORKER' ||
    body?.reason === 'lease-held-by-other' ||
    body?.lockHealth === 'healthy'
  )
}

async function main() {
  await mkdir(path.dirname(OUT), { recursive: true })
  const baseline = await getJson(`${BASE}/api/indexer/coverage/`)
  if (isUnexpectedStatus(baseline.status)) {
    throw new Error(`Baseline coverage HTTP ${baseline.status}`)
  }
  const baselineHealth = await getJson(`${BASE}/api/indexer/health/`)
  if (isUnexpectedStatus(baselineHealth.status)) {
    throw new Error(`Baseline health HTTP ${baselineHealth.status}`)
  }

  const runs = []

  for (let n = 1; n <= RUNS; n += 1) {
    const healthBefore = await getJson(`${BASE}/api/indexer/health/`)
    if (isUnexpectedStatus(healthBefore.status)) {
      throw new Error(`Run ${n} health-before HTTP ${healthBefore.status}`)
    }
    if (healthBefore.body?.lockState === 'held' && healthBefore.body?.lockHealth === 'healthy') {
      runs.push({
        run: n,
        timestamp: new Date().toISOString(),
        httpStatus: 200,
        skipped: true,
        skipReason: 'LEASE_ACTIVE_BY_OTHER_WORKER',
        ok: false,
        elapsedMs: 0,
        lockState: healthBefore.body.lockState,
        lockOwner: healthBefore.body.lockOwner,
        lockHealth: healthBefore.body.lockHealth,
        preflightExit: true,
      })
      console.log(`[r791a] ${n}/${RUNS} preflight exit — healthy lease held by ${healthBefore.body.lockOwner}`)
      break
    }

    const covBefore = await getJson(`${BASE}/api/indexer/coverage/`)
    if (isUnexpectedStatus(covBefore.status)) {
      throw new Error(`Run ${n} coverage-before HTTP ${covBefore.status}`)
    }

    const started = Date.now()
    const run = await getJson(
      `${BASE}/api/indexer/run/?budget=full`,
      { method: 'POST', headers: runAuthHeaders() },
      RUN_TIMEOUT_MS,
    )

    if (isUnexpectedStatus(run.status)) {
      runs.push({
        run: n,
        timestamp: new Date().toISOString(),
        httpStatus: run.status,
        skipped: false,
        ok: false,
        elapsedMs: Date.now() - started,
        error: `Unexpected HTTP ${run.status}`,
      })
      break
    }

    const covAfter = await getJson(`${BASE}/api/indexer/coverage/`)
    if (isUnexpectedStatus(covAfter.status)) {
      throw new Error(`Run ${n} coverage-after HTTP ${covAfter.status}`)
    }

    const healthAfter = await getJson(`${BASE}/api/indexer/health/`)
    if (isUnexpectedStatus(healthAfter.status)) {
      throw new Error(`Run ${n} health-after HTTP ${healthAfter.status}`)
    }

    const row = {
      run: n,
      timestamp: new Date().toISOString(),
      httpStatus: run.status,
      skipped: Boolean(run.body.skipped),
      skipReason: run.body.reason ?? null,
      ok: run.status === 200 && !run.body.skipped && run.body.ok !== false,
      elapsedMs: Date.now() - started,
      budgetMs: run.body.budgetMs,
      lockState: run.body.lockState ?? healthAfter.body?.lockState,
      lockOwner: run.body.lockOwner ?? healthAfter.body?.lockOwner,
      scannedBlocks: run.body.adaptiveTelemetry?.scannedBlockCount,
      effectiveBps: run.body.adaptiveTelemetry?.effectiveBlocksPerSecond,
      gapRangesProcessed: run.body.gapRangesProcessed,
      featuredBootstrapComplete: run.body.featuredBootstrapComplete,
      pairJobsProcessed: run.body.pairJobsProcessed,
      coverageBefore: covBefore.body?.bootstrapWindow,
      coverageAfter: covAfter.body?.bootstrapWindow,
      tier1Job: run.body.tier1Job?.slug ?? null,
      tier2Job: run.body.tier2Job?.slug ?? null,
    }
    runs.push(row)
    console.log(
      `[r791a] ${n}/${RUNS} status=${row.httpStatus} ok=${row.ok} skipped=${row.skipped} coverage=${row.coverageAfter?.coveragePercent?.toFixed(2) ?? '?'}%`,
    )

    if (row.coverageAfter?.complete) break
    if (n >= RUNS) break
    if (isLeaseHeldByOther(run.body)) {
      console.log(`[r791a] ${n}/${RUNS} exit — ${run.body.reason ?? 'healthy lease active'}`)
      break
    }
    if (row.skipped) break
    await sleep(10_000)
  }

  const finalCoverage = await getJson(`${BASE}/api/indexer/coverage/`)
  if (isUnexpectedStatus(finalCoverage.status)) {
    throw new Error(`Final coverage HTTP ${finalCoverage.status}`)
  }
  const finalHealth = await getJson(`${BASE}/api/indexer/health/`)
  if (isUnexpectedStatus(finalHealth.status)) {
    throw new Error(`Final health HTTP ${finalHealth.status}`)
  }
  const finalTier = await getJson(`${BASE}/api/indexer/tier-metrics/`)
  if (isUnexpectedStatus(finalTier.status)) {
    throw new Error(`Final tier-metrics HTTP ${finalTier.status}`)
  }

  const tier1 = (finalTier.body?.rows ?? []).filter((r) => r.tier === 'TIER_1')
  const tier2 = (finalTier.body?.rows ?? []).filter((r) => r.tier === 'TIER_2')

  const report = {
    mission: 'R791A',
    repositorySha: REPO_SHA,
    base: BASE,
    capturedAt: new Date().toISOString(),
    maxRuns: MAX_RUNS,
    requestedRuns: RUNS,
    baseline: {
      coverage: baseline.body?.bootstrapWindow,
      budgetMs: baselineHealth.body?.lastOrchestratorRun?.budgetMs,
    },
    runs,
    summary: {
      completedRuns: runs.length,
      cleanRuns: runs.filter((r) => r.ok).length,
      http504: runs.filter((r) => r.httpStatus === 504).length,
      skipped: runs.filter((r) => r.skipped).length,
      coverageStart: baseline.body?.bootstrapWindow?.coveragePercent,
      coverageEnd: finalCoverage.body?.bootstrapWindow?.coveragePercent,
      coveredBlocksStart: baseline.body?.bootstrapWindow?.coveredBlocks,
      coveredBlocksEnd: finalCoverage.body?.bootstrapWindow?.coveredBlocks,
      blocksAdvanced:
        (finalCoverage.body?.bootstrapWindow?.coveredBlocks ?? 0) -
        (baseline.body?.bootstrapWindow?.coveredBlocks ?? 0),
      bootstrapComplete: Boolean(finalCoverage.body?.bootstrapWindow?.complete),
    },
    finalCoverage: finalCoverage.body,
    finalHealth: {
      lockState: finalHealth.body?.lockState,
      lastOrchestratorRun: finalHealth.body?.lastOrchestratorRun,
    },
    tierPopulation: {
      tier1: tier1.map((r) => ({ slug: r.slug, status: r.status })),
      tier2Unscanned: tier2.filter((r) => r.status === 'UNSCANNED').length,
      tier2Total: tier2.length,
    },
  }

  await writeFile(OUT, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report.summary, null, 2))
  process.exit(report.summary.http504 > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
