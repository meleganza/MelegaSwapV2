/**
 * R791D.4C — Command Center visual portfolio composition foundation.
 */

import React, { useState } from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  PORTFOLIO_POSITION_SCHEMA,
  WALLET_PORTFOLIO_SCHEMA,
  createEmptyWalletPortfolio,
  createNonePortfolioAction,
  type PortfolioPosition,
  type PortfolioPositionAction,
  type WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
import { resolvePortfolioView } from 'lib/wallet-portfolio/viewEngine'
import {
  buildMyPositionsExperience,
  buildPortfolioViewSelectorModel,
  groupMyPositionCards,
  projectMyPositionCard as projectRuntimeCard,
} from '../commandCenterPortfolioCutover'
import {
  DashboardSectionBoundary,
  PortfolioDashboard,
  PortfolioViewSelector,
  buildTodaysPriorities,
} from '../../components/PortfolioDashboard'
import {
  PortfolioActions,
  PortfolioHero,
  PositionsCenter,
} from '../../components/portfolioComposition'

function action(
  type: PortfolioPositionAction['type'],
  label: string,
  overrides: Partial<PortfolioPositionAction> = {},
): PortfolioPositionAction {
  return {
    type,
    label,
    priority: 1,
    route: `/${label.toLowerCase()}`,
    enabled: true,
    reasonDisabled: null,
    ...overrides,
  }
}

