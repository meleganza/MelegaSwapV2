import type { NextApiHandler } from 'next'
import { fetchMarcoPairLiquidity } from 'lib/trade-market/fetchMarcoPairLiquidity'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const snapshot = await fetchMarcoPairLiquidity()
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(snapshot)
  } catch (error) {
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30')
    return res.status(503).json({
      status: 'unavailable',
      reason: error instanceof Error ? error.message : 'Pair reserve request failed',
      checkedAt: new Date().toISOString(),
    })
  }
}

export default handler
