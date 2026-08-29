import type { NextApiRequest, NextApiResponse } from 'next'
import { buildSolanaMarcoSend } from 'lib/marco-bridge/solanaExecution.server'
import { fetchCanonicalRouteAuthority } from 'lib/marco-bridge/routeAuthority'
import type { MarcoBridgeQuoteRequest } from 'lib/marco-bridge/service'
import { MarcoBridgeError } from 'lib/marco-bridge/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }
  try {
    const request = req.body as MarcoBridgeQuoteRequest
    if (!request || typeof request.sourceWallet !== 'string' || typeof request.destinationWallet !== 'string') {
      throw new MarcoBridgeError('QUOTE_FAILED', 'Invalid Solana bridge request.')
    }
    const result = await buildSolanaMarcoSend(request, await fetchCanonicalRouteAuthority())
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json(result)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Solana transaction build failed.'
    const code = cause instanceof MarcoBridgeError ? cause.code : 'QUOTE_FAILED'
    return res.status(code === 'PUBLIC_ACTIVATION_REQUIRED' ? 409 : 503).json({ error: code, message })
  }
}
