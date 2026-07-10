import type { OnchainAmmPair } from 'lib/onchain-registry'
import type { ClassifiedAmmPair, PairDiscoveryClass } from '../types'

const ZERO = '0x0000000000000000000000000000000000000000'

export function classifyAmmPair(pair: OnchainAmmPair): ClassifiedAmmPair {
  const pairAddress = pair.pairAddress?.toLowerCase?.() ?? ''
  if (!pairAddress || pairAddress === ZERO || pairAddress.length !== 42) {
    return {
      pairAddress,
      classification: 'invalid_contract',
      metadataStatus: 'address_only',
      active: false,
    }
  }

  const token0 = pair.token0?.toLowerCase()
  const token1 = pair.token1?.toLowerCase()
  const hasTokens = Boolean(token0 && token1 && token0 !== ZERO && token1 !== ZERO)
  const reserve0 = BigInt(pair.reserve0 ?? '0')
  const reserve1 = BigInt(pair.reserve1 ?? '0')
  const hasLiquidity = reserve0 > 0n || reserve1 > 0n

  let classification: PairDiscoveryClass
  if (!hasTokens) {
    classification = 'metadata_incomplete'
  } else if (!hasLiquidity && pair.active === false) {
    classification = 'inactive'
  } else if (hasLiquidity) {
    classification = 'liquidity_present'
  } else {
    classification = 'inactive'
  }

  if (hasTokens && hasLiquidity) classification = 'tradeable'

  const metadataStatus: ClassifiedAmmPair['metadataStatus'] = hasTokens ? 'partial' : 'address_only'

  return {
    pairAddress,
    token0,
    token1,
    reserve0: pair.reserve0,
    reserve1: pair.reserve1,
    classification,
    metadataStatus,
    active: Boolean(pair.active ?? hasLiquidity),
    lastVerified: pair.lastVerified,
  }
}

export function isPairHidden(classification: PairDiscoveryClass): boolean {
  return classification === 'invalid_contract'
}

export function filterDiscoverablePairs(pairs: ClassifiedAmmPair[]): ClassifiedAmmPair[] {
  return pairs.filter((p) => !isPairHidden(p.classification))
}

export function sortPairsDefault(pairs: ClassifiedAmmPair[]): ClassifiedAmmPair[] {
  const rank: Record<PairDiscoveryClass, number> = {
    tradeable: 0,
    liquidity_present: 1,
    metadata_incomplete: 2,
    inactive: 3,
    invalid_contract: 9,
  }
  return [...pairs].sort((a, b) => {
    const r = rank[a.classification] - rank[b.classification]
    if (r !== 0) return r
    const liqA = BigInt(a.reserve0 ?? '0') + BigInt(a.reserve1 ?? '0')
    const liqB = BigInt(b.reserve0 ?? '0') + BigInt(b.reserve1 ?? '0')
    if (liqA === liqB) return a.pairAddress.localeCompare(b.pairAddress)
    return liqB > liqA ? 1 : -1
  })
}

export function searchPairs(pairs: ClassifiedAmmPair[], query: string): ClassifiedAmmPair[] {
  const q = query.trim().toLowerCase()
  if (!q) return pairs
  return pairs.filter(
    (p) =>
      p.pairAddress.includes(q) ||
      p.token0?.includes(q) ||
      p.token1?.includes(q) ||
      p.symbol0?.toLowerCase().includes(q) ||
      p.symbol1?.toLowerCase().includes(q),
  )
}

export function paginatePairs<T>(rows: T[], page: number, pageSize: number): { rows: T[]; total: number; page: number; pageSize: number } {
  const total = rows.length
  const start = Math.max(0, (page - 1) * pageSize)
  return { rows: rows.slice(start, start + pageSize), total, page, pageSize }
}
