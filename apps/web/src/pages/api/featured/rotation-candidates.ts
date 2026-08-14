import type { NextApiHandler } from 'next'
import { FEATURED_OFFER, listFeaturedOrdersDurably, listRotationCandidates } from 'lib/featured-placement'

/**
 * Public-safe handoff for Home Featured rotation consumer.
 * Does not modify Home. Supplies eligible candidates only.
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  await listFeaturedOrdersDurably()
  const candidates = listRotationCandidates()
  res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30')
  return res.status(200).json({
    schema: 'melega.featured-rotation-candidates.v1',
    integration: 'Home FeaturedProjectsRail consumes verified active candidates and rotates them through four slots.',
    cardSlots: FEATURED_OFFER.cardSlots,
    durationDays: FEATURED_OFFER.durationDays,
    count: candidates.length,
    candidates,
  })
}

export default handler
