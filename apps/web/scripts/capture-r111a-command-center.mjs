#!/usr/bin/env node
/** R111-A Command Center canonical screenshots — desktop + mobile only. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r111a-command-center')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000'
const ROUTE = '/command-center'

const VIEWPORTS = [
  { tag: 'desktop-1440', width: 1440, height: 900 },
  { tag: 'mobile-390', width: 390, height: 844 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const results = []

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    const url = `${BASE}${ROUTE}`
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-command-center-screen]', { timeout: 120000, state: 'attached' })
    await page.waitForTimeout(3000)
    const file = path.join(OUT, `command-center-${vp.tag}.png`)
    await page.screenshot({ path: file, fullPage: true })
    results.push({ viewport: vp.tag, file, url })
    await page.close()
  }

  await browser.close()
  const manifest = { capturedAt: new Date().toISOString(), base: BASE, route: ROUTE, results }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(JSON.stringify(manifest, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
