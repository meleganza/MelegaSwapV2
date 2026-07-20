/**
 * R791E.1 — Command Center real wallet portfolio activation.
 *
 * Producers → adapters → WalletPortfolio → My Positions.
 * No fake positions. No invented claimables.
 */

import { describe, expect, it } from 'vitest'
import BigNumber from 'bignumber.js'
import {
  buildClaimablesFromStudioCards,
  buildCommandCenterWalletPortfolio,
  buildMyPositionsExperience,
  adaptStudioRowsToPortfolioPositions,
} from '../commandCenterPortfolioCutover'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'
import type { LiquidityPositionRow } from 'views/LiquidityStudio/liquidityRuntime/useLiquidityPositions'
import type { WalletPortfolioSectionStatus } from 'lib/wallet-portfolio/contracts'

const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'
const PAIR = '0x01db17c476ad6a4c119f559eab2d1ac9e340278e'

const READY_SECTIONS: WalletPortfolioSectionStatus = {
  summary: { status: 'READY', updatedAt: null, errorCode: null, message: null },
  positions: { status: 'READY', updatedAt: null, errorCode: null, message: null },
  claimables: { status: 'READY', updatedAt: null, errorCode: null, message: null },
  approvals: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
  activity: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
}

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

function stubPool(overrides: Partial<PoolPreviewCard> = {}): PoolPreviewCard {
  return {
    id: 'pool-0',
    name: 'MARCO Staking',
    tokens: ['MARCO'],
    status: 'ended',
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

function buildPortfolio(input: {
  wallet?: string | null
  liquidityRows?: LiquidityPositionRow[]
  farmCards?: FarmPreviewCard[]
  poolCards?: PoolPreviewCard[]
  sectionStatus?: WalletPortfolioSectionStatus
}) {
  return buildCommandCenterWalletPortfolio({
    wallet: input.wallet === undefined ? WALLET : input.wallet,
    chainId: input.wallet === null ? null : 56,
    chainName: 'BNB Chain',
    generatedAt: '2026-07-20T00:00:00.000Z',
    liquidityRows: input.liquidityRows ?? [],
    farmCards: input.farmCards ?? [],
    poolCards: input.poolCards ?? [],
    sectionStatus: input.sectionStatus ?? READY_SECTIONS,
    summary: {
      netValueUsd: null,
      claimableValueUsd: null,
      activePositionCount: 0,
      historicalPositionCount: 0,
      attentionPositionCount: 0,
      pendingActionCount: 0,
    },
  })
}

describe('R791E.1 commandCenterRealWalletPortfolio', () => {
  it('TEST 1: Wallet disconnected', () => {
    const portfolio = buildPortfolio({ wallet: null })
    const xp = buildMyPositionsExperience({
      portfolio,
      walletConnected: false,
      view: 'ALL',
    })

    expect(portfolio.positions).toEqual([])
    expect(portfolio.claimables).toEqual([])
    expect(xp.state).toBe('WALLET_NOT_CONNECTED')
  })

  it('TEST 2: Wallet connected with liquidity', () => {
    const portfolio = buildPortfolio({
      liquidityRows: [stubLpRow()],
    })

    expect(portfolio.positions.some((p) => p.positionType === 'LIQUIDITY')).toBe(true)
    const lp = portfolio.positions.find((p) => p.positionType === 'LIQUIDITY')
    expect(lp?.title.toLowerCase()).toMatch(/mm72|marco/)
    expect(lp?.recommendedAction.type).toBe('REMOVE_LIQUIDITY')
    expect(lp?.recommendedAction.enabled).toBe(true)
  })

  it('TEST 3: Wallet connected with farm', () => {
    const portfolio = buildPortfolio({
      farmCards: [stubFarm()],
    })

    const farm = portfolio.positions.find((p) => p.positionType === 'FARM')
    expect(farm).toBeTruthy()
    expect(farm?.title).toMatch(/MM72/)
    expect(farm?.recommendedAction.type).toBe('HARVEST')
    expect(portfolio.claimables.some((c) => c.sourceType === 'FARM')).toBe(true)
  })

  it('TEST 4: Wallet connected with pool', () => {
    // Ended pool with stake — must still enter portfolio (not UI tab filtered)
    const portfolio = buildPortfolio({
      poolCards: [stubPool({ status: 'ended' })],
    })

    const pool = portfolio.positions.find((p) => p.positionType === 'POOL')
    expect(pool).toBeTruthy()
    expect(pool?.title).toMatch(/MARCO/)
    expect(['CLAIM', 'WITHDRAW', 'MANAGE']).toContain(pool?.recommendedAction.type)
    expect(portfolio.claimables.some((c) => c.sourceType === 'POOL')).toBe(true)
  })

  it('TEST 5: Partial producer failure', () => {
    const portfolio = buildPortfolio({
      farmCards: [stubFarm()],
      poolCards: [],
      sectionStatus: {
        summary: { status: 'PARTIAL', updatedAt: null, errorCode: null, message: null },
        positions: { status: 'PARTIAL', updatedAt: null, errorCode: null, message: 'pools unavailable' },
        claimables: { status: 'PARTIAL', updatedAt: null, errorCode: null, message: null },
        approvals: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        activity: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
      },
    })

    expect(portfolio.positions.some((p) => p.positionType === 'FARM')).toBe(true)
    expect(portfolio.sectionStatus.positions.status).toBe('PARTIAL')
    expect(() =>
      buildMyPositionsExperience({ portfolio, walletConnected: true, view: 'ALL' }),
    ).not.toThrow()
  })

  it('TEST 6: No fake positions', () => {
    const zeroFarm = stubFarm({ userStaked: new BigNumber(0), pendingReward: new BigNumber(0) })
    const zeroPool = stubPool({ userStaked: new BigNumber(0), pendingReward: new BigNumber(0) })
    const portfolio = buildPortfolio({
      farmCards: [zeroFarm],
      poolCards: [zeroPool],
      liquidityRows: [],
    })

    expect(portfolio.positions).toEqual([])
    expect(portfolio.claimables).toEqual([])
    expect(portfolio.positions.every((p) => p.ownershipVerified === true || p.positionType)).toBe(true)
  })

  it('TEST 7: Actions from canonical positions', () => {
    const portfolio = buildPortfolio({
      liquidityRows: [stubLpRow()],
      farmCards: [stubFarm()],
      poolCards: [stubPool({ pendingReward: new BigNumber('1') })],
    })

    const types = portfolio.positions.map((p) => p.recommendedAction.type)
    expect(types).toContain('REMOVE_LIQUIDITY')
    expect(types).toContain('HARVEST')
    for (const p of portfolio.positions) {
      expect(p.recommendedAction.type).not.toBe('NONE')
      expect(p.actions.primary.type).toBeTruthy()
    }

    const claimables = buildClaimablesFromStudioCards({
      farmCards: [stubFarm()],
      poolCards: [stubPool()],
    })
    expect(claimables.every((c) => c.action.type === 'HARVEST' || c.action.type === 'CLAIM')).toBe(true)
  })

  it('TEST 8: Command Center survives missing section', () => {
    // Only liquidity succeeds — farms/pools empty (producer gap), portfolio still builds
    const adapted = adaptStudioRowsToPortfolioPositions({
      wallet: WALLET,
      chainId: 56,
      chainName: 'BNB Chain',
      liquidityRows: [stubLpRow()],
      farmCards: [],
      poolCards: [],
    })
    expect(adapted.liquidityPositions.length).toBe(1)
    expect(adapted.farmPositions).toEqual([])
    expect(adapted.poolPositions).toEqual([])

    const portfolio = buildPortfolio({
      liquidityRows: [stubLpRow()],
      farmCards: [],
      poolCards: [],
      sectionStatus: {
        summary: { status: 'PARTIAL', updatedAt: null, errorCode: null, message: null },
        positions: { status: 'PARTIAL', updatedAt: null, errorCode: null, message: null },
        claimables: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        approvals: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
        activity: { status: 'EMPTY', updatedAt: null, errorCode: null, message: null },
      },
    })

    const xp = buildMyPositionsExperience({
      portfolio,
      walletConnected: true,
      view: 'ALL',
    })
    expect(xp.state).toBe('READY')
    expect(portfolio.positions.length).toBe(1)
    expect(portfolio.positions[0].positionType).toBe('LIQUIDITY')
    // No product-specific roots
    expect('farmPositions' in portfolio).toBe(false)
    expect('liquidityPositions' in portfolio).toBe(false)
  })
})
