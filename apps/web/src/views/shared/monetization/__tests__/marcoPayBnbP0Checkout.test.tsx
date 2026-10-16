import { useAccount, useSigner } from 'wagmi'
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RC_COPY } from 'lib/monetization/copy'
import { MARCO_REFERRAL_STORAGE_KEY } from 'lib/marco-referral/client'
import { MARCO_PAY_PROVIDER_UNAVAILABLE, MARCO_PAY_WALLET_COPY } from 'lib/marco-pay/preparedCheckout'
import { resolvePaymentWalletForSettlement } from 'lib/monetization/paymentWalletChain'
import { CommercialCheckoutModal } from '../CommercialCheckoutModal'

/**
 * Production P0 (Boost Your Project → TRUMPET → Trend Boost 6h → MARCO Pay on BNB,
 * landing ?ref=2mjywytuw5&rd=melega-dex). Captured on the d92aa4703 production
 * deployment: with no connected EVM account, "Review and pay" replaced
 * "Connect wallet" with "MARCO Pay is temporarily unavailable.".
 */

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: undefined })),
  useSigner: vi.fn(() => ({ data: undefined })),
}))
vi.mock('lib/monetization/paymentWalletChain', async () => {
  const actual = await vi.importActual<typeof import('lib/monetization/paymentWalletChain')>(
    'lib/monetization/paymentWalletChain',
  )
  return { ...actual, resolvePaymentWalletForSettlement: vi.fn(actual.resolvePaymentWalletForSettlement) }
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

const TRUMPET = '0x5844cbFaD5702fF56A489C99dD791D748dE39E5D'
const BUYER = '0x8894e0a0c962cb723c1976a4421c95949be2d4e3'
const TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'
const MARCO_BSC = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
/** Wallet transfer exactly as returned by production POST /api/marco-pay/orders (2026-10-09, referral applied). */
const WALLET = {
  chainId: 56,
  tokenAddress: MARCO_BSC,
  destination: TREASURY,
  marcoAmountMinor: '10469735',
  tokenAmountRaw: '104697350000000000000000',
  to: MARCO_BSC,
  data: '0xa9059cbb000000000000000000000000b6436ef4c7f76be0f26c0c5c9db72f2689abf65b00000000000000000000000000000000000000000000162ba79b7aaa77a70000',
  value: '0x0',
}
/** The ethers error the production checkout surfaced raw for a wallet without enough MARCO. */
const PROD_INSUFFICIENT_MARCO = Object.assign(
  new Error(
    'cannot estimate gas; transaction may fail or may require manual gas limit [ See: https://links.ethers.org/v5-errors-UNPREDICTABLE_GAS_LIMIT ] (reason="execution reverted: ERC20: transfer amount exceeds balance", method="estimateGas")',
  ),
  { code: 'UNPREDICTABLE_GAS_LIMIT', reason: 'execution reverted: ERC20: transfer amount exceeds balance' },
)

function seedReferral() {
  localStorage.setItem(
    MARCO_REFERRAL_STORAGE_KEY,
    JSON.stringify({
      code: '2mjywytuw5',
      capturedAt: Date.now(),
      expiresAt: Date.now() + 86_400_000,
      verifiedAt: Date.now(),
      status: 'VERIFIED',
      destinationRef: 'melega-dex',
      campaignRef: null,
    }),
  )
}

function orderResponse(orderId: string, body: any) {
  const referral = body.referralCode === '2mjywytuw5'
  return {
    ok: true,
    status: 201,
    json: async () => ({
      payment_id: `pay_${orderId}`,
      approval_url: `https://marco.melega.ai/pay/pay_${orderId}`,
      wallet: WALLET,
      order: {
        orderId,
        state: 'AWAITING_WALLET',
        chainId: 56,
        destinationWallet: TREASURY,
        referenceAmountMinor: referral ? '2610' : '2900',
        referralApplied: referral,
        referralCode: referral ? '2mjywytuw5' : null,
        referralDiscountMinor: referral ? '290' : null,
      },
      widget: { application: 'app_example', amount: referral ? '2610' : '2900', currency: 'USD', reference: orderId },
    }),
  }
}

function installFetch(options: { orderStates?: string[] } = {}) {
  let posts = 0
  let polls = 0
  const fetchMock = vi.fn(async (input: string, init?: any) => {
    const url = String(input)
    if (url.includes('/onboard')) {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          tier: 'canonical',
          onChain: { verifiedDeployment: true, name: 'TRUMPET', symbol: 'TRUMPET', decimals: 18 },
          project: { displayName: 'TRUMPET', slug: 'trumpet' },
          dex: { listed: true },
        }),
      }
    }
    if (url.includes('/readiness')) {
      return { ok: true, json: async () => ({ executable: true, reason: null, paymentMethods: { marco: true, mCredits: true } }) }
    }
    if (url.includes('/pair-liquidity')) return { ok: true, json: async () => ({ bnbUsd: 600 }) }
    if (url.includes('/api/marco-pay/orders') && init?.method === 'POST') {
      posts += 1
      return orderResponse(`mp_${posts}`, JSON.parse(init.body))
    }
    if (url.includes('/api/marco-pay/orders')) {
      const states = options.orderStates ?? ['AWAITING_WALLET']
      const state = states[Math.min(polls, states.length - 1)]
      polls += 1
      return { ok: true, json: async () => ({ order: { state, durationMs: 21_600_000, activatedAt: null } }) }
    }
    throw new Error(`Unexpected API: ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function orderPosts() {
  return (global.fetch as any).mock.calls
    .filter((call: any[]) => String(call[0]).includes('/api/marco-pay/orders') && call[1]?.method === 'POST')
    .map((call: any[]) => JSON.parse(call[1].body))
}

function renderModal() {
  return render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" chainId={56} identityReady />)
}

async function reachReview() {
  fireEvent.change(screen.getByPlaceholderText('Paste the token address (0x...)'), { target: { value: TRUMPET } })
  fireEvent.click(screen.getByRole('button', { name: 'Detect token' }))
  await screen.findByText('Project Page @trumpet')
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-service-trend-boost'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-pkg-trend_6h'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  await waitFor(() => expect(screen.getByTestId('commercial-pay-MARCO_PAY').hasAttribute('disabled')).toBe(false))
  fireEvent.click(screen.getByTestId('commercial-pay-MARCO_PAY'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  await screen.findByTestId('commercial-step-review')
}

function connect(address: string | undefined) {
  vi.mocked(useAccount).mockReturnValue({ address, connector: { getProvider: async () => null } } as any)
}

function paymentWallet(sendTransaction: (...args: any[]) => any, chainId = 56) {
  vi.mocked(useSigner).mockReturnValue({ data: { getChainId: async () => chainId, sendTransaction } } as any)
  vi.mocked(resolvePaymentWalletForSettlement).mockResolvedValue({ chainId, signer: { sendTransaction }, source: 'payment_wallet' } as any)
}

beforeEach(() => {
  localStorage.clear()
  connect(undefined)
  vi.mocked(useSigner).mockReturnValue({ data: undefined } as any)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.mocked(resolvePaymentWalletForSettlement).mockReset()
})

describe('BNB MARCO Pay P0 — Boost TRUMPET Trend Boost 6h with referral', () => {
  it('without a connected wallet offers Connect Wallet instead of an outage and creates no order', async () => {
    seedReferral()
    installFetch()
    renderModal()
    await reachReview()
    expect(screen.getByTestId('commercial-checkout-connect')).toBeTruthy()
    expect(screen.queryByTestId('commercial-checkout-pay')).toBeNull()
    expect(screen.queryByText(MARCO_PAY_PROVIDER_UNAVAILABLE)).toBeNull()
    expect(orderPosts()).toHaveLength(0)
  })

  it('prepares one referral order on BNB to the canonical treasury once the wallet connects', async () => {
    seedReferral()
    installFetch()
    const view = renderModal()
    await reachReview()
    connect(BUYER)
    view.rerender(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" chainId={56} identityReady />)
    await screen.findByText(/awaiting canonical MARCO Pay settlement/)
    const posts = orderPosts()
    expect(posts).toHaveLength(1)
    expect(posts[0]).toMatchObject({
      buyerWallet: BUYER,
      serviceId: 'trend-boost',
      packageId: 'trend_6h',
      projectContract: TRUMPET.toLowerCase(),
      referralCode: '2mjywytuw5',
      referralDestination: 'melega-dex',
    })
    expect(screen.getByText(/Referral recognised/)).toBeTruthy()
    expect(screen.queryByText(MARCO_PAY_PROVIDER_UNAVAILABLE)).toBeNull()
  })

  it('without the referral parameter sends no referral and keeps the listed price', async () => {
    installFetch()
    connect(BUYER)
    renderModal()
    await reachReview()
    await screen.findByText(/awaiting canonical MARCO Pay settlement/)
    expect(orderPosts()[0].referralCode).toBeNull()
    expect(screen.queryByText(/Referral recognised/)).toBeNull()
  })

  it('reports an insufficient MARCO balance plainly instead of the raw ethers error or an outage', async () => {
    seedReferral()
    installFetch()
    connect(BUYER)
    const sendTransaction = vi.fn(async () => {
      throw PROD_INSUFFICIENT_MARCO
    })
    paymentWallet(sendTransaction)
    renderModal()
    await reachReview()
    await screen.findByText(/awaiting canonical MARCO Pay settlement/)
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() =>
      expect(screen.getByTestId('commercial-checkout-error').textContent).toBe(MARCO_PAY_WALLET_COPY.insufficientMarco),
    )
    expect(sendTransaction).toHaveBeenCalledWith({ to: WALLET.to, value: WALLET.value, data: WALLET.data, chainId: 56 })
    expect(screen.queryByText(/UNPREDICTABLE_GAS_LIMIT/)).toBeNull()
    expect(screen.queryByText(MARCO_PAY_PROVIDER_UNAVAILABLE)).toBeNull()
    expect(screen.queryByTestId('commercial-checkout-success')).toBeNull()
  })

  it('a wallet rejection cancels without creating a second order on retry', async () => {
    installFetch()
    connect(BUYER)
    const sendTransaction = vi.fn(async () => {
      throw Object.assign(new Error('User rejected the request.'), { code: 4001 })
    })
    paymentWallet(sendTransaction)
    renderModal()
    await reachReview()
    await screen.findByText(/awaiting canonical MARCO Pay settlement/)
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() => expect(screen.getByTestId('commercial-checkout-error').textContent).toBe(RC_COPY.paymentCancelled))
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() => expect(sendTransaction).toHaveBeenCalledTimes(2))
    expect(orderPosts()).toHaveLength(1)
  })

  it('a wrong payment chain never sends the transfer', async () => {
    installFetch()
    connect(BUYER)
    const sendTransaction = vi.fn()
    paymentWallet(sendTransaction, 8453)
    renderModal()
    await reachReview()
    await screen.findByText(/awaiting canonical MARCO Pay settlement/)
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() => expect(screen.getByTestId('commercial-checkout-error')).toBeTruthy())
    expect(sendTransaction).not.toHaveBeenCalled()
    expect(screen.queryByText(MARCO_PAY_PROVIDER_UNAVAILABLE)).toBeNull()
  })

  it('does not activate before verified settlement and shows success only on ACTIVE', async () => {
    installFetch({ orderStates: ['AWAITING_WALLET', 'ONCHAIN_PENDING', 'PAYMENT_CONFIRMED', 'ACTIVE'] })
    connect(BUYER)
    const sendTransaction = vi.fn(async () => ({ hash: `0x${'b'.repeat(64)}` }))
    paymentWallet(sendTransaction)
    renderModal()
    await reachReview()
    await screen.findByText(/awaiting canonical MARCO Pay settlement/)
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() => expect(sendTransaction).toHaveBeenCalledTimes(1))
    expect(screen.queryByTestId('commercial-checkout-success')).toBeNull()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 8_000))
    })
    await waitFor(() => expect(screen.getByTestId('commercial-checkout-success')).toBeTruthy(), { timeout: 4_000 })
    expect(orderPosts()).toHaveLength(1)
  }, 20_000)
})
