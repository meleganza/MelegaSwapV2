import React from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import {
  PORTFOLIO_POSITION_SCHEMA,
  createEmptyWalletPortfolio,
  createNonePortfolioAction,
  type PortfolioPosition,
  type PortfolioPositionAction,
} from 'lib/wallet-portfolio/contracts'
import { resolvePortfolioView } from 'lib/wallet-portfolio/viewEngine'
import {
  groupMyPositionCards,
  projectMyPositionCard as projectRuntimeCard,
  type MyPositionsSummary,
} from '../commandCenterPortfolioCutover'
import {
  MyPositionsSection,
  SafePositionCardBoundary,
  resolveGroupCardModels,
} from '../../components/MyPositionsSection'

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

function emptySummary(over: Partial<MyPositionsSummary> = {}): MyPositionsSummary {
  return {
    totalPositions: 0,
    liquidityCount: 0,
    farmCount: 0,
    poolCount: 0,
    claimablePositions: 0,
    attentionPositions: 0,
    ...over,
  }
}

function buildReadyProps(positions: PortfolioPosition[]) {
  const empty = createEmptyWalletPortfolio({
    wallet: '0xabc',
    generatedAt: '2026-07-18T00:00:00.000Z',
  })
  const portfolio = { ...empty, positions }
  const myPositionsView = resolvePortfolioView(portfolio, 'MY_POSITIONS')
  const runtimeCards = myPositionsView.positions.map(projectRuntimeCard)
  const myPositionsGroups = groupMyPositionCards(runtimeCards)
  return {
    myPositionsView,
    myPositionsGroups,
    myPositionsSummary: emptySummary({
      totalPositions: runtimeCards.length,
      liquidityCount: myPositionsGroups.Liquidity.length,
      farmCount: myPositionsGroups.Farm.length,
      poolCount: myPositionsGroups.Pool.length,
      claimablePositions: resolvePortfolioView(
        { ...portfolio, positions: myPositionsView.positions },
        'CLAIMABLE',
      ).count,
      attentionPositions: resolvePortfolioView(
        { ...portfolio, positions: myPositionsView.positions },
        'NEEDS_ATTENTION',
      ).count,
    }),
    myPositionsState: 'READY' as const,
  }
}

