import React from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  groupMyPositionCards,
  projectMyPositionCard as projectRuntimeCard,
} from '../commandCenterPortfolioCutover'
import {
  DashboardSectionBoundary,
  PortfolioDashboard,
  PortfolioSummarySection,
  buildTodaysPriorities,
} from '../../components/PortfolioDashboard'

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

function buildDashboardProps(input: {
  walletConnected: boolean
  positions?: PortfolioPosition[]
  portfolioOverrides?: Partial<WalletPortfolio>
}) {
  const wallet = input.walletConnected ? '0xabc' : null
  const empty = createEmptyWalletPortfolio({
    wallet,
    generatedAt: '2026-07-18T00:00:00.000Z',
  })
  const positions = input.positions ?? []
  const portfolio: WalletPortfolio = {
    ...empty,
    ...input.portfolioOverrides,
    positions,
    summary: {
      netValueUsd: null,
      claimableValueUsd: null,
      activePositionCount: positions.filter((p) => p.status === 'ACTIVE').length,
      historicalPositionCount: positions.filter((p) => p.status === 'ENDED').length,
      attentionPositionCount: positions.filter((p) => p.requiresAttention).length,
      pendingActionCount: 0,
      ...input.portfolioOverrides?.summary,
    },
    claimables: input.portfolioOverrides?.claimables ?? [],
    quickActions: input.portfolioOverrides?.quickActions ?? [],
    recentActivity: input.portfolioOverrides?.recentActivity ?? [],
  }

  const myPositionsView = resolvePortfolioView(portfolio, 'MY_POSITIONS')
  const runtimeCards = myPositionsView.positions.map(projectRuntimeCard)
  const myPositionsGroups = groupMyPositionCards(runtimeCards)

  return {
    portfolio,
    walletConnected: input.walletConnected,
    myPositions: {
      myPositionsView,
      myPositionsGroups,
      myPositionsSummary: {
        totalPositions: runtimeCards.length,
        liquidityCount: myPositionsGroups.Liquidity.length,
        farmCount: myPositionsGroups.Farm.length,
        poolCount: myPositionsGroups.Pool.length,
        claimablePositions: 0,
        attentionPositions: 0,
      },
      myPositionsState: (!input.walletConnected
        ? 'WALLET_NOT_CONNECTED'
        : runtimeCards.length === 0
          ? 'EMPTY'
          : 'READY') as 'WALLET_NOT_CONNECTED' | 'EMPTY' | 'READY',
    },
  }
}

