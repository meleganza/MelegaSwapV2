import type { NextApiHandler } from 'next'
import { getFeaturedOrder, isRotationEligible } from 'lib/featured-placement'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const orderId = String(req.query.orderId || '')
  if (!orderId) return res.status(400).json({ error: 'orderId required' })
  const order = getFeaturedOrder(orderId)
  if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' })
  const eligible = isRotationEligible(order)
  return res.status(200).json({
    orderId,
    eligible,
    state: order.state,
    eligibilityStatus: order.eligibilityStatus,
    paymentStatus: order.paymentStatus,
    receiptVerified: order.receiptVerified,
    scheduledStart: order.scheduledStart,
    scheduledEnd: order.scheduledEnd,
    projectId: order.projectId,
    projectSlug: order.projectSlug,
    projectContract: order.projectContract,
  })
}

export default handler
