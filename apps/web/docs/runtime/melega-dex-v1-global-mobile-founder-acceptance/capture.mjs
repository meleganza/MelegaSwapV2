#!/usr/bin/env node
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
let chromium
for (const p of [
  '/tmp/lb-pixel002-cert/node_modules/playwright',
  '/tmp/melega-wallet-cert/node_modules/playwright',
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../node_modules/playwright'),
]) {
  try {
    ;({ chromium } = require(p))
    break
  } catch {}
}
if (!chromium) throw new Error('playwright not found')

const OUT = path.dirname(fileURLToPath(import.meta.url))
const AFTER = path.join(OUT, 'screenshots', 'after')
fs.mkdirSync(AFTER, { recursive: true })
const BASE = (process.env.NEXT_URL || 'http://127.0.0.1:3563').replace(/\/$/, '')

const VIEWPORTS = [
  { n: '430', w: 430, h: 932 },
  { n: '390', w: 390, h: 844 },
  { n: '360', w: 360, h: 800 },
  { n: '768', w: 768, h: 1024 },
  { n: '1440', w: 1440, h: 900 },
]

const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'liquidity', path: '/liquidity' },
  { id: 'farms', path: '/farms' },
  { id: 'pools', path: '/pools' },
  { id: 'passport', path: '/passport' },
  { id: 'list', path: '/list' },
]

async function audit(page) {
  return page.evaluate(() => {
    const broken = [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).length
    const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    const insights = getComputedStyle(document.querySelector('[data-testid="liquidity-insights-grid"]') || document.body)
    const fab = document.querySelector('[data-testid="scroll-to-top-fab"]')
    const art = document.querySelector('[data-testid="farms-hero-artwork"]')
    const imgs = art ? [...art.querySelectorAll('img')].map((i) => ({ src: i.getAttribute('src'), ok: i.naturalWidth > 0 })) : []
    return {
      title: document.title,
      overflowX,
      brokenImages: broken,
      farmsLogoSources: imgs,
      insightsCols: insights.gridTemplateColumns || null,
      fabPresent: !!fab,
    }
  })
}

const browser = await chromium.launch({ headless: true })
const results = []

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    if (vp.n === '1440' && route.id !== 'home' && route.id !== 'liquidity' && route.id !== 'farms') continue
    if ((vp.n === '768' || vp.n === '360') && !['home', 'liquidity', 'farms'].includes(route.id)) continue
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
    const page = await ctx.newPage()
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(4500)
    const state = await audit(page)
    const file = `${route.id}-${vp.n}.png`
    await page.screenshot({ path: path.join(AFTER, file), fullPage: false })
    results.push({ viewport: vp.n, route: route.id, file, ...state })
    await ctx.close()
  }
}

// wallet modal on 390
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(3000)
  const connect = page.locator('button:has-text("Connect"), a:has-text("Connect")').first()
  if (await connect.count()) {
    await connect.click().catch(() => {})
    await page.waitForTimeout(1200)
    await page.screenshot({ path: path.join(AFTER, 'wallet-modal-390.png'), fullPage: false })
  }
  await ctx.close()
}

const summary = {
  capturedAt: new Date().toISOString(),
  baseUrl: BASE,
  results,
  checks: {
    noPageOverflow: results.every((r) => !r.overflowX),
    farmsLocalLogos: results
      .filter((r) => r.route === 'farms')
      .every((r) => (r.farmsLogoSources || []).every((i) => !i.src || i.src.includes('/images/56/tokens/') || i.ok !== false)),
    insightsTwoColAt390: (() => {
      const r = results.find((x) => x.route === 'liquidity' && x.viewport === '390')
      return r?.insightsCols ? r.insightsCols.split(' ').filter(Boolean).length >= 2 : null
    })(),
  },
}
fs.writeFileSync(path.join(OUT, 'responsive-verification.json'), JSON.stringify(summary, null, 2) + '\n')
await browser.close()
console.log(JSON.stringify({ ok: true, shots: fs.readdirSync(AFTER).length, checks: summary.checks }, null, 2))
