import './restoreSetImmediate'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { readFileSync } from 'fs'
import path from 'path'

const CONNECTED_ADDRESS = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'
const SHORT_ADDRESS = '0xA08f…4513'

type HeaderWalletTestState = {
  address: string | undefined
  disconnect: ReturnType<typeof vi.fn>
  mountCalls: Array<{ launcher: boolean }>
  connect: ReturnType<typeof vi.fn>
  sdkDisconnect: ReturnType<typeof vi.fn>
  getState: ReturnType<typeof vi.fn>
  open: ReturnType<typeof vi.fn>
  destroy: ReturnType<typeof vi.fn>
  disconnectHandler: undefined | (() => void)
}

const getState = (): HeaderWalletTestState => {
  const current = (globalThis as typeof globalThis & { __marcoHeaderWalletTest?: HeaderWalletTestState }).__marcoHeaderWalletTest
  if (!current) {
    throw new Error('header wallet test state was not initialized')
  }
  return current
}

vi.mock('wagmi', () => {
  const state: HeaderWalletTestState = {
    address: undefined,
    disconnect: vi.fn(),
    mountCalls: [],
    connect: vi.fn().mockResolvedValue(undefined),
    sdkDisconnect: vi.fn(),
    getState: vi.fn(() => ({ connected: false })),
    open: vi.fn(),
    destroy: vi.fn(),
    disconnectHandler: undefined,
  }
  ;(globalThis as typeof globalThis & { __marcoHeaderWalletTest?: HeaderWalletTestState }).__marcoHeaderWalletTest = state
  return {
    useAccount: () => ({ address: state.address }),
    useDisconnect: () => ({ disconnect: state.disconnect }),
    useConnect: () => ({ connectAsync: vi.fn() }),
  }
})

vi.mock('./loadMarcoWidgetScript', () => ({
  loadMarcoWidgetScript: vi.fn(async () => undefined),
}))

