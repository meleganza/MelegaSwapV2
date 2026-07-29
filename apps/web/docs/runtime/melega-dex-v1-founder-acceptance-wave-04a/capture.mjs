#!/usr/bin/env node
/**
 * Wave 04A local capture — Home / List / Project only.
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
let chromium
try {
  ;({ chromium } = require('playwright'))
} catch {
  ;({ chromium } = require('/tmp/pw-founder/node_modules/playwright'))
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.FOUNDER_BASE || 'http://127.0.0.1:3494'

const VPS = [
  { name: '1440', w: 1440, h: 900, bucket: 'desktop' },
  { name: '1024', w: 1024, h: 768, bucket: 'tablet' },
  { name: '390', w: 390, h: 844, bucket: 'mobile' },
]

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'list', path: '/list' },
  { name: 'project-mm72', path: '/@mm72' },
]

for (const d of ['screenshots/desktop', 'screenshots/tablet', 'screenshots/mobile']) {
  fs.mkdirSync(path.join(OUT, d), { recursive: true })
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
}

const browser = await chromium.launch({ headless: true })
const report = {
  mission: 'MELEGA_DEX_V1_FOUNDER_ACCEPTANCE_WAVE_04A_HOME_AND_PRODUCT_PAGES',
  capturedAt: new Date().toISOString(),
  base: BASE,
  overflows: [],
  scans: {},
  responsive: [],
}

for (const vp of VPS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
  const page = await ctx.newPage()
  for (const route of PAGES) {
    await page.goto(BASE + route.path, { waitUntil: 'domcontentloaded', timeout: 120000 })
    // Allow CoinGecko + indexer SWR to settle (free-tier CG is slow under sequential viewports).
    await page.waitForTimeout(route.name === 'home' ? 7000 : 3500)
    const o = await overflow(page)
    if (o) report.overflows.push(`${route.name}@${vp.name}`)
    const scan = await page.evaluate(() => {
      const text = document.body?.innerText || ''
      const featured = [...document.querySelectorAll('[data-featured-slug]')].map((el) => ({
        slug: el.getAttribute('data-featured-slug'),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 180),
      }))
      const stickyNav = document.querySelector('[data-ux-rebuild-project-nav]')
      const heroOrbit = document.querySelector('[data-list-hero-variant="melega-orbit"]')
      const heroStats = document.querySelector('[data-testid="list-hero-stats"]')
      const how = document.querySelector('[data-list-how="compact"]')
      const bridge = document.querySelector('[data-testid="list-workflow-bridge"]')
      const movers = [...document.querySelectorAll('[data-melega-ticker] a, [data-melega-ticker] [data-ticker-item]')].map(
        (el) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      )
      return {
        title: document.title,
        featuredCount: featured.length,
        featured,
        hasScientific: /e[+-]?\d+/i.test(text) && /4\.?\d*e-?\d+/i.test(text),
        stickyNavPresent: !!stickyNav,
        projectNavNone: document.querySelector('[data-project-nav="none"]') != null,
        heroOrbit: !!heroOrbit,
        heroStatsRemoved: !heroStats,
        howCompact: !!how,
        workflowBridge: !!bridge,
        moverLabels: movers.slice(0, 12),
        hasYellowFeaturedBorder: [...document.querySelectorAll('[data-featured-slug]')].some((el) => {
          const b = getComputedStyle(el).borderColor
          return /244,\s*196,\s*48|221,\s*185,\s*47|255,\s*215,\s*0/i.test(b) && getComputedStyle(el).borderWidth !== '0px'
        }),
      }
    })
    const key = `${route.name}@${vp.name}`
    report.scans[key] = { ...scan, overflow: o, bucket: vp.bucket }
    report.responsive.push({ route: route.name, vp: vp.name, overflow: o })
    await page.screenshot({
      path: path.join(OUT, `screenshots/${vp.bucket}`, `${route.name}-${vp.name}.png`),
      fullPage: false,
    })
    console.log(key, JSON.stringify(scan))
  }
  await ctx.close()
}

fs.writeFileSync(path.join(OUT, 'responsive-verification.json'), JSON.stringify(report, null, 2))
console.log('overflows', report.overflows)
await browser.close()
