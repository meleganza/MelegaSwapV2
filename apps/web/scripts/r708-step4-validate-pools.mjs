#!/usr/bin/env node
/** R708 Step 4 — Pools explorer grid polish validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r708-step4-pools-explorer')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

async function evaluatePage(page) {
  return page.evaluate(() => {
    const hero = document.querySelector('[data-r707e-empty], [data-ps-featured-empty], [data-r707b-live]')
    const explorer = document.querySelector('[data-r708-explorer]')
    const tabs = document.querySelector('[data-ps-pool-tabs]')
    const toolbar = document.querySelector('[data-r708-toolbar]')
    const filters = document.querySelector('[data-ps-filters]')
    const emptyGrid = document.querySelector('[data-r708-empty-grid]')
    const grid = document.querySelector('[data-r708-pool-grid]')
    const kpi = document.querySelector('[data-ps-kpi-row]')
    const sidebar = document.querySelector('[data-ps-sidebar]')

    const heroRect = hero?.getBoundingClientRect()
    const explorerRect = explorer?.getBoundingClientRect()
    const tabsRect = tabs?.getBoundingClientRect()
    const toolbarRect = toolbar?.querySelector('div')?.getBoundingClientRect()
    const filtersRect = filters?.getBoundingClientRect()
    const emptyRect = emptyGrid?.getBoundingClientRect()
    const content = document.querySelector('[data-ps-content]')

    const gapHeroExplorer =
      heroRect && explorerRect ? explorerRect.top - heroRect.bottom : null

    const chipsBelowTabs =
      tabsRect && filtersRect ? filtersRect.top - tabsRect.bottom : null

    const emptyBelowChips =
      emptyRect && filtersRect ? emptyRect.top - filtersRect.bottom : null

    const tabButtons = tabs ? [...tabs.querySelectorAll('button')] : []
    const firstTabLabel = tabButtons[0]?.querySelector('span')
    const tabStyle = firstTabLabel ? window.getComputedStyle(firstTabLabel) : null

    const viewSwitch = document.querySelector('[data-ps-view-switch]')
    const sortSelect = toolbar?.querySelector('select')
    const filterBtn = toolbar ? [...toolbar.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Filter') : null
    const chip = filters?.querySelector('button')

    return {
      heroHeight: heroRect?.height ?? 0,
      gapHeroExplorer,
      explorerMaxWidth: explorer ? parseFloat(window.getComputedStyle(explorer).maxWidth) : 0,
      tabsHeight: tabsRect?.height ?? 0,
      toolbarRowHeight: toolbarRect?.height ?? 0,
      tabFontSize: tabStyle ? parseFloat(tabStyle.fontSize) : 0,
      tabFontWeight: tabStyle ? parseFloat(tabStyle.fontWeight) : 0,
      chipsBelowTabs,
      emptyBelowChips,
      emptyHeight: emptyRect?.height ?? 0,
      emptyVisible: emptyRect ? emptyRect.height > 0 && emptyRect.width > 0 : false,
      hasLiveCards: Boolean(grid),
      cardCount: grid ? grid.querySelectorAll('[data-r708-pool-card]').length : 0,
      viewSwitchWidth: viewSwitch?.getBoundingClientRect().width ?? 0,
      viewSwitchHeight: viewSwitch?.getBoundingClientRect().height ?? 0,
      sortWidth: sortSelect?.getBoundingClientRect().width ?? 0,
      filterWidth: filterBtn?.getBoundingClientRect().width ?? 0,
      chipHeight: chip?.getBoundingClientRect().height ?? 0,
      overflowX: explorer ? explorer.scrollWidth > explorer.clientWidth + 2 : false,
      kpiUnchanged: Boolean(kpi),
      sidebarUnchanged: Boolean(sidebar),
      heroUnchangedHeight: heroRect ? Math.abs(heroRect.height - 300) <= 2 : false,
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {} }
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })

  for (const [w, h, slug, fullPage] of [
    [1440, 900, 'desktop-1440', true],
    [1728, 1117, 'desktop-1728', true],
    [390, 844, 'mobile-390', true],
  ]) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-r708-explorer]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r708-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    if (slug === 'desktop-1440') {
      const checks = await evaluatePage(page)
      report.checks = checks

      if (Math.abs((checks.gapHeroExplorer ?? 0) - 48) > 4) report.passed = false
      if (Math.abs((checks.tabsHeight ?? 0) - 36) > 3) report.passed = false
      if (Math.abs((checks.toolbarRowHeight ?? 0) - 36) > 3) report.passed = false
      if (Math.abs((checks.chipsBelowTabs ?? 0) - 14) > 3) report.passed = false
      if (checks.emptyVisible && Math.abs((checks.emptyHeight ?? 0) - 136) > 3) report.passed = false
      if (checks.emptyVisible && Math.abs((checks.emptyBelowChips ?? 0) - 24) > 4) report.passed = false
      if (Math.abs((checks.viewSwitchWidth ?? 0) - 96) > 3) report.passed = false
      if (Math.abs((checks.viewSwitchHeight ?? 0) - 34) > 3) report.passed = false
      if (Math.abs((checks.sortWidth ?? 0) - 188) > 3) report.passed = false
      if (Math.abs((checks.filterWidth ?? 0) - 92) > 3) report.passed = false
      if (Math.abs((checks.chipHeight ?? 0) - 30) > 3) report.passed = false
      if (checks.overflowX) report.passed = false
      if (!checks.heroUnchangedHeight) report.passed = false
      if (!checks.kpiUnchanged || !checks.sidebarUnchanged) report.passed = false
    }

    await page.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R708_VALIDATION_REPORT.md'),
    [
      '# R708 Step 4 Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R708 PASSED' : 'R708 FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
