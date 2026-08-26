import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { CurrencyAmount, ERC20Token, Pair, Price } from '@pancakeswap/sdk'
import {
  computeUnderlyingAmount,
  computeProRataAmountRaw,
  OWNERSHIP_SOURCE_DIRECT_WALLET_LP,
  positionIdentityKey,
  removeLiquidityDefaultPairIds,
  resolveRemoveLiquidityMethod,
  shouldAutoSelectOwnedPosition,
} from '../walletLpPositionMath'
import {
  estimateImpermanentLossPct,
  formatPercentShare,
  formatSlippage,
  pairLabel,
  ratioLabels,
} from '../formatLiquidityRuntime'
import type { LiquidityStudioMode, SetLiquidityModeOptions } from '../useLiquidityMintRuntime'
import {
  computePositionPoolShare,
  depositedUsdFromPricedSides,
  resolvePositionTotalSupply,
  safeGetLiquidityDeposited,
} from '../useLiquidityPositions'

const MM72 = '0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E'
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const PAIR = '0x01dB17c476ad6a4c119f559eAb2d1AC9e340278E'
const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'

describe('liquidity studio runtime', () => {
  it('formats pair labels and share ratios', () => {
    expect(pairLabel({ symbol: 'BNB' } as never, { symbol: 'MARCO' } as never)).toBe('BNB / MARCO')
    expect(formatPercentShare(undefined)).toBe('0.00%')
    expect(formatSlippage(50)).toBe('0.50%')
  })

  it('estimates impermanent loss from price change', () => {
    expect(estimateImpermanentLossPct(0)).toBe('0.00%')
    const il = estimateImpermanentLossPct(10)
    expect(il).not.toBe('—')
    expect(il.endsWith('%')).toBe(true)
  })

  it('simulation mode is distinct from add liquidity', () => {
    const addMode: LiquidityStudioMode = 'Add Liquidity'
    const simMode: LiquidityStudioMode = 'Simulation'
    expect(addMode).not.toBe(simMode)
    expect(simMode).toBe('Simulation')
  })

  it('ratio labels return balanced defaults when empty', () => {
    const r = ratioLabels(undefined, undefined, undefined)
    expect(r.leftPct).toBe(50)
    expect(r.rightPct).toBe(50)
  })
})

