/** R506 — UX restore screenshots after R505 rollback */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r506-ux-restore')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000'

const ROUTES = [
  { route: '/', key: 'home' },
  { route: '/build-studio', key: 'build-studio', selector: '[data-build-studio-screen]' },
  { route: '/collectibles', key: 'collectibles', selector: '[data-collectibles-studio-screen]' },
  { route: '/command-center', key: 'command-center', selector: '[data-command-center-screen]' },
]

const VIEWPORTS = [
  { tag: 'desktop-1440', width: 1440, height: 900 },
  { tag: 'mobile-390', width: 390, height: 844 },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const results = []

  for (const vp of VIEWPORTS) {
    for (const r of ROUTES) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
      const url = `${BASE}${r.route}`
      let status = 'ok'
      let error = null
      try {
        const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 })
        if (res && res.status() >= 400) status = `http_${res.status()}`
        if (r.selector) {
          await page.waitForSelector(r.selector, { timeout: 60000, state: 'attached' })
        }
        await page.waitForTimeout(2500)
        const file = `${r.key}-${vp.tag}.png`
        await page.screenshot({ path: path.join(OUT, file), fullPage: vp.height > 900 })
        results.push({ route: r.route, viewport: vp.tag, file, status })
      } catch (e) {
        status = 'error'
        error = String(e)
        results.push({ route: r.route, viewport: vp.tag, status, error })
      }
      await page.close()
    }
  }

  await browser.close()
  const manifest = {
    task: 'R506 UX RESTORE',
    capturedAt: new Date().toISOString(),
    base: BASE,
    results,
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(JSON.stringify(manifest, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
