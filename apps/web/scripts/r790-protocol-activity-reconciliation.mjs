#!/usr/bin/env node
/** R790 — Canonical merged protocol activity feed reconciliation. */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r790-protocol-activity-reconciliation.json')
const BASE = (process.env.R790_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

async function getJson(pathname) {
  const res = await fetch(`${BASE}${pathname}`, { headers })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, elapsedMs: 0, body }
}

const started = Date.now()
const activity = await getJson('/api/protocol/activity/?limit=100')
activity.elapsedMs = Date.now() - started

const events = activity.body?.events ?? []
const bySource = { amm: 0, masterchef: 0, smartchef: 0 }
const dedupKeys = new Set()
const duplicateKeys = []

for (const e of events) {
  bySource[e.sourceType] = (bySource[e.sourceType] ?? 0) + 1
  const key = `${e.chainId ?? 56}:${e.transactionHash}:${e.logIndex}`
  if (dedupKeys.has(key)) duplicateKeys.push(key)
  dedupKeys.add(key)
}

const failures = []
if (activity.status !== 200) failures.push(`http-${activity.status}`)
if (duplicateKeys.length > 0) failures.push(`duplicate-keys:${duplicateKeys.length}`)

const report = {
  mission: 'R790',
  base: BASE,
  capturedAt: new Date().toISOString(),
  repositorySha: process.env.R790_REPO_SHA ?? '20ae144b',
  httpStatus: activity.status,
  elapsedMs: activity.elapsedMs,
  count: activity.body?.count ?? events.length,
  bySource,
  dedupPolicy: 'chainId:transactionHash:logIndex',
  duplicateKeyCount: duplicateKeys.length,
  sample: events.slice(0, 10),
  failures,
  pass: failures.length === 0,
}

await writeFile(OUT, JSON.stringify(report, null, 2))
console.log(JSON.stringify({ pass: report.pass, count: report.count, bySource, failures }, null, 2))
process.exit(report.pass ? 0 : 1)
