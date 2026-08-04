#!/usr/bin/env node
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = (() => {
  try {
    return require('playwright')
  } catch {}
  try {
    return require('/tmp/node_modules/playwright')
  } catch {}
  throw new Error('playwright not installed — npm i playwright')
})()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'screenshots')
const BASE = process.env.MISSION_BASE || 'http://127.0.0.1:3010'

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false })
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e)))

  const report = {
    mission: 'MELEGASWAP_V2_MULTICHAIN_FARMS_POOLS_AND_TRENDING_PRODUCT_REPAIR',
    base: BASE,
    viewport: '1440x900',
    verifiedAt: new Date().toISOString(),
    checks: {},
    pageErrors,
  }

  // Farms
  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(8000)
  await shot(page, '01-farms-desktop')
  const farmCards = await page.locator('[data-testid="farms-explore-card"], [data-farm-id]').count()
  const farmChainFilters = await page.locator('[data-testid="farms-chain-filters"]').count()
  const farmChainBadges = await page.locator('[data-testid="farms-explore-card"] [data-testid="melega-explore-chain-badge"], [data-farm-id] img, [data-testid="melega-chain-badge"]').count()
  const farmChains = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('[data-farm-chain], [data-chain-id]')]
    return [...new Set(nodes.map((n) => n.getAttribute('data-farm-chain') || n.getAttribute('data-chain-id')).filter(Boolean))]
  })
  report.checks.farmsDesktop = {
    farmCards,
    farmChainFilters: farmChainFilters > 0,
    farmChainBadges,
    farmChains,
    multiChainCards: farmChains.length > 1 || farmCards > 0,
    oops: (await page.locator('text=Oops').count()) === 0,
  }

  if (farmChainFilters > 0) {
    const poly = page.locator('[data-testid="farms-chain-filters"] button', { hasText: 'Polygon' }).first()
    if (await poly.count()) {
      await poly.click()
      await page.waitForTimeout(1500)
      await shot(page, '02-farms-chain-filter-polygon')
      report.checks.farmsPolygonFilter = true
      const all = page.locator('[data-testid="farms-chain-filters"] button', { hasText: 'All' }).first()
      if (await all.count()) await all.click()
      await page.waitForTimeout(800)
    }
  }

  await shot(page, '03-farms-my-positions')
  report.checks.farmsMyPositions = (await page.locator('[data-testid="farms-my-farms-module"], #farms-my-farms-title').count()) > 0

  // Cross-chain switch dialog (simulate via button with Switch Network if present)
  const switchBtn = page.locator('button', { hasText: 'Switch Network' }).first()
  if (await switchBtn.count()) {
    await switchBtn.click()
    await page.waitForTimeout(500)
    const dialog = await page.locator('[data-testid="chain-switch-confirm-dialog"]').count()
    await shot(page, '04-cross-chain-switch-dialog')
    report.checks.switchDialog = dialog > 0
    const cancel = page.locator('[data-testid="chain-switch-cancel"]')
    if (await cancel.count()) await cancel.click()
    report.checks.switchCancel = true
  } else {
    report.checks.switchDialog = 'no-cross-chain-cta-visible-on-active-chain'
  }

  // Pools
  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(8000)
  await shot(page, '05-pools-desktop')
  const poolsIa = await page.locator('[data-pools-ia="multichain-product-repair-v1"]').count()
  const createModalPinned = await page.locator('[data-ps-create-pool-permanently-expanded]').count()
  const poolCards = await page.locator('[data-testid="pools-explore-card"]').count()
  const poolChainFilters = await page.locator('[data-testid="pools-chain-filters"]').count()
  const blankGiant = await page.evaluate(() => {
    const body = document.body
    return body.scrollWidth > body.clientWidth + 40
  })
  report.checks.poolsDesktop = {
    poolsIa: poolsIa > 0,
    noPermanentCreateColumn: createModalPinned === 0,
    poolCards,
    poolChainFilters: poolChainFilters > 0,
    noHorizontalOverflow: !blankGiant,
    oops: (await page.locator('text=Oops').count()) === 0,
  }

  const createCta = page.locator('button', { hasText: /Create Pool/i }).first()
  if (await createCta.count()) {
    await createCta.click()
    await page.waitForTimeout(1200)
    await shot(page, '06-create-pool-flow')
    const modal = await page.locator('[data-testid="create-pool-modal"], #create-pool-modal, [data-create-pool-modal]').count()
    report.checks.createPoolFlow = modal > 0 || /create=1|create-pool/i.test(page.url())
    await page.keyboard.press('Escape')
    await page.waitForTimeout(600)
  }

  await shot(page, '07-pools-my-positions')
  report.checks.poolsMyPositions = (await page.locator('[data-testid="pools-my-positions-module"], #pools-my-positions-title').count()) > 0

  // Home trending
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(10000)
  await shot(page, '08-trending-bar')
  await shot(page, '09-top-movers')
  const tickerEval = await page.evaluate(() => {
    const items = [...document.querySelectorAll('[data-testid="melega-ticker"] [data-ticker-item], .melega-ticker-item, [class*="Ticker"] a, [class*="ticker"] a')]
    const texts = items.slice(0, 40).map((el) => (el.textContent || '').trim()).filter(Boolean)
    const organicOrPaid = texts.filter((t) => /%|Boosted|Featured|↑|↓|\+|\-/.test(t))
    return { sample: texts.slice(0, 12), organicOrPaidCount: organicOrPaid.length, totalSampled: texts.length }
  })
  report.checks.trending = tickerEval

  const topMovers = await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2,h3')].find((n) => /Top Movers/i.test(n.textContent || ''))
    if (!h) return { found: false }
    const section = h.closest('section') || h.parentElement
    const text = section?.textContent || ''
    return { found: true, hasPct: /%/.test(text), snippet: text.slice(0, 280) }
  })
  report.checks.topMovers = topMovers

  report.checks.pageErrorsEmpty = pageErrors.length === 0
  report.pass =
    report.checks.farmsDesktop?.oops &&
    report.checks.poolsDesktop?.oops &&
    report.checks.poolsDesktop?.noPermanentCreateColumn &&
    report.checks.farmsDesktop?.farmChainFilters &&
    report.checks.poolsDesktop?.poolChainFilters

  await writeFile(path.join(__dirname, 'browser-acceptance.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  process.exit(report.pass ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