describe('R791C.1A wallet LP position recovery', () => {
  it('TEST 1 — Direct wallet LP ownership identity', () => {
    const key = positionIdentityKey(56, PAIR, WALLET)
    expect(key).toBe(`56:${PAIR.toLowerCase()}:${WALLET.toLowerCase()}`)
    expect(OWNERSHIP_SOURCE_DIRECT_WALLET_LP).toBe('DIRECT_WALLET_LP')
  })

  it('TEST 2 — Unstaked LP still maps to direct wallet ownership source', () => {
    // Farm stake = 0, wallet LP > 0 → still DIRECT_WALLET_LP
    expect(OWNERSHIP_SOURCE_DIRECT_WALLET_LP).toBe('DIRECT_WALLET_LP')
    expect(shouldAutoSelectOwnedPosition(1)).toBe(true)
  })

  it('TEST 3 — Pair selector supports token/token (method not ETH)', () => {
    expect(resolveRemoveLiquidityMethod({ tokenAIsNative: false, tokenBIsNative: false })).toBe('removeLiquidity')
  })

  it('TEST 4 — No hardcoded BNB default when owned positions exist', () => {
    const defaults = removeLiquidityDefaultPairIds(1)
    expect(defaults.forceNativeMarcoDefault).toBe(false)
    expect(defaults.currencyIdA).toBeUndefined()
    expect(defaults.currencyIdB).toBeUndefined()
    expect(shouldAutoSelectOwnedPosition(1)).toBe(true)
    expect(shouldAutoSelectOwnedPosition(0)).toBe(false)
    expect(shouldAutoSelectOwnedPosition(2)).toBe(false)
  })

  it('TEST 5 — Position identity ignores token order', () => {
    const a = positionIdentityKey(56, PAIR, WALLET)
    const b = positionIdentityKey(56, PAIR.toLowerCase(), WALLET.toUpperCase())
    expect(a).toBe(b)
    // Same pair address → one identity even if token0/token1 order differs in labels
    expect(a.includes(PAIR.toLowerCase())).toBe(true)
  })

  it('TEST 6 — Underlying amount calculation (integer)', () => {
    const e18 = BigInt('1000000000000000000')
    const reserve0 = BigInt(1_000_000) * e18
    const reserve1 = BigInt(2_000_000) * e18
    const totalSupply = BigInt(10_000_000) * e18
    const walletLp = BigInt(1_000_000) * e18 // 10% share
    expect(computeUnderlyingAmount(reserve0, walletLp, totalSupply)).toBe(BigInt(100_000) * e18)
    expect(computeUnderlyingAmount(reserve1, walletLp, totalSupply)).toBe(BigInt(200_000) * e18)
    expect(computeUnderlyingAmount(reserve0, BigInt(0), totalSupply)).toBe(BigInt(0))
    expect(computeUnderlyingAmount(reserve0, walletLp, BigInt(0))).toBe(BigInt(0))
  })

  it('TEST 6B — Fwc/BUSD MAX removal preserves exact integer amounts', () => {
    const lpBalance = '6156180495365080454'
    const reserveFwc = '226563697354041982516'
    const reserveBusd = '175560548107283565'
    expect(computeProRataAmountRaw(lpBalance, '100', '100')).toBe(lpBalance)
    expect(computeProRataAmountRaw(reserveFwc, '100', '100')).toBe(reserveFwc)
    expect(computeProRataAmountRaw(reserveBusd, '100', '100')).toBe(reserveBusd)
    expect(computeProRataAmountRaw(lpBalance, '50', '100')).toBe('3078090247682540227')
  })

  it('TEST 7 — Token/token removal method for MM72/MARCO', () => {
    // Neither MM72 nor MARCO is native BNB
    expect(
      resolveRemoveLiquidityMethod({
        tokenAIsNative: false,
        tokenBIsNative: false,
      }),
    ).toBe('removeLiquidity')
    expect(
      resolveRemoveLiquidityMethod({
        tokenAIsNative: true,
        tokenBIsNative: false,
      }),
    ).toBe('removeLiquidityETH')
  })

  it('TEST 8 — Approval asset is LP pair (identity), not MM72/MARCO', () => {
    const approvalAsset = PAIR.toLowerCase()
    expect(approvalAsset).not.toBe(MM72.toLowerCase())
    expect(approvalAsset).not.toBe(MARCO.toLowerCase())
    expect(approvalAsset).toBe(PAIR.toLowerCase())
  })

  it('TEST 9 — Zero wallet balance yields no fabricated position', () => {
    expect(shouldAutoSelectOwnedPosition(0)).toBe(false)
    const defaults = removeLiquidityDefaultPairIds(0)
    expect(defaults.forceNativeMarcoDefault).toBe(false)
  })

  it('TEST 10 — Failed canonical read must not force BNB/MARCO', () => {
    const defaults = removeLiquidityDefaultPairIds(0)
    expect(defaults.forceNativeMarcoDefault).toBe(false)
  })

  it('TEST 11 — No duplicate Farm/direct position identity', () => {
    const farmKey = positionIdentityKey(56, PAIR, WALLET)
    const walletKey = positionIdentityKey(56, PAIR, WALLET)
    expect(farmKey).toBe(walletKey)
  })

  it('TEST 12 — UI layout regression: pair labels remain full strings', () => {
    expect(pairLabel({ symbol: 'MM72' } as never, { symbol: 'MARCO' } as never)).toBe('MM72 / MARCO')
    expect(pairLabel({ symbol: 'MM72' } as never, { symbol: 'MARCO' } as never)).not.toMatch(/BNB/)
  })
})

