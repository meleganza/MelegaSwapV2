import { describe, expect, it, vi } from 'vitest'
import {
  PORTFOLIO_POSITION_SCHEMA,
  WALLET_PORTFOLIO_SCHEMA,
  createEmptyWalletPortfolio,
  createNonePortfolioAction,
  type PortfolioPosition,
  type WalletPortfolio,
} from '../contracts'
import { comparePortfolioPositions, createWalletPortfolio } from '../portfolioService'

function stubPosition(overrides: Partial<PortfolioPosition> & Pick<PortfolioPosition, 'positionId' | 'positionType' | 'title'>): PortfolioPosition {
  const none = createNonePortfolioAction()
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
    recommendedAction: none,
    riskLevel: null,
    health: null,
    priority: 0,
    reason: null,
    actions: { primary: none, secondary: [], open: null, manage: null, analytics: null },
    productRoute: null,
    openRoute: null,
    manageRoute: null,
    analyticsRoute: null,
    producer: 'test',
    observedAt: null,
    blockNumber: null,
    confidence: null,
    dataState: 'PARTIAL',
    ...overrides,
  }
}

const emptySections = createEmptyWalletPortfolio({
  wallet: null,
  generatedAt: '2026-07-18T00:00:00.000Z',
}).sectionStatus

describe('R791D.3A portfolioService skeleton', () => {
  it('merges liquidity/farm/pool into one positions[]', () => {
    const portfolio = createWalletPortfolio({
      wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      generatedAt: '2026-07-18T12:00:00.000Z',
      summary: {
        netValueUsd: null,
        claimableValueUsd: null,
        activePositionCount: 3,
        historicalPositionCount: 0,
        attentionPositionCount: 1,
        pendingActionCount: 1,
      },
      liquidityPositions: [stubPosition({ positionId: 'liq-1', positionType: 'LIQUIDITY', title: 'MM72 / MARCO' })],
      farmPositions: [stubPosition({ positionId: 'farm-1', positionType: 'FARM', title: 'MM72 Farm' })],
      poolPositions: [stubPosition({ positionId: 'pool-1', positionType: 'POOL', title: 'MARCO Staking' })],
      claimables: [],
      approvals: [],
      recentActivity: [],
      quickActions: [],
      sectionStatus: emptySections,
    })

    expect(portfolio.schema).toBe(WALLET_PORTFOLIO_SCHEMA)
    expect(portfolio.positions).toHaveLength(3)
    expect(portfolio.positions.map((p) => p.positionType).sort()).toEqual(['FARM', 'LIQUIDITY', 'POOL'].sort())
  })

  it('ordering is deterministic: importance → attention → lifecycle → type → title', () => {
    const positions = [
      stubPosition({ positionId: 'a', positionType: 'POOL', title: 'Z Pool', importance: 'NORMAL', requiresAttention: false, status: 'ACTIVE' }),
      stubPosition({ positionId: 'b', positionType: 'LIQUIDITY', title: 'A LP', importance: 'HIGH', requiresAttention: false, status: 'ACTIVE' }),
      stubPosition({ positionId: 'c', positionType: 'FARM', title: 'B Farm', importance: 'HIGH', requiresAttention: true, status: 'ACTIVE' }),
      stubPosition({ positionId: 'd', positionType: 'LIQUIDITY', title: 'C LP', importance: 'HIGH', requiresAttention: false, status: 'ENDED' }),
    ]
    const sorted = [...positions].sort(comparePortfolioPositions)
    expect(sorted.map((p) => p.positionId)).toEqual(['c', 'b', 'd', 'a'])
  })

  it('product arrays absent at root', () => {
    const portfolio = createWalletPortfolio({
      wallet: '0xabc',
      generatedAt: '2026-07-18T12:00:00.000Z',
      summary: {
        netValueUsd: null,
        claimableValueUsd: null,
        activePositionCount: 0,
        historicalPositionCount: 0,
        attentionPositionCount: 0,
        pendingActionCount: 0,
      },
      liquidityPositions: [stubPosition({ positionId: 'liq-1', positionType: 'LIQUIDITY', title: 'A / B' })],
      farmPositions: [],
      poolPositions: [],
      claimables: [],
      approvals: [],
      recentActivity: [],
      quickActions: [],
      sectionStatus: emptySections,
    }) as WalletPortfolio & Record<string, unknown>

    expect(Array.isArray(portfolio.positions)).toBe(true)
    expect('liquidityPositions' in portfolio).toBe(false)
    expect('farmPositions' in portfolio).toBe(false)
    expect('poolPositions' in portfolio).toBe(false)
    expect('liquidity' in portfolio).toBe(false)
    expect('farms' in portfolio).toBe(false)
    expect('pools' in portfolio).toBe(false)
  })

  it('purity: no Date.now, no fetch, no input mutation, new arrays', () => {
    const dateSpy = vi.spyOn(Date, 'now')
    const fetchSpy = typeof globalThis.fetch === 'function' ? vi.spyOn(globalThis, 'fetch') : null
    const liquidity = [stubPosition({ positionId: 'liq-1', positionType: 'LIQUIDITY', title: 'A / B' })]
    const input = {
      wallet: '0xAbc',
      generatedAt: '2026-07-18T12:00:00.000Z',
      summary: {
        netValueUsd: null,
        claimableValueUsd: null,
        activePositionCount: 1,
        historicalPositionCount: 0,
        attentionPositionCount: 0,
        pendingActionCount: 0,
      },
      liquidityPositions: liquidity,
      farmPositions: [] as PortfolioPosition[],
      poolPositions: [] as PortfolioPosition[],
      claimables: [],
      approvals: [],
      recentActivity: [],
      quickActions: [],
      sectionStatus: emptySections,
    }
    const frozen = JSON.stringify(input)
    const a = createWalletPortfolio(input)
    const b = createWalletPortfolio(input)
    expect(JSON.stringify(input)).toBe(frozen)
    expect(a.positions).not.toBe(b.positions)
    expect(a.positions).not.toBe(liquidity)
    expect(dateSpy).not.toHaveBeenCalled()
    if (fetchSpy) {
      expect(fetchSpy).not.toHaveBeenCalled()
      fetchSpy.mockRestore()
    }
    dateSpy.mockRestore()
  })

  it('stable output for identical inputs', () => {
    const input = {
      wallet: '0xabc',
      generatedAt: '2026-07-18T12:00:00.000Z',
      summary: {
        netValueUsd: '$1',
        claimableValueUsd: null,
        activePositionCount: 2,
        historicalPositionCount: 0,
        attentionPositionCount: 0,
        pendingActionCount: 0,
      },
      liquidityPositions: [
        stubPosition({ positionId: 'liq-2', positionType: 'LIQUIDITY' as const, title: 'B / C' }),
        stubPosition({ positionId: 'liq-1', positionType: 'LIQUIDITY' as const, title: 'A / B' }),
      ],
      farmPositions: [stubPosition({ positionId: 'farm-1', positionType: 'FARM' as const, title: 'Farm' })],
      poolPositions: [] as PortfolioPosition[],
      claimables: [],
      approvals: [],
      recentActivity: [],
      quickActions: [],
      sectionStatus: emptySections,
    }
    const a = createWalletPortfolio(input)
    const b = createWalletPortfolio(input)
    expect(a.positions.map((p) => p.positionId)).toEqual(b.positions.map((p) => p.positionId))
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('summary passthrough without recalculation', () => {
    const summary = {
      netValueUsd: null,
      claimableValueUsd: '$12',
      activePositionCount: 99,
      historicalPositionCount: 3,
      attentionPositionCount: 2,
      pendingActionCount: 7,
    }
    const portfolio = createWalletPortfolio({
      wallet: null,
      generatedAt: '2026-07-18T12:00:00.000Z',
      summary,
      liquidityPositions: [],
      farmPositions: [],
      poolPositions: [],
      claimables: [],
      approvals: [],
      recentActivity: [],
      quickActions: [],
      sectionStatus: emptySections,
    })
    expect(portfolio.summary).toEqual(summary)
    expect(portfolio.summary).not.toBe(summary)
  })

  it('sectionStatus passthrough', () => {
    const sectionStatus = {
      summary: { status: 'READY' as const, updatedAt: 't', errorCode: null, message: null },
      positions: { status: 'PARTIAL' as const, updatedAt: 't', errorCode: 'X', message: 'partial' },
      claimables: { status: 'EMPTY' as const, updatedAt: null, errorCode: null, message: null },
      approvals: { status: 'EMPTY' as const, updatedAt: null, errorCode: null, message: null },
      activity: { status: 'LOADING' as const, updatedAt: null, errorCode: null, message: null },
    }
    const portfolio = createWalletPortfolio({
      wallet: '0xabc',
      generatedAt: '2026-07-18T12:00:00.000Z',
      summary: {
        netValueUsd: null,
        claimableValueUsd: null,
        activePositionCount: 0,
        historicalPositionCount: 0,
        attentionPositionCount: 0,
        pendingActionCount: 0,
      },
      liquidityPositions: [],
      farmPositions: [],
      poolPositions: [],
      claimables: [],
      approvals: [],
      recentActivity: [],
      quickActions: [],
      sectionStatus,
    })
    expect(portfolio.sectionStatus).toEqual(sectionStatus)
    expect(portfolio.sectionStatus).not.toBe(sectionStatus)
  })

  it('empty portfolio when all product lists empty', () => {
    const portfolio = createWalletPortfolio({
      wallet: null,
      generatedAt: '2026-07-18T12:00:00.000Z',
      summary: {
        netValueUsd: null,
        claimableValueUsd: null,
        activePositionCount: 0,
        historicalPositionCount: 0,
        attentionPositionCount: 0,
        pendingActionCount: 0,
      },
      liquidityPositions: [],
      farmPositions: [],
      poolPositions: [],
      claimables: [],
      approvals: [],
      recentActivity: [],
      quickActions: [],
      sectionStatus: emptySections,
    })
    expect(portfolio.positions).toEqual([])
    expect(portfolio.wallet).toBeNull()
    expect(portfolio.claimables).toEqual([])
  })
})
