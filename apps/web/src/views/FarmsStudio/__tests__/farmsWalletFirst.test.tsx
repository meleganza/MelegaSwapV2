/**
 * R791E.3 — Farms Studio wallet-first UX activation.
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import {
  buildFarmsWalletPortfolio,
  selectFarmPortfolioPositions,
  selectMyFarmPortfolioPositions,
} from '../farmsRuntime/buildFarmsWalletPortfolio'
import { YourFarmsSection } from '../components/YourFarmsSection'
import type { FarmPreviewCard } from '../farmsStudioData'
import type { FarmsStakingRuntime } from '../farmsRuntime/useFarmsStakingRuntime'
import { createEmptyWalletPortfolio } from 'lib/wallet-portfolio/contracts'

const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'

vi.mock('../farmsRuntime/FarmsRuntimeContext', () => ({
  useFarmsRuntime: () => mockRuntime,
}))

let mockRuntime: Partial<FarmsStakingRuntime>

function stubFarm(overrides: Partial<FarmPreviewCard> = {}): FarmPreviewCard {
  return {
    id: 'farm-72',
    pair: 'MM72 Farm',
    tokens: ['MM72', 'MARCO'],
    status: 'live',
    tvl: '—',
    dailyRewards: '—',
    multiplier: '1X',
    liquidity: '—',
    pid: 72,
    userStaked: new BigNumber('1000000000000000000'),
    pendingReward: new BigNumber('500000000000000000'),
    rewardToken: 'MARCO',
    lpLabel: 'MM72-MARCO',
    ...overrides,
  }
}

function buildPortfolio(cards: FarmPreviewCard[], wallet: string | null = WALLET) {
  return buildFarmsWalletPortfolio({
    wallet,
    chainId: wallet ? 56 : null,
    chainName: 'BNB Chain',
    generatedAt: '2026-07-20T00:00:00.000Z',
    farmCards: cards,
    positionsLoading: false,
  })
}

const CANONICAL_ACTIONS = new Set([
  'HARVEST',
  'WITHDRAW',
  'MANAGE',
  'ANALYTICS',
  'OPEN',
  'CLAIM',
  'STAKE',
])

describe('R791E.3 farmsWalletFirst', () => {
  it('TEST 1: Disconnected wallet', () => {
    const portfolio = buildPortfolio([], null)
    expect(selectFarmPortfolioPositions(portfolio)).toEqual([])
    expect(portfolio.sectionStatus.positions.status).toBe('WALLET_NOT_CONNECTED')

    mockRuntime = {
      account: undefined,
      userDataLoaded: false,
      farmsWalletPortfolio: portfolio,
      portfolioViewMode: 'MY_FARMS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
    }
    render(<YourFarmsSection />)
    expect(screen.getByTestId('fs-farms-disconnected')).toHaveTextContent(
      'Connect wallet to view farms.',
    )
  })

  it('TEST 2: Wallet with farm position', () => {
    const portfolio = buildPortfolio([stubFarm()])
    const positions = selectMyFarmPortfolioPositions(portfolio)
    expect(positions.length).toBe(1)
    expect(positions[0].positionType).toBe('FARM')
    expect(positions[0].ownershipVerified).toBe(true)
  })

  it('TEST 3: MM72 Farm renders', () => {
    const portfolio = buildPortfolio([stubFarm()])
    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      farmsWalletPortfolio: portfolio,
      portfolioViewMode: 'MY_FARMS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
    }
    render(<YourFarmsSection />)
    const card = screen.getByTestId('fs-farm-position-card')
    expect(card.getAttribute('data-farm')?.toLowerCase()).toMatch(/mm72/)
    expect(screen.getByTestId('fs-farms-grid')).toBeTruthy()
  })

  it('TEST 4: Actions from PortfolioPosition only', () => {
    const portfolio = buildPortfolio([stubFarm()])
    const position = selectMyFarmPortfolioPositions(portfolio)[0]
    expect(CANONICAL_ACTIONS.has(position.actions.primary.type)).toBe(true)
    expect(CANONICAL_ACTIONS.has(position.recommendedAction.type)).toBe(true)
    const secondaryTypes = position.actions.secondary.map((a) => a.type)
    expect(secondaryTypes.every((t) => CANONICAL_ACTIONS.has(t))).toBe(true)
    if (position.actions.manage) {
      expect(position.actions.manage.type).toBe('MANAGE')
    }
    // Harvest available when producer pending rewards map to canonical HARVEST
    const allTypes = [position.actions.primary.type, ...secondaryTypes, position.recommendedAction.type]
    expect(allTypes).toContain('HARVEST')
    expect(allTypes.every((t) => CANONICAL_ACTIONS.has(t))).toBe(true)
  })

  it('TEST 5: No duplicate farm scanning', () => {
    const cards = [stubFarm()]
    const portfolio = buildPortfolio(cards)
    expect(selectFarmPortfolioPositions(portfolio)).toHaveLength(1)
    expect(portfolio.positions.filter((p) => p.positionType === 'FARM')).toHaveLength(1)
    expect(portfolio.positions.some((p) => p.positionType === 'LIQUIDITY')).toBe(false)
    expect(portfolio.positions.some((p) => p.positionType === 'POOL')).toBe(false)
    // Same producer cards → one FARM position (assembly only, no second scan)
    const again = buildPortfolio(cards)
    expect(selectFarmPortfolioPositions(again)).toHaveLength(1)
  })

  it('TEST 6: Empty wallet', () => {
    const portfolio = buildPortfolio([])
    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      farmsWalletPortfolio: portfolio,
      portfolioViewMode: 'MY_FARMS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
    }
    render(<YourFarmsSection />)
    expect(screen.getByTestId('fs-farms-empty')).toHaveTextContent('No farm positions found.')
  })

  it('TEST 7: All Farms view', () => {
    const portfolio = buildPortfolio([stubFarm()])
    const allView = selectFarmPortfolioPositions(portfolio)
    expect(allView.every((p) => p.positionType === 'FARM')).toBe(true)
    expect(allView).toHaveLength(1)

    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      farmsWalletPortfolio: portfolio,
      portfolioViewMode: 'ALL',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
    }
    render(<YourFarmsSection />)
    expect(screen.getByTestId('your-farms-section').getAttribute('data-portfolio-view')).toBe('ALL')
    expect(screen.getByTestId('fs-farm-position-card')).toBeTruthy()
  })

  it('TEST 8: My Farms view', () => {
    const portfolio = buildPortfolio([stubFarm()])
    const mine = selectMyFarmPortfolioPositions(portfolio)
    expect(mine.every((p) => p.positionType === 'FARM' && p.ownershipVerified)).toBe(true)

    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      farmsWalletPortfolio: portfolio,
      portfolioViewMode: 'MY_FARMS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
    }
    render(<YourFarmsSection />)
    expect(screen.getByTestId('your-farms-section').getAttribute('data-portfolio-view')).toBe(
      'MY_FARMS',
    )
  })

  it('TEST 9: Explore Farms remains accessible', () => {
    const portfolio = buildPortfolio([])
    const setPortfolioViewMode = vi.fn()
    const setFilter = vi.fn()
    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      farmsWalletPortfolio: portfolio,
      portfolioViewMode: 'MY_FARMS',
      setPortfolioViewMode,
      setFilter,
    }
    render(<YourFarmsSection />)
    fireEvent.click(screen.getByTestId('fs-explore-farms'))
    expect(setPortfolioViewMode).toHaveBeenCalledWith('ALL')
    expect(setFilter).toHaveBeenCalledWith('All')
  })

  it('TEST 10: Partial producer failure', () => {
    const portfolio = buildFarmsWalletPortfolio({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      generatedAt: '2026-07-20T00:00:00.000Z',
      farmCards: [stubFarm()],
      positionsLoading: false,
    })
    const partial = {
      ...portfolio,
      sectionStatus: {
        ...portfolio.sectionStatus,
        positions: {
          status: 'PARTIAL' as const,
          updatedAt: null,
          errorCode: 'FARM_PARTIAL',
          message: 'partial producer',
        },
      },
    }
    expect(selectMyFarmPortfolioPositions(partial).length).toBe(1)
    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      farmsWalletPortfolio: partial,
      portfolioViewMode: 'MY_FARMS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
    }
    expect(() => render(<YourFarmsSection />)).not.toThrow()
    expect(screen.getByTestId('fs-farm-position-card')).toBeTruthy()

    // Zero stake / empty portfolio must not invent farms
    const empty = createEmptyWalletPortfolio({
      wallet: WALLET,
      generatedAt: '2026-07-20T00:00:00.000Z',
    })
    expect(selectFarmPortfolioPositions(empty)).toEqual([])
    const zero = buildPortfolio([
      stubFarm({
        userStaked: new BigNumber(0),
        pendingReward: new BigNumber(0),
      }),
    ])
    expect(selectFarmPortfolioPositions(zero)).toEqual([])
  })
})
