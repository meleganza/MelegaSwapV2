#!/usr/bin/env node
/**
 * MELEGASWAP_V2_PRODUCT_POLISH_P2_FOUNDER_ACCEPTANCE
 * Real product acceptance against a running Next build.
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

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3031').replace(/\/$/, '')
const PHASE = process.env.PHASE || 'before'
const OUT = __dirname
const SHOTS = path.join(OUT, 'screenshots', PHASE)
const FINDINGS = path.join(OUT, 'findings')

fs.mkdirSync(SHOTS, { recursive: true })
fs.mkdirSync(FINDINGS, { recursive: true })

const bugs = []
const note = (id, severity, part, detail, evidence = {}) => {
  bugs.push({ id, severity, part, detail, evidence })
}

async function wait(page, ms = 2200) {
  await page.waitForTimeout(ms)
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false })
}

async function measureModal(page) {
  return page.evaluate(() => {
    const modal = document.querySelector('[data-melega-modal="true"]')
    if (!modal) return { open: false }
    const r = modal.getBoundingClientRect()
    const vh = window.innerHeight
    const vw = window.innerWidth
    const titles = [...modal.querySelectorAll('h1, h2, [data-melega-modal-title]')]
      .filter((el) => {
        const s = getComputedStyle(el)
        return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0
      })
      .map((el) => (el.textContent || '').trim())
      .filter(Boolean)
    const body = modal.querySelector('[data-melega-modal-body], [class*="Body"]') || modal
    const text = modal.innerText || ''
    const treasuryRaw = /0x[a-fA-F0-9]{40}/.test(text) && /treasury/i.test(text)
    const scrollParent = (() => {
      let el = body
      while (el && el !== modal) {
        const s = getComputedStyle(el)
        if (/(auto|scroll)/.test(s.overflowY)) return 'body-ish'
        el = el.parentElement
      }
      const ms = getComputedStyle(modal)
      return /(auto|scroll)/.test(ms.overflowY) ? 'modal' : 'unknown'
    })()
    return {
      open: true,
      brand: !!modal.querySelector('[data-melega-modal-brand="true"]'),
      close: !!modal.querySelector('[data-melega-modal-close], [data-testid*="modal-close"]'),
      titles,
      titleCount: titles.length,
      width: Math.round(r.width),
      height: Math.round(r.height),
      withinViewport: r.top >= -4 && r.bottom <= vh + 4 && r.left >= -4 && r.right <= vw + 4,
      maxHeightOk: r.height <= vh * 0.82,
      widthOk: r.width <= 760,
      accordionOpen: [...modal.querySelectorAll('[data-melega-accordion][data-open="true"]')].length,
      stickyPreview: !!modal.querySelector('[style*="sticky"], aside, [data-testid="create-farm-review-panel"]'),
      treasuryRaw,
      textSample: text.slice(0, 500),
      scrollParent,
      deadSpaceSuspect: r.height > 520 && text.length < 180,
    }
  })
}

async function openCreate(page, route, texts) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await wait(page)
  for (const t of texts) {
    const btn = page.locator('button, a').filter({ hasText: new RegExp(`^\\s*${t}`, 'i') }).first()
    if ((await btn.count()) > 0) {
      await btn.click({ timeout: 5000 }).catch(() => {})
      await wait(page, 900)
      const m = await measureModal(page)
      if (m.open) return { via: 'cta', ...m }
    }
  }
  await page.goto(`${BASE}${route}${route.includes('?') ? '&' : '?'}create=1`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await wait(page)
  return { via: 'deep-link', ...(await measureModal(page)) }
}

async function homeAudit(page, label) {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await wait(page, 4000)
  await shot(page, `home-${label}`)
  const data = await page.evaluate(() => {
    const body = document.body.innerText || ''
    const overflowX = document.documentElement.scrollWidth > window.innerWidth + 2
    const section = (start, end) => {
      const a = body.indexOf(start)
      const b = body.indexOf(end)
      if (a < 0) return ''
      return body.slice(a, b > a ? b : a + 1200)
    }
    const farms = section('Top Farms', 'Top Pools')
    const pools = section('Top Pools', 'New Listings')
    const movers = section('Top Movers', 'Top Farms') || section('Top Movers', 'Featured')
    const listings = section('New Listings', 'Explore Melega')
    const eco = section('Explore Melega Ecosystem', '©') || body.slice(body.indexOf('Explore Melega'))
    const dashCount = (block) => (block.match(/—/g) || []).length
    const unavail = (block) => /Unavailable/i.test(block)
    const chainBadges = document.querySelectorAll('[data-chain-badge], [class*="ChainBadge"], img[alt*="BNB"], img[alt*="Base"]').length
    const featured = !!document.querySelector('[data-testid="dex-home-featured-projects"], [data-featured]')
    return {
      overflowX,
      hasMovers: /Top Movers/i.test(body),
      hasFarms: /Top Farms/i.test(body),
      hasPools: /Top Pools/i.test(body),
      hasListings: /New Listings/i.test(body),
      featured,
      farmsUnavailable: unavail(farms),
      poolsUnavailable: unavail(pools),
      moversUnavailable: unavail(movers),
      farmsDash: dashCount(farms),
      poolsDash: dashCount(pools),
      farmsBlock: farms.slice(0, 400),
      poolsBlock: pools.slice(0, 400),
      passport: /PASSPORT/i.test(eco) && /Identity & rewards/i.test(eco),
      black: /\bBLACK\b/.test(eco) && /Fair-launch infrastructure/i.test(eco),
      blackpump: /BLACKPUMP/i.test(eco),
      chainBadges,
      oops: /Oops/i.test(body),
    }
  })

  if (data.overflowX) note('home-overflow-x', 'high', 'A', `${label}: horizontal overflow on Home`, data)
  if (data.farmsUnavailable) note('home-farms-unavailable', 'high', 'A', `${label}: Top Farms still shows Unavailable`, data)
  if (data.poolsUnavailable) note('home-pools-unavailable', 'high', 'A', `${label}: Top Pools still shows Unavailable`, data)
  if (!data.passport || !data.black) note('home-eco-copy', 'high', 'A', `${label}: Ecosystem Passport/Black copy incorrect`, data)
  if (data.blackpump) note('home-eco-blackpump', 'med', 'A', `${label}: BLACKPUMP label still visible`, data)
  if (!data.hasMovers || !data.hasFarms || !data.hasPools || !data.hasListings)
    note('home-sections-missing', 'high', 'A', `${label}: discovery sections missing`, data)
  if (data.oops) note('home-oops', 'crit', 'A', `${label}: Oops on Home`, data)

  return data
}

async function routingAudit(page, label) {
  const hops = [
    { from: '/', click: /Liquidity/i, expectPath: /liquidity|add/i, expectText: /liquidity|pool|add/i },
    { from: '/', click: /^Farms$/i, expectPath: /farms/i, expectText: /farm/i },
    { from: '/', click: /^Pools$/i, expectPath: /pools/i, expectText: /pool|stake/i },
    { from: '/', click: /^List/i, expectPath: /list/i, expectText: /list|project|import|launch/i },
    { from: '/', click: /Portfolio/i, expectPath: /portfolio/i, expectText: /portfolio|assets|connect/i },
    { from: '/', click: /Trending/i, expectPath: /trending/i, expectText: /trending|project/i },
  ]
  const results = []
  for (const hop of hops) {
    await page.goto(`${BASE}${hop.from}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await wait(page, 1500)
    const beforePath = new URL(page.url()).pathname
    const link = page.locator('a, button').filter({ hasText: hop.click }).first()
    if ((await link.count()) === 0) {
      note(`route-missing-${hop.click}`, 'high', 'H', `${label}: CTA not found ${hop.click}`)
      results.push({ hop: String(hop.click), ok: false, reason: 'missing' })
      continue
    }
    await link.click({ timeout: 8000 }).catch(() => {})
    await wait(page, 2500)
    const afterPath = new URL(page.url()).pathname
    const body = await page.evaluate(() => document.body.innerText.slice(0, 2000))
    const pathOk = hop.expectPath.test(afterPath) || hop.expectPath.test(page.url())
    const domOk = hop.expectText.test(body)
    const changed = afterPath !== beforePath || pathOk
    const ok = pathOk && domOk && changed
    if (!ok) {
      note(`route-fail-${afterPath}`, 'high', 'H', `${label}: navigation failed for ${hop.click}`, {
        beforePath,
        afterPath,
        pathOk,
        domOk,
        bodySlice: body.slice(0, 160),
      })
    }
    results.push({ hop: String(hop.click), beforePath, afterPath, pathOk, domOk, ok })
  }

  // Featured CTAs on home
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await wait(page, 3500)
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await wait(page, 3000)
  const tradeBtn = page.locator('[data-testid^="featured-trade-"]').first()
  if ((await tradeBtn.count()) === 0) {
    note('route-featured-trade-missing', 'med', 'H', `${label}: featured-trade CTA missing`)
  } else {
    await tradeBtn.click({ timeout: 8000 }).catch(() => {})
    await wait(page, 2500)
    const url = page.url()
    const body = await page.evaluate(() => document.body.innerText.slice(0, 1200))
    const ok = !/Oops/i.test(body) && (/project/i.test(url) || /swap|trade/i.test(url) || /project/i.test(body))
    if (!ok) note('route-featured-trade-fail', 'high', 'H', `${label}: featured-trade did not navigate`, { url, body: body.slice(0, 120) })
    results.push({ hop: 'featured-trade', url, ok })
  }

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await wait(page, 2500)
  const viewBtn = page.locator('[data-testid^="featured-view-"]').first()
  if ((await viewBtn.count()) === 0) {
    note('route-featured-view-missing', 'med', 'H', `${label}: featured-view CTA missing`)
  } else {
    await viewBtn.click({ timeout: 8000 }).catch(() => {})
    await wait(page, 2500)
    const url = page.url()
    const body = await page.evaluate(() => document.body.innerText.slice(0, 1200))
    const ok = !/Oops/i.test(body) && /project/i.test(url)
    if (!ok) note('route-featured-view-fail', 'high', 'H', `${label}: featured-view did not navigate`, { url, body: body.slice(0, 120) })
    results.push({ hop: 'featured-view', url, ok })
  }
  await shot(page, `routing-end-${label}`)
  return results
}

async function portfolioAudit(page, label) {
  await page.goto(`${BASE}/portfolio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await wait(page, 2500)
  await shot(page, `portfolio-${label}`)
  const data = await page.evaluate(() => {
    const body = document.body.innerText || ''
    const headerEls = [...document.querySelectorAll('[data-melega-global-header], header, [data-testid="melega-global-header"], [data-app-header]')]
    const headerH = Math.max(0, ...headerEls.map((el) => el.getBoundingClientRect().height), 0)
    // Mobile shell may use a non-<header> bar + bottom nav — accept logo + connect chrome.
    const hasLogo = !!document.querySelector('a[href="/"], a[href="/"] svg, [data-melega-logo]')
    const hasConnect = [...document.querySelectorAll('button, a')].some((el) =>
      /^connect(\s+wallet)?$/i.test((el.textContent || '').trim()),
    )
    const hasBottomNav = [...document.querySelectorAll('a, button')].some((el) => {
      const t = (el.textContent || '').trim()
      return t === 'Farms' || t === 'Pools' || t === 'Home'
    })
    const chromeOk = headerH >= 48 || (hasLogo && hasConnect && hasBottomNav)
    const fonts = getComputedStyle(document.body).fontFamily
    const shell = document.querySelector('[data-portfolio="v2"], [data-testid="portfolio-studio-screen"]')
    const contentW = shell ? Math.round(shell.getBoundingClientRect().width) : 0
    const forbidden =
      /Marco Passport/i.test(body) ||
      (/\bGuest\b/.test(body) && /passport|identity/i.test(body)) ||
      /Verification/i.test(body) ||
      /\bSubject\b/i.test(body)
    return {
      headerH,
      chromeOk,
      hasLogo,
      hasConnect,
      hasBottomNav,
      fonts,
      contentW,
      mounted: !!shell,
      forbidden,
      hasAssets: /Assets/i.test(body),
      hasPositions: /Positions/i.test(body),
      hasNavLinks: !!document.querySelector('a[href*="/farms"], a[href*="/pools"], a[href="/"], a[href="/"]'),
    }
  })
  if (!data.mounted) note('portfolio-missing', 'crit', 'F', `${label}: Portfolio shell missing`)
  if (!data.chromeOk) note('portfolio-header', 'high', 'F', `${label}: global header missing/short`, data)
  if (!data.hasNavLinks) note('portfolio-nav', 'high', 'F', `${label}: navbar links missing`, data)
  if (data.forbidden) note('portfolio-passport-residue', 'high', 'F', `${label}: Passport/identity residue`, data)
  if (label.startsWith('desktop') && data.contentW > 0 && data.contentW < 900)
    note('portfolio-narrow', 'med', 'F', `${label}: content width unexpectedly narrow`, data)
  return data
}

async function poolsAudit(page, label) {
  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await wait(page, 3000)
  await shot(page, `pools-${label}`)
  const data = await page.evaluate(() => {
    const body = document.body.innerText || ''
    const emptyCard = /No (pool )?positions yet/i.test(body) || /No positions/i.test(body)
    const myPos = document.querySelector('[data-pools-module="003"], [data-testid*="my-position"]')
    const explore = /Explore Pools/i.test(body)
    const cards = document.querySelectorAll('[data-testid*="pool-card"], [data-pools-explore] a, article')
    const badges = document.querySelectorAll('[data-chain-badge], [class*="ChainBadge"]').length
    return {
      emptyCard,
      myPosPresent: !!myPos,
      explore,
      cardCount: cards.length,
      badges,
      oops: /Oops/i.test(body),
    }
  })
  if (data.emptyCard) note('pools-empty-card', 'high', 'D', `${label}: empty My Positions card visible`)
  if (!data.explore) note('pools-explore-missing', 'high', 'D', `${label}: Explore Pools missing`)
  if (data.oops) note('pools-oops', 'crit', 'D', `${label}: Oops on Pools`)

  const create = await openCreate(page, '/pools', ['Create Pool'])
  await shot(page, `create-pool-${label}`)
  if (!create.open) note('create-pool-closed', 'crit', 'C', `${label}: Create Pool modal did not open`)
  else {
    if (create.titleCount > 1) note('create-pool-double-title', 'high', 'C', `${label}: double title in Create Pool`, create)
    if (!create.widthOk || !create.maxHeightOk || !create.withinViewport)
      note('create-pool-geometry', 'high', 'C', `${label}: Create Pool geometry fail`, create)
    if (create.treasuryRaw) note('create-pool-treasury-raw', 'high', 'C', `${label}: raw Treasury address exposed`, create)
    if (create.accordionOpen > 1) note('create-pool-accordion', 'med', 'C', `${label}: multiple accordion open`, create)
  }
  // close and ensure no route corruption
  if (create.open) {
    await page.keyboard.press('Escape')
    await wait(page, 600)
    const url = page.url()
    if (/create=1/.test(url)) {
      // allowed if query remains, but page should not crash
    }
    const after = await page.evaluate(() => ({
      oops: /Oops/i.test(document.body.innerText || ''),
      modal: !!document.querySelector('[data-melega-modal="true"]'),
    }))
    if (after.oops) note('create-pool-close-crash', 'crit', 'C', `${label}: crash after closing Create Pool`)
  }
  return { data, create }
}

async function farmsAudit(page, label) {
  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await wait(page, 3000)
  await shot(page, `farms-${label}`)
  const data = await page.evaluate(() => {
    const body = document.body.innerText || ''
    return {
      explore: /Explore Farms|Active Farms|Farms/i.test(body),
      unavailableSpam: (body.match(/Unavailable/g) || []).length,
      oops: /Oops/i.test(body),
      myFarmsPrimaryUsd: !!document.querySelector('[data-testid="farms-my-deposited-primary"]'),
    }
  })
  if (data.oops) note('farms-oops', 'crit', 'E', `${label}: Oops on Farms`)

  const create = await openCreate(page, '/farms', ['Create Farm'])
  await shot(page, `create-farm-${label}`)
  if (!create.open) note('create-farm-closed', 'crit', 'B', `${label}: Create Farm modal did not open`)
  else {
    if (create.titleCount > 1) note('create-farm-double-title', 'high', 'B', `${label}: double title Create Farm`, create)
    if (!create.widthOk || !create.maxHeightOk || !create.withinViewport)
      note('create-farm-geometry', 'high', 'B', `${label}: Create Farm geometry fail`, create)
    if (!create.brand) note('create-farm-brand', 'high', 'B', `${label}: missing Melega brand mark`, create)
    if (create.accordionOpen > 1) note('create-farm-accordion', 'med', 'B', `${label}: multiple accordion open`, create)
    // CTA reachability
    const cta = await page.evaluate(() => {
      const modal = document.querySelector('[data-melega-modal="true"]')
      if (!modal) return { ok: false }
      const btn = modal.querySelector('[data-testid="create-farm-primary-action"], [data-testid="create-farm-next-continue"], button')
      if (!btn) return { ok: false }
      const r = btn.getBoundingClientRect()
      return { ok: r.bottom <= window.innerHeight + 8 && r.width > 0, bottom: r.bottom, vh: window.innerHeight }
    })
    if (!cta.ok) note('create-farm-cta-unreachable', 'high', 'B', `${label}: Create Farm CTA not reachable`, cta)
  }
  return { data, create }
}

async function networkAudit(page, label) {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await wait(page, 2000)
  const selectors = [
    '[data-melega-mobile-header] [data-testid="network-switcher-root"]',
    '[data-testid="melega-header-chain"] [data-testid="network-switcher-root"]',
    '[data-testid="melega-header-chain"]',
    '[data-network-status-pill]',
    'button[aria-label*="network" i]',
    'button[aria-label*="chain" i]',
  ]
  let modal = { open: false }
  for (const sel of selectors) {
    const el = page.locator(sel).first()
    if ((await el.count()) === 0) continue
    const box = await el.boundingBox().catch(() => null)
    if (!box || box.width < 8 || box.height < 8) continue
    await el.click({ timeout: 4000, force: true }).catch(() => {})
    await wait(page, 700)
    modal = await measureModal(page)
    if (modal.open) break
  }
  await shot(page, `network-${label}`)
  if (!modal.open) {
    note('network-modal-closed', 'med', 'G', `${label}: Network switch modal did not open`)
    return modal
  }
  if (!modal.brand) note('network-brand', 'high', 'G', `${label}: Network modal missing brand`, modal)
  if (modal.titleCount > 1) note('network-double-title', 'med', 'G', `${label}: Network double title`, modal)

  const cards = page.locator('[data-testid^="network-card-"], [data-network-switch] button, button').filter({ hasText: /Base|Polygon|Ethereum|Arbitrum|Avalanche|BNB/i })
  const count = await cards.count()
  const clickResults = []
  for (let i = 0; i < Math.min(count, 6); i++) {
    const before = page.url()
    await cards.nth(i).click({ timeout: 3000 }).catch(() => {})
    await wait(page, 500)
    const after = page.url()
    const oops = await page.evaluate(() => /Oops/i.test(document.body.innerText || ''))
    // Must not hard-navigate away on error
    const forcedBsc = /\/$/.test(after) === false && before !== after && /bsc/i.test(after) && !/bsc/i.test(before)
    clickResults.push({ i, before, after, oops, forcedBsc })
    if (oops) note('network-click-oops', 'crit', 'G', `${label}: Oops after network card click`, { i })
  }
  return { ...modal, clickResults }
}

const viewports = [
  [1440, 'desktop-1440'],
  [1280, 'laptop-1280'],
  [1024, 'tablet-1024'],
  [390, 'mobile-390'],
]

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const results = []

  for (const [w, label] of viewports) {
    await page.setViewportSize({ width: w, height: 900 })
    const home = await homeAudit(page, label)
    const portfolio = await portfolioAudit(page, label)
    const pools = await poolsAudit(page, label)
    const farms = await farmsAudit(page, label)
    const network = await networkAudit(page, label)
    results.push({ label, width: w, home, portfolio, pools, farms, network })
  }

  // Routing once on desktop
  await page.setViewportSize({ width: 1440, height: 900 })
  const routing = await routingAudit(page, 'desktop-1440')

  await browser.close()

  const high = bugs.filter((b) => b.severity === 'high' || b.severity === 'crit')
  const report = {
    mission: 'MELEGASWAP_V2_PRODUCT_POLISH_P2_FOUNDER_ACCEPTANCE',
    phase: PHASE,
    base: BASE,
    verifiedAt: new Date().toISOString(),
    bugCount: bugs.length,
    highOrCrit: high.length,
    bugs,
    results,
    routing,
  }
  fs.writeFileSync(path.join(FINDINGS, `${PHASE}-report.json`), JSON.stringify(report, null, 2))
  fs.writeFileSync(path.join(OUT, `${PHASE}-acceptance.json`), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        phase: PHASE,
        bugCount: bugs.length,
        highOrCrit: high.length,
        bugs: bugs.map((b) => ({ id: b.id, severity: b.severity, part: b.part, detail: b.detail })),
      },
      null,
      2,
    ),
  )
  // Exit 0 always in before phase so we can fix; after phase exits non-zero if high/crit remain
  process.exit(PHASE === 'after' && high.length > 0 ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
