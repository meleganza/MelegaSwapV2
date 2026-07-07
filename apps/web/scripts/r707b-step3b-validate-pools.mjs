#!/usr/bin/env node
/** R707B Step 3B — Featured Pool Hero live-state validation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r707b-step3b-featured-hero-live')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i
const FORBIDDEN = ['Reward allocation data unavailable']

async function evaluateHero(page) {
  return page.evaluate((forbidden) => {
    const hero = document.querySelector('[data-ps-featured-hero]')
    if (!hero) return { missing: true }

    const rect = hero.getBoundingClientRect()
    const isLive = hero.hasAttribute('data-r707b-live')
    const isEmpty = hero.hasAttribute('data-ps-featured-empty')
    const text = hero.textContent ?? ''
    const overflowX = hero.scrollWidth > hero.clientWidth + 2

    const base = {
      missing: false,
      isLive,
      isEmpty,
      height: rect.height,
      borderRadius: parseFloat(window.getComputedStyle(hero).borderRadius),
      forbiddenHits: forbidden.filter((f) => text.includes(f)),
      overflowX,
    }

    if (!isLive) return base

    const apr = hero.querySelector('[data-ps-live-apr]')
    const aprStyle = apr ? window.getComputedStyle(apr) : null
    const aprFont = aprStyle ? parseFloat(aprStyle.fontSize) : 0
    const aprRect = apr?.getBoundingClientRect()
    const title = hero.querySelector('h2')
    const stakeBtn = hero.querySelector('[data-ps-stake-btn]')
    const analyzeBtn = [...hero.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Analyze')
    const donut = hero.querySelector('[data-ps-live-donut] svg')
    const donutRect = donut?.getBoundingClientRect()
    const divider = hero.querySelector('[aria-hidden]')
    const dividers = [...hero.querySelectorAll('[aria-hidden]')].filter(
      (el) => el.getBoundingClientRect().width <= 2 && el.getBoundingClientRect().height > 200,
    )

    const overlaps = (() => {
      const nodes = [...hero.querySelectorAll('h2, [data-ps-live-apr], button, [data-ps-live-donut]')]
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i].getBoundingClientRect()
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j].getBoundingClientRect()
          const overlap =
            a.left < b.right - 1 &&
            a.right > b.left + 1 &&
            a.top < b.bottom - 1 &&
            a.bottom > b.top + 1
          if (overlap) return true
        }
      }
      return false
    })()

    const titleWraps = title ? title.getClientRects().length > 1 : false
    const aprWraps = apr ? apr.getClientRects().length > 1 : false

    return {
      ...base,
      aprFont,
      aprVisible: aprRect ? aprRect.width > 0 && aprRect.height > 0 : false,
      titleWraps,
      aprWraps,
      stakeHeight: stakeBtn?.getBoundingClientRect().height ?? 0,
      stakeWidth: stakeBtn?.getBoundingClientRect().width ?? 0,
      analyzeHeight: analyzeBtn?.getBoundingClientRect().height ?? 0,
      analyzeWidth: analyzeBtn?.getBoundingClientRect().width ?? 0,
      donutWidth: donutRect?.width ?? 0,
      donutHeight: donutRect?.height ?? 0,
      hasDivider: dividers.length > 0,
      overlaps,
    }
  }, FORBIDDEN)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {}, liveStateAvailable: false }
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })

  for (const [w, h, slug] of [
    [1440, 900, 'desktop-1440'],
    [1728, 1117, 'desktop-1728'],
  ]) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-ps-featured-hero]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const shot = `pools-r707b-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: false })
    report.screenshots.push(shot)

    if (ERROR_RE.test(await page.locator('body').innerText())) report.passed = false

    if (slug === 'desktop-1440') {
      const checks = await evaluateHero(page)
      report.checks = checks
      report.liveStateAvailable = Boolean(checks.isLive)

      if (checks.missing) report.passed = false
      if (Math.abs((checks.height ?? 0) - 356) > 2) report.passed = false
      if (Math.abs((checks.borderRadius ?? 0) - 22) > 2) report.passed = false
      if (checks.forbiddenHits?.length) report.passed = false
      if (checks.overflowX) report.passed = false

      if (checks.isLive) {
        if (checks.aprFont < 72) report.passed = false
        if (!checks.aprVisible) report.passed = false
        if (checks.titleWraps) report.passed = false
        if (checks.aprWraps) report.passed = false
        if (!checks.hasDivider) report.passed = false
        if (checks.overlaps) report.passed = false
        if (Math.abs((checks.stakeHeight ?? 0) - 48) > 2) report.passed = false
        if (Math.abs((checks.stakeWidth ?? 0) - 176) > 2) report.passed = false
        if (Math.abs((checks.analyzeHeight ?? 0) - 48) > 2) report.passed = false
        if (Math.abs((checks.analyzeWidth ?? 0) - 150) > 2) report.passed = false
        if (Math.abs((checks.donutWidth ?? 0) - 156) > 2) report.passed = false
        if (Math.abs((checks.donutHeight ?? 0) - 156) > 2) report.passed = false
      } else if (checks.isEmpty) {
        report.passed = true
        report.note = 'No live pool — empty state unchanged; live layout checks skipped'
      }
    }

    await page.close()
  }

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R707B_STEP3B_VALIDATION_REPORT.md'),
    [
      '# R707B Step 3B Validation',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      report.note ? `\nNote: ${report.note}` : '',
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R707B STEP3B PASSED' : 'R707B STEP3B FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
