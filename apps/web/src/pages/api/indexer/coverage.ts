import type { NextApiHandler } from 'next'
import { FEATURED_PAIR_SLUG } from 'lib/bsc-indexer/constants'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'
import { bootstrapWindowSummary } from 'lib/bsc-indexer/indexer/coverageRanges'
import { getBlockNumber } from 'lib/bsc-indexer/rpc/chunkedLogs'
import { REORG_SAFETY_BLOCKS } from 'lib/bsc-indexer/constants'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const storage = resolveIndexerStorage()
  const [checkpoint, chainHead] = await Promise.all([storage.loadCheckpoint(), getBlockNumber()])
  const bootstrapStart = checkpoint?.bootstrapStartBlock ?? 0
  const forwardHigh = Math.max(0, chainHead - REORG_SAFETY_BLOCKS)
  const coverageRanges = checkpoint?.coverageRanges ?? []
  const bootstrapWindow = bootstrapWindowSummary(coverageRanges, bootstrapStart, forwardHigh)

  return res.status(200).json({
    generatedAt: new Date().toISOString(),
    slug: FEATURED_PAIR_SLUG,
    bootstrapWindow,
    forwardCursor: checkpoint?.forwardCursor ?? null,
    gapFillCursor: checkpoint?.gapFillCursor ?? null,
    backwardCursor: checkpoint?.backwardCursor ?? null,
    coverageRanges,
    chainHead,
  })
}

export default handler
