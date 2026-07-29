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
  } catch {
    /* next */
  }
}
if (!chromium) throw new Error('playwright not found')

const OUT = path.dirname(fileURLToPath(import.meta.url))
const SHOTS = path.join(OUT, 'screenshots')
fs.mkdirSync(SHOTS, { recursive: true })
const BASE = (process.env.NEXT_URL || 'http://127.0.0.1:3562').replace(/\/$/, '')

const browser = await chromium.launch({ headless: true })
const shots = []
for (const vp of [
  { n: 'desktop-1440', w: 1440, h: 900 },
  { n: 'tablet-1024', w: 1024, h: 768 },
  { n: 'mobile-390', w: 390, h: 844 },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/liquidity`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(5000)
  const file = `liquidity-${vp.n}.png`
  await page.screenshot({ path: path.join(SHOTS, file), fullPage: false })
  shots.push(file)
  await ctx.close()
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto(`${BASE}/liquidity`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await page.waitForTimeout(5000)
const marco = page.locator('[data-testid="liq-building-card"] button', { hasText: 'MARCO' }).first()
if (await marco.count()) await marco.click().catch(() => {})
const budget = page.locator('[data-testid="lb-budget-input"]')
if (await budget.count()) {
  await budget.fill('10')
  await page.locator('[data-testid="liq-lb-primary"]').click().catch(() => {})
  await page.waitForTimeout(600)
  await page.locator('[data-testid="liq-lb-primary"]').click().catch(() => {})
  await page.waitForTimeout(800)
}
await page.screenshot({ path: path.join(SHOTS, 'builder-activate-blocked-1440.png'), fullPage: false })
const panel = page.locator('[data-testid="lb-deploy-readiness-panel"]')
if (await panel.count()) {
  await panel.screenshot({ path: path.join(SHOTS, 'deploy-readiness-blocked-1440.png') }).catch(() => {})
}
const state = await page.evaluate(() => ({
  primary: document.querySelector('[data-testid="liq-lb-primary"]')?.textContent?.trim() || null,
  readiness: document.querySelector('[data-testid="lb-deploy-readiness-panel"]')?.innerText?.slice(0, 400) || null,
  deploymentReady: document
    .querySelector('[data-testid="lb-deploy-readiness-panel"]')
    ?.getAttribute('data-deployment-ready'),
}))
fs.writeFileSync(
  path.join(OUT, 'responsive-validation.json'),
  JSON.stringify({ capturedAt: new Date().toISOString(), baseUrl: BASE, shots, live: state }, null, 2) + '\n',
)
await browser.close()
console.log(JSON.stringify({ ok: true, count: fs.readdirSync(SHOTS).length, state }, null, 2))
