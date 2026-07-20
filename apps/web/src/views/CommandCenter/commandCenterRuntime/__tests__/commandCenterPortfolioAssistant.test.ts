/**
 * R791D.5A — Command Center AI Portfolio Assistant foundation.
 */

import { describe, expect, it } from 'vitest'
import {
  PORTFOLIO_POSITION_SCHEMA,
  WALLET_PORTFOLIO_SCHEMA,
  createEmptyWalletPortfolio,
  createNonePortfolioAction,
  type PortfolioPosition,
  type PortfolioPositionAction,
  type WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
import { PORTFOLIO_VIEW_TYPES } from 'lib/wallet-portfolio/viewEngine'
import { buildPortfolioIntelligence } from '../portfolioIntelligence'
import {
  buildPortfolioAssistantContext,
  containsForbiddenAdviceLanguage,
  PORTFOLIO_ASSISTANT_ACTION_TYPES,
} from '../portfolioAssistantContext'

function action(
  type: PortfolioPositionAction['type'],
  label: string,
  overrides: Partial<PortfolioPositionAction> = {},
): PortfolioPositionAction {
  return {
    type,
    label,
    priority: overrides.priority ?? 1,
    route: overrides.route ?? `/${label.toLowerCase()}`,
    enabled: overrides.enabled ?? true,
    reasonDisabled: overrides.enabled === false ? 'disabled' : null,
    ...overrides,
  }
}

function stubPosition(
  overrides: Partial<PortfolioPosition> & Pick<PortfolioPosition, 'positionId' | 'positionType' | 'title'>,
): PortfolioPosition {
  const manage = action('MANAGE', 'Manage')
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
    recommendedAction: manage,
    riskLevel: null,
    health: null,
    priority: 0,
    reason: null,
    actions: { primary: manage, secondary: [], open: null, manage, analytics: null },
    productRoute: '/x',
    openRoute: '/x/open',
    manageRoute: '/x/manage',
    analyticsRoute: null,
    producer: 'test',
    observedAt: null,
    blockNumber: null,
    confidence: null,
    dataState: 'PARTIAL',
    ...overrides,
  }
}

function buildPortfolio(
  positions: PortfolioPosition[],
  extras: Partial<WalletPortfolio> = {},
): WalletPortfolio {
  const empty = createEmptyWalletPortfolio({
    wallet: '0xabc',
    generatedAt: '2026-07-20T00:00:00.000Z',
  })
  return {
    ...empty,
    schema: WALLET_PORTFOLIO_SCHEMA,
    positions,
    ...extras,
    sectionStatus: {
      ...empty.sectionStatus,
      ...(extras.sectionStatus ?? {}),
    },
  }
}

function buildContext(portfolio: WalletPortfolio, walletConnected = true) {
  const intelligence = buildPortfolioIntelligence({ portfolio, walletConnected })
  return buildPortfolioAssistantContext({ portfolio, intelligence, walletConnected })
}

