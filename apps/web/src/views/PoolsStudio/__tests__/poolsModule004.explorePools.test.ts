/**
 * POOLS_MODULE_004 — Explore Pools focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import BigNumber from 'bignumber.js'
import {
  buildPoolsExplorePoolsViewModel,
  cardToExploreModel,
  filterExplorePools,
  isActiveStakeableExplorePool,
  searchExplorePools,
  sortExplorePools,
} from '../modules/buildPoolsExplorePools'
import {
  POOLS_MODULE_001_FREEZE_SHA256,
  POOLS_MODULE_002_FREEZE_SHA256,
  POOLS_MODULE_003_FREEZE_SHA256,
  poolsExplore,
} from '../modules/poolsExplorePoolsTokens'
import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import type { PoolPreviewCard } from '../poolsStudioData'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const MODULES = path.join(STUDIO, 'modules')

function sha256File(relFromWeb: string): string {
  return createHash('sha256').update(readFileSync(path.join(WEB, relFromWeb))).digest('hex')
}

function makeCard(partial: Partial<PoolPreviewCard> & { id: string }): PoolPreviewCard {
  return {
    name: partial.name ?? 'MARCO → ASTER',
    tokens: partial.tokens ?? ['MARCO', 'ASTER'],
    stakeToken: partial.stakeToken ?? 'MARCO',
    rewardToken: partial.rewardToken ?? 'ASTER',
    tvl: partial.tvl ?? '$10K',
    dailyRewards: partial.dailyRewards ?? '—',
    participants: partial.participants ?? '1.2K',
    status: partial.status ?? 'live',
    displayStatus: partial.displayStatus ?? 'LIVE',
    cta: partial.cta ?? 'stake',
    visualType: partial.visualType ?? 'Flexible',
    lockPeriod: partial.lockPeriod ?? 'Flexible',
    apr: partial.apr ?? '12.50%',
    sustainableAprDisplay: partial.sustainableAprDisplay ?? '12.50%',
    aprExact: partial.aprExact ?? 12.5,
    sousId: partial.sousId ?? 1,
    rawPool: partial.rawPool ?? ({
      stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
      earningToken: { symbol: 'ASTER', decimals: 18, address: '0xaster' },
      stakingTokenPrice: 2,
      totalStaked: new BigNumber('1000000000000000000000'),
    } as any),
    ...partial,
  }
}

describe('POOLS_MODULE_004 Explore Pools', () => {
  it('freezes Architecture 000 mockup SHA', () => {
    const mockup = path.join(REPO, POOLS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    const hash = createHash('sha256').update(readFileSync(mockup)).digest('hex')
    expect(hash).toBe(POOLS_FOUNDER_MOCKUP.sha256)
    expect(hash).toBe(poolsExplore.mockupSha256)
  })

  it('freezes Modules 001–003 sources byte-identically', () => {
    expect(sha256File('src/views/PoolsStudio/modules/PoolsHeroModule.tsx')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.PoolsHeroModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsOverviewKpisModule.tsx')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.PoolsOverviewKpisModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsMyPositionsModule.tsx')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.PoolsMyPositionsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsMyPositionCard.tsx')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.PoolsMyPositionCard,
    )
    expect(sha256File('src/views/PoolsStudio/modules/buildPoolsWalletPositions.ts')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.buildPoolsWalletPositions,
    )
    expect(sha256File('src/views/PoolsStudio/modules/usePoolsWalletPositions.ts')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.usePoolsWalletPositions,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsMyPositionsTokens.ts')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.poolsMyPositionsTokens,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsMyPositionsTypes.ts')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.poolsMyPositionsTypes,
    )
  })

  it('mounts Module 004 after My Positions without Modules 005–010', () => {
    const screen = readFileSync(path.join(STUDIO, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('PoolsExplorePoolsModule')
    expect(screen).toContain('data-pools-module-004="mounted"')
    expect(screen.indexOf('PoolsMyPositionsModule')).toBeLessThan(screen.indexOf('PoolsExplorePoolsModule'))
    expect(screen).not.toContain('PoolsViewToolbar')
    expect(screen).not.toContain('PoolsGrid')
    expect(screen).not.toContain('data-pools-module="005"')
    expect(screen).not.toContain('PoolsFinishedModule')
    expect(screen).not.toContain('PoolsRewardAdvisorModule')
  })

  it('includes only active stakeable pools; excludes ended and AMM', () => {
    const active = makeCard({ id: 'sous-1', sousId: 1 })
    const ended = makeCard({
      id: 'sous-2',
      sousId: 2,
      status: 'ended',
      displayStatus: 'ENDED',
      cta: 'none',
    })
    const amm = makeCard({
      id: 'amm-pair-1',
      rawPool: { stakingToken: { symbol: 'LP', decimals: 18 }, earningToken: { symbol: 'X', decimals: 18 } } as any,
    })
    const indexing = makeCard({ id: 'sous-3', status: 'indexing', displayStatus: 'INDEXING', cta: 'analyze' })

    expect(isActiveStakeableExplorePool(active)).toBe(true)
    expect(isActiveStakeableExplorePool(ended)).toBe(false)
    expect(isActiveStakeableExplorePool(amm)).toBe(false)
    expect(isActiveStakeableExplorePool(indexing)).toBe(false)

    const vm = buildPoolsExplorePoolsViewModel({
      portfolioPools: [active, ended, amm, indexing],
      poolsLoading: false,
      chainId: 56,
      filter: 'All',
      sort: 'Highest APR',
      search: '',
    })
    expect(vm.pools).toHaveLength(1)
    expect(vm.pools[0].status).toBe('ACTIVE')
    expect(vm.pools[0].stakeEnabled).toBe(true)
  })

  it('shows unavailable APR / TVL honestly without $0 fallback', () => {
    const noApr = cardToExploreModel(
      makeCard({
        id: 'a',
        apr: '—',
        sustainableAprDisplay: undefined,
        aprExact: 0,
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
          stakingTokenPrice: 2,
          totalStaked: new BigNumber('1000000000000000000000'),
        } as any,
      }),
      56,
    )!
    expect(noApr.aprDisplay).toBe('—')
    expect(noApr.aprSupport).toBe('APR unavailable')

    const noTvl = cardToExploreModel(
      makeCard({
        id: 'b',
        tvl: '—',
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
          stakingTokenPrice: 0,
          totalStaked: new BigNumber('1000000000000000000000'),
        } as any,
      }),
      56,
    )!
    expect(noTvl.tvlDisplay).toBe('—')
    expect(noTvl.tvlDisplay).not.toBe('$0.00')
    expect(noTvl.status).toBe('PARTIAL')
  })

  it('omits Details when no canonical pool detail route exists', () => {
    const model = cardToExploreModel(makeCard({ id: 'sous-9' }), 56)!
    expect(model.detailsHref).toBeNull()
  })

  it('filters, sorts, and searches factually', () => {
    const a = cardToExploreModel(
      makeCard({
        id: 'sous-1',
        name: 'Alpha Pool',
        sousId: 1,
        aprExact: 10,
        sustainableAprDisplay: '10.00%',
        visualType: 'Flexible',
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
          stakingTokenPrice: 1,
          totalStaked: new BigNumber('1000000000000000000000'),
        } as any,
      }),
      56,
    )!
    const b = cardToExploreModel(
      makeCard({
        id: 'sous-2',
        name: 'Beta LP Pool',
        sousId: 2,
        stakeToken: 'CAKE-LP',
        aprExact: 30,
        sustainableAprDisplay: '30.00%',
        visualType: '90 Days',
        lockPeriod: '90 Days',
        rawPool: {
          stakingToken: { symbol: 'CAKE-LP', decimals: 18, address: '0xlp' },
          earningToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          stakingTokenPrice: 5,
          totalStaked: new BigNumber('5000000000000000000000'),
        } as any,
      }),
      56,
    )!
    const pools = [a, b]
    expect(filterExplorePools(pools, 'Flexible')).toHaveLength(1)
    expect(filterExplorePools(pools, 'LP')[0].poolId).toBe('sous-2')
    expect(filterExplorePools(pools, 'High APR')[0].poolId).toBe('sous-2')
    expect(sortExplorePools(pools, 'Alphabetical')[0].title).toBe('Alpha Pool')
    expect(sortExplorePools(pools, 'Highest APR')[0].poolId).toBe('sous-2')
    expect(searchExplorePools(pools, 'beta')).toHaveLength(1)
    expect(searchExplorePools(pools, '0xlp')).toHaveLength(1)
  })

  it('empty and loading states', () => {
    const loading = buildPoolsExplorePoolsViewModel({
      portfolioPools: [],
      poolsLoading: true,
      chainId: 56,
      filter: 'All',
      sort: 'Highest APR',
      search: '',
    })
    expect(loading.state).toBe('loading')

    const empty = buildPoolsExplorePoolsViewModel({
      portfolioPools: [
        makeCard({ id: 'ended', status: 'ended', displayStatus: 'ENDED', cta: 'none' }),
      ],
      poolsLoading: false,
      chainId: 56,
      filter: 'All',
      sort: 'Highest APR',
      search: '',
    })
    expect(empty.state).toBe('empty')
  })

  it('desktop geometry tokens match 430×248 / 18 gap / 3 columns', () => {
    expect(poolsExplore.cardW).toBe('430px')
    expect(poolsExplore.cardH).toBe('248px')
    expect(poolsExplore.cardGap).toBe('18px')
    expect(poolsExplore.contentMax).toBe('1376px')
  })

  it('module sources avoid production mock pools', () => {
    const src = [
      readFileSync(path.join(MODULES, 'PoolsExplorePoolsModule.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'buildPoolsExplorePools.ts'), 'utf8'),
      readFileSync(path.join(MODULES, 'usePoolsExplorePools.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toContain('getPoolsUxFixtureCards')
    expect(src).not.toContain('mockExplorePool')
    expect(src).not.toContain('SAMPLE_POOL')
  })
})
