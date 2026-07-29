import type { NextApiHandler } from 'next'
import {
  advanceFarmerParticipantIndex,
  getFarmerParticipantSnapshot,
} from 'lib/bsc-indexer/indexer/farmerParticipantIndex'
import { MELEGA_MASTERCHEF_BSC } from 'lib/bsc-indexer/constants'
import { MASTERCHEF_CANONICAL } from 'lib/bsc-indexer/indexer/masterchefTopics'

/**
 * Unique MasterChef farm participants (factual durable index).
 * GET — snapshot with provenance
 * GET ?advance=1 — advance index by a bounded chunk (server-side backfill helper)
 *
 * Never returns status:ready with a fabricated zero while indexing is incomplete.
 * While indexing, uniqueFarmers is null and status is "indexing".
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const advance =
    req.method === 'POST' ||
    req.query.advance === '1' ||
    req.query.advance === 'true'

  if (advance) {
    const maxBlocks = Math.min(
      2_000_000,
      Math.max(10_000, Number(req.query.maxBlocks ?? req.body?.maxBlocks ?? 500_000) || 500_000),
    )
    await advanceFarmerParticipantIndex({ maxBlocks, chunkSize: 10_000 })
  }

  const snap = getFarmerParticipantSnapshot()

  return res.status(200).json({
    status: snap.status === 'idle' ? 'indexing' : snap.status,
    uniqueFarmers: snap.displayState === 'loading' || snap.displayState === 'unavailable' ? null : snap.primaryCount,
    uniqueLpFarmers: snap.status === 'ready' ? snap.uniqueLpParticipants : null,
    historicalParticipants: snap.status === 'ready' ? snap.historicalParticipants : null,
    currentlyStakedWallets: snap.currentlyStakedWallets,
    observedWallets: snap.status === 'ready' ? snap.uniqueParticipants : null,
    eventCount:
      snap.depositEventCount + snap.withdrawEventCount + snap.emergencyWithdrawEventCount,
    depositEventCount: snap.depositEventCount,
    withdrawEventCount: snap.withdrawEventCount,
    emergencyWithdrawEventCount: snap.emergencyWithdrawEventCount,
    deploymentBlock: snap.deploymentBlock,
    creationTx: snap.creationTx,
    lastIndexedBlock: snap.lastIndexedBlock,
    chainHead: snap.chainHead,
    coveragePct: snap.coveragePct,
    rangesScanned: snap.rangesScanned,
    updatedAt: snap.updatedAt,
    source: snap.source,
    masterChef: MELEGA_MASTERCHEF_BSC,
    topics: MASTERCHEF_CANONICAL.topics,
    signatures: MASTERCHEF_CANONICAL.signatures,
    scope: 'active+finished',
    primaryLabel: snap.primaryLabel,
    note: snap.note,
    lastError: snap.lastError,
  })
}

export default handler
