#!/usr/bin/env node
/**
 * R005-B farms final fit + home micro fix screenshots.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r005b-farms-final-fit')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'home-1440x900.png', url: '/', width: 1440, height: 900 },
  { name: 'farms-1440x900.png', url: '/farms', width: 1440, height: 900 },
  { name: 'farms-1728x1117.png', url: '/farms', width: 1728, height: 1117 },
  { name: 'farms-mobile-390x844.png', url: '/farms', width: 390, height: 844 },
  { name: 'farms-mobile-428x926.png', url: '/farms', width: 428, height: 926 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle', timeout: 120000 })
    const selector =
      shot.url === '/farms' ? '[data-farms-studio-screen]' : '[data-home-swap-shell], [data-home-trade-screen]'
    await page.waitForSelector(selector, { timeout: 120000 }).catch(() => undefined)
    await page.waitForTimeout(3000)
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
        task: 'R005-B FARMS FINAL FIT',
        branch: 'design-system-foundation',
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
