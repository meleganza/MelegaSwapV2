import type { NextApiHandler } from 'next'
import {
  advanceFarmerParticipantIndex,
  getFarmerParticipantSnapshot,
} from 'lib/bsc-indexer/indexer/farmerParticipantIndex'
import { MELEGA_MASTERCHEF_BSC } from 'lib/bsc-indexer/constants'
import { MASTERCHEF_CANONICAL } from 'lib/bsc-indexer/indexer/masterchefTopics'

/**
 * Unique MasterChef farm participants (factual durable index).
 * GET — snapshot with provenance (seed-hydrated on cold start)
 * GET ?advance=1 / POST — advance index by a bounded chunk (server-side backfill helper)
 *
 * Never returns a fabricated zero while incomplete.
 * When a certified unique set exists (seed or runtime), uniqueFarmers is the factual count.
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const advance = req.method === 'POST' || req.query.advance === '1' || req.query.advance === 'true'

  if (advance) {
    res.setHeader('Cache-Control', 'no-store')
    const maxBlocks = Math.min(
      2_000_000,
      Math.max(10_000, Number(req.query.maxBlocks ?? req.body?.maxBlocks ?? 500_000) || 500_000),
    )
    await advanceFarmerParticipantIndex({ maxBlocks, chunkSize: 10_000 })
  } else {
    // The snapshot is shared public chain state. Let the edge absorb repeated
    // page loads while revalidating in the background; advancing the index is
    // deliberately excluded above because it is a mutating operation.
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800')
  }

  const snap = getFarmerParticipantSnapshot()

  return res.status(200).json({
    status: snap.status === 'idle' ? 'indexing' : snap.status,
    uniqueFarmers: snap.primaryCount != null && Number.isFinite(snap.primaryCount) ? snap.primaryCount : null,
    uniqueLpFarmers: snap.uniqueLpParticipants > 0 ? snap.uniqueLpParticipants : null,
    historicalParticipants: snap.historicalParticipants > 0 ? snap.historicalParticipants : null,
    currentlyStakedWallets: snap.currentlyStakedWallets,
    observedWallets: snap.uniqueParticipants > 0 ? snap.uniqueParticipants : null,
    eventCount: snap.depositEventCount + snap.withdrawEventCount + snap.emergencyWithdrawEventCount,
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
