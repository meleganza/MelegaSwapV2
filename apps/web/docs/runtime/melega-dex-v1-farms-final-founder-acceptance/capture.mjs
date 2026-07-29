#!/usr/bin/env node
/**
 * Farms Final Founder Acceptance — live production-build capture.
 */
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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = (process.env.NEXT_URL || 'http://127.0.0.1:3560').replace(/\/$/, '')
const SHOTS = path.join(OUT, 'screenshots')
fs.mkdirSync(SHOTS, { recursive: true })

const VIEWPORTS = [
  { name: '1920', w: 1920, h: 1080 },
  { name: '1600', w: 1600, h: 1000 },
  { name: '1440', w: 1440, h: 900 },
  { name: '1366', w: 1366, h: 768 },
  { name: '1024', w: 1024, h: 768 },
  { name: '430', w: 430, h: 932 },
  { name: '390', w: 390, h: 844 },
]

function write(name, obj) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj, null, 2) + '\n')
}

async function waitSettled(page, ms = 8000) {
  await page.waitForTimeout(ms)
}

async function extractFarmsState(page) {
  return page.evaluate(() => {
    const text = document.body?.innerText || ''
    const q = (s) => document.querySelector(s)
    const qa = (s) => [...document.querySelectorAll(s)]
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        left: Math.round(r.left),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
      }
    }
    const kpiCards = qa('[data-testid="farms-overview-kpis-module"] [data-kpi-id], [data-testid="farms-overview-kpis-module"] article, [data-testid="farms-overview-kpis-module"] [data-card-id]')
      .map((el) => ({
        id: el.getAttribute('data-kpi-id') || el.getAttribute('data-card-id') || null,
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      }))
    const exploreCards = qa('[data-testid="farms-explore-farms-module"] [data-testid^="farms-explore-card"], [data-testid="farms-explore-farms-module"] article')
    const myCards = qa('[data-testid="farms-my-farms-module"] [data-testid^="farms-my-farm"], [data-testid="farms-my-farms-module"] article')
    const finishedCards = qa('[data-testid="farms-finished-farms-module"] [data-testid^="farms-finished"], [data-testid="farms-finished-farms-module"] article')
    const farmLinks = qa('a[href*="bscscan.com/address/"]').map((a) => ({
      label: (a.textContent || '').replace(/\s+/g, ' ').trim(),
      href: a.getAttribute('href'),
    }))
    const exploreIds = exploreCards.map((el) => el.getAttribute('data-pid') || el.getAttribute('data-farm-pid') || el.getAttribute('data-testid') || (el.textContent || '').slice(0, 40))
    return {
      title: document.title,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      modules: {
        hero: box(q('[data-farms-module="001"]')),
        kpis: box(q('[data-testid="farms-overview-kpis-module"]')),
        myFarms: box(q('[data-testid="farms-my-farms-module"]')),
        explore: box(q('[data-testid="farms-explore-farms-module"]')),
        finished: box(q('[data-testid="farms-finished-farms-module"]')),
        analytics: box(q('[data-farms-module="007"]') || q('[data-testid="farms-analytics-grid"]')),
      },
      heroCopy: /Stake LP tokens[\s\S]{0,40}Earn farming rewards[\s\S]{0,40}Grow liquidity/i.test(text),
      activeFarmersLabel: /Unique wallets that participated in Melega DEX farms/i.test(text),
      activeFarmersIndexing: /Indexing…|Indexing\.\.\./i.test(text),
      activeFarmersUnavailable: /Unavailable/i.test(text) && /Active Farmers/i.test(text),
      kpiTextSample: kpiCards.slice(0, 8),
      exploreCount: exploreCards.length,
      myCount: myCards.length,
      finishedCount: finishedCards.length,
      exploreIds,
      farmContractLinks: farmLinks.filter((l) => /Farm Contract/i.test(l.label)),
      lpContractLinks: farmLinks.filter((l) => /LP Contract/i.test(l.label)),
      featuredPresent: Boolean(q('[data-testid="farms-hero-featured"], [data-featured-farm]')),
      artworkPresent: Boolean(q('[data-testid="farms-hero-artwork"], [data-farms-hero-artwork]')),
      bodyHasZeroFarmersAsZero: /Active Farmers[\s\S]{0,80}\b0\b/i.test(text) && !/Indexing/i.test(text),
    }
  })
}

