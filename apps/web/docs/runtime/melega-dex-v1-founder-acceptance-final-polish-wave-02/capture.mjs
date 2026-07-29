#!/usr/bin/env node
/**
 * Wave 02 local production-mode capture — responsive + interaction probes.
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/pw-founder/node_modules/playwright')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.FOUNDER_BASE || 'http://127.0.0.1:3492'

const VPS = [
  { name: '1920', w: 1920, h: 1080, bucket: 'desktop' },
  { name: '1600', w: 1600, h: 900, bucket: 'desktop' },
  { name: '1440', w: 1440, h: 900, bucket: 'desktop' },
  { name: '1366', w: 1366, h: 768, bucket: 'desktop' },
  { name: '1024', w: 1024, h: 768, bucket: 'tablet' },
  { name: '768', w: 768, h: 1024, bucket: 'tablet' },
  { name: '430', w: 430, h: 932, bucket: 'mobile' },
  { name: '390', w: 390, h: 844, bucket: 'mobile' },
]

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'swap', path: '/swap' },
  { name: 'liquidity', path: '/liquidity' },
  { name: 'farms', path: '/farms' },
  { name: 'pools', path: '/pools' },
  { name: 'list', path: '/list' },
  { name: 'passport', path: '/passport' },
  { name: 'docs', path: '/docs' },
  { name: 'audit', path: '/audit' },
  { name: 'support', path: '/support' },
]

for (const d of ['screenshots/desktop', 'screenshots/tablet', 'screenshots/mobile', 'screenshots/raw']) {
  fs.mkdirSync(path.join(OUT, d), { recursive: true })
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
}

const browser = await chromium.launch({ headless: true })
const report = {
  mission: 'MELEGA_DEX_V1_FOUNDER_ACCEPTANCE_FINAL_POLISH_WAVE_02',
  capturedAt: new Date().toISOString(),
  base: BASE,
  overflows: [],
  scans: {},
  responsive: [],
  perf: {},
}

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  for (const route of PAGES) {
    const t0 = Date.now()
    await page.goto(BASE + route.path, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3500)
    const navMs = Date.now() - t0
    const o = await overflow(page)
    if (o) report.overflows.push(`${route.name}@1440`)
    const scan = await page.evaluate(() => {
      const text = document.body?.innerText || ''
      return {
        title: document.title,
        hasFooter: !!document.querySelector('[data-testid="melega-global-footer"]'),
        hasTopMovers: /TOP MOVERS|Top Movers/i.test(text),
        hasMarketUnavailable: /Market activity unavailable/i.test(text),
        featuredCount: document.querySelectorAll('[data-featured-slug]').length,
        hasEcosystem: !!document.querySelector('[data-testid="dex-home-ecosystem"]'),
        hasWizard3: /Setup|Strategy|Review/i.test(text),
        hasInsights: /Liquidity Insights/i.test(text),
        hasLiveAiAudit: /LIVE AI-AUDIT/i.test(text),
        hasDocs: /Instant Swap|Smart Swap/i.test(text),
        moverItems: document.querySelectorAll('[data-melega-ticker] a, [data-melega-ticker] button').length,
      }
    })
    report.scans[route.name] = { ...scan, overflow: o, navMs }
    await page.screenshot({
      path: path.join(OUT, 'screenshots/desktop', `${route.name}-1440.png`),
      fullPage: false,
    })
    console.log(route.name, JSON.stringify(report.scans[route.name]))
  }

  // Perf probe: nav click visual response (prefer visible desktop header link)
  try {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(1500)
    const clickT0 = Date.now()
    const farmsLink = page.locator('header a[href="/farms"], [data-melega-shell-main] a[href="/farms"]').first()
    if (await farmsLink.count()) {
      await farmsLink.click({ timeout: 5000 })
      await page.waitForTimeout(50)
      report.perf.navClickVisualMs = Date.now() - clickT0
    } else {
      report.perf.navClickVisualMs = null
      report.perf.navClickNote = 'no visible /farms link'
    }
  } catch (err) {
    report.perf.navClickVisualMs = null
    report.perf.navClickError = String(err?.message || err)
  }
  await ctx.close()
}

for (const vp of VPS) {
  const c = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
  const p = await c.newPage()
  for (const route of PAGES) {
    await p.goto(BASE + route.path, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await p.waitForTimeout(2000)
    const o = await overflow(p)
    if (o) report.overflows.push(`${route.name}@${vp.name}`)
    await p.screenshot({
      path: path.join(OUT, `screenshots/${vp.bucket}`, `${route.name}-${vp.name}.png`),
      fullPage: false,
    })
    report.responsive.push({ page: route.name, viewport: vp.name, overflow: o })
  }
  await c.close()
  console.log('vp', vp.name)
}

await browser.close()

fs.writeFileSync(path.join(OUT, 'capture-raw.json'), JSON.stringify(report, null, 2))
fs.writeFileSync(
  path.join(OUT, 'responsive-verification.json'),
  JSON.stringify(
    {
      mission: 'MELEGA_DEX_V1_FOUNDER_ACCEPTANCE_FINAL_POLISH_WAVE_02',
      capturedAt: report.capturedAt,
      overflows: report.overflows,
      responsiveCount: report.responsive.length,
      status: report.overflows.length === 0 ? 'PASS' : 'FAIL',
      scans: report.scans,
      responsive: report.responsive,
    },
    null,
    2,
  ),
)
fs.writeFileSync(
  path.join(OUT, 'performance-trace.json'),
  JSON.stringify(
    {
      mission: 'MELEGA_DEX_V1_FOUNDER_ACCEPTANCE_FINAL_POLISH_WAVE_02',
      capturedAt: report.capturedAt,
      base: BASE,
      targets: {
        navClickVisualMs: 100,
        tabChangeVisualMs: 100,
        tokenModalOpenMs: 150,
        mainThreadFreezeMs: 200,
      },
      measured: report.perf,
      scansNavMs: Object.fromEntries(Object.entries(report.scans).map(([k, v]) => [k, v.navMs])),
      status: 'MEASURED',
    },
    null,
    2,
  ),
)
fs.writeFileSync(
  path.join(OUT, 'production-mode-smoke.json'),
  JSON.stringify(
    {
      mission: 'MELEGA_DEX_V1_FOUNDER_ACCEPTANCE_FINAL_POLISH_WAVE_02',
      capturedAt: report.capturedAt,
      base: BASE,
      pages: Object.keys(report.scans),
      overflowCount: report.overflows.length,
      status: report.overflows.length === 0 ? 'PASS' : 'FAIL',
      scans: report.scans,
    },
    null,
    2,
  ),
)
console.log('done', report.overflows.length, 'overflows')
