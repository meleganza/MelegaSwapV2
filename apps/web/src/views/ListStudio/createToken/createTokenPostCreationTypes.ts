/**
 * Post-create funnel view model — public statuses only.
 * Never invent contract addresses or claim state.
 */

export type FunnelMetricStatus = 'READY' | 'PENDING' | 'AVAILABLE' | 'LOCKED'

export type CreateTokenSuccessModel = {
  name: string
  symbol: string
  logoUrl: string | null
  /** Null when on-chain address is not yet confirmed — show PENDING, never invent. */
  contractAddress: string | null
  chainId: number
  contractStatus: FunnelMetricStatus
}

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/

export function isTokenAddress(value?: string | null): value is string {
  return Boolean(value && ADDR_RE.test(value.trim()))
}

export function buildCreateTokenSuccessModel(input: {
  name?: string | null
  symbol?: string | null
  logoUrl?: string | null
  contractAddress?: string | null
  chainId?: number | null
}): CreateTokenSuccessModel {
  const contractAddress = isTokenAddress(input.contractAddress) ? input.contractAddress.trim() : null
  return {
    name: (input.name || '').trim() || '—',
    symbol: (input.symbol || '').trim() || '—',
    logoUrl: input.logoUrl?.trim() || null,
    contractAddress,
    chainId: input.chainId && Number.isFinite(input.chainId) ? input.chainId : 56,
    contractStatus: contractAddress ? 'AVAILABLE' : 'PENDING',
  }
}
