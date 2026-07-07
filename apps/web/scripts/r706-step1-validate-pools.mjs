#!/usr/bin/env node
/** R706 Step 1 — Header + KPI + Featured Hero + Advisor validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r706-step1-pools-ux')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const FORBIDDEN = ['NEEDS_FUNDING', 'POOL_ENDED', 'Hidden:', 'Reward Budget', 'MARCO Rewards']
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary|unhandled runtime error/i

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {} }
  const browser = await chromium.launch()
  const ctx = await browser.newContext()

  for (const [w, h, slug] of [
    [1440, 900, 'desktop-1440'],
    [1728, 1117, 'desktop-1728'],
    [390, 844, 'mobile-390'],
  ]) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-r706-step1]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r706-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: slug === 'mobile-390' })
    report.screenshots.push(shot)

    const body = await page.locator('body').innerText()
    if (ERROR_RE.test(body)) report.passed = false

    if (slug === 'desktop-1440') {
      const checks = await page.evaluate((forbidden) => {
        const screen = document.querySelector('[data-pools-studio-screen]')
        if (!screen) return {}

        const step1Nodes = [
          screen.querySelector('[data-ps-page-header]'),
          screen.querySelector('[data-ps-kpi-row]'),
          screen.querySelector('[data-ps-main-grid]'),
        ].filter(Boolean)
        const step1Text = step1Nodes.map((n) => n?.textContent ?? '').join(' ')
        const forbiddenHits = forbidden.filter((f) => step1Text.includes(f))

        const createBtn = screen.querySelector('[data-ps-header-create-pool]')
        const createRect = createBtn?.getBoundingClientRect()
        const kpiCards = [...screen.querySelectorAll('[data-ps-kpi-card]')]
        const kpiHeights = kpiCards.map((c) => c.getBoundingClientRect().height)
        const advisor = screen.querySelector('[data-ps-advisor-wrap]')
        const advisorRect = advisor?.getBoundingClientRect()
        const featured = screen.querySelector('[data-ps-featured-empty]')
        const featuredRect = featured?.getBoundingClientRect()
        const health = screen.querySelector('[data-ps-health-guide]')
        const reward = screen.querySelector('[data-ps-reward-pie]')
        const kpiValues = [...screen.querySelectorAll('[data-ps-kpi-value]')].map((el) => ({
          text: el.textContent?.trim() ?? '',
          ellipsis: window.getComputedStyle(el).textOverflow === 'ellipsis',
        }))

        const header = screen.querySelector('[data-ps-page-header]')
        const kpiRow = screen.querySelector('[data-ps-kpi-row]')
        const gapHeaderKpi = header && kpiRow ? kpiRow.getBoundingClientRect().top - header.getBoundingClientRect().bottom : 0
        const mainGrid = screen.querySelector('[data-ps-main-grid]')
        const gapKpiFeatured = kpiRow && mainGrid ? mainGrid.getBoundingClientRect().top - kpiRow.getBoundingClientRect().bottom : 0
        const explorer = screen.querySelector('[data-ps-pool-explorer]')
        const gapFeaturedToolbar = mainGrid && explorer ? explorer.getBoundingClientRect().top - mainGrid.getBoundingClientRect().bottom : 0

        return {
          forbiddenHits,
          sidebarCardCount: screen.querySelectorAll('[data-ps-advisor-wrap]').length,
          healthVisible: !!health,
          rewardVisible: !!reward,
          hasTotalRewardsLive: step1Text.includes('Total Rewards Live'),
          hasRewardsBudgetInStep1: step1Text.includes('Reward Budget'),
          createBtnWidth: createRect?.width ?? 0,
          createBtnHeight: createRect?.height ?? 0,
          advisorHeight: advisorRect?.height ?? 0,
          advisorWidth: advisorRect?.width ?? 0,
          featuredHeight: featuredRect?.height ?? 0,
          kpiCount: kpiCards.length,
          kpiHeightsUniform: kpiHeights.every((h) => Math.abs(h - kpiHeights[0]) < 2),
          kpiEllipsis: kpiValues.some((v) => v.ellipsis),
          kpiTruncated: kpiValues.some((v) => /\d+\.\.\./.test(v.text)),
          gapHeaderKpi,
          gapKpiFeatured,
          gapFeaturedToolbar,
          hasR706: screen.matches('[data-r706-step1]') || screen.hasAttribute('data-r706-step1'),
        }
      }, FORBIDDEN)

      report.checks = checks
      if (checks.forbiddenHits?.length) report.passed = false

      report.checks = checks
      if (checks.healthVisible) report.passed = false
      if (checks.rewardVisible) report.passed = false
      if (checks.sidebarCardCount !== 1) report.passed = false
      if (!checks.hasTotalRewardsLive) report.passed = false
      if (checks.hasRewardsBudgetInStep1) report.passed = false
      if (checks.kpiCount !== 5) report.passed = false
      if (!checks.kpiHeightsUniform) report.passed = false
      if (checks.kpiEllipsis || checks.kpiTruncated) report.passed = false
      if (Math.abs((checks.createBtnWidth ?? 0) - 220) > 4) report.passed = false
      if (Math.abs((checks.createBtnHeight ?? 0) - 52) > 4) report.passed = false
      if (Math.abs((checks.advisorHeight ?? 0) - 380) > 6) report.passed = false
      if (Math.abs((checks.advisorWidth ?? 0) - 340) > 6) report.passed = false
      if (checks.featuredHeight && Math.abs(checks.featuredHeight - 380) > 6) report.passed = false
      if (Math.abs((checks.gapHeaderKpi ?? 0) - 32) > 6) report.passed = false
      if (Math.abs((checks.gapKpiFeatured ?? 0) - 32) > 6) report.passed = false
      if (Math.abs((checks.gapFeaturedToolbar ?? 0) - 40) > 6) report.passed = false
      if (!checks.hasR706) report.passed = false
    }

    await page.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R706_STEP1_VALIDATION_REPORT.md'),
    [
      '# R706 Step 1 Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )
  console.log(report.passed ? 'R706 STEP1 PASSED' : 'R706 STEP1 FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
