#!/usr/bin/env node
/**
 * Project Page V3 — browser acceptance (5 slugs × 1440 / 1024 / 390).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

let chromium
try {
  ;({ chromium } = require('playwright'))
} catch {
  ;({ chromium } = require('/tmp/node_modules/playwright'))
}

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3030').replace(/\/$/, '')
const OUT = __dirname
const SHOTS = path.join(OUT, 'screenshots')
const SLUGS = ['marco', 'mm72', 'eyed', 'blion', 'young-degens']
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '390', width: 390, height: 844 },
]

fs.mkdirSync(SHOTS, { recursive: true })

async function inspect(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="project-page-v3"]')
    const qs = (sel) => !!document.querySelector(sel)
    const hero = document.querySelector('[data-testid="project-v3-hero"]')
    const right = document.querySelector('[data-testid="project-v3-hero-right"]')
    const swap = document.querySelector('[data-testid="project-v3-swap"]')
    const chart = document.querySelector('[data-testid="project-v3-chart"]')
    const strip = document.querySelector('[data-testid="project-v3-market"]')
    const grow = document.querySelector('[data-testid="project-v3-grow"]')
    const transparency = document.querySelector('[data-testid="project-v3-transparency"] details')
    const heroRect = hero?.getBoundingClientRect()
    const rightRect = right?.getBoundingClientRect()
    const actions = document.querySelector('[data-testid="project-v3-actions"]')
    const actionsRect = actions?.getBoundingClientRect()
    const buy = document.querySelector('[data-testid="project-v3-buy"]')
    const buyRect = buy?.getBoundingClientRect()
    return {
      hasV3: !!root,
      hasHero: qs('[data-testid="project-v3-hero"]'),
      hasChart: !!chart,
      hasSwap: !!swap,
      hasStrip: !!strip,
      hasActions: qs('[data-testid="project-v3-actions"]'),
      hasBuy: qs('[data-testid="project-v3-buy"]'),
      hasTrade: qs('[data-testid="project-v3-trade"]'),
      hasEconomy: qs('[data-testid="project-v3-economy"]'),
      growCards: document.querySelectorAll('[data-testid^="project-v3-grow-"]').length,
      hasClaim: qs('[data-testid="project-v3-claim"]'),
      hasTransparency: !!transparency,
      transparencyOpen: transparency ? transparency.open === true : null,
      noDeveloper: !document.querySelector('[data-project-section="developer"]'),
      noMachine: !document.querySelector('[data-project-section="machine"]'),
      heroTop: heroRect ? Math.round(heroRect.top) : null,
      chartInHero: !!(right && chart && right.contains(chart)),
      swapInHero: !!(right && swap && right.contains(swap)),
      viewportH: window.innerHeight,
      rightBottom: rightRect ? Math.round(rightRect.bottom) : null,
      actionsBottom: actionsRect ? Math.round(actionsRect.bottom) : null,
      buyTop: buyRect ? Math.round(buyRect.top) : null,
      chartVisible: chart ? chart.getBoundingClientRect().top < window.innerHeight : false,
      buyVisible: buy ? buy.getBoundingClientRect().top < window.innerHeight : false,
    }
  })
}

const results = []
const browser = await chromium.launch({ headless: true })

try {
  for (const slug of SLUGS) {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      })
      const page = await context.newPage()
      const url = `${BASE}/project-hq/${slug}`
      let status = 'ok'
      let error = null
      let data = null
      try {
        const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 })
        if (!res || res.status() >= 400) status = `http_${res?.status()}`
        await page.waitForTimeout(2800)
        data = await inspect(page)
        const shot = path.join(SHOTS, `${slug}-${vp.name}.png`)
        await page.screenshot({ path: shot, fullPage: false })
        const checks = [
          data.hasV3,
          data.hasHero,
          data.hasChart,
          data.hasSwap,
          data.hasStrip,
          data.hasActions,
          data.hasBuy,
          data.hasTrade,
          data.hasEconomy,
          data.growCards === 5,
          data.hasClaim,
          data.hasTransparency,
          data.transparencyOpen === false,
          data.noDeveloper,
          data.noMachine,
          data.chartInHero,
          data.swapInHero,
        ]
        if (checks.some((c) => !c)) status = 'fail_checks'
  // Desktop: chart + swap start + strip + buy actions should fit without a long scroll
        if (vp.width >= 1024 && data.actionsBottom != null && data.actionsBottom > data.viewportH + 160) {
          status = status === 'ok' ? 'warn_fold' : status
        }
      } catch (e) {
        status = 'error'
        error = String(e?.message || e)
      }
      results.push({ slug, viewport: vp.name, url, status, error, data })
      await context.close()
    }
  }
} finally {
  await browser.close()
}

const report = {
  mission: 'MELEGASWAP_V2_PROJECT_PAGE_V3_PREMIUM_CONVERSION',
  base: BASE,
  generatedAt: new Date().toISOString(),
  results,
  pass: results.every((r) => r.status === 'ok' || r.status === 'warn_fold'),
  warnCount: results.filter((r) => r.status === 'warn_fold').length,
  failCount: results.filter((r) => r.status !== 'ok' && r.status !== 'warn_fold').length,
}

fs.writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ pass: report.pass, failCount: report.failCount, warnCount: report.warnCount }, null, 2))
if (!report.pass) process.exit(1)
