#!/usr/bin/env node
/** R702 Pools Experience — validation + screenshots. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r702-pools-experience')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const FORBIDDEN = ['0%', '0.00%', 'NaN', 'Infinity', '130000000000%']
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary|unhandled runtime error/i

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], checks: {} }
  const browser = await chromium.launch()
  const ctx = await browser.newContext()

  for (const [w, h, slug] of [
    [1440, 900, 'after-1440'],
    [390, 844, 'after-390'],
  ]) {
    const page = await ctx.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForSelector('[data-pools-studio-screen]', { timeout: 60000 }).catch(() => undefined)
    await page.waitForTimeout(5000)
    const body = await page.locator('body').innerText()
    if (ERROR_RE.test(body)) report.passed = false
    const shot = `pools-r702-${slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: slug === 'after-1440' })
    report.screenshots.push(shot)
    if (slug === 'after-1440') {
      const forbidden = await page.evaluate((bad) => {
        const hits = []
        document.querySelectorAll('[data-pools-studio-screen] [data-ps-pool-card], [data-ps-featured]').forEach((card) => {
          card.querySelectorAll('*').forEach((el) => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
              const t = el.textContent?.trim() ?? ''
              if (bad.includes(t)) hits.push(t)
            }
          })
        })
        return [...new Set(hits)]
      }, FORBIDDEN)
      report.checks = {
        featured: (await page.locator('[data-ps-featured]').count()) > 0,
        kpiCards: await page.locator('[data-ps-kpi-card]').count(),
        poolCards: await page.locator('[data-ps-pool-card]').count(),
        forbiddenApr: forbidden,
      }
      if (forbidden.length) report.passed = false
      const btn = page.locator('[data-ps-pool-card] button:has-text("Analyze")').first()
      if (await btn.count()) {
        await btn.click()
        await page.waitForTimeout(400)
        await page.screenshot({ path: path.join(OUT, 'pools-r702-after-1440-analyze.png'), fullPage: true })
        report.screenshots.push('pools-r702-after-1440-analyze.png')
      }
    }
    await page.close()
  }

  await browser.close()

  const lines = [
    '# R702 Pools Experience — Validation',
    '',
    `Result: ${report.passed ? 'PASSED' : 'FAILED'}`,
    '',
    '## Checks',
    JSON.stringify(report.checks, null, 2),
    '',
    '## Screenshots',
    ...report.screenshots.map((s) => `- docs/screenshots/r702-pools-experience/${s}`),
    '',
    '## Before',
    '- docs/screenshots/r703-pools-premium/pools-r703-1440.png',
  ]
  fs.writeFileSync(path.join(OUT, 'R702_VALIDATION_REPORT.md'), lines.join('\n'))
  console.log(lines.join('\n'))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
