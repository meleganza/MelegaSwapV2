import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'
import { readEarnPositions } from '../../lib/earnPositionsRpc'

export default async function earnPositions(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, rows: [], executable: false, deposit: false })
    return
  }
  const body = req.body as { chainId?: unknown; address?: unknown }
  const result = await readEarnPositions({
    chainId: typeof body?.chainId === 'number' ? body.chainId : undefined,
    address: typeof body?.address === 'string' ? body.address : undefined,
  })
  const status = result.ok ? 200 : result.code === 'TIMEOUT' ? 504 : 422
  res.status(status).json(result)
}
