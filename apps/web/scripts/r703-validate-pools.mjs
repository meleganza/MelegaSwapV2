#!/usr/bin/env node
/**
 * R703 Pools Premium — pixel validation with screenshots at 1440 / 1728 / 390.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r703-pools-premium')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const FORBIDDEN_APR = [
  '0%',
  '0.00%',
  'Calculating...',
  'Synchronizing...',
  'Calculating',
  'NaN',
  'Infinity',
  'APR —',
]

const ERROR_BOUNDARY_PATTERNS = [
  /oops,?\s*something\s*wrong/i,
  /application error/i,
  /unhandled runtime error/i,
  /error boundary/i,
]

function hasErrorBoundary(text) {
  return ERROR_BOUNDARY_PATTERNS.some((re) => re.test(text))
}

async function scanForbiddenApr(page) {
  return page.evaluate((forbidden) => {
    const hits = []
    const exactForbidden = new Set(forbidden.filter((f) => f !== 'NaN' && f !== 'Infinity'))
    const isAprLeaf = (el) => {
      if (el.closest('[data-ps-create-pool-builder], [data-melega-pool-v2]')) return false
      if (!(el.childNodes.length === 1 && el.childNodes[0].nodeType === 3)) return false
      const t = el.textContent?.trim() ?? ''
      if (!t) return false
      if (exactForbidden.has(t)) return true
      if (/^nan/i.test(t) || /infinity/i.test(t)) return true
      if (t === 'Calculating...' || t === 'Synchronizing...') return true
      if (/^0\.00%$/.test(t)) return true
      if (parseFloat(t.replace('%', '')) > 50) return true
      return false
    }
    document.querySelectorAll('[data-pools-studio-screen] *').forEach((el) => {
      if (isAprLeaf(el)) hits.push(el.textContent?.trim())
    })
    return [...new Set(hits)]
  }, FORBIDDEN_APR)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    forbiddenAprFound: [],
    errorBoundaries: [],
    tickerAprOk: false,
    sidebarVisible: false,
    featuredHeroVisible: false,
    createPoolBelowGrid: false,
    poolCards: 0,
    screenshots: [],
    passed: true,
  }

  const browser = await chromium.launch()
  const viewports = [
    { slug: '1440', width: 1440, height: 900 },
    { slug: '1728', width: 1728, height: 900 },
    { slug: '390', width: 390, height: 844 },
  ]

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-pools-studio-screen]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForTimeout(4000)

    const bodyText = await page.locator('body').innerText()
    if (hasErrorBoundary(bodyText)) {
      report.errorBoundaries.push({ viewport: vp.slug, error: 'Error boundary detected' })
      report.passed = false
    }

    const shot = `pools-r703-${vp.slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: true })
    report.screenshots.push(shot)

    if (vp.slug === '1440') {
      report.forbiddenAprFound = await scanForbiddenApr(page)
      if (report.forbiddenAprFound.length) report.passed = false

      report.poolCards = await page.locator('[data-ps-pool-card]').count()
      report.featuredHeroVisible = (await page.locator('[data-ps-featured-hero]').count()) > 0
      report.sidebarVisible = (await page.locator('[data-ps-sidebar]').count()) > 0

      const createY = await page.locator('[data-ps-create-pool-builder], [data-ps-create-pool]').first().boundingBox().catch(() => null)
      const gridY = await page.locator('[data-ps-pool-grid], [data-ps-pool-grid-empty], [data-ps-pool-list]').first().boundingBox().catch(() => null)
      if (createY && gridY) {
        report.createPoolBelowGrid = createY.y > gridY.y
      }

      const analyzeBtn = page.locator('[data-ps-pool-card] button:has-text("Analyze")').first()
      if (await analyzeBtn.count()) {
        await analyzeBtn.click()
        await page.waitForTimeout(500)
      }
      await page.screenshot({ path: path.join(OUT, 'pools-r703-1440-analyze.png'), fullPage: true })
      report.screenshots.push('pools-r703-1440-analyze.png')
    }

    await page.close()
  }

  const tickerPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await tickerPage.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await tickerPage.waitForTimeout(3000)
  const tickerText = await tickerPage.locator('[data-melega-ticker], [class*="TrendingRibbon"], header').first().innerText().catch(() => '')
  report.tickerAprOk =
    /Top Pool/i.test(tickerText) &&
    (/\d+\.\d+%\s*APR/i.test(tickerText) || /No sustainable pool/i.test(tickerText)) &&
    !/APR\s*—/i.test(tickerText)
  if (!report.tickerAprOk) report.passed = false
  await tickerPage.close()

  await browser.close()

  if (!report.featuredHeroVisible) report.passed = false
  if (!report.sidebarVisible) report.passed = false
  if (!report.createPoolBelowGrid) report.passed = false

  const lines = [
    '# R703 Pools Premium — Validation Report',
    '',
    `Generated: ${report.timestamp}`,
    `Base URL: ${report.baseUrl}`,
    '',
    '## Layout checks',
    `- Featured hero visible: ${report.featuredHeroVisible}`,
    `- Sidebar visible: ${report.sidebarVisible}`,
    `- Create Pool below grid: ${report.createPoolBelowGrid}`,
    `- Pool cards in grid: ${report.poolCards}`,
    `- Top ticker APR OK: ${report.tickerAprOk}`,
    '',
    '## Forbidden APR',
    ...(report.forbiddenAprFound.length ? report.forbiddenAprFound.map((f) => `- ${f}`) : ['- none']),
    '',
    '## Error boundaries',
    ...(report.errorBoundaries.length ? report.errorBoundaries.map((e) => `- ${e.viewport}: ${e.error}`) : ['- none']),
    '',
    '## Screenshots',
    ...report.screenshots.map((s) => `- docs/screenshots/r703-pools-premium/${s}`),
    '',
    report.passed ? '## RESULT\n\nR703 PASSED' : '## RESULT\n\nR703 FAILED',
  ]

  fs.writeFileSync(path.join(OUT, 'R703_VALIDATION_REPORT.md'), lines.join('\n'))
  console.log(lines.join('\n'))
  process.exit(report.passed ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
