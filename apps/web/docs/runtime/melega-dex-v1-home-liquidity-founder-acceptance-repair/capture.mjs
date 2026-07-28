#!/usr/bin/env node
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.FOUNDER_BASE || 'http://127.0.0.1:3481'
const VIEWPORTS = [
  { w: 1920, h: 1080 },
  { w: 1600, h: 900 },
  { w: 1440, h: 900 },
  { w: 1366, h: 768 },
  { w: 1024, h: 768 },
  { w: 430, h: 932 },
  { w: 390, h: 844 },
]

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
}

async function j(url) {
  try {
    const r = await fetch(url)
    if (!r.ok) return { ok: false, status: r.status }
    return { ok: true, json: await r.json() }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

fs.mkdirSync(path.join(OUT, 'responsive-pack'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'raw'), { recursive: true })

const browser = await chromium.launch({ headless: true })
const report = {
  capturedAt: new Date().toISOString(),
  base: BASE,
  overflows: [],
  pages: {},
  consoleErrors: {},
  responsive: [],
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const errs = []
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(m.text())
  })
  page.on('pageerror', (e) => errs.push(String(e)))

  for (const route of [
    { name: 'home', path: '/' },
    { name: 'liquidity', path: '/liquidity' },
    { name: 'docs', path: '/docs' },
    { name: 'audit', path: '/audit' },
  ]) {
    await page.goto(BASE + route.path, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(4500)
    const o = await overflow(page)
    if (o) report.overflows.push(`${route.name}@1440`)
    const text = await page.evaluate(() => document.body?.innerText || '')
    report.pages[route.name] = {
      overflow: o,
      hasMarketsKpi: /MARKETS/i.test(text),
      noIndexedTokensKpi: !/Indexed Tokens/i.test(text),
      noReserved: !/Future position tools will appear here/i.test(text),
      hasEcosystem: /Passport|PASSPORT/i.test(text),
      topMoversEmpty: /Market activity unavailable/i.test(text),
      featuredCount: await page.locator('[data-featured-slug]').count().catch(() => 0),
      reservedCount: await page.locator('[data-testid="liquidity-my-positions-reserved"]').count().catch(() => 0),
      insightsCards: await page
        .locator('[data-testid="liquidity-insights-module"] article')
        .count()
        .catch(() => 0),
    }
    await page.screenshot({ path: path.join(OUT, 'raw', `${route.name}-1440.png`), fullPage: true })
    console.log(route.name, JSON.stringify(report.pages[route.name]))
  }

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: path.join(OUT, 'featured-projects-desktop.png'), fullPage: false })
  await page.screenshot({ path: path.join(OUT, 'top-movers-desktop.png'), fullPage: false })

  await page.goto(`${BASE}/liquidity`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(3500)
  await page.screenshot({ path: path.join(OUT, 'explore-pools-desktop.png'), fullPage: false })

  await page.goto(`${BASE}/docs`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(OUT, 'docs-page.png'), fullPage: false })

  await page.goto(`${BASE}/audit`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: path.join(OUT, 'audit-page.png'), fullPage: false })

  report.consoleErrors.desktop1440 = errs.slice(0, 50)
  await context.close()
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: path.join(OUT, 'featured-projects-mobile.png'), fullPage: false })
  await page.screenshot({ path: path.join(OUT, 'top-movers-mobile.png'), fullPage: false })
  await page.goto(`${BASE}/liquidity`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: path.join(OUT, 'explore-pools-mobile.png'), fullPage: false })
  await context.close()
}

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
  const page = await context.newPage()
  for (const route of ['/', '/liquidity']) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2000)
    const o = await overflow(page)
    const name = route === '/' ? 'home' : 'liquidity'
    const dir = path.join(OUT, 'responsive-pack', String(vp.w))
    fs.mkdirSync(dir, { recursive: true })
    await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: false })
    report.responsive.push({ route: name, width: vp.w, overflow: o })
    if (o) report.overflows.push(`${name}@${vp.w}`)
    console.log('VP', name, vp.w, o)
  }
  await context.close()
}

const pairs = await j(`${BASE}/api/indexer/pairs?pageSize=500&classification=tradeable`)
const events = await j(`${BASE}/api/indexer/events?types=Swap&limit=500`)
const tiers = await j(`${BASE}/api/indexer/tier-metrics`)
const health = await j(`${BASE}/api/indexer/health`)
const pairRows = pairs.json?.rows || []
const swapEvents = events.json?.events || []
const tierRows = tiers.json?.rows || []

report.topMoversIndex = {
  pairsScanned: pairRows.length || pairs.json?.total || 0,
  swapEventsReturned: swapEvents.length,
  tierMetricRows: tierRows.length,
  tierWithChange: tierRows.filter((r) => r.priceChange24h != null).length,
  tierWithTrades: tierRows.filter((r) => (r.tradeCount24h || 0) > 0).length,
  healthOk: Boolean(health.ok),
  emptyRibbonObserved: report.pages.home?.topMoversEmpty ?? null,
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(`${BASE}/liquidity`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(5000)
  report.explorePools = await page.evaluate(() => {
    const cards = Array.from(
      document.querySelectorAll(
        '[data-testid="liquidity-pool-discovery-card"], [data-liquidity-discovery-card], [data-liquidity-module="003-pool-discovery"] article',
      ),
    )
    let withTvl = 0
    let withVol = 0
    let withFees = 0
    for (const c of cards) {
      const t = c.innerText || ''
      if (/\$\d/.test(t) && /TVL/i.test(t)) withTvl += 1
      if (/\$\d/.test(t) && /Vol/i.test(t)) withVol += 1
      if (/\$\d/.test(t) && /Fee/i.test(t)) withFees += 1
    }
    return {
      total: cards.length,
      withTvl,
      withVol,
      withFees,
      dashHeavy: cards.filter((c) => ((c.innerText || '').match(/—/g) || []).length >= 3).length,
    }
  })
  await context.close()
}

fs.writeFileSync(path.join(OUT, 'capture-raw.json'), JSON.stringify(report, null, 2))
await browser.close()
console.log(
  'CAPTURE_DONE',
  JSON.stringify(
    { overflows: report.overflows, topMovers: report.topMoversIndex, explore: report.explorePools, pages: report.pages },
    null,
    2,
  ),
)
