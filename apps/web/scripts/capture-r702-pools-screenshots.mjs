#!/usr/bin/env node
/**
 * R702 Pools pixel-perfect screenshots.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r702-pools-pixel')
const BEFORE = path.resolve(__dirname, '../../../docs/screenshots/r701-pools-experience')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'pools-desktop-1440-after.png', url: '/pools', width: 1440, height: 900 },
  { name: 'pools-desktop-1728-after.png', url: '/pools', width: 1728, height: 1117 },
  { name: 'pools-mobile-390-after.png', url: '/pools', width: 390, height: 844 },
  { name: 'pools-featured-expanded-after.png', url: '/pools', width: 1440, height: 900, expand: true },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  for (const file of ['pools-desktop-1440x900.png', 'pools-mobile-390x844.png', 'pools-featured-expanded-1440.png']) {
    const src = path.join(BEFORE, file)
    if (fs.existsSync(src)) {
      const dest = path.join(OUT, file.replace('.png', '-before.png').replace('x900', '').replace('x844', ''))
      fs.copyFileSync(src, dest)
    }
  }
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-pools-studio-screen]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForSelector('[data-ps-featured]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForTimeout(3000)
    if (shot.expand) {
      const analyzeBtn = page.locator('[data-ps-featured] button:has-text("Analyze")').first()
      if (await analyzeBtn.count()) await analyzeBtn.click()
      await page.waitForTimeout(500)
      const cardAnalyze = page.locator('[data-ps-pool-card] button:has-text("Analyze")').first()
      if (await cardAnalyze.count()) await cardAnalyze.click()
      await page.waitForTimeout(500)
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
