import type { NextApiHandler } from 'next'
import type { PriceChartEntry } from 'state/info/types'
import {
  decodeSwapAmounts,
  formatTokenAmountFromWei,
  getBlockNumber,
  getLogs,
  MARCO_WBNB_PAIR_BSC,
  SWAP_EVENT_TOPIC,
} from 'lib/runtime-indexing/rpcLogReader'

type Interval = '1H' | '4H' | '1D'

const INTERVAL_SECONDS: Record<Interval, number> = {
  '1H': 3600,
  '4H': 14400,
  '1D': 86400,
}

const BLOCK_SPAN: Record<Interval, number> = {
  '1H': 8_000,
  '4H': 20_000,
  '1D': 40_000,
}

async function getBlockTimestamp(blockHex: string, rpcUrl: string): Promise<number> {
  const block = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBlockByNumber',
      params: [blockHex, false],
    }),
  }).then((r) => r.json())
  return parseInt(block?.result?.timestamp ?? '0', 16)
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const interval = (typeof req.query.interval === 'string' ? req.query.interval : '1H') as Interval
  if (!INTERVAL_SECONDS[interval]) {
    return res.status(400).json({ error: 'Invalid interval. Use 1H, 4H, or 1D.' })
  }

  const rpcUrl = process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org'
  const pair = typeof req.query.pair === 'string' ? req.query.pair.toLowerCase() : MARCO_WBNB_PAIR_BSC.toLowerCase()

  try {
    const chainHead = await getBlockNumber(rpcUrl)
    const fromBlock = Math.max(0, chainHead - BLOCK_SPAN[interval])
    const logs = await getLogs(
      {
        address: pair,
        topics: [SWAP_EVENT_TOPIC],
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: 'latest',
      },
      rpcUrl,
    )

    const blockTsCache = new Map<string, number>()
    const bucketMap = new Map<
      number,
      { open: number; high: number; low: number; close: number; volume: number; count: number }
    >()

    for (const log of logs) {
      const blockHex = log.blockNumber
      let ts = blockTsCache.get(blockHex)
      if (!ts) {
        ts = await getBlockTimestamp(blockHex, rpcUrl)
        blockTsCache.set(blockHex, ts)
      }
      const { amount0In, amount1In, amount0Out, amount1Out } = decodeSwapAmounts(log.data)
      const marco = formatTokenAmountFromWei(amount0In + amount0Out, 18)
      const wbnb = formatTokenAmountFromWei(amount1In + amount1Out, 18)
      if (wbnb <= 0) continue
      const price = marco / wbnb
      if (!Number.isFinite(price) || price <= 0) continue

      const bucket = Math.floor(ts / INTERVAL_SECONDS[interval]) * INTERVAL_SECONDS[interval]
      const existing = bucketMap.get(bucket)
      if (!existing) {
        bucketMap.set(bucket, { open: price, high: price, low: price, close: price, volume: wbnb, count: 1 })
      } else {
        existing.high = Math.max(existing.high, price)
        existing.low = Math.min(existing.low, price)
        existing.close = price
        existing.volume += wbnb
        existing.count += 1
      }
    }

    const candles: PriceChartEntry[] = [...bucketMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([time, c]) => ({
        time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return res.status(200).json({
      candles,
      meta: {
        source: 'bsc-rpc-log-indexer',
        pairAddress: pair,
        interval,
        fromBlock,
        toBlock: chainHead,
        swapEventCount: logs.length,
        candleCount: candles.length,
        status: candles.length > 0 ? 'ready' : 'empty',
      },
    })
  } catch (e) {
    return res.status(502).json({
      candles: [] as PriceChartEntry[],
      meta: {
        status: 'error',
        reason: e instanceof Error ? e.message : 'RPC chart indexer failed',
      },
    })
  }
}

export default handler
