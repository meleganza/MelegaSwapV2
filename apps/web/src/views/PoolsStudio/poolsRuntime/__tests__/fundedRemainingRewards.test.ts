import { describe, expect, it, vi } from 'vitest'
import BigNumber from 'bignumber.js'
import type { Token } from '@pancakeswap/sdk'
import type { Pool } from '@pancakeswap/uikit'
import { PoolCategory } from 'config/constants/types'

vi.mock('state/types', () => ({
  VaultKey: {
    CakeVaultV1: 'cakeVaultV1',
    CakeVault: 'cakeVault',
    CakeFlexibleSideVault: 'cakeFlexibleSideVault',
    IfoPool: 'ifo',
  },
}))

vi.mock('config/constants/pools', () => ({
  __esModule: true,
  default: [],
  vaultPoolConfig: {
    cakeVaultV1: {},
    cakeVault: {},
    cakeFlexibleSideVault: {},
    ifo: {},
  },
  livePools56: [],
  livePools1: [],
  livePools8453: [],
  livePools137: [],
  MAX_LOCK_DURATION: 0,
}))

vi.mock('utils/addressHelpers', () => ({
  getAddress: (value: unknown) => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && typeof (value as Record<number, string>)[56] === 'string') {
      return (value as Record<number, string>)[56]
    }
    return ''
  },
}))

vi.mock('utils/blockExplorer', () => ({
  getAddressExplorerUrl: (address: string) => `https://bscscan.com/address/${address}`,
  getBlockExplorerBaseUrl: () => 'https://bscscan.com',
  getTokenExplorerUrl: (address: string) => `https://bscscan.com/token/${address}`,
}))

vi.mock('views/Pools/helpers', () => ({
  getPoolBlockInfo: () => ({ hasPoolStarted: true, shouldShowCountdown: false }),
  getAprData: (pool: { apr?: number }) => ({ apr: pool.apr ?? 0, autoCompoundFrequency: 0 }),
}))

vi.mock('state/pools', () => ({}))
vi.mock('state/index', () => ({ __esModule: true, default: {}, store: { getState: () => ({}) } }))

import { getRemainingRewards, getRemainingRewardsRaw } from '../formatPoolPresentation'
import { mapPoolToPreviewCard } from '../formatPoolsRuntime'

const CHEF = '0x41D5487836452d23f2c467070244E5842B412794'
const CURRENT_BLOCK = 1500

function makePool(overrides: Record<string, unknown> = {}): Pool.DeserializedPool<Token> {
  return {
    sousId: 1,
    contractAddress: { 56: CHEF },
    stakingToken: {
      symbol: 'MARCO',
      decimals: 18,
      address: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
    },
    earningToken: {
      symbol: 'RWD',
      decimals: 18,
      address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    },
    tokenPerBlock: new BigNumber('1000000000000000000'),
    startBlock: 1000,
    endBlock: 2000,
    bonusEndBlock: 2000,
    isFinished: false,
    totalStaked: new BigNumber('1000000000000000000000'),
    stakingTokenPrice: 1,
    earningTokenPrice: 1,
    apr: 12,
    poolCategory: PoolCategory.COMMUNITY,
    ...overrides,
  } as Pool.DeserializedPool<Token>
}

describe('getRemainingRewards funded display cap', () => {
  it('two-argument calls stay baseline-equivalent for label/pct/tone/raw', () => {
    const pool = makePool()
    const baseline = getRemainingRewards(pool, CURRENT_BLOCK)
    expect(baseline.raw).toBe(500)
    expect(baseline.label).toBe('500 RWD')
    expect(baseline.pct).toBe(50)
    expect(baseline.tone).toBe('yellow')
    expect(getRemainingRewardsRaw(pool, CURRENT_BLOCK)).toBe(500)
  })

  it('caps raw/label when funded < schedule and leaves pct/tone block-based', () => {
    const pool = makePool()
    const baseline = getRemainingRewards(pool, CURRENT_BLOCK)
    const capped = getRemainingRewards(pool, CURRENT_BLOCK, 100)
    expect(capped.raw).toBe(100)
    expect(capped.label).toBe('100 RWD')
    expect(capped.pct).toBe(baseline.pct)
    expect(capped.tone).toBe(baseline.tone)
    expect(getRemainingRewardsRaw(pool, CURRENT_BLOCK)).toBe(baseline.raw)
  })

  it('keeps schedule as cap when funded > schedule', () => {
    const pool = makePool()
    const baseline = getRemainingRewards(pool, CURRENT_BLOCK)
    const uncapped = getRemainingRewards(pool, CURRENT_BLOCK, 10_000)
    expect(uncapped).toEqual(baseline)
    expect(getRemainingRewardsRaw(pool, CURRENT_BLOCK)).toBe(500)
  })

  it('omits funded cap for invalid funded values (NaN / negative)', () => {
    const pool = makePool()
    const baseline = getRemainingRewards(pool, CURRENT_BLOCK)
    expect(getRemainingRewards(pool, CURRENT_BLOCK, Number.NaN)).toEqual(baseline)
    expect(getRemainingRewards(pool, CURRENT_BLOCK, -1)).toEqual(baseline)
  })
})

describe('mapPoolToPreviewCard funded remaining rewards', () => {
  it('without a map stays baseline-equivalent', () => {
    const pool = makePool()
    const baseline = getRemainingRewards(pool, CURRENT_BLOCK)
    const card = mapPoolToPreviewCard(pool, CURRENT_BLOCK)
    expect(card?.remainingRewards).toBe(baseline.label)
    expect(card?.remainingRewardsPct).toBe(baseline.pct)
    expect(card?.remainingRewardsTone).toBe(baseline.tone)
  })

  it('uses chef address and earning token decimals when a map is provided', () => {
    const pool = makePool({
      earningToken: {
        symbol: 'RWD8',
        decimals: 8,
        address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
      tokenPerBlock: new BigNumber('100000000'),
    })
    const baseline = getRemainingRewards(pool, CURRENT_BLOCK)
    expect(baseline.raw).toBe(500)
    const card = mapPoolToPreviewCard(pool, CURRENT_BLOCK, 0, {
      [CHEF.toLowerCase()]: '10000000000',
    })
    expect(card?.remainingRewards).toBe('100 RWD8')
    expect(card?.remainingRewardsPct).toBe(baseline.pct)
    expect(card?.remainingRewardsTone).toBe(baseline.tone)
  })

  it('missing chef in the map preserves current remaining-rewards behavior', () => {
    const pool = makePool()
    const baseline = getRemainingRewards(pool, CURRENT_BLOCK)
    const card = mapPoolToPreviewCard(pool, CURRENT_BLOCK, 0, {
      '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb': '1',
    })
    expect(card?.remainingRewards).toBe(baseline.label)
    expect(card?.remainingRewardsPct).toBe(baseline.pct)
    expect(card?.remainingRewardsTone).toBe(baseline.tone)
  })
})
