import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { fetchCanonicalRouteAuthority } from 'lib/marco-bridge/routeAuthority'
import { simulateMarcoBridgeBuild } from 'lib/marco-bridge/simulate'
import { buildMarcoBridgeTransactions, type UnsignedEvmBridgeTx } from 'lib/marco-bridge/transactionBuilder'
import { MarcoBridgeError, type MarcoBridgeNetworkId, type MarcoBridgeQuote } from 'lib/marco-bridge/types'
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'

const isNetworkId = (value: unknown): value is MarcoBridgeNetworkId =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(MARCO_WAVE1_NETWORKS, value)

function resolveRpcUrl(chainId: number): string {
  if (chainId === 56) return process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-rpc.publicnode.com'
  if (chainId === 4663) {
    return process.env.ROBINHOOD_RPC_URL || process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com'
  }
  throw new MarcoBridgeError('QUOTE_FAILED', `No simulation RPC is configured for chain ${chainId}.`)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }
  try {
    const { from, to, amount, sourceWallet, destinationWallet, quote, allowanceLD } = req.body ?? {}
    if (!isNetworkId(from) || !isNetworkId(to) || typeof amount !== 'string' || typeof sourceWallet !== 'string') {
      throw new MarcoBridgeError('QUOTE_FAILED', 'Invalid bridge simulation request.')
    }
    if (!quote || quote.live !== true || typeof quote.nativeFeeWei !== 'string') {
      throw new MarcoBridgeError('QUOTE_FAILED', 'A fresh live quote is required before simulation.')
    }
    const authority = await fetchCanonicalRouteAuthority()
    const built = buildMarcoBridgeTransactions(
      { from, to, amount, sourceWallet, destinationWallet, allowanceLD },
      quote as MarcoBridgeQuote,
      authority,
    )
    const simulation = await simulateMarcoBridgeBuild(built, {
      async ethCall(tx: UnsignedEvmBridgeTx) {
        const provider = new ethers.providers.StaticJsonRpcProvider(resolveRpcUrl(tx.chainId), tx.chainId)
        try {
          await provider.call({ from: tx.from, to: tx.to, data: tx.data, value: tx.value })
          return { ok: true, reverted: false, reason: 'eth_call succeeded.' }
        } catch (cause) {
          const reason = cause instanceof Error ? cause.message : 'eth_call reverted.'
          return { ok: false, reverted: true, reason }
        }
      },
    })
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json(simulation)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Bridge simulation failed.'
    const code = cause instanceof MarcoBridgeError ? cause.code : 'QUOTE_FAILED'
    return res.status(503).json({ error: code, message })
  }
}
