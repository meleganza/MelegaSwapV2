#!/usr/bin/env node
/**
 * MELEGASWAP_V2_PRODUCT_POLISH_P1 — browser acceptance (desktop / tablet / 390).
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

async function waitReady(page) {
  await page.waitForTimeout(2500)
}

async function measureModal(page) {
  return page.evaluate(() => {
    const overlay = document.querySelector('[data-melega-modal-overlay="true"]')
    const modal = document.querySelector('[data-melega-modal="true"]')
    if (!modal) return { open: false }
    const r = modal.getBoundingClientRect()
    const titles = [...modal.querySelectorAll('h1, h2, [data-melega-modal-title]')]
      .map((el) => (el.textContent || '').trim())
      .filter(Boolean)
    const brand = !!modal.querySelector('[data-melega-modal-brand="true"]')
    const close = !!modal.querySelector('[data-melega-modal-close], [data-testid*="modal-close"]')
    const accordionOpen = [...modal.querySelectorAll('[data-melega-accordion][data-open="true"]')].length
    const vh = window.innerHeight
    const vw = window.innerWidth
    return {
      open: true,
      brand,
      close,
      titles,
      accordionOpen,
      width: Math.round(r.width),
      height: Math.round(r.height),
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      withinViewport: r.top >= -2 && r.bottom <= vh + 2 && r.left >= -2 && r.right <= vw + 2,
      maxHeightOk: r.height <= vh * 0.82,
      widthBandOk: r.width >= 300 && r.width <= 780,
      overlayPresent: !!overlay,
      bodyTextSample: (modal.innerText || '').slice(0, 400),
    }
  })
}

async function openCreate(page, pathName, triggerTexts) {
  await page.goto(`${BASE}${pathName}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitReady(page)
  for (const text of triggerTexts) {
    const btn = page.locator('button, a').filter({ hasText: new RegExp(text, 'i') }).first()
    if ((await btn.count()) > 0) {
      await btn.click({ timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(800)
      const m = await measureModal(page)
      if (m.open) return m
    }
  }
  // deep-link fallback
  await page.goto(`${BASE}${pathName}${pathName.includes('?') ? '&' : '?'}create=1`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await waitReady(page)
  return measureModal(page)
}

async function probeHome(page, width, label) {
  await page.setViewportSize({ width, height: 900 })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e.message || e)))
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitReady(page)
  await page.screenshot({ path: path.join(SHOTS, `home-${label}.png`), fullPage: false })

  const home = await page.evaluate(() => {
    const body = document.body.innerText || ''
    const topPoolsIdx = body.indexOf('Top Pools')
    const newListingsIdx = body.indexOf('New Listings')
    const topFarmsIdx = body.indexOf('Top Farms')
    const poolsBlock = topPoolsIdx >= 0 ? body.slice(topPoolsIdx, newListingsIdx > topPoolsIdx ? newListingsIdx : topPoolsIdx + 800) : ''
    const farmsBlock = topFarmsIdx >= 0 ? body.slice(topFarmsIdx, topPoolsIdx > topFarmsIdx ? topPoolsIdx : topFarmsIdx + 800) : ''
    const eco = body.includes('PASSPORT') && body.includes('BLACK') && /Identity & rewards/i.test(body) && /Fair-launch infrastructure/i.test(body)
    const header = document.querySelector('header')
    const hh = header ? Math.round(header.getBoundingClientRect().height) : null
    return {
      hasTopPools: topPoolsIdx >= 0,
      hasTopFarms: topFarmsIdx >= 0,
      poolsUnavailable: /Unavailable/i.test(poolsBlock),
      farmsUnavailable: /Unavailable/i.test(farmsBlock),
      ecosystemOk: eco,
      headerHeight: hh,
      oops: /Oops/i.test(body),
    }
  })

  await page.goto(`${BASE}/portfolio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitReady(page)
  await page.screenshot({ path: path.join(SHOTS, `portfolio-${label}.png`), fullPage: false })
  const portfolio = await page.evaluate(() => {
    const body = document.body.innerText || ''
    const shell = document.querySelector('[data-testid="portfolio-studio-screen"], [data-portfolio="v2"]')
    return {
      mounted: !!shell,
      hasAssets: /Assets/i.test(body),
      hasPositions: /Positions/i.test(body),
      hasRewards: /Rewards/i.test(body),
      hasActivity: /Activity/i.test(body),
      hasPassportUi: /Marco Passport|Guest|Verification|Identity/i.test(body) && /Passport/i.test(body),
      header: !!document.querySelector('header'),
    }
  })

  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitReady(page)
  await page.screenshot({ path: path.join(SHOTS, `pools-${label}.png`), fullPage: false })
  const pools = await page.evaluate(() => {
    const emptyCard = [...document.querySelectorAll('*')].some((el) =>
      /No (pool )?positions yet/i.test(el.textContent || ''),
    )
    const explore = /Explore Pools/i.test(document.body.innerText || '')
    return { emptyCardShown: emptyCard, exploreVisible: explore }
  })

  const createPool = await openCreate(page, '/pools', ['Create Pool', 'Create'])
  await page.screenshot({ path: path.join(SHOTS, `create-pool-${label}.png`), fullPage: false })

  const createFarm = await openCreate(page, '/farms', ['Create Farm', 'Create'])
  await page.screenshot({ path: path.join(SHOTS, `create-farm-${label}.png`), fullPage: false })

  // Network switch — open from header chain control when present
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await waitReady(page)
  const chain = page.locator('[data-testid="melega-header-chain"], [data-network-status-pill], button').filter({ hasText: /BNB|BSC|Network|Chain/i }).first()
  let network = { open: false }
  if ((await chain.count()) > 0) {
    await chain.click({ timeout: 4000 }).catch(() => {})
    await page.waitForTimeout(700)
    network = await measureModal(page)
  }
  await page.screenshot({ path: path.join(SHOTS, `network-${label}.png`), fullPage: false })

  const modalPass = (m, requireAccordion) =>
    m.open &&
    m.brand &&
    m.close &&
    m.withinViewport &&
    m.maxHeightOk &&
    m.widthBandOk &&
    m.titles.length <= 2 &&
    (!requireAccordion || m.accordionOpen <= 1)

  return {
    label,
    width,
    home,
    portfolio,
    pools,
    createPool,
    createFarm,
    network,
    pageErrors: errors.slice(0, 8),
    pass: {
      home:
        home.hasTopPools &&
        home.hasTopFarms &&
        !home.poolsUnavailable &&
        !home.farmsUnavailable &&
        home.ecosystemOk &&
        !home.oops,
      portfolio: portfolio.mounted && portfolio.hasAssets && portfolio.hasPositions && !portfolio.hasPassportUi,
      poolsEmpty: !pools.emptyCardShown,
      createPool: modalPass(createPool, true),
      createFarm: modalPass(createFarm, true),
      network: !network.open || modalPass(network, false),
    },
  }
}

const viewports = [
  [1440, 'desktop-1440'],
  [1024, 'tablet-1024'],
  [390, 'mobile-390'],
]

;(async () => {
  fs.mkdirSync(SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const results = []
  for (const [w, label] of viewports) {
    results.push(await probeHome(page, w, label))
  }
  await browser.close()

  const pass = results.every((r) => Object.values(r.pass).every(Boolean))
  const report = {
    mission: 'MELEGASWAP_V2_PRODUCT_POLISH_P1',
    base: BASE,
    verifiedAt: new Date().toISOString(),
    pass,
    results,
  }
  fs.writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ pass, summary: results.map((r) => ({ label: r.label, pass: r.pass })) }, null, 2))
  process.exit(pass ? 0 : 1)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
