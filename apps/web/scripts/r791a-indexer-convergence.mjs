#!/usr/bin/env node
/** R791A — indexer convergence evidence only (no UI). */
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r791a-indexer-convergence.json')
const BASE = (process.env.R791A_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const RUNS = Number(process.env.R791A_RUNS || 5)
const REPO_SHA = process.env.R791A_REPO_SHA || 'unknown'
const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

async function getJson(url, init) {
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  await mkdir(path.dirname(OUT), { recursive: true })
  const baseline = await getJson(`${BASE}/api/indexer/coverage/`)
  const baselineHealth = await getJson(`${BASE}/api/indexer/health/`)
  const runs = []

  for (let n = 1; n <= RUNS; n += 1) {
    const covBefore = await getJson(`${BASE}/api/indexer/coverage/`)
    const healthBefore = await getJson(`${BASE}/api/indexer/health/`)
    const started = Date.now()
    const run = await getJson(`${BASE}/api/indexer/run/?budget=full`, {
      method: 'POST',
      headers: { 'x-vercel-cron': '1' },
      signal: AbortSignal.timeout(300_000),
    })
    const covAfter = await getJson(`${BASE}/api/indexer/coverage/`)
    const healthAfter = await getJson(`${BASE}/api/indexer/health/`)
    const row = {
      run: n,
      timestamp: new Date().toISOString(),
      httpStatus: run.status,
      skipped: Boolean(run.body.skipped),
      skipReason: run.body.reason ?? null,
      ok: run.status === 200 && !run.body.skipped && run.body.ok !== false && run.status !== 504,
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
      `[r791a] ${n}/${RUNS} status=${row.httpStatus} ok=${row.ok} skipped=${row.skipped} coverage=${row.coverageAfter?.coveragePercent?.toFixed(2)}% scanned=${row.scannedBlocks ?? '?'}`,
    )
    if (row.coverageAfter?.complete) break
    if (row.skipped) await sleep(95_000)
    else await sleep(10_000)
  }

  const finalCoverage = await getJson(`${BASE}/api/indexer/coverage/`)
  const finalHealth = await getJson(`${BASE}/api/indexer/health/`)
  const finalTier = await getJson(`${BASE}/api/indexer/tier-metrics/`)

  const tier1 = (finalTier.body?.rows ?? []).filter((r) => r.tier === 'TIER_1')
  const tier2 = (finalTier.body?.rows ?? []).filter((r) => r.tier === 'TIER_2')

  const report = {
    mission: 'R791A',
    repositorySha: REPO_SHA,
    base: BASE,
    capturedAt: new Date().toISOString(),
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
