#!/usr/bin/env node
/** R200 premium consistency validation screenshots. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r200-premium-consistency')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3456'

const PAGES = [
  { slug: 'overview', url: '/', desktop: 'overview-desktop-1440x900.png', mobile: 'overview-mobile-390x844.png' },
  { slug: 'trade', url: '/trade', desktop: 'trade-desktop-1440x900.png', mobile: 'trade-mobile-390x844.png' },
  { slug: 'liquidity', url: '/liquidity-studio', desktop: 'liquidity-desktop-1440x900.png', mobile: 'liquidity-mobile-390x844.png' },
  { slug: 'farms', url: '/farms', desktop: 'farms-desktop-1440x900.png', mobile: 'farms-mobile-390x844.png' },
  { slug: 'pools', url: '/pools', desktop: 'pools-desktop-1440x900.png', mobile: 'pools-mobile-390x844.png' },
  { slug: 'trending', url: '/trending', desktop: 'trending-desktop-1440x900.png', mobile: 'trending-mobile-390x844.png' },
  { slug: 'build', url: '/build-studio', desktop: 'build-desktop-1440x900.png', mobile: 'build-mobile-390x844.png' },
  { slug: 'collectibles', url: '/collectibles', desktop: 'collectibles-desktop-1440x900.png', mobile: 'collectibles-mobile-390x844.png' },
  { slug: 'import', url: '/import-existing-token', desktop: 'import-desktop-1440x900.png', mobile: 'import-mobile-390x844.png' },
]

const SHOTS = PAGES.flatMap((page) => [
  { name: page.desktop, url: page.url, width: 1440, height: 900, slug: page.slug },
  { name: page.mobile, url: page.url, width: 390, height: 844, slug: page.slug },
])

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const report = {
    task: 'R200_PREMIUM_CONSISTENCY_REVIEW',
    build: 'pending',
    screenshots: [],
    checks: {},
  }

  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE}${shot.url}`, { waitUntil: 'load', timeout: 120000 })
    await page.waitForSelector('[data-r200-premium]', { timeout: 90000 }).catch(() => undefined)
    await page.waitForTimeout(2500)

    const checks = await page.evaluate(() => {
      const root = document.querySelector('[data-r200-premium]')
      if (!root) return { ok: false, reason: 'missing data-r200-premium' }
      const overflow = root.scrollWidth > root.clientWidth + 2
      const unavailableDom = Array.from(root.querySelectorAll('*'))
        .filter((el) => el.children.length === 0)
        .some((el) => (el.textContent || '').trim() === 'Unavailable')
      return { ok: !overflow, overflow, unavailableDom }
    })

    report.checks[shot.name] = checks

    await page.screenshot({
      path: path.join(OUT, shot.name),
      fullPage: shot.width < 768,
    })
    report.screenshots.push(shot.name)
    await page.close()
    console.log('saved', path.join(OUT, shot.name), checks)
  }

  await browser.close()
  fs.writeFileSync(path.join(OUT, 'validation-report.json'), JSON.stringify(report, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
