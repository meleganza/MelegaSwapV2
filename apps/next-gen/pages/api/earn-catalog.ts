import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'
import { emptyCatalog } from '../../lib/earnCatalog'
import { readEarnCatalog } from '../../lib/earnCatalogRpc'

function requestedChain(value: string | string[] | undefined): number | undefined {
  if (value === undefined) return undefined
  const raw = Array.isArray(value) ? value[0] : value
  if (!/^\d+$/.test(raw)) return Number.NaN
  return Number(raw)
}

export default async function earnCatalog(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ ok: false, opportunities: [], executable: false, deposit: false })
    return
  }
  const chainId = requestedChain(req.query.chainId)
  if (Number.isNaN(chainId)) {
    res.status(422).json(emptyCatalog('CHAIN_MISMATCH'))
    return
  }
  const result = await readEarnCatalog({ chainId })
  const status = result.ok ? 200 : result.code === 'TIMEOUT' ? 504 : 503
  res.status(status).json(result)
}
