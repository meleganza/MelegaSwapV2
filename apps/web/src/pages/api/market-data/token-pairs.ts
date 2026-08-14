import type { NextApiHandler } from 'next'
import { aggregateProjectDexPairs, type DexScreenerPair } from 'lib/market-data/projectDexAnalytics'

const PROVIDER_CHAIN_BY_ID: Record<number, string> = {
  1: 'ethereum',
  56: 'bsc',
  137: 'polygon',
  8453: 'base',
  42161: 'arbitrum',
  43114: 'avalanche',
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const chainId = Number(req.query.chainId)
  const address = String(req.query.address || '')
    .trim()
    .toLowerCase()
  const providerChain = PROVIDER_CHAIN_BY_ID[chainId]
  if (!providerChain || !/^0x[a-f0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'INVALID_CHAIN_OR_ADDRESS' })
  }

  try {
    const response = await fetch(
      `https://api.dexscreener.com/token-pairs/v1/${encodeURIComponent(providerChain)}/${address}`,
      { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(5000) },
    )
    if (!response.ok) throw new Error(`PROVIDER_HTTP_${response.status}`)
    const rows = (await response.json()) as DexScreenerPair[]
    const analytics = aggregateProjectDexPairs(Array.isArray(rows) ? rows : [], address)
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res.status(200).json({
      schema: 'melega.project-multi-dex.v1',
      chainId,
      address,
      generatedAt: new Date().toISOString(),
      source: 'dexscreener-token-pairs-v1',
      sourceUrl: `https://dexscreener.com/${providerChain}/${address}`,
      analytics,
    })
  } catch (error) {
    return res.status(502).json({
      error: 'MULTI_DEX_PROVIDER_UNAVAILABLE',
      message: error instanceof Error ? error.message : 'Provider unavailable',
    })
  }
}

export default handler
