import { describe, expect, it } from 'vitest'
import { INDEXER_TIER_DEFINITIONS } from 'lib/data-truth/ontology'
import { IndexerDeadline } from '../indexerDeadline'
import {
  applyColdChallenges,
  beatsWeakestActive,
  factsFromLiquidityOnly,
  listColdUniverse,
  overlayAddresses,
  runColdPromotionPass,
  seatPersistedOverlay,
  takePersistedOverlay,
  type LocalPromotionFacts,
} from '../coldPromotion'
import { TIER2_JOBS_PER_INVOCATION, TIER3_COLD_SAMPLE_PER_INVOCATION } from '../tierScheduler'
import type { TierPairWatch } from '../tierInventory'

function hexAddr(n: number): string {
  return `0x${n.toString(16).padStart(40, '0')}`
}

function watch(n: number, liquidity: bigint, tier: TierPairWatch['tier'] = 'TIER_2'): TierPairWatch {
  return {
    tier,
    slug: `p${n}`,
    pairAddress: hexAddr(n),
    token0: hexAddr(n + 1000),
    token1: hexAddr(n + 2000),
    liquidityScore: liquidity,
  }
}

function facts(watchRow: TierPairWatch, overrides: Partial<LocalPromotionFacts> = {}): LocalPromotionFacts {
  const base = factsFromLiquidityOnly(watchRow)
  const swapCount = overrides.swapCount ?? 0
  const liquidity = overrides.liquidity ?? base.liquidity
  const computedRank = overrides.rankScore ?? swapCount * 10_000 + liquidity
  const lag = overrides.lag ?? 0
  return {
    ...base,
    ...overrides,
    swapCount,
    liquidity,
    lag,
    rankScore: computedRank,
    activityScore: overrides.activityScore ?? computedRank - lag,
    hasEvidence: overrides.hasEvidence ?? (swapCount > 0 || liquidity > 0 || Boolean(overrides.hasStoredEvents)),
  }
}

