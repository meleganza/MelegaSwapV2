import type { NextApiHandler } from 'next'
import { FEATURED_OFFER, listRotationCandidates } from 'lib/featured-placement'

/**
 * Public-safe handoff for Home Featured rotation consumer.
 * Does not modify Home. Supplies eligible candidates only.
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const candidates = listRotationCandidates()
  return res.status(200).json({
    schema: 'melega.featured-rotation-candidates.v1',
    integration:
      'Home FeaturedProjectsRail may consume this list as optional paid candidates. It must not force a project into all four slots. Founder catalog slugs remain authoritative until Home runtime is updated in a later mission.',
    cardSlots: FEATURED_OFFER.cardSlots,
    durationDays: FEATURED_OFFER.durationDays,
    count: candidates.length,
    candidates,
  })
}

export default handler
