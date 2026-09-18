import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { INDEXER_TIER_DEFINITIONS } from 'lib/data-truth/ontology'
import {
  compareTierRankedAssets,
  isCredibleMoverChange,
  rankTierAssets,
  type TierRankedAsset,
} from 'lib/trending/tierTrendingModel'
import { TIER1_JOBS_PER_INVOCATION, TIER2_JOBS_PER_INVOCATION, TIER3_COLD_SAMPLE_PER_INVOCATION } from '../tierScheduler'

const root = join(__dirname, '../../../..')

function read(rel: string) {
  return readFileSync(join(root, rel), 'utf8')
}

describe('observation throughput regressions', () => {
  it('does not change TIER1 HOT batching or founder/core treatment', () => {
    const orchestrator = read('lib/bsc-indexer/indexer/indexerOrchestrator.ts')
    const inventory = read('lib/bsc-indexer/indexer/tierInventory.ts')
    expect(INDEXER_TIER_DEFINITIONS.TIER_1.maxPairs).toBe(8)
    expect(TIER1_JOBS_PER_INVOCATION).toBe(6)
    expect(orchestrator).toContain('TIER1_JOBS_PER_INVOCATION')
    expect(orchestrator).toContain('FOUNDER_TIER1_BATCH')
    expect(inventory).toContain('FOUNDER_WBNB_PAIR_ADDRESSES')
    expect(inventory).toContain('remainingTier1Slots')
  })

  it('uses a sequential bounded TIER2 batch instead of unbounded Promise.all fan-out', () => {
    const orchestrator = read('lib/bsc-indexer/indexer/indexerOrchestrator.ts')
    const inventory = read('lib/bsc-indexer/indexer/tierInventory.ts')
    expect(TIER2_JOBS_PER_INVOCATION).toBe(8)
    expect(orchestrator).toContain('runBoundedRotatingBatch')
    expect(orchestrator).toContain('TIER2_JOBS_PER_INVOCATION')
    expect(orchestrator).not.toMatch(/Promise\.all\(\s*tier2/)
    expect(orchestrator).not.toMatch(/for\s*\(.*tier2Candidates[\s\S]*await Promise\.all/)
    expect(inventory).toContain('TIER2_ACTIVITY_SCORE_CONCURRENCY')
    expect(inventory).not.toMatch(/slice\(0,\s*40\)/)
    expect(inventory).not.toMatch(/slice\(0,\s*12\)/)
    expect(TIER3_COLD_SAMPLE_PER_INVOCATION).toBe(2)
    expect(orchestrator).toContain('TIER3_COLD_SAMPLE_PER_INVOCATION')
    expect(orchestrator).toContain('runColdPromotionPass')
    expect(orchestrator).toContain('listColdUniverse')
    expect(orchestrator).toContain('[...inventory.tier2, ...inventory.tier3]')
    expect(orchestrator).toContain('coldPass.coldTierSize')
    expect(orchestrator).not.toMatch(/coldTierSize = inventory\.tier3\.length/)
    expect(orchestrator).not.toMatch(/Promise\.all\(\s*tier3/)
    expect(orchestrator).not.toMatch(/Promise\.all\(\s*cold/)
    expect(orchestrator).not.toMatch(/for\s*\(.*inventory\.tier3[\s\S]*await Promise\.all/)
  })

  it('leaves TrendingV2 ranking formulas, credibility, and quote exclusions untouched', () => {
    const model = read('lib/trending/tierTrendingModel.ts')
    const rankings = read('views/HomeTrade/useDexTrendingRankings.ts')
    expect(model).toContain('Rank: swap count → volume → unique traders → recency → |%|')
    expect(model).toContain('if (abs > 25 && input.tradeCount24h < 3) return false')
    expect(model).toContain('if (abs > 40 && input.liquidityScore <= 0) return false')
    expect(model).toContain('if (abs > 80) return false')
    expect(rankings).toContain('if (abs > 25 && input.tradeCount24h < 3) return false')
    expect(rankings).toContain('export function isCredibleMoverChange')

    expect(
      isCredibleMoverChange({ pct: -49.1, tradeCount24h: 1, volume24h: 10, liquidityScore: 0 }),
    ).toBe(false)
    expect(
      isCredibleMoverChange({ pct: -4.2, tradeCount24h: 5, volume24h: 1000, liquidityScore: 1 }),
    ).toBe(true)

    const low: TierRankedAsset = {
      symbol: 'A',
      slug: 'a',
      pairSlug: 'a',
      address: '0x1',
      chainId: 56,
      displayName: 'A',
      tierStatus: 'READY',
      volume24h: 1000,
      liquidityScore: 1,
      tradeCount24h: 1,
      uniqueTraders: 1,
      lastActivityTs: 100,
      rankingSignals: [],
    }
    const high: TierRankedAsset = { ...low, symbol: 'B', slug: 'b', address: '0x2', tradeCount24h: 50, volume24h: 10 }
    expect(compareTierRankedAssets(high, low)).toBeLessThan(0)
    expect(rankTierAssets([low, { ...low, symbol: 'A', slug: 'a-dup', volume24h: 5 }])).toHaveLength(1)
  })

  it('reports COLD→ACTIVE telemetry without changing P0 TIER2=128 / batch=8', () => {
    const orchestrator = read('lib/bsc-indexer/indexer/indexerOrchestrator.ts')
    expect(INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs).toBe(128)
    expect(TIER2_JOBS_PER_INVOCATION).toBe(8)
    for (const field of [
      'coldTierSize',
      'coldSamplesAttempted',
      'coldSamplesCompleted',
      'promotionCandidates',
      'promotionsApplied',
      'evictionsApplied',
      'coldBatchStoppedByDeadline',
      'nextColdRotationIndex',
    ]) {
      expect(orchestrator).toContain(field)
    }
  })
})
