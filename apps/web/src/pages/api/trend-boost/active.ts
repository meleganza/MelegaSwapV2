import type { NextApiHandler } from 'next'
import { listActiveTrendBoostOrders } from 'lib/monetization/trendBoostOrders'

/** Public-safe active Boost feed consumed by the global trending ticker. */
const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const placements = listActiveTrendBoostOrders().map((order) => ({
    orderId: order.orderId,
    projectId: order.projectId,
    projectSlug: order.projectSlug,
    projectContract: order.projectContract,
    chainId: order.chainId,
    startsAt: order.scheduledStart,
    endsAt: order.scheduledEnd,
  }))

  res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30')
  return res.status(200).json({
    schema: 'melega.trend-boost-active.v1',
    generatedAt: new Date().toISOString(),
    count: placements.length,
    placements,
  })
}

export default handler
