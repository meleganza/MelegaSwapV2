#!/usr/bin/env node
/**
 * R782 — production-like route smoke (Playwright).
 * Asserts primary routes render without global error boundary or page errors.
 */
import { chromium, devices } from 'playwright'

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000'
const ROUTES = [
  '/',
  '/trade',
  '/liquidity-studio',
  '/pools',
  '/farms',
  '/trending',
  '/projects',
  '/radar',
  '/dex-intelligence',
  '/collectibles',
  '/identity',
  '/build-studio',
  '/status',
]

const ERROR_MARKERS = [
  'Oops, something wrong',
  'Oops',
  'Application error',
  'Internal Server Error',
  'something went wrong',
]

async function smokeRoute(page, route, viewport) {
  const errors = []
  const consoleErrors = []

  page.on('pageerror', (err) => {
    errors.push({ type: 'pageerror', message: err.message, stack: err.stack })
  })
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      consoleErrors.push(text.length > 240 ? `${text.slice(0, 240)}…` : text)
    }
  })

  const url = `${BASE}${route}`
  let res
  try {
    res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 })
    await page.waitForTimeout(3000)
  } catch (e) {
    return {
      route,
      viewport: `${viewport.width}x${viewport.height}`,
      status: 0,
      ok: false,
      hasErrorMarker: false,
      hasGlobalBoundary: false,
      pageErrors: errors,
      consoleErrors: consoleErrors.slice(0, 5),
      navigationError: e instanceof Error ? e.message : String(e),
    }
  }

  const bodyText = await page.evaluate(() => document.body?.innerText || '')
  const hasErrorMarker = ERROR_MARKERS.some((m) => bodyText.includes(m))
  const hasGlobalBoundary = bodyText.includes('Error Tracking Id')

  return {
    route,
    viewport: `${viewport.width}x${viewport.height}`,
    status: res?.status() ?? 0,
    ok: res?.ok === true && !hasErrorMarker && !hasGlobalBoundary && errors.length === 0,
    hasErrorMarker,
    hasGlobalBoundary,
    pageErrors: errors,
    consoleErrors: consoleErrors.slice(0, 5),
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const viewports = [
    { name: 'desktop', ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    { name: 'mobile', ...devices['iPhone 12'], viewport: { width: 390, height: 844 } },
  ]

  const results = []

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: vp.viewport,
      userAgent: vp.userAgent,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    })
    const page = await context.newPage()

    for (const route of ROUTES) {
      results.push(await smokeRoute(page, route, vp.viewport))
    }

    await context.close()
  }

  await browser.close()

  const pass = results.every((r) => r.ok)
  const report = {
    mission: 'R782 production route smoke',
    baseUrl: BASE,
    timestamp: new Date().toISOString(),
    pass,
    failureCount: results.filter((r) => !r.ok).length,
    results,
  }

  console.log(JSON.stringify(report, null, 2))
  process.exit(pass ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
