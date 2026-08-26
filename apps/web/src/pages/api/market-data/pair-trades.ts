import type { NextApiHandler } from 'next'
import { normalizeGeckoPairTrades, type GeckoTradeRow } from 'lib/market-data/pairTrades'

const GECKO_NETWORK_BY_CHAIN: Record<number, string> = {
  1: 'eth',
  56: 'bsc',
  137: 'polygon_pos',
  8453: 'base',
  42161: 'arbitrum',
  43114: 'avax',
}

type GeckoPoolPayload = {
  data?: {
    relationships?: {
      base_token?: { data?: { id?: string } }
      quote_token?: { data?: { id?: string } }
    }
  }
  included?: Array<{
    id?: string
    attributes?: { address?: string; symbol?: string }
  }>
}

type GeckoTradesPayload = { data?: GeckoTradeRow[] }

function relationshipAddress(id?: string): string | null {
  const match = id?.toLowerCase().match(/0x[a-f0-9]{40}$/)
  return match?.[0] ?? null
}

function tokenSymbol(payload: GeckoPoolPayload, relationshipId?: string): string | null {
  if (!relationshipId) return null
  const token = payload.included?.find((row) => row.id?.toLowerCase() === relationshipId.toLowerCase())
  const symbol = token?.attributes?.symbol?.trim()
  return symbol || null
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const chainId = Number(req.query.chainId)
  const pairAddress = String(req.query.pairAddress || '')
    .trim()
    .toLowerCase()
  const tokenAddress = String(req.query.tokenAddress || '')
    .trim()
    .toLowerCase()
  const network = GECKO_NETWORK_BY_CHAIN[chainId]
  if (!network || !/^0x[a-f0-9]{40}$/.test(pairAddress) || !/^0x[a-f0-9]{40}$/.test(tokenAddress)) {
    return res.status(400).json({ error: 'INVALID_CHAIN_PAIR_OR_TOKEN' })
  }

  const headers = { accept: 'application/json;version=20230203' }
  try {
    const [poolResponse, tradesResponse] = await Promise.all([
      fetch(
        `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${pairAddress}?include=base_token%2Cquote_token`,
        { headers, signal: AbortSignal.timeout(3500) },
      ),
      fetch(`https://api.geckoterminal.com/api/v2/networks/${network}/pools/${pairAddress}/trades`, {
        headers,
        signal: AbortSignal.timeout(4000),
      }),
    ])
    if (!poolResponse.ok) throw new Error(`POOL_METADATA_HTTP_${poolResponse.status}`)
    if (!tradesResponse.ok) throw new Error(`PAIR_TRADES_HTTP_${tradesResponse.status}`)

    const pool = (await poolResponse.json()) as GeckoPoolPayload
    const payload = (await tradesResponse.json()) as GeckoTradesPayload
    const baseId = pool.data?.relationships?.base_token?.data?.id
    const quoteId = pool.data?.relationships?.quote_token?.data?.id
    const baseTokenAddress = relationshipAddress(baseId)
    const quoteTokenAddress = relationshipAddress(quoteId)
    const baseTokenSymbol = tokenSymbol(pool, baseId)
    const quoteTokenSymbol = tokenSymbol(pool, quoteId)
    if (!baseTokenAddress || !quoteTokenAddress || !baseTokenSymbol || !quoteTokenSymbol) {
      throw new Error('POOL_TOKEN_METADATA_INCOMPLETE')
    }
    if (tokenAddress !== baseTokenAddress && tokenAddress !== quoteTokenAddress) {
      return res.status(400).json({ error: 'TOKEN_NOT_IN_PAIR' })
    }

    const trades = normalizeGeckoPairTrades({
      rows: payload.data ?? [],
      selectedTokenAddress: tokenAddress,
      baseTokenAddress,
      baseTokenSymbol,
      quoteTokenAddress,
      quoteTokenSymbol,
    }).slice(0, 12)

    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=60')
    return res.status(200).json({
      status: trades.length ? 'ready' : 'empty',
      chainId,
      pairAddress,
      tokenAddress,
      trades,
      source: 'geckoterminal-public-trades',
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30')
    return res.status(200).json({
      status: 'unavailable',
      chainId,
      pairAddress,
      tokenAddress,
      trades: [],
      source: 'geckoterminal-public-trades',
      reason: error instanceof Error ? error.message : 'Public pair trades unavailable',
      generatedAt: new Date().toISOString(),
    })
  }
}

export default handler
