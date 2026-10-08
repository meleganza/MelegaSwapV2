import type { NextApiHandler } from 'next'
import { listActiveTrendBoostOrders, listTrendBoostOrdersDurably } from 'lib/monetization/trendBoostOrders'

/** Public-safe active Boost feed consumed by the global trending ticker. */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await listTrendBoostOrdersDurably()
  } catch {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(503).json({
      schema: 'melega.trend-boost-active.v1',
      error: 'TREND_BOOST_ACTIVE_UNAVAILABLE',
      generatedAt: new Date().toISOString(),
      count: 0,
      placements: [],
    })
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
