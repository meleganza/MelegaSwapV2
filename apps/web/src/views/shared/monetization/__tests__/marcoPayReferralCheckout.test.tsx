import { useAccount, useSigner } from 'wagmi'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MARCO_REFERRAL_STORAGE_KEY } from 'lib/marco-referral/client'
import { MARCO_PAY_PREPARED_QUOTE_TTL_MS } from 'lib/marco-pay/preparedCheckout'
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
const OTHER = '0x1111111111111111111111111111111111111111'
const WALLET = {
  to: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
  value: '0x0',
  data: '0xa9059cbb',
  chainId: 56,
}

function detection() {
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

function orderResponse(orderId: string) {
  return {
    ok: true,
    status: 201,
    json: async () => ({
      order: {
        orderId,
        referralApplied: false,
        referralCode: null,
        referralDiscountMinor: null,
        referenceAmountMinor: '2900',
      },
      widget: {
        application: 'app_example',
        amount: '2900',
        currency: 'USD',
        reference: orderId,
      },
      payment_id: `pay_${orderId}`,
      approval_url: `https://marco.melega.ai/pay/pay_${orderId}`,
      wallet: WALLET,
    }),
  }
}

function installFetch(options?: { readiness?: Record<string, unknown>; order?: (body: any, count: number) => any }) {
  let orders = 0
  const fetchMock = vi.fn(async (input: string, init?: any) => {
    const url = String(input)
    if (url.includes('/onboard')) return detection()
    if (url.includes('/readiness')) {
      return {
        ok: true,
        json: async () => options?.readiness ?? { executable: true, reason: null, paymentMethods: { marco: true, mCredits: true } },
      }
    }
    if (url.includes('/pair-liquidity')) return { ok: true, json: async () => ({ bnbUsd: 700 }) }
    if (url.includes('/api/marco-pay/orders') && init?.method === 'POST') {
      orders += 1
      const body = JSON.parse(init.body)
      if (options?.order) return options.order(body, orders)
      return orderResponse(`mp_${orders}`)
    }
    if (url.includes('/api/marco-pay/orders')) {
      return { ok: true, json: async () => ({ order: { state: 'CREATED' } }) }
    }
    throw new Error(`Unexpected API: ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  return { fetchMock, orderPosts: () => orders }
}

async function reachPaymentStep() {
  render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
  fireEvent.change(screen.getByPlaceholderText('Paste the token address (0x...)'), { target: { value: ADDRESS } })
  fireEvent.click(screen.getByRole('button', { name: 'Detect token' }))
  await screen.findByText('Project Page @trumpet')
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-service-trend-boost'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-pkg-trend_6h'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
}

async function reachMarcoReview() {
  await reachPaymentStep()
  await waitFor(() => expect(screen.getByTestId('commercial-pay-MARCO_PAY').hasAttribute('disabled')).toBe(false))
  fireEvent.click(screen.getByTestId('commercial-pay-MARCO_PAY'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  await screen.findByText(/awaiting canonical MARCO Pay settlement/)
}

function orderPosts() {
  return (global.fetch as any).mock.calls.filter(
    (call: any[]) => String(call[0]).includes('/api/marco-pay/orders') && call[1]?.method === 'POST',
  )
}

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

beforeEach(() => {
  localStorage.clear()
  vi.mocked(useAccount).mockReturnValue({ address: ADDRESS, connector: { getProvider: async () => null } } as any)
  vi.mocked(useSigner).mockReturnValue({ data: undefined } as any)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('MARCO Pay referral review', () => {
  it('asks for the referral on review and does not call the provider unavailable when verification fails', async () => {
    seedReferral()
    installFetch({
      order: (body) =>
        body.referralCode
          ? { ok: false, status: 422, json: async () => ({ error: 'REFERRAL_NOT_VERIFIED' }) }
          : orderResponse('mp_plain'),
    })
    await reachPaymentStep()
    await waitFor(() => expect(screen.getByTestId('commercial-pay-MARCO_PAY').hasAttribute('disabled')).toBe(false))
    fireEvent.click(screen.getByTestId('commercial-pay-MARCO_PAY'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    await waitFor(() =>
      expect(screen.getByTestId('commercial-checkout-error').textContent).toBe(
        'This Passport PRO referral could not be verified. MARCO Pay was not charged.',
      ),
    )
    expect(screen.queryByText('MARCO Pay is temporarily unavailable.')).toBeNull()
    const referralPost = orderPosts()
      .map((call: any[]) => JSON.parse(call[1].body))
      .find((body: any) => body.referralCode === '2mjywytuw5')
    expect(referralPost.referralDestination).toBe('melega-dex')
    expect(referralPost.packageId).toBe('trend_6h')
  })

  it('prepares a non-referral review without a referral payload', async () => {
    installFetch()
    await reachMarcoReview()
    expect(screen.queryByTestId('commercial-checkout-error')).toBeNull()
    const posts = (global.fetch as any).mock.calls.filter(
      (call: any[]) => String(call[0]).includes('/api/marco-pay/orders') && call[1]?.method === 'POST',
    )
    expect(posts).toHaveLength(1)
    expect(JSON.parse(posts[0][1].body).referralCode).toBeNull()
  })

  it('shows a real readiness block and does not start an order', async () => {
    installFetch({
      readiness: { executable: false, reason: 'MARCO Pay is completing secure activation.', paymentMethods: { marco: false } },
    })
    await reachPaymentStep()
    await waitFor(
      () =>
        expect(screen.getByTestId('commercial-pay-MARCO_PAY').getAttribute('title')).toBe(
          'MARCO Pay is completing secure activation.',
        ),
      { timeout: 3000 },
    )
    expect(screen.getByTestId('commercial-pay-MARCO_PAY').hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByTestId('commercial-pay-MARCO_PAY'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    expect(
      (global.fetch as any).mock.calls.some(
        (call: any[]) => String(call[0]).includes('/api/marco-pay/orders') && call[1]?.method === 'POST',
      ),
    ).toBe(false)
  })

  it('does not label a readiness check that is still loading as an outage', async () => {
    let release: (value: unknown) => void = () => undefined
    const pending = new Promise((resolve) => {
      release = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        const url = String(input)
        if (url.includes('/onboard')) return detection()
        if (url.includes('/readiness')) return pending
        if (url.includes('/pair-liquidity')) return { ok: true, json: async () => ({}) }
        throw new Error(`Unexpected API: ${url}`)
      }),
    )
    await reachPaymentStep()
    const marco = screen.getByTestId('commercial-pay-MARCO_PAY')
    expect(marco.getAttribute('title')).toBe('Checking MARCO Pay…')
    expect(marco.getAttribute('title')).not.toBe('MARCO Pay is temporarily unavailable.')
    release({
      ok: true,
      json: async () => ({ executable: true, reason: null, paymentMethods: { marco: true } }),
    })
    await waitFor(() => expect(screen.getByTestId('commercial-pay-MARCO_PAY').hasAttribute('disabled')).toBe(false))
  })

  it('quotes again when the selected package changes', async () => {
    installFetch()
    await reachMarcoReview()
    fireEvent.click(screen.getByTestId('commercial-checkout-back'))
    fireEvent.click(screen.getByTestId('commercial-checkout-back'))
    fireEvent.click(screen.getByTestId('commercial-checkout-back'))
    fireEvent.click(screen.getByTestId('commercial-pkg-trend_24h'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-pay-MARCO_PAY'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    await waitFor(() => {
      const posts = orderPosts()
      expect(JSON.parse(posts[posts.length - 1][1].body).packageId).toBe('trend_24h')
      expect(posts.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('quotes again when the connected account changes', async () => {
    installFetch()
    const view = render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    fireEvent.change(screen.getByPlaceholderText('Paste the token address (0x...)'), { target: { value: ADDRESS } })
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
    await screen.findByText(/awaiting canonical MARCO Pay settlement/)
    vi.mocked(useAccount).mockReturnValue({ address: OTHER, connector: { getProvider: async () => null } } as any)
    view.rerender(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    await waitFor(() => {
      const wallets = orderPosts().map((call: any[]) => JSON.parse(call[1].body).buyerWallet)
      expect(wallets).toContain(OTHER)
    })
  })

  it('quotes again when the project chain changes', async () => {
    installFetch()
    await reachMarcoReview()
    for (let step = 0; step < 5; step += 1) fireEvent.click(screen.getByTestId('commercial-checkout-back'))
    fireEvent.change(screen.getByLabelText('Project chain'), { target: { value: '1' } })
    fireEvent.change(screen.getByPlaceholderText('Paste the token address (0x...)'), { target: { value: ADDRESS } })
    fireEvent.click(screen.getByRole('button', { name: 'Detect token' }))
    await screen.findByText('Project Page @trumpet')
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-service-trend-boost'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-pkg-trend_6h'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-pay-MARCO_PAY'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    await waitFor(() => expect(orderPosts().length).toBeGreaterThanOrEqual(2))
  })

  it('quotes again after the prepared quote becomes stale', async () => {
    let now = 1_700_000_000_000
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    installFetch()
    await reachMarcoReview()
    const before = orderPosts().length
    now += MARCO_PAY_PREPARED_QUOTE_TTL_MS + 1
    fireEvent.click(screen.getByTestId('marco-pay-launch'))
    await waitFor(() => expect(orderPosts().length).toBeGreaterThan(before))
  })
})
