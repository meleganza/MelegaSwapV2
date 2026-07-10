#!/usr/bin/env node
/**
 * R107 Global UX Visual Fix — full route screenshot matrix.
 * Requires dev server or preview at SCREENSHOT_BASE_URL.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r107-global-ux-visual-fix')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const ROUTES = [
  '/',
  '/trade',
  '/swap',
  '/liquidity-studio',
  '/farms',
  '/pools',
  '/projects',
  '/trending',
  '/radar',
  '/collectibles',
  '/build-studio',
  '/import-existing-token',
  '/command-center',
]

const VIEWPORTS = [
  { tag: '390x844', width: 390, height: 844, mobile: true },
  { tag: '428x926', width: 428, height: 926, mobile: true },
  { tag: '1440x900', width: 1440, height: 900, mobile: false },
  { tag: '1728x1117', width: 1728, height: 1117, mobile: false },
]

function routeSlug(route) {
  if (route === '/') return 'home'
  return route.replace(/^\//, '').replace(/\//g, '-')
}

const SHOTS = []
for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    SHOTS.push({
      name: `${routeSlug(route)}-${vp.tag}.png`,
      url: route,
      width: vp.width,
      height: vp.height,
      fullPage: vp.mobile,
    })
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.waitForTimeout(2500)
    await page.screenshot({
      path: path.join(OUT, shot.name),
      fullPage: shot.fullPage,
    })
    await page.close()
    console.log('saved', shot.name)
  }
  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'validation-report.json'),
    JSON.stringify(
      {
        task: 'R107 GLOBAL UX VISUAL FIX',
        baseUrl: BASE,
        routes: ROUTES,
        viewports: VIEWPORTS.map((v) => v.tag),
        screenshots: SHOTS.map((s) => s.name),
      },
      null,
      2,
    ),
  )
  console.log('done', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
