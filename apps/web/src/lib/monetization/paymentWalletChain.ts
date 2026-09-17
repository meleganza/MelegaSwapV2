/**
 * Boost / MARCO Pay settlement must validate the payment wallet chain,
 * not the DEX browsing context (?chain=ethereum) or wagmi signer network.
 */
import { Web3Provider } from '@ethersproject/providers'
import { resolveWalletProvider, type EthereumProvider } from 'lib/deployment-orchestrator/founderWalletTx'
import { RC_COPY } from './copy'

export const PAYMENT_SETTLEMENT_CHAIN_ID = 56 as const

export type PaymentWalletSigner = {
  getChainId?: () => Promise<number>
  sendTransaction: (tx: {
    to?: string
    value?: string
    data?: string
    chainId?: number
  }) => Promise<{ hash: string; wait?: (confirmations?: number) => Promise<unknown> }>
}

export function parsePaymentWalletChainId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && /^0x[0-9a-fA-F]+$/.test(value)) return Number.parseInt(value, 16)
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number.parseInt(value, 10)
  return null
}

export async function readPaymentWalletChainId(preferred?: EthereumProvider | null): Promise<number | null> {
  const eth = resolveWalletProvider(preferred ?? null)
  if (!eth) return null
  try {
    const hex = await eth.request({ method: 'eth_chainId', params: [] })
    return parsePaymentWalletChainId(hex)
  } catch {
    return null
  }
}

export function assessPaymentWalletChain(chainId: number | null | undefined): {
  ok: boolean
  stage: 'ready' | 'switch_network'
  message: string | null
} {
  if (chainId === PAYMENT_SETTLEMENT_CHAIN_ID) {
    return { ok: true, stage: 'ready', message: null }
  }
  return { ok: false, stage: 'switch_network', message: RC_COPY.wrongNetwork }
}

export async function resolvePaymentWalletForSettlement(input: {
  preferredProvider?: EthereumProvider | null
  fallbackSigner?: PaymentWalletSigner | null
}): Promise<{
  chainId: number | null
  signer: PaymentWalletSigner | null
  source: 'payment_wallet' | 'fallback_signer' | 'none'
}> {
  const walletChainId = await readPaymentWalletChainId(input.preferredProvider)
  if (walletChainId === PAYMENT_SETTLEMENT_CHAIN_ID) {
    const eth = resolveWalletProvider(input.preferredProvider ?? null)
    if (eth) {
      return {
        chainId: walletChainId,
        signer: new Web3Provider(eth, 'any').getSigner(),
        source: 'payment_wallet',
      }
    }
  }
  if (walletChainId != null) {
    return { chainId: walletChainId, signer: input.fallbackSigner ?? null, source: 'payment_wallet' }
  }

  let fallbackChain: number | null = null
  try {
    const raw = await input.fallbackSigner?.getChainId?.()
    fallbackChain = parsePaymentWalletChainId(raw)
  } catch {
    fallbackChain = null
  }
  if (input.fallbackSigner) {
    return { chainId: fallbackChain, signer: input.fallbackSigner, source: 'fallback_signer' }
  }
  return { chainId: fallbackChain, signer: null, source: 'none' }
}
