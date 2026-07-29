#!/usr/bin/env node
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/pw-founder/node_modules/playwright')
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.FOUNDER_BASE || 'http://127.0.0.1:3493'

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
  { name: 'liquidity', path: '/liquidity' },
  { name: 'pools', path: '/pools' },
]

for (const d of ['screenshots/desktop', 'screenshots/tablet', 'screenshots/mobile', 'screenshots/after']) {
  fs.mkdirSync(path.join(OUT, d), { recursive: true })
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
}

const browser = await chromium.launch({ headless: true })
const report = { mission: 'WAVE_03', capturedAt: new Date().toISOString(), base: BASE, overflows: [], scans: {}, responsive: [] }

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  for (const route of PAGES) {
    await page.goto(BASE + route.path, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3500)
    const o = await overflow(page)
    if (o) report.overflows.push(`${route.name}@1440`)
    const scan = await page.evaluate(() => {
      const text = document.body?.innerText || ''
      return {
        scientific: /\d+\.\d+e[+-]?\d+/i.test(text),
        featuredCount: document.querySelectorAll('[data-featured-slug]').length,
        hasInsufficientObs: /Insufficient observations/i.test(text),
        hasWizardTracker: /Continue to Strategy|Continue to Review/i.test(text),
        hasAiPowered: /AI-POWERED/i.test(text),
        hasContractsNotDeployed: /contracts not deployed/i.test(text),
        hasExplore: /Explore Pools/i.test(text),
        hasMyTokensFilter: /My Tokens/i.test(text) && !!document.querySelector('[data-testid="liquidity-pool-discovery-filter-my-tokens"]'),
        hasRewardAdvisor: /Reward Advisor/i.test(text),
        hasViewContract: /View Contract/i.test(text),
        moverItems: document.querySelectorAll('[data-melega-ticker] a, [data-melega-ticker] button').length,
      }
    })
    report.scans[route.name] = { ...scan, overflow: o }
    await page.screenshot({ path: path.join(OUT, 'screenshots/after', `${route.name}-1440.png`), fullPage: false })
    await page.screenshot({ path: path.join(OUT, 'screenshots/desktop', `${route.name}-1440.png`), fullPage: false })
    console.log(route.name, JSON.stringify(report.scans[route.name]))
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
    await p.screenshot({ path: path.join(OUT, `screenshots/${vp.bucket}`, `${route.name}-${vp.name}.png`), fullPage: false })
    report.responsive.push({ page: route.name, viewport: vp.name, overflow: o })
  }
  await c.close()
  console.log('vp', vp.name)
}

await browser.close()
fs.writeFileSync(path.join(OUT, 'responsive-verification.json'), JSON.stringify({
  mission: 'MELEGA_DEX_V1_FOUNDER_REVIEW_HOME_LIQUIDITY_POOLS_REPAIR_WAVE_03',
  overflows: report.overflows,
  status: report.overflows.length === 0 ? 'PASS' : 'FAIL',
  scans: report.scans,
  responsive: report.responsive,
}, null, 2))
fs.writeFileSync(path.join(OUT, 'performance-interaction-audit.json'), JSON.stringify({
  mission: 'MELEGA_DEX_V1_FOUNDER_REVIEW_HOME_LIQUIDITY_POOLS_REPAIR_WAVE_03',
  status: 'CAPTURED_SCANS',
  scans: report.scans,
}, null, 2))
console.log('done', report.overflows.length, 'overflows')
