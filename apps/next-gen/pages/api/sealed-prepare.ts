import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'
import { prepareSealedBnbSwap } from '../../lib/sealedPrepare'

export default async function sealedPrepare(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, unsignedTx: null, broadcast: false, signed: false })
    return
  }
  const body = req.body as {
    chainId?: unknown
    sell?: unknown
    buy?: unknown
    amount?: unknown
    user?: unknown
    slippageBps?: unknown
  }
  const result = await prepareSealedBnbSwap({
    chainId: typeof body?.chainId === 'number' ? body.chainId : undefined,
    sell: typeof body?.sell === 'string' ? body.sell : undefined,
    buy: typeof body?.buy === 'string' ? body.buy : undefined,
    amount: typeof body?.amount === 'string' ? body.amount : undefined,
    user: typeof body?.user === 'string' ? body.user : undefined,
    slippageBps: typeof body?.slippageBps === 'number' ? body.slippageBps : undefined,
  })
  const status = result.ok ? 200 : result.code === 'COMPETITION_UNAVAILABLE' ? 503 : 422
  res.status(status).json(result)
}
