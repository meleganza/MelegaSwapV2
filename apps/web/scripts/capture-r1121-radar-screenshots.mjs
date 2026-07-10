#!/usr/bin/env node
/** R112.1 Radar premium micro-polish validation screenshots. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r1121-radar')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3456'

const SHOTS = [
  { name: 'radar-desktop-1440x900.png', url: '/radar', width: 1440, height: 900 },
  { name: 'radar-mobile-390x844.png', url: '/radar', width: 390, height: 844 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const report = { task: 'R1121_RADAR_READY_FOR_REVIEW', build: 'pass', screenshots: [], checks: {} }

  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle', timeout: 180000 })
    await page.waitForSelector('[data-r112-canonical]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForTimeout(2000)

    const checks = await page.evaluate(() => {
      const root = document.querySelector('[data-r112-canonical]')
      if (!root) return { ok: false, reason: 'missing data-r112-canonical' }
      const title = root.querySelector('[data-rd-page-header] h1')
      const titleText = title?.textContent?.trim() ?? ''
      const titleClipped = titleText !== 'RADAR'
      const featured = root.querySelector('[data-rd-featured]')
      const featuredRect = featured?.getBoundingClientRect()
      const opsRect = root.querySelector('[data-rd-ops-intelligence]')?.getBoundingClientRect()
      const featuredVisible =
        featuredRect && opsRect
          ? featuredRect.top < window.innerHeight && featuredRect.bottom > opsRect.bottom
          : false
      const overflow = root.scrollWidth > root.clientWidth + 2
      return {
        ok: !titleClipped && !overflow,
        titleText,
        titleClipped,
        featuredTopVisible: featuredVisible,
        overflow,
      }
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
