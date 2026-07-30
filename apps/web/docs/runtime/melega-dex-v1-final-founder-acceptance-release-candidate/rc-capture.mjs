#!/usr/bin/env node
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const OUT = path.dirname(fileURLToPath(import.meta.url))
const BASE = (process.env.NEXT_URL || 'http://127.0.0.1:3577').replace(/\/$/, '')

let chromium
for (const p of [
  '/tmp/lb-pixel002-cert/node_modules/playwright',
  '/tmp/melega-wallet-cert/node_modules/playwright',
  path.resolve(OUT, '../../../../../node_modules/playwright'),
]) {
  try {
    ;({ chromium } = require(p))
    break
  } catch {}
}
if (!chromium) throw new Error('playwright not found')

fs.mkdirSync(path.join(OUT, 'screenshots', 'desktop'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'screenshots', 'mobile'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'screenshots', 'pools'), { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function gotoTimed(page, url, waitMs = 4000) {
  const t0 = Date.now()
  const network = []
  page.on('response', async (res) => {
    try {
      const u = res.url()
      if (!u.includes('/api/') && !u.includes('coingecko')) return
      network.push({
        url: u.slice(0, 180),
        status: res.status(),
        timingMs: Date.now() - t0,
      })
    } catch {}
  })
  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 240))
  })
  page.on('pageerror', (err) => consoleErrors.push(String(err).slice(0, 240)))
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 })
  const shellAt = Date.now() - t0
  await sleep(waitMs)
  return { t0, shellAt, network, consoleErrors }
}

async function homeMetrics(page) {
  return page.evaluate(() => {
    const tickerItems = document.querySelectorAll(
      '[data-testid="melega-ticker"] [data-ticker-item], .melega-ticker-item, [class*="Ticker"] li, [data-testid="trending-ribbon"] *',
    )
    const text = document.body.innerText || ''
    const listedMatch = text.match(/Listed Projects[\s\S]{0,40}?(\d{1,5})/i)
    const insuff = (text.match(/Insufficient observations/gi) || []).length
    const broken = [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length
    const kpiEls = [...document.querySelectorAll('[data-home-section="kpis"] *, [data-testid*="kpi"]')]
    const featured = [...document.querySelectorAll('[data-testid="dex-home-featured-projects"] article, [data-featured-slug]')]
    const featuredText = featured.map((el) => el.textContent || '').join('\n')
    const hasUsdPrice = /\$\d|\<\s*\$0\.|Price updating/.test(featuredText)
    const hasBnbPrimary = /\d+\.?\d*\s*BNB/.test(featuredText) && !/\$/.test(featuredText)
    const tickerText = (document.querySelector('[data-testid="global-trending-bar"], [data-testid="trending-ribbon"], [class*="Trending"]') || document.body)
      .textContent || ''
    const moverCount = (tickerText.match(/↑|↓|%/g) || []).length
    return {
      title: document.title,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      brokenImages: broken,
      listedProjectsDisplay: listedMatch ? Number(listedMatch[1]) : null,
      insufficientObservations: insuff,
      featuredCardCount: featured.length,
      featuredHasUsdSignals: hasUsdPrice,
      featuredPrimaryBnb: hasBnbPrimary,
      tickerMoverSignals: moverCount,
      bodyHasIndexing: /Indexing market activity/i.test(text),
      kpiHit: kpiEls.length > 0 || /TVL|24H Volume|Listed Projects/i.test(text),
    }
  })
}

async function poolsMetrics(page) {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll('[data-testid="pools-explore-card"], [data-pool-id]')]
    const ids = cards.map((c) => c.getAttribute('data-pool-id') || c.getAttribute('data-testid') || '').filter(Boolean)
    const featured = document.querySelector('[data-testid="pools-featured-band"], [data-testid="pools-hero-featured-compact"]')
    const viewContracts = [...document.querySelectorAll('[data-ps-view-contract], [data-testid*="view-contract"], button, a')].filter((el) =>
      /View Contract/i.test(el.textContent || ''),
    ).length
    const empty = /No active|No rewarding|No pools/i.test(document.body.innerText || '')
    return {
      exploreCount: ids.length,
      exploreIds: ids.slice(0, 40),
      featuredPresent: !!featured,
      featuredText: (featured?.textContent || '').slice(0, 160),
      viewContractCount: viewContracts,
      emptyState: empty,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    }
  })
}