vi.mock('@pancakeswap/localization', () => ({
  useTranslation: () => ({ t: (key: string) => key, currentLanguage: { code: 'en' } }),
  Trans: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@pancakeswap/uikit', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}))

vi.mock('hooks/useAuth', () => ({
  default: () => ({ login: vi.fn() }),
}))

vi.mock('hooks/useActiveChainId', () => ({
  useActiveChainId: () => ({ chainId: 56 }),
}))

vi.mock('hooks/useEagerConnect.bmp.ts', () => ({
  useActiveHandle: () => vi.fn(),
}))

vi.mock('config/wallet', () => ({
  createWallets: () => [],
  getDocLink: () => 'https://docs.example',
}))

vi.mock('utils/wagmi', () => ({
  loadExtendedWalletConnectors: () => Promise.resolve(),
}))

vi.mock('@pancakeswap/ui-wallets', () => ({
  WalletModalV2: () => null,
}))

vi.mock('next/dynamic', () => ({
  default: () =>
    function WalletModalV2({ isOpen }: { isOpen?: boolean }) {
      return isOpen ? (
        <div role="dialog" data-testid="wallet-modal-v2">
          Provider Modal
        </div>
      ) : null
    },
}))

import ConnectWalletButton from 'components/ConnectWalletButton'
import { MarcoConnect } from './MarcoConnect'

function injectOfficialSdkFallback() {
  if (document.querySelector('[data-marco-connect-fallback-anchor]')) return
  const fallback = document.createElement('button')
  fallback.setAttribute('data-marco-connect-fallback-anchor', '')
  fallback.textContent = 'MARCO CONNECT'
  fallback.style.position = 'fixed'
  fallback.style.right = '16px'
  fallback.style.bottom = '16px'
  document.body.appendChild(fallback)
}

function installOfficialSdk(options?: { forceLauncher?: boolean }) {
  const state = getState()
  ;(window as Window & { MarcoConnect?: { mount: Function } }).MarcoConnect = {
    mount: (_target: HTMLElement, mountOptions: { launcher: boolean }) => {
      state.mountCalls.push({ launcher: mountOptions.launcher })
      const launcherEnabled = options?.forceLauncher ?? mountOptions.launcher
      if (launcherEnabled !== false) {
        injectOfficialSdkFallback()
        window.setTimeout(injectOfficialSdkFallback, 2200)
        window.setTimeout(injectOfficialSdkFallback, 7200)
      }
      return {
        connect: state.connect,
        disconnect: state.sdkDisconnect,
        getState: state.getState,
        on: (event: 'disconnect', handler: () => void) => {
          if (event === 'disconnect') state.disconnectHandler = handler
          return () => undefined
        },
        open: state.open,
        destroy: state.destroy,
      }
    },
  }
}

function assertNoFloatingMarcoFallback() {
  expect(document.querySelector('[data-marco-connect-fallback-anchor]')).toBeNull()
  const floating = Array.from(document.querySelectorAll('body *')).filter((node) => {
    if (!(node instanceof HTMLElement)) return false
    const style = node.style
    const isFixedCorner = style.position === 'fixed' && style.right !== '' && style.bottom !== ''
    return isFixedCorner && (node.textContent || '').includes('MARCO CONNECT')
  })
  expect(floating).toHaveLength(0)
}

async function renderReadyMarco(ui: React.ReactElement = <MarcoConnect />) {
  const view = render(ui)
  await waitFor(() => expect(screen.getByTestId('marco-connect')).toHaveAttribute('data-marco-connect-ready', 'true'))
  return view
}

describe('P0 header wallet dead-click + fallback suppression', () => {
  beforeEach(() => {
    const state = getState()
    state.address = undefined
    state.disconnect.mockClear()
    state.mountCalls.length = 0
    state.connect.mockReset().mockResolvedValue(undefined)
    state.open.mockReset()
    state.destroy.mockReset()
    state.getState.mockReset().mockReturnValue({ connected: false })
    state.disconnectHandler = undefined
    document.querySelectorAll('[data-marco-connect-fallback-anchor]').forEach((node) => node.remove())
    installOfficialSdk()
  })

  afterEach(() => {
    cleanup()
    document.querySelectorAll('[data-marco-connect-fallback-anchor]').forEach((node) => node.remove())
  })

  it('keeps ConnectWalletButton handleClick when buttonProps uses capture-phase intent', async () => {
    const intent = vi.fn()
    render(
      <ConnectWalletButton onClickCapture={intent} aria-label="In-page Connect Wallet">
        Connect Wallet
      </ConnectWalletButton>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'In-page Connect Wallet' }))

    expect(intent).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByTestId('wallet-modal-v2')).toBeInTheDocument())
  })

  it('documents that a buttonProps onClick replaces internal handleClick', async () => {
    const intent = vi.fn()
    render(
      <ConnectWalletButton onClick={intent} aria-label="Broken override">
        Connect Wallet
      </ConnectWalletButton>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Broken override' }))

    expect(intent).toHaveBeenCalledTimes(1)
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(screen.queryByTestId('wallet-modal-v2')).not.toBeInTheDocument()
  })

  it('disconnected canonical header MARCO CONNECT opens the real provider/modal path and preserves passport intent', async () => {
    const state = getState()
    const { rerender } = await renderReadyMarco()

    fireEvent.click(screen.getByRole('button', { name: 'MARCO Connect' }))

    await waitFor(() => expect(screen.getByTestId('wallet-modal-v2')).toBeInTheDocument())

    state.connect.mockImplementation(async () => {
      state.getState.mockReturnValue({ connected: true })
    })
    state.address = CONNECTED_ADDRESS
    rerender(<MarcoConnect />)

    await waitFor(() => {
      expect(state.connect).toHaveBeenCalled()
      expect(state.open).toHaveBeenCalled()
    })
  })

  it('disconnected header click opens the same provider/modal as the in-page Connect Wallet control', async () => {
    await renderReadyMarco(
      <div>
        <MarcoConnect />
        <ConnectWalletButton aria-label="In-page Connect Wallet">Connect Wallet</ConnectWalletButton>
      </div>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'MARCO Connect' }))
    await waitFor(() => expect(screen.getByTestId('wallet-modal-v2')).toBeInTheDocument())
  })

  it('connected state keeps one abbreviated address surface, no extra CONNECT, and disconnect stays wired', async () => {
    const state = getState()
    state.address = CONNECTED_ADDRESS
    state.getState.mockReturnValue({ connected: true })
    await renderReadyMarco()

    const addressButton = screen.getByTestId('marco-connect-connected-address')
    expect(addressButton).toBeVisible()
    expect(addressButton).toHaveTextContent(SHORT_ADDRESS)
    expect(screen.queryByText('MARCO CONNECT')).not.toBeVisible()
    expect(screen.getAllByTestId('marco-connect')).toHaveLength(1)

    fireEvent.click(addressButton)
    await waitFor(() => expect(state.open).toHaveBeenCalled())

    expect(state.disconnectHandler).toEqual(expect.any(Function))
    act(() => {
      state.disconnectHandler?.()
    })
    expect(state.disconnect).toHaveBeenCalledTimes(1)
  })

  it('suppresses the official SDK body fallback at t0, >=2.2s, and >=7.2s across connected and unmounted transitions', async () => {
    const state = getState()
    const { rerender, unmount } = await renderReadyMarco()
    expect(state.mountCalls[0]?.launcher).toBe(false)
    assertNoFloatingMarcoFallback()

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2200))
    })
    assertNoFloatingMarcoFallback()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000))
    })
    assertNoFloatingMarcoFallback()

    state.address = CONNECTED_ADDRESS
    rerender(<MarcoConnect />)
    expect(screen.getByTestId('marco-connect-connected-address')).toHaveTextContent(SHORT_ADDRESS)
    assertNoFloatingMarcoFallback()

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 7200))
    })
    assertNoFloatingMarcoFallback()

    unmount()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 7200))
    })
    assertNoFloatingMarcoFallback()
  }, 40000)

  it('would inject the founder floating fallback only when launcher is left enabled', async () => {
    installOfficialSdk({ forceLauncher: true })
    render(<MarcoConnect />)
    await waitFor(() => expect(document.querySelector('[data-marco-connect-fallback-anchor]')).not.toBeNull())
    const fallback = document.querySelector('[data-marco-connect-fallback-anchor]') as HTMLElement
    expect(fallback.style.position).toBe('fixed')
    expect(fallback.style.right).toBe('16px')
    expect(fallback.style.bottom).toBe('16px')
  })
})

describe('P0 header wallet source contracts', () => {
  it('uses capture-phase intent on the canonical visible control without replacing handleClick', () => {
    const marco = readFileSync(path.join(__dirname, 'MarcoConnect.tsx'), 'utf8')
    const connectWallet = readFileSync(path.join(__dirname, '../ConnectWalletButton.tsx'), 'utf8')

    expect(connectWallet).toContain('onClick={handleClick}')
    expect(connectWallet).toMatch(/onClick=\{handleClick\}[\s\S]*\{\.\.\.buttonProps\}/)
    expect(marco).toContain('launcher: false')
    expect(marco).toMatch(/<ConnectWalletButton[\s\S]*onClickCapture=\{\(\) => \{[\s\S]*passportIntentRef\.current = true/)
    expect(marco).not.toMatch(/<ConnectWalletButton[\s\S]*onClick=\{\(\) => \{[\s\S]*passportIntentRef\.current = true/)
    expect(marco).not.toContain('data-marco-connect-fallback-anchor')
  })
})
