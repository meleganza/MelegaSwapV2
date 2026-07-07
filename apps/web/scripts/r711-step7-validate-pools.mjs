#!/usr/bin/env node
/** R711 Step 7 — Responsive bugfix validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r711-step7-responsive-bugfix')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

const HEADER_SELECTORS = '[data-melega-app-header], [data-melega-mobile-header]'

async function evaluateViewport(page, isMobile) {
  return page.evaluate(
    ({ headerSelectors, isMobile: mobile }) => {
      const emptyGrid = document.querySelector('[data-r708-empty-grid], [data-ps-pool-grid-empty]')
      const card = document.querySelector('[data-r711-create-pool], [data-r710-create-pool]')
      const grid = document.querySelector('[data-ps-create-pool-grid]')
      const btn = document.querySelector('[data-ps-create-pool-btn]')
      const hero = document.querySelector('[data-r707e-empty], [data-ps-featured-empty]')
      const explorer = document.querySelector('[data-r708-explorer]')
      const ticker = document.querySelector('[data-melega-ticker]')
      const poolsTitle = document.querySelector('[data-ps-pools-title]')
      const kpi = document.querySelector('[data-ps-kpi-row]')
      const advisor = document.querySelector('[data-ps-advisor-wrap]')
      const health = document.querySelector('[data-ps-health-guide]')
      const donut = document.querySelector('[data-ps-reward-pie]')
      const analytics = document.querySelector('[data-ps-bottom-panels]')
      const content = document.querySelector('[data-ps-content]')

      const emptyRect = emptyGrid?.getBoundingClientRect()
      const cardRect = card?.getBoundingClientRect()
      const btnRect = btn?.getBoundingClientRect()
      const cardStyle = card ? window.getComputedStyle(card) : null
      const fields = grid ? [...grid.querySelectorAll('[data-ps-create-field]')] : []
      const inputs = grid ? [...grid.querySelectorAll('input[data-ps-create-value]')] : []

      const gapFromExplorer =
        emptyRect && cardRect
          ? cardRect.top - emptyRect.bottom
          : cardRect && explorer
            ? cardRect.top - explorer.getBoundingClientRect().bottom
            : null

      const gridTemplate = grid ? window.getComputedStyle(grid).gridTemplateColumns : ''
      const gridCols = gridTemplate.split(' ').filter(Boolean).length

      const headerEls = [...document.querySelectorAll(headerSelectors)]
      const headersInViewport = headerEls.map((el) => {
        const r = el.getBoundingClientRect()
        const pos = window.getComputedStyle(el).position
        return { top: r.top, height: r.height, position: pos, visible: r.height > 0 && r.width > 0 }
      })

      const topHeaders = headersInViewport.filter((h) => h.visible && h.top < 80)
      const strayHeaders = headersInViewport.filter((h) => h.visible && h.top > 120)

      const appHeader = document.querySelector('[data-melega-app-header]')
      const appHeaderPosition = appHeader ? window.getComputedStyle(appHeader).position : null

      const fieldTextClipped =
        mobile &&
        inputs.some((input) => input.scrollWidth > input.clientWidth + 2)

      const docOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      const bodyOverflowX = document.body.scrollWidth > document.body.clientWidth + 2

      const mobileOrderOk =
        !mobile ||
        (() => {
          const rects = [
            { el: ticker, name: 'ticker' },
            { el: poolsTitle, name: 'title' },
            { el: kpi, name: 'kpi' },
            { el: hero, name: 'hero' },
            { el: explorer, name: 'explorer' },
            { el: card, name: 'create' },
            { el: advisor, name: 'advisor' },
            { el: health, name: 'health' },
            { el: donut, name: 'donut' },
            { el: analytics, name: 'analytics' },
          ].filter((x) => x.el)
          for (let i = 1; i < rects.length; i++) {
            if (rects[i].el.getBoundingClientRect().top < rects[i - 1].el.getBoundingClientRect().top - 2) {
              return false
            }
          }
          return true
        })()

      const bottomNav = document.querySelector('nav[aria-label="Main navigation"]')
      const bottomNavRect = bottomNav?.getBoundingClientRect()
      const btnAboveBottomNav = btnRect && bottomNavRect ? btnRect.bottom < bottomNavRect.top - 4 : true

      const firstField = fields[0]
      const fieldHeight = firstField ? firstField.getBoundingClientRect().height : 0
      const firstInput = grid?.querySelector('input')
      const inputHeight = firstInput ? firstInput.getBoundingClientRect().height : 0
      const cardWidth = cardRect?.width ?? 0

      return {
        gapFromExplorer,
        cardHeight: cardRect?.height ?? 0,
        borderRadius: cardStyle ? parseFloat(cardStyle.borderRadius) : 0,
        paddingTop: cardStyle ? parseFloat(cardStyle.paddingTop) : 0,
        gridCols,
        fieldCount: fields.length,
        fieldTextClipped,
        btnVisible: btnRect ? btnRect.height >= 42 && btnRect.width >= (mobile ? 200 : 166) : false,
        btnClipped: cardRect && btnRect ? btnRect.bottom > cardRect.bottom + 1 : false,
        docOverflowX,
        bodyOverflowX,
        topHeaderCount: topHeaders.length,
        strayHeaderCount: strayHeaders.length,
        appHeaderPosition,
        heroHeight: hero?.getBoundingClientRect().height ?? 0,
        mobileOrderOk,
        btnAboveBottomNav,
        fieldHeight,
        inputHeight,
        cardWidth,
        contentPadBottom: content ? parseFloat(window.getComputedStyle(content).paddingBottom) : 0,
        desktopGapOk: !mobile ? Math.abs((gapFromExplorer ?? 0) - 48) <= 4 : true,
        desktopGridOk: !mobile ? gridCols === 4 : true,
        desktopPaddingOk: !mobile
          ? Math.abs((cardStyle ? parseFloat(cardStyle.paddingTop) : 0) - 30) <= 2
          : true,
      }
    },
    { headerSelectors: HEADER_SELECTORS, isMobile },
  )
}

async function scanForStrayHeaders(page) {
  return page.evaluate((headerSelectors) => {
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 0)
    const steps = [0, Math.floor(maxScroll * 0.35), Math.floor(maxScroll * 0.65), maxScroll]
    let stray = 0
    for (const y of steps) {
      window.scrollTo(0, y)
      const headers = [...document.querySelectorAll(headerSelectors)]
      stray += headers.filter((el) => {
        const r = el.getBoundingClientRect()
        return r.height > 30 && r.width > 200 && r.top > 120
      }).length
    }
    window.scrollTo(0, 0)
    return stray
  }, HEADER_SELECTORS)
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
    await page.waitForSelector('[data-r711-create-pool], [data-r710-create-pool]', { timeout: 90000 }).catch(() => undefined)

    if (isMobile) {
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(500)
    }

    const strayHeaders = await scanForStrayHeaders(page)

    if (!isMobile) {
      await page.locator('[data-r711-create-pool], [data-r710-create-pool]').scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    } else {
      await page.locator('[data-r711-create-pool], [data-r710-create-pool]').scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    }

    const shot = `pools-r711-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: !isMobile })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    if (slug === 'desktop-1440') {
      await page.locator('[data-r711-create-pool], [data-r710-create-pool]').screenshot({
        path: path.join(OUT, 'pools-r711-create-pool-closeup.png'),
      })
      report.screenshots.push('pools-r711-create-pool-closeup.png')
    }

    const checks = await evaluateViewport(page, isMobile)
    checks.strayHeadersOnScroll = strayHeaders
    report.viewports = report.viewports || {}
    report.viewports[slug] = checks
    if (slug === 'desktop-1440') report.checks = checks

    if (checks.topHeaderCount !== 1) report.passed = false
    if (checks.strayHeaderCount > 0 || strayHeaders > 0) report.passed = false
    if (checks.docOverflowX || checks.bodyOverflowX) report.passed = false
    if (!checks.btnVisible || checks.btnClipped) report.passed = false
    if (checks.fieldTextClipped) report.passed = false

    if (!isMobile) {
      if (!checks.desktopGapOk || !checks.desktopGridOk || !checks.desktopPaddingOk) report.passed = false
      if (checks.appHeaderPosition !== 'sticky') report.passed = false
    }

    if (isMobile) {
      if (!checks.mobileOrderOk) report.passed = false
      if (Math.abs((checks.gapFromExplorer ?? 0) - 32) > 4) report.passed = false
      if (Math.abs((checks.paddingTop ?? 0) - 18) > 2) report.passed = false
      if (Math.abs((checks.borderRadius ?? 0) - 18) > 2) report.passed = false
      if (Math.abs((checks.fieldHeight ?? 0) - 56) > 4) report.passed = false
      if (Math.abs((checks.inputHeight ?? 0) - 38) > 4) report.passed = false
      if (Math.abs((checks.contentPadBottom ?? 0) - 120) > 2) report.passed = false
      if (Math.abs(checks.cardWidth - 358) > 8) report.passed = false
      if (checks.gridCols !== 1) report.passed = false
    }

    await ctx.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R711_VALIDATION_REPORT.md'),
    [
      '# R711 Step 7 Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R711 PASSED' : 'R711 FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
