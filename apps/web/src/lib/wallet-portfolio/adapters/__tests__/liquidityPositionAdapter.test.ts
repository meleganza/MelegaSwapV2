import { describe, expect, it } from 'vitest'
import { PORTFOLIO_POSITION_SCHEMA } from '../../contracts'
import {
  adaptLiquidityPositionToPortfolioPosition,
  type LiquidityPositionFacts,
} from '../liquidityPositionAdapter'

const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'
/** Test-only synthetic pair — MM72/MARCO recovery fixture (not production oracle data). */
const PAIR = '0x01db17c476ad6a4c119f559eab2d1ac9e340278e'
const MM72 = '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e'
const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'

function baseFacts(overrides: Partial<LiquidityPositionFacts> = {}): LiquidityPositionFacts {
  return {
    wallet: WALLET,
    chainId: 56,
    chainName: 'BNB Chain',
    protocolId: 'melega-v2',
    pairAddress: PAIR,
    sourceId: 'DIRECT_WALLET_LP',
    token0: {
      chainId: 56,
      address: MARCO,
      symbol: 'MARCO',
      name: 'MARCO',
      decimals: 18,
      logoURI: null,
    },
    token1: {
      chainId: 56,
      address: MM72,
      symbol: 'MM72',
      name: 'MM72',
      decimals: 18,
      logoURI: null,
    },
    lpToken: {
      chainId: 56,
      address: PAIR,
      symbol: null,
      name: null,
      decimals: 18,
      logoURI: null,
    },
    lpBalance: {
      raw: '55324213060324857658414062',
      formatted: '55324213.06032486',
      decimals: 18,
    },
    ownershipVerified: true,
    poolShare: null,
    underlyingAmount0: null,
    underlyingAmount1: null,
    currentValueUsd: null,
    unlockState: 'unlocked',
    isLocked: false,
    isPaused: false,
    runtimeUnavailable: false,
    productRoute: '/liquidity-studio',
    openRoute: '/liquidity-studio',
    manageRoute: '/liquidity-studio',
    removeRoute: '/liquidity-studio?mode=remove',
    addLiquidityRoute: '/liquidity-studio?mode=add',
    analyticsRoute: null,
    observedAt: '2026-07-17T18:00:00.000Z',
    blockNumber: 40_000_000,
    confidence: null,
    ...overrides,
  }
}

