/** R502.1 Import Existing Token input — desktop + mobile screenshots. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r5021-pre-merge-staging')
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const SHOTS = [
  { name: 'import-input-desktop-1440x900.png', width: 1440, height: 900, path: '/import-existing-token' },
  { name: 'import-input-mobile-390x844.png', width: 390, height: 844, path: '/import-existing-token' },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const measurements = []

  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.waitForSelector('[data-iet-contract-input]', { timeout: 60000 })
    const inputBox = await page.locator('[data-iet-contract-input]').boundingBox()
    const heroBox = await page.locator('[data-iet-contract-hero]').boundingBox()
    const available = heroBox ? heroBox.width - 48 : shot.width - 48
    measurements.push({
      shot: shot.name,
      viewport: `${shot.width}x${shot.height}`,
      inputWidth: inputBox?.width ?? 0,
      heroWidth: heroBox?.width ?? 0,
      inputFullWidth:
        shot.width <= 768
          ? Boolean(inputBox && heroBox && inputBox.width >= heroBox.width - 52)
          : Boolean(inputBox && inputBox.width >= 520),
    })
    await page.screenshot({ path: path.join(OUT, shot.name), fullPage: shot.height <= 900 })
    await page.close()
  }

  await browser.close()
  fs.writeFileSync(
    path.join(OUT, 'import-input-measurements.json'),
    JSON.stringify({ measurements, capturedAt: new Date().toISOString() }, null, 2),
  )
  console.log('R502.1 import screenshots saved to', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
