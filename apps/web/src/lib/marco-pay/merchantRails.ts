/**
 * Merchant settlement rails for MARCO Pay.
 *
 * Token identities come from the existing Wave-1 registry. Pay-rail authority
 * status is not inferred from bridge pause flags and is not marked LIVE here.
 * Checkout chains are the Wave-1 registry. The canonical Passport gateway proves
 * a live payment with settlement.family, chain_id, token_address, tx_hash and
 * proven=true. When MARCO_PAY_EVM_CONSENTED_CHAIN_IDS is unset, every registry
 * EVM chain may use the verified Melega merchant address. An explicit list
 * restricts that set. Solana uses MARCO_PAY_SOLANA_MERCHANT_PUBKEY only.
 * This module does not broadcast a transaction.
 */
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'
import { resolveMarcoPaySettlementWallet } from './settlement'

export const MARCO_PAY_CONSUMER_CONTRACT = {
  schemaId: 'https://marco.melega.ai/schemas/marco-pay-payment-completed.v1.json',
  schemaVersion: '1',
  machineInterface: 'MP103_MACHINE_INTERFACE_V1',
  machineInterfaceVersion: '1',
  leadGateway: 'meleganza/melega-civ-passport#23',
} as const

export type MerchantRailId = 'bnb' | 'base' | 'polygon' | 'robinhood' | 'arc' | 'solana'

export type MerchantPayRail = {
  id: MerchantRailId
  label: string
  chainId: number | null
  family: 'evm' | 'solana'
  token: string
  tokenDecimals: number
  executable: boolean
  status: 'configured' | 'prepared'
  reason: string | null
  detail: string
  settlementWallet: string | null
}

type RailSpec = Omit<MerchantPayRail, 'executable' | 'status' | 'reason' | 'detail' | 'settlementWallet'>

const RAIL_SPECS: readonly RailSpec[] = [
  {
    id: 'bnb',
    label: 'BNB Smart Chain',
    chainId: MARCO_WAVE1_NETWORKS.bnb.chainId,
    family: 'evm',
    token: MARCO_WAVE1_NETWORKS.bnb.marcoIdentity,
    tokenDecimals: MARCO_WAVE1_NETWORKS.bnb.tokenDecimals,
  },
  {
    id: 'base',
    label: 'Base',
    chainId: MARCO_WAVE1_NETWORKS.base.chainId,
    family: 'evm',
    token: MARCO_WAVE1_NETWORKS.base.marcoIdentity,
    tokenDecimals: MARCO_WAVE1_NETWORKS.base.tokenDecimals,
  },
  {
    id: 'polygon',
    label: 'Polygon',
    chainId: MARCO_WAVE1_NETWORKS.polygon.chainId,
    family: 'evm',
    token: MARCO_WAVE1_NETWORKS.polygon.marcoIdentity,
    tokenDecimals: MARCO_WAVE1_NETWORKS.polygon.tokenDecimals,
  },
  {
    id: 'robinhood',
    label: 'Robinhood Chain',
    chainId: MARCO_WAVE1_NETWORKS.robinhood.chainId,
    family: 'evm',
    token: MARCO_WAVE1_NETWORKS.robinhood.marcoIdentity,
    tokenDecimals: MARCO_WAVE1_NETWORKS.robinhood.tokenDecimals,
  },
  {
    id: 'arc',
    label: 'Arc',
    chainId: MARCO_WAVE1_NETWORKS.arc.chainId,
    family: 'evm',
    token: MARCO_WAVE1_NETWORKS.arc.marcoIdentity,
    tokenDecimals: MARCO_WAVE1_NETWORKS.arc.tokenDecimals,
  },
  {
    id: 'solana',
    label: 'Solana',
    chainId: null,
    family: 'solana',
    token: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
    tokenDecimals: MARCO_WAVE1_NETWORKS.solana.tokenDecimals,
  },
]

export function readEvmConsentedChainIds(env: NodeJS.ProcessEnv = process.env): ReadonlySet<number> {
  const raw = env.MARCO_PAY_EVM_CONSENTED_CHAIN_IDS?.trim() || ''
  if (!raw) {
    return new Set(
      RAIL_SPECS.flatMap((rail) => (rail.family === 'evm' && rail.chainId != null ? [rail.chainId] : [])),
    )
  }
  const ids = new Set<number>()
  for (const part of raw.split(',')) {
    const trimmed = part.trim()
    if (!/^\d+$/.test(trimmed)) continue
    ids.add(Number(trimmed))
  }
  return ids
}

export function readSolanaMerchantPubkey(env: NodeJS.ProcessEnv = process.env): string | null {
  const value = env.MARCO_PAY_SOLANA_MERCHANT_PUBKEY?.trim() || ''
  return value || null
}

export function merchantRailForChain(chainId: number | null | undefined): RailSpec | null {
  if (chainId == null) return null
  return RAIL_SPECS.find((rail) => rail.chainId === chainId) ?? null
}

export function merchantRailForNetwork(networkId: string | null | undefined): RailSpec | null {
  if (!networkId) return null
  return RAIL_SPECS.find((rail) => rail.id === networkId) ?? null
}

