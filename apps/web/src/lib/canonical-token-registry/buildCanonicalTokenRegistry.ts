/**
 * Canonical Token Registry — single consumer API over the historical Melega
 * token list + dex-asset-index union. Does not recreate logos; reuses existing
 * logoURI / resolveAssetLogo paths. Product surfaces must import from here
 * (or re-exports) rather than maintaining parallel registries.
 */

import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import {
  buildDexAssetIndex,
  getCanonicalIndexedAssets,
  getTradeSurfaceAssets,
  type DexAssetRecord,
} from 'lib/dex-asset-index'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import type { CanonicalTokenRecord, CanonicalTokenRegistryPayload } from './types'

type TokenListEntry = {
  chainId: number
  address: string
  symbol: string
  name?: string
  decimals?: number
  logoURI?: string
}

const ALIAS_MAP: Record<string, string[]> = {
  [MARCO_BSC_ADDRESS.toLowerCase()]: ['MARCO', 'CAKE', 'Melega'],
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': ['WBNB', 'BNB', 'WETH'],
  '0x55d398326f99059ff775485246999027b3197955': ['USDT', 'Tether'],
}

function listDecimalsByAddress(): Map<string, number> {
  const map = new Map<string, number>()
  const tokens = (defaultTokenList.tokens ?? []) as TokenListEntry[]
  for (const t of tokens) {
    if (!t.address || t.decimals == null) continue
    map.set(`${t.chainId}:${t.address.toLowerCase()}`, t.decimals)
  }
  return map
}

function aliasesFor(address: string, symbol: string): string[] {
  const fromMap = ALIAS_MAP[address.toLowerCase()] ?? []
  const set = new Set<string>([symbol, ...fromMap])
  return [...set]
}

function toCanonical(asset: DexAssetRecord, decimalsMap: Map<string, number>): CanonicalTokenRecord | null {
  if (!asset.address) return null
  const key = `${asset.chainId}:${asset.address.toLowerCase()}`
  const decimals = decimalsMap.get(key) ?? 18
  return {
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name || asset.symbol,
    chainId: asset.chainId,
    address: asset.address,
    decimals,
    logo: asset.logo,
    logoFallback: asset.logoFallback,
    aliases: aliasesFor(asset.address, asset.symbol),
    sources: asset.sources,
    status: asset.status,
    surfaces: asset.surfaces,
    registrySlug: asset.registrySlug,
    asset,
  }
}

/** Full canonical registry (deduped by chainId+address). */
export function getCanonicalTokenRegistry(): CanonicalTokenRecord[] {
  const decimalsMap = listDecimalsByAddress()
  const seen = new Set<string>()
  const out: CanonicalTokenRecord[] = []

  for (const asset of getCanonicalIndexedAssets()) {
    const row = toCanonical(asset, decimalsMap)
    if (!row) continue
    const key = `${row.chainId}:${row.address.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
  }

  return out
}

export function buildCanonicalTokenRegistryPayload(): CanonicalTokenRegistryPayload {
  const tokens = getCanonicalTokenRegistry()
  return {
    schema: 'https://melega.finance/schemas/canonical-token-registry/v1',
    generatedAt: new Date().toISOString(),
    tokenCount: tokens.length,
    logoCount: tokens.filter((t) => Boolean(t.logo)).length,
    tokens,
  }
}

export function lookupCanonicalToken(chainId: number, address: string): CanonicalTokenRecord | undefined {
  const target = address.toLowerCase()
  return getCanonicalTokenRegistry().find((t) => t.chainId === chainId && t.address.toLowerCase() === target)
}

export function searchCanonicalTokens(query: string, limit = 50): CanonicalTokenRecord[] {
  const q = query.trim().toLowerCase()
  if (!q) return getCanonicalTokenRegistry().slice(0, limit)
  return getCanonicalTokenRegistry()
    .filter((t) => {
      if (t.symbol.toLowerCase().includes(q)) return true
      if (t.name.toLowerCase().includes(q)) return true
      if (t.address.toLowerCase().includes(q)) return true
      return t.aliases.some((a) => a.toLowerCase().includes(q))
    })
    .slice(0, limit)
}

/** Trade-selector slice — same registry, trade-surface filter only. */
export function getCanonicalTradeTokens(): CanonicalTokenRecord[] {
  const decimalsMap = listDecimalsByAddress()
  const seen = new Set<string>()
  const out: CanonicalTokenRecord[] = []
  for (const asset of getTradeSurfaceAssets()) {
    const row = toCanonical(asset, decimalsMap)
    if (!row) continue
    const key = `${row.chainId}:${row.address.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
  }
  return out
}

/** Historical list size (source of truth for recovered metadata count). */
export function getHistoricalTokenListCount(): number {
  return ((defaultTokenList.tokens ?? []) as TokenListEntry[]).length
}

/** Index asset count before address dedupe (audit aid). */
export function getDexAssetIndexCount(): number {
  return buildDexAssetIndex().length
}
