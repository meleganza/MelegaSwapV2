import type { NextApiHandler } from 'next'
import { buildServerTopMoversSnapshot } from 'lib/trending/buildServerTopMoversSnapshot'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload = await buildServerTopMoversSnapshot()
    // Paid placements have minute-level countdowns and must become visible
    // shortly after receipt verification. Market rows remain edge cached.
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')
    return res.status(200).json(payload)
  } catch {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(503).json({
      error: 'TOP_MOVERS_UNAVAILABLE',
      message: 'The indexed market snapshot is temporarily unavailable.',
    })
  }
}

export default handler