describe('R791D.5A commandCenterPortfolioAssistant', () => {
  it('TEST 1: Connected wallet creates context', () => {
    const portfolio = buildPortfolio([
      stubPosition({ positionId: 'p1', positionType: 'LIQUIDITY', title: 'LP A' }),
    ])
    const ctx = buildContext(portfolio, true)

    expect(ctx.identity.connected).toBe(true)
    expect(ctx.identity.wallet).toBe('0xabc')
    expect(ctx.identity.chain).toEqual({ chainId: 56, name: 'BNB Chain' })
    expect(ctx.state).toBe('READY')
    expect(ctx.positions).toHaveLength(1)
    expect(ctx.availableViews).toEqual([...PORTFOLIO_VIEW_TYPES])
  })

  it('TEST 2: Disconnected wallet', () => {
    const portfolio = buildPortfolio([
      stubPosition({ positionId: 'p1', positionType: 'FARM', title: 'Farm A' }),
    ])
    const ctx = buildContext(portfolio, false)

    expect(ctx.state).toBe('DISCONNECTED')
    expect(ctx.identity.connected).toBe(false)
    expect(ctx.identity.wallet).toBeNull()
    expect(ctx.identity.chain).toBeNull()
    expect(ctx.positions).toEqual([])
    expect(ctx.actions).toEqual([])
    expect(ctx.summary.lines).toContain('Connect a wallet to load portfolio context.')
  })

  it('TEST 3: Empty portfolio', () => {
    const portfolio = buildPortfolio([])
    const ctx = buildContext(portfolio, true)

    expect(ctx.state).toBe('EMPTY')
    expect(ctx.positions).toEqual([])
    expect(ctx.summary.lines).toContain('Your portfolio has no positions.')
  })

  it('TEST 4: Position summary', () => {
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'p1',
        positionType: 'LIQUIDITY',
        title: 'LP A',
        status: 'ACTIVE',
        currentValueUsd: '100.5',
        claimableValueUsd: null,
        dataState: 'READY',
        actions: {
          primary: action('REMOVE_LIQUIDITY', 'Remove'),
          secondary: [],
          open: null,
          manage: action('MANAGE', 'Manage'),
          analytics: null,
        },
        recommendedAction: action('REMOVE_LIQUIDITY', 'Remove'),
      }),
      stubPosition({
        positionId: 'p2',
        positionType: 'POOL',
        title: 'Pool B',
        status: 'ACTIVE',
        dataState: 'READY',
      }),
      stubPosition({
        positionId: 'p3',
        positionType: 'FARM',
        title: 'Farm C',
        status: 'ACTIVE',
        dataState: 'READY',
      }),
    ])
    const ctx = buildContext(portfolio, true)

    expect(ctx.summary.activePositions).toBe(3)
    expect(ctx.summary.lines).toContain('You have 3 active positions.')
    expect(ctx.positions[0]).toMatchObject({
      title: 'LP A',
      type: 'LIQUIDITY',
      status: 'ACTIVE',
      value: '100.5',
      route: '/x/manage',
    })
    expect(ctx.positions[0]).not.toHaveProperty('underlyingAssets')
    expect(ctx.positions[0]).not.toHaveProperty('blockNumber')
    expect(ctx.positions[0]).not.toHaveProperty('producer')
  })

  it('TEST 5: Action summary', () => {
    const claim = action('CLAIM', 'Claim', { route: '/farms/claim', priority: 1 })
    const harvest = action('HARVEST', 'Harvest', { route: '/farms/harvest', priority: 2 })
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'farm-1',
        positionType: 'FARM',
        title: 'MEGA Farm',
        dataState: 'READY',
        recommendedAction: claim,
        actions: {
          primary: claim,
          secondary: [harvest],
          open: null,
          manage: action('MANAGE', 'Manage'),
          analytics: null,
        },
      }),
    ])
    const ctx = buildContext(portfolio, true)

    expect(ctx.actions.length).toBeGreaterThanOrEqual(1)
    for (const a of ctx.actions) {
      expect(PORTFOLIO_ASSISTANT_ACTION_TYPES).toContain(a.type)
      expect(a).toMatchObject({
        label: expect.any(String),
        position: 'MEGA Farm',
        enabled: true,
      })
      expect(a.route).toBeTruthy()
    }
    expect(ctx.summary.lines.some((l) => /operational action/.test(l))).toBe(true)
  })

  it('TEST 6: Attention summary', () => {
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'attn-1',
        positionType: 'LIQUIDITY',
        title: 'Needs fix',
        requiresAttention: true,
        reason: 'Approval required',
        dataState: 'READY',
      }),
      stubPosition({
        positionId: 'attn-2',
        positionType: 'POOL',
        title: 'Also attention',
        requiresAttention: true,
        reason: 'Stale data',
        dataState: 'READY',
      }),
    ])
    const ctx = buildContext(portfolio, true)

    expect(ctx.summary.attentionCount).toBe(2)
    expect(ctx.attention).toHaveLength(2)
    expect(ctx.summary.lines).toContain('2 positions require attention.')
  })

  it('TEST 7: Claimable summary', () => {
    const claim = action('CLAIM', 'Claim rewards', { route: '/farms/1' })
    const portfolio = buildPortfolio(
      [
        stubPosition({
          positionId: 'farm-claim',
          positionType: 'FARM',
          title: 'Reward Farm',
          dataState: 'READY',
          claimableValueUsd: '12.3',
          recommendedAction: claim,
          actions: {
            primary: claim,
            secondary: [],
            open: null,
            manage: action('MANAGE', 'Manage'),
            analytics: null,
          },
        }),
      ],
      {
        claimables: [
          {
            id: 'c1',
            positionId: 'farm-claim',
            sourceType: 'FARM',
            title: 'Farm rewards',
            amount: '1.5',
            valueUsd: '12.3',
            action: claim,
          },
        ],
      },
    )
    const ctx = buildContext(portfolio, true)

    expect(ctx.claimables).toHaveLength(1)
    expect(ctx.claimables[0]).toMatchObject({
      title: 'Farm rewards',
      amount: '1.5',
      value: '12.3',
      sourceType: 'FARM',
      enabled: true,
    })
    expect(ctx.summary.farmClaimableCount).toBe(1)
    expect(ctx.summary.lines).toContain('1 farm has claimable rewards.')
  })

  it('TEST 8: No financial advice language', () => {
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'p1',
        positionType: 'FARM',
        title: 'Farm',
        dataState: 'READY',
        requiresAttention: true,
        recommendedAction: action('HARVEST', 'Harvest'),
        actions: {
          primary: action('HARVEST', 'Harvest'),
          secondary: [],
          open: null,
          manage: action('MANAGE', 'Manage'),
          analytics: null,
        },
      }),
    ])
    const ctx = buildContext(portfolio, true)
    const blob = JSON.stringify(ctx)

    expect(containsForbiddenAdviceLanguage(blob)).toBe(false)
    for (const line of ctx.summary.lines) {
      expect(containsForbiddenAdviceLanguage(line)).toBe(false)
    }
    expect(blob.toLowerCase()).not.toMatch(/good investment|best opportunity|should buy|should sell|maximize yield/)
  })

  it('TEST 9: No invented data', () => {
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'p1',
        positionType: 'LIQUIDITY',
        title: 'LP Unknown',
        currentValueUsd: null,
        claimableValueUsd: null,
        pendingRewardsValueUsd: null,
        dataState: 'READY',
      }),
    ])
    const ctx = buildContext(portfolio, true)

    expect(ctx.positions[0].value).toBeNull()
    expect(ctx.positions[0].claimable).toBeNull()
    expect(ctx.summary.lines.join(' ')).not.toMatch(/\$0|0\.00 USD|net worth/)
    // Does not invent wallet when missing
    const noWallet = buildPortfolio([], { wallet: null })
    const emptyCtx = buildContext(noWallet, true)
    expect(emptyCtx.identity.wallet).toBeNull()
  })

  it('TEST 10: Future position type compatibility', () => {
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'vault-1',
        positionType: 'VAULT',
        title: 'Future Vault',
        dataState: 'READY',
      }),
      stubPosition({
        positionId: 'perp-1',
        positionType: 'PERPETUAL',
        title: 'Future Perp',
        dataState: 'READY',
        status: 'ACTIVE',
      }),
      stubPosition({
        positionId: 'ai-1',
        positionType: 'AI_POSITION',
        title: 'Future AI',
        dataState: 'READY',
      }),
    ])
    const ctx = buildContext(portfolio, true)

    expect(ctx.positions.map((p) => p.type)).toEqual(['VAULT', 'PERPETUAL', 'AI_POSITION'])
    expect(ctx.summary.activePositions).toBe(3)
    expect(ctx.availableViews).toEqual([
      'ALL',
      'MY_POSITIONS',
      'ACTIVE',
      'HISTORICAL',
      'CLAIMABLE',
      'NEEDS_ATTENTION',
      'LIQUIDITY',
      'FARM',
      'POOL',
    ])
    // MANAGE is not an assistant action type — must not invent CLAIM etc.
    expect(ctx.actions.every((a) => PORTFOLIO_ASSISTANT_ACTION_TYPES.includes(a.type))).toBe(true)
    expect(createNonePortfolioAction().type).toBe('NONE')
  })
})
