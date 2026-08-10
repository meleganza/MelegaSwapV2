/**
 * Browser acceptance — Liquidity Studio Premium UX Consolidation.
 * Usage: node accept-premium-ux.mjs [baseUrl]
 */
import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = (process.argv[2] || 'http://127.0.0.1:3118').replace(/\/$/, '')
const OUT = __dirname
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '390', width: 390, height: 844 },
]

const TABS = [
  { testId: 'liquidity-v3-tab-positions', expect: 'positions' },
  { testId: 'liquidity-v3-tab-add', expect: 'add' },
  { testId: 'liquidity-v3-tab-ai', expect: 'building' },
]

async function waitReady(page) {
  await page.waitForSelector('[data-testid="liquidity-v3-workspace"]', { timeout: 60000 })
  await page
    .waitForFunction(
      () =>
        document.querySelector('[data-testid="liquidity-v3-workspace"]')?.getAttribute('data-liquidity-tabs-ready') ===
        '1',
      { timeout: 20000 },
    )
    .catch(() => {})
  await page.waitForTimeout(350)
}

async function clickTab(page, step) {
  const btn = page.locator(`[data-testid="${step.testId}"]`)
  await btn.waitFor({ state: 'visible', timeout: 15000 })
  const already = await page.evaluate((expect) => {
    return (
      document.querySelector('[data-testid="liquidity-v3-workspace"]')?.getAttribute('data-liquidity-tab') ===
      expect
    )
  }, step.expect)
  if (!already) {
    await btn.click({ timeout: 10000, force: true })
  }
  try {
    await page.waitForFunction(
      ({ expect, testId }) => {
        const tab = document
          .querySelector('[data-testid="liquidity-v3-workspace"]')
          ?.getAttribute('data-liquidity-tab')
        const selected = document.querySelector(`[data-testid="${testId}"]`)?.getAttribute('aria-selected')
        return tab === expect && selected === 'true'
      },
      { expect: step.expect, testId: step.testId },
      { timeout: 8000 },
    )
  } catch {
    await btn.click({ timeout: 10000, force: true })
    await page.waitForFunction(
      ({ expect, testId }) => {
        const tab = document
          .querySelector('[data-testid="liquidity-v3-workspace"]')
          ?.getAttribute('data-liquidity-tab')
        const selected = document.querySelector(`[data-testid="${testId}"]`)?.getAttribute('aria-selected')
        return tab === expect && selected === 'true'
      },
      { expect: step.expect, testId: step.testId },
      { timeout: 8000 },
    )
  }
}

async function main() {
  const browser = await chromium
    .launch({ channel: 'chrome', headless: true })
    .catch(() =>
      chromium.launch({
        executablePath:
          process.env.CHROME_PATH ||
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
      }),
    )

  const page = await browser.newPage()
  const failures = []
  const viewportResults = []

  await page.goto(`${BASE}/liquidity-studio/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await waitReady(page)

  // Instant tab switches (no blank / wrong tab)
  for (const step of TABS) {
    const t0 = Date.now()
    await clickTab(page, step)
    const ms = Date.now() - t0
    const state = await page
      .evaluate(() => {
        const ws = document.querySelector('[data-testid="liquidity-v3-workspace"]')
        const tab = ws?.getAttribute('data-liquidity-tab')
        const blank = !ws || ws.getBoundingClientRect().height < 40
        const hero = !!document.querySelector('[data-testid="liquidity-v3-hero"]')
        const trust = !!document.querySelector(
          '[data-testid="liquidity-hero-trust"], [data-testid="liquidity-v3-hero-trust"]',
        )
        const snap = !!document.querySelector('[data-testid="liquidity-v3-snapshot"]')
        const aiLayout = document
          .querySelector('[data-testid="liquidity-v3-ai-entry"]')
          ?.getAttribute('data-ai-layout')
        const startBuilder = !!document.querySelector('[data-testid="liquidity-v3-ai-start"]')
        return { tab, blank, hero, trust, snap, aiLayout, startBuilder, url: location.href }
      })
      .catch(() => null)
    if (!state) {
      failures.push(`navigation destroyed context on ${step.expect}`)
      continue
    }
    if (state.blank) failures.push(`blank screen on ${step.expect}`)
    if (state.tab !== step.expect) failures.push(`expected ${step.expect} got ${state.tab}`)
    if (!state.hero) failures.push(`missing hero on ${step.expect}`)
    if (ms > 2500) failures.push(`slow tab switch ${step.expect}: ${ms}ms`)
    if (step.expect === 'building') {
      if (state.aiLayout !== 'horizontal') failures.push(`AI layout not horizontal: ${state.aiLayout}`)
      if (!state.startBuilder) failures.push('Start Builder CTA missing')
    }
    if (!state.snap) failures.push(`snapshot missing on ${step.expect}`)
  }

  // Hero CTA → Add Liquidity (single click)
  await clickTab(page, TABS[0])
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="liquidity-v3-workspace"]')?.getAttribute('data-liquidity-tabs-ready') ===
      '1',
    { timeout: 15000 },
  )
  const addCta = page.locator('[data-testid="liquidity-v3-hero-add"]')
  if ((await addCta.count()) > 0) {
    await addCta.first().click({ force: true })
    try {
      await page.waitForFunction(
        () =>
          document.querySelector('[data-testid="liquidity-v3-workspace"]')?.getAttribute('data-liquidity-tab') ===
          'add',
        { timeout: 5000 },
      )
    } catch {
      failures.push('hero Add CTA did not open add')
    }
  } else {
    failures.push('missing liquidity-v3-hero-add')
  }

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto(`${BASE}/liquidity-studio/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await waitReady(page)
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="liquidity-v3-workspace"]')?.getAttribute('data-liquidity-tabs-ready') ===
        '1',
      { timeout: 20000 },
    ).catch(() => {})
    await clickTab(page, TABS[0])
    await page.screenshot({ path: path.join(OUT, `viewport-${vp.name}-positions.png`), fullPage: true })
    await clickTab(page, TABS[1])
    await page.screenshot({ path: path.join(OUT, `viewport-${vp.name}-add.png`), fullPage: true })
    await clickTab(page, TABS[2])
    await page.screenshot({ path: path.join(OUT, `viewport-${vp.name}-building.png`), fullPage: true })

    let overflowX = false
    try {
      overflowX = await page.evaluate(() => {
        const doc = document.documentElement
        return doc.scrollWidth > doc.clientWidth + 2
      })
    } catch {
      failures.push(`viewport evaluate failed @${vp.name}`)
    }
    if (overflowX) failures.push(`horizontal overflow @${vp.name}`)
    viewportResults.push({ viewport: vp.name, overflowX })
  }

  const report = {
    mission: 'MELEGASWAP_V2_LIQUIDITY_STUDIO_PREMIUM_UX_CONSOLIDATION',
    base: BASE,
    passed: failures.length === 0,
    failures,
    viewportResults,
    at: new Date().toISOString(),
  }
  writeFileSync(path.join(OUT, 'browser-acceptance-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  process.exit(failures.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
