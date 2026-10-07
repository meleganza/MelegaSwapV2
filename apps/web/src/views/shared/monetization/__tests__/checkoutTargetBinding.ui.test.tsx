import { useAccount, useSigner } from 'wagmi'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
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

const M01 = '0x4034875250F797D00b819e9011c5BB9c2e799631'
const LUCK = '0xeE86B71B787f6DCF83a9856D181dda2b7b8398B0'
const MM72 = '0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E'
const BABYMARCO = '0x7d48423Feac5AA05380Db98a1f24cE17D641754D'
const BUYER = '0x1111111111111111111111111111111111111111'

const TOKENS: Record<string, { name: string; symbol: string; slug?: string }> = {
  [M01.toLowerCase()]: { name: 'MISSION 1', symbol: 'M01' },
  [LUCK.toLowerCase()]: { name: '4LEAF CLOVER', symbol: 'LUCK' },
  [MM72.toLowerCase()]: { name: 'MM72', symbol: 'MM72', slug: 'mm72' },
  [BABYMARCO.toLowerCase()]: { name: 'BabyMarco', symbol: 'BABYMARCO' },
}

const createdOrders: Array<Record<string, unknown>> = []
let holdM01: Promise<void> = Promise.resolve()
let releaseM01 = () => {}

function armM01Hold() {
  holdM01 = new Promise((resolve) => {
    releaseM01 = () => resolve()
  })
}

beforeEach(() => {
  createdOrders.length = 0
  armM01Hold()
  releaseM01()
  vi.mocked(useAccount).mockReturnValue({ address: BUYER, connector: undefined } as any)
  vi.mocked(useSigner).mockReturnValue({
    data: {
      getChainId: async () => 56,
      sendTransaction: async () => ({ hash: `0x${'ab'.repeat(32)}`, wait: async () => ({ to: BUYER, status: 1, logs: [] }) }),
    },
  } as any)
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, options?: { body?: string }) => {
      const url = String(input)
      if (url.includes('/onboard')) {
        const body = JSON.parse(options?.body || '{}') as { contract?: string }
        const address = String(body.contract || '').toLowerCase()
        if (address === M01.toLowerCase()) await holdM01
        const token = TOKENS[address]
        if (!token) return { ok: false, json: async () => ({ ok: false, reason: 'TOKEN_DETECTION_FAILED' }) }
        return {
          ok: true,
          json: async () => ({
            ok: true,
            tier: token.slug ? 'canonical' : 'pending',
            onChain: { verifiedDeployment: true, name: token.name, symbol: token.symbol, decimals: 18 },
            project: token.slug ? { displayName: token.name, slug: token.slug } : null,
            dex: { listed: true, symbol: token.symbol, name: token.name },
          }),
        }
      }
      if (url.includes('/readiness')) {
        return { ok: true, json: async () => ({ executable: false, paymentMethods: { mCredits: false } }) }
      }
      if (url.includes('/pair-liquidity')) return { ok: true, json: async () => ({}) }
      if (url.includes('/eligible-targets')) return { ok: true, json: async () => ({ targets: [] }) }
      if (url.includes('/api/trend-boost/orders')) {
        const body = JSON.parse(options?.body || '{}') as Record<string, unknown>
        if (body.action === 'create') {
          createdOrders.push(body)
          return { ok: true, json: async () => ({ order: { orderId: 'trend_fixture' } }) }
        }
        if (body.action === 'quote') {
          return {
            ok: true,
            json: async () => ({
              quote: { tokenAmount: '1', quoteExpiration: '2099-01-01' },
              prepared: { to: BUYER, valueHex: '0x0', data: '0x' },
            }),
          }
        }
        return { ok: true, json: async () => ({ ok: true }) }
      }
      throw new Error(`Unexpected API: ${url}`)
    }),
  )
})

afterEach(() => {
  releaseM01()
  cleanup()
  vi.unstubAllGlobals()
})

function input() {
  return screen.getByPlaceholderText('Paste the token address (0x...)')
}

async function detect(address: string, label: string) {
  fireEvent.change(input(), { target: { value: address } })
  fireEvent.click(screen.getByRole('button', { name: 'Detect token' }))
  expect((await screen.findAllByText(label)).length).toBeGreaterThan(0)
}

async function payTrendBoost() {
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-service-trend-boost'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-pkg-trend_24h'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-pay-USDT'))
  fireEvent.click(screen.getByTestId('commercial-checkout-next'))
  fireEvent.click(screen.getByTestId('commercial-checkout-pay'))
  await waitFor(() => expect(createdOrders.length).toBeGreaterThan(0))
  return createdOrders[createdOrders.length - 1]
}

describe('Boost checkout target binding', () => {
  it('keeps LUCK after an in-flight M01 detection returns late', async () => {
    armM01Hold()
    render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    fireEvent.change(input(), { target: { value: M01 } })
    fireEvent.click(screen.getByRole('button', { name: 'Detect token' }))
    await detect(LUCK, '4LEAF CLOVER · $LUCK')
    releaseM01()
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(screen.queryByText('MISSION 1 · $M01')).toBeNull()
    const order = await payTrendBoost()
    expect(order.projectContract).toBe(LUCK.toLowerCase())
    expect(order.projectSlug).toBeNull()
    expect(order.projectId).toBe(LUCK.toLowerCase())
    expect(order.projectContract).not.toBe(M01.toLowerCase())
  })

  it('binds a direct LUCK selection with a null slug', async () => {
    render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" projectContract={M01} identityReady />)
    await detect(LUCK, '4LEAF CLOVER · $LUCK')
    const order = await payTrendBoost()
    expect(order.projectContract).toBe(LUCK.toLowerCase())
    expect(order.projectSlug).toBeNull()
    expect(order.projectId).toBe(LUCK.toLowerCase())
  })

  it('binds MM72 and BABYMARCO to their own addresses', async () => {
    const view = render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    await detect(MM72, 'MM72 · $MM72')
    const mm72 = await payTrendBoost()
    expect(mm72.projectContract).toBe(MM72.toLowerCase())
    expect(mm72.projectSlug).toBe('mm72')
    expect(mm72.projectId).toBe('mm72')
    view.unmount()
    createdOrders.length = 0
    render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    await detect(BABYMARCO, 'BabyMarco · $BABYMARCO')
    const baby = await payTrendBoost()
    expect(baby.projectContract).toBe(BABYMARCO.toLowerCase())
    expect(baby.projectSlug).toBeNull()
    expect(baby.projectId).toBe(BABYMARCO.toLowerCase())
  })

  it('does not restore M01 after the checkout is closed and LUCK is selected', async () => {
    armM01Hold()
    const view = render(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    fireEvent.change(input(), { target: { value: M01 } })
    fireEvent.click(screen.getByRole('button', { name: 'Detect token' }))
    view.rerender(<CommercialCheckoutModal open={false} onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    view.rerender(<CommercialCheckoutModal open onClose={vi.fn()} projectId="" projectSlug="" identityReady />)
    releaseM01()
    await detect(LUCK, '4LEAF CLOVER · $LUCK')
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(screen.queryByText('MISSION 1 · $M01')).toBeNull()
    const order = await payTrendBoost()
    expect(order.projectContract).toBe(LUCK.toLowerCase())
    expect(order.projectId).not.toBe(M01.toLowerCase())
  })
})