function stubPosition(
  overrides: Partial<PortfolioPosition> & Pick<PortfolioPosition, 'positionId' | 'positionType' | 'title'>,
): PortfolioPosition {
  const none = createNonePortfolioAction()
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

function buildProps(view: 'ALL' | 'CLAIMABLE' = 'ALL', portfolioOverride?: WalletPortfolio) {
  const harvest = action('HARVEST', 'Harvest')
  const claim = action('CLAIM', 'Claim')
  const positions = [
    stubPosition({
      positionId: 'liq-1',
      positionType: 'LIQUIDITY',
      title: 'MARCO/WBNB LP',
      requiresAttention: true,
      actions: {
        primary: action('REMOVE_LIQUIDITY', 'Remove Liquidity'),
        secondary: [],
        open: null,
        manage: action('MANAGE', 'Manage'),
        analytics: null,
      },
      recommendedAction: action('REMOVE_LIQUIDITY', 'Remove Liquidity'),
    }),
    stubPosition({
      positionId: 'farm-1',
      positionType: 'FARM',
      title: 'MARCO Farm',
      claimableValueUsd: '5',
      actions: { primary: harvest, secondary: [], open: null, manage: null, analytics: null },
      recommendedAction: harvest,
    }),
    stubPosition({
      positionId: 'pool-1',
      positionType: 'POOL',
      title: 'MARCO Pool',
      claimableValueUsd: '2',
      actions: { primary: claim, secondary: [], open: null, manage: null, analytics: null },
      recommendedAction: claim,
    }),
  ]

  const empty = createEmptyWalletPortfolio({
    wallet: '0xA08f1234567890abcdef1234567890abcdef4513',
    generatedAt: '2026-07-19T00:00:00.000Z',
  })
  const portfolio: WalletPortfolio = portfolioOverride ?? {
    ...empty,
    schema: WALLET_PORTFOLIO_SCHEMA,
    wallet: '0xA08f1234567890abcdef1234567890abcdef4513',
    summary: {
      ...empty.summary,
      netValueUsd: '12450',
      claimableValueUsd: '7',
      activePositionCount: 3,
      historicalPositionCount: 0,
      attentionPositionCount: 1,
      pendingActionCount: 2,
    },
    positions,
    claimables: [
      {
        id: 'c1',
        positionId: 'farm-1',
        sourceType: 'FARM',
        title: 'Farm rewards',
        amount: '1',
        valueUsd: '5',
        action: harvest,
      },
    ],
    quickActions: [{ id: 'qa1', label: 'Trade', href: '/swap', frequencyRank: 1 }],
    recentActivity: [
      {
        id: 'a1',
        kind: 'claim',
        label: 'Claimed',
        time: '1h',
        positionId: 'farm-1',
        href: null,
      },
    ],
  }

  const selector = buildPortfolioViewSelectorModel({ portfolio, currentView: view })
  const xp = buildMyPositionsExperience({
    portfolio,
    walletConnected: Boolean(portfolio.wallet),
    view,
  })

  return {
    portfolio,
    walletConnected: Boolean(portfolio.wallet),
    viewSelector: selector,
    myPositions: {
      myPositionsView: xp.myPositionsView,
      myPositionsGroups: xp.myPositionsGroups,
      myPositionsSummary: xp.myPositionsSummary,
      myPositionsState: xp.state,
    },
  }
}

function InteractiveDashboard() {
  const [view, setView] = useState<'ALL' | 'CLAIMABLE'>('ALL')
  const props = buildProps(view)
  return <PortfolioDashboard {...props} onSelectView={(v) => setView(v as 'ALL' | 'CLAIMABLE')} />
}

describe('R791D.4C Command Center visual composition', () => {
  it('TEST 1 — Hero consumes summary', () => {
    const props = buildProps()
    render(<PortfolioHero portfolio={props.portfolio} walletConnected />)
    expect(screen.getByTestId('portfolio-hero')).toBeTruthy()
    expect(screen.getByTestId('summary-net-value').textContent).toBe('12450')
    expect(screen.getByTestId('summary-claimable-value').textContent).toBe('7')
    expect(screen.getByTestId('summary-active-positions').textContent).toBe('3')
    expect(screen.getByTestId('summary-pending-actions').textContent).toBe('2')
    expect(screen.getByTestId('portfolio-hero-wallet').textContent).toMatch(/0xA08f/i)
    const heroSrc = readFileSync(
      path.resolve(__dirname, '../../components/portfolioComposition.tsx'),
      'utf8',
    )
    expect(heroSrc).toMatch(/summary\.netValueUsd/)
    expect(heroSrc).toMatch(/summary\.activePositionCount/)
    expect(heroSrc).not.toMatch(/positions\.reduce/)
  })

  it('TEST 2 — Actions consume canonical actions', () => {
    const props = buildProps()
    render(<PortfolioActions positions={props.portfolio.positions} walletConnected />)
    expect(screen.getByTestId('portfolio-actions')).toBeTruthy()
    expect(screen.getByText("Today's Actions")).toBeTruthy()
    const types = screen.getAllByTestId('priority-item').map((el) => el.getAttribute('data-action-type'))
    for (const t of types) {
      expect(['CLAIM', 'HARVEST', 'WITHDRAW', 'REMOVE_LIQUIDITY', 'APPROVE']).toContain(t)
    }
    const items = buildTodaysPriorities(props.portfolio.positions)
    expect(items.every((i) => ['CLAIM', 'HARVEST', 'WITHDRAW', 'REMOVE_LIQUIDITY', 'APPROVE'].includes(i.action.type))).toBe(
      true,
    )
  })

  it('TEST 3 — Positions use PositionCard', () => {
    const props = buildProps()
    render(
      <PositionsCenter
        myPositions={props.myPositions}
        viewSelector={props.viewSelector}
        walletConnected
      />,
    )
    expect(screen.getByTestId('positions-center')).toBeTruthy()
    expect(screen.getByTestId('my-positions-section')).toBeTruthy()
    const sectionSrc = readFileSync(
      path.resolve(__dirname, '../../components/MyPositionsSection.tsx'),
      'utf8',
    )
    expect(sectionSrc).toMatch(/PositionCard/)
    expect(sectionSrc).not.toMatch(/FarmCard|PoolCard|LiquidityCard/)
    const centerSrc = readFileSync(
      path.resolve(__dirname, '../../components/portfolioComposition.tsx'),
      'utf8',
    )
    expect(centerSrc).toMatch(/MyPositionsSection/)
    expect(centerSrc).not.toMatch(/FarmCard|PoolCard|LiquidityCard/)
  })

  it('TEST 4 — Selector remains functional', () => {
    render(<InteractiveDashboard />)
    expect(screen.getByTestId('portfolio-view-selector')).toHaveAttribute('data-current-view', 'ALL')
    fireEvent.click(screen.getByTestId('portfolio-view-CLAIMABLE'))
    expect(screen.getByTestId('portfolio-view-selector')).toHaveAttribute('data-current-view', 'CLAIMABLE')
  })

  it('TEST 5 — No product-specific cards', () => {
    const dash = readFileSync(path.resolve(__dirname, '../../components/PortfolioDashboard.tsx'), 'utf8')
    const comp = readFileSync(path.resolve(__dirname, '../../components/portfolioComposition.tsx'), 'utf8')
    for (const src of [dash, comp]) {
      expect(src).not.toMatch(/FarmCard/)
      expect(src).not.toMatch(/PoolCard/)
      expect(src).not.toMatch(/LiquidityCard/)
      expect(src).not.toMatch(/liquidityPositions/)
      expect(src).not.toMatch(/farmPositions/)
      expect(src).not.toMatch(/poolPositions/)
    }
  })

  it('TEST 6 — Disconnected state', () => {
    const empty = createEmptyWalletPortfolio({ wallet: null, generatedAt: '2026-07-19T00:00:00.000Z' })
    const xp = buildMyPositionsExperience({ portfolio: empty, walletConnected: false })
    render(
      <PortfolioDashboard
        portfolio={empty}
        walletConnected={false}
        myPositions={{
          myPositionsView: xp.myPositionsView,
          myPositionsGroups: xp.myPositionsGroups,
          myPositionsSummary: xp.myPositionsSummary,
          myPositionsState: xp.state,
        }}
      />,
    )
    expect(screen.getByTestId('portfolio-hero')).toHaveAttribute('data-state', 'WALLET_NOT_CONNECTED')
    expect(screen.getByTestId('portfolio-hero-empty').textContent).toContain('Wallet not connected')
  })

  it('TEST 7 — Empty portfolio', () => {
    const empty = createEmptyWalletPortfolio({
      wallet: '0xabc',
      generatedAt: '2026-07-19T00:00:00.000Z',
    })
    const xp = buildMyPositionsExperience({ portfolio: empty, walletConnected: true })
    render(
      <PortfolioDashboard
        portfolio={empty}
        walletConnected
        myPositions={{
          myPositionsView: xp.myPositionsView,
          myPositionsGroups: xp.myPositionsGroups,
          myPositionsSummary: xp.myPositionsSummary,
          myPositionsState: xp.state,
        }}
      />,
    )
    expect(screen.getByTestId('portfolio-dashboard-empty').textContent).toMatch(/Portfolio empty|No positions/i)
    expect(screen.getByTestId('my-positions-section')).toHaveAttribute('data-state', 'EMPTY')
  })

  it('TEST 8 — Section isolation', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    function Boom(): null {
      throw new Error('boom')
    }
    render(
      <div>
        <PortfolioViewSelector
          model={buildPortfolioViewSelectorModel({
            portfolio: buildProps().portfolio,
            currentView: 'ALL',
          })}
        />
        <DashboardSectionBoundary section="hero">
          <Boom />
        </DashboardSectionBoundary>
        <div data-testid="positions-survive">ok</div>
      </div>,
    )
    expect(screen.getByTestId('portfolio-view-selector')).toBeTruthy()
    expect(screen.getByTestId('dashboard-section-unavailable-hero')).toBeTruthy()
    expect(screen.getByTestId('positions-survive')).toBeTruthy()
    spy.mockRestore()
  })

  it('TEST 9 — Responsive composition', () => {
    render(<PortfolioDashboard {...buildProps()} />)
    const dash = screen.getByTestId('portfolio-dashboard')
    expect(dash).toHaveAttribute('data-responsive', 'stack-mobile-columns-desktop')
    expect(screen.getByTestId('portfolio-secondary')).toBeTruthy()
    const dashSrc = readFileSync(path.resolve(__dirname, '../../components/PortfolioDashboard.tsx'), 'utf8')
    expect(dashSrc).toMatch(/overflow-x:\s*hidden/)
    expect(dashSrc).toMatch(/@media \(min-width: 1024px\)/)
    expect(dashSrc).not.toMatch(/overflow-x:\s*scroll/)
  })

  it('TEST 10 — No duplicate portfolio sections', () => {
    render(<PortfolioDashboard {...buildProps()} />)
    expect(screen.getAllByTestId('portfolio-hero')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-actions')).toHaveLength(1)
    expect(screen.getAllByTestId('positions-center')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-secondary')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-view-selector')).toHaveLength(1)
    expect(screen.getAllByTestId('claimables-section')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-activity-section')).toHaveLength(1)
    expect(screen.getAllByTestId('quick-actions-section')).toHaveLength(1)
    // Hero replaced standalone summary widget — only one summary section alias
    expect(screen.getAllByTestId('portfolio-summary-section')).toHaveLength(1)
  })
})
