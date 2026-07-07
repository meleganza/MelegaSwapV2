#!/usr/bin/env node
/** R710 Step 6 — Pools mobile + responsive validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r710-step6-mobile-responsive')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i
const MOBILE_HEADER_BOTTOM = 58

async function evaluateLayout(page, isMobile) {
  return page.evaluate(
    ({ mobileHeaderBottom, isMobile: mobile }) => {
      const emptyGrid = document.querySelector('[data-r708-empty-grid], [data-ps-pool-grid-empty]')
      const card = document.querySelector('[data-r710-create-pool], [data-r709-create-pool]')
      const grid = document.querySelector('[data-ps-create-pool-grid]')
      const btn = document.querySelector('[data-ps-create-pool-btn]')
      const hero = document.querySelector('[data-r707e-empty], [data-ps-featured-empty]')
      const explorer = document.querySelector('[data-r708-explorer]')
      const toolbar = document.querySelector('[data-r708b-toolbar]')
      const poolsTitle = document.querySelector('[data-ps-pools-title]')
      const mobileHeader = document.querySelector('[data-melega-mobile-header]')
      const sidebar = document.querySelector('[data-ps-sidebar]')
      const advisor = document.querySelector('[data-ps-advisor-wrap]')

      const emptyRect = emptyGrid?.getBoundingClientRect()
      const cardRect = card?.getBoundingClientRect()
      const btnRect = btn?.getBoundingClientRect()
      const cardStyle = card ? window.getComputedStyle(card) : null
      const fields = grid ? [...grid.querySelectorAll('[data-ps-create-field]')] : []
      const machinePreview = card?.querySelector('[data-ps-create-machine-preview]')
      const inputs = grid ? [...grid.querySelectorAll('input[data-ps-create-value]')] : []

      const gapFromExplorer =
        emptyRect && cardRect
          ? cardRect.top - emptyRect.bottom
          : cardRect && explorer
            ? cardRect.top - explorer.getBoundingClientRect().bottom
            : null

      const gridTemplate = grid ? window.getComputedStyle(grid).gridTemplateColumns : ''
      const gridCols = gridTemplate.split(' ').filter(Boolean).length

      const fieldsVisible =
        fields.length === 16 &&
        fields.every((f) => {
          const r = f.getBoundingClientRect()
          return r.width > 0 && r.height > 0
        })

      const fieldTextClipped =
        mobile &&
        inputs.some((input) => {
          const el = input
          return el.scrollWidth > el.clientWidth + 2
        })

      const overlaps = (() => {
        for (let i = 0; i < fields.length; i++) {
          const a = fields[i].getBoundingClientRect()
          for (let j = i + 1; j < fields.length; j++) {
            const b = fields[j].getBoundingClientRect()
            if (a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1) {
              return true
            }
          }
        }
        return false
      })()

      const titleRect = poolsTitle?.getBoundingClientRect()
      const headerBottom = mobileHeader?.getBoundingClientRect().bottom ?? mobileHeaderBottom
      const titleBelowHeader = titleRect ? titleRect.top >= headerBottom - 2 : false

      const heroRect = hero?.getBoundingClientRect()
      const explorerRect = explorer?.getBoundingClientRect()
      const sidebarRect = sidebar?.getBoundingClientRect()
      const mobileOrderOk =
        !mobile ||
        (heroRect &&
          explorerRect &&
          cardRect &&
          sidebarRect &&
          heroRect.top < explorerRect.top &&
          explorerRect.top < cardRect.top &&
          cardRect.top < sidebarRect.top)

      const rewardBudget = inputs.find((i) => i.getAttribute('aria-label') === 'Reward Budget')
      const visibility = inputs.find((i) => i.getAttribute('aria-label') === 'Visibility')

      const docOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      const screenOverflowX = document.querySelector('[data-pools-studio-screen]')
        ? document.querySelector('[data-pools-studio-screen]').scrollWidth >
          document.querySelector('[data-pools-studio-screen]').clientWidth + 2
        : false

      const content = document.querySelector('[data-ps-content]')
      const contentPadTop = content ? parseFloat(window.getComputedStyle(content).paddingTop) : 0
      const contentPadBottom = content ? parseFloat(window.getComputedStyle(content).paddingBottom) : 0

      const firstField = fields[0]
      const fieldHeight = firstField ? firstField.getBoundingClientRect().height : 0
      const firstInput = grid?.querySelector('input')
      const inputHeight = firstInput ? firstInput.getBoundingClientRect().height : 0

      return {
        gapFromExplorer,
        cardHeight: cardRect?.height ?? 0,
        borderRadius: cardStyle ? parseFloat(cardStyle.borderRadius) : 0,
        paddingTop: cardStyle ? parseFloat(cardStyle.paddingTop) : 0,
        paddingLeft: cardStyle ? parseFloat(cardStyle.paddingLeft) : 0,
        fieldCount: fields.length,
        gridCols,
        fieldsVisible,
        fieldOverlaps: overlaps,
        fieldTextClipped,
        machinePreviewText: machinePreview?.textContent?.trim() ?? '',
        btnVisible: btnRect ? btnRect.height >= (mobile ? 42 : 44) && btnRect.width >= (mobile ? 280 : 166) : false,
        btnClipped: cardRect && btnRect ? btnRect.bottom > cardRect.bottom + 1 : false,
        cardOverflowX: card ? card.scrollWidth > card.clientWidth + 2 : false,
        docOverflowX,
        screenOverflowX,
        heroHeight: hero?.getBoundingClientRect().height ?? 0,
        explorerPresent: Boolean(explorer),
        toolbarPresent: Boolean(toolbar),
        titleBelowHeader,
        mobileOrderOk,
        rewardBudgetValue: rewardBudget?.value ?? '',
        visibilityValue: visibility?.value ?? '',
        contentPadTop,
        contentPadBottom,
        fieldHeight,
        inputHeight,
        advisorAfterCreatePool:
          !mobile ||
          (cardRect && advisor?.getBoundingClientRect()
            ? advisor.getBoundingClientRect().top >= cardRect.bottom - 2
            : true),
      }
    },
    { mobileHeaderBottom: MOBILE_HEADER_BOTTOM, isMobile },
  )
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {} }
  const browser = await chromium.launch()

  for (const [w, h, slug] of [
    [1440, 900, 'desktop-1440'],
    [1728, 1117, 'desktop-1728'],
    [390, 844, 'mobile-390'],
  ]) {
    const isMobile = slug === 'mobile-390'
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/pools`, { waitUntil: 'networkidle', timeout: 90000 })
    await page.waitForSelector('[data-r710-create-pool], [data-r709-create-pool]', { timeout: 90000 }).catch(() => undefined)

    if (isMobile) {
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(500)
    } else {
      await page.locator('[data-r710-create-pool], [data-r709-create-pool]').scrollIntoViewIfNeeded()
    }
    await page.waitForTimeout(1500)

    const shot = `pools-r710-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: true })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    if (slug === 'desktop-1440') {
      await page.locator('[data-r710-create-pool], [data-r709-create-pool]').scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
      await page.locator('[data-r710-create-pool], [data-r709-create-pool]').screenshot({
        path: path.join(OUT, 'pools-r710-create-pool-closeup.png'),
      })
      report.screenshots.push('pools-r710-create-pool-closeup.png')
    }

    const checks = await evaluateLayout(page, isMobile)
    report.viewports = report.viewports || {}
    report.viewports[slug] = checks
    if (slug === 'desktop-1440') report.checks = checks

    if (checks.fieldCount !== 16 || !checks.fieldsVisible) report.passed = false
    if (checks.fieldOverlaps) report.passed = false
    if (!checks.btnVisible || checks.btnClipped) report.passed = false
    if (checks.cardOverflowX || checks.docOverflowX || checks.screenOverflowX) report.passed = false
    if (checks.machinePreviewText !== 'View JSON') report.passed = false
    if (Math.abs((checks.borderRadius ?? 0) - 22) > 2) report.passed = false

    if (slug === 'desktop-1440' || slug === 'desktop-1728') {
      if (Math.abs((checks.gapFromExplorer ?? 0) - 48) > 4) report.passed = false
      if (Math.abs((checks.paddingTop ?? 0) - 30) > 2) report.passed = false
      if (Math.abs((checks.paddingLeft ?? 0) - 32) > 2) report.passed = false
      if (checks.gridCols !== 4) report.passed = false
      if (checks.rewardBudgetValue !== 'Configurable') report.passed = false
      if (checks.visibilityValue !== 'Build Studio toggle') report.passed = false
    }

    if (slug === 'desktop-1440') {
      if (Math.abs((checks.heroHeight ?? 0) - 300) > 2) report.passed = false
      if (!checks.explorerPresent || !checks.toolbarPresent) report.passed = false
    }

    if (slug === 'mobile-390') {
      if (!checks.titleBelowHeader) report.passed = false
      if (checks.fieldTextClipped) report.passed = false
      if (checks.gridCols !== 1) report.passed = false
      if (Math.abs((checks.paddingTop ?? 0) - 20) > 2) report.passed = false
      if (Math.abs((checks.contentPadTop ?? 0) - 72) > 2) report.passed = false
      if (Math.abs((checks.contentPadBottom ?? 0) - 120) > 2) report.passed = false
      if (!checks.mobileOrderOk) report.passed = false
      if (!checks.advisorAfterCreatePool) report.passed = false
      if ((checks.cardHeight ?? 0) > 1400) report.passed = false
      if (Math.abs((checks.fieldHeight ?? 0) - 58) > 4) report.passed = false
      if (Math.abs((checks.inputHeight ?? 0) - 38) > 4) report.passed = false
    }

    await ctx.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R710_VALIDATION_REPORT.md'),
    [
      '# R710 Step 6 Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R710 PASSED' : 'R710 FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
