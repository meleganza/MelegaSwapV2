#!/usr/bin/env node
/**
 * R787 — SmartChef 242-contract classification artifact.
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r787-smartchef-classification.json')
const BASE = process.env.R787_BASE || 'http://localhost:3000'
const BYPASS = process.env.VERCEL_BYPASS || ''

const headers = BYPASS ? { 'x-vercel-protection-bypass': BYPASS } : {}

const res = await fetch(`${BASE}/api/pools/classification`, { headers })
if (!res.ok) {
  console.error('classification fetch failed', res.status)
  process.exit(1)
}
const json = await res.json()
await writeFile(OUT, JSON.stringify(json, null, 2))
console.log('wrote', OUT, 'discovered', json.counts?.discovered, 'rewarding', json.counts?.rewarding)
process.exit(0)
