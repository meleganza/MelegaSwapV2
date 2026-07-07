#!/usr/bin/env node
/** R708B — Pools explorer toolbar alignment validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r708b-step4b-pools-explorer-toolbar')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

function rectsOverlap(a, b, pad = 1) {
  if (!a || !b) return false
  return (
    a.left < b.right - pad &&
    a.right > b.left + pad &&
    a.top < b.bottom - pad &&
    a.bottom > b.top + pad
  )
}

async function evaluateToolbar(page) {
  return page.evaluate(() => {
    const hero = document.querySelector('[data-r707e-empty], [data-ps-featured-empty], [data-r707b-live]')
    const toolbar = document.querySelector('[data-r708b-toolbar]')
    const tabs = document.querySelector('[data-ps-pool-tabs]')
    const controls = document.querySelector('[data-ps-toolbar-controls-group]')
    const viewSwitch = document.querySelector('[data-ps-view-switch]')
    const filters = document.querySelector('[data-ps-filters]')
    const chipsWrap = document.querySelector('[data-ps-toolbar-chips-wrap]')
    const rowOne = document.querySelector('[data-ps-toolbar-row-one]')

    const heroRect = hero?.getBoundingClientRect()
    const toolbarRect = toolbar?.getBoundingClientRect()
    const tabsRect = tabs?.getBoundingClientRect()
    const controlsRect = controls?.getBoundingClientRect()
    const switchRect = viewSwitch?.getBoundingClientRect()
    const filtersRect = filters?.getBoundingClientRect()
    const rowOneRect = rowOne?.getBoundingClientRect()
    const chipsWrapRect = chipsWrap?.getBoundingClientRect()

    const rowOneOverflowX =
      rowOneRect && tabsRect && controlsRect
        ? tabsRect.right > rowOneRect.right + 1 || controlsRect.right > rowOneRect.right + 1
        : false

    const tabButtons = tabs ? [...tabs.querySelectorAll('button')] : []
    const tabLabels = tabButtons.map((b) => ({
      text: b.textContent?.trim() ?? '',
      rect: b.getBoundingClientRect(),
    }))

    const tabTextsReadable = ['All Pools', 'My Positions (0)', 'Finished'].every((label) =>
      tabLabels.some((t) => t.text === label && t.rect.width > 0 && t.rect.height > 0),
    )

    const switchOverlapsTab = tabLabels.some((t) => {
      if (!switchRect) return false
      const a = t.rect
      const b = switchRect
      return a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1
    })

    const controlsOverlapTabs = tabsRect && controlsRect
      ? tabsRect.right > controlsRect.left + 1 &&
        tabsRect.top < controlsRect.bottom - 1 &&
        tabsRect.bottom > controlsRect.top + 1 &&
        tabsRect.left < controlsRect.right - 1
      : false

    const sortEl = controls?.querySelector('select')
    const filterEl = controls ? [...controls.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Filter') : null
    const sortRect = sortEl?.getBoundingClientRect()
    const filterRect = filterEl?.getBoundingClientRect()

    const controlsOverlapChips =
      filtersRect &&
      [switchRect, sortRect, filterRect].some(
        (r) =>
          r &&
          r.bottom > filtersRect.top + 1 &&
          r.top < filtersRect.bottom - 1 &&
          r.left < filtersRect.right - 1 &&
          r.right > filtersRect.left + 1,
      )

    const chipsGap = rowOneRect && chipsWrapRect ? chipsWrapRect.top - rowOneRect.bottom : null

    const absoluteChildren = toolbar
      ? [...toolbar.querySelectorAll('*')].filter((el) => window.getComputedStyle(el).position === 'absolute').length
      : 0

    return {
      gapHeroExplorer: heroRect && toolbarRect ? toolbarRect.top - heroRect.bottom : null,
      heroHeight: heroRect?.height ?? 0,
      rowOneHeight: rowOneRect?.height ?? 0,
      tabTextsReadable,
      switchOverlapsTab,
      controlsOverlapTabs,
      controlsOverlapChips,
      chipsGap,
      absoluteChildren,
      rowOneOverflowX,
      chipsOverflowX: filtersRect && rowOneRect
        ? filtersRect.right > rowOneRect.right + 1
        : false,
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], viewports: {} }
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })

  for (const [w, h, slug] of [
    [1440, 900, 'desktop-1440'],
    [1728, 1117, 'desktop-1728'],
    [390, 844, 'mobile-390'],
  ]) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-r708b-toolbar]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r708b-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: slug !== 'desktop-1440' })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    const checks = await evaluateToolbar(page)
    report.viewports[slug] = checks

    if (!checks.tabTextsReadable) report.passed = false
    if (checks.switchOverlapsTab) report.passed = false
    if (checks.controlsOverlapTabs) report.passed = false
    if (checks.controlsOverlapChips) report.passed = false
    if (Math.abs((checks.chipsGap ?? 0) - 14) > 3) report.passed = false
    if (checks.absoluteChildren > 0) report.passed = false
    if (checks.rowOneOverflowX || checks.chipsOverflowX) report.passed = false
    if (slug !== 'mobile-390') {
      if (Math.abs((checks.gapHeroExplorer ?? 0) - 48) > 4) report.passed = false
      if (Math.abs((checks.heroHeight ?? 0) - 300) > 2) report.passed = false
    }
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R708B_VALIDATION_REPORT.md'),
    [
      '# R708B Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R708B PASSED' : 'R708B FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
