#!/usr/bin/env node
/** R791A.6a — single authenticated probe for /api/indexer/run (no batch). */
import { resolveIndexerRunAuthHeaders } from './indexerRunAuth.mjs'

const BASE = (process.env.R791A_BASE || 'https://www.melega.finance').replace(/\/$/, '')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'

const res = await fetch(`${BASE}/api/indexer/run/?budget=full`, {
  method: 'POST',
  headers: resolveIndexerRunAuthHeaders({ 'x-vercel-protection-bypass': BYPASS }),
  signal: AbortSignal.timeout(60_000),
})

const body = await res.json().catch(() => ({}))
console.log(JSON.stringify({ httpStatus: res.status, skipped: body.skipped ?? null, reason: body.reason ?? null, ok: body.ok ?? null }))

process.exit(res.status === 401 ? 1 : 0)
