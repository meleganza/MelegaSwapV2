import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000'
const evidenceDir = process.env.EVIDENCE_DIR
  ? path.resolve(process.env.EVIDENCE_DIR)
  : path.resolve(__dirname, '../../../docs/stability/boost-service-modal-layout-restore')
const contract = '0x1111111111111111111111111111111111111111'
const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900, desktop: true },
  { name: 'desktop-1280x800', width: 1280, height: 800, desktop: true },
  { name: 'mobile-390x844', width: 390, height: 844, desktop: false },
  { name: 'mobile-430x932', width: 430, height: 932, desktop: false },
]

fs.mkdirSync(evidenceDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
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
          tier: 'pending',
          onChain: {
            name: 'Geometry Test Project',
            symbol: 'GEO',
            decimals: 18,
            totalSupplyFormatted: '1000000',
            verifiedDeployment: true,
          },
          dex: { listed: true, projectClaimed: false, symbol: 'GEO', name: 'Geometry Test Project' },
        }),
      })
    })
    await page.route('**/api/marco-pay/readiness', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ executable: false }) }),
    )

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 })
    await page.getByTestId('boost-your-project-trigger').click()
    await page.getByPlaceholder('Paste the token address (0x...)').fill(contract)
    await page.getByRole('button', { name: 'Detect token' }).click()
    await page.getByTestId('commercial-step-project').getByText('Geometry Test Project · $GEO').waitFor()
    await page.getByTestId('commercial-checkout-next').click()
    await page.getByTestId('commercial-step-service').waitFor()

    const geometry = await page.evaluate(() => {
      const modal = document.querySelector('[data-testid="commercial-checkout-modal"]')
      const body = modal?.querySelector('[data-melega-modal-body="true"]')
      const footer = modal?.querySelector('[data-melega-modal-footer="true"]')
      const close = modal?.querySelector('[data-testid="commercial-checkout-close"]')
      const back = modal?.querySelector('[data-testid="commercial-checkout-back"]')
      const next = modal?.querySelector('[data-testid="commercial-checkout-next"]')
      const grid = modal?.querySelector('[data-testid="commercial-service-grid"]')
      const cards = [...(modal?.querySelectorAll('[data-testid^="commercial-service-"]') ?? [])].filter(
        (element) => element.getAttribute('data-testid') !== 'commercial-service-grid',
      )
      if (!modal || !body || !footer || !close || !back || !next || !grid || cards.length === 0) {
        throw new Error('BOOST_SERVICE_GEOMETRY_TARGET_MISSING')
      }
      const visible = (element) => {
        const rect = element.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight
      }
      const gridRect = grid.getBoundingClientRect()
      const cardRects = cards.map((card) => card.getBoundingClientRect())
      const cardsInsideGrid = cardRects.every(
        (rect) =>
          rect.left >= gridRect.left - 1 &&
          rect.right <= gridRect.right + 1 &&
          rect.top >= gridRect.top - 1 &&
          rect.bottom <= gridRect.bottom + 1,
      )
      const cardsOverlap = cardRects.some((rect, index) =>
        cardRects.slice(index + 1).some(
          (other) =>
            Math.min(rect.right, other.right) - Math.max(rect.left, other.left) > 1 &&
            Math.min(rect.bottom, other.bottom) - Math.max(rect.top, other.top) > 1,
        ),
      )
      return {
        serviceCount: cards.length,
        bodyScrollHeight: body.scrollHeight,
        bodyClientHeight: body.clientHeight,
        modalScrollHeight: modal.scrollHeight,
        modalClientHeight: modal.clientHeight,
        internalVerticalScroll: body.scrollHeight > body.clientHeight + 1 || modal.scrollHeight > modal.clientHeight + 1,
        horizontalOverflow:
          body.scrollWidth > body.clientWidth + 1 || modal.scrollWidth > modal.clientWidth + 1 || document.body.scrollWidth > window.innerWidth + 1,
        allCardsVisible: cards.every(visible),
        trendBoostVisible: visible(modal.querySelector('[data-testid="commercial-service-trend-boost"]')),
        footerVisible: visible(footer),
        backVisible: visible(back),
        continueVisible: visible(next),
        closeVisible: visible(close),
        cardsInsideGrid,
        cardsOverlap,
        maxCardHeight: Math.max(...cardRects.map((rect) => rect.height)),
      }
    })

    if (viewport.desktop) {
      const failed =
        geometry.internalVerticalScroll ||
        geometry.horizontalOverflow ||
        !geometry.allCardsVisible ||
        !geometry.trendBoostVisible ||
        !geometry.footerVisible ||
        !geometry.backVisible ||
        !geometry.continueVisible ||
        !geometry.closeVisible ||
        !geometry.cardsInsideGrid ||
        geometry.cardsOverlap ||
        geometry.maxCardHeight > 102
      if (failed) throw new Error(`${viewport.name} geometry failed: ${JSON.stringify(geometry)}`)
    } else if (geometry.horizontalOverflow || geometry.cardsOverlap || !geometry.footerVisible) {
      throw new Error(`${viewport.name} responsive geometry failed: ${JSON.stringify(geometry)}`)
    }

    const screenshot = path.join(evidenceDir, `${viewport.name}.png`)
    await page.screenshot({ path: screenshot, fullPage: false })

    if (viewport.name === 'desktop-1440x900') {
      await page.getByTestId('commercial-service-featured').click()
      await page.getByTestId('commercial-checkout-next').click()
      await page.getByTestId('commercial-step-package').waitFor()
      await page.getByTestId('commercial-checkout-back').click()
      await page.getByTestId('commercial-step-service').waitFor()
      await page.getByTestId('commercial-service-trend-boost').click()
      await page.getByTestId('commercial-checkout-next').click()
      await page.getByTestId('commercial-step-package').waitFor()
      await page.getByTestId('commercial-checkout-close').click()
      await page.getByTestId('commercial-checkout-modal').waitFor({ state: 'detached' })
      geometry.featuredContinue = true
      geometry.backAction = true
      geometry.trendContinue = true
      geometry.closeAction = true
    }

    results[viewport.name] = { ...geometry, screenshot }
    await page.close()
  }
} finally {
  await browser.close()
}

fs.writeFileSync(path.join(evidenceDir, 'geometry-results.json'), `${JSON.stringify(results, null, 2)}\n`)
console.log(JSON.stringify(results, null, 2))
