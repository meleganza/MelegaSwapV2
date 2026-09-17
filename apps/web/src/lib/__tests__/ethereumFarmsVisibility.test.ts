/**
 * P0 — Ethereum farms visibility.
 * Canonical source: packages/farms/constants/1.ts + Melega ETH MasterChef.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import farmsEth from '@pancakeswap/farms/constants/1'
import { MELEGA_ETH_MASTER_BUILDER, MELEGA_ETH_FACTORY, isMelegaCapabilityEnabled } from 'config/melegaChainRegistry'
import { getMasterChefAddress } from 'utils/addressHelpers'
import {
  LIVE_YIELD_CHAIN_IDS,
  countNormalizedFarmsByChain,
  farmIdentity,
  listNormalizedFarms,
} from 'lib/data-truth/globalYieldInventory'
import {
  buildGlobalFarmPreviewCards,
  isExploreStakeableFarmPreview,
  mergeFarmPreviewCards,
} from 'lib/data-truth/farmConfigPreviewCards'
import { buildFarmsExploreFarmsViewModel } from 'views/FarmsStudio/modules/buildFarmsExploreFarms'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'

const WEB = path.resolve(__dirname, '../..')
const REPO = path.resolve(WEB, '../..')

const ETH_MASTER_CHEF = MELEGA_ETH_MASTER_BUILDER.toLowerCase()
const BSC_MASTER_CHEF = '0x41D5487836452d23f2c467070244E5842B412794'

/** Canonical Melega Ethereum LP farms (pid 0 MARCO token-only is Explore-excluded). */
const CANONICAL_ETH_LP_FARMS = [
  {
    pid: 1,
    lpSymbol: 'MARCO-WETH LP',
    lpAddress: '0x7f0183d7c1b0365a3580ecbdb2f0d8db2d693c5e',
    token0: 'MARCO',
    token1: 'WETH',
  },
  {
    pid: 2,
    lpSymbol: 'USDC-WETH LP',
    lpAddress: '0x15f6b6b609cc2e3d8e4a355c76c99b3956954664',
    token0: 'USDC',
    token1: 'WETH',
  },
  {
    pid: 3,
    lpSymbol: 'LOCO-WETH LP',
    lpAddress: '0x2ee39e16735b194006739c79785ef6f20adbb007',
    token0: 'LOCO',
    token1: 'WETH',
  },
  {
    pid: 4,
    lpSymbol: 'RKIT-WETH LP',
    lpAddress: '0xd3871eda34472dd428b24d9a5051f9665d73e1c5',
    token0: 'RKIT',
    token1: 'WETH',
  },
] as const

function exploreEth(portfolioFarms: FarmPreviewCard[], chainFilter: 'all' | number = 1) {
  return buildFarmsExploreFarmsViewModel({
    portfolioFarms,
    farmsLoading: false,
    chainId: 1,
    chainSupported: true,
    masterChefAddress: MELEGA_ETH_MASTER_BUILDER,
    userDataLoaded: true,
    filter: 'All',
    sort: 'Highest TVL',
    search: '',
    chainFilter,
  })
}

function unpricedRuntimeFromStubs(stubs: FarmPreviewCard[]): FarmPreviewCard[] {
  return stubs.map((stub) => ({
    ...stub,
    status: 'indexing' as const,
    cta: 'analyze' as const,
    tvl: '—',
    liquidity: '—',
    apr: undefined,
    displayApr: undefined,
    emissionState: 'unavailable' as const,
    dailyRewards: '—',
  }))
}

describe('Ethereum farms canonical source of truth', () => {
  it('binds Founder ETH MasterChef / factory and enables farms capability', () => {
    expect(getMasterChefAddress(1).toLowerCase()).toBe(ETH_MASTER_CHEF)
    expect(MELEGA_ETH_FACTORY.toLowerCase()).toBe('0x149ee9245e5ed52a89ea777d19ad3a5d87873680')
    expect(isMelegaCapabilityEnabled(1, 'farms')).toBe(true)
    expect([...LIVE_YIELD_CHAIN_IDS]).toContain(1)
  })

  it('enumerates the four certified Ethereum LP farms from packages/farms/constants/1.ts', () => {
    const config = farmsEth as Array<{
      pid: number
      lpSymbol: string
      lpAddress: string
      isTokenOnly?: boolean
      token: { symbol: string; chainId: number }
      quoteToken: { symbol: string; chainId: number }
    }>
    expect(config).toHaveLength(5)
    expect(config[0]).toMatchObject({ pid: 0, isTokenOnly: true, lpSymbol: 'MARCO' })

    const lp = config.filter((f) => f.pid !== 0 && !f.isTokenOnly)
    expect(lp).toHaveLength(CANONICAL_ETH_LP_FARMS.length)
    for (const expected of CANONICAL_ETH_LP_FARMS) {
      const row = lp.find((f) => f.pid === expected.pid)
      expect(row, `missing pid ${expected.pid}`).toBeTruthy()
      expect(row!.lpAddress.toLowerCase()).toBe(expected.lpAddress)
      expect(row!.lpSymbol).toBe(expected.lpSymbol)
      expect(row!.token.symbol).toBe(expected.token0)
      expect(row!.quoteToken.symbol).toBe(expected.token1)
      expect(row!.token.chainId).toBe(1)
      expect(row!.quoteToken.chainId).toBe(1)
    }
  })

  it('normalizes those farms into global inventory with ETH MasterChef identity', () => {
    const counts = countNormalizedFarmsByChain()
    expect(counts[1]).toBe(CANONICAL_ETH_LP_FARMS.length)
    const eth = listNormalizedFarms().filter((f) => f.chainId === 1)
    expect(eth).toHaveLength(CANONICAL_ETH_LP_FARMS.length)
    for (const expected of CANONICAL_ETH_LP_FARMS) {
      const row = eth.find((f) => f.pid === expected.pid)
      expect(row?.masterChef.toLowerCase()).toBe(ETH_MASTER_CHEF)
      expect(row?.lpAddress).toBe(expected.lpAddress)
      expect(row?.identity).toBe(farmIdentity(1, MELEGA_ETH_MASTER_BUILDER, expected.pid))
      expect(row?.source).toBe('packages/farms/constants/1')
    }
  })
})

