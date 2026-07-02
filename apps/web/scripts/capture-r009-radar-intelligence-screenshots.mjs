#!/usr/bin/env node
/**
 * R009 Radar Intelligence Completion screenshots.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r009-radar-intelligence-completion')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'radar-desktop-1440x900.png', url: '/radar', width: 1440, height: 900 },
  { name: 'radar-desktop-1728x1117.png', url: '/radar', width: 1728, height: 1117 },
  { name: 'radar-mobile-390x844.png', url: '/radar', width: 390, height: 844 },
  { name: 'radar-mobile-428x926.png', url: '/radar', width: 428, height: 926 },
  { name: 'radar-contract-intel-desktop-1440x900.png', url: '/radar', width: 1440, height: 900, openIntel: true },
  { name: 'radar-contract-intel-mobile-390x844.png', url: '/radar', width: 390, height: 844, openIntel: true },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-radar-studio-screen]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForSelector('[data-rd-contract-intel-input]', { timeout: 120000 }).catch(() => undefined)
    if (shot.openIntel) {
      await page.locator('button:has-text("Run Free Preview")').first().click({ timeout: 10000 })
      await page.waitForSelector('[data-rd-contract-intel-modal]', { timeout: 10000 }).catch(() => undefined)
      await page.waitForTimeout(1200)
    } else {
      await page.waitForTimeout(3000)
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
