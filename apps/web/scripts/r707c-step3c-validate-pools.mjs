#!/usr/bin/env node
/** R707C — Featured Pool Hero empty-state validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r707c-step3c-featured-hero-empty')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i
const FULL_TITLE = 'No funded reward pools'

async function evaluateEmpty(page) {
  return page.evaluate((fullTitle) => {
    const hero = document.querySelector('[data-ps-featured-empty]')
    if (!hero) return { missing: true }

    const rect = hero.getBoundingClientRect()
    const title = hero.querySelector('[data-ps-empty-title]')
    const createBtn = hero.querySelector('[data-ps-empty-create]')
    const studioBtn = hero.querySelector('[data-ps-empty-studio]')
    const titleText = title?.textContent?.trim() ?? ''
    const titleRect = title?.getBoundingClientRect()
    const heroRect = hero.getBoundingClientRect()

    const titleClipped =
      titleText !== fullTitle ||
      (title ? title.scrollWidth > title.clientWidth + 1 : true) ||
      (title ? title.getClientRects().length > 1 : true) ||
      (titleRect
        ? titleRect.right > heroRect.right + 1 || titleRect.left < heroRect.left - 1
        : true)

    const createRect = createBtn?.getBoundingClientRect()
    const studioRect = studioBtn?.getBoundingClientRect()
    const buttonsVisible =
      createRect &&
      studioRect &&
      createRect.height >= 46 &&
      studioRect.height >= 46 &&
      createRect.bottom <= heroRect.bottom + 1 &&
      studioRect.bottom <= heroRect.bottom + 1 &&
      createRect.top >= heroRect.top - 1 &&
      studioRect.top >= heroRect.top - 1

    return {
      missing: false,
      height: rect.height,
      borderRadius: parseFloat(window.getComputedStyle(hero).borderRadius),
      titleText,
      titleClipped,
      fullTitleVisible: titleText === fullTitle && !titleClipped,
      hasDonut: Boolean(hero.querySelector('[data-ps-featured-allocation], svg circle, [data-ps-live-donut]')),
      hasDivider: Boolean(
        [...hero.querySelectorAll('*')].some((el) => {
          const s = window.getComputedStyle(el)
          return s.borderRightWidth === '1px' && parseFloat(s.height) > 200
        }),
      ),
      hasGrid: Boolean(hero.querySelector('[class*="Grid"]')),
      createWidth: createRect?.width ?? 0,
      createHeight: createRect?.height ?? 0,
      studioWidth: studioRect?.width ?? 0,
      studioHeight: studioRect?.height ?? 0,
      buttonsVisible: Boolean(buttonsVisible),
      overflowX: hero.scrollWidth > hero.clientWidth + 2,
    }
  }, FULL_TITLE)
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
    await page.waitForSelector('[data-r707c-empty]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r707c-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: false })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    if (slug === 'desktop-1440') {
      const checks = await evaluateEmpty(page)
      report.checks = checks

      if (checks.missing) report.passed = false
      if (Math.abs((checks.height ?? 0) - 356) > 2) report.passed = false
      if (Math.abs((checks.borderRadius ?? 0) - 22) > 2) report.passed = false
      if (!checks.fullTitleVisible) report.passed = false
      if (checks.titleClipped) report.passed = false
      if (checks.hasDonut) report.passed = false
      if (checks.hasDivider) report.passed = false
      if (!checks.buttonsVisible) report.passed = false
      if (checks.overflowX) report.passed = false
      if (Math.abs((checks.createWidth ?? 0) - 180) > 2) report.passed = false
      if (Math.abs((checks.createHeight ?? 0) - 48) > 2) report.passed = false
      if (Math.abs((checks.studioWidth ?? 0) - 180) > 2) report.passed = false
      if (Math.abs((checks.studioHeight ?? 0) - 48) > 2) report.passed = false
    }

    await page.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R707C_VALIDATION_REPORT.md'),
    [
      '# R707C Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R707C PASSED' : 'R707C FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
