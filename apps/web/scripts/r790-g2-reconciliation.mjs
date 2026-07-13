#!/usr/bin/env node
/**
 * R790 — MARCO/WBNB G2 trade reconciliation (rows[] parsing).
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r790-g2-reconciliation.json')
const BASE = (process.env.R790_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

async function getJson(pathname) {
  const res = await fetch(`${BASE}${pathname}`, { headers })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, body }
}

function resolveMarcoRow(body) {
  const row = body?.rows?.find((r) => r.slug === 'marco-wbnb')
  if (!row) throw new Error('MARCO/WBNB row missing from tierMetrics.body.rows')
  return row
}

const [swaps, candles, tierMetrics, storeConsistency, coverage] = await Promise.all([
  getJson('/api/runtime/swaps/?slug=marco-wbnb'),
  getJson('/api/indexer/candles/?slug=marco-wbnb&interval=1H'),
  getJson('/api/indexer/tier-metrics/'),
  getJson('/api/indexer/store-consistency/'),
  getJson('/api/indexer/coverage/?slug=marco-wbnb'),
])

const metrics = resolveMarcoRow(tierMetrics.body)
const swapRows = swaps.body?.transactions ?? []
const candleRows = candles.body?.candles ?? []
const tradeCount24h = metrics.tradeCount24h ?? 0
const volume24hQuote = metrics.volume24hQuote ?? 0
const failures = []
if (metrics.status === 'READY' && swapRows.length === 0 && candleRows.length === 0) {
  failures.push('READY without durable data')
}
if (tradeCount24h > 0 && (metrics.eventCount24h ?? 0) === 0) {
  failures.push('tradeCount24h without eventCount24h')
}
if (volume24hQuote > 0 && !candleRows.some((c) => (c.quoteVolume ?? c.baseVolume ?? 0) > 0)) {
  failures.push('volume24hQuote without candle volume')
}
if (storeConsistency.body?.consistent === false) {
  failures.push('store consistency mismatch')
}

const reconciliation = {
  slug: 'marco-wbnb',
  namespace: 'melega-indexer/v2/featured-pairs/marco-wbnb',
  status: metrics.status,
  tradeCount24h,
  volume24hQuote,
  eventCount24h: metrics.eventCount24h ?? 0,
  swapRowsTotal: swapRows.length,
  swapsIn24hWindow: tradeCount24h,
  candleCount: candleRows.length,
  candleVolumeTotal: candleRows.reduce((s, c) => s + (c.quoteVolume ?? c.baseVolume ?? 0), 0),
  coverageComplete: coverage.body?.bootstrapWindow?.complete ?? false,
  coveragePercent: coverage.body?.bootstrapWindow?.coveragePercent ?? 0,
  storeConsistent: storeConsistency.body?.consistent !== false,
  failures,
  g2Status:
    failures.length > 0
      ? 'FAIL'
      : tradeCount24h > 0 && swapRows.length > 0 && candleRows.length >= 1
        ? 'READY'
        : tradeCount24h === 0 && swapRows.length === 0 && candleRows.length === 0
          ? 'EMPTY_VERIFIED'
          : 'PARTIAL',
}

const report = {
  mission: 'R790',
  base: BASE,
  capturedAt: new Date().toISOString(),
  repositorySha: process.env.R790_REPO_SHA ?? 'unknown',
  production: {
    swaps: swaps.body,
    candles: candles.body,
    tierMetrics: tierMetrics.body,
    storeConsistency: storeConsistency.body,
    coverage: coverage.body,
  },
  reconciliation,
  g2Pass: reconciliation.g2Status === 'READY' || reconciliation.g2Status === 'EMPTY_VERIFIED',
}

await writeFile(OUT, JSON.stringify(report, null, 2))
console.log(JSON.stringify({ g2Status: reconciliation.g2Status, g2Pass: report.g2Pass, failures }, null, 2))
process.exit(reconciliation.g2Status === 'FAIL' ? 1 : 0)