export function resolveMerchantPayRail(input: {
  chainId?: number | null
  networkId?: string | null
  env?: NodeJS.ProcessEnv
}): MerchantPayRail {
  const env = input.env ?? process.env
  const byNetwork = input.networkId ? merchantRailForNetwork(input.networkId) : null
  const byChain = input.chainId != null ? merchantRailForChain(input.chainId) : null
  if (input.networkId && !byNetwork) throw new Error('CHAIN_MISMATCH')
  if (input.chainId != null && !byChain) throw new Error('CHAIN_MISMATCH')
  if (byNetwork && byChain && byNetwork.id !== byChain.id) throw new Error('CHAIN_MISMATCH')
  const spec = byNetwork ?? byChain
  if (!spec) throw new Error('CHAIN_MISMATCH')
  if (spec.family === 'solana') {
    const pubkey = readSolanaMerchantPubkey(env)
    if (!pubkey) throw new Error('SOLANA_MERCHANT_PUBKEY_UNCONFIGURED')
    return {
      ...spec,
      executable: true,
      status: 'configured',
      reason: null,
      detail: 'Solana checkout uses the configured merchant pubkey. This is not a settlement attestation.',
      settlementWallet: pubkey,
    }
  }
  if (spec.chainId == null || !readEvmConsentedChainIds(env).has(spec.chainId)) {
    throw new Error('MERCHANT_NETWORK_NOT_CONFIGURED')
  }
  const wallet = resolveMarcoPaySettlementWallet()
  if (!wallet.ok || !wallet.wallet) throw new Error(wallet.reason || 'SETTLEMENT_WALLET_INVALID')
  return {
    ...spec,
    executable: true,
    status: 'configured',
    reason: null,
    detail: 'EVM checkout may use the verified merchant address because this chain id is consented. This is not a settlement attestation.',
    settlementWallet: wallet.wallet,
  }
}

function preparedRail(spec: RailSpec, reason: string): MerchantPayRail {
  const detail =
    reason === 'SOLANA_MERCHANT_PUBKEY_UNCONFIGURED'
        ? 'Solana stays closed until MARCO_PAY_SOLANA_MERCHANT_PUBKEY is configured. The EVM treasury is not used.'
        : reason === 'MERCHANT_NETWORK_NOT_CONFIGURED'
          ? 'The verified EVM merchant address is not consented for this chain.'
          : 'This rail is not available for checkout.'
  return {
    ...spec,
    executable: false,
    status: 'prepared',
    reason,
    detail,
    settlementWallet: null,
  }
}

export function listMerchantPayRails(env: NodeJS.ProcessEnv = process.env): readonly MerchantPayRail[] {
  return RAIL_SPECS.map((spec) => {
    try {
      return resolveMerchantPayRail(spec.family === 'solana' ? { networkId: spec.id, env } : { chainId: spec.chainId, env })
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : 'CHAIN_NOT_EXECUTABLE'
      return preparedRail(spec, reason)
    }
  })
}

export function assertObservedPayChain(chainId: number | null, invalidChainToken = false, env: NodeJS.ProcessEnv = process.env): number {
  if (invalidChainToken) throw new Error('CHAIN_MISMATCH')
  const resolved = resolveMerchantPayRail({ chainId: chainId ?? 56, env })
  if (resolved.chainId == null) throw new Error('CHAIN_MISMATCH')
  return resolved.chainId
}

export function assertPaySettlementBinding(input: {
  chainId?: number | null
  networkId?: string | null
  token?: string | null
  recipient?: string | null
  env?: NodeJS.ProcessEnv
}): MerchantPayRail {
  const rail = resolveMerchantPayRail({
    chainId: input.networkId === 'solana' ? null : input.chainId ?? 56,
    networkId: input.networkId === 'solana' ? 'solana' : input.networkId && input.chainId == null ? input.networkId : null,
    env: input.env,
  })
  if (input.token && !settlementAssetMatches(rail, input.token)) throw new Error('TOKEN_MISMATCH')
  if (input.recipient && rail.settlementWallet) {
    const same =
      rail.family === 'evm'
        ? input.recipient.trim().toLowerCase() === rail.settlementWallet.toLowerCase()
        : input.recipient.trim() === rail.settlementWallet
    if (!same) throw new Error('SETTLEMENT_WALLET_NOT_TREASURY')
  }
  return rail
}

export function assertProvenGatewaySettlement(input: {
  family: 'evm' | 'solana'
  chainId: number | null
  tokenAddress: string
  orderChainId: number | null
  orderNetworkId: string | null
  env?: NodeJS.ProcessEnv
}): MerchantPayRail {
  if (input.family === 'solana') {
    if (input.chainId != null || (input.orderNetworkId != null && input.orderNetworkId !== 'solana') || input.orderChainId != null) {
      throw new Error('CHAIN_MISMATCH')
    }
    const rail = resolveMerchantPayRail({ networkId: 'solana', env: input.env })
    if (!settlementAssetMatches(rail, input.tokenAddress)) throw new Error('TOKEN_MISMATCH')
    return rail
  }
  if (input.chainId == null) throw new Error('CHAIN_MISMATCH')
  const rail = resolveMerchantPayRail({ chainId: input.chainId, env: input.env })
  if (rail.family !== 'evm' || !settlementAssetMatches(rail, input.tokenAddress)) throw new Error('TOKEN_MISMATCH')
  if (input.orderChainId != null && input.orderChainId !== input.chainId) throw new Error('CHAIN_MISMATCH')
  if (input.orderNetworkId === 'solana') throw new Error('CHAIN_MISMATCH')
  return rail
}

export function settlementAssetMatches(rail: Pick<MerchantPayRail, 'family' | 'token'>, asset: string | null | undefined): boolean {
  if (!asset) return false
  return rail.family === 'evm' ? asset.trim().toLowerCase() === rail.token.toLowerCase() : asset.trim() === rail.token
}

/** Public status strings that must never fulfill a service. PAID is intermediate. */
export function isAuthoritativeMarcoPaidStatus(status: string | null | undefined): boolean {
  return (status || '').trim().toUpperCase() === 'COMPLETED'
}

export function payRailCatalog(): readonly RailSpec[] {
  return RAIL_SPECS.map((spec) => ({ ...spec }))
}
