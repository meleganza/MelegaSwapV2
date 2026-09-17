import { beforeEach, describe, expect, it, vi } from 'vitest'
import { INDEXER_TIER_DEFINITIONS } from 'lib/data-truth/ontology'
import { MARCO_WBNB_PAIR_BSC } from '../../constants'
import { FOUNDER_WBNB_PAIR_ADDRESSES } from '../../founderWbnbPairs'
import { FEATURED_PAIR_SLUG } from '../../v2/paths'

const resolveOnchainRegistry = vi.fn()
const loadHealth = vi.fn()
const listEvents = vi.fn()

vi.mock('../../registry/store', () => ({
  resolveOnchainRegistry: (...args: unknown[]) => resolveOnchainRegistry(...args),
}))

vi.mock('../../storage', () => ({
  resolveIndexerStorageForSlug: () => ({
    loadHealth: (...args: unknown[]) => loadHealth(...args),
    listEvents: (...args: unknown[]) => listEvents(...args),
  }),
}))

import {
  TIER2_ACTIVITY_SCORE_CONCURRENCY,
  TIER2_ACTIVITY_SCORE_SAMPLE,
  TIER2_CANDIDATE_POOL_SIZE,
  liquidityFallbackScore,
  loadTierPairInventory,
  mergeTier2Scores,
  selectActiveTier2,
  takeTier2CandidatePool,
  type TierPairWatch,
} from '../tierInventory'

const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDT = '0x55d398326f99059ff775485246999027b3197955'
const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'

function hexAddr(n: number): string {
  return `0x${n.toString(16).padStart(40, '0')}`
}

function watch(i: number, liquidity: bigint): TierPairWatch {
  return {
    tier: 'TIER_2',
    slug: `p${i}`,
    pairAddress: hexAddr(i + 100),
    token0: hexAddr(i + 200),
    token1: WBNB,
    liquidityScore: liquidity,
  }
}

