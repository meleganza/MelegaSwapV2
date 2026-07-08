import { D87_DEX_PRICING_RATIFIED, FSC_01 } from './codex/ratified'
import { isBuyMarcoByAddress } from 'lib/melega-smart-router/marcoRegistry'

export const D87_PRICING_CODEX_ID = D87_DEX_PRICING_RATIFIED.id
export const FSC_01_POLICY_REF = FSC_01.policyRef
export const SRD_01_POLICY_REF = 'codex://SRD-01'

export type D87ServiceKey =
  | 'token_creation'
  | 'token_self_listing'
  | 'pool_creation'
  | 'liquidity_provision'
  | 'swap'
  | 'farm_creation'
  | 'staking_pool_creation'
  | 'launchpad_integration'

const MARCO_ADDRESSES = new Set(
  [
    '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    '0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76',
    '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2',
    '0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7',
  ].map((a) => a.toLowerCase()),
)

export function getD87PricingCodex() {
  return D87_DEX_PRICING_RATIFIED
}

export function getFsc01Constitution() {
  return FSC_01
}

export function formatUsdcPrice(amount: number): string {
  if (amount === 0) return 'FREE'
  return `${amount} USDC`
}

export function formatMarcoEquivalentPrice(amount: number): string {
  if (amount === 0) return 'FREE'
  return `${amount} USDC equivalent (MARCO)`
}

export function getServicePricing(service: D87ServiceKey) {
  return getD87PricingCodex().services[service]
}

export function getServicePriceLabel(
  service: Exclude<D87ServiceKey, 'swap'>,
  payment: 'standard' | 'marco' = 'standard',
): string {
  const sku = getServicePricing(service) as {
    free?: boolean
    standardUsdc?: number
    marcoUsdcEquivalent?: number
  }
  if (sku.free || sku.standardUsdc === 0) return 'FREE'
  if (payment === 'marco' && sku.marcoUsdcEquivalent != null) {
    return formatMarcoEquivalentPrice(sku.marcoUsdcEquivalent)
  }
  return formatUsdcPrice(sku.standardUsdc ?? 0)
}

/** Standard swap protocol fee — 0.30% */
export const SWAP_PROTOCOL_FEE_STANDARD_BPS = getD87PricingCodex().services.swap.protocolFeeStandardBps

/** Reduced swap protocol fee when buying MARCO — 0.20% */
export const SWAP_PROTOCOL_FEE_BUY_MARCO_BPS = getD87PricingCodex().services.swap.protocolFeeBuyMarcoBps

export const SWAP_PROTOCOL_FEE_STANDARD = SWAP_PROTOCOL_FEE_STANDARD_BPS / 10_000

export const SWAP_PROTOCOL_FEE_BUY_MARCO = SWAP_PROTOCOL_FEE_BUY_MARCO_BPS / 10_000

export function isMarcoTokenAddress(address?: string | null): boolean {
  if (!address) return false
  return MARCO_ADDRESSES.has(address.toLowerCase())
}

export function isMarcoSymbol(symbol?: string | null): boolean {
  return Boolean(symbol && symbol.trim().toUpperCase() === 'MARCO')
}

export function isBuyMarcoSwap(input: {
  chainId?: number
  outputAddress?: string | null
  /** @deprecated Symbol is never used for BUY MARCO detection — address + chainId only. */
  outputSymbol?: string | null
}): boolean {
  if (input.chainId != null) {
    return isBuyMarcoByAddress(input.chainId, input.outputAddress)
  }
  return isMarcoTokenAddress(input.outputAddress)
}

export function getSwapProtocolFeeBps(input: {
  chainId?: number
  inputAddress?: string | null
  outputAddress?: string | null
  outputSymbol?: string | null
}): number {
  if (input.chainId != null) {
    return isBuyMarcoByAddress(input.chainId, input.outputAddress)
      ? SWAP_PROTOCOL_FEE_BUY_MARCO_BPS
      : SWAP_PROTOCOL_FEE_STANDARD_BPS
  }
  return isBuyMarcoSwap(input) ? SWAP_PROTOCOL_FEE_BUY_MARCO_BPS : SWAP_PROTOCOL_FEE_STANDARD_BPS
}

export function getSwapProtocolFeeRate(input: {
  chainId?: number
  inputAddress?: string | null
  outputAddress?: string | null
  outputSymbol?: string | null
}): number {
  return getSwapProtocolFeeBps(input) / 10_000
}

export function formatProtocolFeePercent(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`
}

export function getMarcoBuyIncentiveCopy(): string {
  return 'Buying MARCO → Reduced Trading Fee (0.20% protocol fee vs 0.30% standard).'
}

export function getMarcoBuyIncentiveShortCopy(): string {
  return 'Reduced protocol fee when buying MARCO'
}
