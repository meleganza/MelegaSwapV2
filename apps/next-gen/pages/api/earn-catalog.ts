import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'
import { readEarnCatalog } from '../../lib/earnCatalogRpc'

export default async function earnCatalog(_req: NextApiRequest, res: NextApiResponse): Promise<void> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  if (_req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ ok: false, opportunities: [], executable: false, deposit: false })
    return
  }
  const result = await readEarnCatalog()
  const status = result.ok ? 200 : result.code === 'TIMEOUT' ? 504 : 503
  res.status(status).json(result)
}
