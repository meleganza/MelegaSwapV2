import { INDEXER_TIER_DEFINITIONS } from 'lib/data-truth/ontology'
import { MARCO_WBNB_PAIR_BSC } from '../constants'
import { resolveOnchainRegistry } from '../registry/store'
import { FEATURED_PAIR_SLUG } from '../v2/paths'
import { classifyAmmPair, sortPairsDefault } from '../pairs/classify'
import type { ClassifiedAmmPair } from '../types'
import { resolveCanonicalTier1Pairs } from './canonicalTierPairs'
import { resolveIndexerStorageForSlug } from '../storage'

export type IndexerTier = 'TIER_1' | 'TIER_2' | 'TIER_3'

export interface TierPairWatch {
  tier: IndexerTier
  slug: string
  pairAddress: string
  token0: string
  token1: string
  liquidityScore: bigint
}

function pairSlug(pair: ClassifiedAmmPair): string {
  const t0 = pair.token0?.slice(2, 8) ?? 't0'
  const t1 = pair.token1?.slice(2, 8) ?? 't1'
  return `${t0}-${t1}`.toLowerCase()
}

function liquidityScore(pair: ClassifiedAmmPair): bigint {
  return BigInt(pair.reserve0 ?? '0') + BigInt(pair.reserve1 ?? '0')
}

async function tier2ActivityScore(watch: TierPairWatch): Promise<number> {
  try {
    const storage = resolveIndexerStorageForSlug(watch.slug)
    const [health, events] = await Promise.all([
      storage.loadHealth(),
      storage.listEvents({ pairAddress: watch.pairAddress, limit: 20 }),
    ])
    const swapCount = events.filter((e) => e.eventType === 'Swap').length
    const lag = health?.indexingLag ?? 999_999
    const liquidity = Number(watch.liquidityScore > 0n ? watch.liquidityScore : 0n)
    return swapCount * 10_000 + liquidity / 1e18 - lag
  } catch {
    return Number(watch.liquidityScore) / 1e18
  }
}

export async function loadTierPairInventory(): Promise<{
  tier1: TierPairWatch[]
  tier2: TierPairWatch[]
  tier3Count: number
}> {
  const { registry } = await resolveOnchainRegistry()
  const classified = sortPairsDefault(
    (registry?.amm?.pairs ?? []).map((p) => classifyAmmPair(p)),
  ).filter((p) => p.classification !== 'invalid_contract')

  const canonicalTier1 = await resolveCanonicalTier1Pairs()
  const tier1Set = new Set(canonicalTier1.map((w) => w.pairAddress))
  const tier1: TierPairWatch[] = canonicalTier1.map((w) => ({
    ...w,
    slug: w.pairAddress.toLowerCase() === MARCO_WBNB_PAIR_BSC.toLowerCase() ? FEATURED_PAIR_SLUG : w.slug,
  }))

  const tradeable = classified.filter(
    (p) =>
      p.token0 &&
      p.token1 &&
      p.classification === 'tradeable' &&
      p.pairAddress.toLowerCase() !== MARCO_WBNB_PAIR_BSC.toLowerCase() &&
      !tier1Set.has(p.pairAddress.toLowerCase()),
  )

  const tier2Candidates: TierPairWatch[] = tradeable.map((p) => ({
    tier: 'TIER_2' as IndexerTier,
    slug: pairSlug(p),
    pairAddress: p.pairAddress.toLowerCase(),
    token0: p.token0!.toLowerCase(),
    token1: p.token1!.toLowerCase(),
    liquidityScore: liquidityScore(p),
  }))

  const scored = await Promise.all(
    tier2Candidates.map(async (w) => ({ w, score: await tier2ActivityScore(w) })),
  )
  const tier2 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs)
    .map(({ w }) => w)

  const tier2Set = new Set(tier2.map((w) => w.pairAddress))
  const tier3Count = classified.filter(
    (p) =>
      p.token0 &&
      p.token1 &&
      !tier1Set.has(p.pairAddress.toLowerCase()) &&
      !tier2Set.has(p.pairAddress.toLowerCase()),
  ).length

  return { tier1, tier2, tier3Count }
}

/** Rotate through tier-2 pairs — one pair per cron invocation after featured sync. */
export function selectTier2PairForSync(tier2: TierPairWatch[], cursor: number): TierPairWatch | undefined {
  if (!tier2.length) return undefined
  return tier2[cursor % tier2.length]
}
