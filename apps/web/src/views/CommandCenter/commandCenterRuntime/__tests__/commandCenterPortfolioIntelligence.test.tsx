/**
 * R791D.4E — Command Center Portfolio Intelligence layer.
 */

import React from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
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
import {
  buildMyPositionsExperience,
  buildPortfolioViewSelectorModel,
} from '../commandCenterPortfolioCutover'
import {
  buildPortfolioIntelligence,
} from '../portfolioIntelligence'
import { PortfolioDashboard } from '../../components/PortfolioDashboard'

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

function buildPortfolio(positions: PortfolioPosition[], sectionOver?: Partial<WalletPortfolio['sectionStatus']>): WalletPortfolio {
  const empty = createEmptyWalletPortfolio({
    wallet: '0xabc',
    generatedAt: '2026-07-20T00:00:00.000Z',
  })
  return {
    ...empty,
    schema: WALLET_PORTFOLIO_SCHEMA,
    positions,
    sectionStatus: {
      ...empty.sectionStatus,
      ...sectionOver,
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

describe('R791D.4E Command Center Portfolio Intelligence', () => {
  it('TEST 1 — Attention position generates attention item', () => {
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'att-1',
        positionType: 'LIQUIDITY',
        title: 'Needs Approve',
        requiresAttention: true,
        reason: 'Approval required',
      }),
    ])
    const model = buildPortfolioIntelligence({ portfolio, walletConnected: true })
    expect(model.attentionItems.some((i) => i.positionId === 'att-1' && i.source === 'requiresAttention')).toBe(
      true,
    )
    renderDashboard(portfolio)
    expect(screen.getByTestId('intelligence-attention-item').textContent).toContain('Needs Approve')
  })

  it('TEST 2 — Claimable position generates action', () => {
    const claim = action('CLAIM', 'Claim', { priority: 1 })
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'pool-1',
        positionType: 'POOL',
        title: 'MARCO Pool',
        actions: { primary: claim, secondary: [], open: null, manage: null, analytics: null },
        recommendedAction: claim,
      }),
    ])
    const model = buildPortfolioIntelligence({ portfolio, walletConnected: true })
    expect(model.actionItems.some((i) => i.action.type === 'CLAIM' && i.positionId === 'pool-1')).toBe(true)
    renderDashboard(portfolio)
    expect(screen.getByTestId('intelligence-action-item')).toHaveAttribute('data-action-type', 'CLAIM')
  })

  it('TEST 3 — Unavailable section generates health item', () => {
    const portfolio = buildPortfolio([], {
      claimables: {
        status: 'UNAVAILABLE',
        updatedAt: null,
        errorCode: 'SECTION_DOWN',
        message: 'Claimables unavailable',
      },
    })
    // Empty positions → EMPTY state, but health still built for empty path... 
    // For UNAVAILABLE with empty positions, generatedState is EMPTY and healthItems still include section.
    const withPos = buildPortfolio(
      [stubPosition({ positionId: 'p1', positionType: 'FARM', title: 'F' })],
      {
        claimables: {
          status: 'UNAVAILABLE',
          updatedAt: null,
          errorCode: 'SECTION_DOWN',
          message: 'Claimables unavailable',
        },
      },
    )
    const model = buildPortfolioIntelligence({ portfolio: withPos, walletConnected: true })
    expect(model.healthItems.some((h) => h.kind === 'section' && h.section === 'claimables')).toBe(true)
    expect(model.attentionItems.some((a) => a.source === 'sectionStatus' && a.section === 'claimables')).toBe(
      true,
    )
  })

  it('TEST 4 — Ended position creates historical state', () => {
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'ended-1',
        positionType: 'FARM',
        title: 'Old Farm',
        status: 'ENDED',
      }),
    ])
    const model = buildPortfolioIntelligence({ portfolio, walletConnected: true })
    expect(model.summary.historicalCount).toBe(1)
    expect(model.healthItems.some((h) => h.kind === 'lifecycle' && h.detail === 'ENDED')).toBe(true)
  })

  it('TEST 5 — No investment language', () => {
    const src = readFileSync(path.resolve(__dirname, '../portfolioIntelligence.ts'), 'utf8')
    const ui = readFileSync(
      path.resolve(__dirname, '../../components/PortfolioIntelligenceSection.tsx'),
      'utf8',
    )
    for (const text of [src, ui]) {
      expect(text.toLowerCase()).not.toMatch(/investment advice/)
      expect(text.toLowerCase()).not.toMatch(/yield recommend/)
      expect(text.toLowerCase()).not.toMatch(/buy now/)
      expect(text.toLowerCase()).not.toMatch(/risk score/)
      expect(text.toLowerCase()).not.toMatch(/profit score/)
    }
  })

  it('TEST 6 — No manual calculations', () => {
    const src = readFileSync(path.resolve(__dirname, '../portfolioIntelligence.ts'), 'utf8')
    expect(src).not.toMatch(/netValueUsd\s*\+/)
    expect(src).not.toMatch(/parseFloat/)
    expect(src).not.toMatch(/Number\(/)
    expect(src).not.toMatch(/reduce\s*\(/)
    expect(src).toMatch(/requiresAttention/)
    expect(src).toMatch(/sectionStatus/)
  })

  it('TEST 7 — Disconnected state', () => {
    const empty = createEmptyWalletPortfolio({ wallet: null, generatedAt: '2026-07-20T00:00:00.000Z' })
    const model = buildPortfolioIntelligence({ portfolio: empty, walletConnected: false })
    expect(model.generatedState).toBe('WALLET_NOT_CONNECTED')
    renderDashboard(empty, false)
    expect(screen.getByTestId('portfolio-intelligence-section')).toHaveAttribute(
      'data-state',
      'WALLET_NOT_CONNECTED',
    )
    expect(screen.getByTestId('portfolio-intelligence-empty').textContent).toContain('Wallet not connected')
  })

  it('TEST 8 — Empty portfolio', () => {
    const empty = createEmptyWalletPortfolio({ wallet: '0xabc', generatedAt: '2026-07-20T00:00:00.000Z' })
    const model = buildPortfolioIntelligence({ portfolio: empty, walletConnected: true })
    expect(model.generatedState).toBe('EMPTY')
    renderDashboard(empty)
    expect(screen.getByTestId('portfolio-intelligence-empty').textContent).toContain(
      'No intelligence available',
    )
  })

  it('TEST 9 — Multiple positions aggregate', () => {
    const harvest = action('HARVEST', 'Harvest', { priority: 1 })
    const remove = action('REMOVE_LIQUIDITY', 'Remove Liquidity', { priority: 2 })
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'a',
        positionType: 'FARM',
        title: 'Farm A',
        requiresAttention: true,
        reason: 'Unlock',
        actions: { primary: harvest, secondary: [], open: null, manage: null, analytics: null },
        recommendedAction: harvest,
      }),
      stubPosition({
        positionId: 'b',
        positionType: 'LIQUIDITY',
        title: 'LP B',
        actions: { primary: remove, secondary: [], open: null, manage: null, analytics: null },
        recommendedAction: remove,
      }),
      stubPosition({
        positionId: 'c',
        positionType: 'POOL',
        title: 'Pool C',
        status: 'ENDED',
      }),
    ])
    const model = buildPortfolioIntelligence({ portfolio, walletConnected: true })
    expect(model.summary.activePositions).toBe(2)
    expect(model.summary.attentionCount).toBe(1)
    expect(model.summary.actionCount).toBe(2)
    expect(model.summary.historicalCount).toBe(1)
    expect(model.summary.claimableCount).toBe(1)
  })

  it('TEST 10 — Future position type does not break', () => {
    const portfolio = buildPortfolio([
      stubPosition({
        positionId: 'vault-1',
        positionType: 'VAULT',
        title: 'Future Vault',
        requiresAttention: true,
        reason: 'Incomplete metadata',
        dataState: 'UNAVAILABLE',
      }),
    ])
    expect(() => buildPortfolioIntelligence({ portfolio, walletConnected: true })).not.toThrow()
    const model = buildPortfolioIntelligence({ portfolio, walletConnected: true })
    expect(model.generatedState).toBe('READY')
    expect(model.attentionItems[0]?.positionId).toBe('vault-1')
    expect(model.summary.unavailableCount).toBe(1)
    renderDashboard(portfolio)
    expect(screen.getByTestId('portfolio-intelligence-section')).toHaveAttribute('data-state', 'READY')
    expect(screen.getByTestId('portfolio-hero')).toBeTruthy()
    expect(screen.getByTestId('portfolio-actions')).toBeTruthy()
    expect(screen.getByTestId('positions-center')).toBeTruthy()
  })
})
