import type { NextApiHandler } from 'next'

const GECKO_NETWORK_BY_CHAIN: Record<number, string> = {
  1: 'eth',
  56: 'bsc',
  137: 'polygon_pos',
  8453: 'base',
  42161: 'arbitrum',
  43114: 'avax',
}

type GeckoOhlcvPayload = {
  data?: {
    attributes?: {
      ohlcv_list?: unknown[][]
    }
  }
}

type NormalizedCandle = {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volumeUsd: number
}

function finiteNumber(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeRow(row: unknown[]): NormalizedCandle | null {
  if (!Array.isArray(row) || row.length < 6) return null
  const values = row.slice(0, 6).map(finiteNumber)
  if (values.some((value) => value == null)) return null
  const [timestamp, open, high, low, close, volumeUsd] = values as number[]
  if (timestamp <= 0 || open <= 0 || high <= 0 || low <= 0 || close <= 0 || volumeUsd < 0) return null
  return { timestamp, open, high, low, close, volumeUsd }
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const chainId = Number(req.query.chainId)
  const pairAddress = String(req.query.pairAddress || '').trim().toLowerCase()
  const network = GECKO_NETWORK_BY_CHAIN[chainId]

  if (!network || !/^0x[a-f0-9]{40}$/.test(pairAddress)) {
    return res.status(400).json({ error: 'INVALID_CHAIN_OR_PAIR' })
  }

  const query = new URLSearchParams({
    aggregate: '1',
    limit: '24',
    currency: 'usd',
    include_empty_intervals: 'true',
  })
  const endpoint = `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${pairAddress}/ohlcv/hour?${query}`

  try {
    const response = await fetch(endpoint, {
      headers: {
        accept: 'application/json;version=20230203',
      },
      signal: AbortSignal.timeout(4500),
    })

    if (!response.ok) {
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
      return res.status(200).json({
        status: response.status === 404 ? 'empty' : 'unavailable',
        chainId,
        pairAddress,
        candles: [],
        volume24hUsd: null,
        source: 'geckoterminal-public-ohlcv',
      })
    }

    const payload = (await response.json()) as GeckoOhlcvPayload
    const candles = (payload.data?.attributes?.ohlcv_list ?? [])
      .map(normalizeRow)
      .filter((row): row is NormalizedCandle => Boolean(row))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-24)
    const volume24hUsd = candles.length
      ? candles.reduce((total, candle) => total + candle.volumeUsd, 0)
      : null

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res.status(200).json({
      status: candles.length >= 2 ? 'ready' : 'empty',
      chainId,
      pairAddress,
      candles,
      volume24hUsd,
      source: 'geckoterminal-public-ohlcv',
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=60')
    return res.status(200).json({
      status: 'unavailable',
      chainId,
      pairAddress,
      candles: [],
      volume24hUsd: null,
      source: 'geckoterminal-public-ohlcv',
      reason: error instanceof Error ? error.message : 'OHLCV provider unavailable',
    })
  }
}

export default handler
