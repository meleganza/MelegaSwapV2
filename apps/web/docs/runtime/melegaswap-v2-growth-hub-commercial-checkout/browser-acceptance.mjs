#!/usr/bin/env node
/**
 * Growth Hub + Commercial Checkout — browser acceptance.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
let chromium
try {
  ;({ chromium } = require('playwright'))
} catch {
  ;({ chromium } = require('/tmp/node_modules/playwright'))
}

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3032').replace(/\/$/, '')
const OUT = __dirname
const SHOTS = path.join(OUT, 'screenshots')
fs.mkdirSync(SHOTS, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
]

async function measureModal(page) {
  return page.evaluate(() => {
    const modal = document.querySelector('[data-melega-modal="true"]')
    if (!modal) return { open: false }
    const r = modal.getBoundingClientRect()
    return {
      open: true,
      system: modal.getAttribute('data-melega-modal-system'),
      testId: modal.getAttribute('data-testid'),
      title: (modal.querySelector('[data-melega-modal-title]')?.textContent || '').trim(),
      footer: !!modal.querySelector('[data-melega-modal-footer]'),
      preview: !!modal.querySelector('[data-testid="commercial-checkout-preview"], [data-testid="claim-wizard-preview"]'),
      width: Math.round(r.width),
      height: Math.round(r.height),
      withinViewport:
        r.top >= -4 && r.bottom <= window.innerHeight + 4 && r.left >= -4 && r.right <= window.innerWidth + 4,
    }
  })
}

const results = []
const browser = await chromium.launch({ headless: true })

try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await context.newPage()

    await page.goto(`${BASE}/project-hq/marco`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2800)

    const hub = await page.evaluate(() => {
      const grow = document.querySelector('[data-testid="project-v3-grow"]')
      const title = grow?.querySelector('h2, [class*="BandTitle"]') || grow
      const text = (grow?.innerText || '').slice(0, 400)
      return {
        grow: !!grow,
        boostTitle: /Boost Your Project/i.test(text),
        tagline: /Increase visibility/i.test(text),
        cards: [
          'project-v3-grow-featured',
          'project-v3-grow-trend',
          'project-v3-grow-liquidity',
          'project-v3-grow-farm',
          'project-v3-grow-pool',
          'project-v3-grow-claim',
        ].map((id) => !!document.querySelector(`[data-testid="${id}"]`)),
        trust: !!document.querySelector('[data-testid="project-v3-trust-badges"]'),
        history: !!document.querySelector('[data-testid="project-marketing-history"]'),
        featured: !!document.querySelector('[data-featured-pipeline="FeaturedProjectsRail"]'),
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
      }
    })
    await page.locator('[data-testid="project-v3-grow"]').scrollIntoViewIfNeeded().catch(() => {})
    await page.screenshot({ path: path.join(SHOTS, `project-growth-hub-${vp.name}.png`), fullPage: false })

    // Featured checkout funnel
    await page.locator('[data-testid="project-v3-grow-featured"]').click().catch(() => {})
    await page.waitForTimeout(700)
    let featuredModal = await measureModal(page)
    await page.screenshot({ path: path.join(SHOTS, `featured-checkout-${vp.name}.png`) })
    // advance a couple steps if open
    if (featuredModal.open) {
      await page.locator('[data-testid="commercial-checkout-next"]').click().catch(() => {})
      await page.waitForTimeout(400)
      await page.locator('[data-testid="commercial-checkout-next"]').click().catch(() => {})
      await page.waitForTimeout(400)
      await page.screenshot({ path: path.join(SHOTS, `featured-package-${vp.name}.png`) })
      featuredModal = await measureModal(page)
      await page.locator('[data-testid="commercial-checkout-close"]').click().catch(() => {})
      await page.waitForTimeout(400)
    }

    // Trend checkout
    await page.locator('[data-testid="project-v3-grow-trend"]').click().catch(() => {})
    await page.waitForTimeout(700)
    const trendModal = await measureModal(page)
    await page.screenshot({ path: path.join(SHOTS, `trend-checkout-${vp.name}.png`) })
    if (trendModal.open) {
      await page.locator('[data-testid="commercial-checkout-close"]').click().catch(() => {})
      await page.waitForTimeout(400)
    }

    // Claim wizard
    await page.locator('[data-testid="project-v3-claim-cta"]').click().catch(() => {})
    await page.waitForTimeout(700)
    const claimModal = await measureModal(page)
    await page.screenshot({ path: path.join(SHOTS, `claim-wizard-${vp.name}.png`) })
    if (claimModal.open) {
      await page.locator('[data-testid="claim-wizard-close"]').click().catch(() => {})
      await page.waitForTimeout(400)
    }

    // Home + Projects featured pipeline
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2000)
    const homeFeatured = await page.evaluate(() => !!document.querySelector('[data-testid="dex-home-featured-projects"]'))
    await page.screenshot({ path: path.join(SHOTS, `home-featured-${vp.name}.png`) })

    await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2000)
    const projectsFeatured = await page.evaluate(
      () =>
        !!document.querySelector('[data-testid="projects-directory-featured"]') &&
        !!document.querySelector('[data-featured-pipeline="FeaturedProjectsRail"]'),
    )
    await page.screenshot({ path: path.join(SHOTS, `projects-featured-${vp.name}.png`) })

    const checks = [
      hub.grow,
      hub.boostTitle,
      hub.tagline,
      hub.cards.every(Boolean),
      hub.trust,
      hub.history,
      hub.featured,
      !hub.overflowX,
      featuredModal.open,
      featuredModal.system === 'v3',
      featuredModal.footer,
      trendModal.open,
      trendModal.system === 'v3',
      claimModal.open,
      claimModal.system === 'v3',
      homeFeatured,
      projectsFeatured,
    ]

    results.push({
      viewport: vp.name,
      status: checks.every(Boolean) ? 'ok' : 'fail',
      hub,
      featuredModal,
      trendModal,
      claimModal,
      homeFeatured,
      projectsFeatured,
    })

    await context.close()
  }
} finally {
  await browser.close()
}

const report = {
  mission: 'MELEGASWAP_V2_GROWTH_HUB_AND_COMMERCIAL_CHECKOUT',
  base: BASE,
  at: new Date().toISOString(),
  results,
  pass: results.every((r) => r.status === 'ok'),
}

fs.writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
process.exit(report.pass ? 0 : 1)
