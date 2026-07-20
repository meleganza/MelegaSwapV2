/**
 * R791E.8 — Liquidity Studio UX copy consistency.
 *
 * Presentation labels only. Runtime modes (My Positions / Add Liquidity / …) unchanged.
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import { YourLiquidityPositionsSection } from '../components/YourLiquidityPositionsSection'
import { LiquidityStudioPageHeader } from '../components/LiquidityStudioPageHeader'
import { buildLiquidityWalletPortfolio } from '../liquidityRuntime/buildLiquidityWalletPortfolio'
import type { LiquidityMintRuntime } from '../liquidityRuntime/useLiquidityMintRuntime'
import { createEmptyWalletPortfolio } from 'lib/wallet-portfolio/contracts'

vi.mock('../liquidityRuntime/LiquidityRuntimeContext', () => ({
  useLiquidityRuntime: () => mockRuntime,
}))

let mockRuntime: Partial<LiquidityMintRuntime>

const HEADER_SRC = readFileSync(
  path.resolve(__dirname, '../components/LiquidityStudioPageHeader.tsx'),
  'utf8',
)
const SECTION_SRC = readFileSync(
  path.resolve(__dirname, '../components/YourLiquidityPositionsSection.tsx'),
  'utf8',
)
const BUILDER_SRC = readFileSync(
  path.resolve(__dirname, '../components/LiquidityBuilderPanel.tsx'),
  'utf8',
)

function emptyPortfolio(wallet: string | null = null) {
  return buildLiquidityWalletPortfolio({
    wallet,
    chainId: wallet ? 56 : null,
    chainName: 'BNB Chain',
    generatedAt: '2026-07-20T00:00:00.000Z',
    liquidityRows: [],
    positionsLoading: false,
  })
}

describe('R791E.8 liquidityTerminologyAlignment', () => {
  it('TEST 1: No builder-first primary label', () => {
    expect(HEADER_SRC).not.toMatch(/label:\s*'Liquidity Builder'/)
    expect(HEADER_SRC).not.toMatch(/label:\s*'Builder'/)
    expect(HEADER_SRC).not.toMatch(/label:\s*'Create Liquidity'/)
    expect(SECTION_SRC).not.toMatch(/>Liquidity Builder</)
    expect(BUILDER_SRC).not.toMatch(/'Manage Position'/)
    expect(BUILDER_SRC).toMatch(/'Manage Liquidity'/)
    expect(BUILDER_SRC).toMatch(/'Explore Liquidity'/)
  })

  it('TEST 2: Your Liquidity Positions visible', () => {
    mockRuntime = {
      account: undefined,
      positionsLoading: false,
      positions: [],
      liquidityWalletPortfolio: emptyPortfolio(null),
      setSelectedPositionId: vi.fn(),
      setMode: vi.fn(),
      mode: 'My Positions',
    }
    render(<YourLiquidityPositionsSection />)
    expect(screen.getByText('Your Liquidity Positions')).toBeTruthy()
    expect(SECTION_SRC).toMatch(/>Your Liquidity Positions</)
    expect(BUILDER_SRC).toMatch(/Your Liquidity Positions/)
  })

  it('TEST 3: Explore Liquidity visible', () => {
    mockRuntime = {
      mode: 'My Positions',
      setMode: vi.fn(),
      account: undefined,
      positionsLoading: false,
      positions: [],
      liquidityWalletPortfolio: emptyPortfolio(null),
      setSelectedPositionId: vi.fn(),
    }
    render(<LiquidityStudioPageHeader />)
    expect(screen.getByTestId('ls-tab-explore')).toHaveTextContent('Explore Liquidity')
    render(<YourLiquidityPositionsSection />)
    expect(screen.getByTestId('ls-explore-liquidity')).toHaveTextContent('Explore Liquidity')
    expect(screen.getByTestId('ls-create-position')).toHaveTextContent('Create New Position')
  })

  it('TEST 4: Disconnected copy', () => {
    mockRuntime = {
      account: undefined,
      positionsLoading: false,
      positions: [],
      liquidityWalletPortfolio: emptyPortfolio(null),
      setSelectedPositionId: vi.fn(),
      setMode: vi.fn(),
      mode: 'My Positions',
    }
    render(<YourLiquidityPositionsSection />)
    expect(screen.getByTestId('ls-positions-disconnected')).toHaveTextContent(
      'Connect wallet to view liquidity.',
    )
    expect(BUILDER_SRC).toMatch(/Connect wallet to view liquidity\./)
    expect(BUILDER_SRC).not.toMatch(/Connect wallet to view positions\./)
  })

  it('TEST 5: Empty copy', () => {
    const portfolio = emptyPortfolio('0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513')
    mockRuntime = {
      account: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      positionsLoading: false,
      positions: [],
      liquidityWalletPortfolio: portfolio,
      setSelectedPositionId: vi.fn(),
      setMode: vi.fn(),
      mode: 'My Positions',
    }
    render(<YourLiquidityPositionsSection />)
    expect(screen.getByTestId('ls-positions-empty')).toHaveTextContent('No liquidity positions found.')
    expect(BUILDER_SRC).toMatch(/No liquidity positions found\./)
    expect(BUILDER_SRC).not.toMatch(/No wallet-held liquidity positions detected/)
    expect(screen.queryByText(/Explore opportunities/i)).toBeNull()
    expect(createEmptyWalletPortfolio({ wallet: '0xabc', generatedAt: '2026-07-20T00:00:00.000Z' }).positions).toEqual(
      [],
    )
  })

  it('TEST 6: Runtime identifiers unchanged', () => {
    expect(HEADER_SRC).toMatch(/mode:\s*'My Positions'/)
    expect(HEADER_SRC).toMatch(/mode:\s*'Add Liquidity'/)
    expect(HEADER_SRC).toMatch(/mode:\s*'Remove Liquidity'/)
    expect(HEADER_SRC).toMatch(/mode:\s*'Simulation'/)
    expect(SECTION_SRC).toMatch(/setMode\('Add Liquidity'\)/)
    expect(BUILDER_SRC).toMatch(/mode === 'My Positions'/)
    expect(BUILDER_SRC).toMatch(/mode === 'Remove Liquidity'/)
    expect(BUILDER_SRC).toMatch(/mode === 'Simulation'/)
  })
})