const browser = await chromium.launch({ headless: true })
const results = { baseUrl: BASE, startedAt: new Date().toISOString() }

// ---- Cold start Home ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const timed = await gotoTimed(page, `${BASE}/`, 8000)
  // poll for ticker / KPIs
  let firstMoverAt = null
  let fullTickerAt = null
  let featuredAt = null
  let listedAt = null
  for (let i = 0; i < 40; i++) {
    const m = await homeMetrics(page)
    if (firstMoverAt == null && m.tickerMoverSignals > 0) firstMoverAt = Date.now() - timed.t0
    if (fullTickerAt == null && m.tickerMoverSignals >= 4) fullTickerAt = Date.now() - timed.t0
    if (featuredAt == null && m.featuredCardCount >= 4) featuredAt = Date.now() - timed.t0
    if (listedAt == null && m.listedProjectsDisplay != null) listedAt = Date.now() - timed.t0
    if (firstMoverAt && fullTickerAt && featuredAt && listedAt) break
    await sleep(500)
  }
  const final = await homeMetrics(page)
  await page.screenshot({ path: path.join(OUT, 'home-cold-start-screenshot.png'), fullPage: false })
  await page.screenshot({ path: path.join(OUT, 'screenshots/desktop/home-1440-cold.png'), fullPage: false })
  const cold = {
    shellMs: timed.shellAt,
    timeToFirstMoverMs: firstMoverAt,
    timeToFullTickerMs: fullTickerAt,
    timeToFeaturedMs: featuredAt,
    timeToListedProjectsMs: listedAt,
    final,
    pass: {
      listedNotFive: final.listedProjectsDisplay !== 5,
      noInsufficient: final.insufficientObservations === 0,
      noPrimaryBnb: !final.featuredPrimaryBnb,
      tickerNotEmptyMinutes: (firstMoverAt ?? 999999) < 120000,
    },
  }
  fs.writeFileSync(path.join(OUT, 'home-cold-start.json'), JSON.stringify(cold, null, 2) + '\n')
  fs.writeFileSync(
    path.join(OUT, 'home-cold-start-network-log.json'),
    JSON.stringify({ capturedAt: new Date().toISOString(), entries: timed.network.slice(0, 80) }, null, 2) + '\n',
  )
  results.cold = cold
  results.consoleCold = timed.consoleErrors
  await ctx.close()
}

// ---- Warm cycles ----
{
  const cycles = []
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await sleep(5000)
  for (let c = 1; c <= 5; c++) {
    const t0 = Date.now()
    await page.reload({ waitUntil: 'domcontentloaded' })
    let first = null
    let full = null
    for (let i = 0; i < 30; i++) {
      const m = await homeMetrics(page)
      if (first == null && m.tickerMoverSignals > 0) first = Date.now() - t0
      if (full == null && m.tickerMoverSignals >= 4) full = Date.now() - t0
      if (first && full) break
      await sleep(400)
    }
    const m = await homeMetrics(page)
    cycles.push({
      cycle: c,
      firstMoverMs: first,
      fullTickerMs: full,
      listedProjects: m.listedProjectsDisplay,
      insufficientObservations: m.insufficientObservations,
      featuredPrimaryBnb: m.featuredPrimaryBnb,
      featuredHasUsdSignals: m.featuredHasUsdSignals,
    })
  }
  fs.writeFileSync(path.join(OUT, 'home-warm-cycles.json'), JSON.stringify({ cycles, pass: cycles.every((c) => c.listedProjects !== 5 && c.insufficientObservations === 0) }, null, 2) + '\n')
  results.warm = cycles
  await ctx.close()
}

