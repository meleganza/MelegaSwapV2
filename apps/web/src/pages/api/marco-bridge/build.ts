import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchCanonicalRouteAuthority } from 'lib/marco-bridge/routeAuthority'
import { buildMarcoBridgeTransactions } from 'lib/marco-bridge/transactionBuilder'
import { MarcoBridgeError, type MarcoBridgeNetworkId, type MarcoBridgeQuote } from 'lib/marco-bridge/types'
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'

const isNetworkId = (value: unknown): value is MarcoBridgeNetworkId =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(MARCO_WAVE1_NETWORKS, value)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }
  try {
    const { from, to, amount, sourceWallet, destinationWallet, quote, allowanceLD } = req.body ?? {}
    if (!isNetworkId(from) || !isNetworkId(to) || typeof amount !== 'string' || typeof sourceWallet !== 'string') {
      throw new MarcoBridgeError('QUOTE_FAILED', 'Invalid bridge build request.')
    }
    if (!quote || quote.live !== true || typeof quote.nativeFeeWei !== 'string') {
      throw new MarcoBridgeError('QUOTE_FAILED', 'A fresh live quote is required before building transactions.')
    }
    const authority = await fetchCanonicalRouteAuthority()
    const built = buildMarcoBridgeTransactions(
      { from, to, amount, sourceWallet, destinationWallet, allowanceLD },
      quote as MarcoBridgeQuote,
      authority,
    )
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json(built)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Bridge transaction build failed.'
    const code = cause instanceof MarcoBridgeError ? cause.code : 'QUOTE_FAILED'
    return res.status(code === 'INVALID_DESTINATION' ? 400 : 503).json({ error: code, message })
  }
}
