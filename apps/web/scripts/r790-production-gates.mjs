#!/usr/bin/env node
/**
 * R790 — production data gate checks.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = (process.env.R790_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

async function get(pathname) {
  const res = await fetch(`${BASE}${pathname}`, { headers })
  return res.json()
}

const [coverage, tierMetrics, protocolActivity, health] = await Promise.all([
  get('/api/indexer/coverage/'),
  get('/api/indexer/tier-metrics/'),
  get('/api/protocol/activity/?limit=5'),
  get('/api/indexer/health/'),
])

const tier2 = (tierMetrics.rows ?? []).filter((r) => r.tier === 'TIER_2')
const unscanned = tier2.filter((r) => r.status === 'UNSCANNED')
const gates = {
  bootstrapComplete: Boolean(coverage.bootstrapWindow?.complete),
  coveragePercent: coverage.bootstrapWindow?.coveragePercent ?? 0,
  tier1Count: (tierMetrics.rows ?? []).filter((r) => r.tier === 'TIER_1').length,
  tier2Count: tier2.length,
  tier2Unscanned: unscanned.length,
  protocolActivityCount: protocolActivity.count ?? 0,
  lockState: health.lockState,
  leaseVisible: health.lockState !== undefined,
}

const failures = []
if (!gates.bootstrapComplete) failures.push('bootstrap-not-complete')
if (gates.tier2Unscanned > 0) failures.push(`tier2-unscanned:${gates.tier2Unscanned}`)
if (!gates.leaseVisible) failures.push('lease-not-exposed')

const report = {
  mission: 'R790',
  capturedAt: new Date().toISOString(),
  base: BASE,
  gates,
  failures,
  pass: failures.length === 0,
}
const out = path.join(__dirname, '../docs/runtime/r790-production-reconciliation.json')
await writeFile(out, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
process.exit(report.pass ? 0 : 1)
