#!/usr/bin/env node
/**
 * Premium Modal System V3 — browser acceptance.
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

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3034').replace(/\/$/, '')
const OUT = __dirname
const SHOTS = path.join(OUT, 'screenshots')
fs.mkdirSync(SHOTS, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '390', width: 390, height: 844 },
]

async function measureModal(page) {
  return page.evaluate(() => {
    const overlay = document.querySelector('[data-melega-modal-overlay="true"]')
    const modal = document.querySelector('[data-melega-modal="true"]')
    if (!modal) return { open: false }
    const r = modal.getBoundingClientRect()
    const titles = [...modal.querySelectorAll('[data-melega-modal-title]')]
      .map((el) => (el.textContent || '').trim())
      .filter(Boolean)
    const vh = window.innerHeight
    const vw = window.innerWidth
    return {
      open: true,
      system: modal.getAttribute('data-melega-modal-system'),
      titles,
      titleCount: titles.length,
      brand: !!modal.querySelector('[data-melega-modal-brand="true"]'),
      close: !!modal.querySelector('[data-melega-modal-close]'),
      footer: !!modal.querySelector('[data-melega-modal-footer]'),
      width: Math.round(r.width),
      height: Math.round(r.height),
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      withinViewport: r.top >= -4 && r.bottom <= vh + 4 && r.left >= -4 && r.right <= vw + 4,
      maxHeightOk: r.height <= Math.min(vh * 0.92, 780),
      widthBandOk: r.width >= 280 && r.width <= 780,
      overlayPresent: !!overlay,
      bodyOverflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
      textSample: (modal.innerText || '').slice(0, 280),
    }
  })
}

const results = []
const browser = await chromium.launch({ headless: true })

try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await context.newPage()

    // Create Farm
    await page.goto(`${BASE}/farms?create=1`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2200)
    let farm = await measureModal(page)
    await page.screenshot({ path: path.join(SHOTS, `create-farm-${vp.name}.png`) })
    // try advance accordion
    const farmStep2 = page.locator('[data-testid="create-farm-acc-reward-trigger"]').first()
    if ((await farmStep2.count()) > 0) {
      await farmStep2.click().catch(() => {})
      await page.waitForTimeout(400)
      await page.screenshot({ path: path.join(SHOTS, `create-farm-step2-${vp.name}.png`) })
    }

    // Create Pool
    await page.goto(`${BASE}/pools?create=1`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2200)
    let pool = await measureModal(page)
    await page.screenshot({ path: path.join(SHOTS, `create-pool-${vp.name}.png`) })
    const poolStep2 = page.locator('[data-testid="create-pool-acc-2-trigger"]').first()
    if ((await poolStep2.count()) > 0) {
      await poolStep2.click().catch(() => {})
      await page.waitForTimeout(400)
      await page.screenshot({ path: path.join(SHOTS, `create-pool-step2-${vp.name}.png`) })
    }

    // Network switch (desktop header only)
    let network = { open: false, skipped: vp.width < 1024 }
    if (vp.width >= 1024) {
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
      await page.waitForTimeout(1800)
      const chain = page.locator('[data-testid="melega-header-chain"]').first()
      if ((await chain.count()) > 0) {
        await chain.click().catch(() => {})
        await page.waitForTimeout(800)
      }
      network = await measureModal(page)
      await page.screenshot({ path: path.join(SHOTS, `network-switch-${vp.name}.png`) })
    }

    const checks = []
    for (const m of [farm, pool]) {
      checks.push(m.open, m.system === 'v3', m.titleCount === 1, m.brand, m.close, m.withinViewport, m.maxHeightOk, m.widthBandOk, !m.bodyOverflowX)
    }
    if (network.open) {
      checks.push(network.system === 'v3', network.withinViewport, network.widthBandOk)
    }

    results.push({
      viewport: vp.name,
      status: checks.every(Boolean) ? 'ok' : 'fail',
      farm,
      pool,
      network,
    })
    await context.close()
  }
} finally {
  await browser.close()
}

const report = {
  mission: 'MELEGASWAP_V2_PREMIUM_MODAL_SYSTEM_V3',
  base: BASE,
  generatedAt: new Date().toISOString(),
  results,
  pass: results.every((r) => r.status === 'ok'),
  failCount: results.filter((r) => r.status !== 'ok').length,
}
fs.writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ pass: report.pass, failCount: report.failCount }, null, 2))
if (!report.pass) process.exit(1)
