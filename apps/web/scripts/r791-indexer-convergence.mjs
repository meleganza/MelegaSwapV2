#!/usr/bin/env node
/** R791 P1 — sequential production indexer convergence batches. */
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r791-indexer-convergence.json')
const BASE = (process.env.R791_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const BATCH = Number(process.env.R791_BATCH_SIZE || 5)
const MAX_BATCHES = Number(process.env.R791_MAX_BATCHES || 12)
const DELAY_MS = Number(process.env.R791_DELAY_MS || 120_000)
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
  const batches = []
  let complete = false
  for (let b = 1; b <= MAX_BATCHES && !complete; b += 1) {
    const batchRuns = []
    for (let i = 1; i <= BATCH; i += 1) {
      const covBefore = await getJson(`${BASE}/api/indexer/coverage/`)
      const started = Date.now()
      const run = await getJson(`${BASE}/api/indexer/run/?budget=full`, {
        method: 'POST',
        headers: { 'x-vercel-cron': '1' },
        signal: AbortSignal.timeout(300_000),
      })
      const covAfter = await getJson(`${BASE}/api/indexer/coverage/`)
      const row = {
        batch: b,
        run: i,
        httpStatus: run.status,
        skipped: Boolean(run.body.skipped),
        ok: run.status === 200 && !run.body.skipped && run.body.ok !== false,
        elapsedMs: Date.now() - started,
        budgetMs: run.body.budgetMs,
        scannedBlocks: run.body.adaptiveTelemetry?.scannedBlockCount,
        coverageBefore: covBefore.body?.bootstrapWindow?.coveragePercent,
        coverageAfter: covAfter.body?.bootstrapWindow?.coveragePercent,
        complete: covAfter.body?.bootstrapWindow?.complete,
      }
      batchRuns.push(row)
      console.log(
        `[r791-p1] batch ${b}/${MAX_BATCHES} run ${i}/${BATCH} ok=${row.ok} coverage=${row.coverageAfter?.toFixed(2)}%`,
      )
      if (row.complete) {
        complete = true
        break
      }
      if (row.skipped) await sleep(95_000)
      else await sleep(8_000)
    }
    const finalCov = await getJson(`${BASE}/api/indexer/coverage/`)
    batches.push({
      batch: b,
      runs: batchRuns,
      coverage: finalCov.body?.bootstrapWindow,
      protocolActivity: (await getJson(`${BASE}/api/protocol/activity/?limit=5`)).body?.count ?? 0,
      tierUnscanned: (
        (await getJson(`${BASE}/api/indexer/tier-metrics/`)).body?.rows ?? []
      ).filter((r) => r.tier === 'TIER_2' && r.status === 'UNSCANNED').length,
    })
    complete = Boolean(finalCov.body?.bootstrapWindow?.complete)
    if (!complete && b < MAX_BATCHES) await sleep(DELAY_MS)
  }
  const report = {
    mission: 'R791-P1',
    capturedAt: new Date().toISOString(),
    base: BASE,
    batches,
    complete,
    finalCoverage: batches[batches.length - 1]?.coverage ?? null,
  }
  await writeFile(OUT, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ complete, coverage: report.finalCoverage?.coveragePercent }))
  process.exit(complete ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
