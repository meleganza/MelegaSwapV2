#!/usr/bin/env node
/**
 * R010-C Collectibles Civilization Identity Freeze screenshots.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r010c-collectibles-civilization-identity-freeze')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'collectibles-desktop-1440x900.png', url: '/collectibles', width: 1440, height: 900 },
  { name: 'collectibles-desktop-1728x1117.png', url: '/collectibles', width: 1728, height: 1117 },
  { name: 'collectibles-mobile-390x844.png', url: '/collectibles', width: 390, height: 844 },
  { name: 'collectibles-mobile-428x926.png', url: '/collectibles', width: 428, height: 926 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-collectibles-studio-screen]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForSelector('[data-cs-featured-row]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForSelector('[data-cs-privileges]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForSelector('[data-cs-grid]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForTimeout(3000)
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