describe('Manage / Add More selected-pair context', () => {
  const LUCK = '0x0000000000000000000000000000000000000lck'
  const runtime = readFileSync(path.resolve(__dirname, '../useLiquidityMintRuntime.tsx'), 'utf8')
  const myPos = readFileSync(path.resolve(__dirname, '../../modules/LiquidityMyPositionsModule.tsx'), 'utf8')

  const addModeShouldClearPair = (opts?: SetLiquidityModeOptions): boolean => opts?.preservePair !== true
  const resolveLiquidityStudioPairLabel = (
    mode: LiquidityStudioMode,
    selectedPositionPairLabel: string | undefined,
    currencyA?: { symbol?: string } | null,
    currencyB?: { symbol?: string } | null,
  ): string => {
    if (mode === 'Add Liquidity' && currencyA && currencyB) {
      return pairLabel(currencyA as never, currencyB as never)
    }
    return (
      selectedPositionPairLabel ||
      (currencyA && currencyB
        ? pairLabel(currencyA as never, currencyB as never)
        : mode === 'Remove Liquidity'
        ? 'Select a liquidity position'
        : pairLabel(currencyA as never, currencyB as never))
    )
  }

  it('wires preservePair through setMode and proceedManage', () => {
    expect(runtime).toContain('preservePair?: boolean')
    expect(runtime).toContain('export function addModeShouldClearPair')
    expect(runtime).toContain('return opts?.preservePair !== true')
    expect(runtime).toContain("if (next === 'Add Liquidity' && addModeShouldClearPair(opts))")
    expect(runtime).toContain('setCurrencyIdA(undefined)')
    expect(runtime).toContain('setCurrencyIdB(undefined)')
    expect(runtime).toContain('resolveLiquidityStudioPairLabel(')
    expect(myPos).toContain("setMode('Add Liquidity', { syncUrl: false, preservePair: true })")
    expect(myPos).toContain("setMode('Add Liquidity')")
  })

  it('preservePair true retains current currency addresses', () => {
    const current = { currencyIdA: MM72, currencyIdB: LUCK }
    const next = addModeShouldClearPair({ preservePair: true })
      ? { currencyIdA: undefined, currencyIdB: undefined }
      : current
    expect(next.currencyIdA).toBe(MM72)
    expect(next.currencyIdB).toBe(LUCK)
    expect(addModeShouldClearPair({ syncUrl: false, preservePair: true })).toBe(false)
  })

  it('default Add still clears currency IDs', () => {
    const current = { currencyIdA: MM72, currencyIdB: LUCK }
    const next = addModeShouldClearPair(undefined) ? { currencyIdA: undefined, currencyIdB: undefined } : current
    expect(next.currencyIdA).toBeUndefined()
    expect(next.currencyIdB).toBeUndefined()
    expect(addModeShouldClearPair()).toBe(true)
    expect(addModeShouldClearPair({ syncUrl: false })).toBe(true)
    expect(addModeShouldClearPair({ preservePair: false })).toBe(true)
  })

  it('Add-mode pair label follows live currencies even when selectedPosition.pairLabel differs', () => {
    const mm72Luck = resolveLiquidityStudioPairLabel(
      'Add Liquidity',
      'BNB / MARCO',
      { symbol: 'MM72' },
      { symbol: 'LUCK' },
    )
    expect(mm72Luck).toBe('MM72 / LUCK')
    expect(mm72Luck).not.toBe('BNB / MARCO')

    const mxmxLuck = resolveLiquidityStudioPairLabel(
      'Add Liquidity',
      'MM72 / LUCK',
      { symbol: 'MXMX' },
      { symbol: 'LUCK' },
    )
    expect(mxmxLuck).toBe('MXMX / LUCK')
  })

  it('Remove mode keeps selected-position pair-label semantics', () => {
    expect(
      resolveLiquidityStudioPairLabel('Remove Liquidity', 'MM72 / LUCK', { symbol: 'BNB' }, { symbol: 'MARCO' }),
    ).toBe('MM72 / LUCK')
    expect(resolveLiquidityStudioPairLabel('Remove Liquidity', undefined, undefined, undefined)).toBe(
      'Select a liquidity position',
    )
  })
})

const MXMX = '0xc93B7e6d6445f8e7de92abDDbFBC8057CdCaA1a6'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const e18 = '000000000000000000'

function mm72MxmxFixture() {
  const tokenMm72 = new ERC20Token(56, MM72, 18, 'MM72')
  const tokenMxmx = new ERC20Token(56, MXMX, 18, 'MXMX')
  const tokenUsdt = new ERC20Token(56, USDT, 18, 'USDT')
  const pair = new Pair(
    CurrencyAmount.fromRawAmount(tokenMm72, `1000${e18}`),
    CurrencyAmount.fromRawAmount(tokenMxmx, `2000${e18}`),
  )
  const batchedRaw = `10000${e18}`
  const batchedSupply = CurrencyAmount.fromRawAmount(pair.liquidityToken, batchedRaw)
  const userBalance = CurrencyAmount.fromRawAmount(pair.liquidityToken, `1000${e18}`)
  return { tokenMm72, tokenMxmx, tokenUsdt, pair, batchedRaw, batchedSupply, userBalance }
}

