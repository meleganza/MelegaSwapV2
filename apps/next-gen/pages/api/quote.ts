import type { NextApiRequest, NextApiResponse } from 'next'
import { previewBnbQuote } from '../../lib/bscQuoteRpc'
import { SECURITY_HEADERS } from '../../lib/betaGate'

export default async function quote(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, executable: false })
    return
  }
  const body = req.body as { chainId?: unknown; sell?: unknown; buy?: unknown; amount?: unknown }
  const result = await previewBnbQuote({
    chainId: typeof body?.chainId === 'number' ? body.chainId : undefined,
    sell: typeof body?.sell === 'string' ? body.sell : undefined,
    buy: typeof body?.buy === 'string' ? body.buy : undefined,
    amount: typeof body?.amount === 'string' ? body.amount : undefined,
  })
  res.status(result.ok ? 200 : result.code === 'QUOTE_TIMEOUT' ? 504 : 422).json(result)
}
