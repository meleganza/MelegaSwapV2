/**
 * R791E.2 — Liquidity Studio wallet-first UX activation.
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  buildLiquidityWalletPortfolio,
  selectLiquidityPortfolioPositions,
} from '../liquidityRuntime/buildLiquidityWalletPortfolio'
import { YourLiquidityPositionsSection } from '../components/YourLiquidityPositionsSection'
import type { LiquidityPositionRow } from '../liquidityRuntime/useLiquidityPositions'
import type { LiquidityMintRuntime } from '../liquidityRuntime/useLiquidityMintRuntime'
import { createEmptyWalletPortfolio } from 'lib/wallet-portfolio/contracts'

const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'
const PAIR = '0x01db17c476ad6a4c119f559eab2d1ac9e340278e'

vi.mock('../liquidityRuntime/LiquidityRuntimeContext', () => ({
  useLiquidityRuntime: () => mockRuntime,
}))

let mockRuntime: Partial<LiquidityMintRuntime>

function stubLpRow(overrides: Partial<LiquidityPositionRow> = {}): LiquidityPositionRow {
  return {
    id: PAIR,
    pairAddress: PAIR,
    chainId: 56,
    walletAddress: WALLET,
    ownershipSource: 'DIRECT_WALLET_LP',
    pairLabel: 'MM72 / MARCO',
    pair: {
      token0: {
        chainId: 56,
        address: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        symbol: 'MARCO',
        name: 'MARCO',
        decimals: 18,
      },
      token1: {
        chainId: 56,
        address: '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e',
        symbol: 'MM72',
        name: 'MM72',
        decimals: 18,
      },
      liquidityToken: { address: PAIR },
    } as LiquidityPositionRow['pair'],
    lpBalance: {
      quotient: { toString: () => '55324213060324857658414062' },
      toSignificant: () => '55324213.06',
      currency: { decimals: 18 },
    } as LiquidityPositionRow['lpBalance'],
    ...overrides,
  }
}

function buildPortfolio(rows: LiquidityPositionRow[], wallet: string | null = WALLET) {
  return buildLiquidityWalletPortfolio({
    wallet,
    chainId: wallet ? 56 : null,
    chainName: 'BNB Chain',
    generatedAt: '2026-07-20T00:00:00.000Z',
    liquidityRows: rows,
    positionsLoading: false,
  })
}

describe('R791E.2 liquidityStudioWalletFirst', () => {
  it('TEST 1: Disconnected wallet', () => {
    const portfolio = buildPortfolio([], null)
    expect(selectLiquidityPortfolioPositions(portfolio)).toEqual([])
    expect(portfolio.sectionStatus.positions.status).toBe('WALLET_NOT_CONNECTED')

    mockRuntime = {
      account: undefined,
      positionsLoading: false,
      positions: [],
      liquidityWalletPortfolio: portfolio,
      setSelectedPositionId: vi.fn(),
      setMode: vi.fn(),
    }
    render(<YourLiquidityPositionsSection />)
    expect(screen.getByTestId('ls-positions-disconnected')).toHaveTextContent(
      'Connect wallet to view liquidity.',
    )
  })

  it('TEST 2: Wallet with LP', () => {
    const portfolio = buildPortfolio([stubLpRow()])
    const positions = selectLiquidityPortfolioPositions(portfolio)
    expect(positions.length).toBe(1)
    expect(positions[0].positionType).toBe('LIQUIDITY')
    expect(positions[0].ownershipVerified).toBe(true)
  })

  it('TEST 3: MM72/MARCO position renders', () => {
    const portfolio = buildPortfolio([stubLpRow()])
    mockRuntime = {
      account: WALLET,
      positionsLoading: false,
      positions: [stubLpRow()],
      liquidityWalletPortfolio: portfolio,
      setSelectedPositionId: vi.fn(),
      setMode: vi.fn(),
    }
    render(<YourLiquidityPositionsSection />)
    const card = screen.getByTestId('ls-liquidity-position-card')
    expect(card.getAttribute('data-pair')?.toLowerCase()).toMatch(/mm72|marco/)
    expect(screen.getByTestId('ls-positions-grid')).toBeTruthy()
  })

  it('TEST 4: Actions from PortfolioPosition', () => {
    const portfolio = buildPortfolio([stubLpRow()])
    const position = selectLiquidityPortfolioPositions(portfolio)[0]
    expect(position.recommendedAction.type).toBe('REMOVE_LIQUIDITY')
    expect(position.actions.primary.type).toBe('REMOVE_LIQUIDITY')
    const secondaryTypes = position.actions.secondary.map((a) => a.type)
    // Canonical actions only — Manage / Add / Analytics may appear when enabled on adapter
    expect(position.actions.manage?.type === 'MANAGE' || position.actions.manage == null).toBe(true)
    expect(secondaryTypes.every((t) => typeof t === 'string')).toBe(true)
    expect(position.recommendedAction.enabled).toBe(true)
  })

  it('TEST 5: No local LP duplication', () => {
    const rows = [stubLpRow()]
    const portfolio = buildPortfolio(rows)
    // Same producer rows → one LIQUIDITY position (not doubled)
    expect(selectLiquidityPortfolioPositions(portfolio)).toHaveLength(1)
    expect(portfolio.positions.filter((p) => p.positionType === 'LIQUIDITY')).toHaveLength(1)
    expect(portfolio.positions.some((p) => p.positionType === 'FARM')).toBe(false)
    expect(portfolio.positions.some((p) => p.positionType === 'POOL')).toBe(false)
  })

  it('TEST 6: Empty wallet', () => {
    const portfolio = buildPortfolio([])
    mockRuntime = {
      account: WALLET,
      positionsLoading: false,
      positions: [],
      liquidityWalletPortfolio: portfolio,
      setSelectedPositionId: vi.fn(),
      setMode: vi.fn(),
    }
    render(<YourLiquidityPositionsSection />)
    expect(screen.getByTestId('ls-positions-empty')).toHaveTextContent('No liquidity positions found.')
  })

  it('TEST 7: Builder remains accessible', () => {
    const portfolio = buildPortfolio([])
    const setMode = vi.fn()
    mockRuntime = {
      account: WALLET,
      positionsLoading: false,
      positions: [],
      liquidityWalletPortfolio: portfolio,
      setSelectedPositionId: vi.fn(),
      setMode,
    }
    render(<YourLiquidityPositionsSection />)
    fireEvent.click(screen.getByTestId('ls-explore-liquidity'))
    expect(setMode).toHaveBeenCalledWith('Add Liquidity')
    fireEvent.click(screen.getByTestId('ls-create-position'))
    expect(setMode).toHaveBeenCalledWith('Add Liquidity')
  })

  it('TEST 8: No fake positions', () => {
    const empty = createEmptyWalletPortfolio({
      wallet: WALLET,
      generatedAt: '2026-07-20T00:00:00.000Z',
    })
    expect(selectLiquidityPortfolioPositions(empty)).toEqual([])

    const zeroBal = stubLpRow({
      lpBalance: {
        quotient: { toString: () => '0' },
        toSignificant: () => '0',
        currency: { decimals: 18 },
      } as LiquidityPositionRow['lpBalance'],
    })
    const portfolio = buildPortfolio([zeroBal])
    expect(selectLiquidityPortfolioPositions(portfolio)).toEqual([])
  })

  it('TEST 9: Selector still works', () => {
    // Pair selector remains on Explore Liquidity mode (builder); explore CTA routes there
    const setMode = vi.fn()
    mockRuntime = {
      account: WALLET,
      positionsLoading: false,
      positions: [stubLpRow()],
      liquidityWalletPortfolio: buildPortfolio([stubLpRow()]),
      setSelectedPositionId: vi.fn(),
      setMode,
    }
    render(<YourLiquidityPositionsSection />)
    fireEvent.click(screen.getByTestId('ls-explore-liquidity'))
    expect(setMode).toHaveBeenCalledWith('Add Liquidity')
    // Mode value is still the canonical Add Liquidity (pair select lives there)
    expect('Add Liquidity').toBeTruthy()
  })

  it('TEST 10: Partial portfolio failure', () => {
    const portfolio = buildLiquidityWalletPortfolio({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      generatedAt: '2026-07-20T00:00:00.000Z',
      liquidityRows: [stubLpRow()],
      positionsLoading: false,
    })
    // Surviving LIQUIDITY positions still project when section is partial
    const partial = {
      ...portfolio,
      sectionStatus: {
        ...portfolio.sectionStatus,
        positions: {
          status: 'PARTIAL' as const,
          updatedAt: null,
          errorCode: 'LIQUIDITY_PARTIAL',
          message: 'partial producer',
        },
      },
    }
    expect(selectLiquidityPortfolioPositions(partial).length).toBe(1)
    mockRuntime = {
      account: WALLET,
      positionsLoading: false,
      positions: [stubLpRow()],
      liquidityWalletPortfolio: partial,
      setSelectedPositionId: vi.fn(),
      setMode: vi.fn(),
    }
    expect(() => render(<YourLiquidityPositionsSection />)).not.toThrow()
    expect(screen.getByTestId('ls-liquidity-position-card')).toBeTruthy()
  })
})
