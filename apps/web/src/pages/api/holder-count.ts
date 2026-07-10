import type { NextApiHandler } from 'next'
import { z } from 'zod'
import { fetchHolderCount } from 'lib/holder-count/fetchHolderCount'
import { resolveBscScanApiKey } from 'lib/holder-count/resolveBscScanApiKey'

const querySchema = z.object({
  chainId: z.coerce.number().int().positive(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
})

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = querySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() })
  }

  const { chainId, address } = parsed.data
  const keyInfo = resolveBscScanApiKey()

  if (!keyInfo.apiKey) {
    return res.status(503).json({
      status: 'unavailable',
      reason: 'Source not configured',
      source: 'unavailable',
      diagnostic: 'Set BSCSCAN_API_KEY in Vercel Production (server-side secret) and redeploy',
      envSource: keyInfo.source,
      checkedAt: new Date().toISOString(),
    })
  }

  const result = await fetchHolderCount(chainId, address, keyInfo.apiKey)

  return res.status(result.status === 'ready' ? 200 : 502).json({
    ...result,
    envSource: keyInfo.source,
    typoAliasUsed: keyInfo.typoAliasUsed,
  })
}

export default handler
