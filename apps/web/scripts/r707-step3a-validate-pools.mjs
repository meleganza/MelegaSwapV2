#!/usr/bin/env node
/** R707 Step 3A — Featured Pool Hero validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r707-step3a-featured-hero')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const FORBIDDEN = ['NEEDS_FUNDING', 'POOL_ENDED', 'Hidden:', 'machine JSON']
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {} }
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })

  for (const [w, h, slug] of [
    [1440, 900, 'desktop-1440'],
    [1728, 1117, 'desktop-1728'],
    [390, 844, 'mobile-390'],
  ]) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-r707-featured]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r707-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: slug !== 'desktop-1440' })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    if (slug === 'desktop-1440') {
      const checks = await page.evaluate((forbidden) => {
        const hero = document.querySelector('[data-ps-featured-hero]')
        if (!hero) return {}

        const text = hero.textContent ?? ''
        const rect = hero.getBoundingClientRect()
        const radius = parseFloat(window.getComputedStyle(hero).borderRadius)
        const stakeBtn = hero.querySelector('[data-ps-stake-btn]')
        const analyzeBtn = [...hero.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Analyze')
        const title = hero.querySelector('h2')
        const apr = hero.querySelector('[data-ps-featured] [class]') // fallback
        const left = hero.querySelector('[data-ps-featured-empty]') ? hero : hero
        const gridLeft = hero.firstElementChild?.firstElementChild
        const gridRight = hero.firstElementChild?.lastElementChild
        const leftBorder = gridLeft ? window.getComputedStyle(gridLeft).borderRightWidth : '0'
        const titleStyle = title ? window.getComputedStyle(title) : null
        const aprEl = [...hero.querySelectorAll('div')].find((el) => {
          const t = el.textContent?.trim() ?? ''
          return /%$/.test(t) && parseFloat(window.getComputedStyle(el).fontSize) > 60
        })

        const titleWraps = title
          ? title.getClientRects().length > 1 ||
            title.offsetHeight > parseFloat(titleStyle?.lineHeight || '44') * 1.6
          : false

        return {
          forbiddenHits: forbidden.filter((f) => text.includes(f)),
          height: rect.height,
          borderRadius: radius,
          hasR707: hero.hasAttribute('data-r707-featured'),
          stakeHeight: stakeBtn?.getBoundingClientRect().height ?? 0,
          stakeWidth: stakeBtn?.getBoundingClientRect().width ?? 0,
          analyzeHeight: analyzeBtn?.getBoundingClientRect().height ?? 0,
          titleWraps,
          aprWraps: aprEl ? aprEl.getClientRects().length > 1 : false,
          hasDivider: leftBorder === '1px',
          emptyHeight: hero.hasAttribute('data-ps-featured-empty') ? rect.height : null,
          hasRightColumn: Boolean(gridRight?.querySelector('[data-ps-featured-allocation]')),
        }
      }, FORBIDDEN)

      report.checks = checks
      if (checks.forbiddenHits?.length) report.passed = false
      if (Math.abs((checks.height ?? 0) - 356) > 2) report.passed = false
      if (checks.emptyHeight && Math.abs(checks.emptyHeight - 356) > 2) report.passed = false
      if (Math.abs((checks.borderRadius ?? 0) - 22) > 2) report.passed = false
      if (!checks.hasR707) report.passed = false
      if (checks.titleWraps) report.passed = false
      if (checks.aprWraps) report.passed = false
      if (!checks.hasDivider) report.passed = false
      if (!checks.hasRightColumn) report.passed = false
      if (checks.stakeHeight && checks.stakeHeight > 0 && Math.abs(checks.stakeHeight - 56) > 2) report.passed = false
      if (checks.stakeWidth && checks.stakeWidth > 0 && Math.abs(checks.stakeWidth - 210) > 2) report.passed = false
      if (checks.analyzeHeight && checks.analyzeHeight > 0 && Math.abs(checks.analyzeHeight - 56) > 2) report.passed = false
    }

    await page.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R707_STEP3A_VALIDATION_REPORT.md'),
    [`# R707 Step 3A Validation`, '', `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`, '', '```json', JSON.stringify(report, null, 2), '```'].join('\n'),
  )
  console.log(report.passed ? 'R707 STEP3A PASSED' : 'R707 STEP3A FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
