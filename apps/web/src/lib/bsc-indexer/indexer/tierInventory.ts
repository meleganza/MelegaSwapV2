import { INDEXER_TIER_DEFINITIONS } from 'lib/data-truth/ontology'
import { MARCO_WBNB_PAIR_BSC } from '../constants'
import { FOUNDER_WBNB_PAIR_ADDRESSES } from '../founderWbnbPairs'
import { resolveOnchainRegistry } from '../registry/store'
import { FEATURED_PAIR_SLUG } from '../v2/paths'
import { classifyAmmPair, sortPairsDefault } from '../pairs/classify'
import type { ClassifiedAmmPair } from '../types'
import { resolveIndexerStorageForSlug } from '../storage'

export type IndexerTier = 'TIER_1' | 'TIER_2' | 'TIER_3'

/** Previous candidate cap was 40 for a 20-pair ACTIVE set (2×). Keep that ratio. */
export const TIER2_CANDIDATE_MULTIPLIER = 2
export const TIER2_CANDIDATE_POOL_SIZE =
  INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs * TIER2_CANDIDATE_MULTIPLIER
/** Activity ranking sample — local storage only, no extra provider calls. */
export const TIER2_ACTIVITY_SCORE_SAMPLE = 64
/** Bound concurrent local-storage score reads. */
export const TIER2_ACTIVITY_SCORE_CONCURRENCY = 8

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
  // PancakeSwap CAKE on BSC (canonical tokenlist / Melega registry).
  return '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
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
    const liquidity = Number(watch.liquidityScore > BigInt(0) ? watch.liquidityScore : BigInt(0))
    return swapCount * 10_000 + liquidity / 1e18 - lag
  } catch {
    return Number(watch.liquidityScore) / 1e18
  }
}

export function liquidityFallbackScore(liquidityScore: bigint): number {
  return Number(liquidityScore) / 1e18
}

export function takeTier2CandidatePool<T>(sortedByLiquidity: T[], poolSize = TIER2_CANDIDATE_POOL_SIZE): T[] {
  return sortedByLiquidity.slice(0, poolSize)
}

export function mergeTier2Scores(
  candidates: TierPairWatch[],
  activityScores: ReadonlyMap<string, number>,
): Array<{ watch: TierPairWatch; score: number }> {
  return candidates.map((watch) => ({
    watch,
    score: activityScores.get(watch.pairAddress) ?? liquidityFallbackScore(watch.liquidityScore),
  }))
}

export function selectActiveTier2(
  scored: Array<{ watch: TierPairWatch; score: number }>,
  maxPairs: number = INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs,
): TierPairWatch[] {
  return [...scored]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.watch.pairAddress.localeCompare(b.watch.pairAddress)
    })
    .slice(0, maxPairs)
    .map(({ watch }) => watch)
}

async function scoreTier2ActivitySample(candidates: TierPairWatch[]): Promise<Map<string, number>> {
  const sample = candidates.slice(0, TIER2_ACTIVITY_SCORE_SAMPLE)
  const scores = new Map<string, number>()
  for (let i = 0; i < sample.length; i += TIER2_ACTIVITY_SCORE_CONCURRENCY) {
    const chunk = sample.slice(i, i + TIER2_ACTIVITY_SCORE_CONCURRENCY)
    const rows = await Promise.all(chunk.map(async (watch) => [watch.pairAddress, await tier2ActivityScore(watch)] as const))
    for (const [address, score] of rows) scores.set(address, score)
  }
  return scores
}

/** Read-path inventory — registry only (no on-chain Factory calls). */
export async function loadTierPairInventory(): Promise<{
  tier1: TierPairWatch[]
  tier2: TierPairWatch[]
  tier3Count: number
  tier2CandidatesConsidered: number
  activeTierSize: number
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
  const founderSet = new Set(FOUNDER_WBNB_PAIR_ADDRESSES.map((a) => a.toLowerCase()))
  const founderPairs = classified.filter(
    (p) =>
      founderSet.has(p.pairAddress.toLowerCase()) &&
      p.token0 &&
      p.token1 &&
      p.pairAddress.toLowerCase() !== MARCO_WBNB_PAIR_BSC.toLowerCase(),
  )
  for (const p of founderPairs) {
    tier1.push({
      tier: 'TIER_1',
      slug: pairSlug(p),
      pairAddress: p.pairAddress.toLowerCase(),
      token0: p.token0!.toLowerCase(),
      token1: p.token1!.toLowerCase(),
      liquidityScore: liquidityScore(p),
    })
  }

  const remainingTier1Slots = Math.max(0, INDEXER_TIER_DEFINITIONS.TIER_1.maxPairs - tier1.length)
  corePairs
    .sort((a, b) => (liquidityScore(b) > liquidityScore(a) ? 1 : -1))
    .filter((p) => !founderSet.has(p.pairAddress.toLowerCase()))
    .slice(0, remainingTier1Slots)
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

  const tier2Candidates: TierPairWatch[] = takeTier2CandidatePool(
    tradeable.sort((a, b) => (liquidityScore(b) > liquidityScore(a) ? 1 : -1)),
  ).map((p) => ({
    tier: 'TIER_2' as IndexerTier,
    slug: pairSlug(p),
    pairAddress: p.pairAddress.toLowerCase(),
    token0: p.token0!.toLowerCase(),
    token1: p.token1!.toLowerCase(),
    liquidityScore: liquidityScore(p),
  }))

  const activityScores = await scoreTier2ActivitySample(tier2Candidates)
  const tier2 = selectActiveTier2(mergeTier2Scores(tier2Candidates, activityScores))

  const tier2Set = new Set(tier2.map((w) => w.pairAddress))
  const tier3Count = classified.filter((p) => !tier1Set.has(p.pairAddress.toLowerCase()) && !tier2Set.has(p.pairAddress.toLowerCase())).length

  return {
    tier1,
    tier2,
    tier3Count,
    tier2CandidatesConsidered: tier2Candidates.length,
    activeTierSize: tier1.length + tier2.length,
  }
}

export function selectTier2PairForSync(tier2: TierPairWatch[], cursor: number): TierPairWatch | undefined {
  if (!tier2.length) return undefined
  return tier2[cursor % tier2.length]
}
