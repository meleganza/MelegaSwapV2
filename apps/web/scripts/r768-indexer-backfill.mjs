#!/usr/bin/env node
/** R768 — Historical backfill via protected /api/indexer/run (run outside Vercel cron limits). */
const maxRuns = Number(process.env.INDEXER_BACKFILL_MAX_RUNS || 20)
const delayMs = Number(process.env.INDEXER_BACKFILL_DELAY_MS || 2000)
const baseUrl = (process.env.INDEXER_RUN_URL || 'http://localhost:3000').replace(/\/$/, '')
const secret = process.env.INDEXER_CRON_SECRET || process.env.CRON_SECRET

async function runOnce() {
  const res = await fetch(`${baseUrl}/api/indexer/run`, {
    method: 'POST',
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.reason || json.error || `HTTP ${res.status}`)
  return json
}

async function main() {
  if (!secret) {
    console.warn('[r768-backfill] INDEXER_CRON_SECRET not set — endpoint may reject unauthorized runs')
  }
  console.log(`[r768-backfill] target=${baseUrl}/api/indexer/run maxRuns=${maxRuns}`)
  for (let i = 0; i < maxRuns; i += 1) {
    try {
      const result = await runOnce()
      const cp = result.checkpoint || {}
      console.log(
        `[r768-backfill] pass ${i + 1}/${maxRuns} added=${result.addedEvents ?? 0} block=${cp.lastIndexedBlock ?? '?'} status=${result.health?.status ?? '?'}`,
      )
      if ((result.addedEvents ?? 0) === 0 && (result.health?.indexingLag ?? 1) === 0) {
        console.log('[r768-backfill] caught up — stopping early')
        break
      }
    } catch (e) {
      console.error('[r768-backfill] failed:', e instanceof Error ? e.message : e)
      process.exitCode = 1
      break
    }
    await new Promise((r) => setTimeout(r, delayMs))
  }
}

main()
