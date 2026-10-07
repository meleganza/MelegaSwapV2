/**
 * Payment-step M-Credits logo must resolve to the canonical on-disk asset
 * and load as a real image. Source-string presence is not sufficient.
 */
import { spawn } from 'child_process'
import { existsSync, mkdtempSync, readFileSync } from 'fs'
import { createServer } from 'http'
import { tmpdir } from 'os'
import path from 'path'
import { useAccount, useSigner } from 'wagmi'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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

const ADDRESS = '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e'
const CANONICAL_LOGO = '/images/m-credits-logo.png'
const PUBLIC_LOGO = path.resolve(__dirname, '../../../../../public/images/m-credits-logo.png')
const CHROME_CANDIDATES = ['/usr/local/bin/google-chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']

function readPngSize(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath)
  const signature = bytes.subarray(0, 8).toString('hex')
  expect(signature).toBe('89504e470d0a1a0a')
  expect(bytes.subarray(12, 16).toString('ascii')).toBe('IHDR')
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

function findChrome(): string | null {
  return CHROME_CANDIDATES.find((candidate) => existsSync(candidate)) ?? null
}

async function loadRenderedLogo(chromeBin: string, filePath: string) {
  const png = readFileSync(filePath)
  const server = createServer((req, res) => {
    if (req.url?.startsWith(CANONICAL_LOGO)) {
      res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' })
      res.end(png)
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(`<!doctype html><body>
      <span id="shell" style="width:52px;height:52px;border-radius:50%;overflow:hidden;display:grid;place-items:center">
        <img id="logo" alt="M-Credits" src="${CANONICAL_LOGO}" style="width:100%;height:100%;object-fit:contain"
          onload="document.body.dataset.nw=this.naturalWidth;document.body.dataset.nh=this.naturalHeight;document.body.dataset.fit=getComputedStyle(this).objectFit;var box=this.getBoundingClientRect();document.body.dataset.bw=box.width;document.body.dataset.bh=box.height"
          onerror="document.body.dataset.error='1'" />
      </span></body>`)
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
  const port = (server.address() as { port: number }).port
  const profile = mkdtempSync(path.join(tmpdir(), 'mcredits-logo-'))
  const chrome = spawn(
    chromeBin,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      `--user-data-dir=${profile}`,
      '--virtual-time-budget=5000',
      '--timeout=8000',
      '--dump-dom',
      `http://127.0.0.1:${port}/`,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  )
  let stdout = ''
  try {
    stdout = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        chrome.kill()
        reject(new Error(`Chrome did not render the logo. ${stdout.slice(0, 400)}`))
      }, 20000)
      chrome.stdout.on('data', (chunk) => {
        stdout += chunk.toString()
        if (stdout.includes('data-nw=') || stdout.includes('data-error=')) {
          clearTimeout(timer)
          chrome.kill()
          resolve(stdout)
        }
      })
      chrome.on('exit', () => {
        clearTimeout(timer)
        if (stdout.includes('data-nw=') || stdout.includes('data-error=')) resolve(stdout)
        else reject(new Error(`Chrome exited before the logo loaded. ${stdout.slice(0, 400)}`))
      })
    })
  } finally {
    chrome.kill()
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
  const attr = (name: string) => stdout.match(new RegExp(`data-${name}="([^"]*)"`))?.[1]
  return {
    naturalWidth: Number(attr('nw') || 0),
    naturalHeight: Number(attr('nh') || 0),
    complete: !attr('error'),
    objectFit: attr('fit') || '',
    boxWidth: Number(attr('bw') || 0),
    boxHeight: Number(attr('bh') || 0),
    error: attr('error') ? true : undefined,
  }
}

beforeEach(() => {
  vi.mocked(useAccount).mockReturnValue({ address: ADDRESS } as any)
  vi.mocked(useSigner).mockReturnValue({ data: undefined } as any)
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
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
      throw new Error(`Unexpected API: ${input}`)
    }),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Boost payment M-Credits logo', () => {
  it('renders the payment card from the canonical M-Credits asset and loads it', async () => {
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

    const payment = screen.getByTestId('commercial-step-payment')
    expect(payment.textContent).toContain('M-Credits')
    expect(payment.textContent).toContain('MARCO PASSPORT')
    expect(screen.getByTestId('mcredits-beta-badge').textContent).toBe('BETA')

    const card = screen.getByTestId('commercial-pay-M_CREDITS')
    const image = card.querySelector('img')
    expect(image).toBeTruthy()
    expect(image?.getAttribute('src')).toBe(CANONICAL_LOGO)
    expect(existsSync(PUBLIC_LOGO)).toBe(true)

    const png = readPngSize(PUBLIC_LOGO)
    expect(png.width).toBeGreaterThan(0)
    expect(png.height).toBeGreaterThan(0)
    expect(png.width / png.height).toBe(1)

    const chrome = findChrome()
    if (!chrome) return

    const loaded = await loadRenderedLogo(chrome, PUBLIC_LOGO)
    expect(loaded.error).toBeUndefined()
    expect(loaded.complete).toBe(true)
    expect(loaded.naturalWidth).toBeGreaterThan(0)
    expect(loaded.naturalHeight).toBeGreaterThan(0)
    expect(loaded.naturalWidth).toBe(png.width)
    expect(loaded.naturalHeight).toBe(png.height)
    expect(loaded.naturalWidth / loaded.naturalHeight).toBe(png.width / png.height)
    expect(loaded.objectFit).toBe('contain')
    expect(loaded.boxWidth).toBeGreaterThan(0)
    expect(loaded.boxHeight).toBeGreaterThan(0)
    expect(Math.abs(loaded.boxWidth - loaded.boxHeight)).toBeLessThan(1)
  }, 30000)
})
