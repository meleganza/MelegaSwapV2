/**
 * R791D.4F — Command Center premium visual system foundation tests.
 */

import React from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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
import {
  COMMAND_CENTER_HIERARCHY,
  CC_CARD_LANGUAGE,
  CC_RESPONSIVE,
  CC_VISUAL_SPACING,
  CC_VISUAL_STATES,
  VISUAL_PRIORITY,
  isProductSpecificSectionName,
} from '../../components/commandCenterVisualFoundation'

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

function buildPortfolio(positions: PortfolioPosition[]): WalletPortfolio {
  const empty = createEmptyWalletPortfolio({
    wallet: '0xabc',
    generatedAt: '2026-07-20T00:00:00.000Z',
  })
  return {
    ...empty,
    schema: WALLET_PORTFOLIO_SCHEMA,
    positions,
    summary: {
      ...empty.summary,
      activePositionCount: positions.length,
    },
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
      myPositions={{
        myPositionsView: xp.myPositionsView,
        myPositionsGroups: xp.myPositionsGroups,
        myPositionsSummary: xp.myPositionsSummary,
        myPositionsState: xp.state,
      }}
    />,
  )
}

describe('R791D.4F Command Center visual foundation', () => {
  it('TEST 1 — Hierarchy order', () => {
    expect(COMMAND_CENTER_HIERARCHY).toEqual([
      'PORTFOLIO_HERO',
      'ACTION_CENTER',
      'INTELLIGENCE_CENTER',
      'POSITIONS_CENTER',
      'SECONDARY',
    ])

    renderDashboard(buildPortfolio([stubPosition({ positionId: 'p1', positionType: 'FARM', title: 'Farm A' })]))

    const root = screen.getByTestId('portfolio-dashboard')
    expect(root.getAttribute('data-visual-hierarchy')).toBe(COMMAND_CENTER_HIERARCHY.join('|'))

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

  it('TEST 2 — Hero exists', () => {
    renderDashboard(buildPortfolio([]))
    const hero = screen.getByTestId('portfolio-hero')
    expect(hero.getAttribute('data-cc-center')).toBe('PORTFOLIO_HERO')
    expect(hero.getAttribute('data-visual-priority')).toBe('1')
  })

  it('TEST 3 — Actions exists', () => {
    renderDashboard(buildPortfolio([]))
    const actions = screen.getByTestId('portfolio-actions')
    expect(actions.getAttribute('data-cc-center')).toBe('ACTION_CENTER')
    expect(actions.getAttribute('data-visual-priority')).toBe('2')
  })

  it('TEST 4 — Intelligence exists', () => {
    renderDashboard(buildPortfolio([]))
    const intel = screen.getByTestId('portfolio-intelligence-section')
    expect(intel.getAttribute('data-cc-center')).toBe('INTELLIGENCE_CENTER')
    expect(intel.getAttribute('data-visual-priority')).toBe('2')
  })

  it('TEST 5 — Positions exists', () => {
    renderDashboard(buildPortfolio([]))
    const positions = screen.getByTestId('positions-center')
    expect(positions.getAttribute('data-cc-center')).toBe('POSITIONS_CENTER')
    expect(positions.getAttribute('data-visual-priority')).toBe('3')
  })

  it('TEST 6 — No product-specific sections', () => {
    expect(isProductSpecificSectionName('FarmsSection')).toBe(true)
    expect(isProductSpecificSectionName('PoolsSection')).toBe(true)
    expect(isProductSpecificSectionName('LiquiditySection')).toBe(true)
    expect(isProductSpecificSectionName('PortfolioSection')).toBe(false)

    const { container } = renderDashboard(
      buildPortfolio([stubPosition({ positionId: 'p1', positionType: 'FARM', title: 'Farm A' })]),
    )
    expect(container.querySelector('[data-testid="farms-section"]')).toBeNull()
    expect(container.querySelector('[data-testid="pools-section"]')).toBeNull()
    expect(container.querySelector('[data-testid="liquidity-section"]')).toBeNull()
    expect(screen.queryByText('FarmsSection')).toBeNull()
  })

  it('TEST 7 — Disconnected state', () => {
    const portfolio = createEmptyWalletPortfolio({
      wallet: null,
      generatedAt: '2026-07-20T00:00:00.000Z',
    })
    renderDashboard(portfolio, false)
    const root = screen.getByTestId('portfolio-dashboard')
    expect(root.getAttribute('data-visual-state')).toBe('DISCONNECTED')
    expect(root.getAttribute('data-wallet-connected')).toBe('false')
    expect(screen.getByTestId('portfolio-hero-empty').textContent).toMatch(/Wallet not connected/i)
  })

  it('TEST 8 — Empty state', () => {
    const portfolio = createEmptyWalletPortfolio({
      wallet: '0xabc',
      generatedAt: '2026-07-20T00:00:00.000Z',
    })
    renderDashboard(portfolio, true)
    const root = screen.getByTestId('portfolio-dashboard')
    expect(root.getAttribute('data-visual-state')).toBe('EMPTY')
    expect(screen.getByTestId('portfolio-dashboard-empty').textContent).toMatch(/Portfolio empty/i)
  })

  it('TEST 9 — Responsive composition', () => {
    expect(CC_RESPONSIVE.desktop.hero).toBe('full-width')
    expect(CC_RESPONSIVE.desktop.actions).toBe('horizontal')
    expect(CC_RESPONSIVE.desktop.positions).toBe('grid')
    expect(CC_RESPONSIVE.mobile.layout).toBe('single-column')
    expect(CC_RESPONSIVE.mobile.noHorizontalScroll).toBe(true)

    renderDashboard(buildPortfolio([]))
    const root = screen.getByTestId('portfolio-dashboard')
    expect(root.getAttribute('data-responsive-mobile')).toBe('single-column')
    expect(root.getAttribute('data-no-horizontal-scroll')).toBe('true')
    expect(root.getAttribute('data-responsive')).toBe('stack-mobile-columns-desktop')
  })

  it('TEST 10 — No duplicated information blocks', () => {
    expect(CC_CARD_LANGUAGE.avoid).toContain('duplicate information')
    expect(VISUAL_PRIORITY.PORTFOLIO_HERO).toBe(1)
    expect(VISUAL_PRIORITY.SECONDARY).toBe(4)
    expect(CC_VISUAL_SPACING.pageGap).toBeTruthy()
    expect(CC_VISUAL_STATES).toContain('DISCONNECTED')
    expect(CC_VISUAL_STATES).toContain('ATTENTION')

    const connected = renderDashboard(
      buildPortfolio([stubPosition({ positionId: 'p1', positionType: 'LIQUIDITY', title: 'LP' })]),
    )

    expect(screen.getAllByTestId('portfolio-summary-grid')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-hero')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-actions')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-intelligence-section')).toHaveLength(1)
    expect(screen.getAllByTestId('positions-center')).toHaveLength(1)
    connected.unmount()

    const disconnected = createEmptyWalletPortfolio({
      wallet: null,
      generatedAt: '2026-07-20T00:00:00.000Z',
    })
    const { unmount } = renderDashboard(disconnected, false)
    const hero = screen.getByTestId('portfolio-hero')
    expect(within(hero).getAllByText(/Wallet not connected/i)).toHaveLength(1)
    unmount()
  })

  it('foundation stays within Command Center composition scope', () => {
    const foundationPath = path.join(
      __dirname,
      '../../components/commandCenterVisualFoundation.tsx',
    )
    const src = readFileSync(foundationPath, 'utf8')
    expect(src).not.toMatch(/FarmsSection|PoolsSection|LiquiditySection/)
    expect(src).toMatch(/PortfolioSection/)
    expect(src).toMatch(/SectionHeader/)
    expect(src).toMatch(/MetricBlock/)
    expect(src).toMatch(/ActionItem/)
    expect(src).toMatch(/IntelligenceItem/)
    expect(src).toMatch(/PositionGroup/)
  })
})
