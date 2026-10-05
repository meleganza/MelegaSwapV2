import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { LiquidityPositionRow } from '../liquidityRuntime/useLiquidityPositions'
import { LiquidityMyPositionsModule } from '../modules/LiquidityMyPositionsModule'

let activeChainId = 56
let runtime: Record<string, any>

const switchNetworkAsync = vi.fn(async () => undefined)

vi.mock('../liquidityRuntime/LiquidityRuntimeContext', () => ({
  useLiquidityRuntime: () => runtime,
}))

vi.mock('../liquidityRuntime/useLiquidityPositions', async () => {
  const actual = await vi.importActual<typeof import('../liquidityRuntime/useLiquidityPositions')>(
    '../liquidityRuntime/useLiquidityPositions',
  )
  return {
    ...actual,
    useLiquidityPositionDetails: (row: LiquidityPositionRow) => ({
      usdValue: row.usdValue,
      poolShare: undefined,
      token0Deposited: undefined,
      token1Deposited: undefined,
    }),
  }
})

vi.mock('state/swap/useLPApr', () => ({ useLPApr: () => null }))
vi.mock('hooks/useActiveChainId', () => ({ useActiveChainId: () => ({ chainId: activeChainId }) }))
vi.mock('hooks/useSwitchNetwork', () => ({
  useSwitchNetwork: () => ({ switchNetworkAsync, isLoading: false }),
}))
vi.mock('components/ConnectWalletButton', () => ({
  default: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}))
vi.mock('design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar', () => ({
  MelegaTokenAvatar: () => <span data-testid="token-avatar" />,
}))
vi.mock('components/Logo/MelegaExploreChainBadge', () => ({
  MelegaExploreChainBadge: ({ chainId }: { chainId: number }) => <span data-testid="chain-badge">{chainId}</span>,
}))
vi.mock('components/ChainSwitchConfirmDialog', () => ({
  chainDisplayName: (chainId: number) => String(chainId),
  ChainSwitchConfirmDialog: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? (
      <button type="button" data-testid="confirm-chain-switch" onClick={onConfirm}>
        Confirm network switch
      </button>
    ) : null,
}))

function makePosition(index: number): LiquidityPositionRow {
  const chainId = index % 2 === 0 ? 8453 : 56
  const pairAddress = `0x${(index + 1).toString(16).padStart(40, '0')}`
  const token0 = {
    chainId,
    address: `0x${(index + 101).toString(16).padStart(40, '0')}`,
    symbol: `TOKEN${index}`,
    name: `Token ${index}`,
  }
  const token1 = {
    chainId,
    address: `0x${(index + 201).toString(16).padStart(40, '0')}`,
    symbol: 'USDC',
    name: 'USD Coin',
  }
  return {
    id: `${chainId}:${pairAddress.toLowerCase()}`,
    chainId,
    pairAddress,
    pairLabel: `${token0.symbol} / USDC`,
    pair: { token0, token1 } as LiquidityPositionRow['pair'],
    lpBalance: {
      greaterThan: () => true,
      toSignificant: () => '1',
      currency: { address: pairAddress },
    } as unknown as LiquidityPositionRow['lpBalance'],
    ownershipSource: 'DIRECT_WALLET_LP',
    poolTvlUsd: 25_000_000 - index * 100_000,
    poolTvlSource: 'factory-reserves-canonical-price-graph',
    usdValue: 100 - index,
  }
}

function visiblePositionIds(): string[] {
  return screen
    .getAllByTestId('liquidity-my-positions-card')
    .map((node) => node.getAttribute('data-position-id') as string)
}

describe('multichain My Liquidity browser acceptance', () => {
  beforeEach(() => {
    activeChainId = 56
    switchNetworkAsync.mockClear()
    runtime = {
      account: '0x0000000000000000000000000000000000000abc',
      positions: Array.from({ length: 25 }, (_, index) => makePosition(index)),
      positionsPhase: 'ready',
      positionsTimedOut: false,
      positionChainStatuses: [
        { chainId: 56, state: 'READY', positionCount: 12, scannedPairs: 517 },
        { chainId: 8453, state: 'READY', positionCount: 13, scannedPairs: 46 },
      ],
      setSelectedPositionId: vi.fn(),
      setMode: vi.fn(),
      setCurrencyA: vi.fn(),
      setCurrencyB: vi.fn(),
      retryPositions: vi.fn(),
    }
  })

  afterEach(cleanup)

  it.each([1440, 390])('renders the 20-row first page without horizontal shell overflow at %ipx', (width) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    render(<LiquidityMyPositionsModule />)

    expect(visiblePositionIds()).toEqual(runtime.positions.slice(0, 20).map((row: LiquidityPositionRow) => row.id))
    expect(screen.getByTestId('liquidity-my-positions-module')).toHaveStyle({ overflowX: 'hidden' })
    expect(screen.getByTestId('liquidity-my-positions-pagination')).toHaveTextContent('1–20 of 25')
  })

  it('keeps the global page stable when the active wallet network changes', async () => {
    const view = render(<LiquidityMyPositionsModule />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(visiblePositionIds()).toEqual(runtime.positions.slice(20).map((row: LiquidityPositionRow) => row.id))

    activeChainId = 1
    view.rerender(<LiquidityMyPositionsModule />)
    await waitFor(() =>
      expect(visiblePositionIds()).toEqual(runtime.positions.slice(20).map((row: LiquidityPositionRow) => row.id)),
    )
  })

  it('searches the full multichain set and preserves exact action identity through the switch gate', async () => {
    render(<LiquidityMyPositionsModule />)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search wallet liquidity positions' }), {
      target: { value: 'TOKEN0' },
    })
    expect(visiblePositionIds()).toEqual([runtime.positions[0].id])

    fireEvent.click(screen.getByTestId('liquidity-my-positions-manage'))
    fireEvent.click(screen.getByTestId('confirm-chain-switch'))

    await waitFor(() => {
      expect(switchNetworkAsync).toHaveBeenCalledWith(8453)
      expect(runtime.setSelectedPositionId).toHaveBeenCalledWith(runtime.positions[0].id)
      expect(runtime.setCurrencyA).toHaveBeenCalledWith(runtime.positions[0].pair.token0)
      expect(runtime.setCurrencyB).toHaveBeenCalledWith(runtime.positions[0].pair.token1)
      expect(runtime.setMode).toHaveBeenCalledWith('Add Liquidity', { syncUrl: false, preservePair: true })
    })

    fireEvent.click(screen.getByTestId('liquidity-my-positions-remove'))
    fireEvent.click(screen.getByTestId('confirm-chain-switch'))
    await waitFor(() => {
      expect(switchNetworkAsync).toHaveBeenCalledTimes(2)
      expect(runtime.setSelectedPositionId).toHaveBeenLastCalledWith(runtime.positions[0].id)
      expect(runtime.setMode).toHaveBeenLastCalledWith('Remove Liquidity', { syncUrl: false })
    })
  })
})
