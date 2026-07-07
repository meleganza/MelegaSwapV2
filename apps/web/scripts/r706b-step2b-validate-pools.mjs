#!/usr/bin/env node
/** R706B Step 2B — header premium refinement validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r706b-step2b-pools-header')
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
    await page.waitForSelector('[data-r706b-step2b]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r706b-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: slug !== 'desktop-1440' })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

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
        const featured = screen.querySelector('[data-ps-featured-empty]')
        const featuredRect = featured?.getBoundingClientRect()
        const sidebar = screen.querySelector('[data-ps-sidebar]')
        const sidebarRect = sidebar?.getBoundingClientRect()
        const advisor = screen.querySelector('[data-ps-advisor-wrap]')
        const health = screen.querySelector('[data-ps-health-guide]')
        const donut = screen.querySelector('[data-ps-reward-pie]')
        const mainGrid = screen.querySelector('[data-ps-main-grid]')
        const kpiRow = screen.querySelector('[data-ps-kpi-row]')
        const explorer = screen.querySelector('[data-ps-pool-explorer]')
        const belowFold = screen.querySelector('[data-ps-below-fold]')
        const content = screen.querySelector('[data-ps-content]')

        return {
          forbiddenHits: forbidden.filter((f) => upper.includes(f)),
          createBtnWidth: createRect?.width ?? 0,
          createBtnHeight: createRect?.height ?? 0,
          kpiCount: kpiCards.length,
          kpiHeight: kpiCards[0]?.getBoundingClientRect().height ?? 0,
          kpiWidth: kpiCards[0]?.getBoundingClientRect().width ?? 0,
          featuredHeight: featuredRect?.height ?? 0,
          sidebarWidth: sidebarRect?.width ?? 0,
          sidebarCards: [advisor, health, donut].filter(Boolean).length,
          advisorHeight: advisor?.getBoundingClientRect().height ?? 0,
          gapKpiHero: mainGrid && kpiRow ? mainGrid.getBoundingClientRect().top - kpiRow.getBoundingClientRect().bottom : 0,
          gapHeroExplorer: explorer && mainGrid ? explorer.getBoundingClientRect().top - mainGrid.getBoundingClientRect().bottom : 0,
          gapExplorerBuilder: belowFold && explorer ? belowFold.getBoundingClientRect().top - explorer.getBoundingClientRect().bottom : 0,
          contentPadTop: content ? parseFloat(window.getComputedStyle(content).paddingTop) : 0,
          hasR706b: screen.matches('[data-r706b-step2b]') || screen.hasAttribute('data-r706b-step2b'),
          emptyTitle: featured?.querySelector('h2')?.textContent?.trim() ?? '',
        }
      }, FORBIDDEN)

      report.checks = checks
      if (checks.forbiddenHits?.length) report.passed = false
      if (checks.kpiCount !== 5) report.passed = false
      if (Math.abs((checks.createBtnWidth ?? 0) - 220) > 4) report.passed = false
      if (Math.abs((checks.createBtnHeight ?? 0) - 52) > 4) report.passed = false
      if (Math.abs((checks.kpiHeight ?? 0) - 112) > 4) report.passed = false
      if (Math.abs((checks.kpiWidth ?? 0) - 198) > 4) report.passed = false
      if (checks.featuredHeight && Math.abs(checks.featuredHeight - 176) > 4) report.passed = false
      if (Math.abs((checks.sidebarWidth ?? 0) - 340) > 4) report.passed = false
      if (checks.sidebarCards !== 3) report.passed = false
      if (Math.abs((checks.advisorHeight ?? 0) - 220) > 4) report.passed = false
      if (Math.abs((checks.gapKpiHero ?? 0) - 28) > 6) report.passed = false
      if (Math.abs((checks.gapHeroExplorer ?? 0) - 34) > 6) report.passed = false
      if (Math.abs((checks.gapExplorerBuilder ?? 0) - 48) > 6) report.passed = false
      if (Math.abs((checks.contentPadTop ?? 0) - 44) > 4) report.passed = false
      if (!checks.hasR706b) report.passed = false
      if (!checks.emptyTitle?.includes('No funded reward pools')) report.passed = false
    }

    if (slug === 'mobile-390') {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
      if (overflow) report.passed = false
    }

    await page.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R706B_STEP2B_VALIDATION_REPORT.md'),
    [`# R706B Step 2B Validation`, '', `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`, '', '```json', JSON.stringify(report, null, 2), '```'].join('\n'),
  )
  console.log(report.passed ? 'R706B STEP2B PASSED' : 'R706B STEP2B FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
