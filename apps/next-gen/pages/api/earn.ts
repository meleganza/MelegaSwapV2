import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'
import { readEarn } from '../../lib/earnRpc'

export default async function earn(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, aprPercent: null, tvlUsd: null, executable: false })
    return
  }
  const body = req.body as { chainId?: unknown }
  const result = await readEarn({ chainId: typeof body?.chainId === 'number' ? body.chainId : undefined })
  res.status(result.ok ? 200 : result.code === 'QUOTE_TIMEOUT' ? 504 : 422).json(result)
}
