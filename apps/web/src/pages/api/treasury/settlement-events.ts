import type { NextApiHandler } from 'next'
import { DEX_ECONOMIC_AUTHORITY } from 'config/dexEconomicAuthority'

/**
 * Treasury Runtime intake proxy — decommissioned.
 * Never forwards to treasury.melega.ai. Swap success does not depend on this endpoint.
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ reason: 'Method not allowed' })
  }

  return res.status(410).json({
    status: 'decommissioned',
    machine_code: 'TREASURY_RUNTIME_DECOMMISSIONED',
    reason: 'Treasury Runtime has been decommissioned and has no authority in Melega DEX',
    authority: DEX_ECONOMIC_AUTHORITY.treasuryRuntime.authority,
    runtime_dependency: DEX_ECONOMIC_AUTHORITY.treasuryRuntime.runtime_dependency,
    replacement_beneficiary: DEX_ECONOMIC_AUTHORITY.beneficiaryAddress,
    beneficiary_label: DEX_ECONOMIC_AUTHORITY.beneficiaryLabel,
  })
}

export default handler
