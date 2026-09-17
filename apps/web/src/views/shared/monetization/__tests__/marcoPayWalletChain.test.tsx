import React from 'react'
import { useAccount, useSigner } from 'wagmi'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CommercialCheckoutModal } from '../CommercialCheckoutModal'
import { RC_COPY } from 'lib/monetization/copy'
import { assessPaymentWalletChain, resolvePaymentWalletForSettlement } from 'lib/monetization/paymentWalletChain'

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: undefined })),
  useSigner: vi.fn(() => ({ data: undefined })),
}))
vi.mock('lib/monetization/paymentWalletChain', async () => {
  const actual = await vi.importActual<typeof import('lib/monetization/paymentWalletChain')>(
    'lib/monetization/paymentWalletChain',
  )
  return {
    ...actual,
    resolvePaymentWalletForSettlement: vi.fn(actual.resolvePaymentWalletForSettlement),
  }
})
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
const WALLET = {
  to: '0x55d398326f99059ff775485246999027b3197955',
  value: '0x0',
  data: '0xa9059cbb',
  chainId: 56,
}

beforeEach(() => {
  vi.mocked(useAccount).mockReturnValue({ address: ADDRESS, connector: { getProvider: async () => null } } as any)
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
            wallet: WALLET,
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
  vi.mocked(resolvePaymentWalletForSettlement).mockReset()
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
  fireEvent.click(screen.getByTestId('commercial-pay-MARCO_PAY'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  await screen.findByText(/awaiting canonical MARCO Pay settlement/)
}

describe('MARCO Pay payment-wallet chain', () => {
  it('recognizes a BNB 56 payment wallet even when the wagmi signer still reports Ethereum', async () => {
    const sendTransaction = vi.fn(async () => ({ hash: `0x${'a'.repeat(64)}` }))
    vi.mocked(useSigner).mockReturnValue({
      data: { getChainId: async () => 1, sendTransaction: vi.fn() },
    } as any)
    vi.mocked(resolvePaymentWalletForSettlement).mockResolvedValue({
      chainId: 56,
      signer: { sendTransaction },
      source: 'payment_wallet',
    })
    expect(assessPaymentWalletChain(56).ok).toBe(true)
    await openMarcoReview()
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() => expect(sendTransaction).toHaveBeenCalledTimes(1))
    expect(screen.queryByText(RC_COPY.wrongNetwork)).toBeNull()
    await waitFor(() => expect(screen.getByTestId('commercial-checkout-processing')).toBeTruthy())
  })

  it('asks to switch when the payment wallet is on Ethereum and does not fall back to a generic error', async () => {
    const sendTransaction = vi.fn()
    vi.mocked(useSigner).mockReturnValue({
      data: { getChainId: async () => 56, sendTransaction },
    } as any)
    vi.mocked(resolvePaymentWalletForSettlement).mockResolvedValue({
      chainId: 1,
      signer: { sendTransaction },
      source: 'payment_wallet',
    })
    await openMarcoReview()
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() => expect(screen.getByTestId('commercial-checkout-error').textContent).toBe(RC_COPY.wrongNetwork))
    expect(screen.getByTestId('wallet-flow-status').getAttribute('data-wallet-stage')).toBe('switch_network')
    expect(sendTransaction).not.toHaveBeenCalled()
    expect(screen.queryByText(RC_COPY.errorRetry)).toBeNull()
  })

  it('double-clicking PAY does not create a second order or transfer', async () => {
    let release: (() => void) | undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const sendTransaction = vi.fn(async () => {
      await gate
      return { hash: `0x${'b'.repeat(64)}` }
    })
    vi.mocked(useSigner).mockReturnValue({
      data: { getChainId: async () => 56, sendTransaction },
    } as any)
    vi.mocked(resolvePaymentWalletForSettlement).mockResolvedValue({
      chainId: 56,
      signer: { sendTransaction },
      source: 'payment_wallet',
    })
    await openMarcoReview()
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    release?.()
    await waitFor(() => expect(sendTransaction).toHaveBeenCalledTimes(1))
    const creates = (global.fetch as any).mock.calls.filter(
      (call: any[]) => String(call[0]).includes('/api/marco-pay/orders') && call[1]?.method === 'POST',
    )
    expect(creates).toHaveLength(1)
  })
})
