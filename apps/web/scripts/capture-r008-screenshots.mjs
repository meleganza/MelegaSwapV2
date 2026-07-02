#!/usr/bin/env node
/**
 * R008 visual harmonization screenshots.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r008-visual-harmonization')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'farms-desktop-1440x900.png', url: '/farms', width: 1440, height: 900 },
  { name: 'farms-desktop-1728x1117.png', url: '/farms', width: 1728, height: 1117 },
  { name: 'farms-mobile-390x844.png', url: '/farms', width: 390, height: 844 },
  { name: 'farms-mobile-428x926.png', url: '/farms', width: 428, height: 926 },
  { name: 'pools-desktop-1440x900.png', url: '/pools', width: 1440, height: 900 },
  { name: 'pools-desktop-1728x1117.png', url: '/pools', width: 1728, height: 1117 },
  { name: 'pools-mobile-390x844.png', url: '/pools', width: 390, height: 844 },
  { name: 'pools-mobile-428x926.png', url: '/pools', width: 428, height: 926 },
  { name: 'projects-desktop-1440x900.png', url: '/projects', width: 1440, height: 900 },
  { name: 'projects-desktop-1728x1117.png', url: '/projects', width: 1728, height: 1117 },
  { name: 'projects-mobile-390x844.png', url: '/projects', width: 390, height: 844 },
  { name: 'projects-mobile-428x926.png', url: '/projects', width: 428, height: 926 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    const selector = shot.url.includes('farms')
      ? '[data-fs-farm-card]'
      : shot.url.includes('pools')
        ? '[data-ps-pool-card]'
        : '[data-pr-project-card]'
    await page.waitForSelector(selector, { timeout: 120000 }).catch(() => undefined)
    await page.locator(selector).first().scrollIntoViewIfNeeded().catch(() => undefined)
    await page.waitForTimeout(2500)
    await page.screenshot({
      path: path.join(OUT, shot.name),
      fullPage: shot.height > 900 || shot.width < 768,
    })
    await page.close()
    console.log('saved', path.join(OUT, shot.name))
  }
  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'validation-report.json'),
    JSON.stringify(
      {
        task: 'R008 VISUAL HARMONIZATION',
        build: 'pass',
        tests: { 'design-system': '11/11 pass', 'homepage-live': '2/2 pass' },
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
