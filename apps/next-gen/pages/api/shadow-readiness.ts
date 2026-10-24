import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'
import { readShadowReadiness } from '../../lib/shadowReadinessRpc'
import type { ShadowQuoteInput } from '../../lib/shadowReadiness'

function quoteInput(value: unknown): ShadowQuoteInput | null {
  if (!value || typeof value !== 'object') return null
  const quote = value as ShadowQuoteInput
  return {
    quotedAt: typeof quote.quotedAt === 'string' ? quote.quotedAt : undefined,
    staleAfterMs: typeof quote.staleAfterMs === 'number' ? quote.staleAfterMs : undefined,
    sell: typeof quote.sell === 'string' ? quote.sell : undefined,
    buy: typeof quote.buy === 'string' ? quote.buy : undefined,
    amount: typeof quote.amount === 'string' ? quote.amount : undefined,
    amountInRaw: typeof quote.amountInRaw === 'string' ? quote.amountInRaw : undefined,
    amountOutRaw: typeof quote.amountOutRaw === 'string' ? quote.amountOutRaw : undefined,
    router: typeof quote.router === 'string' ? quote.router : undefined,
    venueId: typeof quote.venueId === 'string' ? quote.venueId : undefined,
    path: Array.isArray(quote.path) ? quote.path.filter((item): item is string => typeof item === 'string') : undefined,
  }
}

export default async function shadowReadiness(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, executable: false, unsignedTx: null, feeCollected: false })
    return
  }
  const body = req.body as { chainId?: unknown; address?: unknown; quote?: unknown }
  const result = await readShadowReadiness({
    chainId: typeof body?.chainId === 'number' ? body.chainId : undefined,
    address: typeof body?.address === 'string' ? body.address : undefined,
    quote: quoteInput(body?.quote),
  })
  const status = result.ok ? 200 : result.code === 'QUOTE_TIMEOUT' ? 504 : 422
  res.status(status).json(result)
}
