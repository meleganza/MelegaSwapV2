#!/usr/bin/env node
/** R707E — Empty featured hero above-the-fold validation with screenshot pixel checks. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r707e-step3e-featured-hero-above-fold')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i
const FULL_TITLE = 'No funded reward pools'
const FULL_SUBTITLE = 'Create or fund a reward pool to activate staking opportunities.'
const FOLD_MARGIN = 32

async function sampleButtonPixels(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return { ok: false, reason: 'missing' }
    const r = el.getBoundingClientRect()
    const cx = Math.round(r.left + r.width / 2)
    const cy = Math.round(r.top + r.height / 2)
    const br = Math.round(r.left + r.width - 4)
    const bb = Math.round(r.bottom - 4)
    const points = [
      [cx, cy],
      [Math.round(r.left + 4), Math.round(r.top + 4)],
      [br, bb],
    ]
    const hits = points.map(([x, y]) => {
      const hit = document.elementFromPoint(x, y)
      return Boolean(hit && (el === hit || el.contains(hit)))
    })
    return { ok: hits.every(Boolean), hits, cx, cy, br, bb }
  }, selector)
}

async function evaluateViewport(page, viewportHeight) {
  return page.evaluate(
    ({ fullTitle, fullSubtitle, foldMargin, viewportHeight: vh }) => {
      const hero = document.querySelector('[data-r707e-empty]')
      if (!hero) return { missing: true }

      const heroRect = hero.getBoundingClientRect()
      const title = hero.querySelector('[data-ps-empty-title]')
      const subtitle = hero.querySelector('[data-ps-empty-subtitle]')
      const createBtn = hero.querySelector('[data-ps-empty-create]')
      const studioBtn = hero.querySelector('[data-ps-empty-studio]')
      const kpi = document.querySelector('[data-ps-kpi-row]')
      const sidebar = document.querySelector('[data-ps-sidebar]')

      const titleRect = title?.getBoundingClientRect()
      const subtitleRect = subtitle?.getBoundingClientRect()
      const createRect = createBtn?.getBoundingClientRect()
      const studioRect = studioBtn?.getBoundingClientRect()
      const kpiRect = kpi?.getBoundingClientRect()
      const sidebarRect = sidebar?.getBoundingClientRect()

      const titleText = title?.textContent?.trim() ?? ''
      const subtitleText = subtitle?.textContent?.trim() ?? ''

      const contentStartOk = titleRect ? Math.abs(titleRect.top - (heroRect.top + 32)) <= 2 : false
      const kpiGapOk = kpiRect && heroRect ? Math.abs(heroRect.top - kpiRect.bottom - 24) <= 6 : true
      const sidebarAlignOk = sidebarRect && heroRect ? Math.abs(sidebarRect.top - heroRect.top) <= 3 : true

      const buttonBottomMax = Math.max(createRect?.bottom ?? 0, studioRect?.bottom ?? 0)
      const foldClearance = vh - buttonBottomMax
      const buttonsAboveFold = foldClearance >= foldMargin

      const fullyInViewport = (rect) =>
        rect &&
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= vh &&
        rect.width > 0 &&
        rect.height > 0

      return {
        missing: false,
        viewportHeight: vh,
        cardHeight: heroRect.height,
        titleText,
        subtitleText,
        titleFullyVisible: titleText === fullTitle && fullyInViewport(titleRect),
        subtitleFullyVisible: subtitleText === fullSubtitle && fullyInViewport(subtitleRect),
        createFullyVisible: fullyInViewport(createRect),
        studioFullyVisible: fullyInViewport(studioRect),
        buttonsAboveFold,
        foldClearance,
        contentStartOk,
        kpiGapOk,
        sidebarAlignOk,
        hasDonut: Boolean(
          hero.querySelector('[data-ps-featured-allocation], svg circle, [data-ps-live-donut]'),
        ),
        createBottom: createRect?.bottom ?? 0,
        studioBottom: studioRect?.bottom ?? 0,
      }
    },
    { fullTitle: FULL_TITLE, fullSubtitle: FULL_SUBTITLE, foldMargin: FOLD_MARGIN, viewportHeight },
  )
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], viewports: {} }
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })

  for (const [w, h, slug] of [
    [1440, 900, 'desktop-1440'],
    [1728, 1117, 'desktop-1728'],
  ]) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-r707e-empty]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r707e-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: false })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    const checks = await evaluateViewport(page, h)
    const createPixels = await sampleButtonPixels(page, '[data-ps-empty-create]')
    const studioPixels = await sampleButtonPixels(page, '[data-ps-empty-studio]')

    const viewportReport = {
      ...checks,
      createPixelHit: createPixels,
      studioPixelHit: studioPixels,
    }
    report.viewports[slug] = viewportReport

    if (checks.missing) report.passed = false
    if (Math.abs((checks.cardHeight ?? 0) - 300) > 2) report.passed = false
    if (!checks.titleFullyVisible) report.passed = false
    if (!checks.subtitleFullyVisible) report.passed = false
    if (!checks.createFullyVisible) report.passed = false
    if (!checks.studioFullyVisible) report.passed = false
    if (!checks.buttonsAboveFold) report.passed = false
    if (!createPixels.ok) report.passed = false
    if (!studioPixels.ok) report.passed = false
    if (checks.hasDonut) report.passed = false
    if (!checks.contentStartOk) report.passed = false
    if (!checks.kpiGapOk) report.passed = false
    if (!checks.sidebarAlignOk) report.passed = false

    await page.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R707E_VALIDATION_REPORT.md'),
    [
      '# R707E Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R707E PASSED' : 'R707E FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
