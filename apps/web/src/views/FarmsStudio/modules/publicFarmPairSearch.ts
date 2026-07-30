/**
 * Existing pair search for Public Farm Factory — name / symbol / address / LP.
 */
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'
import type { PublicFarmSelectedPair } from './publicFarmFactoryDraft'

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function looksLikeAddress(q: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(q.trim())
}

export function matchPairSearchQuery(pair: ClassifiedAmmPair, query: string): boolean {
  const q = norm(query)
  if (!q) return true
  const pairAddr = (pair.pairAddress || '').toLowerCase()
  const t0 = (pair.token0 || '').toLowerCase()
  const t1 = (pair.token1 || '').toLowerCase()
  const s0 = (pair.symbol0 || '').toLowerCase()
  const s1 = (pair.symbol1 || '').toLowerCase()
  const name = `${s0}/${s1}`
  const nameAlt = `${s0}-${s1}`

  if (looksLikeAddress(query)) {
    const addr = q
    return pairAddr === addr || t0 === addr || t1 === addr
  }

  return (
    name.includes(q) ||
    nameAlt.includes(q) ||
    s0.includes(q) ||
    s1.includes(q) ||
    pairAddr.includes(q) ||
    t0.includes(q) ||
    t1.includes(q)
  )
}

export function filterPairsForFarmFactory(pairs: ClassifiedAmmPair[], query: string): ClassifiedAmmPair[] {
  return pairs.filter((p) => matchPairSearchQuery(p, query))
}

export function toSelectedPair(pair: ClassifiedAmmPair, sourceBlock: number | null = null): PublicFarmSelectedPair {
  return {
    pairAddress: pair.pairAddress,
    lpTokenAddress: pair.pairAddress, // Melega V2 LP token == pair contract
    token0: pair.token0 || '',
    token1: pair.token1 || '',
    symbol0: pair.symbol0 || 'TKN0',
    symbol1: pair.symbol1 || 'TKN1',
    classification: pair.classification || 'inactive',
    reserve0: String(pair.reserve0 ?? '0'),
    reserve1: String(pair.reserve1 ?? '0'),
    sourceBlock,
  }
}
