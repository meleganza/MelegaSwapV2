/**
 * R791D.5C — Command Center Portfolio Action Orchestration foundation.
 */

import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  PORTFOLIO_POSITION_SCHEMA,
  WALLET_PORTFOLIO_SCHEMA,
  createEmptyWalletPortfolio,
  type PortfolioPosition,
  type PortfolioPositionAction,
  type WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
import { buildPortfolioIntelligence } from '../portfolioIntelligence'
import { buildPortfolioAssistantContext } from '../portfolioAssistantContext'
import {
  PORTFOLIO_ACTION_PRIORITY,
  PORTFOLIO_ORCHESTRATION_ACTION_TYPES,
  buildPortfolioActionOrchestration,
  orchestrationContainsExecutionMarkers,
  resolvePortfolioActionGroup,
} from '../portfolioActionOrchestration'

function action(
  type: PortfolioPositionAction['type'],
  label: string,
  overrides: Partial<PortfolioPositionAction> = {},
): PortfolioPositionAction {
  return {
    type,
    label,
    priority: overrides.priority ?? 1,
    route: overrides.route ?? `/${label.toLowerCase().replace(/\s+/g, '-')}`,
    enabled: overrides.enabled ?? true,
    reasonDisabled: overrides.enabled === false ? overrides.reasonDisabled ?? 'disabled' : null,
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
    dataState: 'READY',
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
      summary: { status: 'READY', updatedAt: empty.generatedAt, errorCode: null, message: null },
      positions: { status: 'READY', updatedAt: empty.generatedAt, errorCode: null, message: null },
      claimables: { status: 'READY', updatedAt: empty.generatedAt, errorCode: null, message: null },
      approvals: { status: 'READY', updatedAt: empty.generatedAt, errorCode: null, message: null },
      activity: { status: 'READY', updatedAt: empty.generatedAt, errorCode: null, message: null },
      ...(extras.sectionStatus ?? {}),
    },
  }
}

function buildOrchestration(portfolio: WalletPortfolio, walletConnected = true) {
  const intelligence = buildPortfolioIntelligence({ portfolio, walletConnected })
  const assistantContext = buildPortfolioAssistantContext({
    portfolio,
    intelligence,
    walletConnected,
  })
  return buildPortfolioActionOrchestration({
    assistantContext,
    portfolio,
    walletConnected,
  })
}

