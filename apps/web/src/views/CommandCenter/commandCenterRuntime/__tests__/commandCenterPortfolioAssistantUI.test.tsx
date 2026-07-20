/**
 * R791D.5B — Command Center AI Portfolio Assistant UI experience.
 */

import React from 'react'
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
  buildPositionInsights,
  resolveAssistantNavLinks,
} from '../../components/PortfolioAssistantPanel'
import { buildPortfolioIntelligence } from '../portfolioIntelligence'
import { buildPortfolioAssistantContext } from '../portfolioAssistantContext'

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
      summary: extras.sectionStatus?.summary ?? {
        status: 'READY',
        updatedAt: empty.generatedAt,
        errorCode: null,
        message: null,
      },
      positions: extras.sectionStatus?.positions ?? {
        status: 'READY',
        updatedAt: empty.generatedAt,
        errorCode: null,
        message: null,
      },
      claimables: extras.sectionStatus?.claimables ?? {
        status: 'READY',
        updatedAt: empty.generatedAt,
        errorCode: null,
        message: null,
      },
      approvals: extras.sectionStatus?.approvals ?? {
        status: 'READY',
        updatedAt: empty.generatedAt,
        errorCode: null,
        message: null,
      },
      activity: extras.sectionStatus?.activity ?? {
        status: 'READY',
        updatedAt: empty.generatedAt,
        errorCode: null,
        message: null,
      },
      ...(extras.sectionStatus ?? {}),
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

