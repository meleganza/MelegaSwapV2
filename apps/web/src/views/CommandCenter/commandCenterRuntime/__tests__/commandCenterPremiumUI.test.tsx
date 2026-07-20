/**
 * R791D.4G — Command Center premium UI implementation tests.
 */

import React from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  PORTFOLIO_POSITION_SCHEMA,
  WALLET_PORTFOLIO_SCHEMA,
  createEmptyWalletPortfolio,
  type PortfolioPosition,
  type PortfolioPositionAction,
  type WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
import {
  buildMyPositionsExperience,
  buildPortfolioViewSelectorModel,
} from '../commandCenterPortfolioCutover'
import { PortfolioDashboard } from '../../components/PortfolioDashboard'
import { isProductSpecificSectionName } from '../../components/commandCenterVisualFoundation'

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
    wallet: '0xabc123456789',
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

function buildPortfolio(positions: PortfolioPosition[], extra: Partial<WalletPortfolio> = {}): WalletPortfolio {
  const empty = createEmptyWalletPortfolio({
    wallet: '0xabc123456789',
    generatedAt: '2026-07-20T00:00:00.000Z',
  })
  return {
    ...empty,
    schema: WALLET_PORTFOLIO_SCHEMA,
    positions,
    summary: {
      ...empty.summary,
      activePositionCount: positions.filter((p) => p.status === 'ACTIVE').length,
      pendingActionCount: positions.filter((p) => p.requiresAttention).length,
      attentionPositionCount: positions.filter((p) => p.requiresAttention).length,
      claimableValueUsd: null,
      netValueUsd: null,
    },
    claimables: extra.claimables ?? [],
    recentActivity: extra.recentActivity ?? [],
    quickActions: extra.quickActions ?? [
      { id: 'qa-1', label: 'Trade', href: '/trade', frequencyRank: 1 },
    ],
    ...extra,
  }
}

function renderDashboard(portfolio: WalletPortfolio, walletConnected = true) {
  const selector = buildPortfolioViewSelectorModel({ portfolio, currentView: 'ALL' })
  const xp = buildMyPositionsExperience({ portfolio, walletConnected, view: 'ALL' })
  return render(
    <PortfolioDashboard
      portfolio={portfolio}
      walletConnected={walletConnected}
      viewSelector={selector}
      onSelectView={() => undefined}
      myPositions={{
        myPositionsView: xp.myPositionsView,
        myPositionsGroups: xp.myPositionsGroups,
        myPositionsSummary: xp.myPositionsSummary,
        myPositionsState: xp.state,
      }}
    />,
  )
}

