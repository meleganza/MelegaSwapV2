#!/usr/bin/env node
/**
 * R789 — fetch and persist production API baseline payloads.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r789-production-api-baseline.json')
const BASE = process.env.R789_BASE || 'https://www.melega.finance'
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'

const ENDPOINTS = [
  ['readiness', '/api/runtime/readiness'],
  ['indexerHealth', '/api/indexer/health'],
  ['indexerCoverage', '/api/indexer/coverage'],
  ['indexerEvents', '/api/indexer/events?limit=20'],
  ['tierMetrics', '/api/indexer/tier-metrics'],
  ['storeConsistency', '/api/indexer/store-consistency'],
  ['pairs', '/api/indexer/pairs?pageSize=50&classification=tradeable'],
  ['candlesMarcoWbnb', '/api/indexer/candles?pair=0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e&interval=1H'],
  ['runtimeSwaps', '/api/runtime/swaps?slug=marco-wbnb'],
  ['protocolActivity', '/api/protocol/activity?limit=40'],
  ['masterchefEmission', '/api/masterchef/emission'],
  ['poolsClassification', '/api/pools/classification'],
]

const headers = {
  'x-vercel-protection-bypass': BYPASS,
  accept: 'application/json',
}

async function fetchEndpoint([key, pathSuffix]) {
  const url = `${BASE}${pathSuffix}`
  const started = Date.now()
  try {
    const res = await fetch(url, { headers, redirect: 'follow' })
    const text = await res.text()
    let json = null
    try {
      json = JSON.parse(text)
    } catch {
      json = { _raw: text.slice(0, 500) }
    }
    return {
      key,
      url,
      status: res.status,
      ok: res.ok,
      elapsedMs: Date.now() - started,
      body: json,
    }
  } catch (e) {
    return {
      key,
      url,
      status: 0,
      ok: false,
      elapsedMs: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

async function main() {
  await mkdir(path.dirname(OUT), { recursive: true })
  const results = await Promise.all(ENDPOINTS.map(fetchEndpoint))
  const report = {
    mission: 'R789',
    host: BASE,
    capturedAt: new Date().toISOString(),
    repositorySha: process.env.R789_REPO_SHA || '5d718c99',
    endpoints: Object.fromEntries(results.map((r) => [r.key, r])),
    summary: {
      ok: results.filter((r) => r.ok).length,
      total: results.length,
      failed: results.filter((r) => !r.ok).map((r) => r.key),
    },
  }
  await writeFile(OUT, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report.summary, null, 2))
  process.exit(report.summary.failed.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
