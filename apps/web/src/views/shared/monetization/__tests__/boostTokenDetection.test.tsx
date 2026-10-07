import { useAccount, useSigner } from 'wagmi'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CommercialCheckoutModal } from '../CommercialCheckoutModal'

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: undefined })),
  useSigner: vi.fn(() => ({ data: undefined })),
}))
vi.mock('components/MarcoWidgets', () => ({ MarcoPay: () => null }))
vi.mock('components/ConnectWalletButton', () => ({
  default: (props: any) => <button {...props}>Connect Wallet</button>,
}))
vi.mock('lib/monetization/tokenDetectionBudget', () => ({
  TOKEN_DETECTION_TIMEOUT_MS: 200,
  TOKEN_DETECTION_TIMEOUT_MESSAGE:
    'Token detection timed out. Check the address and chain, then try Detect token again.',
}))

const TRUMPET = '0x5844cbFaD5702fF56A489C99dD791D748dE39E5D'
const M01 = '0x4034875250F797D00b819e9011c5BB9c2e799631'

function detectedPayload(name: string, symbol: string, identitySource: 'onchain' | 'factory' = 'onchain') {
  return {
    ok: true,
    tier: 'pending',
    identitySource,
    onChain: {
      verifiedDeployment: identitySource === 'onchain',
      name,
      symbol,
      decimals: 18,
      totalSupplyFormatted: '1000000000.0',
    },
    dex: { listed: true, name, symbol },
  }
}

function harness(options?: { hold?: string; fail?: string; hang?: boolean }) {
  const pending = new Map<string, Array<() => void>>()
  const release = (address: string) => {
    const waiters = pending.get(address.toLowerCase()) ?? []
    pending.delete(address.toLowerCase())
    waiters.forEach((resume) => resume())
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init?: { body?: string; signal?: AbortSignal }) => {
      const url = String(input)
      if (url.includes('/readiness')) {
        return { ok: true, json: async () => ({ executable: false, paymentMethods: { mCredits: false } }) }
      }
      if (url.includes('/pair-liquidity')) return { ok: true, json: async () => ({}) }
      if (url.includes('/eligible-targets')) return { ok: true, json: async () => ({ targets: [] }) }
      if (!url.includes('/onboard')) throw new Error(`Unexpected API: ${url}`)
      const body = JSON.parse(init?.body || '{}') as { contract?: string }
      const address = String(body.contract || '').toLowerCase()
      if (init?.signal?.aborted) {
        throw Object.assign(new Error('Aborted'), { name: 'AbortError' })
      }
      if (options?.hang) {
        await new Promise((_resolve, reject) => {
          const abort = () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
          init?.signal?.addEventListener('abort', abort, { once: true })
        })
      }
      if (options?.hold && address === options.hold.toLowerCase()) {
        await new Promise<void>((resolve, reject) => {
          const waiters = pending.get(address) ?? []
          waiters.push(resolve)
          pending.set(address, waiters)
          const abort = () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
          init?.signal?.addEventListener('abort', abort, { once: true })
        })
      }
      if (options?.fail && address === options.fail.toLowerCase()) {
        return {
          ok: false,
          json: async () => ({
            ok: false,
            reason: 'RPC read failed for chain 56. Retry or verify the contract on the explorer.',
          }),
        }
      }
      if (address === TRUMPET.toLowerCase()) {
        return { ok: true, json: async () => detectedPayload('TRUMPET', 'TRUMPET', 'factory') }
      }
      if (address === M01.toLowerCase()) {
        return { ok: true, json: async () => detectedPayload('MISSION 1', 'M01') }
      }
      return { ok: false, json: async () => ({ ok: false, reason: 'TOKEN_DETECTION_FAILED' }) }
    }),
  )
  return { release }
}

function addressInput() {
  return screen.getByPlaceholderText('Paste the token address (0x...)')
}

describe('Boost token detection', () => {
  beforeEach(() => {
    vi.mocked(useAccount).mockReturnValue({ address: undefined } as any)
    vi.mocked(useSigner).mockReturnValue({ data: undefined } as any)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('detects listed TRUMPET from a registry fallback and enables Continue', async () => {
    harness()
    render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    fireEvent.change(addressInput(), { target: { value: TRUMPET } })
    fireEvent.click(screen.getByTestId('commercial-detect-token'))
    expect((await screen.findAllByText('TRUMPET · $TRUMPET')).length).toBeGreaterThan(0)
    expect(screen.getByText('Listed')).toBeTruthy()
    expect(screen.getByTestId('commercial-detect-token').textContent).toBe('Detect token')
    expect(screen.getByTestId('commercial-checkout-next').hasAttribute('disabled')).toBe(false)
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    expect(screen.getByTestId('commercial-step-service')).toBeTruthy()
  })

  it('stops the spinner with an actionable error when detection fails', async () => {
    harness({ fail: TRUMPET })
    render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    fireEvent.change(addressInput(), { target: { value: TRUMPET } })
    fireEvent.click(screen.getByTestId('commercial-detect-token'))
    expect((await screen.findByTestId('commercial-checkout-error')).textContent).toMatch(/Retry or verify/i)
    expect(screen.getByTestId('commercial-detect-token').textContent).toBe('Detect token')
    expect(screen.getByTestId('commercial-checkout-next').hasAttribute('disabled')).toBe(false)
    expect(screen.queryByText('TRUMPET · $TRUMPET')).toBeNull()
  })

  it('ends a hung detection instead of leaving Detecting… up', async () => {
    harness({ hang: true })
    render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    fireEvent.change(addressInput(), { target: { value: TRUMPET } })
    fireEvent.click(screen.getByTestId('commercial-detect-token'))
    expect(screen.getByTestId('commercial-detect-token').textContent).toBe('Detecting…')
    expect(screen.getByTestId('commercial-checkout-next').hasAttribute('disabled')).toBe(true)
    await waitFor(() => {
      expect(screen.getByTestId('commercial-checkout-error').textContent).toMatch(/timed out/i)
      expect(screen.getByTestId('commercial-detect-token').textContent).toBe('Detect token')
    })
    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(screen.getByTestId('commercial-detect-token').textContent).toBe('Detect token')
    expect(screen.getByTestId('commercial-checkout-next').hasAttribute('disabled')).toBe(false)
  })

  it('ignores a late M01 response after TRUMPET is selected', async () => {
    const { release } = harness({ hold: M01 })
    render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    fireEvent.change(addressInput(), { target: { value: M01 } })
    fireEvent.click(screen.getByTestId('commercial-detect-token'))
    expect(screen.getByTestId('commercial-detect-token').textContent).toBe('Detecting…')
    fireEvent.change(addressInput(), { target: { value: TRUMPET } })
    fireEvent.click(screen.getByTestId('commercial-detect-token'))
    expect((await screen.findAllByText('TRUMPET · $TRUMPET')).length).toBeGreaterThan(0)
    release(M01)
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(screen.queryByText('MISSION 1 · $M01')).toBeNull()
    expect(screen.getAllByText('TRUMPET · $TRUMPET').length).toBeGreaterThan(0)
    expect(addressInput().getAttribute('value') ?? (addressInput() as HTMLInputElement).value).toBe(TRUMPET)
  })
})
