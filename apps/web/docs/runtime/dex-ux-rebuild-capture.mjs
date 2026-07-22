/**
 * Melega DEX Complete UX Rebuild — desktop 1440 + mobile 390 evidence.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'dex-complete-ux-rebuild-screenshots')
const BASE = process.env.UX_REBUILD_BASE || 'http://127.0.0.1:3488'

mkdirSync(OUT, { recursive: true })

async function shot(page, folder, name, { fullPage = true } = {}) {
  const dir = join(OUT, folder)
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `${name}.png`)
  await page.screenshot({ path, fullPage })
  console.log('wrote', path)
}

async function goto(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(1200)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

// Desktop 1440
await page.setViewportSize({ width: 1440, height: 1024 })
await goto(page, '/')
await shot(page, 'desktop-1440', '01-home')
// Search focus if present
const search = page.locator('input[placeholder*="Search tokens"]').first()
if (await search.count()) {
  await search.click()
  await search.fill('MARCO')
  await page.waitForTimeout(800)
  await shot(page, 'desktop-1440', '02-home-search', { fullPage: false })
}
await goto(page, '/liquidity-studio')
await shot(page, 'desktop-1440', '03-liquidity-positions')
await goto(page, '/liquidity-studio?view=building')
await shot(page, 'desktop-1440', '04-liquidity-building')
await goto(page, '/farms')
await shot(page, 'desktop-1440', '05-farms')
await goto(page, '/pools')
await shot(page, 'desktop-1440', '06-pools')
await goto(page, '/list')
await shot(page, 'desktop-1440', '07-list-landing')
await goto(page, '/import-existing-token')
await shot(page, 'desktop-1440', '08-list-import-flow')
await goto(page, '/passport')
await shot(page, 'desktop-1440', '09-passport')
await goto(page, '/@marco')
await shot(page, 'desktop-1440', '10-project-page')

// Mobile 390
await page.setViewportSize({ width: 390, height: 844 })
await goto(page, '/')
await shot(page, 'mobile-390', '01-home-top', { fullPage: false })
await page.evaluate(() => window.scrollTo(0, 900))
await page.waitForTimeout(400)
await shot(page, 'mobile-390', '02-home-discovery', { fullPage: false })
await page.evaluate(() => {
  const el = document.getElementById('swap')
  if (el) el.scrollIntoView({ block: 'center' })
})
await page.waitForTimeout(400)
await shot(page, 'mobile-390', '03-swap', { fullPage: false })
await goto(page, '/liquidity-studio')
await shot(page, 'mobile-390', '04-liquidity')
await goto(page, '/farms')
await shot(page, 'mobile-390', '05-farms')
await goto(page, '/pools')
await shot(page, 'mobile-390', '06-pools')
await goto(page, '/list')
await shot(page, 'mobile-390', '07-list')
await goto(page, '/passport')
await shot(page, 'mobile-390', '08-passport')
await goto(page, '/@marco')
await shot(page, 'mobile-390', '09-project-page')

await browser.close()
console.log('UX rebuild screenshots complete')
