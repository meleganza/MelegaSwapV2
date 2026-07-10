import type { NextApiHandler } from 'next'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { OhlcvCandle } from 'lib/bsc-indexer/types'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const storage = resolveIndexerStorage()
  const pair = (typeof req.query.pair === 'string' ? req.query.pair : MARCO_WBNB_PAIR_BSC).toLowerCase()
  const interval = (typeof req.query.interval === 'string' ? req.query.interval : '1H') as OhlcvCandle['interval']
  if (!['1H', '4H', '1D'].includes(interval)) {
    return res.status(400).json({ error: 'Invalid interval' })
  }

  const [candles, health] = await Promise.all([
    storage.listCandles(pair, interval, 300),
    storage.loadHealth(),
  ])

  const valid = candles.filter(
    (c) =>
      Number.isFinite(c.open) &&
      Number.isFinite(c.high) &&
      Number.isFinite(c.low) &&
      Number.isFinite(c.close) &&
      c.open > 0,
  )

  const status = valid.length > 0 ? 'ready' : health?.status === 'ready' ? 'empty' : 'unavailable'

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
  return res.status(200).json({
    status,
    candles: valid,
    meta: {
      pairAddress: pair,
      interval,
      candleCount: valid.length,
      lastIndexedBlock: health?.lastIndexedBlock,
      reason:
        status === 'unavailable'
          ? health?.lastFailureReason ?? 'No candles in durable store'
          : status === 'empty'
            ? 'No swap events in selected interval'
            : undefined,
    },
  })
}

export default handler
