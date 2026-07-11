import type { NextApiHandler } from 'next'
import { resolveIndexerStorage, resolveIndexerStorageForSlug } from 'lib/bsc-indexer/storage'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import { FEATURED_PAIR_SLUG } from 'lib/bsc-indexer/v2/paths'
import { resolveSlugFromQuery } from 'lib/bsc-indexer/v2/pairSlug'
import type { OhlcvCandle } from 'lib/bsc-indexer/types'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const pair = (typeof req.query.pair === 'string' ? req.query.pair : MARCO_WBNB_PAIR_BSC).toLowerCase()
  const slugParam = typeof req.query.slug === 'string' ? req.query.slug : undefined
  const token0 = typeof req.query.token0 === 'string' ? req.query.token0 : undefined
  const token1 = typeof req.query.token1 === 'string' ? req.query.token1 : undefined
  const slug = resolveSlugFromQuery(slugParam, pair, token0, token1)
  const storage =
    slug === FEATURED_PAIR_SLUG && pair === MARCO_WBNB_PAIR_BSC.toLowerCase()
      ? resolveIndexerStorage()
      : resolveIndexerStorageForSlug(slug)
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
      slug,
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
