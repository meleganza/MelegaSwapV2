/**
 * Production /api/indexer/run auth headers.
 * Matches run.ts: Bearer INDEXER_CRON_SECRET|CRON_SECRET, or x-vercel-cron: 1.
 */
export function resolveIndexerRunAuthHeaders(extra = {}) {
  const secret = (process.env.INDEXER_CRON_SECRET || process.env.CRON_SECRET || '').trim()
  const headers = { accept: 'application/json', ...extra }
  if (secret.length >= 16) {
    headers.authorization = `Bearer ${secret}`
  } else {
    headers['x-vercel-cron'] = '1'
  }
  return headers
}
