import type { NextApiHandler } from 'next'
import { buildServerTopMoversSnapshot } from 'lib/trending/buildServerTopMoversSnapshot'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload = await buildServerTopMoversSnapshot()
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
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
