import type { NextApiHandler } from 'next'
import { MARCO_WBNB_PAIR_BSC, SWAP_TOPIC } from 'lib/bsc-indexer/constants'
import { getBlockNumber, rpcCallWithFailover, resolveIndexerLogRpcUrls } from 'lib/bsc-indexer/rpc/chunkedLogs'
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
  const rpcUrls = resolveIndexerLogRpcUrls()
  let primaryRpc: { ok: boolean; chainHead?: number; reason?: string } = { ok: false }
  let fallbackRpc: { ok: boolean; chainHead?: number; reason?: string } = { ok: false }
  const logProbe: Record<string, unknown> = {}

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

  try {
    type BlockHeader = { hash: string; number: string }
    const { result: latest, url: latestUrl } = await rpcCallWithFailover<BlockHeader>(
      'eth_getBlockByNumber',
      ['latest', false],
      rpcUrls,
    )
    const withAddress = await rpcCallWithFailover<unknown[]>(
      'eth_getLogs',
      [{ blockHash: latest.hash, address: MARCO_WBNB_PAIR_BSC, topics: [SWAP_TOPIC] }],
      rpcUrls,
    ).catch((e) => ({ error: e instanceof Error ? e.message : String(e) }))
    const withoutAddress = await rpcCallWithFailover<unknown[]>(
      'eth_getLogs',
      [{ blockHash: latest.hash, topics: [SWAP_TOPIC] }],
      rpcUrls,
    ).catch((e) => ({ error: e instanceof Error ? e.message : String(e) }))
    logProbe.latestBlock = parseInt(latest.number, 16)
    logProbe.latestUrl = latestUrl
    logProbe.withAddress = 'error' in withAddress ? withAddress : { count: (withAddress as { result: unknown[] }).result.length, url: (withAddress as { url: string }).url }
    logProbe.withoutAddress = 'error' in withoutAddress ? withoutAddress : { count: (withoutAddress as { result: unknown[] }).result.length, url: (withoutAddress as { url: string }).url }
  } catch (e) {
    logProbe.error = e instanceof Error ? e.message : 'Log probe failed'
  }

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    blob,
    rpc: {
      primary: primaryRpc,
      fallback: fallbackRpc,
      logProbe,
    },
  })
}

export default handler
