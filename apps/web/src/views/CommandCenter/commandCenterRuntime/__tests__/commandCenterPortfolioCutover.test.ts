import { describe, expect, it } from 'vitest'
import { WALLET_PORTFOLIO_SCHEMA } from 'lib/wallet-portfolio/contracts'
import {
  buildCommandCenterWalletPortfolio,
  filterPortfolioPositions,
  projectFarmView,
  projectLiquidityView,
  projectPoolView,
} from '../commandCenterPortfolioCutover'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'
import BigNumber from 'bignumber.js'

const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'

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
    ...overrides,
  }
}

function stubPool(overrides: Partial<PoolPreviewCard> = {}): PoolPreviewCard {
  return {
    id: 'pool-0',
    name: 'MARCO Staking',
    tokens: ['MARCO'],
    status: 'live',
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

describe('R791D.3B Command Center Portfolio Service cutover', () => {
  it('builds WalletPortfolio through createWalletPortfolio once', () => {
    const portfolio = buildCommandCenterWalletPortfolio({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      generatedAt: '2026-07-18T00:00:00.000Z',
      liquidityRows: [],
      farmCards: [stubFarm()],
      poolCards: [stubPool()],
      sectionStatus: {
        summary: { status: 'READY', updatedAt: null, errorCode: null, message: null },
        positions: { status: 'READY', updatedAt: null, errorCode: null, message: null },
        claimables: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        approvals: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        activity: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
      },
      summary: {
        netValueUsd: null,
        claimableValueUsd: null,
        activePositionCount: 0,
        historicalPositionCount: 0,
        attentionPositionCount: 0,
        pendingActionCount: 0,
      },
    })

    expect(portfolio.schema).toBe(WALLET_PORTFOLIO_SCHEMA)
    expect(Array.isArray(portfolio.positions)).toBe(true)
    expect(portfolio.positions.length).toBeGreaterThanOrEqual(2)
  })

  it('exposes no product root arrays on WalletPortfolio', () => {
    const portfolio = buildCommandCenterWalletPortfolio({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      generatedAt: '2026-07-18T00:00:00.000Z',
      liquidityRows: [],
      farmCards: [stubFarm()],
      poolCards: [stubPool()],
      sectionStatus: {
        summary: { status: 'READY', updatedAt: null, errorCode: null, message: null },
        positions: { status: 'READY', updatedAt: null, errorCode: null, message: null },
        claimables: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        approvals: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        activity: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
      },
      summary: {
        netValueUsd: null,
        claimableValueUsd: null,
        activePositionCount: 0,
        historicalPositionCount: 0,
        attentionPositionCount: 0,
        pendingActionCount: 0,
      },
    }) as unknown as Record<string, unknown>

    expect('liquidityPositions' in portfolio).toBe(false)
    expect('farmPositions' in portfolio).toBe(false)
    expect('poolPositions' in portfolio).toBe(false)
    expect('liquidity' in portfolio).toBe(false)
    expect('farms' in portfolio).toBe(false)
    expect('pools' in portfolio).toBe(false)
  })

  it('Command Center sections populate only via filtered portfolio.positions', () => {
    const portfolio = buildCommandCenterWalletPortfolio({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      generatedAt: '2026-07-18T00:00:00.000Z',
      liquidityRows: [],
      farmCards: [stubFarm()],
      poolCards: [stubPool()],
      sectionStatus: {
        summary: { status: 'READY', updatedAt: null, errorCode: null, message: null },
        positions: { status: 'READY', updatedAt: null, errorCode: null, message: null },
        claimables: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        approvals: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        activity: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
      },
      summary: {
        netValueUsd: null,
        claimableValueUsd: null,
        activePositionCount: 0,
        historicalPositionCount: 0,
        attentionPositionCount: 0,
        pendingActionCount: 0,
      },
    })

    const liquidity = projectLiquidityView(filterPortfolioPositions(portfolio, 'LIQUIDITY'))
    const farms = projectFarmView(filterPortfolioPositions(portfolio, 'FARM'))
    const pools = projectPoolView(filterPortfolioPositions(portfolio, 'POOL'))

    expect(liquidity.length).toBe(0)
    expect(farms.length).toBe(1)
    expect(pools.length).toBe(1)
    expect(farms[0].name).toBe('MM72 Farm')
    expect(pools[0].name).toBe('MARCO Staking')
    expect(portfolio.summary.activePositionCount).toBe(
      portfolio.positions.filter((p) => p.status === 'ACTIVE').length,
    )
    expect(portfolio.sectionStatus.positions.status).toBe('READY')
  })

  it('zero stake cards do not enter portfolio.positions', () => {
    const portfolio = buildCommandCenterWalletPortfolio({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      generatedAt: '2026-07-18T00:00:00.000Z',
      liquidityRows: [],
      farmCards: [stubFarm({ userStaked: new BigNumber(0), pendingReward: new BigNumber(0) })],
      poolCards: [stubPool({ userStaked: new BigNumber(0), pendingReward: new BigNumber(0) })],
      sectionStatus: {
        summary: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        positions: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        claimables: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        approvals: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        activity: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
      },
      summary: {
        netValueUsd: null,
        claimableValueUsd: null,
        activePositionCount: 0,
        historicalPositionCount: 0,
        attentionPositionCount: 0,
        pendingActionCount: 0,
      },
    })
    expect(portfolio.positions).toEqual([])
  })
})
