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

const tier1 = (pairs.body?.pairs ?? pairs.body?.rows ?? []).filter((p) => p.tier === 1 || p.tier === '1')
const tier2 = (pairs.body?.pairs ?? pairs.body?.rows ?? []).filter((p) => p.tier === 2 || p.tier === '2')

const summarize = (p) => ({
  slug: p.slug,
  pairAddress: p.pairAddress ?? p.address,
  token0: p.token0,
  token1: p.token1,
  namespace: p.namespace,
  scanStatus: p.scanStatus ?? p.status,
  coverageState: p.coverageState ?? p.coverage?.complete,
  swapCount: p.eventCounts?.Swap ?? p.swapCount,
  mintCount: p.eventCounts?.Mint ?? p.mintCount,
  burnCount: p.eventCounts?.Burn ?? p.burnCount,
  candleCounts: p.candleCounts,
  volume24h: p.volume24h ?? p.volumeUSD24h,
  trades24h: p.trades24h ?? p.tradeCount24h,
  price: p.price,
  priceChange24h: p.priceChange24h,
  latestEvent: p.latestEvent,
  exactStatus: p.exactStatus ?? p.status,
})

const report = {
  mission: 'R789',
  base: BASE,
  capturedAt: new Date().toISOString(),
  marcoWbnbCoverage: coverage.body,
  marcoWbnbEvents: {
    status: events.status,
    count: events.body?.events?.length ?? events.body?.count,
    sample: (events.body?.events ?? []).slice(0, 5),
  },
  tierMetrics: tierMetrics.body,
  tier1: tier1.map(summarize),
  tier2: tier2.map(summarize),
  gates: {
    marcoPopulated: Boolean((events.body?.events ?? []).length > 0),
    tier1Scanned: tier1.filter((p) => (p.scanStatus ?? p.status) && (p.scanStatus ?? p.status) !== 'UNSCANNED').length,
    tier2Scanned: tier2.filter((p) => (p.scanStatus ?? p.status) && (p.scanStatus ?? p.status) !== 'UNSCANNED').length,
  },
}
await writeFile(OUT, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report.gates, null, 2))
