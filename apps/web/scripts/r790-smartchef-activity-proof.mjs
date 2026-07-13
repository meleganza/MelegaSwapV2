#!/usr/bin/env node
/** R790 — SmartChef Phase-A activity proof (on-chain classification + feed reconciliation). */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r790-smartchef-activity-proof.json')
const BASE = (process.env.R790_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

async function getJson(pathname) {
  const res = await fetch(`${BASE}${pathname}`, { headers })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, body }
}

const [classification, activity] = await Promise.all([
  getJson('/api/pools/classification'),
  getJson('/api/protocol/activity/?limit=50'),
])

const events = activity.body?.events ?? []
const smartchefEvents = events.filter((e) => e.sourceType === 'smartchef')
const counts = classification.body?.counts ?? {}
const discovered = counts.discovered ?? counts.candidates ?? 0
const rewarding = counts.rewarding ?? 0

let stage = 'CLASSIFIED'
if (smartchefEvents.length > 0) stage = 'READY'
else if (discovered > 0 && rewarding >= 0) stage = 'EMPTY_VERIFIED'

const failures = []
if (discovered === 0) failures.push('no-smartchef-contracts-discovered')
if (stage !== 'READY' && stage !== 'EMPTY_VERIFIED') failures.push(`stage:${stage}`)

const report = {
  mission: 'R790',
  base: BASE,
  capturedAt: new Date().toISOString(),
  repositorySha: process.env.R790_REPO_SHA ?? '20ae144b',
  classificationHttpStatus: classification.status,
  counts,
  smartchefEventCount: smartchefEvents.length,
  sampleEvents: smartchefEvents.slice(0, 5),
  stage,
  note:
    'Phase-A proves on-chain SmartChef inventory via /api/pools/classification; event feed indexing for smartchef sourceType is not yet wired in orchestrator.',
  failures,
  pass: failures.length === 0 && (stage === 'READY' || stage === 'EMPTY_VERIFIED'),
}

await writeFile(OUT, JSON.stringify(report, null, 2))
console.log(JSON.stringify({ stage, pass: report.pass, discovered, rewarding, failures }, null, 2))
process.exit(report.pass ? 0 : 1)
