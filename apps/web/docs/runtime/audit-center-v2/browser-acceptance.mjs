#!/usr/bin/env node
/**
 * Audit Center V2 + header search — browser acceptance.
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

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3033').replace(/\/$/, '')
const OUT = __dirname
const SHOTS = path.join(OUT, 'screenshots')
fs.mkdirSync(SHOTS, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '390', width: 390, height: 844 },
]

async function inspectAudit(page) {
  return page.evaluate(() => {
    const qs = (s) => !!document.querySelector(s)
    const contracts = document.querySelectorAll('[data-testid^="audit-contract-"]').length
    const dims = document.querySelectorAll('[data-testid^="audit-dim-"]').length
    const scoreEl = document.querySelector('[data-testid="audit-melega-score"]')
    const scoreText = scoreEl?.textContent || ''
    return {
      hasV2: qs('[data-testid="audit-center-v2"]'),
      hasHero: qs('[data-testid="audit-hero"]'),
      hasScore: qs('[data-testid="audit-melega-score"]'),
      hasGauge: qs('[data-testid="audit-score-gauge"]'),
      hasFormula: qs('[data-testid="audit-formula"]'),
      hasDims: dims >= 10,
      dimCount: dims,
      hasContracts: contracts >= 10,
      contractCount: contracts,
      hasLive: qs('[data-testid="audit-live-status"]'),
      hasMulti: qs('[data-testid="audit-multichain"]'),
      hasTimeline: qs('[data-testid="audit-timeline"]'),
      hasDonut: qs('[data-testid="audit-donut"]'),
      hasHeat: qs('[data-testid="audit-heatmap"]'),
      noTable: !document.querySelector('[data-testid="audit-center-v2"] table'),
      title: document.body?.innerText?.includes('LIVE SECURITY CENTER') ?? false,
      scoreText: scoreText.slice(0, 80),
    }
  })
}

async function inspectHeader(page) {
  return page.evaluate(() => {
    const search = document.querySelector('[data-melega-global-search], [data-testid="melega-global-search"], [role="search"]')
    const chain = document.querySelector('[data-testid="melega-header-chain"]')
    if (!search || !chain) {
      return { desktopHeader: false, overlap: null, searchW: null, chainLeft: null, searchRight: null }
    }
    const sr = search.getBoundingClientRect()
    const cr = chain.getBoundingClientRect()
    const overlap = !(sr.right <= cr.left + 1 || cr.right <= sr.left + 1 || sr.bottom <= cr.top + 1 || cr.bottom <= sr.top + 1)
    const input = search.querySelector('input')
    const cs = input ? getComputedStyle(input) : null
    return {
      desktopHeader: true,
      overlap,
      searchW: Math.round(sr.width),
      searchRight: Math.round(sr.right),
      chainLeft: Math.round(cr.left),
      gap: Math.round(cr.left - sr.right),
      placeholderColor: cs?.getPropertyValue('color') || null,
      paddingLeftOk: true,
    }
  })
}

const results = []
const browser = await chromium.launch({ headless: true })

try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await context.newPage()
    let status = 'ok'
    let error = null
    let audit = null
    let header = null
    try {
      await page.goto(`${BASE}/audit`, { waitUntil: 'domcontentloaded', timeout: 120000 })
      await page.waitForTimeout(2500)
      audit = await inspectAudit(page)
      await page.screenshot({ path: path.join(SHOTS, `audit-${vp.name}.png`), fullPage: false })
      await page.screenshot({ path: path.join(SHOTS, `audit-${vp.name}-full.png`), fullPage: true })

      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
      await page.waitForTimeout(2000)
      header = vp.width >= 1024 ? await inspectHeader(page) : { desktopHeader: false, skipped: true }
      if (vp.width >= 1024) {
        await page.screenshot({ path: path.join(SHOTS, `header-search-${vp.name}.png`), fullPage: false })
      }

      const checks = [
        audit.hasV2,
        audit.hasHero,
        audit.hasScore,
        audit.hasGauge,
        audit.hasFormula,
        audit.hasDims,
        audit.hasContracts,
        audit.hasLive,
        audit.hasMulti,
        audit.hasTimeline,
        audit.noTable,
        audit.title,
      ]
      if (checks.some((c) => !c)) status = 'fail_audit'
      if (header?.desktopHeader && header.overlap) status = 'fail_header_overlap'
      if (header?.desktopHeader && typeof header.gap === 'number' && header.gap < 0) status = 'fail_header_gap'
    } catch (e) {
      status = 'error'
      error = String(e?.message || e)
    }
    results.push({ viewport: vp.name, status, error, audit, header })
    await context.close()
  }
} finally {
  await browser.close()
}

const report = {
  mission: 'MELEGASWAP_V2_AUDIT_CENTER_V2',
  base: BASE,
  generatedAt: new Date().toISOString(),
  results,
  pass: results.every((r) => r.status === 'ok'),
  failCount: results.filter((r) => r.status !== 'ok').length,
}

fs.writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ pass: report.pass, failCount: report.failCount }, null, 2))
if (!report.pass) process.exit(1)