describe('P1 COLD→ACTIVE promotion policy', () => {
  it('keeps ACTIVE capacity at 128 and COLD sample at 2 without changing TIER2 batch=8', () => {
    expect(INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs).toBe(128)
    expect(TIER3_COLD_SAMPLE_PER_INVOCATION).toBe(2)
    expect(TIER3_COLD_SAMPLE_PER_INVOCATION).toBeGreaterThanOrEqual(1)
    expect(TIER3_COLD_SAMPLE_PER_INVOCATION).toBeLessThanOrEqual(2)
    expect(TIER2_JOBS_PER_INVOCATION).toBe(8)
  })

  it('samples a unique rotating window and never scans the full COLD set', async () => {
    const active = Array.from({ length: 128 }, (_, i) => watch(i + 1, BigInt(200 - i) * 10n ** 18n))
    const cold = Array.from({ length: 400 }, (_, i) => watch(i + 200, 10n ** 18n, 'TIER_3'))
    const factLoads: string[] = []
    const first = await runColdPromotionPass({
      cold,
      active,
      protectedHot: [watch(0, 10n ** 18n, 'TIER_1')],
      rotationIndex: 7,
      shouldStop: () => false,
      loadFacts: async (row) => {
        factLoads.push(row.pairAddress)
        return facts(row)
      },
    })
    expect(first.coldSamplesAttempted).toBe(2)
    expect(first.coldSamplesCompleted).toBe(2)
    expect(first.sampled).toHaveLength(2)
    expect(new Set(first.sampled.map((row) => row.pairAddress)).size).toBe(2)
    expect(first.sampled[0]?.pairAddress).toBe(cold[7]?.pairAddress)
    expect(first.sampled[1]?.pairAddress).toBe(cold[8]?.pairAddress)
    expect(first.nextColdRotationIndex).toBe(9)
    expect(first.promotionsApplied).toBe(0)
    expect(factLoads.length).toBeLessThanOrEqual(1 + 2 * 2)
    expect(factLoads).not.toHaveLength(400)

    const second = await runColdPromotionPass({
      cold,
      active,
      protectedHot: [],
      rotationIndex: first.nextColdRotationIndex,
      shouldStop: () => false,
      loadFacts: async (row) => facts(row),
    })
    expect(second.sampled[0]?.pairAddress).toBe(cold[9]?.pairAddress)
    expect(second.coldSamplesCompleted).toBe(2)
  })

  it('stops on deadline, persists the unadvanced-or-partial cursor, and does not retry', async () => {
    const deadline = new IndexerDeadline(Date.now(), 20_000)
    const cold = Array.from({ length: 20 }, (_, i) => watch(i + 1, 10n ** 18n, 'TIER_3'))
    let factLoads = 0
    const first = await runColdPromotionPass({
      cold,
      active: Array.from({ length: 8 }, (_, i) => watch(i + 100, 10n ** 18n)),
      protectedHot: [],
      rotationIndex: 4,
      shouldStop: () => factLoads >= 2 || deadline.shouldStop(),
      loadFacts: async (row) => {
        factLoads += 1
        return facts(row, { swapCount: 2 })
      },
    })
    expect(first.coldSamplesCompleted).toBe(1)
    expect(first.coldBatchStoppedByDeadline).toBe(true)
    expect(first.nextColdRotationIndex).toBe(5)
    expect(first.sampled).toHaveLength(1)

    const resumed = await runColdPromotionPass({
      cold,
      active: Array.from({ length: 8 }, (_, i) => watch(i + 100, 10n ** 18n)),
      protectedHot: [],
      rotationIndex: first.nextColdRotationIndex,
      shouldStop: () => false,
      loadFacts: async (row) => facts(row),
    })
    expect(resumed.sampled[0]?.pairAddress).toBe(cold[5]?.pairAddress)
  })

  it('promotes a stronger challenger and evicts the deterministic weakest ACTIVE pair', () => {
    const active = Array.from({ length: 128 }, (_, i) => watch(i + 1, BigInt(128 - i) * 10n ** 18n))
    const weakest = active[127]!
    const challenger = watch(500, 50n * 10n ** 18n, 'TIER_3')
    const activeFacts = new Map(active.map((row) => [row.pairAddress, facts(row)]))
    const decision = applyColdChallenges({
      active,
      activeFacts,
      challengers: [{ watch: challenger, facts: facts(challenger, { swapCount: 3, liquidity: 50 }) }],
      protectedHot: [watch(0, 10n ** 18n, 'TIER_1')],
    })
    expect(decision.nextActive).toHaveLength(128)
    expect(decision.promotionCandidates).toBe(1)
    expect(decision.promotionsApplied).toBe(1)
    expect(decision.evictionsApplied).toBe(1)
    expect(decision.nextActive.some((row) => row.pairAddress === challenger.pairAddress)).toBe(true)
    expect(decision.nextActive.some((row) => row.pairAddress === weakest.pairAddress)).toBe(false)
    expect(new Set(decision.nextActive.map((row) => row.pairAddress)).size).toBe(128)
  })

  it('never evicts protected TIER1 / HOT pairs', () => {
    const hot = watch(1, 1n, 'TIER_1')
    const active = [watch(2, 5n * 10n ** 18n), watch(3, 4n * 10n ** 18n)]
    const challenger = watch(9, 100n * 10n ** 18n, 'TIER_3')
    const decision = applyColdChallenges({
      active: [hot, ...active],
      activeFacts: new Map([
        [hot.pairAddress, facts(hot, { rankScore: 0, activityScore: 0, hasEvidence: true })],
        [active[0]!.pairAddress, facts(active[0]!, { liquidity: 5 })],
        [active[1]!.pairAddress, facts(active[1]!, { liquidity: 4 })],
      ]),
      challengers: [{ watch: challenger, facts: facts(challenger, { swapCount: 8, liquidity: 100 }) }],
      protectedHot: [hot],
      maxPairs: 2,
    })
    expect(decision.nextActive.some((row) => row.pairAddress === hot.pairAddress)).toBe(false)
    expect(decision.nextActive).toHaveLength(2)
    expect(decision.nextActive.some((row) => row.pairAddress === challenger.pairAddress)).toBe(true)
  })

  it('does not churn when the challenger is only microscopically better', () => {
    const weakest = watch(2, 10n * 10n ** 18n)
    const active = [watch(1, 20n * 10n ** 18n), weakest]
    const challenger = watch(9, 10n * 10n ** 18n + 10n ** 14n, 'TIER_3')
    const weakestFacts = facts(weakest, { liquidity: 10, rankScore: 10, activityScore: 10 })
    const challengerFacts = facts(challenger, { liquidity: 10.0001, rankScore: 10.0001, activityScore: 10.0001 })
    expect(beatsWeakestActive(challengerFacts, weakestFacts)).toBe(false)
    const decision = applyColdChallenges({
      active,
      activeFacts: new Map([
        [active[0]!.pairAddress, facts(active[0]!, { liquidity: 20 })],
        [weakest.pairAddress, weakestFacts],
      ]),
      challengers: [{ watch: challenger, facts: challengerFacts }],
      protectedHot: [],
      maxPairs: 2,
    })
    expect(decision.promotionsApplied).toBe(0)
    expect(decision.evictionsApplied).toBe(0)
    expect(decision.promotionCandidates).toBe(0)
    expect(decision.nextActive.map((row) => row.pairAddress)).toEqual(active.map((row) => row.pairAddress))
  })

  it('seats a persisted overlay without exceeding 128 or duplicating ACTIVE members', () => {
    const natural = Array.from({ length: 128 }, (_, i) => watch(i + 1, BigInt(200 - i) * 10n ** 18n))
    const cold = [watch(900, 3n * 10n ** 18n, 'TIER_3'), watch(901, 4n * 10n ** 18n, 'TIER_3'), natural[0]!]
    const overlay = takePersistedOverlay(
      [hexAddr(900), hexAddr(900), hexAddr(1), hexAddr(0)],
      natural,
      cold,
      [watch(0, 1n, 'TIER_1')],
    )
    expect(overlay).toHaveLength(1)
    const seated = seatPersistedOverlay({
      naturalActive: [...natural, natural[0]!],
      overlay,
      protectedHot: [hexAddr(0)],
      maxPairs: 128,
    })
    expect(seated).toHaveLength(128)
    expect(new Set(seated.map((row) => row.pairAddress)).size).toBe(128)
    expect(seated.some((row) => row.pairAddress === hexAddr(900))).toBe(true)
    expect(seated.some((row) => row.pairAddress === natural[127]!.pairAddress)).toBe(false)
    expect(overlayAddresses(seated, natural)).toEqual([hexAddr(900)])
  })

  it('builds a stable COLD universe without HOT/ACTIVE duplicates', () => {
    const cold = [watch(3, 1n, 'TIER_3'), watch(2, 1n, 'TIER_3'), watch(2, 1n, 'TIER_3')]
    const universe = listColdUniverse(cold, [hexAddr(1), hexAddr(3)])
    expect(universe.map((row) => row.pairAddress)).toEqual([hexAddr(2)])
  })

  it('evaluates COLD samples sequentially with no unbounded concurrency', async () => {
    let inflight = 0
    let maxInflight = 0
    const cold = Array.from({ length: 10 }, (_, i) => watch(i + 1, 10n ** 18n, 'TIER_3'))
    await runColdPromotionPass({
      cold,
      active: [watch(99, 10n ** 18n)],
      protectedHot: [],
      rotationIndex: 0,
      shouldStop: () => false,
      loadFacts: async (row) => {
        inflight += 1
        maxInflight = Math.max(maxInflight, inflight)
        inflight -= 1
        return facts(row)
      },
      evaluatePair: async () => {
        inflight += 1
        maxInflight = Math.max(maxInflight, inflight)
        inflight -= 1
      },
    })
    expect(maxInflight).toBe(1)
  })
})
