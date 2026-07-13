#!/usr/bin/env node
/** R790 — Tier 1/2 explicit state artifact with coverage honesty checks. */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r790-tier-classification.json')
const BASE = (process.env.R790_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

async function getJson(pathname) {
  const res = await fetch(`${BASE}${pathname}`, { headers })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, body }
}

const [tierMetrics, coverage, health] = await Promise.all([
  getJson('/api/indexer/tier-metrics/'),
  getJson('/api/indexer/coverage/'),
  getJson('/api/indexer/health/'),
])

const rows = tierMetrics.body?.rows ?? []
const tier1 = rows.filter((r) => r.tier === 'TIER_1')
const tier2 = rows.filter((r) => r.tier === 'TIER_2')
const unscanned = rows.filter((r) => r.status === 'UNSCANNED')
const emptyVerified = rows.filter((r) => r.status === 'EMPTY_VERIFIED')
const bootstrapComplete = Boolean(coverage.body?.bootstrapWindow?.complete)

const suspiciousEmpty = emptyVerified.filter((r) => !bootstrapComplete && r.slug !== 'marco-wbnb')

const report = {
  mission: 'R790',
  base: BASE,
  capturedAt: new Date().toISOString(),
  repositorySha: process.env.R790_REPO_SHA ?? '20ae144b',
  bootstrapWindow: coverage.body?.bootstrapWindow ?? null,
  featuredBootstrapComplete: health.body?.lastOrchestratorRun?.featuredBootstrapComplete ?? false,
  tier1: tier1.map((r) => ({ slug: r.slug, status: r.status, tradeCount24h: r.tradeCount24h, volume24hQuote: r.volume24hQuote })),
  tier2: tier2.map((r) => ({ slug: r.slug, status: r.status, tradeCount24h: r.tradeCount24h, volume24hQuote: r.volume24hQuote })),
  gates: {
    tier1Count: tier1.length,
    tier2Count: tier2.length,
    tier1Explicit: tier1.every((r) => r.status && r.status !== 'UNSCANNED'),
    tier2Explicit: tier2.every((r) => r.status && r.status !== 'UNSCANNED'),
    tier2Unscanned: unscanned.filter((r) => r.tier === 'TIER_2').length,
    emptyVerifiedWithoutBootstrap: suspiciousEmpty.length,
  },
  failures: [],
}

if (tier1.length !== 6) report.failures.push(`tier1-count:${tier1.length}`)
if (tier2.length !== 12) report.failures.push(`tier2-count:${tier2.length}`)
if (report.gates.tier2Unscanned > 0) report.failures.push(`tier2-unscanned:${report.gates.tier2Unscanned}`)
if (suspiciousEmpty.length > 0) {
  report.failures.push(`empty-verified-before-bootstrap:${suspiciousEmpty.map((r) => r.slug).join(',')}`)
}

report.pass =
  report.failures.length === 0 &&
  report.gates.tier1Explicit &&
  report.gates.tier2Explicit &&
  report.gates.tier2Unscanned === 0

await writeFile(OUT, JSON.stringify(report, null, 2))
console.log(JSON.stringify({ pass: report.pass, failures: report.failures, tier2Unscanned: report.gates.tier2Unscanned }, null, 2))
process.exit(report.pass ? 0 : 1)
