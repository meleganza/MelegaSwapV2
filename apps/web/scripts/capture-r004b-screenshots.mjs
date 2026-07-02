#!/usr/bin/env node
/**
 * R004-B pixel fit fix screenshots — requires server on BASE_URL.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r004b-pixel-fit-fix')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'home-1440x900.png', url: '/', width: 1440, height: 900 },
  { name: 'trade-1440x900.png', url: '/trade', width: 1440, height: 900 },
  { name: 'liquidity-1440x900.png', url: '/liquidity-studio', width: 1440, height: 900 },
  { name: 'liquidity-1728x1117.png', url: '/liquidity-studio', width: 1728, height: 1117 },
  { name: 'liquidity-390x844.png', url: '/liquidity-studio', width: 390, height: 844 },
  { name: 'liquidity-428x926.png', url: '/liquidity-studio', width: 428, height: 926 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.waitForTimeout(2500)
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
        task: 'R004-B PIXEL FIT FIX',
        branch: 'design-system-foundation',
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
