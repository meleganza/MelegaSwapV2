#!/usr/bin/env node
/** R703D Pools Page — validation + screenshots. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r703d-pools-experience')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const FORBIDDEN = ['0%', '0.00%', 'NaN', 'Infinity', 'Calculating...', 'Calculating…']
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary|unhandled runtime error/i

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {}, validation: {} }
  const browser = await chromium.launch()
  const ctx = await browser.newContext()

  const shots = [
    [1440, 900, 'desktop-1440'],
    [1728, 1117, 'desktop-1728'],
    [1440, 900, 'empty-state', 'empty'],
    [390, 844, 'mobile-390'],
  ]

  for (const [w, h, slug, mode] of shots) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-r703d-premium]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    if (mode === 'empty') {
      await page.locator('[data-ps-featured-empty]').screenshot({
        path: path.join(OUT, `pools-r703d-${slug}.png`),
      })
      report.screenshots.push(`pools-r703d-${slug}.png`)
      await page.close()
      continue
    }

    const shot = `pools-r703d-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: true })
    const body = await page.locator('body').innerText()
    if (ERROR_RE.test(body)) report.passed = false

    report.screenshots.push(shot)

    if (slug === 'desktop-1440') {
      const checks = await page.evaluate((bad) => {
        const hits = []
        const screen = document.querySelector('[data-pools-studio-screen]')
        if (!screen) return { hits, kpi: 0, poolCards: 0, featured: false, createPoolAfterGrid: false }

        screen.querySelectorAll('[data-ps-pool-card], [data-ps-featured]').forEach((card) => {
          card.querySelectorAll('*').forEach((el) => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
              const t = el.textContent?.trim() ?? ''
              if (bad.includes(t)) hits.push(t)
              if (/^ENDED$/i.test(t) && parseFloat(window.getComputedStyle(el).fontSize) > 48) {
                hits.push('GIANT_ENDED')
              }
            }
          })
        })

        const grid = screen.querySelector('[data-ps-pool-grid]')
        const create = screen.querySelector('#create-pool')
        let createPoolAfterGrid = false
        if (create && grid) {
          createPoolAfterGrid = Boolean(grid.compareDocumentPosition(create) & Node.DOCUMENT_POSITION_FOLLOWING)
        }

        const emptyFeatured = !!screen.querySelector('[data-ps-featured-empty]')
        const emptyHeight = emptyFeatured
          ? screen.querySelector('[data-ps-featured-empty]')?.getBoundingClientRect().height ?? 0
          : 0

        const bodyText = screen.textContent ?? ''

        return {
          hits: [...new Set(hits)],
          kpi: screen.querySelectorAll('[data-ps-kpi-card]').length,
          poolCards: screen.querySelectorAll('[data-ps-pool-card]').length,
          placeholderCards: screen.querySelectorAll('[data-ps-pool-placeholder]').length,
          featured: !!screen.querySelector('[data-ps-featured]'),
          emptyFeatured,
          emptyFeaturedHeight: emptyHeight,
          createPoolAfterGrid,
          hasTotalRewardBudgetKpi: bodyText.includes('Total Reward Budget'),
          hasForbiddenFundingCopy: /reward pools need funding|fund reward emission/i.test(bodyText),
          hasR703d: screen.matches('[data-r703d-premium]') || !!screen.querySelector('[data-r703d-premium]'),
          hasR704b: screen.matches('[data-r704b-hierarchy]') || !!screen.querySelector('[data-r704b-hierarchy]'),
          belowFold: !!screen.querySelector('[data-ps-below-fold]'),
          firstViewport: !!screen.querySelector('[data-ps-first-viewport]'),
        }
      }, FORBIDDEN)

      report.checks = checks
      if (checks.hits?.length) report.passed = false
      if (checks.hasForbiddenFundingCopy) report.passed = false
      if (checks.kpi !== 5) report.passed = false
      if (!checks.hasR703d) report.passed = false
      if (!checks.hasR704b) report.passed = false
      if (!checks.hasTotalRewardBudgetKpi) report.passed = false
      if (!checks.createPoolAfterGrid) report.passed = false
      if (!checks.belowFold) report.passed = false
      if (checks.emptyFeatured && (checks.emptyFeaturedHeight < 340 || checks.emptyFeaturedHeight > 380)) {
        report.passed = false
      }
      if (!checks.featured && !checks.emptyFeatured) report.passed = false
      if (checks.poolCards === 0 && checks.placeholderCards !== 3) report.passed = false

      const expandBtn = page.locator('[data-ps-pool-card] button:has-text("Analyze")').first()
      if (await expandBtn.count()) {
        await expandBtn.click()
        await page.waitForTimeout(300)
        const hideText = await page.locator('[data-ps-pool-card] button:has-text("Hide Analysis")').count()
        report.validation.analyzeToggle = hideText > 0
        if (!hideText) report.passed = false
      }
    }

    if (slug === 'mobile-390') {
      const overflow = await page.evaluate(() => {
        const el = document.documentElement
        return el.scrollWidth > el.clientWidth + 2
      })
      report.validation.mobileOverflow = overflow
      if (overflow) report.passed = false
    }

    await page.close()
  }

  await browser.close()

  const lines = [
    '# R704B Pools Page — Validation Report',
    '',
    `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
    '',
    '## Checks',
    '```json',
    JSON.stringify({ checks: report.checks, validation: report.validation }, null, 2),
    '```',
    '',
    '## Screenshots',
    ...report.screenshots.map((s) => `- docs/screenshots/r703d-pools-experience/${s}`),
    '',
    '## APR Rules (R703D)',
    '- Official / auto-stake: 8–12%',
    '- Flexible / partner: 20–30%',
    '- Fixed 30–90d: 30–40%',
    '- Fixed 90–180d: 35–45%',
    '- Fixed 180–365d: 40–50%',
    '- 365+: 45–50%',
    '- Live pools hidden if APR forbidden, budget < $1 (when priced), or ended',
  ]
  fs.writeFileSync(path.join(OUT, 'R703D_VALIDATION_REPORT.md'), lines.join('\n'))
  console.log(report.passed ? 'R704B PASSED' : 'R704B FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
