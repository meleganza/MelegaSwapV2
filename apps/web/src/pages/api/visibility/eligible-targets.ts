import type { NextApiHandler } from 'next'
import { listEligibleFarmTargets, listEligiblePoolTargets } from 'lib/monetization/eligibleVisibilityTargets'

const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const service = String(req.query.service || '')
  const chainId = Number(req.query.chainId)
  const address = String(req.query.address || '').trim()
  const symbol = String(req.query.symbol || '').trim()
  if (!['featured-farm', 'featured-pool'].includes(service)) {
    return res.status(400).json({ error: 'Unsupported visibility target service' })
  }
  if (!Number.isInteger(chainId) || !/^0x[a-fA-F0-9]{40}$/.test(address) || !symbol) {
    return res.status(400).json({ error: 'chainId, token address and symbol are required' })
  }

  const identity = { chainId, address, symbol }
  const targets = service === 'featured-farm' ? listEligibleFarmTargets(identity) : listEligiblePoolTargets(identity)

  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
  return res.status(200).json({
    schema: 'melega.visibility-eligible-targets.v1',
    service,
    token: identity,
    count: targets.length,
    targets,
  })
}

export default handler
