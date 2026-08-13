/**
 * MELEGASWAP_V2_FARMS_FINAL_PRODUCT_CONSISTENCY — focused gates for FOUNDER_LEDGER FARM-01..24.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import BigNumber from 'bignumber.js'
import { buildFarmsWalletPositionsViewModel } from '../modules/buildFarmsWalletPositions'
import { cardToExploreFarmModel } from '../modules/buildFarmsExploreFarms'
import { farmsMyFarms } from '../modules/farmsMyFarmsTokens'
import { filterPairsForFarmFactory } from '../modules/publicFarmPairSearch'
import type { FarmPreviewCard } from '../farmsStudioData'

const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

function makeFarm(partial: Partial<FarmPreviewCard> & { id: string }): FarmPreviewCard {
  return {
    pair: partial.pair ?? 'MARCO-BNB',
    tokens: partial.tokens ?? ['MARCO', 'BNB'],
    status: partial.status ?? 'live',
    tvl: partial.tvl ?? '$1.2M',
    dailyRewards: partial.dailyRewards ?? '—',
    multiplier: partial.multiplier ?? '40X',
    liquidity: partial.liquidity ?? '$1.2M',
    cta: partial.cta ?? 'stake',
    emissionState: partial.emissionState ?? 'active',
    ...partial,
  }
}

function stakedFarm(id: string, pid: number): FarmPreviewCard {
  return makeFarm({
    id,
    pid,
    userStaked: new BigNumber('1000000000000000000'),
    pendingReward: new BigNumber('100000000000000000'),
    rawFarm: {
      pid,
      lpAddress: `0x${pid.toString(16).padStart(40, '0')}`,
      lpSymbol: 'MARCO-BNB LP',
      multiplier: '40X',
      token: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
      quoteToken: { symbol: 'BNB', decimals: 18, address: '0xbnb' },
      earningToken: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
      lpToken: { decimals: 18 },
      userData: { stakedBalance: new BigNumber('1000000000000000000') },
    } as any,
  })
}

describe('Farms final product consistency', () => {
  it('FARM-01/04: preview max 4; View all my farms expands inline; Show less', () => {
    expect(farmsMyFarms.maxVisibleDesktop).toBe(4)
    const mod = load('modules/FarmsMyFarmsModule.tsx')
    expect(mod).toContain('View all my farms')
    expect(mod).toContain('Show less')
    expect(mod).toContain("setExpanded((v) => !v)")
    expect(mod).toContain('farmsMyFarms.maxVisibleDesktop')
    expect(mod).toContain('Cards')
    expect(mod).toContain('List')
    expect(mod).toContain('farms-my-farms-list-header')

    const cards = [1, 2, 3, 4, 5].map((n) => stakedFarm(`f${n}`, n))
    const vm = buildFarmsWalletPositionsViewModel({
      account: '0xWallet',
      chainId: 56,
      portfolioFarms: cards,
      userDataLoaded: true,
      farmsLoading: false,
    } as any)
    expect(vm.positions.length).toBeGreaterThanOrEqual(5)
    expect(vm.visiblePositions).toHaveLength(4)
    expect(vm.showViewAll).toBe(true)
  })

  it('FARM-02/03: full-width My Farms; no KPI overlap workarounds; hide empty/disconnected', () => {
    const mod = load('modules/FarmsMyFarmsModule.tsx')
    expect(mod).toContain('data-pixel-farms-my-farms="full-width"')
    expect(mod).toContain("vm.state === 'empty' || vm.state === 'disconnected'")
    expect(mod).not.toMatch(/margin-top:\s*-\d+px/)
    // Advisor portal host is clipped 1×1; must not use absolute layout for the module surface.
    expect(mod).toContain('AdvisorPortalHost')
    expect(mod).toMatch(/clip:\s*rect\(0 0 0 0\)/)
    const kpis = load('modules/FarmsOverviewKpisModule.tsx')
    expect(kpis).toContain('z-index: 1')
    expect(kpis).toMatch(/never pull My Farms over KPIs/i)
  })

  it('FARM-06/07/08: list logos, column headers, multiplier', () => {
    const mod = load('modules/FarmsMyFarmsModule.tsx')
    expect(mod).toContain('farms-my-list-token-logos')
    expect(mod).toContain('Deposited Value')
    expect(mod).toContain('Pending Rewards')
    expect(mod).toContain('Volume 24H')
    expect(mod).toContain('Multiplier')
    expect(mod).toContain('farms-my-list-multiplier')
  })

  it('FARM-09/10/11: Harvest / Stake More / Withdraw bind to requestModal', () => {
    const mod = load('modules/FarmsMyFarmsModule.tsx')
    expect(mod).toContain("data-action=\"harvest\"")
    expect(mod).toContain("data-action=\"stake-more\"")
    expect(mod).toContain("data-action=\"withdraw\"")
    expect(mod).toContain("requestModal(position.sourceCard, action.modalAction)")
    const card = load('modules/FarmsMyFarmCard.tsx')
    expect(card).toMatch(/Harvest|claim/)
    const host = load('farmsRuntime/FarmsActionHost.tsx')
    expect(host).toContain('useHarvestFarm')
    expect(host).toContain('useStakeFarms')
    expect(host).toContain('useUnstakeFarms')
  })

  it('FARM-12/17: Explore actions inside card; Manage removed', () => {
    const exploreCard = load('modules/FarmsExploreFarmCard.tsx')
    expect(exploreCard).not.toContain('farms-explore-manage')
    expect(exploreCard).not.toMatch(/>\s*Manage\s*</)
    expect(exploreCard).toContain('farms-explore-stake')
    expect(exploreCard).toContain('farms-explore-view-farm')
    expect(exploreCard).toContain('farms-explore-view-lp')
    expect(exploreCard).toContain('farms-explore-actions')
    const explore = load('modules/FarmsExploreFarmsModule.tsx')
    expect(explore).not.toMatch(/>\s*Manage\s*</)
  })

  it('FARM-15: participants never fabricated from token/LP amounts', () => {
    const model = cardToExploreFarmModel(
      makeFarm({
        id: '56:chef:1',
        participants: '123456.78',
        status: 'live',
        cta: 'stake',
        rawFarm: {
          pid: 1,
          lpAddress: '0x1111111111111111111111111111111111111111',
          token: { symbol: 'MARCO' },
          quoteToken: { symbol: 'BNB' },
          earningToken: { symbol: 'MARCO' },
          multiplier: '40X',
        } as any,
      }),
      { chainId: 56, account: null, userDataLoaded: false, chainSupported: true },
    )!
    expect(model.participants).toBe('Indexing…')
    const builder = load('modules/buildFarmsExploreFarms.ts')
    expect(builder).toContain('resolveFarmParticipants')
    expect(builder).toMatch(/unique wallet census|Never LP supply/i)
  })

  it('FARM-13/14: duration Ongoing when live+multiplier; remaining separate dash', () => {
    const model = cardToExploreFarmModel(
      makeFarm({
        id: '56:chef:2',
        status: 'live',
        multiplier: '40X',
        rawFarm: {
          pid: 2,
          lpAddress: '0x2222222222222222222222222222222222222222',
          token: { symbol: 'MARCO' },
          quoteToken: { symbol: 'BNB' },
          earningToken: { symbol: 'MARCO' },
          multiplier: '40X',
        } as any,
      }),
      { chainId: 56, account: null, userDataLoaded: false, chainSupported: true },
    )!
    expect(model.rewardDuration).toBe('Ongoing')
    expect(model.rewardsRemaining).toBe('—')
  })

  it('FARM-16/17: volume/fees stay uncertified dash (no TVL/emission invention)', () => {
    const model = cardToExploreFarmModel(
      makeFarm({
        id: '56:chef:3',
        tvl: '$9M',
        rawFarm: {
          pid: 3,
          lpAddress: '0x3333333333333333333333333333333333333333',
          token: { symbol: 'A' },
          quoteToken: { symbol: 'B' },
          earningToken: { symbol: 'R' },
        } as any,
      }),
      { chainId: 56, account: null, userDataLoaded: false, chainSupported: true },
    )!
    expect(model.volume24h).toBe('—')
    expect(model.fees24h).toBe('—')
  })

  it('FARM-18: sparkline reserved on every Explore card', () => {
    const card = load('modules/FarmsExploreFarmCard.tsx')
    expect(card).toContain('YieldActivitySparkline')
    expect(card).toContain('farms-explore-activity-spark')
    const spark = readFileSync(path.resolve(STUDIO, '../../components/YieldActivitySparkline.tsx'), 'utf8')
    expect(spark).toMatch(/baseline|never invents oscillation/i)
  })

  it('FARM-19/22: Create Farm first-open stable; selector portal z-index', () => {
    const screen = load('FarmsStudioScreen.tsx')
    expect(screen).toContain('data-create-farm-first-open-stable="true"')
    expect(screen).toContain('createOpenRef')
    expect(screen).toContain('if (createOpenRef.current) return')
    const workspace = load('modules/PublicFarmFactoryWorkspace.tsx')
    expect(workspace).toContain('createPortal')
    expect(workspace).toContain('create-farm-pair-dropdown')
    expect(workspace).toContain('melegaZIndex.overlayStacked')
    expect(workspace).not.toMatch(/z-index:\s*99999/)
  })

  it('FARM-20/21: pair search indexes symbol/name/address', () => {
    const pairs = [
      {
        pairAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        token0: '0xmarco000000000000000000000000000000000001',
        token1: '0xbnb00000000000000000000000000000000000001',
        symbol0: 'MARCO',
        symbol1: 'WBNB',
        name0: 'Melega',
        name1: 'Wrapped BNB',
        chainId: 56,
      },
      {
        pairAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        token0: '0xeyed000000000000000000000000000000000001',
        token1: '0xusdt000000000000000000000000000000000001',
        symbol0: 'EYED',
        symbol1: 'USDT',
        name0: 'Eye',
        name1: 'Tether',
        chainId: 56,
      },
    ] as any[]
    expect(filterPairsForFarmFactory(pairs, 'marco')).toHaveLength(1)
    expect(filterPairsForFarmFactory(pairs, '0xeyed000000000000000000000000000000000001')).toHaveLength(1)
    expect(filterPairsForFarmFactory(pairs, '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')).toHaveLength(1)
  })

  it('FARM-05/19 Explore toolbar compact Search + Filters + Cards|List', () => {
    const explore = load('modules/FarmsExploreFarmsModule.tsx')
    expect(explore).toContain('farms-explore-toolbar')
    expect(explore).toContain('Search farm / token / pair')
    expect(explore).toContain('Filters')
    expect(explore).toContain('farms-explore-view-toggle')
    expect(explore).toContain('farms-explore-list-header')
    expect(explore).toContain('Multiplier')
    expect(explore).toContain('Volume 24h')
  })

  it('FARM-22: multiplier has dedicated metric slot (not absolute overlay)', () => {
    const card = load('modules/FarmsExploreFarmCard.tsx')
    expect(card).toContain('farms-explore-multiplier-slot')
    expect(card).not.toMatch(/position:\s*absolute[^;]*;\s*[^}]*Multi/)
  })
})
