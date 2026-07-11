import type { NextApiHandler } from 'next'
import { MARCO_WBNB_PAIR_BSC, SWAP_TOPIC } from 'lib/bsc-indexer/constants'
import { assertIndexerEventTopicsValid } from 'lib/bsc-indexer/eventTopicIntegrity'
import {
  getBlockNumber,
  getProviderHealthSnapshot,
  rpcCallWithFailover,
  resolveFeaturedPairLogRpcUrls,
} from 'lib/bsc-indexer/rpc/chunkedLogs'
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

  let topicIntegrity: { ok: boolean; reason?: string } = { ok: true }
  try {
    assertIndexerEventTopicsValid()
  } catch (e) {
    topicIntegrity = { ok: false, reason: e instanceof Error ? e.message : 'topic integrity failed' }
  }

  const blob = await verifyBlobRoundTrip()
  const logUrls = resolveFeaturedPairLogRpcUrls()
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
    const quantity = blockQuantityVariants(block)[0]
    const singleBlock = await rpcCallWithFailover<unknown[]>(
      'eth_getLogs',
      [
        {
          fromBlock: quantity,
          toBlock: quantity,
          address: MARCO_WBNB_PAIR_BSC.toLowerCase(),
          topics: [SWAP_TOPIC],
        },
      ],
      logUrls,
    )
    logProbe.singleBlockLogFetch = {
      block,
      count: singleBlock.result.length,
      url: singleBlock.url,
      encoding: quantity,
      swapTopic: SWAP_TOPIC,
    }
  } catch (e) {
    logProbe.singleBlockLogFetch = { error: e instanceof Error ? e.message : 'single-block log fetch failed' }
  }

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    topicIntegrity,
    blob,
    rpc: {
      primary: primaryRpc,
      fallback: fallbackRpc,
      logProbe,
      logFetchOrder: logUrls,
      providerHealth: getProviderHealthSnapshot(),
    },
  })
}

export default handler