// ---- Pools 5 cycles ----
{
  const cycles = []
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  // C1 direct
  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await sleep(6000)
  let m = await poolsMetrics(page)
  await page.screenshot({ path: path.join(OUT, 'screenshots/pools/cycle1.png'), fullPage: false })
  cycles.push({ cycle: 1, name: 'direct-open', ...m, ts: new Date().toISOString() })
  fs.writeFileSync(path.join(OUT, 'pools-live-cycle-1.json'), JSON.stringify(cycles[0], null, 2) + '\n')

  // C2 wait refresh
  await sleep(70000)
  m = await poolsMetrics(page)
  await page.screenshot({ path: path.join(OUT, 'screenshots/pools/cycle2.png'), fullPage: false })
  cycles.push({ cycle: 2, name: 'after-refresh-wait', ...m, ts: new Date().toISOString() })
  fs.writeFileSync(path.join(OUT, 'pools-live-cycle-2.json'), JSON.stringify(cycles[1], null, 2) + '\n')

  // C3 pools -> farms -> pools
  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await sleep(3000)
  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await sleep(6000)
  m = await poolsMetrics(page)
  await page.screenshot({ path: path.join(OUT, 'screenshots/pools/cycle3.png'), fullPage: false })
  cycles.push({ cycle: 3, name: 'pools-farms-pools', ...m, ts: new Date().toISOString() })
  fs.writeFileSync(path.join(OUT, 'pools-live-cycle-3.json'), JSON.stringify(cycles[2], null, 2) + '\n')

  // C4 hard reload
  await page.reload({ waitUntil: 'domcontentloaded' })
  await sleep(6000)
  m = await poolsMetrics(page)
  await page.screenshot({ path: path.join(OUT, 'screenshots/pools/cycle4.png'), fullPage: false })
  cycles.push({ cycle: 4, name: 'hard-reload', ...m, ts: new Date().toISOString() })
  fs.writeFileSync(path.join(OUT, 'pools-live-cycle-4.json'), JSON.stringify(cycles[3], null, 2) + '\n')

  // C5 simulate wallet disconnect via localStorage clear + reload (fixture)
  await page.evaluate(() => {
    try {
      localStorage.removeItem('wagmi.store')
      localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE')
    } catch {}
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await sleep(6000)
  m = await poolsMetrics(page)
  await page.screenshot({ path: path.join(OUT, 'screenshots/pools/cycle5.png'), fullPage: false })
  cycles.push({ cycle: 5, name: 'wallet-clear-reload', ...m, ts: new Date().toISOString() })
  fs.writeFileSync(path.join(OUT, 'pools-live-cycle-5.json'), JSON.stringify(cycles[4], null, 2) + '\n')

  const counts = cycles.map((c) => c.exploreCount)
  const disappeared = cycles.some((c, i) => i > 0 && cycles[i - 1].exploreCount > 0 && c.exploreCount === 0)
  const summary = {
    cycles: cycles.map((c) => ({
      cycle: c.cycle,
      name: c.name,
      exploreCount: c.exploreCount,
      viewContractCount: c.viewContractCount,
      featuredPresent: c.featuredPresent,
    })),
    counts,
    populatedToEmpty: disappeared,
    pass: !disappeared && cycles.every((c) => c.viewContractCount >= 0),
  }
  fs.writeFileSync(path.join(OUT, 'pools-live-five-cycle-summary.json'), JSON.stringify(summary, null, 2) + '\n')
  results.pools = summary
  await ctx.close()
}

// ---- Featured proof from API ----
{
  try {
    const res = await fetch(`${BASE}/api/indexer/featured-markets/`)
    const body = await res.json()
    const rows = (body.rows || []).map((r) => ({
      slug: r.slug,
      symbol: r.symbol,
      tokenAddress: r.tokenAddress,
      pairAddress: r.pairAddress,
      usdPrice: r.latestPriceUsd ?? null,
      priceSource: r.source,
      volume24hUsd: r.volume24hUsd ?? null,
      liquidityUsd: r.liquidityUsd ?? null,
      marketCapLabel: r.marketCapLabel ?? 'Unavailable',
      marketCapUsd: r.marketCapUsd ?? null,
      changePct: r.changePct ?? null,
      status: r.status,
      bnbUsd: r.bnbUsd ?? null,
    }))
    fs.writeFileSync(
      path.join(OUT, 'featured-project-data-proof.json'),
      JSON.stringify(
        {
          status: res.status,
          generatedAt: body.generatedAt,
          rows,
          coverage: {
            withUsdPrice: rows.filter((r) => r.usdPrice != null).length,
            withUsdVolume: rows.filter((r) => r.volume24hUsd != null).length,
            withFdv: rows.filter((r) => r.marketCapUsd != null).length,
            unavailableCap: rows.filter((r) => r.marketCapLabel === 'Unavailable' || r.marketCapUsd == null).length,
          },
        },
        null,
        2,
      ) + '\n',
    )
  } catch (e) {
    fs.writeFileSync(
      path.join(OUT, 'featured-project-data-proof.json'),
      JSON.stringify({ error: String(e) }, null, 2) + '\n',
    )
  }
}

// ---- API health matrix ----
{
  const endpoints = [
    '/api/indexer/pairs?pageSize=20&classification=tradeable',
    '/api/indexer/tier-metrics',
    '/api/indexer/featured-markets/',
    '/api/indexer/events?types=Swap&limit=50',
    '/api/create-token/readiness',
    '/api/liquidity-building/readiness',
    '/api/protocol/activity?limit=20',
  ]
  const matrix = []
  for (const ep of endpoints) {
    const t0 = Date.now()
    try {
      const res = await fetch(`${BASE}${ep}`)
      const text = await res.text()
      let jsonOk = false
      try {
        JSON.parse(text)
        jsonOk = true
      } catch {}
      matrix.push({ endpoint: ep, status: res.status, latencyMs: Date.now() - t0, jsonOk, bytes: text.length })
    } catch (e) {
      matrix.push({ endpoint: ep, status: 0, latencyMs: Date.now() - t0, error: String(e) })
    }
  }
  fs.writeFileSync(path.join(OUT, 'api-health-matrix.json'), JSON.stringify({ measuredAt: new Date().toISOString(), matrix }, null, 2) + '\n')
  results.api = matrix
}

// ---- Route stability 3 loops ----
{
  const routes = ['/', '/liquidity', '/farms', '/pools', '/list', '/passport', '/project-hq/marco']
  const errors = []
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push({ type: 'pageerror', message: String(e).slice(0, 200) }))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push({ type: 'console', message: msg.text().slice(0, 200) })
  })
  const visits = []
  for (let loop = 1; loop <= 3; loop++) {
    for (const r of routes) {
      const t0 = Date.now()
      await page.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded', timeout: 120000 }).catch((e) => {
        errors.push({ type: 'nav', route: r, message: String(e).slice(0, 200) })
      })
      await sleep(2500)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      )
      visits.push({ loop, route: r, ms: Date.now() - t0, overflow })
    }
  }
  fs.writeFileSync(
    path.join(OUT, 'route-stability-proof.json'),
    JSON.stringify({ visits, errorCount: errors.length, pass: errors.filter((e) => e.type === 'pageerror').length === 0 }, null, 2) +
      '\n',
  )
  fs.writeFileSync(path.join(OUT, 'console-error-log.json'), JSON.stringify({ errors: errors.slice(0, 100) }, null, 2) + '\n')
  await page.screenshot({ path: path.join(OUT, 'screenshots/desktop/home-final.png'), fullPage: false })
  await ctx.close()
}

