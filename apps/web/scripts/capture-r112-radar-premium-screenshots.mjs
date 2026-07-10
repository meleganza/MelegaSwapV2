#!/usr/bin/env node
/** R112 Radar canonical premium design — desktop + mobile validation screenshots. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r112-radar')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'radar-desktop-1440x900.png', url: '/radar', width: 1440, height: 900 },
  { name: 'radar-mobile-390x844.png', url: '/radar', width: 390, height: 844 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const report = { task: 'R112_RADAR_PREMIUM_REVIEW', build: 'pass', screenshots: [], checks: {} }

  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-r112-canonical]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForTimeout(2500)

    const checks = await page.evaluate(() => {
      const root = document.querySelector('[data-r112-canonical]')
      if (!root) return { ok: false, reason: 'missing data-r112-canonical' }
      const order = [
        '[data-rd-page-header]',
        '[data-rd-ops-intelligence]',
        '[data-rd-featured]',
        '[data-rd-ai-opportunity]',
        '[data-rd-filters]',
        '[data-rd-discoveries]',
        '[data-rd-event-timeline]',
        '[data-rd-machine-summary]',
      ]
      const missing = order.filter((sel) => !root.querySelector(sel))
      const overflow = root.scrollWidth > root.clientWidth + 2
      return { ok: missing.length === 0 && !overflow, missing, overflow }
    })

    report.checks[shot.name] = checks

    await page.screenshot({
      path: path.join(OUT, shot.name),
      fullPage: shot.width < 768,
    })
    report.screenshots.push(shot.name)
    await page.close()
    console.log('saved', path.join(OUT, shot.name), checks)
  }

  await browser.close()
  fs.writeFileSync(path.join(OUT, 'validation-report.json'), JSON.stringify(report, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
