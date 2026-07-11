import type { NextApiHandler } from 'next'
import type { PriceChartEntry } from 'state/info/types'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'
import type { OhlcvCandle } from 'lib/bsc-indexer/types'

type Interval = '1H' | '4H' | '1D'

function mapCandle(c: OhlcvCandle): PriceChartEntry {
  return {
    time: c.bucketTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const interval = (typeof req.query.interval === 'string' ? req.query.interval : '1H') as Interval
  if (!['1H', '4H', '1D'].includes(interval)) {
    return res.status(400).json({ error: 'Invalid interval. Use 1H, 4H, or 1D.' })
  }

  const pair = (typeof req.query.pair === 'string' ? req.query.pair : MARCO_WBNB_PAIR_BSC).toLowerCase()
  const storage = resolveIndexerStorage()

  try {
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

    const status = valid.length > 0 ? 'ready' : health?.status === 'syncing' ? 'syncing' : 'unavailable'

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return res.status(200).json({
      candles: valid.map(mapCandle),
      meta: {
        source: 'v2-featured-pair-durable-candles',
        pairAddress: pair,
        interval,
        candleCount: valid.length,
        lastIndexedBlock: health?.lastIndexedBlock,
        indexerGeneration: health?.indexerGeneration ?? 'v2-featured-pair',
        status,
        reason:
          status === 'unavailable'
            ? health?.lastFailureReason ?? 'Featured-pair candle store not populated — run /api/indexer/run'
            : status === 'syncing'
              ? 'Featured-pair bootstrap in progress'
              : undefined,
      },
    })
  } catch (e) {
    return res.status(502).json({
      candles: [] as PriceChartEntry[],
      meta: {
        status: 'error',
        source: 'v2-featured-pair-durable-candles',
        reason: e instanceof Error ? e.message : 'Featured-pair chart read failed',
      },
    })
  }
}

export default handler
