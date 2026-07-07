#!/usr/bin/env node
/** R705 Step 1 — Pools layout foundation validation + screenshots. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r705-step1-pools-layout')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const FORBIDDEN = ['0%', '0.00%', 'NaN', 'Infinity', 'Calculating...', 'Calculating…']
const REASON_RE = /NEEDS_FUNDING|POOL_ENDED|hidden:\s/i
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary|unhandled runtime error/i

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {}, validation: {} }
  const browser = await chromium.launch()
  const ctx = await browser.newContext()

  const shots = [
    [1440, 900, 'desktop-1440'],
    [1728, 1117, 'desktop-1728'],
    [390, 844, 'mobile-390'],
  ]

  for (const [w, h, slug] of shots) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-r705-layout]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r705-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: true })
    const body = await page.locator('body').innerText()
    if (ERROR_RE.test(body)) report.passed = false
    if (REASON_RE.test(body)) report.passed = false

    report.screenshots.push(shot)

    if (slug === 'desktop-1440') {
      const checks = await page.evaluate((bad) => {
        const screen = document.querySelector('[data-pools-studio-screen]')
        if (!screen) return { hits: [], kpi: 0 }

        const hits = []
        screen.querySelectorAll('[data-ps-kpi-value]').forEach((el) => {
          const t = el.textContent?.trim() ?? ''
          if (bad.includes(t)) hits.push(t)
          const style = window.getComputedStyle(el)
          if (style.whiteSpace !== 'nowrap' && /\$\d/.test(t) && /K|M/.test(t)) {
            const rect = el.getBoundingClientRect()
            if (rect.height > 50) hits.push('KPI_WRAP')
          }
        })

        const kpiRect = screen.querySelector('[data-ps-kpi-row]')?.getBoundingClientRect()
        const featuredRect = screen.querySelector('[data-ps-featured-empty], [data-ps-featured]')?.getBoundingClientRect()
        const gapKpiFeatured = kpiRect && featuredRect ? featuredRect.top - kpiRect.bottom : 0

        const grid = screen.querySelector('[data-ps-pool-grid], [data-ps-pool-grid-empty]')
        const create = screen.querySelector('#create-pool')
        let createPoolAfterGrid = false
        if (create && grid) {
          createPoolAfterGrid = Boolean(grid.compareDocumentPosition(create) & Node.DOCUMENT_POSITION_FOLLOWING)
        }

        const toolbar = screen.querySelector('[data-ps-view-toolbar]')
        const toolbarStyle = toolbar ? window.getComputedStyle(toolbar.querySelector('[data-ps-pool-tabs]')?.parentElement || toolbar) : null

        return {
          hits: [...new Set(hits)],
          kpi: screen.querySelectorAll('[data-ps-kpi-card]').length,
          sidebarCards: screen.querySelectorAll('[data-ps-advisor-wrap], [data-ps-health-guide], [data-ps-reward-pie]').length,
          hasRewardsLive: (screen.textContent ?? '').includes('Rewards Live'),
          hasR705: screen.matches('[data-r705-layout]') || screen.hasAttribute('data-r705-layout'),
          gapKpiFeatured,
          createPoolAfterGrid,
          toolbarHorizontal: toolbar ? toolbar.getBoundingClientRect().width > 600 : false,
          emptyGrid: !!screen.querySelector('[data-ps-pool-grid-empty]'),
          createBtnVisible: create ? create.getBoundingClientRect().height > 0 : false,
        }
      }, FORBIDDEN)

      report.checks = checks
      if (checks.hits?.length) report.passed = false
      if (checks.kpi !== 5) report.passed = false
      if (!checks.hasR705) report.passed = false
      if (!checks.hasRewardsLive) report.passed = false
      if (!checks.createPoolAfterGrid) report.passed = false
      if (checks.sidebarCards !== 3) report.passed = false
      if (checks.gapKpiFeatured > 120) report.passed = false
      if (!checks.toolbarHorizontal) report.passed = false
    }

    if (slug === 'mobile-390') {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
      report.validation.mobileOverflow = overflow
      if (overflow) report.passed = false
    }

    await page.close()
  }

  await browser.close()

  const lines = [
    '# R705 Step 1 — Pools Layout Foundation',
    '',
    `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
    '',
    '## Checks',
    '```json',
    JSON.stringify({ checks: report.checks, validation: report.validation }, null, 2),
    '```',
    '',
    '## Screenshots',
    ...report.screenshots.map((s) => `- docs/screenshots/r705-step1-pools-layout/${s}`),
  ]
  fs.writeFileSync(path.join(OUT, 'R705_STEP1_VALIDATION_REPORT.md'), lines.join('\n'))
  console.log(report.passed ? 'R705 STEP1 PASSED' : 'R705 STEP1 FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
