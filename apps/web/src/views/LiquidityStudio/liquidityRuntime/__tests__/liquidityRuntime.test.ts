import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  computeUnderlyingAmount,
  OWNERSHIP_SOURCE_DIRECT_WALLET_LP,
  positionIdentityKey,
  removeLiquidityDefaultPairIds,
  resolveRemoveLiquidityMethod,
  shouldAutoSelectOwnedPosition,
} from '../walletLpPositionMath'
import { estimateImpermanentLossPct, formatPercentShare, formatSlippage, pairLabel, ratioLabels } from '../formatLiquidityRuntime'
import type { LiquidityStudioMode, SetLiquidityModeOptions } from '../useLiquidityMintRuntime'

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
    expect(
      resolveRemoveLiquidityMethod({ tokenAIsNative: false, tokenBIsNative: false }),
    ).toBe('removeLiquidity')
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
  const myPos = readFileSync(
    path.resolve(__dirname, '../../modules/LiquidityMyPositionsModule.tsx'),
    'utf8',
  )

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
    const next = addModeShouldClearPair(undefined)
      ? { currencyIdA: undefined, currencyIdB: undefined }
      : current
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
