import type { NextApiHandler } from 'next'
import { listActiveTrendBoostOrders, listTrendBoostOrdersDurably } from 'lib/monetization/trendBoostOrders'
import { getProjectBySlug } from 'registry/projects/getProjectBySlug'

/** Public-safe active Boost feed consumed by the global trending ticker. */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  await listTrendBoostOrdersDurably()
  // Existing consumers without an explicit filter are the global Trend Boost
  // surfaces. Dedicated placements must never leak into that ranking feed.
  const requestedService = typeof req.query.service === 'string' ? req.query.service : 'trend-boost'
  const placements = listActiveTrendBoostOrders()
    .filter((order) => (order.serviceId ?? 'trend-boost') === requestedService)
    .map((order) => {
      const project = order.projectSlug ? getProjectBySlug(order.projectSlug) : undefined
      const token = project?.resources.tokens[0]
      return {
        orderId: order.orderId,
        serviceId: order.serviceId ?? 'trend-boost',
        targetId: order.targetId ?? null,
        projectId: order.projectId,
        projectSlug: order.projectSlug,
        projectContract: order.projectContract,
        chainId: order.chainId,
        name: project?.displayName ?? order.projectSlug ?? order.projectId,
        symbol: token?.symbol ?? order.projectSlug ?? order.projectId,
        logoUrl: project?.logoUrl ?? null,
        startsAt: order.scheduledStart,
        endsAt: order.scheduledEnd,
      }
    })

  res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30')
  return res.status(200).json({
    schema: 'melega.trend-boost-active.v1',
    generatedAt: new Date().toISOString(),
    count: placements.length,
    placements,
  })
}

export default handler