async function shotSection(page, sel, file) {
  const el = await page.$(sel)
  if (el) {
    await el.screenshot({ path: path.join(SHOTS, file) })
    return true
  }
  await page.screenshot({ path: path.join(SHOTS, file), fullPage: false })
  return false
}

const browser = await chromium.launch({ headless: true })
const apiFarmers = await fetch(`${BASE}/api/farms/unique-farmers`).then((r) => r.json())

const responsive = []
const stateLog = []
let featuredSelection = null
let farmRuntime = null
let contractLinks = null

// Primary desktop capture @1440
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitSettled(page, 10000)
  const s1 = await extractFarmsState(page)
  stateLog.push({ event: 'cycle1-open-farms', at: new Date().toISOString(), state: s1 })
  write('wallet-cycle-1.json', { cycle: 1, wallet: 'disconnected', ...s1 })

  await page.screenshot({ path: path.join(SHOTS, 'hero-1440.png'), fullPage: false })
  await shotSection(page, '[data-farms-module="001"]', 'section-hero-1440.png')
  await shotSection(page, '[data-testid="farms-overview-kpis-module"]', 'section-kpi-1440.png')
  await page.evaluate(() => document.querySelector('[data-testid="farms-my-farms-module"]')?.scrollIntoView({ block: 'start' }))
  await waitSettled(page, 500)
  await shotSection(page, '[data-testid="farms-my-farms-module"]', 'section-my-farms-1440.png')
  await page.evaluate(() => document.querySelector('[data-testid="farms-explore-farms-module"]')?.scrollIntoView({ block: 'start' }))
  await waitSettled(page, 500)
  await shotSection(page, '[data-testid="farms-explore-farms-module"]', 'section-explore-1440.png')
  await page.evaluate(() => document.querySelector('[data-testid="farms-finished-farms-module"]')?.scrollIntoView({ block: 'start' }))
  await waitSettled(page, 500)
  await shotSection(page, '[data-testid="farms-finished-farms-module"]', 'section-finished-1440.png')
  await page.evaluate(() =>
    (document.querySelector('[data-farms-module="007"]') || document.querySelector('[data-testid="farms-analytics-grid"]'))?.scrollIntoView({
      block: 'start',
    }),
  )
  await waitSettled(page, 500)
  await shotSection(page, '[data-farms-module="007"], [data-testid="farms-analytics-grid"]', 'section-analytics-1440.png')
  await page.screenshot({ path: path.join(SHOTS, 'farms-full-1440.png'), fullPage: true })

  featuredSelection = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="farms-hero-featured"], [data-featured-farm]')
    if (!el) return { status: 'none', reason: 'no eligible featured farm or honest empty state' }
    return {
      status: 'present',
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 400),
      links: [...el.querySelectorAll('a[href*="bscscan.com"]')].map((a) => a.getAttribute('href')),
    }
  })

  farmRuntime = await page.evaluate(() => {
    const text = document.body?.innerText || ''
    const kpi = document.querySelector('[data-testid="farms-overview-kpis-module"]')
    return {
      activeFarmersVisible: /Active Farmers/i.test(text),
      kpiPlain: (kpi?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 800),
      exploreHeading: /Explore Farms/i.test(text),
      finishedHeading: /Finished Farms/i.test(text),
      myFarmsHeading: /My Farms/i.test(text),
    }
  })

  contractLinks = {
    farm: s1.farmContractLinks,
    lp: s1.lpContractLinks,
    sampleValid: [...s1.farmContractLinks, ...s1.lpContractLinks].every((l) =>
      /^https:\/\/bscscan\.com\/address\/0x[a-fA-F0-9]{40}$/.test(l.href || ''),
    ),
  }

  // Cycle 2: Farms → Pools → Farms
  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitSettled(page, 4000)
  stateLog.push({ event: 'navigate-pools', at: new Date().toISOString() })
  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitSettled(page, 8000)
  const s2 = await extractFarmsState(page)
  stateLog.push({ event: 'cycle2-return-farms', at: new Date().toISOString(), state: s2 })
  write('wallet-cycle-2.json', { cycle: 2, wallet: 'disconnected', nav: 'farms→pools→farms', ...s2 })

  // Cycle 3: hard reload
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitSettled(page, 8000)
  const s3 = await extractFarmsState(page)
  stateLog.push({ event: 'cycle3-hard-reload', at: new Date().toISOString(), state: s3 })
  write('wallet-cycle-3.json', { cycle: 3, wallet: 'disconnected', nav: 'hard-reload', ...s3 })

  // Mobile disconnected
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitSettled(page, 6000)
  await page.screenshot({ path: path.join(SHOTS, 'farms-disconnected-390.png'), fullPage: false })
  await ctx.close()
}

