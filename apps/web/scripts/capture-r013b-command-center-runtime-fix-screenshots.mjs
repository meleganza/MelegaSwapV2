#!/usr/bin/env node
/** R013-B Command Center runtime fix screenshots */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r013b-command-center-runtime-fix')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const SHOTS = [
  { name: 'command-center-desktop-1440x900.png', url: '/command-center', width: 1440, height: 900 },
  { name: 'command-center-desktop-1728x1117.png', url: '/command-center', width: 1728, height: 1117 },
  { name: 'command-center-mobile-390x844.png', url: '/command-center', width: 390, height: 844 },
  { name: 'command-center-mobile-428x926.png', url: '/command-center', width: 428, height: 926 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const report = { screenshots: [], checks: {}, errors: [] }

  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    page.on('pageerror', (e) => report.errors.push({ shot: shot.name, message: e.message }))
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-command-center-screen]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForTimeout(3000)
    const oops = await page.getByText('Oops, something wrong.').count()
    report.checks[shot.name] = { oops, hasScreen: (await page.locator('[data-command-center-screen]').count()) > 0 }
    await page.screenshot({
      path: path.join(OUT, shot.name),
      fullPage: shot.height > 900 || shot.width < 768,
    })
    await page.close()
    report.screenshots.push(shot.name)
    console.log('saved', path.join(OUT, shot.name))
  }

  fs.writeFileSync(path.join(OUT, 'validation-report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
