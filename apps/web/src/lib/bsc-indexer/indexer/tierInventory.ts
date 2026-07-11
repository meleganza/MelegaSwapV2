import { MARCO_WBNB_PAIR_BSC, MELEGA_CHAIN_ID } from '../constants'
import { classifyAmmPair, sortPairsDefault } from '../pairs/classify'
import { resolveOnchainRegistry } from '../registry/store'
import type { ClassifiedAmmPair } from '../types'
import { INDEXER_TIER_DEFINITIONS } from 'lib/data-truth/ontology'

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

export async function loadTierPairInventory(): Promise<{
  tier1: TierPairWatch[]
  tier2: TierPairWatch[]
  tier3Count: number
}> {
  const registry = await resolveOnchainRegistry(MELEGA_CHAIN_ID)
  const classified = sortPairsDefault(
    (registry?.amm?.pairs ?? []).map((p) => classifyAmmPair(p)),
  ).filter((p) => p.classification !== 'invalid_contract')

  const watches: TierPairWatch[] = classified
    .filter((p) => p.token0 && p.token1)
    .map((p) => ({
      tier: 'TIER_3' as IndexerTier,
      slug: pairSlug(p),
      pairAddress: p.pairAddress.toLowerCase(),
      token0: p.token0!.toLowerCase(),
      token1: p.token1!.toLowerCase(),
      liquidityScore: liquidityScore(p),
    }))

  const marcoWbnb = watches.find((w) => w.pairAddress === MARCO_WBNB_PAIR_BSC.toLowerCase())
  const tradeable = watches.filter(
    (w) =>
      w.pairAddress !== MARCO_WBNB_PAIR_BSC.toLowerCase() &&
      classified.find((c) => c.pairAddress === w.pairAddress)?.classification === 'tradeable',
  )

  const tier1Extra = tradeable
    .sort((a, b) => (b.liquidityScore > a.liquidityScore ? 1 : -1))
    .slice(0, INDEXER_TIER_DEFINITIONS.TIER_1.maxPairs - 1)

  const tier1: TierPairWatch[] = []
  if (marcoWbnb) tier1.push({ ...marcoWbnb, tier: 'TIER_1' })
  tier1Extra.forEach((w) => tier1.push({ ...w, tier: 'TIER_1' }))

  const tier1Set = new Set(tier1.map((w) => w.pairAddress))
  const tier2 = tradeable
    .filter((w) => !tier1Set.has(w.pairAddress))
    .slice(0, INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs)
    .map((w) => ({ ...w, tier: 'TIER_2' as IndexerTier }))

  const tier2Set = new Set(tier2.map((w) => w.pairAddress))
  const tier3Count = watches.filter((w) => !tier1Set.has(w.pairAddress) && !tier2Set.has(w.pairAddress)).length

  return { tier1, tier2, tier3Count }
}

/** Rotate through tier-2 pairs — one pair per cron invocation after featured sync. */
export function selectTier2PairForSync(tier2: TierPairWatch[], cursor: number): TierPairWatch | undefined {
  if (!tier2.length) return undefined
  return tier2[cursor % tier2.length]
}