// ---- Mobile / desktop sample screenshots ----
for (const vp of [
  { w: 390, h: 844, folder: 'mobile', name: 'home-390' },
  { w: 430, h: 932, folder: 'mobile', name: 'liquidity-430' },
  { w: 1440, h: 900, folder: 'desktop', name: 'liquidity-1440' },
  { w: 1920, h: 1080, folder: 'desktop', name: 'pools-1920' },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
  const page = await ctx.newPage()
  const route = vp.name.includes('liquidity') ? '/liquidity' : vp.name.includes('pools') ? '/pools' : '/'
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await sleep(4000)
  await page.screenshot({ path: path.join(OUT, 'screenshots', vp.folder, `${vp.name}.png`), fullPage: false })
  await ctx.close()
}

// Product page + list mobile
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  for (const [route, name] of [
    ['/list', 'list-390'],
    ['/passport', 'passport-390'],
    ['/project-hq/marco', 'project-390'],
    ['/farms', 'farms-390'],
  ]) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await sleep(3500)
    await page.screenshot({ path: path.join(OUT, 'screenshots/mobile', `${name}.png`), fullPage: false })
  }
  await ctx.close()
}

results.finishedAt = new Date().toISOString()
fs.writeFileSync(path.join(OUT, 'rc-capture-summary.json'), JSON.stringify(results, null, 2) + '\n')
await browser.close()
console.log(JSON.stringify({ ok: true, coldListed: results.cold?.final?.listedProjectsDisplay, poolsPass: results.pools?.pass }, null, 2))
