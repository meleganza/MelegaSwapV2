import type { NextApiHandler } from 'next'
import { Transaction, TransactionType } from 'state/info/types'
import {
  decodeSwapAmounts,
  formatTokenAmountFromWei,
  getBlockNumber,
  getLogs,
  MARCO_BSC,
  MARCO_WBNB_PAIR_BSC,
  SWAP_EVENT_TOPIC,
  WBNB_BSC,
} from 'lib/runtime-indexing/rpcLogReader'
import type { RpcSwapIndexerMeta } from 'lib/runtime-indexing/fetchRpcProtocolTransactions'

const PAIR_META: Record<
  string,
  { token0: string; token1: string; symbol0: string; symbol1: string; decimals0: number; decimals1: number }
> = {
  [MARCO_WBNB_PAIR_BSC.toLowerCase()]: {
    token0: MARCO_BSC,
    token1: WBNB_BSC,
    symbol0: 'MARCO',
    symbol1: 'WBNB',
    decimals0: 18,
    decimals1: 18,
  },
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

  const rpcUrl = process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org'
  const pairParam = typeof req.query.pair === 'string' ? req.query.pair.toLowerCase() : MARCO_WBNB_PAIR_BSC.toLowerCase()
  const blockSpan = Math.min(50_000, Math.max(2_000, Number(req.query.blockSpan) || 8_000))
  const meta = PAIR_META[pairParam]

  if (!meta) {
    return res.status(400).json({
      transactions: [],
      meta: {
        source: 'bsc-rpc-log-indexer',
        pairAddress: pairParam,
        status: 'unavailable',
        reason: 'Pair not in RPC indexer allowlist',
      } satisfies Partial<RpcSwapIndexerMeta>,
    })
  }

  try {
    const chainHead = await getBlockNumber(rpcUrl)
    const fromBlock = Math.max(0, chainHead - blockSpan)
    const logs = await getLogs(
      {
        address: pairParam,
        topics: [SWAP_EVENT_TOPIC],
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: 'latest',
      },
      rpcUrl,
    )

    const blockTsCache = new Map<string, number>()
    const transactions: Transaction[] = []

    for (const log of logs.slice(-80).reverse()) {
      const blockHex = log.blockNumber
      let ts = blockTsCache.get(blockHex)
      if (!ts) {
        ts = await getBlockTimestamp(blockHex, rpcUrl)
        blockTsCache.set(blockHex, ts)
      }
      const { amount0In, amount1In, amount0Out, amount1Out } = decodeSwapAmounts(log.data)
      const amountToken0 = formatTokenAmountFromWei(amount0In + amount0Out, meta.decimals0)
      const amountToken1 = formatTokenAmountFromWei(amount1In + amount1Out, meta.decimals1)
      transactions.push({
        type: TransactionType.SWAP,
        hash: log.transactionHash,
        timestamp: String(ts),
        sender: `0x${log.topics[1]?.slice(26) ?? '0'.repeat(40)}`,
        token0Symbol: meta.symbol0,
        token1Symbol: meta.symbol1,
        token0Address: meta.token0,
        token1Address: meta.token1,
        amountUSD: 0,
        amountToken0,
        amountToken1,
      })
    }

    const indexerMeta: RpcSwapIndexerMeta = {
      source: 'bsc-rpc-log-indexer',
      pairAddress: pairParam,
      fromBlock,
      toBlock: chainHead,
      latestIndexedBlock: chainHead,
      chainHead,
      indexingLag: 0,
      lastSuccessfulSync: new Date().toISOString(),
      eventCount: logs.length,
      status: transactions.length > 0 ? 'ready' : 'empty',
      reason: transactions.length === 0 ? 'No swap events in scanned block range' : undefined,
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res.status(200).json({ transactions, meta: indexerMeta })
  } catch (e) {
    return res.status(502).json({
      transactions: [],
      meta: {
        source: 'bsc-rpc-log-indexer',
        pairAddress: pairParam,
        fromBlock: 0,
        toBlock: 0,
        latestIndexedBlock: 0,
        chainHead: 0,
        indexingLag: 0,
        lastSuccessfulSync: new Date().toISOString(),
        eventCount: 0,
        status: 'error',
        reason: e instanceof Error ? e.message : 'RPC swap indexer failed',
      } satisfies RpcSwapIndexerMeta,
    })
  }
}

export default handler
