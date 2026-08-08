/**
 * MELEGASWAP_V2_MY_MELEGA_POSITIONS_DRAWER — adapter + shell contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  MY_MELEGA_CHAIN_FILTERS,
  MY_MELEGA_ROUTES,
  buildMyMelegaSnapshot,
} from '../myMelegaPositions'
import { melegaZIndex } from 'design-system/melega/tokens/melegaZIndex'
import { GLOBAL_HEADER_NAV } from 'app-shell/config/globalHeaderNav'
import type { FarmsWalletPosition } from 'views/FarmsStudio/modules/farmsMyFarmsTypes'
import type { PoolsWalletPosition } from 'views/PoolsStudio/modules/poolsMyPositionsTypes'
import type { PassportLiquidityPosition } from 'views/PassportStudio/passportLiquidityTypes'
import type { PortfolioClaimableRow } from 'views/PortfolioStudio/runtime/buildPortfolioViewModel'

const ROOT = path.resolve(__dirname, '../../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function farm(partial: Partial<FarmsWalletPosition> & Pick<FarmsWalletPosition, 'positionId' | 'chainId'>): FarmsWalletPosition {
  return {
    farmId: 'f1',
    pid: 1,
    masterChef: null,
    lpToken: { symbol: 'LP', address: null, decimals: 18, chainId: partial.chainId },
    token0: { symbol: 'USDT', address: null, decimals: 18, chainId: partial.chainId },
    token1: { symbol: 'MARCO', address: null, decimals: 18, chainId: partial.chainId },
    rewardToken: { symbol: 'MARCO', address: null, decimals: 18, chainId: partial.chainId },
    stakedRaw: null,
    stakedFormatted: '1',
    stakedValue: '$100.00',
    pendingRaw: null,
    pendingFormatted: '0',
    pendingValue: null,
    farmStatus: 'ACTIVE',
    positionStatus: 'ACTIVE',
    statusLabel: 'Active',
    apr: '4.72%',
    tvl: null,
    multiplier: null,
    actions: [],
    source: 'masterchef',
    freshness: 'live',
    partialData: false,
    partialReasons: [],
    provenance: 'test',
    sourceCard: {} as FarmsWalletPosition['sourceCard'],
    sortPendingUsd: 0,
    sortStakedUsd: 100,
    title: 'USDT / MARCO',
    subtitle: 'Farm',
    farmStateLine: '',
    ...partial,
  }
}

function pool(partial: Partial<PoolsWalletPosition> & Pick<PoolsWalletPosition, 'positionId' | 'chainId'>): PoolsWalletPosition {
  return {
    poolId: 'p1',
    sousId: 1,
    contractAddress: null,
    stakeToken: { symbol: 'MARCO', address: null, decimals: 18, chainId: partial.chainId },
    rewardToken: { symbol: 'EYED', address: null, decimals: 18, chainId: partial.chainId },
    stakedRaw: null,
    stakedFormatted: '1',
    stakedValue: '$50.00',
    claimableRaw: null,
    claimableFormatted: '—',
    claimableValue: null,
    poolStatus: 'ACTIVE',
    positionStatus: 'ACTIVE',
    statusLabel: 'Active',
    actions: [],
    source: 'souschef',
    freshness: 'live',
    partialData: false,
    partialReasons: [],
    provenance: 'test',
    sourceCard: { sustainableAprDisplay: '12.4%', apr: '12.4%' } as PoolsWalletPosition['sourceCard'],
    sortClaimableUsd: 0,
    sortStakedUsd: 50,
    title: 'MARCO → EYED',
    subtitle: 'Pool',
    poolStateLine: '',
    ...partial,
  } as PoolsWalletPosition
}

function liq(partial: Partial<PassportLiquidityPosition> & Pick<PassportLiquidityPosition, 'id'>): PassportLiquidityPosition {
  return {
    type: 'Manual',
    pairLabel: 'BNB / MARCO',
    token0Symbol: 'BNB',
    token1Symbol: 'MARCO',
    token0LogoUrl: null,
    token1LogoUrl: null,
    chainLabel: 'BNB',
    supportingLine: '',
    estimatedValue: '$1,240.22',
    estimatedValueState: 'indexed',
    sharePrimary: '—',
    shareSecondary: null,
    feesOrProgressLabel: '—',
    feesOrProgressKind: 'none',
    feesOrProgressValue: '—',
    status: 'Active',
    statusTone: 'active',
    source: 'wallet-lp',
    actionHref: '/liquidity-studio?view=positions',
    actionLabel: 'Manage',
    ...partial,
  } as PassportLiquidityPosition
}

describe('My Melega positions drawer — shell contracts', () => {
  it('removes hamburger overflow and mounts My Melega trigger', () => {
    const header = load('design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx')
    expect(header).not.toMatch(/melega-header-overflow/)
    expect(header).not.toMatch(/IconMenu/)
    expect(header).not.toMatch(/Open application menu/)
    expect(header).toMatch(/melega-header-my-melega/)
    expect(header).toMatch(/Open My Melega/)
    expect(header).toMatch(/IconUser/)
    expect(header).toMatch(/title="My Melega"/)
  })

  it('removes Portfolio from primary desktop header nav', () => {
    expect(GLOBAL_HEADER_NAV.map((i) => i.label)).toEqual(['Home', 'Liquidity', 'Farms', 'Pools', 'List'])
    expect(GLOBAL_HEADER_NAV.some((i) => i.label === 'Portfolio')).toBe(false)
  })

  it('shell wires provider + drawer + mobile trigger', () => {
    const shell = load('app-shell/MelegaAppShell.tsx')
    expect(shell).toContain('MyMelegaProvider')
    expect(shell).toContain('MyMelegaDrawer')
    expect(shell).toContain('melega-mobile-my-melega')
    expect(shell).toContain('Open My Melega')
  })

  it('drawer uses MelegaModal V3 overlay z-index portal and a11y', () => {
    const drawer = load('components/MyMelega/MyMelegaDrawer.tsx')
    expect(drawer).toContain('createPortal')
    expect(drawer).toContain('melegaZIndex.overlay')
    expect(drawer).toContain('aria-label="My Melega"')
    expect(drawer).toContain('Escape')
    expect(drawer).toContain('my-melega-full-portfolio')
    expect(drawer).toContain('MY_MELEGA_ROUTES.portfolio')
    expect(drawer).toContain('View Full Portfolio')
    expect(drawer).not.toMatch(/Passport|Guest|Subject|Verification/)
    expect(melegaZIndex.overlay).toBeGreaterThanOrEqual(10040)
  })

  it('documents canonical destination routes (no dead links)', () => {
    expect(MY_MELEGA_ROUTES.liquidity).toBe('/liquidity-studio?view=positions')
    expect(MY_MELEGA_ROUTES.farms).toBe('/farms?view=my')
    expect(MY_MELEGA_ROUTES.pools).toBe('/pools?view=positions')
    expect(MY_MELEGA_ROUTES.liquidityBuilder).toBe('/liquidity-studio?view=building')
    expect(MY_MELEGA_ROUTES.portfolio).toBe('/portfolio')
    expect(existsSync(path.join(ROOT, 'pages/portfolio/index.tsx'))).toBe(true)
  })

  it('exposes All Chains filter set', () => {
    expect(MY_MELEGA_CHAIN_FILTERS.map((c) => c.label)).toEqual([
      'All Chains',
      'BSC',
      'Base',
      'Polygon',
      'Ethereum',
      'Arbitrum',
      'Avalanche',
    ])
  })
})

describe('My Melega positions drawer — snapshot adapter', () => {
  it('zero-position state keeps count rows at 0', () => {
    const snap = buildMyMelegaSnapshot({
      liquidity: [],
      farms: [],
      pools: [],
      claimables: [],
      builderCount: 0,
      chainFilter: 'all',
    })
    expect(snap.counts).toEqual({ liquidity: 0, farms: 0, pools: 0, builder: 0 })
    expect(snap.previews).toEqual([])
    expect(snap.claimables).toEqual([])
  })

  it('renders farm / liquidity / pool previews with factual metrics and claim priority', () => {
    const snap = buildMyMelegaSnapshot({
      liquidity: [liq({ id: 'lp1' })],
      farms: [
        farm({
          positionId: 'fa',
          chainId: 56,
          pendingValue: '$20.00',
          pendingFormatted: '5',
          stakedValue: '$908.04',
          sortPendingUsd: 20,
        }),
        farm({
          positionId: 'fb',
          chainId: 8453,
          stakedValue: '$50.00',
          title: 'ETH / MARCO',
        }),
      ],
      pools: [pool({ positionId: 'po', chainId: 56 })],
      claimables: [
        {
          id: 'c1',
          group: 'Farms',
          source: 'USDT / MARCO',
          token: 'MARCO',
          amount: '5',
          estimatedUsd: '$20.00',
          actionLabel: 'Harvest',
          actionHref: '/farms?view=my',
          contractHref: null,
        } satisfies PortfolioClaimableRow,
      ],
      builderCount: 2,
      chainFilter: 'all',
    })
    expect(snap.counts).toEqual({ liquidity: 1, farms: 2, pools: 1, builder: 2 })
    expect(snap.previews[0].domain).toBe('farms')
    expect(snap.previews[0].hasClaimable).toBe(true)
    expect(snap.previews.some((p) => p.domain === 'liquidity')).toBe(true)
    expect(snap.previews.some((p) => p.domain === 'pools' && p.aprDisplay === '12.4%')).toBe(true)
    expect(snap.claimableFarmCount).toBe(1)
    expect(snap.claimableAggregateUsd).toBe(20)
    expect(snap.previews.length).toBeLessThanOrEqual(4)
  })

  it('scopes counts to selected chain filter', () => {
    const snap = buildMyMelegaSnapshot({
      liquidity: [liq({ id: 'lp1', chainLabel: 'BNB' }), liq({ id: 'lp2', chainLabel: 'Base' })],
      farms: [farm({ positionId: 'fa', chainId: 56 }), farm({ positionId: 'fb', chainId: 8453 })],
      pools: [pool({ positionId: 'po', chainId: 56 })],
      claimables: [],
      builderCount: 1,
      chainFilter: 56,
    })
    expect(snap.counts.farms).toBe(1)
    expect(snap.counts.pools).toBe(1)
    expect(snap.counts.liquidity).toBe(1)
  })

  it('never surfaces Unavailable copy for missing metrics', () => {
    const snap = buildMyMelegaSnapshot({
      liquidity: [liq({ id: 'lp1', estimatedValue: 'Unavailable' })],
      farms: [farm({ positionId: 'fa', chainId: 56, stakedValue: null, apr: null })],
      pools: [],
      claimables: [],
      builderCount: 0,
      chainFilter: 'all',
    })
    expect(snap.previews.every((p) => !/Unavailable/i.test(p.valueDisplay))).toBe(true)
    expect(snap.previews.every((p) => !/Unavailable/i.test(p.aprDisplay))).toBe(true)
  })
})
