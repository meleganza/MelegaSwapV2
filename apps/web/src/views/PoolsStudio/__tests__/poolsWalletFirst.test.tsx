/**
 * R791E.4 — Pools Studio wallet-first UX activation.
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import {
  buildPoolsWalletPortfolio,
  selectHistoricalPoolPortfolioPositions,
  selectMyPoolPortfolioPositions,
  selectPoolPortfolioPositions,
} from '../poolsRuntime/buildPoolsWalletPortfolio'
import { YourPoolsSection } from '../components/YourPoolsSection'
import type { PoolPreviewCard } from '../poolsStudioData'
import type { PoolsStakingRuntime } from '../poolsRuntime/usePoolsStakingRuntime'
import { createEmptyWalletPortfolio } from 'lib/wallet-portfolio/contracts'

const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'

vi.mock('../poolsRuntime/PoolsRuntimeContext', () => ({
  usePoolsRuntime: () => mockRuntime,
}))

let mockRuntime: Partial<PoolsStakingRuntime>

function stubPool(overrides: Partial<PoolPreviewCard> = {}): PoolPreviewCard {
  return {
    id: 'pool-0',
    name: 'MARCO Staking',
    tokens: ['MARCO'],
    stakeToken: 'MARCO',
    status: 'ended',
    displayStatus: 'ENDED',
    tvl: '—',
    rewardToken: 'MARCO',
    dailyRewards: '—',
    participants: '—',
    sousId: 0,
    contractAddress: '0xdddddddddddddddddddddddddddddddddddddddd',
    userStaked: new BigNumber('1000000000000000000000'),
    pendingReward: new BigNumber('250000000000000000'),
    ...overrides,
  }
}

function buildPortfolio(cards: PoolPreviewCard[], wallet: string | null = WALLET) {
  return buildPoolsWalletPortfolio({
    wallet,
    chainId: wallet ? 56 : null,
    chainName: 'BNB Chain',
    generatedAt: '2026-07-20T00:00:00.000Z',
    poolCards: cards,
    positionsLoading: false,
  })
}

const CANONICAL_ACTIONS = new Set([
  'CLAIM',
  'WITHDRAW',
  'MANAGE',
  'ANALYTICS',
  'OPEN',
  'STAKE',
  'NONE',
])

describe('R791E.4 poolsWalletFirst', () => {
  it('TEST 1: Disconnected wallet', () => {
    const portfolio = buildPortfolio([], null)
    expect(selectPoolPortfolioPositions(portfolio)).toEqual([])
    expect(portfolio.sectionStatus.positions.status).toBe('WALLET_NOT_CONNECTED')

    mockRuntime = {
      account: undefined,
      userDataLoaded: false,
      poolsWalletPortfolio: portfolio,
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
      setPoolTab: vi.fn(),
    }
    render(<YourPoolsSection />)
    expect(screen.getByTestId('ps-pools-disconnected')).toHaveTextContent(
      'Connect wallet to view pools.',
    )
  })

  it('TEST 2: Wallet with pool position', () => {
    const portfolio = buildPortfolio([stubPool()])
    const positions = selectMyPoolPortfolioPositions(portfolio)
    expect(positions.length).toBe(1)
    expect(positions[0].positionType).toBe('POOL')
    expect(positions[0].ownershipVerified).toBe(true)
  })

  it('TEST 3: MARCO Staking renders', () => {
    const portfolio = buildPortfolio([stubPool()])
    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      poolsWalletPortfolio: portfolio,
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
      setPoolTab: vi.fn(),
    }
    render(<YourPoolsSection />)
    const card = screen.getByTestId('ps-pool-position-card')
    expect(card.getAttribute('data-pool')?.toLowerCase()).toMatch(/marco/)
    expect(screen.getByTestId('ps-pools-grid')).toBeTruthy()
    // Ended historical ownership remains visible
    expect(card.getAttribute('data-lifecycle')).toBe('ENDED')
    expect(selectHistoricalPoolPortfolioPositions(portfolio).length).toBe(1)
  })

  it('TEST 4: Actions from PortfolioPosition only', () => {
    const portfolio = buildPortfolio([stubPool()])
    const position = selectMyPoolPortfolioPositions(portfolio)[0]
    expect(CANONICAL_ACTIONS.has(position.actions.primary.type)).toBe(true)
    expect(CANONICAL_ACTIONS.has(position.recommendedAction.type)).toBe(true)
    const secondaryTypes = position.actions.secondary.map((a) => a.type)
    expect(secondaryTypes.every((t) => CANONICAL_ACTIONS.has(t))).toBe(true)
    if (position.actions.manage) {
      expect(position.actions.manage.type).toBe('MANAGE')
    }
    const allTypes = [position.actions.primary.type, ...secondaryTypes, position.recommendedAction.type]
    expect(allTypes.some((t) => t === 'CLAIM' || t === 'WITHDRAW' || t === 'MANAGE')).toBe(true)
  })

  it('TEST 5: No duplicate pool scanning', () => {
    const cards = [stubPool()]
    const portfolio = buildPortfolio(cards)
    expect(selectPoolPortfolioPositions(portfolio)).toHaveLength(1)
    expect(portfolio.positions.filter((p) => p.positionType === 'POOL')).toHaveLength(1)
    expect(portfolio.positions.some((p) => p.positionType === 'LIQUIDITY')).toBe(false)
    expect(portfolio.positions.some((p) => p.positionType === 'FARM')).toBe(false)
    const again = buildPortfolio(cards)
    expect(selectPoolPortfolioPositions(again)).toHaveLength(1)
  })

  it('TEST 6: Empty wallet', () => {
    const portfolio = buildPortfolio([])
    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      poolsWalletPortfolio: portfolio,
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
      setPoolTab: vi.fn(),
    }
    render(<YourPoolsSection />)
    expect(screen.getByTestId('ps-pools-empty')).toHaveTextContent('No pool positions found.')
  })

  it('TEST 7: My Pools view', () => {
    const portfolio = buildPortfolio([stubPool()])
    const mine = selectMyPoolPortfolioPositions(portfolio)
    expect(mine.every((p) => p.positionType === 'POOL' && p.ownershipVerified)).toBe(true)

    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      poolsWalletPortfolio: portfolio,
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
      setPoolTab: vi.fn(),
    }
    render(<YourPoolsSection />)
    expect(screen.getByTestId('your-pools-section').getAttribute('data-portfolio-view')).toBe(
      'MY_POOLS',
    )
  })

  it('TEST 8: All Pools view', () => {
    const portfolio = buildPortfolio([stubPool()])
    const allView = selectPoolPortfolioPositions(portfolio)
    expect(allView.every((p) => p.positionType === 'POOL')).toBe(true)

    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      poolsWalletPortfolio: portfolio,
      portfolioViewMode: 'ALL',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
      setPoolTab: vi.fn(),
    }
    render(<YourPoolsSection />)
    expect(screen.getByTestId('your-pools-section').getAttribute('data-portfolio-view')).toBe('ALL')
    expect(screen.getByTestId('ps-pool-position-card')).toBeTruthy()
  })

  it('TEST 9: Explore Pools remains accessible', () => {
    const portfolio = buildPortfolio([])
    const setPortfolioViewMode = vi.fn()
    const setFilter = vi.fn()
    const setPoolTab = vi.fn()
    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      poolsWalletPortfolio: portfolio,
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode,
      setFilter,
      setPoolTab,
    }
    render(<YourPoolsSection />)
    fireEvent.click(screen.getByTestId('ps-explore-pools'))
    expect(setPortfolioViewMode).toHaveBeenCalledWith('ALL')
    expect(setFilter).toHaveBeenCalledWith('All')
    expect(setPoolTab).toHaveBeenCalledWith('all')
  })

  it('TEST 10: Partial producer failure', () => {
    const portfolio = buildPoolsWalletPortfolio({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      generatedAt: '2026-07-20T00:00:00.000Z',
      poolCards: [stubPool()],
      positionsLoading: false,
    })
    const partial = {
      ...portfolio,
      sectionStatus: {
        ...portfolio.sectionStatus,
        positions: {
          status: 'PARTIAL' as const,
          updatedAt: null,
          errorCode: 'POOL_PARTIAL',
          message: 'partial producer',
        },
      },
    }
    expect(selectMyPoolPortfolioPositions(partial).length).toBe(1)
    mockRuntime = {
      account: WALLET,
      userDataLoaded: true,
      poolsWalletPortfolio: partial,
      portfolioViewMode: 'MY_POOLS',
      setPortfolioViewMode: vi.fn(),
      setFilter: vi.fn(),
      setPoolTab: vi.fn(),
    }
    expect(() => render(<YourPoolsSection />)).not.toThrow()
    expect(screen.getByTestId('ps-pool-position-card')).toBeTruthy()

    const empty = createEmptyWalletPortfolio({
      wallet: WALLET,
      generatedAt: '2026-07-20T00:00:00.000Z',
    })
    expect(selectPoolPortfolioPositions(empty)).toEqual([])
    const zero = buildPortfolio([
      stubPool({
        userStaked: new BigNumber(0),
        pendingReward: new BigNumber(0),
      }),
    ])
    expect(selectPoolPortfolioPositions(zero)).toEqual([])
  })
})
