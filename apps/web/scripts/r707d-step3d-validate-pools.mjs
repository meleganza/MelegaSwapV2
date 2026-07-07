#!/usr/bin/env node
/** R707D — Featured Pool Hero empty-state CTA vertical fix validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r707d-step3d-featured-hero-empty-cta')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i
const FULL_TITLE = 'No funded reward pools'
const FULL_SUBTITLE = 'Create or fund a reward pool to activate staking opportunities.'

async function evaluateEmpty(page) {
  return page.evaluate(({ fullTitle, fullSubtitle }) => {
    const hero = document.querySelector('[data-r707d-empty]')
    if (!hero) return { missing: true }

    const heroRect = hero.getBoundingClientRect()
    const title = hero.querySelector('[data-ps-empty-title]')
    const subtitle = hero.querySelector('[data-ps-empty-subtitle]')
    const ctaRow = hero.querySelector('[data-ps-empty-cta]')
    const createBtn = hero.querySelector('[data-ps-empty-create]')
    const studioBtn = hero.querySelector('[data-ps-empty-studio]')

    const titleText = title?.textContent?.trim() ?? ''
    const subtitleText = subtitle?.textContent?.trim() ?? ''
    const titleRect = title?.getBoundingClientRect()
    const subtitleRect = subtitle?.getBoundingClientRect()
    const createRect = createBtn?.getBoundingClientRect()
    const studioRect = studioBtn?.getBoundingClientRect()
    const ctaOverflow = ctaRow ? window.getComputedStyle(ctaRow).overflow : 'visible'

    const isClipped = (el, text, full) => {
      if (!el || text !== full) return true
      if (el.scrollWidth > el.clientWidth + 1) return true
      if (el.getClientRects().length > 1) return true
      const r = el.getBoundingClientRect()
      return r.right > heroRect.right + 1 || r.left < heroRect.left - 1
    }

    const titleClipped = isClipped(title, titleText, fullTitle)
    const subtitleClipped = isClipped(subtitle, subtitleText, fullSubtitle)

    const ctaTopOffset = createRect ? createRect.top - heroRect.top : null
    const ctaTopOk = ctaTopOffset !== null && Math.abs(ctaTopOffset - 132) <= 6

    const buttonsVisible =
      createRect &&
      studioRect &&
      createRect.height >= 46 &&
      studioRect.height >= 46 &&
      createRect.bottom <= heroRect.bottom - 1 &&
      studioRect.bottom <= heroRect.bottom - 1 &&
      createRect.top >= heroRect.top &&
      studioRect.top >= heroRect.top

    return {
      missing: false,
      height: heroRect.height,
      borderRadius: parseFloat(window.getComputedStyle(hero).borderRadius),
      titleText,
      subtitleText,
      titleClipped,
      subtitleClipped,
      fullTitleVisible: titleText === fullTitle && !titleClipped,
      fullSubtitleVisible: subtitleText === fullSubtitle && !subtitleClipped,
      ctaTopOffset,
      ctaTopOk,
      ctaOverflow,
      hasDonut: Boolean(hero.querySelector('[data-ps-featured-allocation], svg circle, [data-ps-live-donut]')),
      createWidth: createRect?.width ?? 0,
      createHeight: createRect?.height ?? 0,
      studioWidth: studioRect?.width ?? 0,
      studioHeight: studioRect?.height ?? 0,
      buttonsVisible: Boolean(buttonsVisible),
      overflowX: hero.scrollWidth > hero.clientWidth + 2,
    }
  }, { fullTitle: FULL_TITLE, fullSubtitle: FULL_SUBTITLE })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {} }
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })

  for (const [w, h, slug] of [
    [1440, 900, 'desktop-1440'],
    [1728, 1117, 'desktop-1728'],
  ]) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-r707d-empty]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r707d-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: false })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    const checks = await evaluateEmpty(page)
    if (slug === 'desktop-1440') report.checks = checks

    if (checks.missing) report.passed = false
    if (Math.abs((checks.height ?? 0) - 356) > 2) report.passed = false
    if (!checks.fullTitleVisible) report.passed = false
    if (!checks.fullSubtitleVisible) report.passed = false
    if (checks.titleClipped || checks.subtitleClipped) report.passed = false
    if (!checks.buttonsVisible) report.passed = false
    if (checks.hasDonut) report.passed = false
    if (checks.overflowX) report.passed = false
    if (!checks.ctaTopOk) report.passed = false
    if (checks.ctaOverflow === 'hidden') report.passed = false
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R707D_VALIDATION_REPORT.md'),
    [
      '# R707D Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R707D PASSED' : 'R707D FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