describe('R791D.2D liquidityPositionAdapter', () => {
  it('TEST 1 — Positive owned LP position', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(baseFacts())
    expect(position).not.toBeNull()
    expect(position?.schema).toBe(PORTFOLIO_POSITION_SCHEMA)
    expect(position?.positionType).toBe('LIQUIDITY')
  })

  it('TEST 2 — Explicit zero balance → null', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({
        lpBalanceIsZero: true,
        lpBalance: { raw: '0', formatted: '0', decimals: 18 },
      }),
    )
    expect(position).toBeNull()
  })

  it('TEST 3 — Explicit ownership false → null', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({ ownershipVerified: false }),
    )
    expect(position).toBeNull()
  })

  it('TEST 4 — Missing optional token metadata still yields position', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({
        token0: {
          chainId: 56,
          address: MARCO,
          symbol: null,
          name: null,
          decimals: null,
          logoURI: null,
        },
        token1: {
          chainId: 56,
          address: MM72,
          symbol: 'MM72',
          name: null,
          decimals: null,
          logoURI: null,
        },
      }),
    )
    expect(position).not.toBeNull()
    expect(position?.underlyingAssets[0].token.symbol).toBeNull()
    expect(position?.underlyingAssets[0].token.decimals).toBeNull()
    expect(position?.title).toContain('MM72')
  })

  it('TEST 5 — Missing USD economics → null not zero', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({ currentValueUsd: null, apr: null, apy: null, feesEarnedUsd: null }),
    )
    expect(position?.currentValueUsd).toBeNull()
    expect(position?.principalValueUsd).toBeNull()
    expect(position?.claimableValueUsd).toBeNull()
    expect(position?.pendingRewardsValueUsd).toBeNull()
    expect(position?.apr).toBeNull()
    expect(position?.apy).toBeNull()
    expect(position?.feesEarnedUsd).toBeNull()
    expect(position?.currentValueUsd).not.toBe('0')
  })

  it('TEST 6 — Stable identity', () => {
    const a = adaptLiquidityPositionToPortfolioPosition(baseFacts())
    const b = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({
        wallet: WALLET.toLowerCase(),
        pairAddress: PAIR.toUpperCase(),
      }),
    )
    expect(a?.positionId).toBe(b?.positionId)
  })

  it('TEST 7 — Balance changes do not change identity', () => {
    const a = adaptLiquidityPositionToPortfolioPosition(baseFacts())
    const b = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({
        lpBalance: { raw: '1', formatted: '1', decimals: 18 },
      }),
    )
    expect(a?.positionId).toBe(b?.positionId)
    expect(a?.balance?.raw).not.toBe(b?.balance?.raw)
  })

  it('TEST 8 — Different pair contract → different positionId', () => {
    const a = adaptLiquidityPositionToPortfolioPosition(baseFacts())
    const b = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({
        pairAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      }),
    )
    expect(a?.positionId).not.toBe(b?.positionId)
  })

  it('TEST 9 — Lifecycle ACTIVE', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(baseFacts())
    expect(position?.status).toBe('ACTIVE')
  })

  it('TEST 10 — Lifecycle LOCKED', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({ isLocked: true, unlockState: 'locked' }),
    )
    expect(position?.status).toBe('LOCKED')
  })

  it('TEST 11 — Lifecycle PAUSED', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(baseFacts({ isPaused: true }))
    expect(position?.status).toBe('PAUSED')
  })

  it('TEST 12 — Lifecycle UNAVAILABLE', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({ runtimeUnavailable: true }),
    )
    expect(position?.status).toBe('UNAVAILABLE')
  })

  it('TEST 13 — Remove action for owned unlocked usable position', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(baseFacts())
    expect(position?.actions.primary.type).toBe('REMOVE_LIQUIDITY')
    expect(position?.actions.primary.enabled).toBe(true)
    expect(position?.recommendedAction.type).toBe('REMOVE_LIQUIDITY')
  })

  it('TEST 14 — Unavailable action → NONE disabled', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({ runtimeUnavailable: true }),
    )
    expect(position?.actions.primary.type).toBe('NONE')
    expect(position?.actions.primary.enabled).toBe(false)
    expect(position?.actions.primary.reasonDisabled).toBeTruthy()
  })

  it('TEST 15 — Partial provenance', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({
        currentValueUsd: null,
        poolShare: null,
        underlyingAmount0: null,
      }),
    )
    expect(position?.dataState).toBe('PARTIAL')
  })

  it('TEST 16 — MM72/MARCO recovery fixture', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(
      baseFacts({
        token0: {
          chainId: 56,
          address: MM72,
          symbol: 'MM72',
          name: 'MM72',
          decimals: 18,
          logoURI: null,
        },
        token1: {
          chainId: 56,
          address: MARCO,
          symbol: 'MARCO',
          name: 'MARCO',
          decimals: 18,
          logoURI: null,
        },
        currentValueUsd: null,
        apr: null,
      }),
    )
    expect(position).not.toBeNull()
    expect(position?.positionType).toBe('LIQUIDITY')
    expect(position?.title).toBe('MM72 / MARCO')
    expect(position?.balance?.raw).toBe('55324213060324857658414062')
    expect(position?.ownershipVerified).toBe(true)
    expect(position?.status).toBe('ACTIVE')
    expect(position?.actions.primary.type).toBe('REMOVE_LIQUIDITY')
    expect(position?.currentValueUsd).toBeNull()
    expect(position?.apr).toBeNull()
    expect(position?.source).toBe('DIRECT_WALLET_LP')
  })

  it('TEST 17 — Input purity', () => {
    const facts = baseFacts()
    const snapshot = JSON.stringify(facts)
    adaptLiquidityPositionToPortfolioPosition(facts)
    expect(JSON.stringify(facts)).toBe(snapshot)
  })

  it('TEST 18 — No product arrays; single PortfolioPosition', () => {
    const position = adaptLiquidityPositionToPortfolioPosition(baseFacts())
    expect(position).not.toBeNull()
    const asRecord = position as unknown as Record<string, unknown>
    expect(asRecord.positionType).toBe('LIQUIDITY')
    expect('liquidityPositions' in asRecord).toBe(false)
    expect('positions' in asRecord).toBe(false)
    expect(Array.isArray(asRecord)).toBe(false)
  })
})
