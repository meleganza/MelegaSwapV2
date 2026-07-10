#!/usr/bin/env node
/** R769 — Production screenshot evidence after environment activation. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/runtime/screenshots/r769')
const BASE = process.env.SCREENSHOT_BASE_URL || 'https://melega-swap-v2-web.vercel.app'

const SHOTS = [
  { id: '01-homepage-live-activity', url: '/', width: 1440, height: 900 },
  { id: '02-homepage-earn-opportunities', url: '/', width: 1440, height: 900 },
  { id: '03-trade-chart', url: '/trade', width: 1440, height: 900 },
  { id: '04-trade-recent-swaps', url: '/trade', width: 1440, height: 900 },
  { id: '05-pools-discovery', url: '/pools', width: 1440, height: 900 },
  { id: '06-farms-discovery', url: '/farms', width: 1440, height: 900 },
  { id: '07-liquidity-top-pools', url: '/liquidity-studio', width: 1440, height: 900 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(8000)
    const file = path.join(OUT, `${shot.id}.png`)
    await page.screenshot({ path: file, fullPage: false })
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
