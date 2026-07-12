import type { NextApiHandler } from 'next'
import { Transaction, TransactionType } from 'state/info/types'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'
import { mapIndexerEventsToTransactions } from 'lib/bsc-indexer/client/mapIndexerEvents'
import { MARCO_WBNB_PAIR_BSC, FEATURED_PAIR_SLUG } from 'lib/bsc-indexer/constants'
import { slugFromPairAddress } from 'lib/bsc-indexer/v2/pairSlug'
import type { RpcSwapIndexerMeta } from 'lib/runtime-indexing/fetchRpcProtocolTransactions'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const pairParam = typeof req.query.pair === 'string' ? req.query.pair.toLowerCase() : MARCO_WBNB_PAIR_BSC.toLowerCase()
  const pairAddress =
    pairParam === FEATURED_PAIR_SLUG || pairParam === 'marco-wbnb'
      ? MARCO_WBNB_PAIR_BSC.toLowerCase()
      : pairParam.startsWith('0x')
        ? pairParam
        : slugFromPairAddress(pairParam)
  const storage = resolveIndexerStorage()
  const [events, health, checkpoint] = await Promise.all([
    storage.listEvents({ pairAddress, limit: 80 }),
    storage.loadHealth(),
    storage.loadCheckpoint(),
  ])

  const transactions: Transaction[] = mapIndexerEventsToTransactions(events).filter(
    (tx) => tx.type === TransactionType.SWAP,
  )

  const chainHead = health?.chainHead ?? checkpoint?.chainHeadAtSync ?? 0
  const lastIndexed = checkpoint?.lastIndexedBlock ?? health?.lastIndexedBlock ?? 0

  const indexerMeta: RpcSwapIndexerMeta = {
    source: 'bsc-rpc-log-indexer',
    pairAddress: pairParam === FEATURED_PAIR_SLUG ? FEATURED_PAIR_SLUG : pairAddress,
    fromBlock: Math.max(0, lastIndexed - 8000),
    toBlock: chainHead,
    latestIndexedBlock: lastIndexed,
    chainHead,
    indexingLag: health?.indexingLag ?? Math.max(0, chainHead - lastIndexed),
    lastSuccessfulSync: checkpoint?.lastSuccessfulSync ?? health?.lastSuccessfulSync ?? new Date().toISOString(),
    eventCount: events.length,
    status:
      transactions.length > 0
        ? 'ready'
        : health?.status === 'ready' || storage.configured
          ? 'empty'
          : 'unavailable',
    reason:
      transactions.length === 0
        ? health?.lastFailureReason ??
          (storage.configured
            ? 'No swap events in durable store — run /api/indexer/run'
            : 'Durable storage not configured (BLOB_READ_WRITE_TOKEN)')
        : undefined,
  }

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
  return res.status(200).json({ transactions, meta: indexerMeta })
}

export default handler
