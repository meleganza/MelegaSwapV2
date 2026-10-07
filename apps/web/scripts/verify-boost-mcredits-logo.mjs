import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000'
const evidenceDir = process.env.EVIDENCE_DIR
  ? path.resolve(process.env.EVIDENCE_DIR)
  : path.resolve(__dirname, '../../../docs/stability/boost-mcredits-logo-asset')
const contract = '0x1111111111111111111111111111111111111111'
const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'mobile-390x844', width: 390, height: 844 },
]

fs.mkdirSync(evidenceDir, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
})
const results = {}

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } })
    await page.route('**/api/registry/projects/onboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          tier: 'canonical',
          onChain: {
            name: 'MM72',
            symbol: 'MM72',
            decimals: 18,
            verifiedDeployment: true,
          },
          project: { displayName: 'MM72', slug: 'mm72' },
          dex: { listed: true, logo: '/images/56/tokens/0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E.png' },
        }),
      })
    })
    await page.route('**/api/marco-pay/readiness', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ executable: true, paymentMethods: { mCredits: true } }),
      }),
    )
    await page.route('**/api/**/pair-liquidity', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    )
    await page.route('**/api/visibility/eligible-targets**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ targets: [] }) }),
    )

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 })
    await page.getByTestId('boost-your-project-trigger').click()
    await page.getByPlaceholder('Paste the token address (0x...)').fill(contract)
    await page.getByRole('button', { name: 'Detect token' }).click()
    await page.getByTestId('commercial-step-project').getByText('MM72').first().waitFor()
    await page.getByTestId('commercial-checkout-next').click()
    await page.getByTestId('commercial-service-trend-boost').click()
    await page.getByTestId('commercial-checkout-next').click()
    await page.getByTestId('commercial-pkg-trend_24h').click()
    await page.getByTestId('commercial-checkout-next').click()
    await page.getByTestId('commercial-checkout-next').click()
    await page.getByTestId('commercial-step-payment').waitFor()

    const logo = await page.evaluate(() => {
      const card = document.querySelector('[data-testid="commercial-pay-M_CREDITS"]')
      const image = card?.querySelector('img')
      if (!card || !image) return { missing: true }
      const rect = image.getBoundingClientRect()
      const style = getComputedStyle(image)
      return {
        src: image.getAttribute('src'),
        currentSrc: image.currentSrc,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        boxWidth: rect.width,
        boxHeight: rect.height,
        objectFit: style.objectFit,
        broken: image.complete && image.naturalWidth === 0,
      }
    })
    if (logo.missing || logo.broken || logo.naturalWidth <= 0 || logo.naturalHeight <= 0) {
      throw new Error(`${viewport.name} M-Credits logo failed to load: ${JSON.stringify(logo)}`)
    }
    if (logo.src !== '/images/m-credits-logo.png') {
      throw new Error(`${viewport.name} resolved a non-canonical logo: ${JSON.stringify(logo)}`)
    }
    const naturalRatio = logo.naturalWidth / logo.naturalHeight
    const boxRatio = logo.boxWidth / logo.boxHeight
    if (Math.abs(naturalRatio - 1) > 0.01 || Math.abs(boxRatio - naturalRatio) > 0.05 || logo.objectFit !== 'contain') {
      throw new Error(`${viewport.name} logo aspect was distorted: ${JSON.stringify(logo)}`)
    }

    const screenshot = path.join(evidenceDir, `${viewport.name}.png`)
    await page.screenshot({ path: screenshot, fullPage: false })
    results[viewport.name] = { ...logo, screenshot }
    await page.close()
  }
} finally {
  await browser.close()
}

fs.writeFileSync(path.join(evidenceDir, 'logo-results.json'), `${JSON.stringify(results, null, 2)}\n`)
console.log(JSON.stringify(results, null, 2))
