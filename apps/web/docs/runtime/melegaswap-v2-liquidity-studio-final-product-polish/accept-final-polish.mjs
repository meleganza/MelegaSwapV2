/**
 * Browser acceptance — Liquidity Studio Final Product Polish.
 * Usage: node accept-final-polish.mjs [baseUrl]
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
  await page.waitForTimeout(300)
}

async function clickTab(page, step) {
  const btn = page.locator(`[data-testid="${step.testId}"]`)
  await btn.waitFor({ state: 'visible', timeout: 15000 })
  const already = await page.evaluate(
    (expect) =>
      document.querySelector('[data-testid="liquidity-v3-workspace"]')?.getAttribute('data-liquidity-tab') === expect,
    step.expect,
  )
  if (!already) await btn.click({ timeout: 10000, force: true })
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

  // Rapid tab switches — no blank / wrong tab
  for (const step of [...TABS, TABS[0], TABS[1]]) {
    const t0 = Date.now()
    await clickTab(page, step)
    const ms = Date.now() - t0
    const state = await page
      .evaluate(() => {
        const ws = document.querySelector('[data-testid="liquidity-v3-workspace"]')
        return {
          tab: ws?.getAttribute('data-liquidity-tab'),
          blank: !ws || ws.getBoundingClientRect().height < 40,
          hero: !!document.querySelector('[data-testid="liquidity-v3-hero"]'),
          snap: !!document.querySelector('[data-testid="liquidity-v3-snapshot"]'),
          url: location.href,
        }
      })
      .catch(() => null)
    if (!state) {
      failures.push(`context lost on ${step.expect}`)
      await page.goto(`${BASE}/liquidity-studio/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
      await waitReady(page)
      continue
    }
    if (state.blank) failures.push(`blank on ${step.expect}`)
    if (state.tab !== step.expect) failures.push(`expected ${step.expect} got ${state.tab}`)
    if (!state.hero || !state.snap) failures.push(`missing chrome on ${step.expect}`)
    if (ms > 2500) failures.push(`slow ${step.expect}: ${ms}ms`)
  }

  // Hero Add CTA
  await clickTab(page, TABS[0])
  await page.locator('[data-testid="liquidity-v3-hero-add"]').click({ force: true })
  await page
    .waitForFunction(
      () =>
        document.querySelector('[data-testid="liquidity-v3-workspace"]')?.getAttribute('data-liquidity-tab') === 'add',
      { timeout: 5000 },
    )
    .catch(() => failures.push('hero Add CTA failed'))

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto(`${BASE}/liquidity-studio/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await waitReady(page)
    await clickTab(page, TABS[0])
    await page.screenshot({ path: path.join(OUT, `viewport-${vp.name}-positions.png`), fullPage: true })
    await clickTab(page, TABS[1])
    await page.screenshot({ path: path.join(OUT, `viewport-${vp.name}-add.png`), fullPage: true })
    await clickTab(page, TABS[2])
    await page.screenshot({ path: path.join(OUT, `viewport-${vp.name}-building.png`), fullPage: true })
    let overflowX = false
    try {
      overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
    } catch {
      failures.push(`evaluate failed @${vp.name}`)
    }
    if (overflowX) failures.push(`overflow @${vp.name}`)
    viewportResults.push({ viewport: vp.name, overflowX })
  }

  const report = {
    mission: 'MELEGASWAP_V2_LIQUIDITY_STUDIO_FINAL_PRODUCT_POLISH',
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
