/**
 * PP001 — Local CAIP-compatible identifier helpers (no external dependency).
 *
 * Conventions:
 * - CAIP-2 chain: `eip155:{chainId}` for EVM chains in this registry
 * - CAIP-10 account/contract: `eip155:{chainId}:{address}`
 * - CAIP-19 asset (ERC-20): `eip155:{chainId}/erc20:{address}`
 */

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

export function toCaip2ChainId(chainId: number): string {
  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error(`Invalid chainId for CAIP-2: ${chainId}`)
  }
  return `eip155:${chainId}`
}

export function normalizeEvmAddress(address: string): string | null {
  if (typeof address !== 'string') return null
  const trimmed = address.trim()
  if (!EVM_ADDRESS_RE.test(trimmed)) return null
  return trimmed.toLowerCase()
}

export function toCaip10Contract(chainId: number, address: string): string | null {
  const normalized = normalizeEvmAddress(address)
  if (!normalized) return null
  try {
    return `${toCaip2ChainId(chainId)}:${normalized}`
  } catch {
    return null
  }
}

export function toCaip19Erc20(chainId: number, address: string): string | null {
  const normalized = normalizeEvmAddress(address)
  if (!normalized) return null
  try {
    return `${toCaip2ChainId(chainId)}/erc20:${normalized}`
  } catch {
    return null
  }
}

export function parseCaip10(value: string): { chainId: number; address: string } | null {
  const match = /^eip155:(\d+):(0x[a-fA-F0-9]{40})$/i.exec(value.trim())
  if (!match) return null
  return { chainId: Number(match[1]), address: match[2].toLowerCase() }
}
