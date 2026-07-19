import { describe, expect, it, vi } from 'vitest'
import {
  PORTFOLIO_POSITION_SCHEMA,
  createNonePortfolioAction,
  type PortfolioPosition,
  type PortfolioPositionAction,
} from '../contracts'
import {
  projectMyPositionCard,
  type MyPositionCardModel,
} from '../myPositionCardModel'

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
  const none = createNonePortfolioAction()
  return {
    schema: PORTFOLIO_POSITION_SCHEMA,
    wallet: '0xabc',
    protocol: 'melega-v2',
    chain: { chainId: 56, name: 'BNB Chain' },
    contract: '0xcontract',
    source: 'test',
    subtitle: 'subtitle',
    icon: 'icon://x',
    badges: ['V2'],
    tags: ['owned'],
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
    productRoute: '/x',
    openRoute: '/x/open',
    manageRoute: '/x/manage',
    analyticsRoute: '/x/analytics',
    producer: 'test',
    observedAt: null,
    blockNumber: null,
    confidence: null,
    dataState: 'PARTIAL',
    ...overrides,
  }
}

describe('R791D.3F universal My Position card model', () => {
  it('TEST 1 — Liquidity position projects', () => {
    const manage = action('MANAGE', 'Manage')
    const remove = action('REMOVE_LIQUIDITY', 'Remove')
    const card = projectMyPositionCard(
      stubPosition({
        positionId: 'liq-1',
        positionType: 'LIQUIDITY',
        title: 'MM72 / MARCO',
        actions: { primary: manage, secondary: [remove], open: null, manage, analytics: null },
        recommendedAction: manage,
      }),
    )

    expect(card.identity.positionId).toBe('liq-1')
    expect(card.identity.positionType).toBe('LIQUIDITY')
    expect(card.identity.protocol).toBe('melega-v2')
    expect(card.identity.chain.chainId).toBe(56)
    expect(card.identity.contract).toBe('0xcontract')
    expect(card.identity.wallet).toBe('0xabc')
    expect(card.title).toBe('MM72 / MARCO')
    expect(card.badge).toEqual(['V2'])
    expect(card.positionType).toBe('LIQUIDITY')
  })

  it('TEST 2 — Farm position projects', () => {
    const harvest = action('HARVEST', 'Harvest')
    const card = projectMyPositionCard(
      stubPosition({
        positionId: 'farm-1',
        positionType: 'FARM',
        title: 'MM72 Farm',
        claimableValueUsd: '3.5',
        rewardTokens: [
          {
            chainId: 56,
            address: null,
            symbol: 'MARCO',
            name: 'MARCO',
            decimals: 18,
            logoURI: null,
          },
        ],
        actions: { primary: harvest, secondary: [], open: null, manage: null, analytics: null },
        recommendedAction: harvest,
      }),
    )

    expect(card.positionType).toBe('FARM')
    expect(card.claimables.hasClaimable).toBe(true)
    expect(card.actions.primaryAction.type).toBe('HARVEST')
  })

  it('TEST 3 — Pool position projects', () => {
    const claim = action('CLAIM', 'Claim')
    const card = projectMyPositionCard(
      stubPosition({
        positionId: 'pool-1',
        positionType: 'POOL',
        title: 'MARCO Staking',
        actions: { primary: claim, secondary: [], open: null, manage: null, analytics: null },
        recommendedAction: claim,
      }),
    )

    expect(card.positionType).toBe('POOL')
    expect(card.title).toBe('MARCO Staking')
    expect(card.navigation.productRoute).toBe('/x')
  })

  it('TEST 4 — Future position type projects', () => {
    const manage = action('MANAGE', 'Manage')
    for (const positionType of ['VAULT', 'LENDING', 'STRATEGY'] as const) {
      const card = projectMyPositionCard(
        stubPosition({
          positionId: `future-${positionType}`,
          positionType,
          title: `Future ${positionType}`,
          actions: { primary: manage, secondary: [], open: null, manage, analytics: null },
          recommendedAction: manage,
        }),
      )
      expect(card.positionType).toBe(positionType)
      expect(card.identity.positionType).toBe(positionType)
      expect(card.actions.primaryAction.type).toBe('MANAGE')
    }
  })

  it('TEST 5 — Actions preserve canonical order', () => {
    const analytics = action('ANALYTICS', 'Analytics', { priority: 1 })
    const manage = action('MANAGE', 'Manage', { priority: 1 })
    const harvest = action('HARVEST', 'Harvest', { priority: 1 })
    const disabled = action('WITHDRAW', 'Withdraw', { enabled: false, priority: 1 })

    const card = projectMyPositionCard(
      stubPosition({
        positionId: 'order-1',
        positionType: 'FARM',
        title: 'Ordered',
        actions: {
          primary: analytics,
          secondary: [disabled, manage, harvest],
          open: null,
          manage,
          analytics,
        },
        recommendedAction: analytics,
      }),
    )

    expect(card.actions.primaryAction.type).toBe('HARVEST')
    const types = [
      card.actions.primaryAction.type,
      ...card.actions.secondaryActions.map((a) => a.type),
    ]
    expect(types.indexOf('HARVEST')).toBeLessThan(types.indexOf('MANAGE'))
    expect(types.indexOf('MANAGE')).toBeLessThan(types.indexOf('ANALYTICS'))
    expect(types.indexOf('ANALYTICS')).toBeLessThan(types.indexOf('WITHDRAW'))
  })

  it('TEST 6 — Null economics remain null', () => {
    const card = projectMyPositionCard(
      stubPosition({
        positionId: 'null-econ',
        positionType: 'LIQUIDITY',
        title: 'Unknown value',
        currentValueUsd: null,
        principalValueUsd: null,
        claimableValueUsd: null,
        pendingRewardsValueUsd: null,
      }),
    )

    expect(card.value.currentValueUsd).toBeNull()
    expect(card.value.principalValueUsd).toBeNull()
    expect(card.value.claimableValueUsd).toBeNull()
    expect(card.value.pendingRewardsValueUsd).toBeNull()
    expect(card.claimables.valueUsd).toBeNull()
  })

  it('TEST 7 — Claimables preserved', () => {
    const harvest = action('HARVEST', 'Harvest')
    const token = {
      chainId: 56,
      address: '0xreward',
      symbol: 'MARCO',
      name: 'MARCO',
      decimals: 18,
      logoURI: null,
    }
    const card = projectMyPositionCard(
      stubPosition({
        positionId: 'claim-1',
        positionType: 'FARM',
        title: 'Rewards',
        claimableValueUsd: '12.0',
        pendingRewardsValueUsd: '1.0',
        rewardTokens: [token],
        actions: { primary: harvest, secondary: [], open: null, manage: null, analytics: null },
        recommendedAction: harvest,
      }),
    )

    expect(card.claimables.hasClaimable).toBe(true)
    expect(card.claimables.valueUsd).toBe('12.0')
    expect(card.claimables.tokens).toEqual([token])
    expect(card.claimables.actions.some((a) => a.type === 'HARVEST')).toBe(true)
    expect(card.value.claimableValueUsd).toBe('12.0')
    expect(card.value.pendingRewardsValueUsd).toBe('1.0')
  })

  it('TEST 8 — Lifecycle preserved', () => {
    const card = projectMyPositionCard(
      stubPosition({
        positionId: 'ended-1',
        positionType: 'POOL',
        title: 'Ended',
        status: 'ENDED',
        startedAt: '2026-01-01T00:00:00.000Z',
        endsAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-02T00:00:00.000Z',
      }),
    )

    expect(card.status).toBe('ENDED')
    expect(card.lifecycle.status).toBe('ENDED')
    expect(card.lifecycle.startedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(card.lifecycle.endsAt).toBe('2026-06-01T00:00:00.000Z')
    expect(card.lifecycle.updatedAt).toBe('2026-06-02T00:00:00.000Z')
  })

  it('TEST 9 — Attention preserved', () => {
    const card = projectMyPositionCard(
      stubPosition({
        positionId: 'attn-1',
        positionType: 'FARM',
        title: 'Needs care',
        requiresAttention: true,
        reason: 'Approval expired',
      }),
    )

    expect(card.requiresAttention).toBe(true)
    expect(card.attention.requiresAttention).toBe(true)
    expect(card.attention.attentionReason).toBe('Approval expired')
  })

  it('TEST 10 — No mutation', () => {
    const manage = action('MANAGE', 'Manage')
    const position = stubPosition({
      positionId: 'mut-1',
      positionType: 'LIQUIDITY',
      title: 'Stable',
      badges: ['A'],
      tags: ['t'],
      actions: { primary: manage, secondary: [], open: null, manage, analytics: null },
      recommendedAction: manage,
    })
    const before = JSON.stringify(position)
    projectMyPositionCard(position)
    expect(JSON.stringify(position)).toBe(before)
    expect(position.badges).toEqual(['A'])
  })

  it('TEST 11 — No network', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch' as never).mockImplementation(() => {
      throw new Error('network forbidden')
    })
    try {
      const card = projectMyPositionCard(
        stubPosition({ positionId: 'net-1', positionType: 'POOL', title: 'Offline' }),
      )
      expect(card.positionId).toBe('net-1')
      expect(fetchSpy).not.toHaveBeenCalled()
    } finally {
      fetchSpy.mockRestore()
    }
  })

  it('TEST 12 — Same input gives deterministic output', () => {
    const harvest = action('HARVEST', 'Harvest')
    const manage = action('MANAGE', 'Manage')
    const input = stubPosition({
      positionId: 'det-1',
      positionType: 'FARM',
      title: 'Deterministic',
      claimableValueUsd: '2',
      requiresAttention: true,
      reason: 'claim',
      actions: { primary: manage, secondary: [harvest], open: null, manage, analytics: null },
      recommendedAction: harvest,
    })

    const a: MyPositionCardModel = projectMyPositionCard(input)
    const b: MyPositionCardModel = projectMyPositionCard(input)
    expect(a).toEqual(b)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})
