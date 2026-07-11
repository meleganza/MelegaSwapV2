import type { NextApiHandler } from 'next'
import { MARCO_WBNB_PAIR_BSC, SWAP_TOPIC } from 'lib/bsc-indexer/constants'
import { getBlockNumber, rpcCallWithFailover, resolveLogFetchRpcUrls } from 'lib/bsc-indexer/rpc/chunkedLogs'
import { blockQuantityVariants } from 'lib/bsc-indexer/rpc/blockQuantity'
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
  const logUrls = resolveLogFetchRpcUrls()
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
    const block = primaryRpc.chainHead ?? fallbackRpc.chainHead ?? 0
    const variants = blockQuantityVariants(block)
    const ordered = [variants[variants.length - 1], ...variants.slice(0, -1)].filter(
      (v, i, a) => a.indexOf(v) === i,
    )
    let singleBlock: { result: unknown[]; url: string } | { error: string } = { error: 'no variants' }
    for (const quantity of ordered) {
      try {
        singleBlock = await rpcCallWithFailover<unknown[]>(
          'eth_getLogs',
          [
            {
              fromBlock: quantity,
              toBlock: quantity,
              address: MARCO_WBNB_PAIR_BSC,
              topics: [SWAP_TOPIC],
            },
          ],
          logUrls,
        )
        break
      } catch (e) {
        singleBlock = { error: e instanceof Error ? e.message : String(e) }
      }
    }
    logProbe.singleBlockLogFetch =
      'error' in singleBlock
        ? singleBlock
        : { block, count: singleBlock.result.length, url: singleBlock.url, variants: ordered }
  } catch (e) {
    logProbe.singleBlockLogFetch = { error: e instanceof Error ? e.message : 'single-block log fetch failed' }
  }

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    blob,
    rpc: {
      primary: primaryRpc,
      fallback: fallbackRpc,
      logProbe,
      logFetchOrder: logUrls,
    },
  })
}

export default handler