describe('R791D.3H Command Center My Positions experience', () => {
  it('TEST 1 — Liquidity/Farm/Pool three groups render', () => {
    const harvest = action('HARVEST', 'Harvest')
    const remove = action('REMOVE_LIQUIDITY', 'Remove')
    const manage = action('MANAGE', 'Manage')
    const props = buildReadyProps([
      stubPosition({
        positionId: 'liq-1',
        positionType: 'LIQUIDITY',
        title: 'LP Pair',
        actions: { primary: manage, secondary: [remove], open: null, manage, analytics: null },
        recommendedAction: manage,
      }),
      stubPosition({
        positionId: 'farm-1',
        positionType: 'FARM',
        title: 'Farm A',
        claimableValueUsd: '2',
        actions: { primary: harvest, secondary: [manage], open: null, manage, analytics: null },
        recommendedAction: harvest,
      }),
      stubPosition({
        positionId: 'pool-1',
        positionType: 'POOL',
        title: 'Pool A',
      }),
    ])

    render(<MyPositionsSection {...props} />)
    expect(screen.getByTestId('my-positions-group-Liquidity')).toBeTruthy()
    expect(screen.getByTestId('my-positions-group-Farm')).toBeTruthy()
    expect(screen.getByTestId('my-positions-group-Pool')).toBeTruthy()
    expect(screen.getAllByTestId('position-card')).toHaveLength(3)
  })

  it('TEST 2 — PositionCard receives MyPositionCardModel only', () => {
    const props = buildReadyProps([
      stubPosition({ positionId: 'liq-1', positionType: 'LIQUIDITY', title: 'LP' }),
    ])
    const models = resolveGroupCardModels(props.myPositionsGroups.Liquidity, props.myPositionsView.positions)
    expect(models).toHaveLength(1)
    expect(models[0].identity).toBeTruthy()
    expect(models[0].identity.positionId).toBe('liq-1')
    expect(models[0].actions.primaryAction).toBeTruthy()
    expect(models[0].value).toBeTruthy()
    expect(models[0].claimables).toBeTruthy()
    // Not the runtime flat card shape
    expect((models[0] as unknown as { type?: string }).type).toBeUndefined()
    expect(models[0].positionType).toBe('LIQUIDITY')
  })

  it('TEST 3 — No product-specific card component used', () => {
    const source = readFileSync(
      path.resolve(__dirname, '../../components/MyPositionsSection.tsx'),
      'utf8',
    )
    expect(source).toMatch(/PositionCard/)
    expect(source).not.toMatch(/LiquidityCard/)
    expect(source).not.toMatch(/FarmCard/)
    expect(source).not.toMatch(/PoolCard/)
    expect(source).not.toMatch(/from 'views\/FarmsStudio/)
    expect(source).not.toMatch(/from 'views\/PoolsStudio/)
    expect(source).not.toMatch(/from 'views\/LiquidityStudio/)
  })

  it('TEST 4 — Empty wallet renders EMPTY', () => {
    const empty = createEmptyWalletPortfolio({
      wallet: '0xabc',
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    const myPositionsView = resolvePortfolioView(empty, 'MY_POSITIONS')
    render(
      <MyPositionsSection
        myPositionsView={myPositionsView}
        myPositionsGroups={{ Liquidity: [], Farm: [], Pool: [], Other: [] }}
        myPositionsSummary={emptySummary()}
        myPositionsState="EMPTY"
      />,
    )
    const emptyEl = screen.getByTestId('my-positions-empty')
    expect(emptyEl).toHaveAttribute('data-state', 'EMPTY')
    expect(emptyEl.textContent).toContain('No positions yet')
    expect(emptyEl.textContent).not.toContain('EMPTY')
    expect(screen.queryByTestId('position-card')).toBeNull()
  })

  it('TEST 5 — Disconnected wallet renders WALLET_NOT_CONNECTED', () => {
    const empty = createEmptyWalletPortfolio({
      wallet: null,
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    const myPositionsView = resolvePortfolioView(empty, 'MY_POSITIONS')
    render(
      <MyPositionsSection
        myPositionsView={myPositionsView}
        myPositionsGroups={{ Liquidity: [], Farm: [], Pool: [], Other: [] }}
        myPositionsSummary={emptySummary()}
        myPositionsState="WALLET_NOT_CONNECTED"
      />,
    )
    const emptyEl = screen.getByTestId('my-positions-empty')
    expect(emptyEl).toHaveAttribute('data-state', 'WALLET_NOT_CONNECTED')
    expect(emptyEl.textContent).toContain('Connect your wallet')
    expect(emptyEl.textContent).not.toContain('WALLET_NOT_CONNECTED')
  })

  it('TEST 6 — Claimable position exposes canonical action', () => {
    const harvest = action('HARVEST', 'Harvest')
    const manage = action('MANAGE', 'Manage')
    const props = buildReadyProps([
      stubPosition({
        positionId: 'farm-claim',
        positionType: 'FARM',
        title: 'Claimable Farm',
        claimableValueUsd: '4',
        actions: { primary: harvest, secondary: [manage], open: null, manage, analytics: null },
        recommendedAction: harvest,
      }),
    ])
    render(<MyPositionsSection {...props} />)
    expect(screen.getByRole('link', { name: 'Harvest' })).toBeTruthy()
    expect(screen.getByTestId('summary-claimable').textContent).toBe('1')
  })

  it('TEST 7 — Attention position is visible', () => {
    const props = buildReadyProps([
      stubPosition({
        positionId: 'attn-1',
        positionType: 'POOL',
        title: 'Needs Care',
        requiresAttention: true,
        reason: 'Approval expired',
      }),
    ])
    render(<MyPositionsSection {...props} />)
    expect(screen.getByTestId('attention-indicator')).toBeTruthy()
    expect(screen.getByTestId('attention-reason').textContent).toContain('Approval expired')
    expect(screen.getByTestId('summary-attention').textContent).toBe('1')
  })

  it('TEST 8 — Future position type appears in Other', () => {
    const props = buildReadyProps([
      stubPosition({
        positionId: 'vault-1',
        positionType: 'VAULT',
        title: 'Future Vault',
      }),
    ])
    render(<MyPositionsSection {...props} />)
    expect(screen.getByTestId('my-positions-group-Other')).toBeTruthy()
    expect(within(screen.getByTestId('my-positions-group-Other')).getByText('Future Vault')).toBeTruthy()
    expect(screen.queryByTestId('my-positions-group-Liquidity')).toBeNull()
  })

  it('TEST 9 — One broken position does not crash section', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    function Boom(): null {
      throw new Error('broken card')
    }
    expect(() =>
      render(
        <div data-testid="section-shell">
          <SafePositionCardBoundary positionId="bad">
            <Boom />
          </SafePositionCardBoundary>
          <div data-testid="sibling-ok">ok</div>
        </div>,
      ),
    ).not.toThrow()
    expect(screen.getByTestId('position-card-unavailable')).toBeTruthy()
    expect(screen.getByTestId('sibling-ok')).toBeTruthy()
    spy.mockRestore()
  })

  it('TEST 10 — No product root arrays consumed', () => {
    const source = readFileSync(
      path.resolve(__dirname, '../../components/MyPositionsSection.tsx'),
      'utf8',
    )
    expect(source).not.toMatch(/liquidityPositions/)
    expect(source).not.toMatch(/farmPositions/)
    expect(source).not.toMatch(/poolPositions/)
    expect(source).toMatch(/myPositionsView/)
    expect(source).toMatch(/myPositionsGroups/)

    const props = buildReadyProps([
      stubPosition({ positionId: 'liq-1', positionType: 'LIQUIDITY', title: 'LP' }),
    ])
    const root = props.myPositionsView as unknown as Record<string, unknown>
    expect('liquidityPositions' in root).toBe(false)
    expect('farmPositions' in root).toBe(false)
    expect('poolPositions' in root).toBe(false)
  })
})
