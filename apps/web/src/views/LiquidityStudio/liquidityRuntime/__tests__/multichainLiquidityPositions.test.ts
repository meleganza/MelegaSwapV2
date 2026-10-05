import { describe, expect, it } from 'vitest'
import {
  buildMultichainLiquidityPositions,
  multichainLiquidityCacheKey,
  positionIdentity,
  SUPPORTED_LIQUIDITY_CHAIN_IDS,
  type LiquidityChainResult,
} from '../useMultichainLiquidityPositions'

const TOKEN_A = '0x0000000000000000000000000000000000000001'
const TOKEN_B = '0x0000000000000000000000000000000000000002'
const PAIR = '0x0000000000000000000000000000000000000010'

function result(chainId: number, pairAddress = PAIR): LiquidityChainResult {
  return {
    chainId,
    state: 'READY',
    scannedPairs: 1,
    rows: [
      {
        pairAddress,
        token0: TOKEN_A,
        token1: TOKEN_B,
        symbol0: 'AAA',
        symbol1: 'BBB',
        token0Decimals: 18,
        token1Decimals: 18,
        reserve0Raw: '100000000000000000000',
        reserve1Raw: '200000000000000000000',
        totalSupplyRaw: '100000000000000000000',
        lpBalanceRaw: '10000000000000000000',
      },
    ],
  }
}

describe('multichain liquidity read model', () => {
  it('follows the six LIVE swap factories in the canonical registry', () => {
    expect(SUPPORTED_LIQUIDITY_CHAIN_IDS).toEqual([56, 8453, 137, 1, 42161, 43114])
  })

  it('uses chainId + normalized pair address as canonical identity', () => {
    expect(positionIdentity(56, PAIR.toUpperCase())).toBe(`56:${PAIR}`)
  })

  it('keys the directory by wallet, not by the active network', () => {
    expect(multichainLiquidityCacheKey('0xABC', 2)).toEqual(['wallet-liquidity-multichain', '0xabc', 2])
  })

  it('keeps identical pair addresses on different chains distinct', () => {
    const rows = buildMultichainLiquidityPositions([result(56), result(8453)], {
      56: { [TOKEN_A]: 1, [TOKEN_B]: 1 },
      8453: { [TOKEN_A]: 1, [TOKEN_B]: 1 },
    })
    expect(rows.map((row) => row.id)).toEqual([`56:${PAIR}`, `8453:${PAIR}`])
  })

  it('keeps healthy positions when a sibling chain fails or times out', () => {
    const failed: LiquidityChainResult = {
      chainId: 1,
      state: 'TIMED_OUT',
      scannedPairs: null,
      rows: [],
      error: 'timeout',
    }
    const rows = buildMultichainLiquidityPositions([result(56), failed], { 56: { [TOKEN_A]: 1, [TOKEN_B]: 1 } })
    expect(rows).toHaveLength(1)
    expect(rows[0].chainId).toBe(56)
  })

  it('isolates a malformed owned row without hiding its healthy sibling', () => {
    const healthy = result(56)
    healthy.rows.unshift({ ...healthy.rows[0], pairAddress: 'not-an-address' })
    expect(buildMultichainLiquidityPositions([healthy], { 56: { [TOKEN_A]: 1, [TOKEN_B]: 1 } })).toHaveLength(1)
  })

  it('computes whole-pool TVL and wallet value independently', () => {
    const [row] = buildMultichainLiquidityPositions([result(56)], { 56: { [TOKEN_A]: 2, [TOKEN_B]: 1 } })
    expect(row.poolTvlUsd).toBe(400)
    expect(row.usdValue).toBe(40)
  })
})
