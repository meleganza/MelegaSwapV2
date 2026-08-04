#!/usr/bin/env node
/**
 * RC2 emergency browser acceptance — header nav + journey absence + ecosystem + crash checks.
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'screenshots')
const BASE = process.env.RC2_BASE || 'http://127.0.0.1:3000'
const BYPASS = process.env.VERCEL_BYPASS || ''

const HEADER = [
  ['home', 'melega-header-nav-home', '/', /Melega|Start trading|Top Movers/i],
  ['liquidity', 'melega-header-nav-liquidity', '/liquidity-studio', /Liquidity|Add liquidity|Your positions/i],
  ['farms', 'melega-header-nav-farms', '/farms', /Farms|Earn rewards|farm/i],
  ['pools', 'melega-header-nav-pools', '/pools', /Pools|Explore pools|pool/i],
  ['list', 'melega-header-nav-list', '/list', /List|Import|Launch/i],
  ['passport', 'melega-header-nav-passport', '/passport', /Passport|Portfolio|MARCO/i],
]

const FORBIDDEN = [
  'Founder Path',
  'Investor Path',
  'Liquidity Manager',
  'JourneyGuideRail',
  'Next: Explore Pools',
  'Next: Documentation',
]

async function healthy(page) {
  const body = await page.locator('body').innerText()
  const oops = /Oops, something wrong|Application error|switch network to BSC Network/i.test(body)
  return { ok: !oops, body }
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const headers = BYPASS ? { 'x-vercel-protection-bypass': BYPASS } : {}
  const ctx = await browser.newContext({
    extraHTTPHeaders: headers,
    viewport: { width: 1440, height: 900 },
  })
  const page = await ctx.newPage()
  const consoleErrors = []
  page.on('pageerror', (err) => consoleErrors.push(String(err)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  const proof = {
    base: BASE,
    startedAt: new Date().toISOString(),
    navigation: [],
    journeyAbsent: {},
    ecosystem: {},
    chainRoutes: {},
    consoleErrors: [],
    macbookViewport: {},
    verdictHints: {},
  }

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(6000)
  await page.screenshot({ path: path.join(OUT, '01-home.png'), fullPage: false })

  for (const [name, testId, expectPath, contentRe] of HEADER) {
    const beforeUrl = page.url()
    const link = page.getByTestId(testId)
    const visible = await link.isVisible().catch(() => false)
    if (visible) {
      await link.click({ timeout: 15000 })
      await page.waitForTimeout(2500)
    } else {
      await page.goto(`${BASE}${expectPath}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
      await page.waitForTimeout(2500)
    }
    const url = page.url()
    const { ok, body } = await healthy(page)
    const pathOk = url.includes(expectPath.replace(/\?.*/, '')) || (expectPath === '/' && /\/(\?|$)/.test(new URL(url).pathname + (new URL(url).search || '')))
    // Home path special-case
    const pathname = new URL(url).pathname.replace(/\/$/, '') || '/'
    const expected = expectPath.replace(/\/$/, '') || '/'
    const routeOk = expected === '/' ? pathname === '/' : pathname.startsWith(expected)
    const contentOk = contentRe.test(body)
    const journeyHit = FORBIDDEN.filter((f) => body.includes(f))
    proof.navigation.push({
      name,
      testId,
      beforeUrl,
      afterUrl: url,
      routeOk,
      contentOk,
      healthy: ok,
      journeyHits: journeyHit,
      usedClick: visible,
    })
    await page.screenshot({ path: path.join(OUT, `nav-${name}.png`), fullPage: false })
  }

  // Return home + ecosystem + metrics
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(8000)
  const home = await page.locator('body').innerText()
  proof.journeyAbsent = {
    founderPath: !home.includes('Founder Path'),
    investorPath: !home.includes('Investor Path'),
    liquidityManager: !home.includes('Liquidity Manager'),
    noJourneyHits: FORBIDDEN.every((f) => !home.includes(f)),
  }
  proof.ecosystem = {
    blackpump: /BLACKPUMP|BlackPump/i.test(home),
    radarRemoved: !/\bRADAR\b/.test(home) || home.indexOf('RADAR') < 0,
    labsRemoved: !/\bLABS\b/.test(home),
    passport: /PASSPORT/i.test(home),
    smartdrop: /SMARTDROP/i.test(home),
  }
  // Radar/Labs: check ecosystem section specifically
  const ecoText = await page.locator('text=Explore Melega Ecosystem').locator('..').innerText().catch(() => home)
  proof.ecosystem.sectionHasBlackpump = /BLACKPUMP/i.test(ecoText)
  proof.ecosystem.sectionHasRadar = /\bRADAR\b/.test(ecoText)
  proof.ecosystem.sectionHasLabs = /\bLABS\b/.test(ecoText)

  proof.homeMetrics = {
    activeFarmsNotFalseZero: !/Active Farms[\s\S]{0,40}\b0\b/.test(home) || /Active Farms[\s\S]{0,40}[1-9]/.test(home),
    topFarmsNotEmptyRanking: !/No live farm rankings yet/i.test(home),
    topPoolsNotEmptyRanking: !/No live pool rankings yet/i.test(home),
    hasTopMoversOrHonestEmpty: /Top Movers/i.test(home),
  }

  await page.screenshot({ path: path.join(OUT, '02-home-ecosystem.png'), fullPage: true })

  // Avalanche liquidity route
  await page.goto(`${BASE}/liquidity-studio/?view=add&chain=avalanche`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await page.waitForTimeout(8000)
  const avax = await healthy(page)
  proof.chainRoutes.avalancheLiquidity = {
    url: page.url(),
    healthy: avax.ok,
    noBscCopy: !/switch network to BSC Network/i.test(avax.body),
    hasLiquiditySurface: /Liquidity|unsupported|Add|positions|Avalanche/i.test(avax.body),
  }
  await page.screenshot({ path: path.join(OUT, '03-avalanche-liquidity.png'), fullPage: false })

  // Farms / Pools / Liquidity screenshots
  for (const [file, route] of [
    ['04-farms', '/farms'],
    ['05-pools', '/pools'],
    ['06-liquidity', '/liquidity-studio'],
  ]) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(5000)
    const h = await healthy(page)
    proof.chainRoutes[file] = { healthy: h.ok, journeyHits: FORBIDDEN.filter((f) => h.body.includes(f)) }
    await page.screenshot({ path: path.join(OUT, `${file}.png`), fullPage: false })
  }

  // MacBook viewport
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(5000)
  const heroTop = await page.evaluate(() => {
    const el =
      document.querySelector('[data-home-section]') ||
      document.querySelector('h1') ||
      document.querySelector('[data-testid="dex-home-kpi-rail"]')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top, text: (el.textContent || '').slice(0, 80) }
  })
  proof.macbookViewport = { heroTop, meaningfulContentNearTop: heroTop != null && heroTop.top < 420 }
  await page.screenshot({ path: path.join(OUT, '07-home-macbook-1440.png'), fullPage: false })

  // Chain selector presence (cannot fully wallet-switch headless without injected wallet)
  const chainControl = await page.getByTestId('network-button').count().catch(() => 0)
  const networkSwitcher = await page.locator('[data-testid*="network"], button:has-text("BNB"), button:has-text("BSC")').count()
  proof.chainRoutes.selectorVisible = chainControl + networkSwitcher > 0
  await page.screenshot({ path: path.join(OUT, '08-chain-selector.png'), fullPage: false })

  proof.consoleErrors = consoleErrors.slice(0, 40)
  proof.finishedAt = new Date().toISOString()

  const navOk = proof.navigation.every((n) => n.routeOk && n.healthy && n.journeyHits.length === 0)
  const journeyOk = proof.journeyAbsent.noJourneyHits
  const ecoOk =
    proof.ecosystem.sectionHasBlackpump &&
    !proof.ecosystem.sectionHasRadar &&
    !proof.ecosystem.sectionHasLabs
  const avaxOk = proof.chainRoutes.avalancheLiquidity?.healthy
  proof.verdictHints = { navOk, journeyOk, ecoOk, avaxOk }

  await writeFile(path.join(__dirname, 'browser-navigation-proof.json'), JSON.stringify(proof, null, 2))
  console.log(JSON.stringify(proof.verdictHints, null, 2))
  await browser.close()
  if (!navOk || !journeyOk || !ecoOk || !avaxOk) process.exitCode = 2
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
