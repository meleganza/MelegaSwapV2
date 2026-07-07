#!/usr/bin/env node
/** R712 — Pools final visual fix validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r712-final-visual-fix')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

const HEADER_SELECTORS = '[data-melega-app-header], [data-melega-mobile-header]'
const SIDEBAR_SELECTOR = '[data-melega-sidebar]'

async function scanStrayChrome(page) {
  return page.evaluate(
    ({ headerSelectors, sidebarSelector }) => {
      const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 0)
      const steps = [0, Math.floor(maxScroll * 0.35), Math.floor(maxScroll * 0.65), maxScroll]
      let strayHeaders = 0
      let straySidebars = 0
      for (const y of steps) {
        window.scrollTo(0, y)
        strayHeaders += [...document.querySelectorAll(headerSelectors)].filter((el) => {
          const r = el.getBoundingClientRect()
          return r.height > 30 && r.width > 200 && r.top > 120
        }).length
        straySidebars += [...document.querySelectorAll(sidebarSelector)].filter((el) => {
          const r = el.getBoundingClientRect()
          return r.height > 100 && r.width > 100 && r.left < 280 && r.top > 120
        }).length
      }
      window.scrollTo(0, 0)
      return { strayHeaders, straySidebars }
    },
    { headerSelectors: HEADER_SELECTORS, sidebarSelector: SIDEBAR_SELECTOR },
  )
}

async function evaluateViewport(page, isMobile) {
  return page.evaluate(
    ({ headerSelectors, sidebarSelector, isMobile: mobile }) => {
      const card = document.querySelector('[data-r712-create-pool], [data-r711-create-pool]')
      const grid = document.querySelector('[data-ps-create-pool-grid]')
      const btn = document.querySelector('[data-ps-create-pool-btn]')
      const content = document.querySelector('[data-ps-content]')
      const fields = grid ? [...grid.querySelectorAll('[data-ps-create-field]')] : []
      const inputs = grid ? [...grid.querySelectorAll('input[data-ps-create-value]')] : []
      const lastField = fields[fields.length - 1]
      const machinePreview = card?.querySelector('[data-ps-create-machine-preview]')

      const cardRect = card?.getBoundingClientRect()
      const btnRect = btn?.getBoundingClientRect()
      const lastFieldRect = lastField?.getBoundingClientRect()
      const cardStyle = card ? window.getComputedStyle(card) : null
      const title = card?.querySelector('h2')
      const titleStyle = title ? window.getComputedStyle(title) : null

      const headerEls = [...document.querySelectorAll(headerSelectors)]
      const topHeaders = headerEls.filter((el) => {
        const r = el.getBoundingClientRect()
        return r.height > 0 && r.width > 0 && r.top < 80
      })

      const sidebars = [...document.querySelectorAll(sidebarSelector)]
      const sidebarPosition = sidebars[0] ? window.getComputedStyle(sidebars[0]).position : null

      const bottomNav = document.querySelector('nav[aria-label="Main navigation"]')
      const bottomNavRect = bottomNav?.getBoundingClientRect()

      const btnClearOfBottomNav =
        !mobile || !btnRect || !bottomNavRect ? true : btnRect.bottom <= bottomNavRect.top - 4
      const lastFieldClearOfBottomNav =
        !mobile || !lastFieldRect || !bottomNavRect ? true : lastFieldRect.bottom <= bottomNavRect.top - 4

      const fieldTextClipped = inputs.some((input) => input.scrollWidth > input.clientWidth + 2)

      const docOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      const bodyOverflowX = document.body.scrollWidth > document.body.clientWidth + 2

      const gridTemplate = grid ? window.getComputedStyle(grid).gridTemplateColumns : ''
      const gridCols = gridTemplate.split(' ').filter(Boolean).length

      return {
        topHeaderCount: topHeaders.length,
        sidebarCount: sidebars.length,
        sidebarPosition,
        paddingTop: cardStyle ? parseFloat(cardStyle.paddingTop) : 0,
        paddingLeft: cardStyle ? parseFloat(cardStyle.paddingLeft) : 0,
        paddingBottom: cardStyle ? parseFloat(cardStyle.paddingBottom) : 0,
        cardMarginBottom: cardStyle ? parseFloat(cardStyle.marginBottom) : 0,
        titleSize: titleStyle ? parseFloat(titleStyle.fontSize) : 0,
        gridCols,
        fieldCount: fields.length,
        fieldTextClipped,
        btnVisible: btnRect ? btnRect.height >= (mobile ? 42 : 44) && btnRect.width >= (mobile ? 200 : 166) : false,
        btnClipped: cardRect && btnRect ? btnRect.bottom > cardRect.bottom + 1 : false,
        btnClearOfBottomNav,
        lastFieldClearOfBottomNav,
        contentPadBottom: content ? parseFloat(window.getComputedStyle(content).paddingBottom) : 0,
        docOverflowX,
        bodyOverflowX,
        machinePreviewText: machinePreview?.textContent?.trim() ?? '',
        ctaBackground: btn ? window.getComputedStyle(btn).backgroundColor : '',
      }
    },
    { headerSelectors: HEADER_SELECTORS, sidebarSelector: SIDEBAR_SELECTOR, isMobile },
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
    await page.waitForSelector('[data-r712-create-pool], [data-r711-create-pool]', { timeout: 90000 }).catch(() => undefined)

    const stray = await scanStrayChrome(page)

    await page.locator('[data-r712-create-pool], [data-r711-create-pool]').scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)

    const shot = `pools-r712-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: !isMobile })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    if (slug === 'desktop-1440') {
      await page.locator('[data-r712-create-pool], [data-r711-create-pool]').screenshot({
        path: path.join(OUT, 'pools-r712-create-pool-closeup.png'),
      })
      report.screenshots.push('pools-r712-create-pool-closeup.png')
    }

    const checks = await evaluateViewport(page, isMobile)
    checks.strayHeadersOnScroll = stray.strayHeaders
    checks.straySidebarsOnScroll = stray.straySidebars
    report.viewports = report.viewports || {}
    report.viewports[slug] = checks
    if (slug === 'desktop-1440') report.checks = checks

    if (checks.topHeaderCount !== 1) report.passed = false
    if (stray.strayHeaders > 0 || stray.straySidebars > 0) report.passed = false
    if (checks.docOverflowX || checks.bodyOverflowX) report.passed = false
    if (checks.fieldTextClipped) report.passed = false
    if (!checks.btnVisible || checks.btnClipped) report.passed = false
    if (checks.machinePreviewText !== 'View JSON') report.passed = false

    if (!isMobile) {
      if (checks.sidebarCount !== 1) report.passed = false
      if (checks.sidebarPosition !== 'sticky') report.passed = false
      if (Math.abs((checks.paddingTop ?? 0) - 32) > 2) report.passed = false
      if (Math.abs((checks.paddingLeft ?? 0) - 36) > 2) report.passed = false
      if (Math.abs((checks.titleSize ?? 0) - 32) > 2) report.passed = false
      if (checks.gridCols !== 4) report.passed = false
    }

    if (isMobile) {
      if (!checks.btnClearOfBottomNav || !checks.lastFieldClearOfBottomNav) report.passed = false
      if (Math.abs((checks.contentPadBottom ?? 0) - 180) > 2) report.passed = false
      if (Math.abs((checks.cardMarginBottom ?? 0) - 32) > 2) report.passed = false
      if (checks.gridCols !== 1) report.passed = false
    }

    await ctx.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R712_VALIDATION_REPORT.md'),
    [
      '# R712 Final Visual Fix Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R712 PASSED' : 'R712 FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
