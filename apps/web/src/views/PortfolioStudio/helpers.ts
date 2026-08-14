/**
 * Portfolio helpers — factual formatting only.
 */
import { getAddressExplorerUrl } from 'utils/blockExplorer'

export function shortenAddress(address?: string | null): string {
  if (!address || address.length < 10) return address || '—'
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function explorerAddressUrl(address: string | null | undefined, chainId?: number | null): string | null {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return null
  return getAddressExplorerUrl(address, chainId ?? undefined)
}

export function chainLabel(chainId?: number | null): string {
  if (chainId === 56) return 'BNB Chain'
  if (chainId === 97) return 'BSC Testnet'
  if (chainId === 1) return 'Ethereum'
  if (chainId === 8453) return 'Base'
  if (chainId === 137) return 'Polygon'
  if (chainId === 42161) return 'Arbitrum'
  if (chainId === 43114) return 'Avalanche'
  if (chainId == null) return '—'
  return `Chain ${chainId}`
}

export function parseUsdLoose(value: string | null | undefined): number | null {
  if (!value || value === '—' || value === 'Unavailable') return null
  const cleaned = value.replace(/[(),$]/g, '').replace(/K$/i, '')
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return null
  if (/k$/i.test(value.replace(/[()]/g, ''))) return n * 1000
  return n
}

export function formatUsd(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—'
  if (n === 0) return '$0.00'
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

export const FARMS_HREF = '/farms' as const
export const POOLS_HREF = '/pools' as const
export const LIQUIDITY_MANAGE_HREF = '/liquidity-studio?view=positions' as const
export const LIQUIDITY_REMOVE_HREF = '/liquidity-studio?view=remove' as const
