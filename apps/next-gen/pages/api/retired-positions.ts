import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'
import { readRetiredPositions } from '../../lib/retiredPositionsRpc'

export default async function retiredPositions(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, state: 'unknown', rows: [], deposit: false, withdraw: false, executable: false })
    return
  }
  const body = req.body as { chainId?: unknown; address?: unknown }
  const result = await readRetiredPositions({
    chainId: typeof body?.chainId === 'number' ? body.chainId : undefined,
    address: typeof body?.address === 'string' ? body.address : undefined,
  })
  const status = result.ok ? 200 : 422
  res.status(status).json(result)
}