describe('R791D.4G Command Center premium UI', () => {
  it('TEST 1 — Hero renders summary', () => {
    renderDashboard(buildPortfolio([]))
    expect(screen.getByTestId('portfolio-hero')).toBeTruthy()
    expect(screen.getByTestId('portfolio-summary-grid')).toBeTruthy()
    expect(screen.getByTestId('summary-net-value').textContent).toBe('Unavailable')
    expect(screen.getByTestId('portfolio-hero-attention')).toBeTruthy()
    expect(screen.getByTestId('portfolio-hero-claimable-state')).toBeTruthy()
  })

  it('TEST 2 — Actions render canonical actions', () => {
    const claim = action('CLAIM', 'Claim')
    renderDashboard(
      buildPortfolio([
        stubPosition({
          positionId: 'p-claim',
          positionType: 'POOL',
          title: 'Claimable Pool',
          actions: { primary: claim, secondary: [], open: null, manage: null, analytics: null },
          recommendedAction: claim,
        }),
      ]),
    )
    const item = screen.getByTestId('priority-item')
    expect(item.getAttribute('data-action-type')).toBe('CLAIM')
    expect(item.textContent).toMatch(/Claim/i)
  })

  it('TEST 3 — Intelligence renders attention', () => {
    renderDashboard(
      buildPortfolio([
        stubPosition({
          positionId: 'att-1',
          positionType: 'LIQUIDITY',
          title: 'Needs Approve',
          requiresAttention: true,
          reason: 'Approval required',
        }),
      ]),
    )
    expect(screen.getByTestId('intelligence-attention-item').textContent).toContain('Needs Approve')
  })

  it('TEST 4 — Positions render PositionCard', () => {
    renderDashboard(
      buildPortfolio([
        stubPosition({ positionId: 'liq-1', positionType: 'LIQUIDITY', title: 'LP A' }),
      ]),
    )
    expect(screen.getByTestId('my-positions-section')).toBeTruthy()
    expect(screen.getByTestId('my-positions-group-Liquidity')).toBeTruthy()
    expect(document.querySelector('[data-testid="position-card"], [data-position-card]')).toBeTruthy()
  })

  it('TEST 5 — Selector remains functional', () => {
    const portfolio = buildPortfolio([
      stubPosition({ positionId: 'liq-1', positionType: 'LIQUIDITY', title: 'LP A' }),
    ])
    const selector = buildPortfolioViewSelectorModel({ portfolio, currentView: 'ALL' })
    const xp = buildMyPositionsExperience({ portfolio, walletConnected: true, view: 'ALL' })
    const onSelectView = (view: string) => {
      expect(['ALL', 'MY_POSITIONS', 'LIQUIDITY', 'FARM', 'POOL', 'CLAIMABLE', 'ATTENTION', 'HISTORICAL']).toContain(
        view,
      )
    }
    render(
      <PortfolioDashboard
        portfolio={portfolio}
        walletConnected
        viewSelector={selector}
        onSelectView={onSelectView as never}
        myPositions={{
          myPositionsView: xp.myPositionsView,
          myPositionsGroups: xp.myPositionsGroups,
          myPositionsSummary: xp.myPositionsSummary,
          myPositionsState: xp.state,
        }}
      />,
    )
    const chip = screen.getByTestId('portfolio-view-LIQUIDITY')
    fireEvent.click(chip)
    expect(screen.getByTestId('portfolio-view-selector')).toBeTruthy()
  })

  it('TEST 6 — Claimables render', () => {
    const claimables: WalletPortfolio['claimables'] = [
      {
        id: 'c1',
        title: 'Reward',
        amount: '1',
        valueUsd: null,
        positionId: 'p1',
        sourceType: 'POOL',
        action: action('CLAIM', 'Claim'),
      },
    ]
    renderDashboard(buildPortfolio([], { claimables }))
    expect(screen.getByTestId('claimables-section')).toBeTruthy()
    expect(screen.getByTestId('claimable-item').textContent).toContain('Reward')
  })

  it('TEST 7 — Activity renders', () => {
    renderDashboard(
      buildPortfolio([], {
        recentActivity: [
          {
            id: 'a1',
            label: 'Swap completed',
            kind: 'other',
            time: 'just now',
            positionId: null,
            href: '/trade',
          },
        ],
      }),
    )
    expect(screen.getByTestId('portfolio-activity-section')).toBeTruthy()
    expect(screen.getByTestId('activity-item').textContent).toContain('Swap completed')
  })

  it('TEST 8 — Disconnected state', () => {
    const portfolio = createEmptyWalletPortfolio({
      wallet: null,
      generatedAt: '2026-07-20T00:00:00.000Z',
    })
    renderDashboard(portfolio, false)
    const root = screen.getByTestId('portfolio-dashboard')
    expect(root.getAttribute('data-visual-state')).toBe('DISCONNECTED')
    expect(screen.getByTestId('portfolio-hero-empty').textContent).toMatch(/Wallet not connected/i)
  })

  it('TEST 9 — Empty state', () => {
    renderDashboard(buildPortfolio([]), true)
    expect(screen.getByTestId('portfolio-dashboard-empty').textContent).toMatch(/Portfolio empty/i)
    expect(screen.getByTestId('portfolio-dashboard').getAttribute('data-visual-state')).toBe('EMPTY')
  })

  it('TEST 10 — Mobile composition', () => {
    renderDashboard(buildPortfolio([]))
    const root = screen.getByTestId('portfolio-dashboard')
    expect(root.getAttribute('data-responsive-mobile')).toBe('single-column')
    expect(root.getAttribute('data-no-horizontal-scroll')).toBe('true')
    expect(root.getAttribute('data-cc-r791d-4g')).toBe('premium-ui')
    const centers = Array.from(root.querySelectorAll('[data-cc-center]')).map((el) =>
      el.getAttribute('data-cc-center'),
    )
    expect(centers).toEqual([
      'PORTFOLIO_HERO',
      'ACTION_CENTER',
      'INTELLIGENCE_CENTER',
      'POSITIONS_CENTER',
      'SECONDARY',
    ])
  })

  it('TEST 11 — No duplicate sections', () => {
    renderDashboard(
      buildPortfolio([stubPosition({ positionId: 'p1', positionType: 'FARM', title: 'Farm' })]),
    )
    expect(screen.getAllByTestId('portfolio-hero')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-actions')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-intelligence-section')).toHaveLength(1)
    expect(screen.getAllByTestId('positions-center')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-secondary')).toHaveLength(1)
  })

  it('TEST 12 — No product-specific cards', () => {
    expect(isProductSpecificSectionName('FarmsSection')).toBe(true)
    const { container } = renderDashboard(
      buildPortfolio([stubPosition({ positionId: 'p1', positionType: 'FARM', title: 'Farm' })]),
    )
    expect(container.querySelector('[data-testid="farms-section"]')).toBeNull()
    expect(container.querySelector('[data-testid="pools-section"]')).toBeNull()
    expect(container.querySelector('[data-farm-card]')).toBeNull()
    expect(container.querySelector('[data-pool-card]')).toBeNull()
  })
})
