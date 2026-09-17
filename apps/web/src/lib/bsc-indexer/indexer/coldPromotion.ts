import { INDEXER_TIER_DEFINITIONS } from 'lib/data-truth/ontology'
import { liquidityFallbackScore, type TierPairWatch } from './tierInventory'
import { TIER3_COLD_SAMPLE_PER_INVOCATION, runBoundedRotatingBatch } from './tierScheduler'

/** Absolute floor so reserve jitter of 0.0001 cannot flip ACTIVE membership. */
export const COLD_PROMOTION_ABS_MARGIN = 1
/** Relative hysteresis on the lag-free rank score. */
export const COLD_PROMOTION_REL_MARGIN = 0.05

export interface LocalPromotionFacts {
  pairAddress: string
  swapCount: number
  liquidity: number
  lag: number
  hasStoredHealth: boolean
  hasStoredEvents: boolean
  /** Existing TIER2 activity formula: swaps * 10000 + liquidity - lag. */
  activityScore: number
  /** Same signals without lag — blocks evaluation-sync churn. */
  rankScore: number
  hasEvidence: boolean
}

export interface ScoredActiveWatch {
  watch: TierPairWatch
  score: number
}

export interface ColdChallenger {
  watch: TierPairWatch
  facts: LocalPromotionFacts
}

export interface ColdPromotionDecision {
  nextActive: TierPairWatch[]
  nextActiveScores: Map<string, number>
  promotionCandidates: number
  promotionsApplied: number
  evictionsApplied: number
}

export interface ColdPromotionPassResult {
  nextActive: TierPairWatch[]
  sampled: TierPairWatch[]
  coldSamplesAttempted: number
  coldSamplesCompleted: number
  promotionCandidates: number
  promotionsApplied: number
  evictionsApplied: number
  coldBatchStoppedByDeadline: boolean
  nextColdRotationIndex: number
  coldTierSize: number
}

function addressKey(value: string | { pairAddress: string }): string {
  return (typeof value === 'string' ? value : value.pairAddress).toLowerCase()
}

export function promotionMargin(weakestRankScore: number): number {
  return Math.max(COLD_PROMOTION_ABS_MARGIN, Math.abs(weakestRankScore) * COLD_PROMOTION_REL_MARGIN)
}

export function beatsWeakestActive(challenger: LocalPromotionFacts, weakest: LocalPromotionFacts): boolean {
  if (!challenger.hasEvidence) return false
  const margin = promotionMargin(weakest.rankScore)
  return (
    challenger.rankScore >= weakest.rankScore + margin &&
    challenger.activityScore >= weakest.activityScore + margin
  )
}

export function factsFromLiquidityOnly(watch: TierPairWatch): LocalPromotionFacts {
  const liquidity = liquidityFallbackScore(watch.liquidityScore)
  return {
    pairAddress: watch.pairAddress.toLowerCase(),
    swapCount: 0,
    liquidity,
    lag: 0,
    hasStoredHealth: false,
    hasStoredEvents: false,
    activityScore: liquidity,
    rankScore: liquidity,
    hasEvidence: liquidity > 0,
  }
}

export function uniqueWatches(watches: TierPairWatch[]): TierPairWatch[] {
  const seen = new Set<string>()
  const out: TierPairWatch[] = []
  for (const watch of watches) {
    const key = watch.pairAddress.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ ...watch, pairAddress: key })
  }
  return out
}

export function listColdUniverse(
  cold: TierPairWatch[],
  excluded: Iterable<string | { pairAddress: string }>,
): TierPairWatch[] {
  const skip = new Set([...excluded].map((addr) => addressKey(addr)))
  return uniqueWatches(cold)
    .filter((watch) => !skip.has(watch.pairAddress))
    .sort((a, b) => a.pairAddress.localeCompare(b.pairAddress))
}

/** Sticky overlay seats — persisted COLD winners keep an ACTIVE slot until evicted. */
export function takePersistedOverlay(
  persistedAddresses: readonly string[] | undefined,
  naturalActive: TierPairWatch[],
  cold: TierPairWatch[],
  protectedHot: TierPairWatch[],
): TierPairWatch[] {
  const naturalSet = new Set(naturalActive.map((watch) => watch.pairAddress.toLowerCase()))
  const hotSet = new Set(protectedHot.map((watch) => watch.pairAddress.toLowerCase()))
  const coldMap = new Map(cold.map((watch) => [watch.pairAddress.toLowerCase(), watch]))
  const out: TierPairWatch[] = []
  const seen = new Set<string>()
  for (const addr of persistedAddresses ?? []) {
    const key = addr.toLowerCase()
    if (!key || seen.has(key) || naturalSet.has(key) || hotSet.has(key)) continue
    const watch = coldMap.get(key)
    if (!watch) continue
    seen.add(key)
    out.push({ ...watch, pairAddress: key, tier: 'TIER_2' })
  }
  return out
}

