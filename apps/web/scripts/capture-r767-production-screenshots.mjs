#!/usr/bin/env node
/** R767 — Production screenshot evidence (founder gates). */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/runtime/screenshots/r767')
const BASE = process.env.SCREENSHOT_BASE_URL || 'https://melega-swap-v2-web.vercel.app'

const SHOTS = [
  { id: '01-homepage-header-socials', url: '/', width: 1440, height: 900, clip: { x: 0, y: 0, width: 1440, height: 120 } },
  { id: '02-homepage-build-with-melega', url: '/', width: 1440, height: 900 },
  { id: '03-homepage-top-farm-pool', url: '/', width: 1440, height: 900 },
  { id: '04-homepage-market-pulse', url: '/', width: 1440, height: 900 },
  { id: '05-homepage-live-activity', url: '/', width: 1440, height: 900 },
  { id: '06-sidebar-build-section', url: '/', width: 1440, height: 900 },
  { id: '07-trade-amount-inputs', url: '/trade', width: 1440, height: 900 },
  { id: '08-trade-chart', url: '/trade', width: 1440, height: 900 },
  { id: '09-trade-pair-statistics', url: '/trade', width: 1440, height: 900 },
  { id: '10-trade-recent-swaps', url: '/trade', width: 1440, height: 900 },
  { id: '11-trade-route-finite', url: '/trade', width: 1440, height: 900 },
  { id: '12-liquidity-position-preview', url: '/liquidity-studio', width: 1440, height: 900 },
  { id: '13-liquidity-intelligence-panels', url: '/liquidity-studio', width: 1440, height: 900 },
  { id: '14-pools-discovery', url: '/pools', width: 1440, height: 900 },
  { id: '15-farms-discovery', url: '/farms', width: 1440, height: 900 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.waitForTimeout(4000)
    const file = path.join(OUT, `${shot.id}.png`)
    if (shot.clip) {
      await page.screenshot({ path: file, clip: shot.clip })
    } else {
      await page.screenshot({ path: file, fullPage: false })
    }
    console.log('wrote', file)
    await page.close()
  }
  await browser.close()
  fs.writeFileSync(
    path.join(OUT, 'manifest.json'),
    JSON.stringify({ baseUrl: BASE, capturedAt: new Date().toISOString(), shots: SHOTS.map((s) => s.id) }, null, 2),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
