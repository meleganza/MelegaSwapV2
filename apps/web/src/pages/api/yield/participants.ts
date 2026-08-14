import type { NextApiHandler } from 'next'
import snapshotJson from 'lib/yield-participants/yieldParticipants.generated.json'
import type { YieldParticipantSnapshot } from 'lib/yield-participants/types'

const snapshot = snapshotJson as YieldParticipantSnapshot

/**
 * One cacheable participant snapshot for both Farms and Pools.
 * The browser never scans logs or calls one RPC per card.
 */
const handler: NextApiHandler = (_req, res) => {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
  return res.status(200).json({
    ...snapshot,
    farmCount: Object.keys(snapshot.farms).length,
    poolCount: Object.keys(snapshot.pools).length,
  })
}

export default handler
