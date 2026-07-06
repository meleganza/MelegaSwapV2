#!/usr/bin/env node
/**
 * R701 Pools Experience Redesign screenshots.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r701-pools-experience')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'pools-desktop-1440x900.png', url: '/pools', width: 1440, height: 900 },
  { name: 'pools-desktop-1728x1117.png', url: '/pools', width: 1728, height: 1117 },
  { name: 'pools-mobile-390x844.png', url: '/pools', width: 390, height: 844 },
  { name: 'pools-featured-expanded-1440.png', url: '/pools', width: 1440, height: 900, expand: true },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-pools-studio-screen]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForSelector('[data-ps-featured]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForSelector('[data-ps-pool-grid]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForTimeout(3000)
    if (shot.expand) {
      const analyzeBtn = page.locator('[data-ps-featured] button:has-text("Analyze")').first()
      if (await analyzeBtn.count()) {
        await analyzeBtn.click()
        await page.waitForTimeout(500)
      }
      const cardAnalyze = page.locator('[data-ps-pool-card] button:has-text("Analyze")').first()
      if (await cardAnalyze.count()) {
        await cardAnalyze.click()
        await page.waitForTimeout(500)
      }
    }
    await page.screenshot({
      path: path.join(OUT, shot.name),
      fullPage: shot.height > 900 || shot.width < 768,
    })
    await page.close()
    console.log('saved', path.join(OUT, shot.name))
  }
  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
