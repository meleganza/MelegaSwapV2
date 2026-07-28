#!/usr/bin/env node
/**
 * MELEGA_DEX_V1_GLOBAL_FOUNDER_ACCEPTANCE_PRE_AUDIT — founder walkthrough capture.
 */
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/pw-founder/node_modules/playwright')
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.FOUNDER_BASE || 'http://127.0.0.1:3491'
const BEFORE_BASE = process.env.FOUNDER_BEFORE_BASE || 'https://www.melega.finance'
const BYPASS = process.env.VERCEL_PROTECTION_BYPASS || ''

const VIEWPORTS = [
  { name: '1920', w: 1920, h: 1080, bucket: 'desktop' },
  { name: '1600', w: 1600, h: 900, bucket: 'desktop' },
  { name: '1440', w: 1440, h: 900, bucket: 'desktop' },
  { name: '1366', w: 1366, h: 768, bucket: 'desktop' },
  { name: '1024', w: 1024, h: 768, bucket: 'tablet' },
  { name: '430', w: 430, h: 932, bucket: 'mobile' },
  { name: '390', w: 390, h: 844, bucket: 'mobile' },
]

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'swap', path: '/trade' },
  { name: 'liquidity', path: '/liquidity' },
  { name: 'farms', path: '/farms' },
  { name: 'pools', path: '/pools' },
  { name: 'list', path: '/list' },
  { name: 'passport', path: '/passport' },
]

for (const d of ['desktop', 'tablet', 'mobile', 'before-after', 'raw']) {
  fs.mkdirSync(path.join(OUT, d), { recursive: true })
}

function withBypass(url) {
  if (!BYPASS || !url.includes('melega.finance')) return url
  const u = new URL(url)
  u.searchParams.set('x-vercel-protection-bypass', BYPASS)
  return u.toString()
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
}

async function scanPage(page, routeName) {
  return page.evaluate((name) => {
    const text = document.body?.innerText || ''
    const ugly = []
    const probes = [
      'Not available',
      'Unavailable',
      'Unknown',
      'Coming soon',
      'TODO',
      'placeholder',
      'lorem ipsum',
      'Future position tools',
      'Indexed Tokens',
    ]
    for (const p of probes) {
      if (new RegExp(p, 'i').test(text)) ugly.push(p)
    }
    const emDashes = (text.match(/—/g) || []).length
    const zeroPct = (text.match(/\b0%/g) || []).length
    return {
      name,
      title: document.title,
      uglyPlaceholders: ugly,
      emDashCount: emDashes,
      zeroPctCount: zeroPct,
      hasInstantSmart: /Instant/i.test(text) && /Smart/i.test(text),
      hasTopMovers: /Top Movers/i.test(text),
      hasFeaturedProjects: /Featured Projects/i.test(text),
      hasEcosystem: /Explore Melega Ecosystem/i.test(text),
      hasFooter: /©|Copyright|Docs|Audit|Support/i.test(text),
      hasConnect: /Connect/i.test(text),
      bodyLen: text.length,
    }
  }, routeName)
}

const report = {
  capturedAt: new Date().toISOString(),
  afterBase: BASE,
  beforeBase: BEFORE_BASE,
  overflows: [],
  pages: {},
  responsive: [],
  beforeAfter: [],
  consoleErrors: {},
}

const browser = await chromium.launch({ headless: true })

// Desktop 1440 full audit of all product pages (AFTER / local polish)
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const errs = []
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(m.text().slice(0, 240))
  })
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 240)))

  for (const route of PAGES) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(4200)
    const o = await overflow(page)
    if (o) report.overflows.push(`${route.name}@1440`)
    const scan = await scanPage(page, route.name)
    report.pages[route.name] = { ...scan, overflow: o }
    await page.screenshot({
      path: path.join(OUT, 'desktop', `${route.name}-1440.png`),
      fullPage: false,
    })
    await page.screenshot({
      path: path.join(OUT, 'raw', `${route.name}-1440-full.png`),
      fullPage: true,
    })
    console.log('after', route.name, JSON.stringify(scan))
  }
  report.consoleErrors.desktop1440 = errs.slice(0, 40)
  await context.close()
}

// Responsive pack (AFTER)
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
  const page = await context.newPage()
  for (const route of PAGES) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2800)
    const o = await overflow(page)
    if (o) report.overflows.push(`${route.name}@${vp.name}`)
    const dest = path.join(OUT, vp.bucket, `${route.name}-${vp.name}.png`)
    await page.screenshot({ path: dest, fullPage: false })
    report.responsive.push({ page: route.name, viewport: vp.name, overflow: o, file: dest.replace(OUT + path.sep, '') })
  }
  await context.close()
  console.log('responsive', vp.name, 'done')
}

// Before/after vs production (home + swap + liquidity)
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  for (const route of [
    { name: 'home', path: '/' },
    { name: 'swap', path: '/trade' },
    { name: 'liquidity', path: '/liquidity' },
  ]) {
    try {
      await page.goto(withBypass(`${BEFORE_BASE}${route.path}`), {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      })
      await page.waitForTimeout(3500)
      const beforePath = path.join(OUT, 'before-after', `${route.name}-before-1440.png`)
      await page.screenshot({ path: beforePath, fullPage: false })
      report.beforeAfter.push({ page: route.name, side: 'before', ok: true })
    } catch (e) {
      report.beforeAfter.push({ page: route.name, side: 'before', ok: false, error: String(e).slice(0, 200) })
    }
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3500)
    const afterPath = path.join(OUT, 'before-after', `${route.name}-after-1440.png`)
    await page.screenshot({ path: afterPath, fullPage: false })
    report.beforeAfter.push({ page: route.name, side: 'after', ok: true })
  }
  await context.close()
}

await browser.close()

fs.writeFileSync(path.join(OUT, 'capture-raw.json'), JSON.stringify(report, null, 2))
console.log(
  JSON.stringify(
    {
      overflows: report.overflows,
      pages: Object.keys(report.pages),
      responsiveCount: report.responsive.length,
      beforeAfter: report.beforeAfter,
    },
    null,
    2,
  ),
)
