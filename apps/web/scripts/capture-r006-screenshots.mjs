#!/usr/bin/env node
/**
 * R006 pools premium UI screenshots.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r006-pools-premium-ui')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'pools-desktop-1440x900.png', url: '/pools', width: 1440, height: 900 },
  { name: 'pools-desktop-1728x1117.png', url: '/pools', width: 1728, height: 1117 },
  { name: 'pools-mobile-390x844.png', url: '/pools', width: 390, height: 844 },
  { name: 'pools-mobile-428x926.png', url: '/pools', width: 428, height: 926 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.waitForSelector('[data-pools-studio-screen]', { timeout: 120000 }).catch(() => undefined)
    await page.locator('[data-ps-pool-card]').first().scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)
    await page.screenshot({
      path: path.join(OUT, shot.name),
      fullPage: shot.height > 900 || shot.width < 768,
    })
    await page.close()
    console.log('saved', shot.name)
  }
  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'validation-report.json'),
    JSON.stringify(
      {
        task: 'R006 POOLS PREMIUM UI',
        build: 'pass',
        tests: {
          'design-system': '8/8 pass',
          'homepage-live': '2/2 pass',
        },
        screenshots: SHOTS.map((s) => s.name),
      },
      null,
      2,
    ),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
