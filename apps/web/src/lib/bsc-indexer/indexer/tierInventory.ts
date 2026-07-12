import { INDEXER_TIER_DEFINITIONS } from 'lib/data-truth/ontology'
import { MARCO_WBNB_PAIR_BSC, MELEGA_CHAIN_ID } from '../constants'
import { resolveOnchainRegistry } from '../registry/store'
import { FEATURED_PAIR_SLUG } from '../v2/paths'
import { classifyAmmPair, sortPairsDefault } from '../pairs/classify'
import type { ClassifiedAmmPair } from '../types'
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

const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

function pairSlug(pair: ClassifiedAmmPair): string {
  if (pair.pairAddress.toLowerCase() === MARCO_WBNB_PAIR_BSC.toLowerCase()) return FEATURED_PAIR_SLUG
  const t0 = pair.token0?.slice(2, 8) ?? 't0'
  const t1 = pair.token1?.slice(2, 8) ?? 't1'
  return `${t0}-${t1}`.toLowerCase()
}

function liquidityScore(pair: ClassifiedAmmPair): bigint {
  return BigInt(pair.reserve0 ?? '0') + BigInt(pair.reserve1 ?? '0')
}

function isCorePair(pair: ClassifiedAmmPair): boolean {
  const t0 = pair.token0?.toLowerCase()
  const t1 = pair.token1?.toLowerCase()
  if (!t0 || !t1) return false
  const core = new Set([MARCO, WBNB, bscUsdt(), bscUsdc(), bscCake()])
  return core.has(t0) && core.has(t1)
}

function bscUsdt() {
  return '0x55d398326f99059ff775485246999027b3197955'
}
function bscUsdc() {
  return '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
}
function bscCake() {
  return '0x0e09fabb73bd3ade97a6a8b0c9fc88498c148c6b'
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

/** Read-path inventory — registry only (no on-chain Factory calls). */
export async function loadTierPairInventory(): Promise<{
  tier1: TierPairWatch[]
  tier2: TierPairWatch[]
  tier3Count: number
}> {
  const { registry } = await resolveOnchainRegistry()
  const classified = sortPairsDefault(
    (registry?.amm?.pairs ?? []).map((p) => classifyAmmPair(p)),
  ).filter((p) => p.classification !== 'invalid_contract' && p.token0 && p.token1)

  const marcoWbnb = classified.find((p) => p.pairAddress.toLowerCase() === MARCO_WBNB_PAIR_BSC.toLowerCase())
  const corePairs = classified.filter(
    (p) =>
      p.classification === 'tradeable' &&
      isCorePair(p) &&
      p.pairAddress.toLowerCase() !== MARCO_WBNB_PAIR_BSC.toLowerCase(),
  )

  const tier1: TierPairWatch[] = []
  if (marcoWbnb) {
    tier1.push({
      tier: 'TIER_1',
      slug: FEATURED_PAIR_SLUG,
      pairAddress: marcoWbnb.pairAddress.toLowerCase(),
      token0: marcoWbnb.token0!.toLowerCase(),
      token1: marcoWbnb.token1!.toLowerCase(),
      liquidityScore: liquidityScore(marcoWbnb),
    })
  }
  corePairs
    .sort((a, b) => (liquidityScore(b) > liquidityScore(a) ? 1 : -1))
    .slice(0, INDEXER_TIER_DEFINITIONS.TIER_1.maxPairs - 1)
    .forEach((p) =>
      tier1.push({
        tier: 'TIER_1',
        slug: pairSlug(p),
        pairAddress: p.pairAddress.toLowerCase(),
        token0: p.token0!.toLowerCase(),
        token1: p.token1!.toLowerCase(),
        liquidityScore: liquidityScore(p),
      }),
    )

  const tier1Set = new Set(tier1.map((w) => w.pairAddress))
  const tradeable = classified.filter(
    (p) => p.classification === 'tradeable' && !tier1Set.has(p.pairAddress.toLowerCase()),
  )

  const tier2Candidates: TierPairWatch[] = tradeable
    .sort((a, b) => (liquidityScore(b) > liquidityScore(a) ? 1 : -1))
    .slice(0, 40)
    .map((p) => ({
      tier: 'TIER_2' as IndexerTier,
      slug: pairSlug(p),
      pairAddress: p.pairAddress.toLowerCase(),
      token0: p.token0!.toLowerCase(),
      token1: p.token1!.toLowerCase(),
      liquidityScore: liquidityScore(p),
    }))

  const scored = await Promise.all(
    tier2Candidates.slice(0, 12).map(async (w) => ({ w, score: await tier2ActivityScore(w) })),
  )
  const tier2 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs)
    .map(({ w }) => w)

  const tier2Set = new Set(tier2.map((w) => w.pairAddress))
  const tier3Count = classified.filter((p) => !tier1Set.has(p.pairAddress.toLowerCase()) && !tier2Set.has(p.pairAddress.toLowerCase())).length

  return { tier1, tier2, tier3Count }
}

export function selectTier2PairForSync(tier2: TierPairWatch[], cursor: number): TierPairWatch | undefined {
  if (!tier2.length) return undefined
  return tier2[cursor % tier2.length]
}
