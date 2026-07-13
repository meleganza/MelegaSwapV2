#!/usr/bin/env node
/** R790 — MasterChef protocol activity proof from production APIs + health telemetry. */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r790-masterchef-activity-proof.json')
const BASE = (process.env.R790_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

async function getJson(pathname) {
  const res = await fetch(`${BASE}${pathname}`, { headers })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, body }
}

const [activity, health, coverage] = await Promise.all([
  getJson('/api/protocol/activity/?limit=20'),
  getJson('/api/indexer/health/'),
  getJson('/api/indexer/coverage/'),
])

const events = activity.body?.events ?? []
const masterchefEvents = events.filter((e) => e.sourceType === 'masterchef')
const bootstrapComplete = Boolean(coverage.body?.bootstrapWindow?.complete)
const protocolRun = health.body?.lastOrchestratorRun?.protocolActivity ?? null
const featuredComplete = Boolean(health.body?.lastOrchestratorRun?.featuredBootstrapComplete)

let stage = 'BLOCKED_BOOTSTRAP'
if (featuredComplete || bootstrapComplete) {
  if (masterchefEvents.length > 0) stage = 'READY'
  else if (protocolRun?.caughtUp || protocolRun?.scannedBlocks > 0) stage = 'EMPTY_VERIFIED'
  else stage = 'SCAN_PENDING'
}

const failures = []
if (!bootstrapComplete && !featuredComplete) failures.push('featured-bootstrap-incomplete')
if (stage === 'SCAN_PENDING') failures.push('no-proved-scan-range')
if (stage === 'BLOCKED_BOOTSTRAP') failures.push('protocol-activity-gated')

const report = {
  mission: 'R790',
  base: BASE,
  capturedAt: new Date().toISOString(),
  repositorySha: process.env.R790_REPO_SHA ?? '20ae144b',
  bootstrapComplete,
  featuredBootstrapComplete: featuredComplete,
  protocolActivityRun: protocolRun,
  activityHttpStatus: activity.status,
  eventCount: activity.body?.count ?? events.length,
  masterchefEventCount: masterchefEvents.length,
  sampleEvents: masterchefEvents.slice(0, 5),
  stage,
  failures,
  pass: stage === 'READY' || stage === 'EMPTY_VERIFIED',
}

await writeFile(OUT, JSON.stringify(report, null, 2))
console.log(JSON.stringify({ stage, pass: report.pass, failures }, null, 2))
process.exit(report.pass ? 0 : 1)
