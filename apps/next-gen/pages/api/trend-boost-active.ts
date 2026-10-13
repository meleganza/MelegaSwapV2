import type { NextApiHandler } from 'next'

const CANONICAL_ORIGIN = process.env.MELEGA_LIVE_ORIGIN || 'https://www.melega.finance'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const upstream = await fetch(`${CANONICAL_ORIGIN}/api/trend-boost/active`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(2500),
    })
    if (!upstream.ok) throw new Error('canonical feed unavailable')
    const payload = await upstream.json()
    if (payload?.schema !== 'melega.trend-boost-active.v1' || !Array.isArray(payload.placements)) {
      throw new Error('canonical feed invalid')
    }
    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30')
    return res.status(200).json(payload)
  } catch {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(503).json({
      schema: 'melega.trend-boost-active.v1',
      count: 0,
      placements: [],
    })
  }
}

export default handler
