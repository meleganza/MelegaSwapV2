/**
 * Existing pair search for Public Farm Factory — name / symbol / address / LP.
 */
import { lookupCanonicalToken } from 'lib/canonical-token-registry'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'
import type { PublicFarmSelectedPair } from './publicFarmFactoryDraft'

type FarmFactoryPair = ClassifiedAmmPair & {
  chainId?: number
  name0?: string
  name1?: string
  lpTokenAddress?: string
}

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function looksLikeAddress(q: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(q.trim())
}

function shortAddressLabel(address: string): string {
  const a = address.trim()
  if (a.length < 12) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

/** Resolve a display symbol from pair metadata or canonical registry — never invent TKN0/TKN1 when resolvable. */
export function resolveFarmPairSymbol(
  address: string,
  pairSymbol?: string,
  chainId: number = MELEGA_CHAIN_ID,
): string {
  const trimmed = pairSymbol?.trim()
  if (trimmed && !/^0x/i.test(trimmed) && !trimmed.includes('…') && trimmed.toLowerCase() !== 'unknown') {
    return trimmed
  }
  const canonical = lookupCanonicalToken(chainId, address)
  if (canonical?.symbol && !/^0x/i.test(canonical.symbol) && canonical.symbol.toLowerCase() !== 'unknown') {
    return canonical.symbol
  }
  return ''
}

function resolveFarmPairName(address: string, pairName?: string, chainId: number = MELEGA_CHAIN_ID): string {
  const trimmed = pairName?.trim()
  if (trimmed && trimmed.toLowerCase() !== 'unknown') return trimmed
  const canonical = lookupCanonicalToken(chainId, address)
  if (canonical?.name && canonical.name.toLowerCase() !== 'unknown') return canonical.name
  return ''
}

function pairLpAddress(pair: FarmFactoryPair): string {
  return (pair.lpTokenAddress || pair.pairAddress || '').toLowerCase()
}

function isMelegaChainPair(pair: FarmFactoryPair): boolean {
  return pair.chainId == null || pair.chainId === MELEGA_CHAIN_ID
}

export function matchPairSearchQuery(pair: ClassifiedAmmPair, query: string): boolean {
  if (!isMelegaChainPair(pair as FarmFactoryPair)) return false

  const q = norm(query)
  if (!q) return true

  const ext = pair as FarmFactoryPair
  const pairAddr = (pair.pairAddress || '').toLowerCase()
  const lpAddr = pairLpAddress(ext)
  const t0 = (pair.token0 || '').toLowerCase()
  const t1 = (pair.token1 || '').toLowerCase()
  const s0 = resolveFarmPairSymbol(pair.token0 ?? '', pair.symbol0).toLowerCase()
  const s1 = resolveFarmPairSymbol(pair.token1 ?? '', pair.symbol1).toLowerCase()
  const n0 = resolveFarmPairName(pair.token0 ?? '', ext.name0).toLowerCase()
  const n1 = resolveFarmPairName(pair.token1 ?? '', ext.name1).toLowerCase()
  const name = `${s0}/${s1}`
  const nameAlt = `${s0}-${s1}`

  if (looksLikeAddress(query)) {
    const addr = q
    return pairAddr === addr || lpAddr === addr || t0 === addr || t1 === addr
  }

  return (
    name.includes(q) ||
    nameAlt.includes(q) ||
    s0.includes(q) ||
    s1.includes(q) ||
    n0.includes(q) ||
    n1.includes(q) ||
    pairAddr.includes(q) ||
    lpAddr.includes(q) ||
    t0.includes(q) ||
    t1.includes(q) ||
    (pair.symbol0 || '').toLowerCase().includes(q) ||
    (pair.symbol1 || '').toLowerCase().includes(q)
  )
}

export function filterPairsForFarmFactory(pairs: ClassifiedAmmPair[], query: string): ClassifiedAmmPair[] {
  return pairs.filter((p) => isMelegaChainPair(p as FarmFactoryPair) && matchPairSearchQuery(p, query))
}

export function formatFarmPairLabel(pair: ClassifiedAmmPair): { symbol0: string; symbol1: string } {
  const symbol0 = resolveFarmPairSymbol(pair.token0 ?? '', pair.symbol0)
  const symbol1 = resolveFarmPairSymbol(pair.token1 ?? '', pair.symbol1)
  return {
    symbol0: symbol0 || pair.symbol0 || shortAddressLabel(pair.token0 ?? '') || 'TKN0',
    symbol1: symbol1 || pair.symbol1 || shortAddressLabel(pair.token1 ?? '') || 'TKN1',
  }
}

export function toSelectedPair(pair: ClassifiedAmmPair, sourceBlock: number | null = null): PublicFarmSelectedPair {
  const { symbol0, symbol1 } = formatFarmPairLabel(pair)
  return {
    pairAddress: pair.pairAddress,
    lpTokenAddress: pair.pairAddress, // Melega V2 LP token == pair contract
    token0: pair.token0 || '',
    token1: pair.token1 || '',
    symbol0,
    symbol1,
    classification: pair.classification || 'inactive',
    reserve0: String(pair.reserve0 ?? '0'),
    reserve1: String(pair.reserve1 ?? '0'),
    sourceBlock,
  }
}
