import type { NextApiHandler } from 'next'
import { getBlockNumber, resolveRpcUrls } from 'lib/bsc-indexer/rpc/chunkedLogs'
import { verifyBlobRoundTrip } from 'lib/bsc-indexer/storage'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization
  const cronSecrets = [process.env.CRON_SECRET, process.env.INDEXER_CRON_SECRET].filter(Boolean)
  const vercelCron = req.headers['x-vercel-cron'] === '1'
  if (!vercelCron && !cronSecrets.some((secret) => auth === `Bearer ${secret}`)) {
    return res.status(401).json({ error: 'Unauthorized smoke test' })
  }

  const blob = await verifyBlobRoundTrip()
  let primaryRpc: { ok: boolean; chainHead?: number; reason?: string } = { ok: false }
  let fallbackRpc: { ok: boolean; chainHead?: number; reason?: string } = { ok: false }

  try {
    const chainHead = await getBlockNumber([process.env.BSC_RPC_URL!].filter(Boolean))
    primaryRpc = { ok: true, chainHead }
  } catch (e) {
    primaryRpc = { ok: false, reason: e instanceof Error ? e.message : 'Primary RPC failed' }
  }

  const fallbackUrl = process.env.BSC_RPC_FALLBACK_URL?.trim()
  if (fallbackUrl) {
    try {
      const chainHead = await getBlockNumber([fallbackUrl])
      fallbackRpc = { ok: true, chainHead }
    } catch (e) {
      fallbackRpc = { ok: false, reason: e instanceof Error ? e.message : 'Fallback RPC failed' }
    }
  } else {
    fallbackRpc = { ok: false, reason: 'BSC_RPC_FALLBACK_URL not configured' }
  }

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    blob,
    rpc: {
      primary: primaryRpc,
      fallback: fallbackRpc,
      configuredUrls: resolveRpcUrls().length,
    },
  })
}

export default handler
