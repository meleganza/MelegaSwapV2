import type { NextApiHandler } from 'next'
import { buildProductionReadinessReport } from 'lib/bsc-indexer/readiness'

const handler: NextApiHandler = async (_req, res) => {
  const report = await buildProductionReadinessReport()
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
  return res.status(200).json(report)
}

export default handler
