#!/usr/bin/env node
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'r785-screenshots')
const BASE = process.env.R785_BASE || 'https://melega.finance'
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const SHA = process.env.R785_SHA || '2148fb27'

const WIDTHS = [1728, 1440, 1280, 1024, 768, 430, 390, 360]
const ROUTES = [
  ['home', '/'],
  ['trade', '/trade'],
  ['liquidity', '/liquidity'],
  ['pools', '/pools'],
  ['farms', '/farms'],
  ['trending', '/trending'],
  ['projects', '/projects'],
  ['radar', '/radar'],
  ['collectibles', '/collectibles'],
  ['build-studio', '/build-studio'],
  ['status', '/status'],
]

async function healthy(page) {
  const body = await page.locator('body').innerText()
  return !body.includes('Application error') && (await page.locator('text=Oops').count()) === 0
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS },
    viewport: { width: 1440, height: 900 },
  })
  const page = await ctx.newPage()
  const checks = { sha: SHA, base: BASE }

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(10000)
  const homeBody = await page.locator('body').innerText()
  const tickerText = await page.locator('[data-melega-ticker]').innerText().catch(() => '')

  checks.tickerEmptyCopy = tickerText.includes('Market ranking temporarily unavailable')
  checks.tickerNoReasonInStrip = !tickerText.includes('Reason:')
  checks.activeFarmsKpi = /Active Farms/i.test(
    (await page.locator('[data-melega-cinematic-panel]').innerText().catch(() => '')) || homeBody,
  )
  checks.noFakeLatestListing = !homeBody.includes('Latest Listing\nMelega DEX')
  checks.activitySingleEmpty =
    !homeBody.match(/Protocol activity is not yet available[\s\S]*Protocol activity is not yet available/)
  checks.homeHealthy = await healthy(page)
  await page.screenshot({ path: path.join(OUT, '01-home-1440.png'), fullPage: true })

  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 })
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(5000)
    await page.screenshot({ path: path.join(OUT, `02-home-${w}.png`), fullPage: false })
  }

  await page.setViewportSize({ width: 1440, height: 900 })
  for (const [name, route] of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(8000)
    checks[`${name}Healthy`] = await healthy(page)
    await page.screenshot({ path: path.join(OUT, `${name}-1440.png`), fullPage: true })
  }

  await page.goto(`${BASE}/trade`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(8000)
  const tradeBody = await page.locator('body').innerText()
  checks.tradeNoAiMode = !tradeBody.includes('AI Mode')

  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(10000)
  const farmsBody = await page.locator('body').innerText()
  checks.farmsEmission = farmsBody.includes('144') || farmsBody.includes('MARCO')

  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(10000)
  const poolsBody = await page.locator('body').innerText()
  checks.poolsNoZeroApr = !poolsBody.match(/Highest Sustainable APR[\s\S]{0,30}0\s*%/)
  checks.poolsHistoricalHero =
    poolsBody.includes('No active rewarding pools') ||
    poolsBody.includes('Historical pools are listed below under Finished')

  await browser.close()

  const pass = Object.entries(checks)
    .filter(([k]) => k !== 'sha' && k !== 'base')
    .every(([, v]) => v === true)

  const report = { mission: 'R785', sha: SHA, verifiedAt: new Date().toISOString(), checks, pass }
  await writeFile(path.join(OUT, 'r785-production-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(pass ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
