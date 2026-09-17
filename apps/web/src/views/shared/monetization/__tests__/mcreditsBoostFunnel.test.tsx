import React from 'react'
import { useAccount, useSigner } from 'wagmi'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CommercialCheckoutModal } from '../CommercialCheckoutModal'
import { setMCreditsPassportForTests } from 'lib/mcredits/passportState'
import { clearMCreditsReceiptsForTests, saveMCreditsReceipt } from 'lib/mcredits/receipt'

vi.mock('wagmi', () => ({ useAccount: vi.fn(() => ({ address: undefined })), useSigner: vi.fn(() => ({ data: undefined })) }))
vi.mock('components/MarcoWidgets', () => ({ MarcoPay: () => null }))
vi.mock('components/ConnectWalletButton', () => ({ default: (props: any) => <button {...props}>Connect Wallet</button> }))

const ADDRESS = '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e'
const next = () => fireEvent.click(screen.getByTestId('commercial-checkout-next'))

beforeEach(() => {
  vi.mocked(useAccount).mockReturnValue({ address: ADDRESS } as any)
  vi.mocked(useSigner).mockReturnValue({ data: undefined } as any)
  setMCreditsPassportForTests({
    connected: true,
    known: true,
    availableMinor: 10_000,
    identityToken: 'passport_session_test',
  })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      let data: any
      if (String(input).includes('/onboard')) {
        data = {
          ok: true,
          tier: 'canonical',
          onChain: { verifiedDeployment: true, name: 'EYED', symbol: 'EYED', decimals: 18 },
          project: { displayName: 'EYED', slug: 'eyed' },
          dex: { listed: true, logo: 'https://example.test/eyed.png' },
        }
      } else if (String(input).includes('/readiness')) {
        data = { executable: false, paymentMethods: { mCredits: true } }
      } else if (String(input).includes('/pair-liquidity')) {
        data = {}
      } else if (String(input).includes('/eligible-targets')) {
        data = {
          targets: [
            {
              id: 'pool-eyed',
              kind: 'pool',
              chainId: 56,
              title: 'EYED Pool',
              detail: 'Active',
              contractAddress: ADDRESS,
            },
          ],
        }
      } else if (String(input).includes('/api/mcredits/orders')) {
        data = {
          order: { orderId: 'mc_test', state: 'FULFILLED', serviceId: 'featured', packageId: 'featured_24h' },
          payment_id: null,
          approval_url: null,
        }
      } else {
        throw Error('Unexpected API: ' + input)
      }
      return { ok: true, json: async () => data }
    }),
  )
})

afterEach(() => {
  cleanup()
  clearMCreditsReceiptsForTests()
  setMCreditsPassportForTests(null)
  vi.unstubAllGlobals()
})

async function open(service = 'featured') {
  render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
  fireEvent.change(screen.getByPlaceholderText('Paste the token address (0x...)'), { target: { value: ADDRESS } })
  fireEvent.click(screen.getByRole('button', { name: 'Detect token' }))
  await screen.findByText('Project Page @eyed')
  next()
  fireEvent.click(screen.getByTestId(`commercial-service-${service}`))
}

async function toMCreditsReview(service: string, packageId?: string) {
  await open(service)
  next()
  if (service === 'featured-pool') {
    await waitFor(() => expect(screen.getByTestId('commercial-featured-pool-targets')).toBeTruthy())
  }
  if (packageId) fireEvent.click(screen.getByTestId(`commercial-pkg-${packageId}`))
  next()
  next()
  await waitFor(() => expect(screen.getByTestId('commercial-pay-M_CREDITS').hasAttribute('disabled')).toBe(false))
  fireEvent.click(screen.getByTestId('commercial-pay-M_CREDITS'))
  next()
}

describe('M-Credits Boost funnel', () => {
  it('A. disconnected Passport requires connect before pay', async () => {
    setMCreditsPassportForTests({ connected: false, known: false, availableMinor: null, identityToken: null })
    await toMCreditsReview('featured', 'featured_24h')
    expect(screen.getByTestId('commercial-step-review').textContent).toContain('Connect MARCO Passport')
    expect(screen.getByTestId('commercial-checkout-pay').hasAttribute('disabled')).toBe(true)
  })

  it('lets Featured complete a mocked M-Credits purchase once', async () => {
    await toMCreditsReview('featured', 'featured_24h')
    expect(screen.getByTestId('commercial-step-review').textContent).toContain('M-Credits')
    expect(screen.getByTestId('commercial-checkout-pay').hasAttribute('disabled')).toBe(false)
    fireEvent.click(screen.getByTestId('commercial-checkout-pay'))
    fireEvent.click(screen.getByTestId('commercial-checkout-pay'))
    await waitFor(() => expect(screen.getByTestId('commercial-checkout-success')).toBeTruthy())
    const charges = vi.mocked(fetch).mock.calls.filter((call) => String(call[0]).includes('/api/mcredits/orders'))
    expect(charges).toHaveLength(1)
    expect(String((charges[0][1] as any).headers['x-marco-passport-session'])).toBe('passport_session_test')
  })

  it('H. reopen after payment restores the fulfilled receipt without a second charge', async () => {
    saveMCreditsReceipt({
      orderId: 'mc_saved',
      state: 'FULFILLED',
      serviceId: 'featured',
      packageId: 'featured_24h',
      projectId: 'eyed',
    })
    await toMCreditsReview('featured', 'featured_24h')
    await waitFor(() => expect(screen.getByTestId('commercial-checkout-success')).toBeTruthy())
    expect(vi.mocked(fetch).mock.calls.some((call) => String(call[0]).includes('/api/mcredits/orders'))).toBe(false)
  })

  it('L. keeps Featured Pool fail-closed so it cannot charge', async () => {
    await toMCreditsReview('featured-pool')
    expect(screen.getByTestId('commercial-step-review').textContent).toContain('awaiting production activation')
    expect(screen.getByTestId('commercial-checkout-pay').hasAttribute('disabled')).toBe(true)
    expect(vi.mocked(fetch).mock.calls.some((call) => String(call[0]).includes('/api/mcredits/orders'))).toBe(false)
  })

  it('C. disables Review and Pay when M-Credits are insufficient', async () => {
    setMCreditsPassportForTests({
      connected: true,
      known: true,
      availableMinor: 100,
      identityToken: 'passport_session_test',
    })
    await toMCreditsReview('trend-boost', 'trend_6h')
    expect(screen.getByTestId('commercial-step-review').textContent).toContain('Insufficient M-Credits')
    expect(screen.getByTestId('commercial-checkout-pay').hasAttribute('disabled')).toBe(true)
  })
})
