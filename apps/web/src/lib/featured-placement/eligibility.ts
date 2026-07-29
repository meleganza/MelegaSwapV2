import type { FeaturedOrder } from './types'

const TERMINAL_BLOCK = new Set(['CANCELLED', 'PAYMENT_FAILED', 'REFUND_REVIEW', 'COMPLETED'])

/**
 * Rotation candidates: payment confirmed, identity resolved, within 7-day window,
 * not cancelled/refunded/expired. Does not force placement into all four Home cards.
 */
export function isRotationEligible(order: FeaturedOrder, now = new Date()): boolean {
  if (TERMINAL_BLOCK.has(order.state) && order.state !== 'ACTIVE' && order.state !== 'SCHEDULED') {
    return false
  }
  if (!order.receiptVerified || order.paymentStatus !== 'confirmed') return false
  if (order.state !== 'PAYMENT_CONFIRMED' && order.state !== 'ELIGIBILITY_PENDING' && order.state !== 'SCHEDULED' && order.state !== 'ACTIVE') {
    return false
  }
  if (!order.projectId) return false
  if (!order.projectSlug && !order.projectContract) return false
  if (order.eligibilityStatus === 'rejected') return false
  if (!order.scheduledStart || !order.scheduledEnd) return false
  const start = Date.parse(order.scheduledStart)
  const end = Date.parse(order.scheduledEnd)
  const t = now.getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false
  if (t < start || t > end) return false
  return true
}

export function scheduleFeaturedWindow(from = new Date(), days = 7): { start: string; end: string } {
  const start = new Date(from)
  const end = new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}
