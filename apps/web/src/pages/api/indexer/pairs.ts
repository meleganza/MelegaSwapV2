import type { NextApiHandler } from 'next'
import { queryAmmPairsAsync } from 'lib/bsc-indexer/pairs/registry'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const q = typeof req.query.q === 'string' ? req.query.q : undefined
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 50
  const classification = typeof req.query.classification === 'string' ? req.query.classification : undefined

  const result = await queryAmmPairsAsync({ q, page, pageSize, classification })

  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
  return res.status(200).json({
    status: result.total > 0 ? 'ready' : 'empty',
    ...result,
    dataSource: 'direct-contract-state-registry',
    discoveryMethod: 'factory-allPairs-enumeration',
  })
}

export default handler
