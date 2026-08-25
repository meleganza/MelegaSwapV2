import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const useAccount = vi.fn()
const useConnect = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => useAccount(),
  useConnect: () => useConnect(),
}))

vi.mock('components/ConnectWalletButton', () => ({
  default: ({ children, className }: { children?: string; className?: string }) => (
    <button type="button" className={className} data-testid="connect-wallet-fallback">
      {children}
    </button>
  ),
}))

vi.mock('../loadMarcoWidgetScript', () => ({
  loadMarcoWidgetScript: () => new Promise(() => undefined),
}))

describe('MarcoConnect host park', () => {
  beforeEach(() => {
    useAccount.mockReturnValue({ address: undefined })
    useConnect.mockReturnValue({ connectAsync: vi.fn(), connectors: [] })
    document.querySelectorAll('[data-marco-connect-fallback-anchor]').forEach((node) => node.remove())
  })

  afterEach(() => {
    cleanup()
  })

  it('keeps the canonical host mounted and hides the surface when connected', async () => {
    const { MarcoConnect } = await import('../MarcoConnect')
    const { rerender } = render(<MarcoConnect size="navbar" />)

    expect(screen.getByTestId('marco-connect')).toBeTruthy()
    expect(screen.getByTestId('connect-wallet-fallback').textContent).toBe('Connect Wallet')
    expect(screen.getByTestId('marco-connect').hasAttribute('hidden')).toBe(false)

    useAccount.mockReturnValue({ address: '0x54b9aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaE029' })
    rerender(<MarcoConnect size="navbar" />)

    const parked = screen.getByTestId('marco-connect')
    expect(parked).toBeTruthy()
    expect(parked.getAttribute('data-marco-connect-parked')).toBe('true')
    expect(parked.hasAttribute('hidden')).toBe(true)
  })

  it('sweeps a widget fallback-anchor so no bottom-right MARCO CONNECT can remain', async () => {
    const { MarcoConnect } = await import('../MarcoConnect')
    const { unmount } = render(<MarcoConnect size="navbar" />)

    const floating = document.createElement('div')
    floating.setAttribute('data-marco-connect-fallback-anchor', '')
    floating.style.cssText = 'position:fixed;right:12px;bottom:12px;'
    const cta = document.createElement('button')
    cta.setAttribute('aria-label', 'MARCO Connect')
    cta.textContent = 'CONNECT'
    floating.appendChild(cta)
    document.body.appendChild(floating)

    expect(document.querySelector('[data-marco-connect-fallback-anchor]')).toBeTruthy()
    unmount()
    expect(document.querySelector('[data-marco-connect-fallback-anchor]')).toBeNull()
    expect(document.querySelector('[aria-label="MARCO Connect"]')).toBeNull()
  })
})
