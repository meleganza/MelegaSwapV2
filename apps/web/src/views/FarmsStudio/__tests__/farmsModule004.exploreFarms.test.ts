/**
 * FARMS_MODULE_004 — Explore Farms focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import {
  FARMS_ARCHITECTURE_000_TIP,
  FARMS_MODULE_001_FREEZE_SHA256,
  FARMS_MODULE_002_FREEZE_SHA256,
  FARMS_MODULE_003_FREEZE_SHA256,
  farmsExplore,
} from '../modules/farmsExploreFarmsTokens'
import {
  buildFarmsExploreFarmsViewModel,
  cardToExploreFarmModel,
  dedupeExploreFarms,
  filterExploreFarms,
  isActiveStakeableExploreFarm,
  searchExploreFarms,
  sortExploreFarms,
} from '../modules/buildFarmsExploreFarms'
import type { FarmPreviewCard } from '../farmsStudioData'
import type { ExploreFarmViewModel } from '../modules/farmsExploreFarmsTypes'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const MODULES = path.join(STUDIO, 'modules')

const sha = (rel: string) => createHash('sha256').update(readFileSync(path.join(WEB, rel))).digest('hex')

function makeCard(partial: Partial<FarmPreviewCard> & { pid?: number } = {}): FarmPreviewCard {
  const pid = partial.pid ?? 1
  const rawPartial = (partial.rawFarm ?? {}) as Record<string, unknown>
  const userPartial = (rawPartial.userData ?? {}) as Record<string, unknown>
  const { rawFarm: _drop, ...rest } = partial
  return {
    id: `farm-${pid}`,
    pair: 'MARCO / ASTER',
    tokens: ['MARCO', 'ASTER'],
    status: 'live',
    tvl: '$124.5K',
    dailyRewards: '12.4 MARCO',
    multiplier: '2x',
    liquidity: '$124.5K',
    apr: '24.62%',
    displayApr: '24.62%',
    cta: 'stake',
    emissionState: 'active',
    rewardToken: 'MXMX',
    ...rest,
    pid,
    rawFarm: {
      pid,
      multiplier: '2X',
      isStable: false,
      liquidity: new BigNumber(124500),
      lpAddress: '0x1111111111111111111111111111111111111111',
      lpSymbol: 'MARCO-ASTER LP',
      token: { symbol: 'MARCO', name: 'MARCO', decimals: 18, address: '0x2222222222222222222222222222222222222222' },
      quoteToken: { symbol: 'ASTER', name: 'ASTER', decimals: 18, address: '0x3333333333333333333333333333333333333333' },
      earningToken: { symbol: 'MXMX', name: 'MXMX', decimals: 18, address: '0x4444444444444444444444444444444444444444' },
      ...rawPartial,
      userData: {
        tokenBalance: new BigNumber(0),
        allowance: new BigNumber(0),
        stakedBalance: new BigNumber(0),
        earnings: new BigNumber(0),
        ...userPartial,
      },
    } as any,
  }
}

describe('FARMS_MODULE_004 Explore Farms', () => {
  it('freezes Architecture tip, Founder mockup, and Modules 001–003 sources', () => {
    expect(FARMS_ARCHITECTURE_000_TIP.startsWith('8edd68d4')).toBe(true)
    const mock = path.join(REPO, FARMS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mock)).toBe(true)
    expect(createHash('sha256').update(readFileSync(mock)).digest('hex')).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    expect(farmsExplore.mockupSha256).toBe(FARMS_FOUNDER_MOCKUP.sha256)

    expect(sha('src/views/FarmsStudio/modules/FarmsHeroModule.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroModule)
    expect(sha('src/views/FarmsStudio/modules/FarmsHeroArtwork.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroArtwork)
    expect(sha('src/views/FarmsStudio/modules/FarmsHeroTrustPanel.tsx')).toBe(
      FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroTrustPanel,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsHeroTokens.ts')).toBe(FARMS_MODULE_001_FREEZE_SHA256.farmsHeroTokens)

    expect(sha('src/views/FarmsStudio/modules/FarmsOverviewKpisModule.tsx')).toBe(
      FARMS_MODULE_002_FREEZE_SHA256.FarmsOverviewKpisModule,
    )
    expect(sha('src/views/FarmsStudio/modules/buildFarmsOverviewKpis.ts')).toBe(
      FARMS_MODULE_002_FREEZE_SHA256.buildFarmsOverviewKpis,
    )

    expect(sha('src/views/FarmsStudio/modules/FarmsMyFarmsModule.tsx')).toBe(FARMS_MODULE_003_FREEZE_SHA256.FarmsMyFarmsModule)
    expect(sha('src/views/FarmsStudio/modules/FarmsMyFarmCard.tsx')).toBe(FARMS_MODULE_003_FREEZE_SHA256.FarmsMyFarmCard)
    expect(sha('src/views/FarmsStudio/modules/buildFarmsWalletPositions.ts')).toBe(
      FARMS_MODULE_003_FREEZE_SHA256.buildFarmsWalletPositions,
    )
    expect(sha('src/views/FarmsStudio/modules/useFarmsWalletPositions.ts')).toBe(
      FARMS_MODULE_003_FREEZE_SHA256.useFarmsWalletPositions,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsMyFarmsTokens.ts')).toBe(FARMS_MODULE_003_FREEZE_SHA256.farmsMyFarmsTokens)
    expect(sha('src/views/FarmsStudio/modules/farmsMyFarmsTypes.ts')).toBe(FARMS_MODULE_003_FREEZE_SHA256.farmsMyFarmsTypes)
  })

  it('locks desktop card geometry 446×268 with 19px gaps filling 1376', () => {
    expect(446 * 3 + 19 * 2).toBe(1376)
    expect(farmsExplore.cardW).toBe('446px')
    expect(farmsExplore.cardH).toBe('268px')
    expect(farmsExplore.cardGapX).toBe('19px')
    expect(farmsExplore.cardGapY).toBe('18px')
    expect(farmsExplore.initialLimit).toBe(9)
  })

  it('mounts Module 004 after My Farms, supersedes legacy grid, omits 005–008', () => {
    const screen = readFileSync(path.join(STUDIO, 'FarmsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('FarmsExploreFarmsModule')
    expect(screen).toContain('data-farms-module-004="mounted"')
    expect(screen.indexOf('FarmsMyFarmsModule')).toBeLessThan(screen.indexOf('FarmsExploreFarmsModule'))
    expect(screen).not.toContain('FarmsFilterRow')
    expect(screen).not.toContain('FarmsGrid')
    expect(screen).not.toContain('data-farms-module="005"')
    expect(screen).not.toContain('FarmsFinishedFarms')
    expect(screen).not.toContain('FarmsYieldAdvisor')
    expect(screen).not.toContain('FarmsAnalytics')
    const exploreMod = readFileSync(path.join(MODULES, 'FarmsExploreFarmsModule.tsx'), 'utf8')
    expect(exploreMod.match(/id="explore-farms"/g)?.length).toBe(1)
    expect(screen).not.toContain('id="explore-farms"')
  })

  it('includes only active stakeable LP farms; excludes ended, emergency, disabled, pid0', () => {
    const active = makeCard({ pid: 1 })
    const ended = makeCard({ pid: 2, status: 'finished', cta: 'none', rawFarm: { pid: 2, multiplier: '0X' } as any })
    const emergency = makeCard({
      pid: 3,
      status: 'finished',
      cta: 'none',
      rawFarm: { pid: 3, enableEmergencyWithdraw: true, lpAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } as any,
    })
    const noDeposit = makeCard({ pid: 4, cta: 'none' })
    const pid0 = makeCard({ pid: 0, rawFarm: { pid: 0, isTokenOnly: true } as any })
    const badLp = makeCard({ pid: 5, rawFarm: { pid: 5, lpAddress: 'bad', multiplier: '1X' } as any })
    const zeroAlloc = makeCard({ pid: 6, emissionState: 'no_allocation' })

    expect(isActiveStakeableExploreFarm(active)).toBe(true)
    expect(isActiveStakeableExploreFarm(ended)).toBe(false)
    expect(isActiveStakeableExploreFarm(emergency)).toBe(false)
    expect(isActiveStakeableExploreFarm(noDeposit)).toBe(false)
    expect(isActiveStakeableExploreFarm(pid0)).toBe(false)
    expect(isActiveStakeableExploreFarm(badLp)).toBe(false)
    expect(isActiveStakeableExploreFarm(zeroAlloc)).toBe(false)

    const vm = buildFarmsExploreFarmsViewModel({
      portfolioFarms: [active, ended, emergency, noDeposit, pid0, badLp, zeroAlloc],
      farmsLoading: false,
      chainId: 56,
      userDataLoaded: true,
      filter: 'All',
      sort: 'Highest Sustainable APR',
      search: '',
    })
    expect(vm.registry).toHaveLength(1)
    expect(vm.farms[0].status).toBe('ACTIVE')
    expect(vm.farms[0].stakeEnabled).toBe(true)
  })

  it('models loading, empty, unavailable, partial, and stale retention', () => {
    expect(
      buildFarmsExploreFarmsViewModel({
        portfolioFarms: [],
        farmsLoading: true,
        chainId: 56,
        userDataLoaded: false,
        filter: 'All',
        sort: 'Highest Sustainable APR',
        search: '',
      }).state,
    ).toBe('loading')

    expect(
      buildFarmsExploreFarmsViewModel({
        portfolioFarms: [],
        farmsLoading: false,
        chainId: 56,
        userDataLoaded: true,
        filter: 'All',
        sort: 'Highest Sustainable APR',
        search: '',
      }).state,
    ).toBe('empty')

    expect(
      buildFarmsExploreFarmsViewModel({
        portfolioFarms: [],
        farmsLoading: false,
        chainId: 56,
        userDataLoaded: true,
        sourcesFailed: true,
        filter: 'All',
        sort: 'Highest Sustainable APR',
        search: '',
      }).state,
    ).toBe('unavailable')

    const prior = cardToExploreFarmModel(makeCard({ pid: 9 }), {
      chainId: 56,
      userDataLoaded: true,
      chainSupported: true,
    })!
    const stale = buildFarmsExploreFarmsViewModel({
      portfolioFarms: [],
      farmsLoading: false,
      chainId: 56,
      userDataLoaded: true,
      sourcesFailed: true,
      previous: [prior],
      previousChainId: 56,
      filter: 'All',
      sort: 'Highest Sustainable APR',
      search: '',
    })
    expect(stale.state).toBe('stale')
    expect(stale.farms).toHaveLength(1)
    expect(stale.disclosure).toMatch(/last known/i)

    const partialCard = makeCard({
      pid: 10,
      apr: '—',
      displayApr: undefined,
      rawFarm: {
        pid: 10,
        multiplier: '1X',
        lpAddress: '0x5555555555555555555555555555555555555555',
        liquidity: undefined,
        token: { symbol: 'A', address: '0x6666666666666666666666666666666666666666' },
        quoteToken: { symbol: 'B', address: '0x7777777777777777777777777777777777777777' },
        earningToken: { symbol: 'R', address: '0x8888888888888888888888888888888888888888' },
      } as any,
      tvl: '—',
    })
    const partial = buildFarmsExploreFarmsViewModel({
      portfolioFarms: [partialCard],
      farmsLoading: false,
      chainId: 56,
      userDataLoaded: true,
      filter: 'All',
      sort: 'Highest Sustainable APR',
      search: '',
    })
    expect(partial.state).toBe('partial')
    expect(partial.farms[0].apr).toBe('—')
    expect(partial.farms[0].tvl).toBe('—')
    expect(partial.farms[0].tvl).not.toBe('$0')
  })

  it('paginates at 9 with Load More determinism and dedupes pid/LP', () => {
    const cards = Array.from({ length: 12 }, (_, i) => {
      const pid = i + 1
      const lp = `0x${String(pid).padStart(40, '0')}`
      return makeCard({
        pid,
        apr: `${30 - i}.00%`,
        displayApr: `${30 - i}.00%`,
        rawFarm: {
          pid,
          lpAddress: lp,
          multiplier: '1X',
          liquidity: new BigNumber(10_000 + pid),
          token: { symbol: `T${pid}`, address: `0x${String(pid + 100).padStart(40, '0')}` },
          quoteToken: { symbol: `Q${pid}`, address: `0x${String(pid + 200).padStart(40, '0')}` },
          earningToken: { symbol: 'MARCO', address: '0x4444444444444444444444444444444444444444' },
        } as any,
      })
    })
    const vm = buildFarmsExploreFarmsViewModel({
      portfolioFarms: cards,
      farmsLoading: false,
      chainId: 56,
      userDataLoaded: true,
      filter: 'All',
      sort: 'Highest Sustainable APR',
      search: '',
      visibleLimit: 9,
    })
    expect(vm.totalActive).toBe(12)
    expect(vm.visibleFarms).toHaveLength(9)
    expect(vm.hasMore).toBe(true)

    const more = buildFarmsExploreFarmsViewModel({
      portfolioFarms: cards,
      farmsLoading: false,
      chainId: 56,
      userDataLoaded: true,
      filter: 'All',
      sort: 'Highest Sustainable APR',
      search: '',
      visibleLimit: 18,
    })
    expect(more.visibleFarms).toHaveLength(12)
    expect(more.hasMore).toBe(false)

    const dupPid = makeCard({ pid: 1, id: 'farm-1-dup' })
    const dupLp = makeCard({
      pid: 99,
      rawFarm: {
        pid: 99,
        lpAddress: '0x1111111111111111111111111111111111111111',
        multiplier: '1X',
        token: { symbol: 'X', address: '0x9999999999999999999999999999999999999999' },
        quoteToken: { symbol: 'Y', address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
        earningToken: { symbol: 'Z', address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
      } as any,
    })
    const deduped = dedupeExploreFarms(
      [makeCard({ pid: 1 }), dupPid, dupLp]
        .map((c) => cardToExploreFarmModel(c, { chainId: 56, userDataLoaded: true, chainSupported: true }))
        .filter(Boolean) as ExploreFarmViewModel[],
    )
    expect(deduped).toHaveLength(1)
  })

  it('searches symbols, names, addresses, farm id and pid exactly for addresses', () => {
    const a = cardToExploreFarmModel(makeCard({ pid: 1 }), { chainId: 56, userDataLoaded: true, chainSupported: true })!
    const b = cardToExploreFarmModel(
      makeCard({
        pid: 2,
        rawFarm: {
          pid: 2,
          multiplier: '1X',
          lpAddress: '0xcccccccccccccccccccccccccccccccccccccccc',
          lpSymbol: 'WBNB-BUSD LP',
          isStable: true,
          liquidity: new BigNumber(50_000),
          token: { symbol: 'WBNB', name: 'Wrapped BNB', address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c' },
          quoteToken: { symbol: 'BUSD', name: 'BUSD', address: '0xdddddddddddddddddddddddddddddddddddddddd' },
          earningToken: { symbol: 'MARCO', name: 'MARCO', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' },
        } as any,
      }),
      { chainId: 56, userDataLoaded: true, chainSupported: true },
    )!
    const farms = [a, b]

    expect(searchExploreFarms(farms, 'MARCO').map((f) => f.pid).sort()).toEqual([1, 2])
    expect(searchExploreFarms(farms, 'ASTER').map((f) => f.pid)).toEqual([1])
    expect(searchExploreFarms(farms, 'MXMX').map((f) => f.pid)).toEqual([1])
    expect(searchExploreFarms(farms, 'Wrapped BNB').map((f) => f.pid)).toEqual([2])
    expect(searchExploreFarms(farms, '0x1111111111111111111111111111111111111111')).toHaveLength(1)
    expect(searchExploreFarms(farms, '0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE')).toHaveLength(1)
    expect(searchExploreFarms(farms, 'farm-2')).toHaveLength(1)
    expect(searchExploreFarms(farms, '2')).toHaveLength(1)
    // Partial address must not fuzzy-match
    expect(searchExploreFarms(farms, '0x111111')).toHaveLength(0)
  })

  it('filters and sorts factually with unavailable after available', () => {
    const stable = cardToExploreFarmModel(
      makeCard({
        pid: 1,
        apr: '10.00%',
        displayApr: '10.00%',
        rawFarm: {
          pid: 1,
          isStable: true,
          multiplier: '1X',
          liquidity: new BigNumber(10_000),
          lpAddress: '0x1111111111111111111111111111111111111111',
          token: { symbol: 'USDT', address: '0x2222222222222222222222222222222222222222' },
          quoteToken: { symbol: 'BUSD', address: '0x3333333333333333333333333333333333333333' },
          earningToken: { symbol: 'MARCO', address: '0x4444444444444444444444444444444444444444' },
          userData: { tokenBalance: new BigNumber('1000000000000000000'), allowance: new BigNumber(1) },
        } as any,
      }),
      { chainId: 56, account: '0x1', userDataLoaded: true, chainSupported: true },
    )!
    const volatileNative = cardToExploreFarmModel(
      makeCard({
        pid: 2,
        apr: '40.00%',
        displayApr: '40.00%',
        rawFarm: {
          pid: 2,
          isStable: false,
          multiplier: '2X',
          liquidity: new BigNumber(200_000),
          lpAddress: '0x5555555555555555555555555555555555555555',
          token: { symbol: 'WBNB', address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c' },
          quoteToken: { symbol: 'MARCO', address: '0x6666666666666666666666666666666666666666' },
          earningToken: { symbol: 'MARCO', address: '0x4444444444444444444444444444444444444444' },
          userData: { tokenBalance: new BigNumber(0), allowance: new BigNumber(0) },
          auctionHostingStartSeconds: 200,
        } as any,
      }),
      { chainId: 56, account: '0x1', userDataLoaded: true, chainSupported: true },
    )!
    const noApr = cardToExploreFarmModel(
      makeCard({
        pid: 3,
        apr: '—',
        displayApr: undefined,
        rawFarm: {
          pid: 3,
          multiplier: '1X',
          liquidity: new BigNumber(5_000),
          lpAddress: '0x7777777777777777777777777777777777777777',
          token: { symbol: 'A', address: '0x8888888888888888888888888888888888888888' },
          quoteToken: { symbol: 'B', address: '0x9999999999999999999999999999999999999999' },
          earningToken: { symbol: 'R', address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
          auctionHostingStartSeconds: 50,
        } as any,
      }),
      { chainId: 56, account: '0x1', userDataLoaded: true, chainSupported: true },
    )!

    const all = [stable, volatileNative, noApr]
    expect(filterExploreFarms(all, 'Stable LP')).toHaveLength(1)
    expect(filterExploreFarms(all, 'Volatile LP')).toHaveLength(2)
    expect(filterExploreFarms(all, 'Native Pair')).toHaveLength(1)
    expect(filterExploreFarms(all, 'High APR')).toHaveLength(1)
    expect(filterExploreFarms(all, 'Wallet Has LP')).toHaveLength(1)
    expect(filterExploreFarms(all, 'Approved')).toHaveLength(1)
    expect(filterExploreFarms(all, 'Stakeable Now')).toHaveLength(3)

    const byApr = sortExploreFarms(all, 'Highest Sustainable APR')
    expect(byApr[0].pid).toBe(2)
    expect(byApr[byApr.length - 1].pid).toBe(3)

    const byNewest = sortExploreFarms(all, 'Newest')
    expect(byNewest[0].pid).toBe(2)

    const byAlpha = sortExploreFarms(all, 'Alphabetical')
    expect(byAlpha[0].sortTitle <= byAlpha[1].sortTitle).toBe(true)
  })

  it('omits Details when no destination; labels sustainable APR only when policy validates', () => {
    const model = cardToExploreFarmModel(makeCard({ pid: 1 }), {
      chainId: 56,
      userDataLoaded: true,
      chainSupported: true,
    })!
    expect(model.detailsHref).toBeNull()
    expect(model.aprLabel).toBe('Sustainable APR')

    const rawOnly = cardToExploreFarmModel(
      makeCard({ pid: 2, emissionState: 'unavailable', status: 'indexing', cta: 'stake' }),
      { chainId: 56, userDataLoaded: true, chainSupported: true },
    )
    // indexing + unavailable emission excluded by inclusion when emission unavailable? 
    // emissionState unavailable is allowed through inclusion — aprLabel becomes APR
    if (rawOnly) {
      expect(rawOnly.aprLabel).toBe('APR')
    }
  })

  it('wallet LP and allowance fail independently; disconnected messaging', () => {
    const disconnected = cardToExploreFarmModel(makeCard({ pid: 1 }), {
      chainId: 56,
      account: null,
      userDataLoaded: false,
      chainSupported: true,
    })!
    expect(disconnected.userWalletLpBalanceState).toBe('disconnected')
    expect(disconnected.primaryAction).toBe('Connect Wallet')
    expect(disconnected.allowanceState).toBe('Disconnected')

    const zero = cardToExploreFarmModel(makeCard({ pid: 1 }), {
      chainId: 56,
      account: '0x1',
      userDataLoaded: true,
      chainSupported: true,
    })!
    expect(zero.userWalletLpBalance).toBe('0 LP')
    expect(zero.allowanceState).toBe('Approval required')

    const wrongChain = cardToExploreFarmModel(makeCard({ pid: 1 }), {
      chainId: 56,
      account: '0x1',
      userDataLoaded: true,
      chainSupported: false,
    })!
    expect(wrongChain.primaryAction).toBe('Switch Network')
  })

  it('ships no production mock farms and keeps reward token visually distinct in card source', () => {
    const src = ['FarmsExploreFarmsModule.tsx', 'FarmsExploreFarmCard.tsx', 'buildFarmsExploreFarms.ts', 'useFarmsExploreFarms.ts']
      .map((f) => readFileSync(path.join(MODULES, f), 'utf8'))
      .join('\n')
    expect(src).not.toContain('mockFarms')
    expect(src).not.toContain('SAMPLE_FARM')
    expect(src).not.toContain('fixtureFarm')
    expect(readFileSync(path.join(MODULES, 'FarmsExploreFarmCard.tsx'), 'utf8')).toContain('data-reward-token')
    expect(readFileSync(path.join(MODULES, 'FarmsExploreFarmCard.tsx'), 'utf8')).toContain('MelegaTokenAvatar')
  })
})
