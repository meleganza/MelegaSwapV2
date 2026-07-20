/**
 * R791E.7 — Pools UX terminology alignment.
 *
 * Presentation labels only. Runtime modes (MY_POOLS / ALL) unchanged.
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { render, screen, fireEvent } from '@testing-library/react'
import { PoolsFilterRow } from '../components/PoolsFilterRow'
import { YourPoolsSection } from '../components/YourPoolsSection'
import { PoolsTabsRow } from '../components/PoolsTabsRow'
import { buildPoolsWalletPortfolio } from '../poolsRuntime/buildPoolsWalletPortfolio'
import type { PoolsStakingRuntime } from '../poolsRuntime/usePoolsStakingRuntime'

vi.mock('../poolsRuntime/PoolsRuntimeContext', () => ({
  usePoolsRuntime: () => mockRuntime,
}))

let mockRuntime: Partial<PoolsStakingRuntime>

const FILTER_SRC = readFileSync(
  path.resolve(__dirname, '../components/PoolsFilterRow.tsx'),
  'utf8',
)
const SECTION_SRC = readFileSync(
  path.resolve(__dirname, '../components/YourPoolsSection.tsx'),
  'utf8',
)
const TABS_SRC = readFileSync(path.resolve(__dirname, '../components/PoolsTabsRow.tsx'), 'utf8')

describe('R791E.7 poolsTerminologyAlignment', () => {
  it('TEST 1: No "My Pools" user-facing label', () => {
    mockRuntime = {
      filter: 'All',
      setFilter: vi.fn(),
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode: vi.fn(),
      poolTab: 'positions',
      setPoolTab: vi.fn(),
      positionsCount: 0,
    }
    render(<PoolsFilterRow />)
    render(<PoolsTabsRow />)
    expect(screen.queryByText('My Pools')).toBeNull()
    expect(FILTER_SRC).not.toMatch(/label:\s*'My Pools'/)
    expect(TABS_SRC).not.toMatch(/label:\s*'All Pools'/)
    expect(SECTION_SRC).not.toMatch(/>Your Pools</)
  })

  it('TEST 2: Owned position label uses approved terminology', () => {
    mockRuntime = {
      filter: 'All',
      setFilter: vi.fn(),
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode: vi.fn(),
      poolTab: 'positions',
      setPoolTab: vi.fn(),
      positionsCount: 2,
      account: undefined,
      userDataLoaded: false,
      poolsWalletPortfolio: buildPoolsWalletPortfolio({
        wallet: null,
        chainId: null,
        chainName: 'BNB Chain',
        generatedAt: '2026-07-20T00:00:00.000Z',
        poolCards: [],
      }),
    }
    render(<PoolsFilterRow />)
    expect(screen.getByTestId('ps-view-my-positions')).toHaveTextContent('My Positions')
    render(<YourPoolsSection />)
    expect(screen.getByText('Your Pool Positions')).toBeTruthy()
    render(<PoolsTabsRow />)
    expect(screen.getByText(/My Positions \(2\)/)).toBeTruthy()
  })

  it('TEST 3: Explore Pools remains', () => {
    const setPortfolioViewMode = vi.fn()
    const setFilter = vi.fn()
    const setPoolTab = vi.fn()
    mockRuntime = {
      filter: 'All',
      setFilter,
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode,
      setPoolTab,
      account: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      userDataLoaded: true,
      poolsWalletPortfolio: buildPoolsWalletPortfolio({
        wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
        chainId: 56,
        chainName: 'BNB Chain',
        generatedAt: '2026-07-20T00:00:00.000Z',
        poolCards: [],
      }),
      poolTab: 'positions',
      positionsCount: 0,
    }
    render(<YourPoolsSection />)
    expect(screen.getByTestId('ps-explore-pools')).toHaveTextContent('Explore Pools')
    fireEvent.click(screen.getByTestId('ps-explore-pools'))
    expect(setPortfolioViewMode).toHaveBeenCalledWith('ALL')

    render(<PoolsFilterRow />)
    expect(screen.getByTestId('ps-view-explore-pools')).toHaveTextContent('Explore Pools')
  })

  it('TEST 4: Empty states unchanged', () => {
    mockRuntime = {
      account: undefined,
      userDataLoaded: false,
      poolsWalletPortfolio: buildPoolsWalletPortfolio({
        wallet: null,
        chainId: null,
        chainName: 'BNB Chain',
        generatedAt: '2026-07-20T00:00:00.000Z',
        poolCards: [],
      }),
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
      setPoolTab: vi.fn(),
    }
    render(<YourPoolsSection />)
    expect(screen.getByTestId('ps-pools-disconnected')).toHaveTextContent(
      'Connect wallet to view pools.',
    )

    mockRuntime = {
      ...mockRuntime,
      account: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      userDataLoaded: true,
      poolsWalletPortfolio: buildPoolsWalletPortfolio({
        wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
        chainId: 56,
        chainName: 'BNB Chain',
        generatedAt: '2026-07-20T00:00:00.000Z',
        poolCards: [],
      }),
    }
    render(<YourPoolsSection />)
    expect(screen.getByTestId('ps-pools-empty')).toHaveTextContent('No pool positions found.')
    expect(screen.queryByText('No pools found.')).toBeNull()
  })

  it('TEST 5: Runtime identifiers unchanged', () => {
    expect(FILTER_SRC).toMatch(/mode:\s*'MY_POOLS'/)
    expect(FILTER_SRC).toMatch(/mode:\s*'ALL'/)
    expect(SECTION_SRC).toMatch(/portfolioViewMode === 'MY_POOLS'/)
    expect(SECTION_SRC).toMatch(/setPortfolioViewMode\('ALL'\)/)
    expect(TABS_SRC).toMatch(/id:\s*'positions'/)
    expect(TABS_SRC).toMatch(/id:\s*'all'/)
    expect(TABS_SRC).toMatch(/id:\s*'finished'/)
  })

  it('TEST 6: No filter logic changes', () => {
    const setPortfolioViewMode = vi.fn()
    const setFilter = vi.fn()
    mockRuntime = {
      filter: 'Official',
      setFilter,
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode,
      poolTab: 'positions',
      setPoolTab: vi.fn(),
      positionsCount: 0,
    }
    render(<PoolsFilterRow />)
    fireEvent.click(screen.getByTestId('ps-view-my-positions'))
    expect(setPortfolioViewMode).toHaveBeenCalledWith('MY_POOLS')
    fireEvent.click(screen.getByTestId('ps-view-explore-pools'))
    expect(setPortfolioViewMode).toHaveBeenCalledWith('ALL')
    // Explore chips still set ALL then filter — same wiring as R791E.4
    fireEvent.click(screen.getByText('Official'))
    expect(setPortfolioViewMode).toHaveBeenCalledWith('ALL')
    expect(setFilter).toHaveBeenCalledWith('Official')
  })
})
