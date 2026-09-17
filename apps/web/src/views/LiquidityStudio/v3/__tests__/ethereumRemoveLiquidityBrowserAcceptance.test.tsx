/**
 * Browser acceptance — Ethereum liquidity position / manage / remove.
 * Mocked wallet + provider. No approval, signature, or broadcast.
 */
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LiquidityRemovePanel } from '../LiquidityRemovePanel'
import type { LiquidityMintRuntime } from '../../liquidityRuntime/useLiquidityMintRuntime'
import type { LiquidityPositionRow } from '../../liquidityRuntime/useLiquidityPositions'

const ACCOUNT = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'
const ETH_MARCO = '0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76'
const ETH_WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const ETH_LP = '0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E'
const VIEWPORTS = [1440, 1280, 1024, 768, 390] as const

vi.mock('../../liquidityRuntime/LiquidityRuntimeContext', () => ({
  useLiquidityRuntime: () => mockRuntime,
}))

vi.mock('@pancakeswap/uikit', async () => {
  const actual = await vi.importActual<typeof import('@pancakeswap/uikit')>('@pancakeswap/uikit')
  return {
    ...actual,
    useModal: () => [vi.fn()],
  }
})

vi.mock('state/user/hooks', () => ({
  useUserTransactionTTL: () => [1200],
}))

vi.mock('components/Menu/GlobalSettings/SettingsModal', () => ({
  default: () => null,
}))

let mockRuntime: Partial<LiquidityMintRuntime>

function ethereumPosition(): LiquidityPositionRow {
  return {
    id: ETH_LP,
    pairAddress: ETH_LP,
    chainId: 1,
    walletAddress: ACCOUNT,
    ownershipSource: 'DIRECT_WALLET_LP',
    pairLabel: 'MARCO / WETH',
    pair: {
      token0: { chainId: 1, address: ETH_MARCO, symbol: 'MARCO', name: 'MELEGA', decimals: 18 },
      token1: { chainId: 1, address: ETH_WETH, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
      liquidityToken: { address: ETH_LP },
    } as LiquidityPositionRow['pair'],
    lpBalance: {
      greaterThan: () => true,
      toSignificant: () => '1.25',
      quotient: { toString: () => '1250000000000000000' },
      currency: { address: ETH_LP, decimals: 18, chainId: 1 },
    } as LiquidityPositionRow['lpBalance'],
  }
}

function mountRemove(overrides: Partial<LiquidityMintRuntime> = {}) {
  const onPrimaryAction = vi.fn()
  mockRuntime = {
    account: ACCOUNT,
    pairLabel: 'MARCO / WETH',
    selectedPosition: ethereumPosition(),
    positionDetails: { usdValue: 12.5, poolShare: undefined, token0Deposited: undefined, token1Deposited: undefined },
    typedValueA: '0.50',
    typedValueB: '0.25',
    currencyA: { symbol: 'MARCO' } as never,
    currencyB: { symbol: 'WETH' } as never,
    removePercent: '50',
    removeActionReady: true,
    onRemovePercent: vi.fn(),
    onPrimaryAction,
    primaryCtaLabel: 'Remove Liquidity',
    slippageLabel: '0.50%',
    removeMinimumReceived: '0.4975 MARCO + 0.2487 WETH',
    canReceiveNative: true,
    receiveNative: false,
    setReceiveNative: vi.fn(),
    removeOutputSymbolA: 'MARCO',
    removeOutputSymbolB: 'WETH',
    removeConfirmModal: <div data-testid="liquidity-remove-confirm-modal" />,
    ...overrides,
  }
  return { onPrimaryAction }
}

afterEach(() => {
  cleanup()
  document.documentElement.style.width = ''
  document.body.style.width = ''
})

describe('Ethereum remove liquidity browser acceptance (mocked wallet, no broadcast)', () => {
  it.each(VIEWPORTS)('position / manage / remove stay in-surface at %spx', (width) => {
    document.documentElement.style.width = `${width}px`
    document.body.style.width = `${width}px`
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    const { onPrimaryAction } = mountRemove()
    const { container } = render(<LiquidityRemovePanel />)

    expect(screen.getByTestId('liquidity-v3-remove')).toBeTruthy()
    expect(screen.getByTestId('liquidity-remove-pair')).toHaveTextContent('MARCO / WETH')
    expect(screen.getByTestId('liquidity-remove-out-a')).toHaveTextContent('0.50')
    expect(screen.getByTestId('liquidity-remove-out-b')).toHaveTextContent('0.25')
    expect(screen.getByTestId('liquidity-remove-receive-native')).toBeTruthy()
    const cta = screen.getByTestId('liquidity-remove-cta')
    expect(cta).toHaveTextContent('Remove Liquidity')
    expect((cta as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(cta)
    expect(onPrimaryAction).toHaveBeenCalledTimes(1)
    expect(container.textContent).not.toMatch(/crash|undefined is not/i)
    expect(container.querySelector('[data-testid="liquidity-remove-confirm-modal"]')).toBeTruthy()
  })

  it('insufficient allowance keeps Approve enabled and does not broadcast', () => {
    const { onPrimaryAction } = mountRemove({
      primaryCtaLabel: 'Approve LP Token',
      removeActionReady: true,
    })
    render(<LiquidityRemovePanel />)
    fireEvent.click(screen.getByTestId('liquidity-remove-cta'))
    expect(onPrimaryAction).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('liquidity-remove-cta')).toHaveTextContent('Approve LP Token')
  })

  it('wrong chain requires switch-to-Ethereum without crashing', () => {
    mountRemove({
      primaryCtaLabel: 'Switch to Ethereum',
      removeActionReady: true,
    })
    render(<LiquidityRemovePanel />)
    expect(screen.getByTestId('liquidity-remove-cta')).toHaveTextContent('Switch to Ethereum')
    expect(screen.getByTestId('liquidity-v3-remove')).toBeTruthy()
  })

  it('missing pair stays controlled', () => {
    mountRemove({
      selectedPosition: undefined,
      pairLabel: 'Select a liquidity position',
      removeActionReady: false,
      primaryCtaLabel: 'Remove Liquidity',
      typedValueA: '',
      typedValueB: '',
    })
    render(<LiquidityRemovePanel />)
    expect(screen.getByTestId('liquidity-remove-cta')).toHaveTextContent('Select a position to remove')
    expect((screen.getByTestId('liquidity-remove-cta') as HTMLButtonElement).disabled).toBe(true)
  })
})
