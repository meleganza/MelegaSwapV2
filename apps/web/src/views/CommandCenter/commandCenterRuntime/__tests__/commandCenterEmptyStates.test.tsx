/**
 * R791E.6 — Command Center humanized empty states.
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  CommandCenterHumanizedEmpty,
  resolveCommandCenterEmptyPresentation,
} from '../../components/commandCenterEmptyStatePresentation'
import { MyPositionsSection } from '../../components/MyPositionsSection'
import { PortfolioHero } from '../../components/portfolioComposition'
import { ClaimablesSection, QuickActionsSection } from '../../components/PortfolioDashboard'
import { createEmptyWalletPortfolio } from 'lib/wallet-portfolio/contracts'
import type { MyPositionsGroups } from '../commandCenterPortfolioCutover'

vi.mock('components/ConnectWalletButton', () => ({
  default: ({ children, ...props }: { children?: React.ReactNode }) => (
    <button type="button" data-testid="cc-empty-connect-cta" {...props}>
      {children ?? 'Connect Wallet'}
    </button>
  ),
}))

const EMPTY_SUMMARY = {
  totalPositions: 0,
  liquidityCount: 0,
  farmCount: 0,
  poolCount: 0,
  claimablePositions: 0,
  attentionPositions: 0,
}

const EMPTY_GROUPS: MyPositionsGroups = { Liquidity: [], Farm: [], Pool: [], Other: [] }
const EMPTY_VIEW = { positions: [], view: 'MY_POSITIONS', empty: true, emptyMessage: '' } as never

const ENUM_LEAKS = ['WALLET_NOT_CONNECTED', 'EMPTY', 'PARTIAL', 'UNAVAILABLE'] as const

function assertNoEnumLeak(text: string) {
  for (const enumToken of ENUM_LEAKS) {
    expect(text).not.toContain(enumToken)
  }
}

describe('R791E.6 commandCenterEmptyStates', () => {
  it('TEST 1: Disconnected state humanized', () => {
    const copy = resolveCommandCenterEmptyPresentation('WALLET_NOT_CONNECTED')
    expect(copy.title).toBe('Connect your wallet')
    expect(copy.description).toBe(
      'View your liquidity, farms, pools and rewards in one place.',
    )
    expect(copy.cta).toBe('Connect Wallet')

    render(<CommandCenterHumanizedEmpty state="WALLET_NOT_CONNECTED" testId="empty-disconnected" />)
    expect(screen.getByTestId('empty-disconnected-title')).toHaveTextContent('Connect your wallet')
    expect(screen.getByTestId('empty-disconnected-description')).toHaveTextContent(
      'View your liquidity, farms, pools and rewards in one place.',
    )
  })

  it('TEST 2: Empty state humanized', () => {
    const copy = resolveCommandCenterEmptyPresentation('EMPTY')
    expect(copy.title).toBe('No positions yet')
    expect(copy.description).toBe(
      'Your liquidity, farms and pools will appear here once you participate.',
    )
    expect(copy.cta).toBeNull()

    render(
      <MyPositionsSection
        myPositionsState="EMPTY"
        myPositionsView={EMPTY_VIEW}
        myPositionsGroups={EMPTY_GROUPS}
        myPositionsSummary={EMPTY_SUMMARY}
      />,
    )
    expect(screen.getByTestId('my-positions-empty-title')).toHaveTextContent('No positions yet')
    assertNoEnumLeak(screen.getByTestId('my-positions-empty').textContent ?? '')
  })

  it('TEST 3: Partial state humanized', () => {
    const copy = resolveCommandCenterEmptyPresentation('PARTIAL')
    expect(copy.title).toBe('Some data is unavailable')
    expect(copy.description).toBe('Some portfolio information could not be loaded.')

    render(<CommandCenterHumanizedEmpty state="PARTIAL" testId="empty-partial" />)
    expect(screen.getByTestId('empty-partial-title')).toHaveTextContent('Some data is unavailable')
    assertNoEnumLeak(screen.getByTestId('empty-partial').textContent ?? '')
  })

  it('TEST 4: Unavailable state humanized', () => {
    const copy = resolveCommandCenterEmptyPresentation('UNAVAILABLE')
    expect(copy.title).toBe('Portfolio unavailable')
    expect(copy.description).toBe('Portfolio data is temporarily unavailable.')

    render(<CommandCenterHumanizedEmpty state="UNAVAILABLE" testId="empty-unavailable" />)
    expect(screen.getByTestId('empty-unavailable-title')).toHaveTextContent('Portfolio unavailable')
    assertNoEnumLeak(screen.getByTestId('empty-unavailable').textContent ?? '')
  })

  it('TEST 5: Runtime enums not visible', () => {
    render(
      <MyPositionsSection
        myPositionsState="WALLET_NOT_CONNECTED"
        myPositionsView={EMPTY_VIEW}
        myPositionsGroups={EMPTY_GROUPS}
        myPositionsSummary={EMPTY_SUMMARY}
      />,
    )
    const empty = screen.getByTestId('my-positions-empty')
    assertNoEnumLeak(empty.textContent ?? '')
    // Runtime attribute preserved for machines/tests
    expect(empty).toHaveAttribute('data-empty-runtime', 'WALLET_NOT_CONNECTED')
    expect(screen.getByTestId('my-positions-section')).toHaveAttribute(
      'data-state',
      'WALLET_NOT_CONNECTED',
    )
  })

  it('TEST 6: Connect CTA preserved', () => {
    render(<CommandCenterHumanizedEmpty state="WALLET_NOT_CONNECTED" testId="cta-check" />)
    const cta = screen.getByTestId('cc-empty-connect-cta')
    expect(cta).toHaveTextContent('Connect Wallet')

    render(<ClaimablesSection claimables={[]} walletConnected={false} />)
    expect(screen.getAllByTestId('cc-empty-connect-cta').length).toBeGreaterThanOrEqual(1)
  })

  it('TEST 7: No fake positions', () => {
    render(
      <MyPositionsSection
        myPositionsState="EMPTY"
        myPositionsView={EMPTY_VIEW}
        myPositionsGroups={EMPTY_GROUPS}
        myPositionsSummary={EMPTY_SUMMARY}
      />,
    )
    expect(screen.queryByTestId(/my-positions-group-/)).toBeNull()
    expect(screen.getByTestId('my-positions-empty-description').textContent).not.toMatch(
      /recommend|featured|opportunity|discover/i,
    )

    render(<QuickActionsSection quickActions={[]} walletConnected={true} />)
    expect(screen.getByTestId('quick-actions-empty-title')).toHaveTextContent('No positions yet')
  })

  it('TEST 8: Existing connected portfolio unaffected', () => {
    const portfolio = createEmptyWalletPortfolio({
      wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      generatedAt: '2026-07-20T00:00:00.000Z',
    })
    const withSummary = {
      ...portfolio,
      summary: {
        ...portfolio.summary,
        netValueUsd: '100.00',
        activePositionCount: 2,
        pendingActionCount: 1,
        claimableValueUsd: '5.00',
      },
    }
    render(<PortfolioHero portfolio={withSummary} walletConnected={true} />)
    expect(screen.getByTestId('portfolio-hero')).toHaveAttribute('data-state', 'READY')
    expect(screen.getByTestId('summary-net-value')).toHaveTextContent('100.00')
    expect(screen.queryByTestId('portfolio-hero-empty')).toBeNull()
    expect(screen.queryByTestId('cc-empty-connect-cta')).toBeNull()
  })
})
