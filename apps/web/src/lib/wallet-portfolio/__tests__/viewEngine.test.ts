import { describe, expect, it } from 'vitest'
import {
  PORTFOLIO_POSITION_SCHEMA,
  createEmptyWalletPortfolio,
  createNonePortfolioAction,
  type PortfolioPosition,
  type PortfolioPositionAction,
  type WalletPortfolio,
} from '../contracts'
import {
  PORTFOLIO_VIEW_TYPES,
  resolvePortfolioView,
  type PortfolioViewType,
} from '../viewEngine'

function claimAction(overrides: Partial<PortfolioPositionAction> = {}): PortfolioPositionAction {
  return {
    type: 'CLAIM',
    label: 'Claim',
    priority: 1,
    route: null,
    enabled: true,
    reasonDisabled: null,
    ...overrides,
  }
}

function stubPosition(
  overrides: Partial<PortfolioPosition> & Pick<PortfolioPosition, 'positionId' | 'positionType' | 'title'>,
): PortfolioPosition {
  const none = createNonePortfolioAction()
  return {
    schema: PORTFOLIO_POSITION_SCHEMA,
    wallet: '0xabc',
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

function portfolioWith(positions: PortfolioPosition[]): WalletPortfolio {
  const empty = createEmptyWalletPortfolio({
    wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
    generatedAt: '2026-07-18T12:00:00.000Z',
  })
  return {
    ...empty,
    positions,
    summary: {
      ...empty.summary,
      activePositionCount: positions.filter((p) => p.status === 'ACTIVE').length,
      historicalPositionCount: positions.filter((p) => p.status === 'ENDED').length,
      attentionPositionCount: positions.filter((p) => p.requiresAttention).length,
    },
  }
}

const fixturePositions: PortfolioPosition[] = [
  stubPosition({
    positionId: 'liq-1',
    positionType: 'LIQUIDITY',
    title: 'MM72 / MARCO',
    ownershipVerified: true,
    status: 'ACTIVE',
  }),
  stubPosition({
    positionId: 'farm-1',
    positionType: 'FARM',
    title: 'MM72 Farm',
    ownershipVerified: true,
    status: 'ACTIVE',
    claimableValueUsd: '12.5',
    requiresAttention: true,
    recommendedAction: claimAction({ type: 'HARVEST', label: 'Harvest' }),
    actions: {
      primary: claimAction({ type: 'HARVEST', label: 'Harvest' }),
      secondary: [],
      open: null,
      manage: null,
      analytics: null,
    },
  }),
  stubPosition({
    positionId: 'pool-1',
    positionType: 'POOL',
    title: 'MARCO Staking',
    ownershipVerified: false,
    status: 'ENDED',
  }),
  stubPosition({
    positionId: 'farm-2',
    positionType: 'FARM',
    title: 'Ended Farm',
    ownershipVerified: true,
    status: 'ENDED',
    claimableValueUsd: '0',
  }),
]

describe('R791D.3C portfolio view engine', () => {
  it('TEST 1 — ALL returns all positions', () => {
    const portfolio = portfolioWith(fixturePositions)
    const result = resolvePortfolioView(portfolio, 'ALL')
    expect(result.view).toBe('ALL')
    expect(result.positions).toHaveLength(4)
    expect(result.positions.map((p) => p.positionId)).toEqual([
      'liq-1',
      'farm-1',
      'pool-1',
      'farm-2',
    ])
    expect(result.count).toBe(4)
    expect(result.empty).toBe(false)
    expect(result.positions).toBeDefined()
  })

  it('TEST 2 — MY_POSITIONS filters ownershipVerified', () => {
    const result = resolvePortfolioView(portfolioWith(fixturePositions), 'MY_POSITIONS')
    expect(result.positions.every((p) => p.ownershipVerified === true)).toBe(true)
    expect(result.positions.map((p) => p.positionId)).toEqual(['liq-1', 'farm-1', 'farm-2'])
    expect(result.count).toBe(3)
  })

  it('TEST 3 — ACTIVE filters lifecycle', () => {
    const result = resolvePortfolioView(portfolioWith(fixturePositions), 'ACTIVE')
    expect(result.positions.every((p) => p.status === 'ACTIVE')).toBe(true)
    expect(result.positions.map((p) => p.positionId)).toEqual(['liq-1', 'farm-1'])
  })

  it('TEST 4 — HISTORICAL filters ENDED', () => {
    const result = resolvePortfolioView(portfolioWith(fixturePositions), 'HISTORICAL')
    expect(result.positions.every((p) => p.status === 'ENDED')).toBe(true)
    expect(result.positions.map((p) => p.positionId)).toEqual(['pool-1', 'farm-2'])
  })

  it('TEST 5 — CLAIMABLE returns claimable positions', () => {
    const result = resolvePortfolioView(portfolioWith(fixturePositions), 'CLAIMABLE')
    expect(result.positions.map((p) => p.positionId)).toEqual(['farm-1'])
    expect(result.count).toBe(1)

    const byAction = resolvePortfolioView(
      portfolioWith([
        stubPosition({
          positionId: 'claim-action',
          positionType: 'FARM',
          title: 'Action claimable',
          claimableValueUsd: null,
          actions: {
            primary: claimAction(),
            secondary: [],
            open: null,
            manage: null,
            analytics: null,
          },
        }),
      ]),
      'CLAIMABLE',
    )
    expect(byAction.positions.map((p) => p.positionId)).toEqual(['claim-action'])
  })

  it('TEST 6 — NEEDS_ATTENTION returns attention positions', () => {
    const result = resolvePortfolioView(portfolioWith(fixturePositions), 'NEEDS_ATTENTION')
    expect(result.positions.every((p) => p.requiresAttention === true)).toBe(true)
    expect(result.positions.map((p) => p.positionId)).toEqual(['farm-1'])
  })

  it('TEST 7 — LIQUIDITY returns liquidity only', () => {
    const result = resolvePortfolioView(portfolioWith(fixturePositions), 'LIQUIDITY')
    expect(result.positions.every((p) => p.positionType === 'LIQUIDITY')).toBe(true)
    expect(result.positions.map((p) => p.positionId)).toEqual(['liq-1'])
  })

  it('TEST 8 — FARM returns farms only', () => {
    const result = resolvePortfolioView(portfolioWith(fixturePositions), 'FARM')
    expect(result.positions.every((p) => p.positionType === 'FARM')).toBe(true)
    expect(result.positions.map((p) => p.positionId)).toEqual(['farm-1', 'farm-2'])
  })

  it('TEST 9 — POOL returns pools only', () => {
    const result = resolvePortfolioView(portfolioWith(fixturePositions), 'POOL')
    expect(result.positions.every((p) => p.positionType === 'POOL')).toBe(true)
    expect(result.positions.map((p) => p.positionId)).toEqual(['pool-1'])
  })

  it('TEST 10 — Empty portfolio', () => {
    const portfolio = portfolioWith([])
    for (const view of PORTFOLIO_VIEW_TYPES) {
      const result = resolvePortfolioView(portfolio, view)
      expect(result.positions).toEqual([])
      expect(result.count).toBe(0)
      expect(result.empty).toBe(true)
      expect(result.summary.positionCount).toBe(0)
      expect(Array.isArray(result.positions)).toBe(true)
    }
  })

  it('TEST 11 — No mutation', () => {
    const positions = [...fixturePositions]
    const portfolio = portfolioWith(positions)
    const before = JSON.stringify(portfolio)
    const beforeIds = portfolio.positions.map((p) => p.positionId)

    resolvePortfolioView(portfolio, 'MY_POSITIONS')
    resolvePortfolioView(portfolio, 'FARM')
    resolvePortfolioView(portfolio, 'CLAIMABLE')

    expect(JSON.stringify(portfolio)).toBe(before)
    expect(portfolio.positions.map((p) => p.positionId)).toEqual(beforeIds)
    expect(portfolio.positions).toBe(positions)
  })

  it('TEST 12 — Future position types do not break engine', () => {
    const futureTypes = [
      'VAULT',
      'LENDING',
      'BORROW',
      'STRATEGY',
      'SMARTDROP',
      'AI_POSITION',
    ] as const

    const positions = futureTypes.map((positionType, i) =>
      stubPosition({
        positionId: `future-${positionType}`,
        positionType,
        title: `Future ${positionType}`,
        ownershipVerified: true,
        status: 'ACTIVE',
        requiresAttention: i === 0,
      }),
    )
    const portfolio = portfolioWith(positions)

    const all = resolvePortfolioView(portfolio, 'ALL')
    expect(all.count).toBe(futureTypes.length)
    expect(all.positions.map((p) => p.positionType)).toEqual([...futureTypes])

    const mine = resolvePortfolioView(portfolio, 'MY_POSITIONS')
    expect(mine.count).toBe(futureTypes.length)

    const active = resolvePortfolioView(portfolio, 'ACTIVE')
    expect(active.count).toBe(futureTypes.length)

    // Type-specific product views must not throw and must exclude futures
    const productViews: PortfolioViewType[] = ['LIQUIDITY', 'FARM', 'POOL']
    for (const view of productViews) {
      const result = resolvePortfolioView(portfolio, view)
      expect(result.positions).toEqual([])
      expect(result.empty).toBe(true)
    }

    const attention = resolvePortfolioView(portfolio, 'NEEDS_ATTENTION')
    expect(attention.positions.map((p) => p.positionId)).toEqual(['future-VAULT'])
  })

  it('preserves Portfolio Service ordering (filter only)', () => {
    const ordered = [
      stubPosition({ positionId: 'z-last-title', positionType: 'POOL', title: 'Zulu', importance: 'CRITICAL' }),
      stubPosition({ positionId: 'a-first-title', positionType: 'LIQUIDITY', title: 'Alpha', importance: 'LOW' }),
      stubPosition({ positionId: 'm-mid', positionType: 'FARM', title: 'Mid', importance: 'NORMAL' }),
    ]
    const result = resolvePortfolioView(portfolioWith(ordered), 'ALL')
    expect(result.positions.map((p) => p.positionId)).toEqual([
      'z-last-title',
      'a-first-title',
      'm-mid',
    ])
  })
})
