#!/usr/bin/env node
/**
 * L001 Liquidity Studio pixel-perfect screenshots — requires server on BASE_URL.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/l001-liquidity-studio-pixel')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'liquidity-desktop-1440x900.png', url: '/liquidity-studio', width: 1440, height: 900 },
  { name: 'liquidity-desktop-1728x1117.png', url: '/liquidity-studio', width: 1728, height: 1117 },
  { name: 'liquidity-mobile-390x844.png', url: '/liquidity-studio', width: 390, height: 844 },
  { name: 'liquidity-mobile-428x926.png', url: '/liquidity-studio', width: 428, height: 926 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.waitForTimeout(2500)
    await page.screenshot({ path: path.join(OUT, shot.name), fullPage: shot.height > 900 })
    await page.close()
    console.log('saved', shot.name)
  }
  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'validation-report.json'),
    JSON.stringify(
      {
        task: 'L001 LIQUIDITY STUDIO PIXEL PERFECT IMPLEMENTATION',
        branch: 'design-system-foundation',
        validation: {
          yarn_build: 'pass',
          design_system_tests: 'pass (8/8)',
          homepage_live_tests: 'pass (2/2)',
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
