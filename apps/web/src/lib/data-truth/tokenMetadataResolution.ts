/**
 * Token metadata resolution — chain-scoped cache.
 * Never reuse metadata from the same address on another chain.
 */
export type ResolvedTokenMeta = {
  chainId: number
  address: string
  symbol: string
  name: string | null
  decimals: number | null
  source: 'registry' | 'tokenlist' | 'indexed' | 'erc20' | 'address' | 'unknown'
  unverified: boolean
}

const cache = new Map<string, ResolvedTokenMeta>()

export function tokenMetaCacheKey(chainId: number, address: string): string {
  return `${chainId}:${(address || '').toLowerCase()}`
}

export function shortAddressLabel(address: string): string {
  const a = address || ''
  if (!/^0x[a-fA-F0-9]{40}$/.test(a)) return 'Unknown'
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

export function getCachedTokenMeta(chainId: number, address: string): ResolvedTokenMeta | null {
  return cache.get(tokenMetaCacheKey(chainId, address)) ?? null
}

export function setCachedTokenMeta(meta: ResolvedTokenMeta): void {
  cache.set(tokenMetaCacheKey(meta.chainId, meta.address), meta)
}

/** Pure resolution without network — registry/list/indexed/address fallback. */
export function resolveTokenMetaLocal(input: {
  chainId: number
  address: string
  registrySymbol?: string | null
  tokenListSymbol?: string | null
  indexedSymbol?: string | null
  registryName?: string | null
}): ResolvedTokenMeta {
  const address = (input.address || '').toLowerCase()
  const cached = getCachedTokenMeta(input.chainId, address)
  if (cached) return cached

  const candidates: Array<{ symbol: string; name: string | null; source: ResolvedTokenMeta['source']; unverified: boolean }> = []
  if (input.registrySymbol) {
    candidates.push({
      symbol: input.registrySymbol,
      name: input.registryName ?? null,
      source: 'registry',
      unverified: false,
    })
  }
  if (input.tokenListSymbol) {
    candidates.push({
      symbol: input.tokenListSymbol,
      name: null,
      source: 'tokenlist',
      unverified: false,
    })
  }
  if (input.indexedSymbol) {
    candidates.push({
      symbol: input.indexedSymbol,
      name: null,
      source: 'indexed',
      unverified: true,
    })
  }

  const picked = candidates[0]
  const meta: ResolvedTokenMeta = picked
    ? {
        chainId: input.chainId,
        address,
        symbol: picked.symbol,
        name: picked.name,
        decimals: null,
        source: picked.source,
        unverified: picked.unverified,
      }
    : {
        chainId: input.chainId,
        address,
        symbol: shortAddressLabel(address),
        name: null,
        decimals: null,
        source: /^0x[a-f0-9]{40}$/.test(address) ? 'address' : 'unknown',
        unverified: true,
      }

  if (meta.source !== 'unknown') setCachedTokenMeta(meta)
  return meta
}

export function clearTokenMetaCacheForTests() {
  cache.clear()
}
