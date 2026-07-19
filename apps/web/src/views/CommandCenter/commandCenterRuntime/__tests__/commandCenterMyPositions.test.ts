import { describe, expect, it } from 'vitest'
import BigNumber from 'bignumber.js'
import {
  PORTFOLIO_POSITION_SCHEMA,
  WALLET_PORTFOLIO_SCHEMA,
  createEmptyWalletPortfolio,
  createNonePortfolioAction,
  type PortfolioPosition,
  type PortfolioPositionAction,
  type WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
import {
  buildCommandCenterWalletPortfolio,
  buildMyPositionsExperience,
  projectMyPositionCard,
} from '../commandCenterPortfolioCutover'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'

const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'

function action(
  type: PortfolioPositionAction['type'],
  label: string,
  enabled = true,
): PortfolioPositionAction {
  return {
    type,
    label,
    priority: 1,
    route: `/${label.toLowerCase()}`,
    enabled,
    reasonDisabled: enabled ? null : 'disabled',
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

describe('R791D.3E Command Center My Positions foundation', () => {
  it('TEST 1 — Liquidity/Farm/Pool populate three groups', () => {
    const manage = action('MANAGE', 'Manage')
    const harvest = action('HARVEST', 'Harvest')
    const remove = action('REMOVE_LIQUIDITY', 'Remove')
    const claim = action('CLAIM', 'Claim')

    const empty = createEmptyWalletPortfolio({
      wallet: WALLET,
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    const portfolio: WalletPortfolio = {
      ...empty,
      positions: [
        stubPosition({
          positionId: 'liq-1',
          positionType: 'LIQUIDITY',
          title: 'MM72 / MARCO',
          actions: { primary: manage, secondary: [remove], open: null, manage, analytics: null },
          recommendedAction: manage,
        }),
        stubPosition({
          positionId: 'farm-1',
          positionType: 'FARM',
          title: 'MM72 Farm',
          claimableValueUsd: '1.2',
          actions: { primary: harvest, secondary: [manage], open: null, manage, analytics: null },
          recommendedAction: harvest,
        }),
        stubPosition({
          positionId: 'pool-1',
          positionType: 'POOL',
          title: 'MARCO Staking',
          actions: { primary: manage, secondary: [claim], open: null, manage, analytics: null },
          recommendedAction: manage,
        }),
      ],
    }

    const xp = buildMyPositionsExperience({ portfolio, walletConnected: true })
    expect(xp.state).toBe('READY')
    expect(xp.myPositionsView.view).toBe('MY_POSITIONS')
    expect(xp.myPositionsGroups.Liquidity).toHaveLength(1)
    expect(xp.myPositionsGroups.Farm).toHaveLength(1)
    expect(xp.myPositionsGroups.Pool).toHaveLength(1)
    expect(xp.myPositionsSummary.totalPositions).toBe(3)
    expect(xp.myPositionsSummary.liquidityCount).toBe(1)
    expect(xp.myPositionsSummary.farmCount).toBe(1)
    expect(xp.myPositionsSummary.poolCount).toBe(1)
  })

  it('TEST 2 — Only owned positions appear', () => {
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

    const xp = buildMyPositionsExperience({ portfolio, walletConnected: true })
    expect(xp.myPositionsView.positions.map((p) => p.positionId)).toEqual(['owned'])
    const allIds = [
      ...xp.myPositionsGroups.Liquidity,
      ...xp.myPositionsGroups.Farm,
      ...xp.myPositionsGroups.Pool,
      ...xp.myPositionsGroups.Other,
    ].map((c) => c.positionId)
    expect(allIds).toEqual(['owned'])
  })

  it('TEST 3 — Claimable position exposes Claim/Harvest action', () => {
    const harvest = action('HARVEST', 'Harvest')
    const manage = action('MANAGE', 'Manage')
    const position = stubPosition({
      positionId: 'farm-claim',
      positionType: 'FARM',
      title: 'Claimable Farm',
      claimableValueUsd: '9.5',
      recommendedAction: harvest,
      actions: { primary: harvest, secondary: [manage], open: null, manage, analytics: null },
    })

    const card = projectMyPositionCard(position)
    expect(['CLAIM', 'HARVEST']).toContain(card.primaryAction.type)
    expect(card.primaryAction.enabled).toBe(true)
  })

  it('TEST 4 — Liquidity position exposes Remove/Manage action', () => {
    const manage = action('MANAGE', 'Manage')
    const remove = action('REMOVE_LIQUIDITY', 'Remove')
    const position = stubPosition({
      positionId: 'liq-manage',
      positionType: 'LIQUIDITY',
      title: 'LP',
      recommendedAction: manage,
      actions: { primary: manage, secondary: [remove], open: null, manage, analytics: null },
    })

    const card = projectMyPositionCard(position)
    const types = [card.primaryAction.type, ...card.secondaryActions.map((a) => a.type)]
    expect(types.some((t) => t === 'MANAGE' || t === 'REMOVE_LIQUIDITY')).toBe(true)
    expect(['MANAGE', 'REMOVE_LIQUIDITY']).toContain(card.primaryAction.type)
  })

  it('TEST 5 — Empty wallet: honest EMPTY state', () => {
    const portfolio = buildCommandCenterWalletPortfolio({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      generatedAt: '2026-07-18T00:00:00.000Z',
      liquidityRows: [],
      farmCards: [],
      poolCards: [],
      sectionStatus: readySections,
      summary: emptySummary,
    })

    const xp = buildMyPositionsExperience({ portfolio, walletConnected: true })
    expect(xp.state).toBe('EMPTY')
    expect(xp.myPositionsSummary.totalPositions).toBe(0)
    expect(xp.myPositionsGroups.Liquidity).toEqual([])
    expect(xp.myPositionsGroups.Farm).toEqual([])
    expect(xp.myPositionsGroups.Pool).toEqual([])
  })

  it('TEST 6 — Disconnected wallet: WALLET_NOT_CONNECTED', () => {
    const portfolio = createEmptyWalletPortfolio({
      wallet: null,
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    const xp = buildMyPositionsExperience({ portfolio, walletConnected: false })
    expect(xp.state).toBe('WALLET_NOT_CONNECTED')
    expect(xp.myPositionsSummary.totalPositions).toBe(0)
  })

  it('TEST 7 — No product root arrays created', () => {
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

    const xp = buildMyPositionsExperience({ portfolio, walletConnected: true })
    const root = portfolio as unknown as Record<string, unknown>
    expect(portfolio.schema).toBe(WALLET_PORTFOLIO_SCHEMA)
    expect('liquidityPositions' in root).toBe(false)
    expect('farmPositions' in root).toBe(false)
    expect('poolPositions' in root).toBe(false)
    expect('liquidityPositions' in (xp as unknown as Record<string, unknown>)).toBe(false)
    expect(xp.myPositionsGroups.Farm.length + xp.myPositionsGroups.Pool.length).toBeGreaterThan(0)
  })

  it('TEST 8 — Future position type does not break grouping', () => {
    const manage = action('MANAGE', 'Manage')
    const empty = createEmptyWalletPortfolio({
      wallet: WALLET,
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    const portfolio: WalletPortfolio = {
      ...empty,
      positions: [
        stubPosition({
          positionId: 'vault-1',
          positionType: 'VAULT',
          title: 'Future Vault',
          recommendedAction: manage,
          actions: { primary: manage, secondary: [], open: null, manage, analytics: null },
        }),
        stubPosition({
          positionId: 'ai-1',
          positionType: 'AI_POSITION',
          title: 'AI Slot',
          recommendedAction: manage,
          actions: { primary: manage, secondary: [], open: null, manage, analytics: null },
        }),
      ],
    }

    const xp = buildMyPositionsExperience({ portfolio, walletConnected: true })
    expect(xp.state).toBe('READY')
    expect(xp.myPositionsGroups.Other.map((c) => c.positionId)).toEqual(['vault-1', 'ai-1'])
    expect(xp.myPositionsGroups.Liquidity).toEqual([])
    expect(xp.myPositionsSummary.totalPositions).toBe(2)
  })
})