// Responsive matrix
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitSettled(page, vp.w >= 1024 ? 7000 : 5000)
  const state = await extractFarmsState(page)
  await page.screenshot({ path: path.join(SHOTS, `farms-${vp.name}.png`), fullPage: false })
  responsive.push({
    viewport: vp.name,
    width: vp.w,
    height: vp.h,
    overflowX: state.overflowX,
    exploreCount: state.exploreCount,
    farmContractLinks: state.farmContractLinks.length,
    lpContractLinks: state.lpContractLinks.length,
    modulesPresent: Object.fromEntries(Object.entries(state.modules).map(([k, v]) => [k, Boolean(v)])),
  })
  await ctx.close()
  console.log('vp', vp.name, 'overflow', state.overflowX, 'explore', state.exploreCount)
}

await browser.close()

const c1 = JSON.parse(fs.readFileSync(path.join(OUT, 'wallet-cycle-1.json'), 'utf8'))
const c2 = JSON.parse(fs.readFileSync(path.join(OUT, 'wallet-cycle-2.json'), 'utf8'))
const c3 = JSON.parse(fs.readFileSync(path.join(OUT, 'wallet-cycle-3.json'), 'utf8'))
const stableIds =
  JSON.stringify(c1.exploreIds) === JSON.stringify(c2.exploreIds) &&
  JSON.stringify(c2.exploreIds) === JSON.stringify(c3.exploreIds)

write('featured-farm-selection.json', {
  missionId: 'MELEGA_DEX_V1_FARMS_FINAL_FOUNDER_ACCEPTANCE_ZERO_REFINEMENT',
  selection: featuredSelection,
  priority: ['active', 'nonzero emission', 'nonzero TVL', 'sustainable APR', 'lowest pid'],
})
write('farm-runtime-summary.json', {
  missionId: 'MELEGA_DEX_V1_FARMS_FINAL_FOUNDER_ACCEPTANCE_ZERO_REFINEMENT',
  apiUniqueFarmers: apiFarmers,
  ui: farmRuntime,
  cycles: {
    exploreCounts: [c1.exploreCount, c2.exploreCount, c3.exploreCount],
    myCounts: [c1.myCount, c2.myCount, c3.myCount],
    exploreIdsStable: stableIds,
  },
})
write('farm-contract-links.json', contractLinks)
write('state-transition-log.json', { events: stateLog, exploreIdsStableAcrossCycles: stableIds })
write('responsive-verification.json', {
  viewports: responsive,
  overflowAny: responsive.some((r) => r.overflowX),
  required: [1920, 1600, 1440, 1366, 1024, 430, 390],
})

console.log(
  JSON.stringify(
    {
      uniqueFarmers: apiFarmers.uniqueFarmers,
      status: apiFarmers.status,
      exploreStable: stableIds,
      overflowAny: responsive.some((r) => r.overflowX),
    },
    null,
    2,
  ),
)
