/**
 * Browser acceptance: Liquidity Studio tab stability + viewports.
 * Usage: node accept-tabs.mjs [baseUrl]
 */
import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = (process.argv[2] || 'http://127.0.0.1:3117').replace(/\/$/, '')
const OUT = __dirname
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
]

const TABS = [
  { testId: 'liquidity-v3-tab-positions', expect: 'positions', panel: 'liquidity-v3-panel-positions' },
  { testId: 'liquidity-v3-tab-add', expect: 'add', panel: 'liquidity-v3-panel-add' },
  { testId: 'liquidity-v3-tab-ai', expect: 'building', panel: 'liquidity-v3-panel-ai' },
]

async function panelState(page) {
  return page.evaluate(() => {
    const ids = ['liquidity-v3-panel-positions', 'liquidity-v3-panel-add', 'liquidity-v3-panel-ai']
    return {
      tab: document.querySelector('[data-testid="liquidity-v3-workspace"]')?.getAttribute('data-liquidity-tab'),
      url: location.pathname + location.search,
      panels: ids.map((id) => {
        const el = document.querySelector(`[data-testid="${id}"]`)
        if (!el) return { id, missing: true }
        const r = el.getBoundingClientRect()
        return {
          id,
          display: getComputedStyle(el).display,
          h: Math.round(r.height),
          ariaHidden: el.getAttribute('aria-hidden'),
        }
      }),
      blank: (() => {
        const ws = document.querySelector('[data-testid="liquidity-v3-workspace"]')
        if (!ws) return true
        return ws.getBoundingClientRect().height < 40
      })(),
      hero: !!document.querySelector('[data-testid="liquidity-v3-hero"]'),
      artwork: !!document.querySelector(
        '[data-testid="liquidity-v3-hero-visual"] img, [data-testid="liquidity-v3-hero-visual"] svg',
      ),
      aiWide: !!document.querySelector('[data-testid="liquidity-v3-ai-builder"] [data-lb-force-expanded="1"]'),
      studioDash: !!document.querySelector('[data-testid="liq-lb-studio-dash"]'),
    }
  })
}

async function clickTab(page, step) {
  const btn = page.locator(`[data-testid="${step.testId}"]`)
  await btn.waitFor({ state: 'visible', timeout: 10000 })
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
  } catch (err) {
    // One retry — absorbs rare post-hydrate click loss without masking systemic regressions.
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
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  }).catch(() =>
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
  await page.waitForSelector('[data-testid="liquidity-v3-tabs"]', { timeout: 60000 })
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="liquidity-v3-workspace"]')
    if (!el) return false
    const ready = el.getAttribute('data-liquidity-tabs-ready')
    // Older builds omit the attr — treat as ready once workspace exists.
    return ready === null || ready === '1'
  }, { timeout: 15000 })
  // Allow hydration / default tab settle
  await page.waitForTimeout(200)

  let state = await panelState(page)
  if (state.tab !== 'positions') failures.push(`default tab=${state.tab} expected positions`)
  if (!state.hero) failures.push('hero missing')
  if (!state.artwork) failures.push('artwork missing')

  const sequence = []
  for (let i = 0; i < 100; i += 1) sequence.push(TABS[i % 3])

  let wrong = 0
  let blank = 0
  let routeReset = 0
  for (let i = 0; i < sequence.length; i += 1) {
    const step = sequence[i]
    try {
      await clickTab(page, step)
      state = await panelState(page)
    } catch (err) {
      wrong += 1
      if (wrong <= 5) failures.push(`click#${i + 1} error: ${err.message}`)
      continue
    }
    if (state.tab !== step.expect) {
      wrong += 1
      if (wrong <= 5) failures.push(`click#${i + 1} tab=${state.tab} expected ${step.expect}`)
    }
    const active = state.panels.find((p) => p.id === step.panel)
    if (!active || active.display !== 'block' || active.h < 20) {
      blank += 1
      if (blank <= 5) failures.push(`click#${i + 1} blank/hidden active panel ${step.panel}`)
    }
    for (const p of state.panels) {
      if (p.missing) {
        failures.push(`click#${i + 1} unmounted ${p.id}`)
        break
      }
      if (p.id !== step.panel && p.display !== 'none') {
        wrong += 1
        if (wrong <= 5) failures.push(`click#${i + 1} inactive visible ${p.id}`)
      }
    }
    if (!state.url.includes('liquidity')) routeReset += 1
  }

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto(`${BASE}/liquidity-studio/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForSelector('[data-testid="liquidity-v3-hero"]')
    await page.waitForTimeout(250)
    for (const step of TABS) {
      await clickTab(page, step)
      state = await panelState(page)
      const shot = path.join(OUT, `viewport-${vp.name}-${step.expect}.png`)
      await page.screenshot({ path: shot, fullPage: false })
      viewportResults.push({
        viewport: vp.name,
        tab: step.expect,
        ok: state.tab === step.expect && !state.blank && state.hero,
        state,
        shot: path.basename(shot),
      })
      if (state.tab !== step.expect || state.blank) {
        failures.push(`viewport ${vp.name} tab ${step.expect} failed`)
      }
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 })
  await clickTab(page, TABS[2])
  state = await panelState(page)
  const aiWidth = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="liq-building-card"]')
    return el ? Math.round(el.getBoundingClientRect().width) : 0
  })
  if (aiWidth < 900) failures.push(`AI builder too narrow: ${aiWidth}px`)

  const report = {
    mission: 'MELEGASWAP_V2_LIQUIDITY_STUDIO_FINAL_PRODUCT_RESTORE',
    base: BASE,
    clicks: 100,
    wrongTab: wrong,
    blankScreen: blank,
    routeReset,
    aiWidthPx: aiWidth,
    viewportResults,
    failures,
    pass: failures.length === 0 && wrong === 0 && blank === 0 && routeReset === 0,
    timestamp: new Date().toISOString(),
  }

  writeFileSync(path.join(OUT, 'browser-acceptance-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  if (!report.pass) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