describe('R791D.4A Command Center Portfolio Dashboard', () => {
  it('TEST 1 — Summary renders from portfolio summary', () => {
    const props = buildDashboardProps({
      walletConnected: true,
      positions: [stubPosition({ positionId: 'p1', positionType: 'FARM', title: 'Farm' })],
      portfolioOverrides: {
        summary: {
          netValueUsd: '1200.5',
          claimableValueUsd: '12',
          activePositionCount: 3,
          historicalPositionCount: 1,
          attentionPositionCount: 1,
          pendingActionCount: 2,
        },
      },
    })
    render(<PortfolioDashboard {...props} />)
    expect(screen.getByTestId('summary-net-value').textContent).toBe('1200.5')
    expect(screen.getByTestId('summary-claimable-value').textContent).toBe('12')
    expect(screen.getByTestId('summary-active-positions').textContent).toBe('3')
    expect(screen.getByTestId('summary-historical-positions').textContent).toBe('1')
    expect(screen.getByTestId('summary-pending-actions').textContent).toBe('2')
  })

  it('TEST 2 — No manual summary calculations', () => {
    const source = readFileSync(
      path.resolve(__dirname, '../../components/PortfolioDashboard.tsx'),
      'utf8',
    )
    // Summary section must read summary.* — not recompute from positions
    expect(source).toMatch(/summary\.netValueUsd/)
    expect(source).toMatch(/summary\.activePositionCount/)
    expect(source).not.toMatch(/activePositionCount:\s*positions\.filter/)
    expect(source).not.toMatch(/reduce\(/)

    render(
      <PortfolioSummarySection
        walletConnected
        summary={{
          netValueUsd: null,
          claimableValueUsd: null,
          activePositionCount: 7,
          historicalPositionCount: 2,
          attentionPositionCount: 0,
          pendingActionCount: 4,
        }}
      />,
    )
    expect(screen.getByTestId('summary-net-value').textContent).toBe('Unavailable')
    expect(screen.getByTestId('summary-active-positions').textContent).toBe('7')
    expect(screen.getByTestId('summary-net-value').textContent).not.toBe('$0')
  })

  it("TEST 3 — Today's priorities consume canonical actions", () => {
    const harvest = action('HARVEST', 'Harvest')
    const manage = action('MANAGE', 'Manage')
    const positions = [
      stubPosition({
        positionId: 'farm-1',
        positionType: 'FARM',
        title: 'Priority Farm',
        requiresAttention: true,
        actions: { primary: harvest, secondary: [manage], open: null, manage, analytics: null },
        recommendedAction: harvest,
      }),
    ]
    const items = buildTodaysPriorities(positions)
    expect(items.some((i) => i.action.type === 'HARVEST')).toBe(true)
    expect(items.every((i) => ['CLAIM', 'HARVEST', 'WITHDRAW', 'REMOVE_LIQUIDITY', 'APPROVE'].includes(i.action.type))).toBe(
      true,
    )

    const props = buildDashboardProps({ walletConnected: true, positions })
    render(<PortfolioDashboard {...props} />)
    const priorities = screen.getByTestId('todays-priorities-list')
    expect(priorities).toBeTruthy()
    expect(priorities.querySelector('[aria-label="Harvest"]')).toBeTruthy()
  })

  it('TEST 4 — My Positions remains visible', () => {
    const props = buildDashboardProps({
      walletConnected: true,
      positions: [
        stubPosition({ positionId: 'liq-1', positionType: 'LIQUIDITY', title: 'LP Pair' }),
      ],
    })
    render(<PortfolioDashboard {...props} />)
    expect(screen.getByTestId('my-positions-section')).toBeTruthy()
    expect(screen.getByText('My Positions')).toBeTruthy()
    expect(screen.getByTestId('position-card')).toBeTruthy()
  })

  it('TEST 5 — Claimables consume portfolio claimables', () => {
    const claim = action('CLAIM', 'Claim')
    const props = buildDashboardProps({
      walletConnected: true,
      positions: [],
      portfolioOverrides: {
        claimables: [
          {
            id: 'c1',
            positionId: 'farm-1',
            sourceType: 'FARM',
            title: 'MARCO rewards',
            amount: '10',
            valueUsd: null,
            action: claim,
          },
        ],
      },
    })
    render(<PortfolioDashboard {...props} />)
    expect(screen.getByTestId('claimables-list')).toBeTruthy()
    expect(screen.getByText('MARCO rewards')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Claim' })).toBeTruthy()
  })

  it('TEST 6 — Quick Actions consume canonical actions', () => {
    const props = buildDashboardProps({
      walletConnected: true,
      positions: [],
      portfolioOverrides: {
        quickActions: [
          { id: 'qa1', label: 'Add Liquidity', href: '/liquidity-studio', frequencyRank: 1 },
          { id: 'qa2', label: 'Open Farms', href: '/farms', frequencyRank: 2 },
        ],
      },
    })
    render(<PortfolioDashboard {...props} />)
    expect(screen.getByTestId('quick-actions-list')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Add Liquidity' })).toHaveAttribute(
      'href',
      '/liquidity-studio',
    )
  })

  it('TEST 7 — Activity consumes portfolio activity', () => {
    const props = buildDashboardProps({
      walletConnected: true,
      positions: [],
      portfolioOverrides: {
        recentActivity: [
          {
            id: 'a1',
            kind: 'claim',
            label: 'Claimed MARCO',
            time: '1h ago',
            positionId: 'farm-1',
            href: null,
          },
        ],
      },
    })
    render(<PortfolioDashboard {...props} />)
    expect(screen.getByTestId('portfolio-activity-list')).toBeTruthy()
    expect(screen.getByText('Claimed MARCO')).toBeTruthy()
  })

  it('TEST 8 — Section failure isolation', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    function Boom(): null {
      throw new Error('claimables boom')
    }
    render(
      <div data-testid="shell">
        <DashboardSectionBoundary section="claimables">
          <Boom />
        </DashboardSectionBoundary>
        <div data-testid="summary-survives">summary ok</div>
      </div>,
    )
    expect(screen.getByTestId('dashboard-section-unavailable-claimables')).toBeTruthy()
    expect(screen.getByTestId('summary-survives')).toBeTruthy()
    spy.mockRestore()
  })

  it('TEST 9 — Disconnected wallet', () => {
    const props = buildDashboardProps({ walletConnected: false, positions: [] })
    render(<PortfolioDashboard {...props} />)
    const summary = screen.getByTestId('portfolio-summary-section')
    expect(summary).toHaveAttribute('data-state', 'WALLET_NOT_CONNECTED')
    expect(summary.textContent).toContain('Wallet not connected.')
    expect(screen.queryByTestId('portfolio-summary-grid')).toBeNull()
  })

  it('TEST 10 — Empty portfolio', () => {
    const props = buildDashboardProps({ walletConnected: true, positions: [] })
    render(<PortfolioDashboard {...props} />)
    expect(screen.getByTestId('portfolio-dashboard-empty').textContent).toContain('Portfolio empty')
    expect(screen.getByTestId('my-positions-section')).toHaveAttribute('data-state', 'EMPTY')
  })

  it('TEST 11 — No product root arrays', () => {
    const source = readFileSync(
      path.resolve(__dirname, '../../components/PortfolioDashboard.tsx'),
      'utf8',
    )
    expect(source).not.toMatch(/liquidityPositions/)
    expect(source).not.toMatch(/farmPositions/)
    expect(source).not.toMatch(/poolPositions/)
    expect(source).toMatch(/portfolio\.summary/)
    expect(source).toMatch(/portfolio\.claimables/)
    expect(source).toMatch(/portfolio\.quickActions/)
    expect(source).toMatch(/portfolio\.recentActivity/)

    const props = buildDashboardProps({
      walletConnected: true,
      positions: [stubPosition({ positionId: 'p1', positionType: 'POOL', title: 'P' })],
    })
    expect(props.portfolio.schema).toBe(WALLET_PORTFOLIO_SCHEMA)
    expect('liquidityPositions' in props.portfolio).toBe(false)
  })

  it('TEST 12 — No duplicate data fetching', () => {
    const source = readFileSync(
      path.resolve(__dirname, '../../components/PortfolioDashboard.tsx'),
      'utf8',
    )
    expect(source).not.toMatch(/\bfetch\s*\(/)
    expect(source).not.toMatch(/useEffect\s*\(/)
    expect(source).not.toMatch(/axios/)
    expect(source).not.toMatch(/useSWR/)
    expect(source).not.toMatch(/react-query/)
  })
})
