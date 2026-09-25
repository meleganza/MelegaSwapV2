/**
 * P0-LIQUIDITY-ADD-PAIR-LABEL-TRUTH
 *
 * On /liquidity the runtime mode defaults to 'My Positions' while the shell renders the Add
 * workspace, and a sole wallet LP position is auto-selected. The pair label resolver used to
 * prefer that selected position outside 'Add Liquidity' mode, so the Add header, Position
 * Preview → Pair and the Add confirmation → Position could read "MARCO / WBNB" while the form
 * (and the transaction) deposited AARON + MARCO. Add surfaces must always derive the pair from
 * the live form currencies; Remove Liquidity keeps the selected wallet LP position truth.
 */
import React, { useState } from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, renderHook, screen } from '@testing-library/react'
import { ERC20Token, Native } from '@pancakeswap/sdk'
import type { Currency } from '@pancakeswap/sdk'
import { resolveLiquidityStudioPairLabel } from '../useLiquidityMintRuntime'
import type { LiquidityStudioMode } from '../useLiquidityMintRuntime'
import { pairLabel } from '../formatLiquidityRuntime'
import { LiquidityAddConfirmModal } from '../../v3/LiquidityAddConfirmModal'

const AARON = new ERC20Token(56, '0x0000000000000000000000000000000000a4a201', 18, 'AARON')
const MARCO = new ERC20Token(56, '0x963556de0eb8138E97A85F0A86eE0acD159D210b', 18, 'MARCO')
const WBNB = new ERC20Token(56, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB')
const MM72 = new ERC20Token(56, '0x0000000000000000000000000000000000000072', 18, 'MM72')
const BNB = Native.onChain(56)
const SELECTED_WALLET_LP = 'MARCO / WBNB'

const ADD_WORKSPACE_MODES: LiquidityStudioMode[] = [
  'My Positions',
  'Add Liquidity',
  'Liquidity Building',
  'Simulation',
]

const runtimeSource = readFileSync(path.resolve(__dirname, '../useLiquidityMintRuntime.tsx'), 'utf8')
const addModuleSource = readFileSync(path.resolve(__dirname, '../../modules/LiquidityAddModule.tsx'), 'utf8')
const shellSource = readFileSync(path.resolve(__dirname, '../../v3/LiquidityStudioV3Shell.tsx'), 'utf8')
const removePanelSource = readFileSync(path.resolve(__dirname, '../../v3/LiquidityRemovePanel.tsx'), 'utf8')

afterEach(() => cleanup())

describe('Add Liquidity pair label derives from the live form currencies', () => {
  it("founder case: mode 'My Positions' + selected MARCO/WBNB LP + form AARON/MARCO → 'AARON / MARCO'", () => {
    const label = resolveLiquidityStudioPairLabel('My Positions', SELECTED_WALLET_LP, AARON, MARCO)
    expect(label).toBe('AARON / MARCO')
    expect(label).not.toBe(SELECTED_WALLET_LP)
  })

  it.each(ADD_WORKSPACE_MODES)('selected wallet LP never overwrites the Add pair in mode %s', (mode) => {
    expect(resolveLiquidityStudioPairLabel(mode, SELECTED_WALLET_LP, AARON, MARCO)).toBe('AARON / MARCO')
    expect(resolveLiquidityStudioPairLabel(mode, SELECTED_WALLET_LP, BNB, MARCO)).toBe('BNB / MARCO')
    expect(resolveLiquidityStudioPairLabel(mode, undefined, AARON, MARCO)).toBe('AARON / MARCO')
  })

  it('an incomplete form never borrows the selected LP pair', () => {
    expect(resolveLiquidityStudioPairLabel('My Positions', SELECTED_WALLET_LP, AARON, undefined)).toBe('AARON / ?')
    expect(resolveLiquidityStudioPairLabel('Add Liquidity', SELECTED_WALLET_LP, null, MARCO)).toBe('? / MARCO')
  })

  it('switching form tokens updates the label immediately (same render) while the LP stays selected', () => {
    const { result } = renderHook(() => {
      const [currencyA, setCurrencyA] = useState<Currency>(AARON)
      const [currencyB, setCurrencyB] = useState<Currency>(MARCO)
      return {
        label: resolveLiquidityStudioPairLabel('My Positions', SELECTED_WALLET_LP, currencyA, currencyB),
        setCurrencyA,
        setCurrencyB,
      }
    })
    expect(result.current.label).toBe('AARON / MARCO')
    act(() => result.current.setCurrencyA(MM72))
    expect(result.current.label).toBe('MM72 / MARCO')
    act(() => result.current.setCurrencyB(BNB))
    expect(result.current.label).toBe('MM72 / BNB')
    act(() => result.current.setCurrencyA(WBNB))
    act(() => result.current.setCurrencyB(MARCO))
    // Even when the form matches the selected LP tokens, the label is the form order.
    expect(result.current.label).toBe('WBNB / MARCO')
  })
})

describe('Remove Liquidity keeps the selected wallet LP pair', () => {
  it('selected LP wins over form currencies in Remove mode', () => {
    expect(resolveLiquidityStudioPairLabel('Remove Liquidity', SELECTED_WALLET_LP, AARON, MARCO)).toBe(
      SELECTED_WALLET_LP,
    )
  })

  it('Remove without a selected LP keeps the existing fallbacks', () => {
    expect(resolveLiquidityStudioPairLabel('Remove Liquidity', undefined, AARON, MARCO)).toBe('AARON / MARCO')
    expect(resolveLiquidityStudioPairLabel('Remove Liquidity', undefined, undefined, undefined)).toBe(
      'Select a liquidity position',
    )
  })

  it('Remove panel and Remove confirmation still consume the resolved (selected-LP) label', () => {
    expect(runtimeSource).toMatch(/<LiquidityRemoveConfirmModal[\s\S]*?pairLabel=\{resolvedPairLabel\}/)
    expect(removePanelSource).toContain('data-testid="liquidity-remove-pair">{pairLabel ||')
  })
})

describe('all three Add surfaces show the same form pair', () => {
  it('runtime wiring: shared label is the resolver output; Add confirmation uses the form pair', () => {
    expect(runtimeSource).toContain(
      'const resolvedPairLabel = resolveLiquidityStudioPairLabel(mode, selectedPosition?.pairLabel, currencyA, currencyB)',
    )
    expect(runtimeSource).toContain('const addPairLabel = pairLabel(currencyA, currencyB)')
    expect(runtimeSource).toContain('pairLabel: resolvedPairLabel,')
    expect(runtimeSource).toMatch(/<LiquidityAddConfirmModal[\s\S]*?pairLabel=\{addPairLabel\}/)
  })

  it('surface 1 (Add/Remove header) and surface 2 (Position Preview → Pair) render the runtime label', () => {
    expect(shellSource).toContain('<strong>{hasSelectedPair ? pairLabel : \'Select pair\'}</strong>')
    expect(addModuleSource).toContain('<PreviewDd>{pairLabel || LIQUIDITY_ADD_COPY.emptyMetric}</PreviewDd>')
  })

  it('surface 3 (Add confirmation → Position) renders the form pair, not the selected LP', () => {
    const addPairLabel = pairLabel(AARON, MARCO)
    const shared = resolveLiquidityStudioPairLabel('My Positions', SELECTED_WALLET_LP, AARON, MARCO)
    expect(addPairLabel).toBe(shared)
    render(
      <LiquidityAddConfirmModal
        open
        onClose={() => undefined}
        onConfirm={() => undefined}
        pairLabel={addPairLabel}
        chainId={56}
        tokenASymbol="AARON"
        tokenBSymbol="MARCO"
        amountA="1"
        amountB="2"
        slippageLabel="0.50%"
        lifecycle="review"
        canConfirm
      />,
    )
    expect(screen.getByTestId('liquidity-add-confirm-pair').textContent).toBe('AARON / MARCO')
    expect(screen.queryByText(SELECTED_WALLET_LP)).toBeNull()
  })
})

describe('transaction pair is unchanged (form currencies, not labels)', () => {
  it('addLiquidity token args are the form currencies', () => {
    expect(runtimeSource).toMatch(
      /method = routerContract\.addLiquidity\s+args = \[\s+currencyA\.wrapped\.address,\s+currencyB\.wrapped\.address,/,
    )
  })

  it('addLiquidityETH token arg is the non-native form currency', () => {
    expect(runtimeSource).toMatch(
      /method = routerContract\.addLiquidityETH\s+args = \[\s+\(tokenBIsNative \? currencyA : currencyB\)\.wrapped\.address,/,
    )
  })

  it('no pair label feeds the router call', () => {
    const start = runtimeSource.indexOf('if (currencyA.isNative || currencyB.isNative) {')
    const end = runtimeSource.indexOf("setAddTxLifecycle('submitted')", start)
    expect(start).toBeGreaterThan(0)
    expect(end).toBeGreaterThan(start)
    const addCall = runtimeSource.slice(start, end)
    expect(addCall).not.toMatch(/pairLabel|resolvedPairLabel|addPairLabel|selectedPosition/)
  })
})
