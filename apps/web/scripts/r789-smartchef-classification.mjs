#!/usr/bin/env node
/**
 * R789 — SmartChef 242-contract classification artifact from production.
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r789-smartchef-classification.json')
const BASE = (process.env.R789_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'

const headers = { 'x-vercel-protection-bypass': BYPASS, accept: 'application/json' }

const res = await fetch(`${BASE}/api/pools/classification`, { headers })
const json = await res.json().catch(() => ({}))
const report = {
  mission: 'R789',
  base: BASE,
  capturedAt: new Date().toISOString(),
  httpStatus: res.status,
  ok: res.ok,
  counts: json.counts ?? null,
  candidates: json.candidates ?? json.results ?? [],
  raw: json,
}
await writeFile(OUT, JSON.stringify(report, null, 2))
console.log(
  'wrote',
  OUT,
  'status',
  res.status,
  'discovered',
  report.counts?.discovered ?? report.counts?.candidates ?? '?',
  'rewarding',
  report.counts?.rewarding ?? '?',
)
process.exit(res.ok && (report.counts?.discovered ?? 0) > 0 ? 0 : 1)
