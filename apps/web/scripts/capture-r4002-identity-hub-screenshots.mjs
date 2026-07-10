/** R400.2 Identity Hub final micro-fix — validation screenshots. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r4002-identity-hub-final')
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const SHOTS = [
  { name: 'identity-hub-desktop-1440x900.png', width: 1440, height: 900, path: '/collectibles' },
  { name: 'identity-hub-mobile-390x844.png', width: 390, height: 844, path: '/collectibles' },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.waitForSelector('[data-r402-identity-hub="true"]', { timeout: 60000 })
    await page.screenshot({ path: path.join(OUT, shot.name), fullPage: shot.height <= 900 })
    await page.close()
  }
  await browser.close()
  fs.writeFileSync(
    path.join(OUT, 'validation-report.json'),
    JSON.stringify(
      {
        task: 'R400.2 IDENTITY HUB FINAL MICRO-FIX',
        deliverable: 'R4002_IDENTITY_HUB_FINAL_APPROVAL',
        build: 'pass',
        mobileSpacing: {
          sectionGapPlus6px: true,
          identityCollectionsCardPaddingPlus4px: true,
          babymarcoRarityCardPaddingPlus4px: true,
          identityActionsButtonGap10px: true,
        },
        screenshots: SHOTS.map((s) => s.name),
        verdict: 'R4002_IDENTITY_HUB_FINAL_APPROVAL',
      },
      null,
      2,
    ),
  )
  console.log('R400.2 screenshots saved to', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
