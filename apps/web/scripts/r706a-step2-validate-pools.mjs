#!/usr/bin/env node
/** R706A Step 2 — upper section pixel refinement validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r706a-step2-pools-ux')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const FORBIDDEN = ['NEEDS_FUNDING', 'POOL_ENDED', 'Hidden:']
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary|unhandled runtime error/i

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {} }
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })

  for (const [w, h, slug] of [
    [1440, 900, 'desktop-1440'],
    [1728, 1117, 'desktop-1728'],
    [390, 844, 'mobile-390'],
  ]) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-r706a-step2]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r706a-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: slug !== 'desktop-1440' })
    report.screenshots.push(shot)

    const body = await page.locator('body').innerText()
    if (ERROR_RE.test(body)) report.passed = false

    if (slug === 'desktop-1440') {
      const checks = await page.evaluate((forbidden) => {
        const screen = document.querySelector('[data-pools-studio-screen]')
        if (!screen) return {}

        const upper = [
          screen.querySelector('[data-ps-page-header]'),
          screen.querySelector('[data-ps-kpi-row]'),
          screen.querySelector('[data-ps-main-grid]'),
        ]
          .filter(Boolean)
          .map((n) => n?.textContent ?? '')
          .join(' ')

        const createBtn = screen.querySelector('[data-ps-header-create-pool]')
        const createRect = createBtn?.getBoundingClientRect()
        const kpiCards = [...screen.querySelectorAll('[data-ps-kpi-card]')]
        const kpiHeights = kpiCards.map((c) => c.getBoundingClientRect().height)
        const kpiWidths = kpiCards.map((c) => c.getBoundingClientRect().width)
        const featured = screen.querySelector('[data-ps-featured-empty]')
        const featuredRect = featured?.getBoundingClientRect()
        const advisor = screen.querySelector('[data-ps-advisor-wrap]')
        const health = screen.querySelector('[data-ps-health-guide]')
        const donut = screen.querySelector('[data-ps-reward-pie]')
        const sidebar = screen.querySelector('[data-ps-sidebar]')
        const sidebarRect = sidebar?.getBoundingClientRect()
        const mainGrid = screen.querySelector('[data-ps-main-grid]')
        const explorer = screen.querySelector('[data-ps-pool-explorer]')
        const gapHeroToolbar = mainGrid && explorer ? explorer.getBoundingClientRect().top - mainGrid.getBoundingClientRect().bottom : 0
        const contentEl = screen.querySelector('[data-ps-content]')
        const contentPad = contentEl ? parseFloat(window.getComputedStyle(contentEl).paddingTop) : 0

        return {
          forbiddenHits: forbidden.filter((f) => upper.includes(f)),
          sidebarWidth: sidebarRect?.width ?? 0,
          sidebarCards: [advisor, health, donut].filter(Boolean).length,
          createBtnWidth: createRect?.width ?? 0,
          createBtnHeight: createRect?.height ?? 0,
          featuredHeight: featuredRect?.height ?? 0,
          featuredWidth: featuredRect?.width ?? 0,
          kpiCount: kpiCards.length,
          kpiHeightsUniform: kpiHeights.every((h) => Math.abs(h - 104) < 3),
          kpiWidthsUniform: kpiWidths.every((w) => Math.abs(w - 188) < 4),
          gapHeroToolbar,
          contentPadTop: contentPad,
          hasTotalRewardsLive: upper.includes('Total Rewards Live'),
          hasR706a: screen.matches('[data-r706a-step2]') || screen.hasAttribute('data-r706a-step2'),
        }
      }, FORBIDDEN)

      report.checks = checks
      if (checks.forbiddenHits?.length) report.passed = false
      if (checks.sidebarCards !== 3) report.passed = false
      if (Math.abs((checks.sidebarWidth ?? 0) - 320) > 4) report.passed = false
      if (Math.abs((checks.createBtnWidth ?? 0) - 188) > 4) report.passed = false
      if (Math.abs((checks.createBtnHeight ?? 0) - 48) > 4) report.passed = false
      if (checks.featuredHeight && Math.abs(checks.featuredHeight - 220) > 4) report.passed = false
      if (checks.featuredWidth && checks.featuredWidth > 825) report.passed = false
      if (checks.kpiCount !== 5) report.passed = false
      if (!checks.kpiHeightsUniform) report.passed = false
      if (!checks.hasTotalRewardsLive) report.passed = false
      if (Math.abs((checks.gapHeroToolbar ?? 0) - 32) > 6) report.passed = false
      if (Math.abs((checks.contentPadTop ?? 0) - 40) > 4) report.passed = false
      if (!checks.hasR706a) report.passed = false
    }

    if (slug === 'mobile-390') {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
      if (overflow) report.passed = false
    }

    await page.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R706A_STEP2_VALIDATION_REPORT.md'),
    [`# R706A Step 2 Validation`, '', `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`, '', '```json', JSON.stringify(report, null, 2), '```'].join('\n'),
  )
  console.log(report.passed ? 'R706A STEP2 PASSED' : 'R706A STEP2 FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
