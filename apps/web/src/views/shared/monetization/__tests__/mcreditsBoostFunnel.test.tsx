import React from 'react'
import { useAccount, useSigner } from 'wagmi'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CommercialCheckoutModal } from '../CommercialCheckoutModal'
import { setMCreditsPassportForTests } from 'lib/mcredits/passportState'
import { clearMCreditsReceiptsForTests } from 'lib/mcredits/receipt'

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: undefined })),
  useSigner: vi.fn(() => ({ data: undefined })),
}))
vi.mock('components/MarcoWidgets', () => ({ MarcoPay: () => null }))
vi.mock('components/ConnectWalletButton', () => ({
  default: (props: any) => <button {...props}>Connect Wallet</button>,
}))

const ADDRESS = '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e'

beforeEach(() => {
  vi.mocked(useAccount).mockReturnValue({ address: ADDRESS } as any)
  vi.mocked(useSigner).mockReturnValue({ data: undefined } as any)
  setMCreditsPassportForTests({
    connected: true,
    known: true,
    availableMinor: 20000,
    identityToken: 'passport_session_test',
    walletAddress: ADDRESS,
  })
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
            dex: { listed: true, logo: 'https://example.test/mm72.png' },
          }),
        }
      }
      if (String(input).includes('/readiness')) {
        return { ok: true, json: async () => ({ executable: true, paymentMethods: { mCredits: true } }) }
      }
      if (String(input).includes('/pair-liquidity')) return { ok: true, json: async () => ({}) }
      if (String(input).includes('/eligible-targets')) return { ok: true, json: async () => ({ targets: [] }) }
      if (String(input).includes('/api/mcredits/orders')) {
        const body = JSON.parse(options.body)
        expect(options.headers['x-marco-passport-session']).toBe('passport_session_test')
        expect(body.payment_id).toBeUndefined()
        return {
          ok: true,
          json: async () => ({
            order: { orderId: 'mc_fixture', state: 'FULFILLED', serviceId: 'trend-boost', packageId: 'trend_24h' },
            payment_id: null,
            approval_url: null,
          }),
        }
      }
      throw new Error(`Unexpected API: ${input}`)
    }),
  )
})

afterEach(() => {
  cleanup()
  clearMCreditsReceiptsForTests()
  setMCreditsPassportForTests(null)
  vi.unstubAllGlobals()
})

async function openTrend() {
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
}

describe('M-Credits Boost funnel', () => {
  it('shows the BETA badge without changing payment-card layout tokens', async () => {
    await openTrend()
    expect(screen.getByTestId('mcredits-beta-badge').textContent).toBe('BETA')
    const source = await import('fs').then((fs) =>
      fs.readFileSync(require('path').join(__dirname, '../CommercialCheckoutModal.tsx'), 'utf8'),
    )
    expect(source).toContain('grid-template-columns: repeat(5, minmax(0, 1fr))')
    expect(source).toContain('min-height: 154px')
    expect(source).toContain('uxRebuildRadius.pill')
  })

  it('settles a mocked Trend Boost debit once and activates fulfillment', async () => {
    await openTrend()
    fireEvent.click(screen.getByTestId('commercial-pay-M_CREDITS'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-checkout-pay'))
    await waitFor(() => expect(screen.getByTestId('commercial-checkout-success')).toBeTruthy())
    const calls = (global.fetch as any).mock.calls.filter((call: any[]) => String(call[0]).includes('/api/mcredits/orders'))
    expect(calls).toHaveLength(1)
  })

  it('blocks Featured Pool / Featured Farm / Sponsored Search before any debit', async () => {
    render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    fireEvent.change(screen.getByPlaceholderText('Paste the token address (0x...)'), { target: { value: ADDRESS } })
    fireEvent.click(screen.getByRole('button', { name: 'Detect token' }))
    await screen.findByText('Project Page @mm72')
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-service-sponsored-research'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    fireEvent.click(screen.getByTestId('commercial-pay-M_CREDITS'))
    fireEvent.click(screen.getByTestId('commercial-checkout-next'))
    expect(screen.getByTestId('commercial-step-review').textContent).toMatch(/awaiting production activation/)
    expect((global.fetch as any).mock.calls.some((call: any[]) => String(call[0]).includes('/api/mcredits/orders'))).toBe(false)
  })
})