/**
 * Seat overlay members from the weakest end of the natural ACTIVE list.
 * Does not increase the 128 cap and never touches HOT/TIER1.
 */
export function seatPersistedOverlay(args: {
  naturalActive: TierPairWatch[]
  overlay: TierPairWatch[]
  protectedHot?: Iterable<string | { pairAddress: string }>
  maxPairs?: number
}): TierPairWatch[] {
  const maxPairs = args.maxPairs ?? INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs
  const hotSet = new Set([...(args.protectedHot ?? [])].map((addr) => addressKey(addr)))
  const overlay = uniqueWatches(args.overlay)
    .filter((watch) => !hotSet.has(watch.pairAddress))
    .slice(0, maxPairs)
    .map((watch) => ({ ...watch, tier: 'TIER_2' as const }))
  const overlaySet = new Set(overlay.map((watch) => watch.pairAddress))
  const naturalKept = uniqueWatches(args.naturalActive).filter(
    (watch) => !overlaySet.has(watch.pairAddress) && !hotSet.has(watch.pairAddress),
  )
  const room = Math.max(0, maxPairs - overlay.length)
  return [...naturalKept.slice(0, room), ...overlay].slice(0, maxPairs)
}

export function overlayAddresses(active: TierPairWatch[], naturalActive: TierPairWatch[]): string[] {
  const naturalSet = new Set(naturalActive.map((watch) => watch.pairAddress.toLowerCase()))
  return uniqueWatches(active)
    .filter((watch) => !naturalSet.has(watch.pairAddress))
    .map((watch) => watch.pairAddress)
}

export function weakestEligibleActive(
  active: ScoredActiveWatch[],
  protectedAddresses: Iterable<string | { pairAddress: string }>,
): ScoredActiveWatch | undefined {
  const hotSet = new Set([...protectedAddresses].map((addr) => addressKey(addr)))
  for (let i = active.length - 1; i >= 0; i -= 1) {
    const row = active[i]
    if (row && !hotSet.has(row.watch.pairAddress.toLowerCase())) return row
  }
  return undefined
}

export function applyColdChallenges(args: {
  active: TierPairWatch[]
  activeFacts: ReadonlyMap<string, LocalPromotionFacts>
  challengers: ColdChallenger[]
  protectedHot: Iterable<string | { pairAddress: string }>
  maxPairs?: number
}): ColdPromotionDecision {
  const maxPairs = args.maxPairs ?? INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs
  const hotSet = new Set([...args.protectedHot].map((addr) => addressKey(addr)))
  const nextActive = uniqueWatches(args.active)
    .filter((watch) => !hotSet.has(watch.pairAddress))
    .slice(0, maxPairs)
    .map((watch) => ({ ...watch, tier: 'TIER_2' as const }))
  const facts = new Map<string, LocalPromotionFacts>(
    [...args.activeFacts.entries()].map(([addr, row]) => [addr.toLowerCase(), row]),
  )

  for (const watch of nextActive) {
    if (!facts.has(watch.pairAddress)) facts.set(watch.pairAddress, factsFromLiquidityOnly(watch))
  }

  let promotionCandidates = 0
  let promotionsApplied = 0
  let evictionsApplied = 0
  const seenChallengers = new Set<string>()

  for (const challenger of args.challengers) {
    const address = challenger.watch.pairAddress.toLowerCase()
    if (seenChallengers.has(address)) continue
    seenChallengers.add(address)
    if (hotSet.has(address)) continue
    if (nextActive.some((watch) => watch.pairAddress === address)) continue

    const eligible = challenger.facts.hasEvidence
    if (!eligible) continue

    if (nextActive.length < maxPairs) {
      const weakest = weakestEligibleActive(
        nextActive.map((watch) => ({
          watch,
          score: facts.get(watch.pairAddress)?.rankScore ?? liquidityFallbackScore(watch.liquidityScore),
        })),
        hotSet,
      )
      if (weakest && !beatsWeakestActive(challenger.facts, facts.get(weakest.watch.pairAddress) ?? factsFromLiquidityOnly(weakest.watch))) {
        continue
      }
      promotionCandidates += 1
      nextActive.push({ ...challenger.watch, pairAddress: address, tier: 'TIER_2' })
      facts.set(address, challenger.facts)
      promotionsApplied += 1
      continue
    }

    const scored = nextActive.map((watch) => ({
      watch,
      score: facts.get(watch.pairAddress)?.rankScore ?? liquidityFallbackScore(watch.liquidityScore),
    }))
    const weakest = weakestEligibleActive(scored, hotSet)
    if (!weakest) continue
    const weakestFacts = facts.get(weakest.watch.pairAddress) ?? factsFromLiquidityOnly(weakest.watch)
    if (!beatsWeakestActive(challenger.facts, weakestFacts)) continue

    promotionCandidates += 1
    const evictAt = nextActive.findIndex((watch) => watch.pairAddress === weakest.watch.pairAddress)
    if (evictAt < 0) continue
    nextActive.splice(evictAt, 1, { ...challenger.watch, pairAddress: address, tier: 'TIER_2' })
    facts.delete(weakest.watch.pairAddress)
    facts.set(address, challenger.facts)
    promotionsApplied += 1
    evictionsApplied += 1
  }

  return {
    nextActive: nextActive.slice(0, maxPairs),
    nextActiveScores: new Map(
      nextActive.map((watch) => [watch.pairAddress, facts.get(watch.pairAddress)?.rankScore ?? 0]),
    ),
    promotionCandidates,
    promotionsApplied,
    evictionsApplied,
  }
}

