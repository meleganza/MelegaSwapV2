import { describe, expect, it, vi } from 'vitest'
import BigNumber from 'bignumber.js'
import {
  PORTFOLIO_POSITION_SCHEMA,
  WALLET_PORTFOLIO_SCHEMA,
  createEmptyWalletPortfolio,
  createNonePortfolioAction,
  type PortfolioPosition,
  type WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
import type { PortfolioViewResult, PortfolioViewType } from 'lib/wallet-portfolio/viewEngine'
import {
  buildCommandCenterWalletPortfolio,
  resolveCommandCenterPortfolioViews,
  projectFarmView,
  projectLiquidityView,
  projectPoolView,
  COMMAND_CENTER_VIEW_TYPES,
} from '../commandCenterPortfolioCutover'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'

const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'

function stubFarm(overrides: Partial<FarmPreviewCard> = {}): FarmPreviewCard {
  return {
    id: 'farm-72',
    pair: 'MM72 Farm',
    tokens: ['MM72', 'MARCO'],
    status: 'live',
    tvl: '—',
    dailyRewards: '—',
    multiplier: '1X',
    liquidity: '—',
    pid: 72,
    userStaked: new BigNumber('1000000000000000000'),
    pendingReward: new BigNumber('500000000000000000'),
    rewardToken: 'MARCO',
    ...overrides,
  }
}

function stubPool(overrides: Partial<PoolPreviewCard> = {}): PoolPreviewCard {
  return {
    id: 'pool-0',
    name: 'MARCO Staking',
    tokens: ['MARCO'],
    status: 'live',
    tvl: '—',
    rewardToken: 'MARCO',
    dailyRewards: '—',
    participants: '—',
    sousId: 0,
    contractAddress: '0xdddddddddddddddddddddddddddddddddddddddd',
    userStaked: new BigNumber('1000000000000000000000'),
    pendingReward: new BigNumber('0'),
    ...overrides,
  }
}

function stubPosition(
  overrides: Partial<PortfolioPosition> & Pick<PortfolioPosition, 'positionId' | 'positionType' | 'title'>,
): PortfolioPosition {
  const none = createNonePortfolioAction()
  return {
    schema: PORTFOLIO_POSITION_SCHEMA,
    wallet: WALLET,
    protocol: 'melega-v2',
    chain: { chainId: 56, name: 'BNB Chain' },
    contract: null,
    source: 'test',
    subtitle: null,
    icon: null,
    badges: [],
    tags: [],
    importance: 'NORMAL',
    requiresAttention: false,
    underlyingAssets: [],
    lpToken: null,
    stakeToken: null,
    rewardTokens: [],
    currentValueUsd: null,
    principalValueUsd: null,
    claimableValueUsd: null,
    pendingRewardsValueUsd: null,
    apr: null,
    apy: null,
    feesEarnedUsd: null,
    balance: null,
    poolShare: null,
    ownershipVerified: true,
    unlockState: 'unknown',
    approvals: [],
    status: 'ACTIVE',
    startedAt: null,
    endsAt: null,
    updatedAt: null,
    recommendedAction: none,
    riskLevel: null,
    health: null,
    priority: 0,
    reason: null,
    actions: { primary: none, secondary: [], open: null, manage: null, analytics: null },
    productRoute: null,
    openRoute: null,
    manageRoute: null,
    analyticsRoute: null,
    producer: 'test',
    observedAt: null,
    blockNumber: null,
    confidence: null,
    dataState: 'PARTIAL',
    ...overrides,
  }
}

const readySections = {
  summary: { status: 'READY' as const, updatedAt: null, errorCode: null, message: null },
  positions: { status: 'READY' as const, updatedAt: null, errorCode: null, message: null },
  claimables: { status: 'EMPTY' as const, updatedAt: null, errorCode: null, message: null },
  approvals: { status: 'EMPTY' as const, updatedAt: null, errorCode: null, message: null },
  activity: { status: 'EMPTY' as const, updatedAt: null, errorCode: null, message: null },
}

const emptySummary = {
  netValueUsd: null,
  claimableValueUsd: null,
  activePositionCount: 0,
  historicalPositionCount: 0,
  attentionPositionCount: 0,
  pendingActionCount: 0,
}

describe('R791D.3D Command Center View Engine cutover', () => {
  it('TEST 1 — Command Center receives views from View Engine for Liquidity/Farm/Pool', () => {
    const portfolio = buildCommandCenterWalletPortfolio({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      generatedAt: '2026-07-18T00:00:00.000Z',
      liquidityRows: [],
      farmCards: [stubFarm()],
      poolCards: [stubPool()],
      sectionStatus: readySections,
      summary: emptySummary,
    })

    const views = resolveCommandCenterPortfolioViews(portfolio)

    expect(portfolio.schema).toBe(WALLET_PORTFOLIO_SCHEMA)
    expect(views.FARM.count).toBe(1)
    expect(views.POOL.count).toBe(1)
    expect(views.LIQUIDITY.count).toBe(0)
    expect(views.FARM.positions[0]?.title).toBe('MM72 Farm')
    expect(views.POOL.positions[0]?.title).toBe('MARCO Staking')

    // Legacy projections consume View Engine positions only
    expect(projectFarmView(views.FARM.positions)).toHaveLength(1)
    expect(projectPoolView(views.POOL.positions)).toHaveLength(1)
    expect(projectLiquidityView(views.LIQUIDITY.positions)).toHaveLength(0)
  })

  it('TEST 2 — MY_POSITIONS returns only owned positions', () => {
    const empty = createEmptyWalletPortfolio({
      wallet: WALLET,
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    const portfolio: WalletPortfolio = {
      ...empty,
      positions: [
        stubPosition({
          positionId: 'owned',
          positionType: 'FARM',
          title: 'Owned',
          ownershipVerified: true,
        }),
        stubPosition({
          positionId: 'unowned',
          positionType: 'POOL',
          title: 'Unowned',
          ownershipVerified: false,
        }),
      ],
    }

    const views = resolveCommandCenterPortfolioViews(portfolio)
    expect(views.MY_POSITIONS.positions.map((p) => p.positionId)).toEqual(['owned'])
    expect(views.MY_POSITIONS.positions.every((p) => p.ownershipVerified === true)).toBe(true)
  })

  it('TEST 3 — HISTORICAL returns ENDED positions only', () => {
    const empty = createEmptyWalletPortfolio({
      wallet: WALLET,
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    const portfolio: WalletPortfolio = {
      ...empty,
      positions: [
        stubPosition({ positionId: 'active', positionType: 'FARM', title: 'Live', status: 'ACTIVE' }),
        stubPosition({ positionId: 'ended', positionType: 'POOL', title: 'Done', status: 'ENDED' }),
      ],
    }

    const views = resolveCommandCenterPortfolioViews(portfolio)
    expect(views.HISTORICAL.positions.map((p) => p.positionId)).toEqual(['ended'])
    expect(views.HISTORICAL.positions.every((p) => p.status === 'ENDED')).toBe(true)
  })

  it('TEST 4 — CLAIMABLE returns claimable positions only', () => {
    const empty = createEmptyWalletPortfolio({
      wallet: WALLET,
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    const portfolio: WalletPortfolio = {
      ...empty,
      positions: [
        stubPosition({
          positionId: 'claimable',
          positionType: 'FARM',
          title: 'Rewards',
          claimableValueUsd: '4.2',
        }),
        stubPosition({
          positionId: 'plain',
          positionType: 'POOL',
          title: 'No rewards',
          claimableValueUsd: null,
        }),
      ],
    }

    const views = resolveCommandCenterPortfolioViews(portfolio)
    expect(views.CLAIMABLE.positions.map((p) => p.positionId)).toEqual(['claimable'])
  })

  it('TEST 5 — No local filtering: runtime consumes mocked View Engine result', () => {
    const empty = createEmptyWalletPortfolio({
      wallet: WALLET,
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    const portfolio: WalletPortfolio = {
      ...empty,
      positions: [
        stubPosition({ positionId: 'real-farm', positionType: 'FARM', title: 'Real Farm' }),
      ],
    }

    const mockResult = (view: PortfolioViewType): PortfolioViewResult => ({
      view,
      positions: [
        stubPosition({
          positionId: `mock-${view}`,
          positionType: 'STRATEGY',
          title: `Mock ${view}`,
        }),
      ],
      count: 1,
      empty: false,
      summary: {
        positionCount: 1,
        ownershipVerifiedCount: 1,
        activeCount: 1,
        historicalCount: 0,
        attentionCount: 0,
        claimableCount: 0,
      },
    })

    const resolveView = vi.fn((_: WalletPortfolio, view: PortfolioViewType) => mockResult(view))
    const views = resolveCommandCenterPortfolioViews(portfolio, resolveView)

    expect(resolveView).toHaveBeenCalledTimes(COMMAND_CENTER_VIEW_TYPES.length)
    for (const view of COMMAND_CENTER_VIEW_TYPES) {
      expect(views[view].positions.map((p) => p.positionId)).toEqual([`mock-${view}`])
      // Must not fall back to local filter over real portfolio positions
      expect(views[view].positions.some((p) => p.positionId === 'real-farm')).toBe(false)
    }
  })

  it('TEST 6 — portfolio does not expose product root arrays', () => {
    const portfolio = buildCommandCenterWalletPortfolio({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      generatedAt: '2026-07-18T00:00:00.000Z',
      liquidityRows: [],
      farmCards: [stubFarm()],
      poolCards: [stubPool()],
      sectionStatus: readySections,
      summary: emptySummary,
    }) as unknown as Record<string, unknown>

    expect('liquidityPositions' in portfolio).toBe(false)
    expect('farmPositions' in portfolio).toBe(false)
    expect('poolPositions' in portfolio).toBe(false)
  })
})