describe('R791D.5C commandCenterPortfolioActionOrchestration', () => {
  it('TEST 1: Claimable position creates CLAIM action', () => {
    const claim = action('CLAIM', 'Claim', { route: '/pools/claim' })
    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'pool-1',
          positionType: 'POOL',
          title: 'Stake Pool',
          recommendedAction: claim,
          actions: {
            primary: claim,
            secondary: [],
            open: null,
            manage: action('MANAGE', 'Manage'),
            analytics: null,
          },
        }),
      ]),
    )

    const claimActions = model.availableActions.filter((a) => a.actionType === 'CLAIM')
    expect(claimActions).toHaveLength(1)
    expect(claimActions[0]).toMatchObject({
      positionTitle: 'Stake Pool',
      label: 'Claim',
      route: '/pools/claim',
      enabled: true,
      group: 'CLAIMABLE',
    })
  })

  it('TEST 2: Farm rewards create HARVEST action', () => {
    const harvest = action('HARVEST', 'Harvest', { route: '/farms/harvest' })
    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'farm-1',
          positionType: 'FARM',
          title: 'MM72 Farm',
          recommendedAction: harvest,
          actions: {
            primary: harvest,
            secondary: [],
            open: null,
            manage: action('MANAGE', 'Manage'),
            analytics: null,
          },
        }),
      ]),
    )

    expect(model.availableActions.some((a) => a.actionType === 'HARVEST')).toBe(true)
    expect(
      model.groupedActions.find((g) => g.group === 'CLAIMABLE')?.actions.some(
        (a) => a.actionType === 'HARVEST',
      ),
    ).toBe(true)
  })

  it('TEST 3: Liquidity creates REMOVE_LIQUIDITY', () => {
    const remove = action('REMOVE_LIQUIDITY', 'Remove', { route: '/liquidity/remove' })
    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'lp-1',
          positionType: 'LIQUIDITY',
          title: 'MM72/MARCO LP',
          recommendedAction: remove,
          actions: {
            primary: remove,
            secondary: [],
            open: null,
            manage: action('MANAGE', 'Manage'),
            analytics: null,
          },
        }),
      ]),
    )

    const removeActions = model.availableActions.filter((a) => a.actionType === 'REMOVE_LIQUIDITY')
    expect(removeActions).toHaveLength(1)
    expect(removeActions[0].group).toBe('MANAGEMENT')
  })

  it('TEST 4: Approval required creates APPROVE', () => {
    const approve = action('APPROVE', 'Approve', { route: '/approve' })
    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'lp-approve',
          positionType: 'LIQUIDITY',
          title: 'Needs Approval',
          requiresAttention: true,
          reason: 'Approval required',
          recommendedAction: approve,
          actions: {
            primary: approve,
            secondary: [],
            open: null,
            manage: action('MANAGE', 'Manage'),
            analytics: null,
          },
        }),
      ]),
    )

    const approveActions = model.availableActions.filter((a) => a.actionType === 'APPROVE')
    expect(approveActions).toHaveLength(1)
    expect(approveActions[0].group).toBe('ATTENTION_REQUIRED')
  })

  it('TEST 5: Disabled action grouped as blocked', () => {
    const claim = action('CLAIM', 'Claim', {
      enabled: false,
      reasonDisabled: 'Nothing to claim',
      route: '/claim',
    })
    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'blocked-1',
          positionType: 'POOL',
          title: 'Blocked Pool',
          recommendedAction: claim,
          actions: {
            primary: claim,
            secondary: [],
            open: null,
            manage: action('MANAGE', 'Manage', { enabled: false, reasonDisabled: 'unavailable' }),
            analytics: null,
          },
        }),
      ]),
    )

    expect(model.availableActions.some((a) => a.actionType === 'CLAIM')).toBe(false)
    expect(model.blockedActions.some((a) => a.actionType === 'CLAIM' && a.enabled === false)).toBe(
      true,
    )
  })

  it('TEST 6: Analytics action grouped correctly', () => {
    const analytics = action('ANALYTICS', 'Analytics', { route: '/analytics' })
    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'an-1',
          positionType: 'LIQUIDITY',
          title: 'LP Analytics',
          recommendedAction: action('MANAGE', 'Manage'),
          actions: {
            primary: action('MANAGE', 'Manage'),
            secondary: [],
            open: null,
            manage: action('MANAGE', 'Manage'),
            analytics,
          },
        }),
      ]),
    )

    const analyticsActions = model.availableActions.filter((a) => a.actionType === 'ANALYTICS')
    expect(analyticsActions).toHaveLength(1)
    expect(analyticsActions[0].group).toBe('ANALYTICS')
    expect(resolvePortfolioActionGroup({ actionType: 'ANALYTICS', requiresAttention: false })).toBe(
      'ANALYTICS',
    )
  })

  it('TEST 7: No invented actions', () => {
    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'p1',
          positionType: 'FARM',
          title: 'Farm Only Manage',
        }),
      ]),
    )

    for (const card of [...model.availableActions, ...model.blockedActions]) {
      expect(PORTFOLIO_ORCHESTRATION_ACTION_TYPES).toContain(card.actionType)
    }
    const rawTypes = model.availableActions.map((a) => a.actionType as string)
    expect(rawTypes.includes('STAKE')).toBe(false)
    expect(rawTypes.includes('ADD_LIQUIDITY')).toBe(false)
  })

  it('TEST 8: Priority ordering deterministic', () => {
    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'p-open',
          positionType: 'POOL',
          title: 'Z Open',
          recommendedAction: action('OPEN', 'Open', { route: '/open' }),
          actions: {
            primary: action('OPEN', 'Open', { route: '/open' }),
            secondary: [],
            open: action('OPEN', 'Open', { route: '/open' }),
            manage: action('MANAGE', 'Manage', { route: '/manage' }),
            analytics: action('ANALYTICS', 'Analytics', { route: '/a' }),
          },
        }),
        stubPosition({
          positionId: 'p-claim',
          positionType: 'FARM',
          title: 'A Claim',
          recommendedAction: action('CLAIM', 'Claim', { route: '/claim' }),
          actions: {
            primary: action('CLAIM', 'Claim', { route: '/claim' }),
            secondary: [action('APPROVE', 'Approve', { route: '/approve' })],
            open: null,
            manage: action('MANAGE', 'Manage'),
            analytics: null,
          },
        }),
      ]),
    )

    const types = model.priorityActions.map((a) => a.actionType)
    const ranks = types.map((t) => PORTFOLIO_ACTION_PRIORITY[t])
    for (let i = 1; i < ranks.length; i += 1) {
      expect(ranks[i]).toBeGreaterThanOrEqual(ranks[i - 1])
    }
    expect(types.indexOf('APPROVE')).toBeLessThan(types.indexOf('CLAIM'))
    expect(types.indexOf('CLAIM')).toBeLessThan(types.indexOf('MANAGE'))
  })

  it('TEST 9: Disconnected wallet', () => {
    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'p1',
          positionType: 'FARM',
          title: 'Farm',
          recommendedAction: action('HARVEST', 'Harvest'),
          actions: {
            primary: action('HARVEST', 'Harvest'),
            secondary: [],
            open: null,
            manage: action('MANAGE', 'Manage'),
            analytics: null,
          },
        }),
      ]),
      false,
    )

    expect(model.state).toBe('DISCONNECTED')
    expect(model.availableActions).toEqual([])
    expect(model.priorityActions).toEqual([])
    expect(model.blockedActions).toEqual([])
  })

  it('TEST 10: Empty portfolio', () => {
    const model = buildOrchestration(buildPortfolio([]), true)
    expect(model.state).toBe('EMPTY')
    expect(model.availableActions).toEqual([])
    expect(model.priorityActions).toEqual([])
  })

  it('TEST 11: Future position type compatibility', () => {
    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'vault-1',
          positionType: 'VAULT',
          title: 'Future Vault',
          recommendedAction: action('MANAGE', 'Manage', { route: '/vault' }),
          actions: {
            primary: action('MANAGE', 'Manage', { route: '/vault' }),
            secondary: [],
            open: action('OPEN', 'Open', { route: '/vault/open' }),
            manage: action('MANAGE', 'Manage', { route: '/vault' }),
            analytics: null,
          },
        }),
        stubPosition({
          positionId: 'perp-1',
          positionType: 'PERPETUAL',
          title: 'Future Perp',
          recommendedAction: action('OPEN', 'Open', { route: '/perp' }),
          actions: {
            primary: action('OPEN', 'Open', { route: '/perp' }),
            secondary: [],
            open: action('OPEN', 'Open', { route: '/perp' }),
            manage: null,
            analytics: null,
          },
        }),
      ]),
    )

    expect(model.availableActions.some((a) => a.positionTitle === 'Future Vault')).toBe(true)
    expect(model.availableActions.some((a) => a.positionTitle === 'Future Perp')).toBe(true)
    expect(model.availableActions.every((a) => PORTFOLIO_ORCHESTRATION_ACTION_TYPES.includes(a.actionType))).toBe(
      true,
    )
  })

  it('TEST 12: No transaction execution', () => {
    const sourcePath = path.join(__dirname, '../portfolioActionOrchestration.ts')
    const source = readFileSync(sourcePath, 'utf8')
    expect(orchestrationContainsExecutionMarkers(source)).toBe(false)
    expect(source).not.toMatch(/\bwriteContract\s*\(/)
    expect(source).not.toMatch(/\bsendTransaction\s*\(/)

    const model = buildOrchestration(
      buildPortfolio([
        stubPosition({
          positionId: 'p1',
          positionType: 'FARM',
          title: 'Farm',
          recommendedAction: action('CLAIM', 'Claim', { route: '/farms/claim' }),
          actions: {
            primary: action('CLAIM', 'Claim', { route: '/farms/claim' }),
            secondary: [],
            open: null,
            manage: action('MANAGE', 'Manage'),
            analytics: null,
          },
        }),
      ]),
    )

    for (const card of model.availableActions) {
      expect(card).toHaveProperty('route')
      expect(card).not.toHaveProperty('execute')
      expect(card).not.toHaveProperty('txHash')
      expect(card).not.toHaveProperty('calldata')
    }
  })
})
