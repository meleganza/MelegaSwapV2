import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'
import { readPortfolio } from '../../lib/portfolioRpc'

export default async function portfolio(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, executable: false, custody: false })
    return
  }
  const body = req.body as { address?: unknown; chainId?: unknown }
  const result = await readPortfolio({
    address: typeof body?.address === 'string' ? body.address : undefined,
    chainId: typeof body?.chainId === 'number' ? body.chainId : undefined,
  })
  res.status(result.ok ? 200 : result.code === 'QUOTE_TIMEOUT' ? 504 : 422).json(result)
}
