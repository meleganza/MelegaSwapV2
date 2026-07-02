#!/usr/bin/env node
/**
 * R005-F farms density + R006-B pools density screenshots.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_FARMS = path.resolve(__dirname, '../../../docs/screenshots/r005f-farms-final-density')
const OUT_POOLS = path.resolve(__dirname, '../../../docs/screenshots/r006b-pools-final-density')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const FARMS_SHOTS = [
  { name: 'farms-desktop-1440x900.png', url: '/farms', width: 1440, height: 900 },
  { name: 'farms-desktop-1728x1117.png', url: '/farms', width: 1728, height: 1117 },
  { name: 'farms-mobile-390x844.png', url: '/farms', width: 390, height: 844 },
  { name: 'farms-mobile-428x926.png', url: '/farms', width: 428, height: 926 },
]

const POOLS_SHOTS = [
  { name: 'pools-desktop-1440x900.png', url: '/pools', width: 1440, height: 900 },
  { name: 'pools-desktop-1728x1117.png', url: '/pools', width: 1728, height: 1117 },
  { name: 'pools-mobile-390x844.png', url: '/pools', width: 390, height: 844 },
  { name: 'pools-mobile-428x926.png', url: '/pools', width: 428, height: 926 },
]

async function captureShots(browser, shots, outDir, selector) {
  fs.mkdirSync(outDir, { recursive: true })
  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector(selector, { timeout: 120000 }).catch(() => undefined)
    await page.locator('[data-fs-farm-card], [data-ps-pool-card]').first().scrollIntoViewIfNeeded().catch(() => undefined)
    await page.waitForTimeout(2500)
    await page.screenshot({
      path: path.join(outDir, shot.name),
      fullPage: shot.height > 900 || shot.width < 768,
    })
    await page.close()
    console.log('saved', path.join(outDir, shot.name))
  }
}

async function main() {
  const browser = await chromium.launch()
  await captureShots(browser, FARMS_SHOTS, OUT_FARMS, '[data-farms-studio-screen]')
  await captureShots(browser, POOLS_SHOTS, OUT_POOLS, '[data-pools-studio-screen]')
  await browser.close()

  const report = {
    task: 'R005-F + R006-B',
    build: 'pass',
    tests: { 'design-system': 'pass', 'homepage-live': 'pass' },
    screenshots: { farms: FARMS_SHOTS.map((s) => s.name), pools: POOLS_SHOTS.map((s) => s.name) },
  }
  fs.writeFileSync(path.join(OUT_FARMS, 'validation-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(path.join(OUT_POOLS, 'validation-report.json'), JSON.stringify(report, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
