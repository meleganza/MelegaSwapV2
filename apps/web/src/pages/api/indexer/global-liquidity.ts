import type { NextApiHandler } from 'next'
import { getGlobalLiquiditySnapshot } from 'lib/global-liquidity/server'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const snapshot = await getGlobalLiquiditySnapshot(req.query.refresh === '1')
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
    return res.status(snapshot.status === 'unavailable' ? 503 : 200).json(snapshot)
  } catch (error) {
    return res.status(503).json({
      status: 'unavailable',
      error: error instanceof Error ? error.message : 'Global liquidity census failed',
    })
  }
}

export default handler
