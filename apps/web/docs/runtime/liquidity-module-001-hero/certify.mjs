/**
 * LIQUIDITY_MODULE_001_HERO — DOM measurements + screenshots.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3492'

function within(actual, target, tol = 2) {
  if (actual == null || Number.isNaN(actual)) return false
  return Math.abs(actual - target) <= tol
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left }
    }
    const header =
      document.querySelector('[data-melega-global-header]') ||
      document.querySelector('header') ||
      document.querySelector('[class*="GlobalHeader"]')
    // Prefer explicit desktop header bar
    const desktopHeader = [...document.querySelectorAll('header')].find((el) => {
      const s = getComputedStyle(el)
      return s.position === 'fixed' && el.getBoundingClientRect().height >= 70 && el.getBoundingClientRect().height <= 74
    })
    const trending = document.querySelector('[data-testid="melega-global-trending-bar"]')
    const hero = document.querySelector('[data-testid="liq-one-page-header"]')
    const text = document.querySelector('[data-testid="liq-hero-text"]')
    const net = document.querySelector('[data-testid="liq-one-network-card"]')
    const grid = document.querySelector('[data-testid="liq-one-product-grid"]')
    const hBox = box(desktopHeader || header)
    const tBox = box(trending)
    const heroBox = box(hero)
    const textBox = box(text)
    const netBox = box(net)
    const gridBox = box(grid)
    const trendingToHero =
      heroBox && tBox ? heroBox.top - tBox.bottom : null
    const heroToProduct = heroBox && gridBox ? gridBox.top - heroBox.bottom : null
    const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    const tickerCount = document.querySelectorAll('[data-melega-global-trending-bar]').length
    const bg = hero ? getComputedStyle(hero).backgroundImage : null
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      header: hBox,
      trending: tBox,
      hero: heroBox,
      textBlock: textBox,
      networkCard: netBox,
      productGrid: gridBox,
      trendingToHeroGap: trendingToHero,
      heroToProductGap: heroToProduct,
      overflowX,
      trendingBarCount: tickerCount,
      heroBackgroundImage: bg,
      pageScrollWidth: document.documentElement.scrollWidth,
    }
  })
}

function evaluateDesktop(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('headerHeight', m.header?.height, 72)
  add('trendingHeight', m.trending?.height, 44)
  add('trendingToHeroGap', m.trendingToHeroGap, 24)
  add('heroWidth', m.hero?.width, 1376)
  add('heroHeight', m.hero?.height, 216)
  add('heroLeft', m.hero?.left, 32)
  add('heroRightMargin', m.viewport.width - (m.hero?.right ?? 0), 32)
  add('networkWidth', m.networkCard?.width, 174)
  add('networkHeight', m.networkCard?.height, 66)
  add('heroToProductGap', m.heroToProductGap, 24)
  checks.push({
    name: 'singleTrendingBar',
    actual: m.trendingBarCount,
    target: 1,
    ok: m.trendingBarCount === 1,
  })
  checks.push({
    name: 'exactHeroImage',
    actual: m.heroBackgroundImage,
    target: 'liquidity-hero-background.png',
    ok: Boolean(m.heroBackgroundImage?.includes('liquidity-hero-background.png')),
  })
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  return { pass: checks.every((c) => c.ok), checks }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  // Desktop 1440×500
  const desk = await browser.newPage({ viewport: { width: 1440, height: 500 } })
  await desk.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForSelector('[data-testid="liq-one-page-header"]', { timeout: 90000 })
  await desk.waitForSelector('[data-testid="melega-global-trending-bar"]', { timeout: 30000 })
  await desk.waitForTimeout(2500)
  const desktop = await measure(desk)
  await desk.screenshot({
    path: path.join(OUT, 'desktop-1440-header-trending-hero.png'),
    fullPage: false,
  })
  await desk.close()

  // Mobile 390×500
  const mob = await browser.newPage({ viewport: { width: 390, height: 500 } })
  await mob.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="liq-one-page-header"]', { timeout: 90000 })
  await mob.waitForTimeout(2500)
  const mobile = await measure(mob)
  await mob.screenshot({
    path: path.join(OUT, 'mobile-390-header-trending-hero.png'),
    fullPage: false,
  })
  await mob.close()

  // Spot-check trending bar on required routes
  const routes = ['/', '/liquidity-studio', '/farms', '/pools', '/list', '/passport']
  const routePresence = []
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 400 } })
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(1500)
    const count = await page.locator('[data-testid="melega-global-trending-bar"]').count()
    routePresence.push({ route, trendingBars: count, ok: count === 1 })
    await page.close()
  }

  const acceptance = evaluateDesktop(desktop)
  const report = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    desktop,
    mobile,
    acceptanceDesktop: acceptance,
    routePresence,
    verdict:
      acceptance.pass && routePresence.every((r) => r.ok) ? 'HERO_GEOMETRY_PASS' : 'HERO_GEOMETRY_FAIL',
  }
  fs.writeFileSync(path.join(OUT, 'hero-dom-measurements.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        verdict: report.verdict,
        failed: acceptance.checks.filter((c) => !c.ok),
        routePresence,
      },
      null,
      2,
    ),
  )
  await browser.close()
  process.exit(report.verdict === 'HERO_GEOMETRY_PASS' ? 0 : 2)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
