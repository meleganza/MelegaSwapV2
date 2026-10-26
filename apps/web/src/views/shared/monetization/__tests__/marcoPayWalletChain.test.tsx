
import { useAccount, useSigner } from 'wagmi'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CommercialCheckoutModal } from '../CommercialCheckoutModal'

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: undefined })),
  useSigner: vi.fn(() => ({ data: undefined })),
}))
vi.mock('components/MarcoWidgets', () => ({
  MarcoPay: ({ onLaunch }: { onLaunch?: () => void }) => (
    <button type="button" data-testid="marco-pay-launch" onClick={() => onLaunch?.()}>
      PAY WITH MARCO
    </button>
  ),
}))
vi.mock('components/ConnectWalletButton', () => ({
  default: (props: any) => <button {...props}>Connect Wallet</button>,
}))

const ADDRESS = '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e'
let replaceLocation: ReturnType<typeof vi.fn>
let closePopup: ReturnType<typeof vi.fn>
let openPopup: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.mocked(useAccount).mockReturnValue({ address: ADDRESS, connector: { getProvider: async () => null } } as any)
  replaceLocation = vi.fn()
  closePopup = vi.fn()
  openPopup = vi.fn(() => ({ location: { replace: replaceLocation }, close: closePopup }))
  vi.stubGlobal('open', openPopup)
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, options?: any) => {
      if (String(input).includes('/onboard')) {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            tier: 'canonical',
            onChain: { verifiedDeployment: true, name: 'MM72', symbol: 'MM72', decimals: 18 },
            project: { displayName: 'MM72', slug: 'mm72' },
            dex: { listed: true },
          }),
        }
      }
      if (String(input).includes('/readiness')) {
        return { ok: true, json: async () => ({ executable: true, paymentMethods: { marco: true, mCredits: true } }) }
      }
      if (String(input).includes('/pair-liquidity')) return { ok: true, json: async () => ({}) }
      if (String(input).includes('/api/marco-pay/orders') && options?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({
            order: { orderId: 'mp_f150a1e791be1aa6eb72cfdd' },
            widget: {
              application: 'Melega DEX',
              amount: '79.00',
              currency: 'USD',
              reference: 'mp_f150a1e791be1aa6eb72cfdd',
            },
            payment_id: 'pay_fixture',
            approval_url: 'https://marco.melega.ai/pay/pay_fixture',
          }),
        }
      }
      if (String(input).includes('/api/marco-pay/orders')) {
        return {
          ok: true,
          json: async () => ({
            order: { state: 'CREATED' },
          }),
        }
      }
      throw new Error(`Unexpected API: ${input}`)
    }),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

async function openMarcoReview() {
  render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
  fireEvent.change(screen.getByPlaceholderText('Paste the token address (0x...)'), { target: { value: ADDRESS } })
  fireEvent.click(screen.getByRole('button', { name: 'Detect token' }))
  await screen.findByText('Project Page @mm72')
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-service-trend-boost'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-pkg-trend_24h'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  await waitFor(() => expect(screen.getByTestId('commercial-pay-MARCO_PAY').hasAttribute('disabled')).toBe(false))
  fireEvent.click(screen.getByTestId('commercial-pay-MARCO_PAY'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  await screen.findByText(/awaiting canonical MARCO Pay settlement/)
}

describe('MARCO Pay Gateway handoff', () => {
  it('opens only the canonical hosted payment and never sends a DEX wallet transaction', async () => {
    const sendTransaction = vi.fn()
    vi.mocked(useSigner).mockReturnValue({
      data: { getChainId: async () => 1, sendTransaction: vi.fn() },
    } as any)
    await openMarcoReview()
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() => expect(replaceLocation).toHaveBeenCalledWith('https://marco.melega.ai/pay/pay_fixture'))
    expect(sendTransaction).not.toHaveBeenCalled()
    expect(openPopup).toHaveBeenCalledTimes(1)
  })

  it('does not use the browser wallet chain as payment authority', async () => {
    const sendTransaction = vi.fn()
    vi.mocked(useSigner).mockReturnValue({
      data: { getChainId: async () => 56, sendTransaction },
    } as any)
    await openMarcoReview()
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() => expect(replaceLocation).toHaveBeenCalledWith('https://marco.melega.ai/pay/pay_fixture'))
    expect(sendTransaction).not.toHaveBeenCalled()
  })

  it('double-clicking PAY does not create a second order or hosted handoff', async () => {
    await openMarcoReview()
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() => expect(replaceLocation).toHaveBeenCalledTimes(1))
    expect(openPopup).toHaveBeenCalledTimes(1)
    const creates = (global.fetch as any).mock.calls.filter(
      (call: any[]) => String(call[0]).includes('/api/marco-pay/orders') && call[1]?.method === 'POST',
    )
    expect(creates).toHaveLength(1)
  })
})
