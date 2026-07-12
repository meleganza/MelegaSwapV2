#!/usr/bin/env node
/**
 * R789 — Tier-1/Tier-2 production population artifact.
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r789-tier-population.json')
const BASE = (process.env.R789_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

async function getJson(pathname) {
  const res = await fetch(`${BASE}${pathname}`, { headers })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, body }
}

const [pairs, tierMetrics, coverage, events] = await Promise.all([
  getJson('/api/indexer/pairs'),
  getJson('/api/indexer/tier-metrics'),
  getJson('/api/indexer/coverage?slug=marco-wbnb'),
  getJson('/api/indexer/events?slug=marco-wbnb&limit=50'),
])

const metricRows = tierMetrics.body?.rows ?? []
const tier1Metrics = metricRows.filter((p) => p.tier === 'TIER_1' || p.tier === 1)
const tier2Metrics = metricRows.filter((p) => p.tier === 'TIER_2' || p.tier === 2)

const summarizeMetric = (p) => ({
  slug: p.slug,
  pairAddress: p.pairAddress,
  token0: p.token0,
  token1: p.token1,
  tier: p.tier,
  status: p.status,
  volume24h: p.volume24hQuote,
  trades24h: p.tradeCount24h,
  candleCount: p.candleCount,
  eventCount24h: p.eventCount24h,
  indexingLag: p.indexingLag,
})

const report = {
  mission: 'R789',
  base: BASE,
  capturedAt: new Date().toISOString(),
  repositorySha: process.env.R789_REPO_SHA ?? '798fce59',
  marcoWbnbCoverage: coverage.body,
  marcoWbnbEvents: {
    status: events.status,
    count: events.body?.events?.length ?? events.body?.count,
    sample: (events.body?.events ?? []).slice(0, 5),
  },
  tierMetrics: tierMetrics.body,
  tier1: tier1Metrics.map(summarizeMetric),
  tier2: tier2Metrics.map(summarizeMetric),
  gates: {
    marcoPopulated: Boolean((events.body?.events ?? []).length > 0),
    tier1Scanned: tier1Metrics.filter((p) => p.status && p.status !== 'UNSCANNED').length,
    tier2Scanned: tier2Metrics.filter((p) => p.status && p.status !== 'UNSCANNED').length,
    tier2ScannedMinimum: tier2Metrics.filter((p) => p.status && p.status !== 'UNSCANNED').length >= 3,
  },
}
await writeFile(OUT, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report.gates, null, 2))