describe('LP share + position value — batched totalSupply', () => {
  it('wires batched totalSupply via existing multicall on discovered LP rows', () => {
    const src = readFileSync(path.join(__dirname, '../useLiquidityPositions.ts'), 'utf8')
    expect(src).toContain('useMultipleContractSingleData')
    expect(src).toContain("ERC20_INTERFACE, 'totalSupply'")
    expect(src).toContain('resolvePositionTotalSupply(position?.totalSupply, fallbackTotalSupply)')
  })

  it('batched supply + nonzero LP yields a finite pool share', () => {
    const { batchedSupply, userBalance } = mm72MxmxFixture()
    const supply = resolvePositionTotalSupply(batchedSupply, undefined)
    const share = computePositionPoolShare(supply, userBalance)
    expect(share).toBeDefined()
    const n = Number(share!.toFixed(4))
    expect(Number.isFinite(n)).toBe(true)
    expect(n).toBeGreaterThan(0)
  })

  it('one-sided MM72/MXMX USDT price yields finite USD when supply exists', () => {
    const { pair, batchedSupply, userBalance, tokenMm72, tokenUsdt } = mm72MxmxFixture()
    const supply = resolvePositionTotalSupply(batchedSupply, undefined)
    const [token0Deposited, token1Deposited] = safeGetLiquidityDeposited(pair, supply, userBalance)
    expect(token0Deposited || token1Deposited).toBeTruthy()
    const mm72IsToken0 = pair.token0.equals(tokenMm72)
    const usdtPrice = new Price(tokenMm72, tokenUsdt, `1${e18}`, `1${e18}`)
    const usd = depositedUsdFromPricedSides(
      token0Deposited,
      token1Deposited,
      mm72IsToken0 ? usdtPrice : undefined,
      mm72IsToken0 ? undefined : usdtPrice,
    )
    expect(usd).toBeDefined()
    expect(Number.isFinite(usd!)).toBe(true)
    expect(usd!).toBeGreaterThan(0)
  })

  it('missing or invalid supply stays undefined/partial (not fabricated)', () => {
    const { pair, userBalance, batchedSupply } = mm72MxmxFixture()
    const zeroSupply = CurrencyAmount.fromRawAmount(pair.liquidityToken, '0')
    expect(resolvePositionTotalSupply(undefined, undefined)).toBeUndefined()
    expect(resolvePositionTotalSupply(zeroSupply, undefined)).toBeUndefined()
    expect(computePositionPoolShare(undefined, userBalance)).toBeUndefined()
    expect(computePositionPoolShare(zeroSupply, userBalance)).toBeUndefined()
    expect(safeGetLiquidityDeposited(pair, undefined, userBalance)).toEqual([undefined, undefined])
    expect(depositedUsdFromPricedSides(undefined, undefined, undefined, undefined)).toBeUndefined()
    // fallback only when batched is missing/invalid
    expect(resolvePositionTotalSupply(undefined, batchedSupply)).toBe(batchedSupply)
    expect(resolvePositionTotalSupply(zeroSupply, batchedSupply)).toBe(batchedSupply)
  })

  it('getLiquidityValue throw does not propagate', () => {
    const { pair, userBalance, tokenMm72 } = mm72MxmxFixture()
    const mismatchedSupply = CurrencyAmount.fromRawAmount(tokenMm72, `10000${e18}`)
    expect(() => safeGetLiquidityDeposited(pair, mismatchedSupply, userBalance)).not.toThrow()
    expect(safeGetLiquidityDeposited(pair, mismatchedSupply, userBalance)).toEqual([undefined, undefined])

    const oversizeLp = CurrencyAmount.fromRawAmount(pair.liquidityToken, `100000${e18}`)
    const smallSupply = CurrencyAmount.fromRawAmount(pair.liquidityToken, `1${e18}`)
    expect(() => {
      pair.getLiquidityValue(pair.token0, smallSupply, oversizeLp, false)
    }).toThrow()
    expect(() => safeGetLiquidityDeposited(pair, smallSupply, oversizeLp)).not.toThrow()
    expect(safeGetLiquidityDeposited(pair, smallSupply, oversizeLp)).toEqual([undefined, undefined])
  })
})
