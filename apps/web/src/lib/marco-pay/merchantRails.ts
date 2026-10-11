/**
 * Merchant settlement rails for MARCO Pay.
 *
 * BNB is the only executable checkout rail: the canonical MARCO token is live
 * and the Melega treasury is the verified receiving wallet. Base, Polygon,
 * Robinhood, Arc, and Solana are prepared from the public MARCO token registry.
 * A prepared rail is refused for checkout until a verified merchant wallet and
 * a settlement proof path exist for that chain. This module never broadcasts
 * a transaction.
 */
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'
import { MARCO_PAY_SETTLEMENT_WALLET } from './settlement'

export type MerchantRailId = 'bnb' | 'base' | 'polygon' | 'robinhood' | 'arc' | 'solana'

export type MerchantPayRail = {
  id: MerchantRailId
  label: string
  chainId: number | null
  family: 'evm' | 'solana'
  token: string
  executable: boolean
  status: 'executable' | 'prepared'
  reason: string | null
  detail: string
  settlementWallet: string | null
}

const TREASURY = MARCO_PAY_SETTLEMENT_WALLET

export const MERCHANT_PAY_RAILS: readonly MerchantPayRail[] = [
  {
    id: 'bnb',
    label: 'BNB Smart Chain',
    chainId: MARCO_WAVE1_NETWORKS.bnb.chainId,
    family: 'evm',
    token: MARCO_WAVE1_NETWORKS.bnb.marcoIdentity,
    executable: true,
    status: 'executable',
    reason: null,
    detail: 'Canonical MARCO on BNB and the verified Melega merchant wallet can settle and be proven.',
    settlementWallet: TREASURY,
  },
  {
    id: 'base',
    label: 'Base',
    chainId: MARCO_WAVE1_NETWORKS.base.chainId,
    family: 'evm',
    token: MARCO_WAVE1_NETWORKS.base.marcoIdentity,
    executable: false,
    status: 'prepared',
    reason: 'BASE_AUTHORITY_COMING_SOON',
    detail: 'MARCO publishes Base as coming soon. Checkout stays closed on this rail.',
    settlementWallet: null,
  },
  {
    id: 'polygon',
    label: 'Polygon',
    chainId: MARCO_WAVE1_NETWORKS.polygon.chainId,
    family: 'evm',
    token: MARCO_WAVE1_NETWORKS.polygon.marcoIdentity,
    executable: false,
    status: 'prepared',
    reason: 'MERCHANT_WALLET_NOT_VERIFIED_FOR_CHAIN',
    detail: 'Canonical MARCO on Polygon is live. The verified merchant wallet is bound on BNB only.',
    settlementWallet: null,
  },
  {
    id: 'robinhood',
    label: 'Robinhood Chain',
    chainId: MARCO_WAVE1_NETWORKS.robinhood.chainId,
    family: 'evm',
    token: MARCO_WAVE1_NETWORKS.robinhood.marcoIdentity,
    executable: false,
    status: 'prepared',
    reason: 'MERCHANT_WALLET_NOT_VERIFIED_FOR_CHAIN',
    detail: 'Canonical MARCO on Robinhood is live. The verified merchant wallet is bound on BNB only.',
    settlementWallet: null,
  },
  {
    id: 'arc',
    label: 'Arc',
    chainId: MARCO_WAVE1_NETWORKS.arc.chainId,
    family: 'evm',
    token: MARCO_WAVE1_NETWORKS.arc.marcoIdentity,
    executable: false,
    status: 'prepared',
    reason: 'MERCHANT_WALLET_NOT_VERIFIED_FOR_CHAIN',
    detail: 'Canonical MARCO on Arc is live. The verified merchant wallet is bound on BNB only.',
    settlementWallet: null,
  },
  {
    id: 'solana',
    label: 'Solana',
    chainId: null,
    family: 'solana',
    token: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
    executable: false,
    status: 'prepared',
    reason: 'SOLANA_MERCHANT_WALLET_UNVERIFIED',
    detail: 'The canonical SPL mint is live. No verified Solana merchant wallet is registered, so checkout cannot settle or prove payment.',
    settlementWallet: null,
  },
]

export function listMerchantPayRails(): readonly MerchantPayRail[] {
  return MERCHANT_PAY_RAILS
}

export function merchantRailForChain(chainId: number | null | undefined): MerchantPayRail | null {
  if (chainId == null) return null
  return MERCHANT_PAY_RAILS.find((rail) => rail.chainId === chainId) ?? null
}

export function executableMerchantRail(): MerchantPayRail {
  const rail = MERCHANT_PAY_RAILS.find((item) => item.executable)
  if (!rail?.settlementWallet || rail.chainId == null) throw new Error('SETTLEMENT_RAIL_UNAVAILABLE')
  return rail
}

/**
 * Bind a MARCO-reported chain to a merchant rail.
 * A missing chain stays on the executable BNB rail. An unknown chain, a
 * non-numeric chain token, or a prepared rail is refused.
 */
export function assertObservedPayChain(chainId: number | null, invalidChainToken = false): number {
  if (invalidChainToken) throw new Error('CHAIN_MISMATCH')
  const resolved = chainId ?? executableMerchantRail().chainId!
  const rail = merchantRailForChain(resolved)
  if (!rail) throw new Error('CHAIN_MISMATCH')
  if (!rail.executable || !rail.settlementWallet) throw new Error('CHAIN_NOT_EXECUTABLE')
  return resolved
}

/** Public status strings that must never fulfill a service. PAID is intermediate. */
export function isAuthoritativeMarcoPaidStatus(status: string | null | undefined): boolean {
  return (status || '').trim().toUpperCase() === 'COMPLETED'
}
