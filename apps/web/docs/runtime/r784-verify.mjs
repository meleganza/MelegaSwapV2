#!/usr/bin/env node
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'r784-screenshots')
const BASE = process.env.R784_BASE || 'https://melega.finance'
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const SHA = process.env.R784_SHA || 'f98d06c1'

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/trade', name: 'trade' },
  { path: '/liquidity', name: 'liquidity' },
  { path: '/pools', name: 'pools' },
  { path: '/farms', name: 'farms' },
  { path: '/projects', name: 'projects' },
  { path: '/radar', name: 'radar' },
  { path: '/collectibles', name: 'collectibles' },
  { path: '/build-studio', name: 'build-studio' },
]

const WIDTHS = [1728, 1440, 1024, 768, 430, 390, 360]

async function healthy(page) {
  const oops = await page.locator('text=Oops').count()
  const body = await page.locator('body').innerText()
  return oops === 0 && !body.includes('Application error')
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'x-vercel-protection-bypass': BYPASS } })
  if (!res.ok) return null
  return res.json()
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const emission = await fetchJson(`${BASE}/api/masterchef/emission/`)

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS },
    viewport: { width: 1440, height: 900 },
  })
  const page = await ctx.newPage()
  const checks = { sha: SHA, base: BASE }

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(8000)
  const homeBody = await page.locator('body').innerText()
  const tickerText = await page.locator('[data-melega-ticker]').innerText().catch(() => '')

  checks.homeHealthy = await healthy(page)
  checks.tickerNoUnavailableInStrip = !tickerText.includes('Unavailable')
  checks.tickerNoFakeVolAccent =
    !/\bvol\b/i.test(tickerText) && !/\bLiquid\b/.test(tickerText)
  checks.liveEconomyFourMetrics =
    /live farms/i.test(homeBody) &&
    /rewarding pools/i.test(homeBody) &&
    /liquid pairs/i.test(homeBody) &&
    /indexed assets/i.test(homeBody)
  checks.marketOverviewWired = (await page.locator('[data-home-market-strip]').count()) > 0
  await page.screenshot({ path: path.join(OUT, 'home-1440-after.png'), fullPage: true })

  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(10000)
  const farmsBody = await page.locator('body').innerText()
  checks.farmsHealthy = await healthy(page)
  checks.farmsEmission =
    farmsBody.includes('144') || emission?.perDay === 144000 || emission?.dailyEmission === 144000
  await page.screenshot({ path: path.join(OUT, 'farms-1440-after.png'), fullPage: true })

  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(10000)
  const poolsBody = await page.locator('body').innerText()
  checks.poolsHealthy = await healthy(page)
  checks.poolsNoZeroAprKpi = !poolsBody.match(/Highest Sustainable APR[\s\S]{0,40}0%/)
  checks.poolsAdvisorHonest =
    poolsBody.includes('No eligible rewarding pools') || poolsBody.includes('Best Sustainability')
  checks.poolsHeroConsistent =
    (poolsBody.includes('No rewarding pools yet') &&
      (poolsBody.includes('Unavailable') || poolsBody.match(/0 rewarding/i))) ||
    poolsBody.includes('LIVE')
  await page.screenshot({ path: path.join(OUT, 'pools-1440-after.png'), fullPage: true })

  await page.goto(`${BASE}/collectibles`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(6000)
  checks.collectiblesHealthy = await healthy(page)
  const brokenImg = await page.locator('img[src=""], img:not([src])').count()
  checks.collectiblesNoBrokenImg = brokenImg === 0
  await page.screenshot({ path: path.join(OUT, 'collectibles-1440-after.png'), fullPage: true })

  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 })
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(5000)
    await page.screenshot({ path: path.join(OUT, `home-${w}-after.png`), fullPage: false })
  }

  for (const route of ROUTES) {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(6000)
    checks[`${route.name}Healthy`] = await healthy(page)
    await page.screenshot({ path: path.join(OUT, `${route.name}-1440-after.png`), fullPage: true })
  }

  await browser.close()

  const report = {
    mission: 'R784',
    sha: SHA,
    verifiedAt: new Date().toISOString(),
    checks,
    emission,
    pass: Object.entries(checks)
      .filter(([k]) => k.endsWith('Healthy') || k.startsWith('ticker') || k.startsWith('live') || k.startsWith('market') || k.startsWith('farmsE') || k.startsWith('pools') || k.startsWith('collectibles'))
      .every(([, v]) => v === true),
  }

  await writeFile(path.join(OUT, 'r784-production-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.pass ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
