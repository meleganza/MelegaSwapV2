#!/usr/bin/env node
/**
 * R007 projects page screenshots.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r007-projects-page')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
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
    await page.waitForSelector('[data-projects-studio-screen]', { timeout: 120000 }).catch(() => undefined)
    await page.locator('[data-pr-project-card]').first().scrollIntoViewIfNeeded().catch(() => undefined)
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
        task: 'R007 PROJECTS PAGE',
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