describe('Ethereum farms remain visible when Ethereum is selected', () => {
  it('hydrates explore-stakeable preview cards for every canonical ETH LP farm', () => {
    const global = buildGlobalFarmPreviewCards()
    const eth = global.filter((c) => c.rawFarm?.token?.chainId === 1 || String(c.id).startsWith('1:'))
    expect(eth).toHaveLength(CANONICAL_ETH_LP_FARMS.length)
    expect(eth.every((card) => isExploreStakeableFarmPreview(card))).toBe(true)

    const vm = exploreEth(global, 1)
    expect(vm.registry.map((f) => f.pid).sort()).toEqual([1, 2, 3, 4])
    expect(vm.farms).toHaveLength(4)
    expect(vm.farms.every((f) => f.chainId === 1)).toBe(true)
    expect(vm.farms.every((f) => f.masterbuilder?.toLowerCase() === ETH_MASTER_CHEF)).toBe(true)
    expect(vm.farms.every((f) => f.lpToken.chainId === 1)).toBe(true)
    for (const expected of CANONICAL_ETH_LP_FARMS) {
      const farm = vm.farms.find((f) => f.pid === expected.pid)
      expect(farm?.lpToken.address).toBe(expected.lpAddress)
      expect(farm?.token0.symbol).toBe(expected.token0)
      expect(farm?.token1.symbol).toBe(expected.token1)
      expect(farm?.stakeEnabled).toBe(true)
    }
  })

  it('does not hide ETH inventory when active-chain runtime cards are still metric-less', () => {
    const global = buildGlobalFarmPreviewCards()
    const ethStubs = global.filter((c) => String(c.id).startsWith('1:'))
    const merged = mergeFarmPreviewCards(unpricedRuntimeFromStubs(ethStubs), 1, MELEGA_ETH_MASTER_BUILDER)
    const eth = merged.filter((c) => String(c.id).startsWith('1:'))
    expect(eth).toHaveLength(4)
    expect(eth.every((card) => isExploreStakeableFarmPreview(card))).toBe(true)
    expect(eth.every((card) => card.cta === 'stake')).toBe(true)

    const vm = exploreEth(merged, 1)
    expect(vm.state === 'ready' || vm.state === 'partial').toBe(true)
    expect(vm.farms.map((f) => f.pid).sort()).toEqual([1, 2, 3, 4])
    expect(vm.farms.every((f) => f.chainId === 1)).toBe(true)
  })

  it('keeps BSC farm identities unchanged and never labels them Ethereum', () => {
    const bscIds = listNormalizedFarms()
      .filter((f) => f.chainId === 56)
      .map((f) => f.identity)
      .sort()
    expect(bscIds.length).toBeGreaterThan(0)

    const mergedOnEth = mergeFarmPreviewCards([], 1, MELEGA_ETH_MASTER_BUILDER)
    const mergedOnBsc = mergeFarmPreviewCards([], 56, BSC_MASTER_CHEF)
    const bscAfterEthSelect = mergedOnEth
      .filter((c) => c.rawFarm?.token?.chainId === 56 || String(c.id).startsWith('56:'))
      .map((c) => c.id)
      .sort()
    const bscAfterBscSelect = mergedOnBsc
      .filter((c) => c.rawFarm?.token?.chainId === 56 || String(c.id).startsWith('56:'))
      .map((c) => c.id)
      .sort()
    expect(bscAfterEthSelect).toEqual(bscAfterBscSelect)
    expect(bscAfterEthSelect).toEqual(bscIds)

    const ethVm = exploreEth(mergedOnEth, 1)
    expect(ethVm.farms.every((f) => f.chainId === 1)).toBe(true)
    expect(ethVm.farms.every((f) => !String(f.farmId).startsWith('56:'))).toBe(true)

    const allVm = buildFarmsExploreFarmsViewModel({
      portfolioFarms: mergedOnBsc,
      farmsLoading: false,
      chainId: 56,
      chainSupported: true,
      masterChefAddress: BSC_MASTER_CHEF,
      userDataLoaded: true,
      filter: 'All',
      sort: 'Highest TVL',
      search: '',
      chainFilter: 'all',
    })
    const bscExplore = allVm.registry.filter((f) => f.chainId === 56)
    expect(bscExplore.length).toBe(bscIds.length)
    expect(allVm.registry.filter((f) => f.chainId === 1).map((f) => f.pid).sort()).toEqual([1, 2, 3, 4])
    expect(allVm.registry.every((f) => (f.chainId === 56 ? !f.farmId.startsWith('1:') : true))).toBe(true)
  })

  it('points the Ethereum core price poll at Melega pids 1 and 2, not PancakeSwap 124/125', () => {
    const hooks = readFileSync(path.join(WEB, 'state/farms/hooks.ts'), 'utf8')
    expect(hooks).toContain('1: [1, 2]')
    expect(hooks).not.toMatch(/1:\s*\[124,\s*125\]/)
    const farmSrc = readFileSync(path.join(REPO, 'packages/farms/constants/1.ts'), 'utf8')
    expect(farmSrc).toContain("lpAddress: '0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E'")
    expect(farmSrc).toContain("lpAddress: '0x15F6b6B609Cc2e3d8E4a355c76C99B3956954664'")
  })
})
