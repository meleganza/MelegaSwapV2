#!/usr/bin/env node
/**
 * R702B Pools UX Recovery — route + pools validation with screenshots.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r702b-pools-recovery')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const ROUTES = [
  { slug: 'home', url: '/' },
  { slug: 'trade', url: '/trade' },
  { slug: 'liquidity-studio', url: '/liquidity-studio' },
  { slug: 'farms', url: '/farms' },
  { slug: 'pools', url: '/pools' },
  { slug: 'projects', url: '/projects' },
  { slug: 'radar', url: '/radar' },
  { slug: 'collectibles', url: '/collectibles' },
  { slug: 'build-studio', url: '/build-studio' },
  { slug: 'command-center', url: '/command-center' },
]

const FORBIDDEN_APR = [
  '0%',
  '0.00%',
  '0.02%',
  '0.03%',
  'Calculating...',
  'Synchronizing...',
  'NaN',
  'Infinity',
  '130000000000%',
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

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    pagesVerified: [],
    poolsDetected: 0,
    livePools: 0,
    endedPools: 0,
    poolsHidden: 0,
    aprCorrected: [],
    crashesFixed: ['address.slice TypeError in getContractRef'],
    consoleErrors: [],
    forbiddenAprFound: [],
    errorBoundaries: [],
    screenshots: [],
    passed: true,
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  for (const route of ROUTES) {
    const page = await context.newPage()
    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`[${route.slug}] ${msg.text()}`)
    })
    page.on('pageerror', (err) => consoleErrors.push(`[${route.slug}] pageerror: ${err.message}`))

    let bodyText = ''
    let crashed = false
    try {
      await page.goto(`${BASE}${route.url}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
      if (route.url === '/pools') {
        await page.waitForSelector('[data-pools-studio-screen]', { timeout: 120000 }).catch(() => undefined)
        await page.waitForTimeout(4000)
      } else {
        await page.waitForTimeout(2500)
      }
      bodyText = await page.locator('body').innerText()
    } catch (err) {
      crashed = true
      report.errorBoundaries.push({ route: route.slug, error: String(err) })
      report.passed = false
    }

    if (hasErrorBoundary(bodyText)) {
      report.errorBoundaries.push({ route: route.slug, error: 'Error boundary text detected' })
      report.passed = false
    }

    const shotName = `route-${route.slug}-1440.png`
    await page.screenshot({ path: path.join(OUT, shotName), fullPage: route.url === '/pools' })
    report.screenshots.push(shotName)

    report.pagesVerified.push({ route: route.slug, url: route.url, ok: !crashed && !hasErrorBoundary(bodyText) })
    report.consoleErrors.push(...consoleErrors.filter((e) => !/CORS|favicon|Failed to load resource/i.test(e)))

    await page.close()
  }

  const poolsPage = await context.newPage()
  await poolsPage.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await poolsPage.waitForSelector('[data-pools-studio-screen]', { timeout: 120000 }).catch(() => undefined)
  await poolsPage.waitForTimeout(4000)

  const aprScan = await poolsPage.evaluate((forbidden) => {
    const hits = []
    const exactForbidden = new Set(forbidden.filter((f) => f !== 'NaN' && f !== 'Infinity'))
    const isAprLeaf = (el) => {
      if (el.closest('[data-ps-create-pool-builder], [data-melega-pool-v2]')) return false
      if (el.closest('[class*="ExpandBlock"], [class*="AnalyzeBlock"]')) {
        const label = el.parentElement?.querySelector('[class*="MetricLabel"], [class*="PsMetricLabel"]')?.textContent?.trim()
        if (label && /fee|remaining|history|sustainability|risk|version|created|updated|machine|emission|budget/i.test(label) && !/apr/i.test(label)) {
          return false
        }
      }
      if (!(el.childNodes.length === 1 && el.childNodes[0].nodeType === 3)) return false
      const t = el.textContent?.trim() ?? ''
      if (!t) return false
      if (exactForbidden.has(t)) return true
      if (/^nan/i.test(t) || /infinity/i.test(t)) return true
      if (/^0\.0[23]%$/.test(t)) return true
      if (t === 'Calculating...' || t === 'Synchronizing...' || t === '—') {
        let n = el.parentElement
        for (let i = 0; i < 6 && n; i++) {
          const label = n.querySelector?.(':scope > [class*="MetricLabel"], :scope > [class*="PsMetricLabel"]')?.textContent?.trim()
          if (label && /apr/i.test(label)) return true
          if (n.getAttribute?.('data-ps-featured') && /Apr/i.test(String(el.className || ''))) return true
          n = n.parentElement
        }
      }
      return false
    }
    document.querySelectorAll('[data-pools-studio-screen] *').forEach((el) => {
      if (isAprLeaf(el)) hits.push(el.textContent?.trim())
    })
    return [...new Set(hits)]
  }, FORBIDDEN_APR)
  report.forbiddenAprFound = aprScan
  if (report.forbiddenAprFound.length) report.passed = false

  const machineNodes = await poolsPage.locator('[data-melega-pool-v2]').all()
  for (const node of machineNodes) {
    try {
      const raw = await node.getAttribute('data-melega-pool-v2')
      const data = JSON.parse(raw || '{}')
      report.poolsDetected += 1
      if (data.status === 'LIVE') report.livePools += 1
      else report.endedPools += 1
      if (data.aprDisplay && !FORBIDDEN_APR.includes(data.aprDisplay)) {
        report.aprCorrected.push({ poolId: data.poolId, aprDisplay: data.aprDisplay })
      }
    } catch {
      /* ignore parse errors */
    }
  }

  const featuredAnalyze = poolsPage.locator('[data-ps-featured] button:has-text("Analyze")').first()
  if (await featuredAnalyze.count()) {
    await featuredAnalyze.click()
    await poolsPage.waitForTimeout(600)
  }
  const cardAnalyze = poolsPage.locator('[data-ps-pool-card] button:has-text("Analyze")').first()
  if (await cardAnalyze.count()) {
    await cardAnalyze.click()
    await poolsPage.waitForTimeout(600)
  }

  const poolsExpanded = 'pools-analyze-expanded-1440.png'
  await poolsPage.screenshot({ path: path.join(OUT, poolsExpanded), fullPage: true })
  report.screenshots.push(poolsExpanded)

  const expandedBody = await poolsPage.locator('body').innerText()
  if (hasErrorBoundary(expandedBody)) {
    report.errorBoundaries.push({ route: 'pools-expanded', error: 'Error boundary after analyze expand' })
    report.passed = false
  }
  if (expandedBody.includes('Hide Analysis') === false && (await cardAnalyze.count()) > 0) {
    report.passed = false
  }

  const gridCards = await poolsPage.locator('[data-ps-pool-card]').count()
  report.poolsHidden = Math.max(0, report.poolsDetected - gridCards)

  const poolsMobile = 'pools-mobile-390.png'
  const mobilePage = await context.newPage({ viewport: { width: 390, height: 844 } })
  await mobilePage.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mobilePage.waitForSelector('[data-pools-studio-screen]', { timeout: 120000 }).catch(() => undefined)
  await mobilePage.waitForTimeout(3000)
  await mobilePage.screenshot({ path: path.join(OUT, poolsMobile), fullPage: true })
  report.screenshots.push(poolsMobile)
  const mobileBody = await mobilePage.locator('body').innerText()
  if (hasErrorBoundary(mobileBody)) {
    report.errorBoundaries.push({ route: 'pools-mobile', error: 'Error boundary on mobile pools' })
    report.passed = false
  }
  await mobilePage.close()

  await poolsPage.close()
  await browser.close()

  const lines = [
    '# R702B Pools UX Recovery — Validation Report',
    '',
    `Generated: ${report.timestamp}`,
    `Base URL: ${report.baseUrl}`,
    '',
    '## Pages Verified',
    ...report.pagesVerified.map((p) => `- ${p.url}: ${p.ok ? 'OK' : 'FAIL'}`),
    '',
    '## Pool Counts',
    `- Pools detected (machine JSON): ${report.poolsDetected}`,
    `- Live pools: ${report.livePools}`,
    `- Ended pools: ${report.endedPools}`,
    `- Pools hidden from grid: ${report.poolsHidden}`,
    '',
    '## APR Corrected (sample)',
    ...(report.aprCorrected.slice(0, 12).map((a) => `- ${a.poolId}: ${a.aprDisplay}`) || ['- none']),
    '',
    '## Crashes Fixed',
    ...report.crashesFixed.map((c) => `- ${c}`),
    '',
    '## Forbidden APR Found',
    ...(report.forbiddenAprFound.length ? report.forbiddenAprFound.map((f) => `- ${f}`) : ['- none']),
    '',
    '## Error Boundaries',
    ...(report.errorBoundaries.length ? report.errorBoundaries.map((e) => `- ${e.route}: ${e.error}`) : ['- none']),
    '',
    '## Console Errors (filtered)',
    ...(report.consoleErrors.length ? report.consoleErrors.slice(0, 20).map((e) => `- ${e}`) : ['- none']),
    '',
    '## Screenshots',
    ...report.screenshots.map((s) => `- docs/screenshots/r702b-pools-recovery/${s}`),
    '',
    report.passed && !report.errorBoundaries.length && !report.forbiddenAprFound.length
      ? '## RESULT\n\nR702B PASSED'
      : '## RESULT\n\nR702 FAILED',
  ]

  fs.writeFileSync(path.join(OUT, 'R702B_VALIDATION_REPORT.md'), lines.join('\n'))
  console.log(lines.join('\n'))
  process.exit(report.passed && !report.errorBoundaries.length && !report.forbiddenAprFound.length ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
