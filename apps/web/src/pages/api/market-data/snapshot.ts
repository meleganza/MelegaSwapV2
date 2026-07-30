import type { NextApiHandler } from 'next'
import { buildCanonicalMarketSnapshot } from 'lib/market-data/canonicalMarketSnapshot'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = await buildCanonicalMarketSnapshot()
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res.status(200).json(body)
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'canonical market snapshot failed',
    })
  }
}

export default handler