describe('TIER2 ACTIVE inventory throughput', () => {
  beforeEach(() => {
    resolveOnchainRegistry.mockReset()
    loadHealth.mockReset()
    listEvents.mockReset()
    loadHealth.mockResolvedValue({ indexingLag: 0 })
    listEvents.mockResolvedValue([])
  })

  it('keeps TIER1 HOT capacity at 8 and expands TIER2 ACTIVE capacity to 128', () => {
    expect(INDEXER_TIER_DEFINITIONS.TIER_1.maxPairs).toBe(8)
    expect(INDEXER_TIER_DEFINITIONS.TIER_2.maxPairs).toBe(128)
    expect(INDEXER_TIER_DEFINITIONS.TIER_3).toMatchObject({ id: 'TIER_3' })
    expect(INDEXER_TIER_DEFINITIONS.TIER_3.definition.toLowerCase()).toContain('cold')
  })

  it('expands the candidate pool materially above the previous 40 cap', () => {
    expect(TIER2_CANDIDATE_POOL_SIZE).toBe(256)
    expect(TIER2_CANDIDATE_POOL_SIZE).toBeGreaterThan(40)
    expect(TIER2_ACTIVITY_SCORE_SAMPLE).toBeGreaterThan(12)
    expect(TIER2_ACTIVITY_SCORE_CONCURRENCY).toBe(8)
    const pool = takeTier2CandidatePool(Array.from({ length: 400 }, (_, i) => i))
    expect(pool).toHaveLength(256)
    expect(pool[0]).toBe(0)
    expect(pool[255]).toBe(255)
  })

  it('fills 128 ACTIVE slots from a 256-candidate liquidity universe', () => {
    const candidates = Array.from({ length: 256 }, (_, i) => watch(i, BigInt(256 - i) * BigInt('1000000000000000000')))
    const selected = selectActiveTier2(mergeTier2Scores(candidates, new Map()))
    expect(selected).toHaveLength(128)
    expect(new Set(selected.map((row) => row.pairAddress)).size).toBe(128)
    expect(selected[0]?.pairAddress).toBe(candidates[0]?.pairAddress)
  })

  it('lets local activity scores promote inside the larger candidate set without extra provider calls', () => {
    const candidates = Array.from({ length: 80 }, (_, i) => watch(i, BigInt(80 - i) * BigInt('1000000000000000000')))
    const boosted = candidates[40]!
    const scores = new Map<string, number>([[boosted.pairAddress, 1_000_000]])
    const selected = selectActiveTier2(mergeTier2Scores(candidates, scores), 8)
    expect(selected[0]?.pairAddress).toBe(boosted.pairAddress)
    expect(liquidityFallbackScore(BigInt('1000000000000000000'))).toBe(1)
  })

  it('loads 128 ACTIVE pairs from a large tradeable registry and keeps TIER1 founder/core treatment', async () => {
    const pairs = [
      {
        pairAddress: MARCO_WBNB_PAIR_BSC,
        token0: MARCO,
        token1: WBNB,
        reserve0: '1000000000000000000',
        reserve1: '1000000000000000000',
        active: true,
      },
      ...FOUNDER_WBNB_PAIR_ADDRESSES.map((pairAddress, i) => ({
        pairAddress,
        token0: hexAddr(900 + i),
        token1: WBNB,
        reserve0: '5000000000000000000',
        reserve1: '5000000000000000000',
        active: true,
      })),
      {
        pairAddress: hexAddr(50),
        token0: MARCO,
        token1: USDT,
        reserve0: '2000000000000000000',
        reserve1: '2000000000000000000',
        active: true,
      },
      ...Array.from({ length: 300 }, (_, i) => ({
        pairAddress: hexAddr(1000 + i),
        token0: hexAddr(2000 + i),
        token1: WBNB,
        reserve0: `${300 - i}000000000000000000`,
        reserve1: `${300 - i}000000000000000000`,
        active: true,
      })),
    ]
    resolveOnchainRegistry.mockResolvedValue({ registry: { amm: { pairs } } })

    const inventory = await loadTierPairInventory()
    expect(inventory.tier1.length).toBeLessThanOrEqual(INDEXER_TIER_DEFINITIONS.TIER_1.maxPairs)
    expect(inventory.tier1.some((row) => row.slug === FEATURED_PAIR_SLUG)).toBe(true)
    expect(inventory.tier1.some((row) => row.pairAddress === FOUNDER_WBNB_PAIR_ADDRESSES[0])).toBe(true)
    expect(inventory.tier2CandidatesConsidered).toBe(256)
    expect(inventory.tier2).toHaveLength(128)
    expect(inventory.activeTierSize).toBe(inventory.tier1.length + inventory.tier2.length)
    expect(inventory.tier3Count).toBeGreaterThan(0)
    expect(inventory.tier3).toHaveLength(inventory.tier3Count)
    expect(inventory.tier3.every((row) => row.tier === 'TIER_3')).toBe(true)
    const addresses = inventory.tier3.map((row) => row.pairAddress)
    expect(addresses).toEqual([...addresses].sort((a, b) => a.localeCompare(b)))

    const overlap = inventory.tier2.filter((row) => inventory.tier1.some((hot) => hot.pairAddress === row.pairAddress))
    expect(overlap).toHaveLength(0)
    const coldOverlap = inventory.tier3.filter(
      (row) =>
        inventory.tier1.some((hot) => hot.pairAddress === row.pairAddress) ||
        inventory.tier2.some((active) => active.pairAddress === row.pairAddress),
    )
    expect(coldOverlap).toHaveLength(0)
    expect(loadHealth).toHaveBeenCalled()
    expect(listEvents).toHaveBeenCalled()
    expect(loadHealth.mock.calls.length).toBeLessThanOrEqual(TIER2_ACTIVITY_SCORE_SAMPLE)
  })
})
