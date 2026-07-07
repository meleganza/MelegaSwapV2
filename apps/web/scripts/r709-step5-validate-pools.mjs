#!/usr/bin/env node
/** R709 Step 5 — Create Pool builder polish validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r709-step5-create-pool-builder')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

async function evaluateCreatePool(page) {
  return page.evaluate(() => {
    const emptyGrid = document.querySelector('[data-r708-empty-grid], [data-ps-pool-grid-empty]')
    const card = document.querySelector('[data-r709-create-pool]')
    const grid = document.querySelector('[data-ps-create-pool-grid]')
    const btn = document.querySelector('[data-ps-create-pool-btn]')
    const hero = document.querySelector('[data-r707e-empty], [data-ps-featured-empty]')
    const explorer = document.querySelector('[data-r708-explorer]')
    const toolbar = document.querySelector('[data-r708b-toolbar]')

    const emptyRect = emptyGrid?.getBoundingClientRect()
    const cardRect = card?.getBoundingClientRect()
    const btnRect = btn?.getBoundingClientRect()
    const cardStyle = card ? window.getComputedStyle(card) : null
    const fields = grid ? [...grid.querySelectorAll('[data-ps-create-field]')] : []
    const machinePreview = card?.querySelector('[data-ps-create-machine-preview]')

    const gapFromExplorer =
      emptyRect && cardRect ? cardRect.top - emptyRect.bottom : cardRect && explorer
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
      machinePreviewText: machinePreview?.textContent?.trim() ?? '',
      btnVisible: btnRect ? btnRect.height >= 44 && btnRect.width >= 166 : false,
      btnClipped: cardRect && btnRect ? btnRect.bottom > cardRect.bottom + 1 : false,
      cardOverflowX: card ? card.scrollWidth > card.clientWidth + 2 : false,
      heroHeight: hero?.getBoundingClientRect().height ?? 0,
      explorerPresent: Boolean(explorer),
      toolbarPresent: Boolean(toolbar),
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {} }
  const browser = await chromium.launch()

  for (const [w, h, slug, fullPage] of [
    [1440, 900, 'desktop-1440', true],
    [1728, 1117, 'desktop-1728', true],
    [390, 844, 'mobile-390', true],
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/pools`, { waitUntil: 'networkidle', timeout: 90000 })
    await page.waitForSelector('[data-r709-create-pool]', { timeout: 90000 }).catch(() => undefined)
    await page.locator('[data-r709-create-pool]').scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)

    const shot = `pools-r709-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    if (slug === 'desktop-1440') {
      await page.locator('[data-r709-create-pool]').screenshot({
        path: path.join(OUT, 'pools-r709-create-pool-closeup.png'),
      })
      report.screenshots.push('pools-r709-create-pool-closeup.png')
    }

    const checks = await evaluateCreatePool(page)
    report.viewports = report.viewports || {}
    report.viewports[slug] = checks
    if (slug === 'desktop-1440') report.checks = checks

    if (checks.fieldCount !== 16 || !checks.fieldsVisible) report.passed = false
    if (checks.fieldOverlaps) report.passed = false
    if (!checks.btnVisible || checks.btnClipped) report.passed = false
    if (checks.cardOverflowX) report.passed = false
    if (checks.machinePreviewText !== 'View JSON') report.passed = false
    if (Math.abs((checks.borderRadius ?? 0) - 22) > 2) report.passed = false

    if (slug === 'desktop-1440' || slug === 'desktop-1728') {
      if (Math.abs((checks.gapFromExplorer ?? 0) - 48) > 4) report.passed = false
      if (Math.abs((checks.paddingTop ?? 0) - 30) > 2) report.passed = false
      if (Math.abs((checks.paddingLeft ?? 0) - 32) > 2) report.passed = false
      if (checks.gridCols !== 4) report.passed = false
    }

    if (slug === 'mobile-390') {
      if (checks.gridCols !== 1) report.passed = false
      if (Math.abs((checks.paddingTop ?? 0) - 22) > 2) report.passed = false
      if ((checks.cardHeight ?? 0) < 900) report.passed = false
    }

    if (slug === 'desktop-1440') {
      if (Math.abs((checks.heroHeight ?? 0) - 300) > 2) report.passed = false
      if (!checks.explorerPresent || !checks.toolbarPresent) report.passed = false
    }

    await ctx.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R709_VALIDATION_REPORT.md'),
    [
      '# R709 Step 5 Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R709 PASSED' : 'R709 FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