export async function runColdPromotionPass(args: {
  cold: TierPairWatch[]
  active: TierPairWatch[]
  protectedHot: TierPairWatch[]
  rotationIndex: number
  maxSamples?: number
  maxActive?: number
  shouldStop: () => boolean
  loadFacts: (watch: TierPairWatch) => Promise<LocalPromotionFacts>
  evaluatePair?: (watch: TierPairWatch) => Promise<void>
}): Promise<ColdPromotionPassResult> {
  const maxSamples = args.maxSamples ?? TIER3_COLD_SAMPLE_PER_INVOCATION
  const maxActive = args.maxActive ?? INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs
  const hotSet = new Set(args.protectedHot.map((watch) => watch.pairAddress.toLowerCase()))
  const active = uniqueWatches(args.active).filter((watch) => !hotSet.has(watch.pairAddress)).slice(0, maxActive)
  const coldUniverse = listColdUniverse(args.cold, [...hotSet, ...active.map((watch) => watch.pairAddress)])

  const factsCache = new Map<string, LocalPromotionFacts>()
  const loadFacts = async (watch: TierPairWatch) => {
    const facts = await args.loadFacts(watch)
    factsCache.set(watch.pairAddress.toLowerCase(), facts)
    return facts
  }

  for (const watch of active) {
    factsCache.set(watch.pairAddress, factsFromLiquidityOnly(watch))
  }
  const weakestSeed = weakestEligibleActive(
    active.map((watch) => ({
      watch,
      score: factsCache.get(watch.pairAddress)?.rankScore ?? liquidityFallbackScore(watch.liquidityScore),
    })),
    hotSet,
  )
  if (weakestSeed && !args.shouldStop()) {
    await loadFacts(weakestSeed.watch)
  }

  const challengers: ColdChallenger[] = []
  const batch = await runBoundedRotatingBatch({
    pairs: coldUniverse,
    rotationIndex: args.rotationIndex,
    maxJobs: maxSamples,
    shouldStop: args.shouldStop,
    runJob: async (watch) => {
      await loadFacts(watch)
      if (args.evaluatePair && !args.shouldStop()) {
        await args.evaluatePair(watch)
        await loadFacts(watch)
      }
      const facts = factsCache.get(watch.pairAddress.toLowerCase()) ?? factsFromLiquidityOnly(watch)
      challengers.push({ watch, facts })
    },
  })

  const decision = applyColdChallenges({
    active,
    activeFacts: factsCache,
    challengers,
    protectedHot: hotSet,
    maxPairs: maxActive,
  })

  return {
    nextActive: decision.nextActive,
    sampled: batch.processed,
    coldSamplesAttempted: batch.jobsAttempted,
    coldSamplesCompleted: batch.jobsCompleted,
    promotionCandidates: decision.promotionCandidates,
    promotionsApplied: decision.promotionsApplied,
    evictionsApplied: decision.evictionsApplied,
    coldBatchStoppedByDeadline: batch.batchStoppedByDeadline,
    nextColdRotationIndex: batch.nextRotationIndex,
    coldTierSize: coldUniverse.length,
  }
}
