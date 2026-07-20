import React, { useState } from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  PORTFOLIO_POSITION_SCHEMA,
  createEmptyWalletPortfolio,
  createNonePortfolioAction,
  type PortfolioPosition,
  type PortfolioPositionAction,
  type WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
import { resolvePortfolioView, type PortfolioViewType } from 'lib/wallet-portfolio/viewEngine'
import {
  buildMyPositionsExperience,
  buildPortfolioViewSelectorModel,
  PORTFOLIO_VIEW_EMPTY_MESSAGE,
} from '../commandCenterPortfolioCutover'
import {
  DashboardSectionBoundary,
  PortfolioDashboard,
  PortfolioViewSelector,
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

const harvest = action('HARVEST', 'Harvest')

const FIXTURE_POSITIONS: PortfolioPosition[] = [
  stubPosition({ positionId: 'liq-1', positionType: 'LIQUIDITY', title: 'LP' }),
  stubPosition({
    positionId: 'farm-1',
    positionType: 'FARM',
    title: 'Farm',
    claimableValueUsd: '1',
    actions: { primary: harvest, secondary: [], open: null, manage: null, analytics: null },
    recommendedAction: harvest,
  }),
  stubPosition({ positionId: 'pool-1', positionType: 'POOL', title: 'Pool' }),
  stubPosition({ positionId: 'old-1', positionType: 'LIQUIDITY', title: 'Old', status: 'ENDED' }),
  stubPosition({
    positionId: 'attn-1',
    positionType: 'FARM',
    title: 'Attention',
    requiresAttention: true,
  }),
]

function portfolioWith(positions: PortfolioPosition[]): WalletPortfolio {
  const empty = createEmptyWalletPortfolio({
    wallet: '0xabc',
    generatedAt: '2026-07-18T00:00:00.000Z',
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

const FIXTURE = portfolioWith(FIXTURE_POSITIONS)

function buildProps(view: PortfolioViewType, portfolio: WalletPortfolio = FIXTURE) {
  const selector = buildPortfolioViewSelectorModel({ portfolio, currentView: view })
  const xp = buildMyPositionsExperience({
    portfolio,
    walletConnected: true,
    view,
  })
  return {
    portfolio,
    walletConnected: true,
    viewSelector: selector,
    myPositions: {
      myPositionsView: xp.myPositionsView,
      myPositionsGroups: xp.myPositionsGroups,
      myPositionsSummary: xp.myPositionsSummary,
      myPositionsState: xp.state,
    },
  }
}

function FilterHarness({ portfolio = FIXTURE }: { portfolio?: WalletPortfolio }) {
  const [view, setView] = useState<PortfolioViewType>('ALL')
  const props = buildProps(view, portfolio)
  return <PortfolioDashboard {...props} onSelectView={setView} />
}

describe('R791D.4B Command Center Global Portfolio Filter', () => {
  it('TEST 1 — Default view ALL', () => {
    const model = buildPortfolioViewSelectorModel({ portfolio: FIXTURE, currentView: 'ALL' })
    expect(model.currentView).toBe('ALL')
    expect(model.viewResult.view).toBe('ALL')
    expect(model.count).toBe(resolvePortfolioView(FIXTURE, 'ALL').count)
    render(<FilterHarness />)
    expect(screen.getByTestId('portfolio-view-selector').getAttribute('data-current-view')).toBe('ALL')
    expect(screen.getByTestId('portfolio-view-ALL').getAttribute('data-active')).toBe('true')
  })

  it('TEST 2 — Switch to MY_POSITIONS uses View Engine result', () => {
    const engine = resolvePortfolioView(FIXTURE, 'MY_POSITIONS')
    const model = buildPortfolioViewSelectorModel({ portfolio: FIXTURE, currentView: 'MY_POSITIONS' })
    expect(model.viewResult.positions.map((p) => p.positionId)).toEqual(engine.positions.map((p) => p.positionId))
    render(<FilterHarness />)
    fireEvent.click(screen.getByTestId('portfolio-view-MY_POSITIONS'))
    expect(screen.getByTestId('portfolio-view-selector').getAttribute('data-current-view')).toBe('MY_POSITIONS')
  })

  it('TEST 3 — Switch to CLAIMABLE uses canonical claimable view', () => {
    const engine = resolvePortfolioView(FIXTURE, 'CLAIMABLE')
    const model = buildPortfolioViewSelectorModel({ portfolio: FIXTURE, currentView: 'CLAIMABLE' })
    expect(model.viewResult.count).toBe(engine.count)
    expect(model.emptyMessage).toBe(PORTFOLIO_VIEW_EMPTY_MESSAGE.CLAIMABLE)
    render(<FilterHarness />)
    fireEvent.click(screen.getByTestId('portfolio-view-CLAIMABLE'))
    expect(screen.getByTestId('portfolio-view-selector').getAttribute('data-current-view')).toBe('CLAIMABLE')
  })

  it('TEST 4 — Switch to HISTORICAL', () => {
    const engine = resolvePortfolioView(FIXTURE, 'HISTORICAL')
    const model = buildPortfolioViewSelectorModel({ portfolio: FIXTURE, currentView: 'HISTORICAL' })
    expect(model.viewResult.count).toBe(engine.count)
    expect(model.emptyMessage).toBe('No historical positions.')
    render(<FilterHarness />)
    fireEvent.click(screen.getByTestId('portfolio-view-HISTORICAL'))
    expect(screen.getByTestId('portfolio-view-selector').getAttribute('data-current-view')).toBe('HISTORICAL')
  })

  it('TEST 5 — Switch to LIQUIDITY', () => {
    const engine = resolvePortfolioView(FIXTURE, 'LIQUIDITY')
    const xp = buildMyPositionsExperience({ portfolio: FIXTURE, walletConnected: true, view: 'LIQUIDITY' })
    expect(xp.myPositionsView.view).toBe('LIQUIDITY')
    expect(xp.myPositionsView.count).toBe(engine.count)
    render(<FilterHarness />)
    fireEvent.click(screen.getByTestId('portfolio-view-LIQUIDITY'))
    expect(screen.getByTestId('portfolio-view-selector').getAttribute('data-current-view')).toBe('LIQUIDITY')
  })

  it('TEST 6 — Switch to FARM', () => {
    const engine = resolvePortfolioView(FIXTURE, 'FARM')
    const model = buildPortfolioViewSelectorModel({ portfolio: FIXTURE, currentView: 'FARM' })
    expect(model.viewResult.count).toBe(engine.count)
    render(<FilterHarness />)
    fireEvent.click(screen.getByTestId('portfolio-view-FARM'))
    expect(screen.getByTestId('portfolio-view-selector').getAttribute('data-current-view')).toBe('FARM')
  })

  it('TEST 7 — Switch to POOL', () => {
    const engine = resolvePortfolioView(FIXTURE, 'POOL')
    const model = buildPortfolioViewSelectorModel({ portfolio: FIXTURE, currentView: 'POOL' })
    expect(model.viewResult.count).toBe(engine.count)
    render(<FilterHarness />)
    fireEvent.click(screen.getByTestId('portfolio-view-POOL'))
    expect(screen.getByTestId('portfolio-view-selector').getAttribute('data-current-view')).toBe('POOL')
  })

  it('TEST 8 — Empty view', () => {
    const empty = portfolioWith([])
    const model = buildPortfolioViewSelectorModel({ portfolio: empty, currentView: 'MY_POSITIONS' })
    expect(model.empty).toBe(true)
    expect(model.emptyMessage).toBe('No positions found.')
    render(<PortfolioDashboard {...buildProps('CLAIMABLE', empty)} />)
    expect(screen.getByTestId('portfolio-view-empty').textContent).toBe('No claimable rewards.')
  })

  it('TEST 9 — No local filtering in dashboard/selector', () => {
    const dash = readFileSync(path.resolve(__dirname, '../../components/PortfolioDashboard.tsx'), 'utf8')
    expect(dash).not.toMatch(/ownershipVerified\s*===/)
    expect(dash).not.toMatch(/positions\.filter\(/)
    expect(dash).toMatch(/viewSelector/)
    const modelSrc = readFileSync(path.resolve(__dirname, '../commandCenterPortfolioCutover.ts'), 'utf8')
    expect(modelSrc).toMatch(/buildPortfolioViewSelectorModel/)
    expect(modelSrc).toMatch(/resolveView\(input\.portfolio, view\)/)
  })

  it('TEST 10 — View selector survives section failure', () => {
    const Boom = () => {
      throw new Error('boom')
    }
    const model = buildPortfolioViewSelectorModel({ portfolio: FIXTURE, currentView: 'ALL' })
    render(
      <div>
        <PortfolioViewSelector model={model} />
        <DashboardSectionBoundary section="summary">
          <Boom />
        </DashboardSectionBoundary>
      </div>,
    )
    expect(screen.getByTestId('portfolio-view-selector')).toBeTruthy()
    expect(screen.getByTestId('dashboard-section-unavailable-summary')).toBeTruthy()
  })

  it('preserves summary / priorities / activity outside filter', () => {
    render(<PortfolioDashboard {...buildProps('FARM')} />)
    expect(screen.getByTestId('portfolio-summary-section')).toBeTruthy()
    expect(screen.getByTestId('todays-priorities-section')).toBeTruthy()
    expect(screen.getByTestId('portfolio-activity-section')).toBeTruthy()
    expect(screen.getByTestId('portfolio-view-selector')).toBeTruthy()
  })
})