describe('R791D.5B commandCenterPortfolioAssistantUI', () => {
  it('TEST 1: Panel renders connected state', () => {
    const claim = action('CLAIM', 'Claim', { route: '/farms/claim' })
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'farm-1',
        positionType: 'FARM',
        title: 'MM72 Farm',
        recommendedAction: claim,
        actions: {
          primary: claim,
          secondary: [],
          open: null,
          manage: action('MANAGE', 'Manage'),
          analytics: null,
        },
      }),
    ])
    renderDashboard(portfolio, true)

    const panel = screen.getByTestId('portfolio-assistant-panel')
    expect(panel).toBeTruthy()
    expect(panel.getAttribute('data-state')).toBe('READY')
    expect(screen.getByTestId('portfolio-assistant-header')).toHaveTextContent('AI Portfolio Assistant')
  })

  it('TEST 2: Summary text from context', () => {
    const portfolio = buildPortfolio([
      stubPosition({ positionId: 'p1', positionType: 'LIQUIDITY', title: 'LP A' }),
      stubPosition({ positionId: 'p2', positionType: 'POOL', title: 'Pool B' }),
      stubPosition({ positionId: 'p3', positionType: 'FARM', title: 'Farm C' }),
    ])
    renderDashboard(portfolio, true)

    expect(screen.getByTestId('portfolio-assistant-state-summary-text')).toHaveTextContent(
      'You have 3 active positions.',
    )
  })

  it('TEST 3: Attention text from context', () => {
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'a1',
        positionType: 'LIQUIDITY',
        title: 'Needs A',
        requiresAttention: true,
        reason: 'Approval',
      }),
      stubPosition({
        positionId: 'a2',
        positionType: 'POOL',
        title: 'Needs B',
        requiresAttention: true,
        reason: 'Stale',
      }),
    ])
    renderDashboard(portfolio, true)

    expect(screen.getByTestId('portfolio-assistant-attention-summary-text')).toHaveTextContent(
      '2 positions require attention.',
    )
  })

  it('TEST 4: Actions render from context', () => {
    const claim = action('CLAIM', 'Claim rewards', { route: '/farms/mm72' })
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'farm-mm72',
        positionType: 'FARM',
        title: 'MM72 Farm',
        recommendedAction: claim,
        actions: {
          primary: claim,
          secondary: [],
          open: null,
          manage: action('MANAGE', 'Manage'),
          analytics: null,
        },
      }),
    ])
    renderDashboard(portfolio, true)

    expect(screen.getByTestId('portfolio-assistant-actions-list')).toBeTruthy()
    expect(screen.getAllByTestId('portfolio-assistant-action-item').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByTestId('portfolio-assistant-insight-text')).toHaveTextContent(
      'MM72 Farm has available actions.',
    )
    const open = screen.getByTestId('portfolio-assistant-nav-open')
    expect(open.getAttribute('href')).toBe('/farms/mm72')
    expect(open.getAttribute('data-nav-kind')).toBe('Open')
    expect(resolveAssistantNavLinks({
      label: 'Claim rewards',
      position: 'MM72 Farm',
      reason: null,
      route: '/farms/mm72',
      enabled: true,
      type: 'CLAIM',
    })).toEqual(['Open', 'View'])
  })

  it('TEST 5: No advice language', () => {
    const harvest = action('HARVEST', 'Harvest', { route: '/farms/h' })
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'f1',
        positionType: 'FARM',
        title: 'Farm',
        requiresAttention: true,
        recommendedAction: harvest,
        actions: {
          primary: harvest,
          secondary: [],
          open: null,
          manage: action('MANAGE', 'Manage'),
          analytics: null,
        },
      }),
    ])
    renderDashboard(portfolio, true)
    const panel = screen.getByTestId('portfolio-assistant-panel')
    const text = panel.textContent ?? ''
    expect(text.toLowerCase()).not.toMatch(
      /good investment|best opportunity|should buy|should sell|maximize yield/,
    )
  })

  it('TEST 6: Disconnected state', () => {
    const portfolio = buildPortfolio([
      stubPosition({ positionId: 'p1', positionType: 'FARM', title: 'Farm' }),
    ])
    renderDashboard(portfolio, false)

    const panel = screen.getByTestId('portfolio-assistant-panel')
    expect(panel.getAttribute('data-state')).toBe('DISCONNECTED')
    expect(screen.getByTestId('portfolio-assistant-state-copy')).toHaveTextContent(
      'Connect your wallet to view portfolio intelligence.',
    )
    expect(screen.queryByTestId('portfolio-assistant-actions')).toBeNull()
  })

  it('TEST 7: Empty state', () => {
    const portfolio = buildPortfolio([])
    renderDashboard(portfolio, true)

    expect(screen.getByTestId('portfolio-assistant-panel').getAttribute('data-state')).toBe('EMPTY')
    expect(screen.getByTestId('portfolio-assistant-state-copy')).toHaveTextContent(
      'No positions detected.',
    )
  })

  it('TEST 8: Partial state', () => {
    const portfolio = buildPortfolio(
      [stubPosition({ positionId: 'p1', positionType: 'LIQUIDITY', title: 'LP' })],
      {
        sectionStatus: {
          summary: { status: 'PARTIAL', updatedAt: null, errorCode: null, message: 'partial' },
          positions: { status: 'PARTIAL', updatedAt: null, errorCode: null, message: 'partial' },
          claimables: { status: 'READY', updatedAt: null, errorCode: null, message: null },
          approvals: { status: 'READY', updatedAt: null, errorCode: null, message: null },
          activity: { status: 'READY', updatedAt: null, errorCode: null, message: null },
        },
      },
    )
    renderDashboard(portfolio, true)

    expect(screen.getByTestId('portfolio-assistant-panel').getAttribute('data-state')).toBe('PARTIAL')
    expect(screen.getByTestId('portfolio-assistant-state-copy')).toHaveTextContent(
      'Some portfolio data is unavailable.',
    )
  })

  it('TEST 9: Mobile composition', () => {
    const portfolio = buildPortfolio([
      stubPosition({ positionId: 'p1', positionType: 'POOL', title: 'Pool' }),
    ])
    renderDashboard(portfolio, true)

    const body = screen.getByTestId('portfolio-assistant-body')
    expect(body.getAttribute('data-cc-layout')).toBe('assistant-stacked')
    const card = screen.getByTestId('portfolio-assistant-card')
    expect(card.getAttribute('data-desktop')).toBe('full-width')
    const style = window.getComputedStyle(body)
    expect(style.flexDirection === 'column' || body.getAttribute('data-cc-layout') === 'assistant-stacked').toBe(
      true,
    )
  })

  it('TEST 10: No duplicate intelligence sections', () => {
    const portfolio = buildPortfolio([
      stubPosition({ positionId: 'p1', positionType: 'FARM', title: 'Farm' }),
    ])
    const { container } = renderDashboard(portfolio, true)

    expect(screen.getAllByTestId('portfolio-intelligence-section')).toHaveLength(1)
    expect(screen.getAllByTestId('portfolio-assistant-panel')).toHaveLength(1)

    const intel = screen.getByTestId('portfolio-intelligence-section')
    const assistant = screen.getByTestId('portfolio-assistant-panel')
    const positions = screen.getByTestId('positions-center')
    const order = [intel, assistant, positions].map((el) =>
      Array.from(container.querySelectorAll('[data-testid]')).indexOf(el),
    )
    expect(order[0]).toBeLessThan(order[1])
    expect(order[1]).toBeLessThan(order[2])

    // Assistant is not a second Portfolio Intelligence section
    expect(within(assistant).queryByText('Portfolio Intelligence')).toBeNull()
    expect(within(assistant).getByText('AI Portfolio Assistant')).toBeTruthy()

    const ctx = buildPortfolioAssistantContext({
      portfolio,
      intelligence: buildPortfolioIntelligence({ portfolio, walletConnected: true }),
      walletConnected: true,
    })
    expect(buildPositionInsights(ctx)).toEqual([])
  })
})
