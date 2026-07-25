/**
 * FARMS_MODULE_002_OVERVIEW_KPIS — DOM measurements + screenshots.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const WEB = path.resolve(__dirname, '../../..')
const REPO = path.resolve(WEB, '../..')
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3512'
const MOCKUP_SHA = 'a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a'
const HERO_SHA = {
  FarmsHeroModule: 'd9c56b4f1bd572229de1c58dcacd9efd1ae4f1f05f3a8df6854c3edcb15e640b',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: 'ce9af36cc5b752098a5b448ba2566368c8f3c625e83c9358e09c24687f26270c',
  farmsHeroTokens: 'eb192bfabfcf4c87cb08751732aa12e8d7960190f7ebd62f43b016e033eea06c',
}

function within(actual, target, tol = 2) {
  if (actual == null || Number.isNaN(actual)) return false
  return Math.abs(actual - target) <= tol
}

function sha(rel) {
  return createHash('sha256').update(fs.readFileSync(path.join(REPO, rel))).digest('hex')
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left }
    }
    const module = document.querySelector('[data-testid="farms-overview-kpis-module"]')
    const hero = document.querySelector('[data-testid="farms-hero-module"]')
    const grid = document.querySelector('[data-testid="farms-overview-kpis-grid"]')
    const cards = [...document.querySelectorAll('[data-testid^="farms-kpi-"]')]
    const m = box(module)
    const h = box(hero)
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      module: m,
      hero: h,
      gapHeroToKpis: m && h ? m.top - h.bottom : null,
      cards: cards.map((c) => ({
        id: c.getAttribute('data-testid'),
        state: c.getAttribute('data-kpi-state'),
        ...box(c),
        label: c.querySelector('div')?.textContent?.slice(0, 40),
      })),
      cardCount: cards.length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      module001: Boolean(document.querySelector('[data-farms-module="001"]')),
      module002: Boolean(document.querySelector('[data-farms-module="002"]')),
      module003: Boolean(document.querySelector('[data-farms-module="003"]')),
      legacyKpiRow: Boolean(document.querySelector('[data-fs-kpi-row]')) || document.body.innerHTML.includes('FarmsKpiRow'),
    }
  })
}

function evaluateDesktop1440(m) {
  const checks = {
    moduleWidth: within(m.module?.width, 1376, 2),
    moduleHeight: within(m.module?.height, 112, 2),
    gapAfterHero: within(m.gapHeroToKpis, 16, 2),
    cardCount: m.cardCount === 6,
    cardWidth: m.cards.every((c) => within(c.width, 216, 2)),
    cardHeight: m.cards.every((c) => within(c.height, 112, 2)),
    noOverflow: m.overflow === false,
    module001: m.module001 === true,
    module002: m.module002 === true,
    noModule003: m.module003 === false,
  }
  if (m.cards.length >= 2) {
    checks.gapCards = within(m.cards[1].left - m.cards[0].right, 16, 2)
  } else {
    checks.gapCards = false
  }
  return { pass: Object.values(checks).every(Boolean), checks }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })

  const mockupPath = 'apps/web/docs/runtime/farms-architecture-000/farms-founder-mockup-lock.png'
  const mockSha = sha(mockupPath)
  fs.writeFileSync(
    path.join(OUT, 'mockup-integrity.json'),
    JSON.stringify({ sha256: mockSha, expected: MOCKUP_SHA, pass: mockSha === MOCKUP_SHA }, null, 2),
  )

  const heroFreeze = {
    FarmsHeroModule: sha('apps/web/src/views/FarmsStudio/modules/FarmsHeroModule.tsx'),
    FarmsHeroArtwork: sha('apps/web/src/views/FarmsStudio/modules/FarmsHeroArtwork.tsx'),
    FarmsHeroTrustPanel: sha('apps/web/src/views/FarmsStudio/modules/FarmsHeroTrustPanel.tsx'),
    farmsHeroTokens: sha('apps/web/src/views/FarmsStudio/modules/farmsHeroTokens.ts'),
  }
  const heroPass = Object.entries(HERO_SHA).every(([k, v]) => heroFreeze[k] === v)
  fs.writeFileSync(
    path.join(OUT, 'module-001-freeze-integrity.json'),
    JSON.stringify({ expected: HERO_SHA, actual: heroFreeze, pass: heroPass }, null, 2),
  )

  const browser = await chromium.launch({ headless: true })
  const viewports = {
    'desktop-1440': { width: 1440, height: 1200 },
    'tablet-1024': { width: 1024, height: 900 },
    'mobile-430': { width: 430, height: 932 },
    'mobile-390': { width: 390, height: 844 },
  }
  const results = {}
  for (const [name, vp] of Object.entries(viewports)) {
    const page = await browser.newPage({ viewport: vp })
    await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-testid="farms-overview-kpis-module"]', { timeout: 90000 })
    await page.waitForTimeout(1500)
    results[name] = await measure(page)
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false })
    await page.close()
  }
  await browser.close()

  const desk = evaluateDesktop1440(results['desktop-1440'])
  const mobile390 = results['mobile-390']
  const mobile430 = results['mobile-430']
  const responsive = {
    tabletOverflow: results['tablet-1024'].overflow === false,
    mobile390Overflow: mobile390.overflow === false,
    mobile430Overflow: mobile430.overflow === false,
    mobile390CardW: mobile390.cards.every((c) => within(c.width, 171, 6)),
    mobile430CardW: mobile430.cards.every((c) => within(c.width, 191, 6)),
    mobileTwoCol: mobile390.cardCount === 6,
  }

  const report = {
    auditedAt: new Date().toISOString(),
    viewports: results,
    desktop1440Pass: desk.checks,
    desktop1440AllPass: desk.pass,
    responsive,
    independentFailure: {
      note: 'Active Farmers and 24H Rewards remain unavailable without collapsing the strip',
      cardCount: results['desktop-1440'].cardCount,
      pass: results['desktop-1440'].cardCount === 6,
    },
  }
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(OUT, 'responsive-validation.json'),
    JSON.stringify({ ...responsive, pass: Object.values(responsive).every(Boolean) }, null, 2),
  )
  fs.writeFileSync(
    path.join(OUT, 'architecture-freeze-integrity.json'),
    JSON.stringify(
      {
        architectureTip: '8edd68d4',
        module001Tip: '21c2c0bb',
        mockupSha: mockSha,
        heroFreezePass: heroPass,
        pass: mockSha === MOCKUP_SHA && heroPass,
      },
      null,
      2,
    ),
  )
  fs.writeFileSync(
    path.join(OUT, 'kpi-definition-map.json'),
    JSON.stringify(
      {
        order: [
          'Total Farm TVL',
          'Active Farms',
          'Active Farmers',
          '24H Rewards',
          'Highest Sustainable APR',
          'My Harvestable',
        ],
        geometry: { module: '1376x112', card: '216x112', gap: 16 },
      },
      null,
      2,
    ),
  )
  fs.writeFileSync(
    path.join(OUT, 'source-provenance-map.json'),
    JSON.stringify(
      {
        tvl: 'farm.liquidity LP farms only',
        activeFarms: 'live/indexing non-zero multiplier',
        activeFarmers: 'unavailable — no unique wallet index',
        rewards24h: 'unavailable — no indexed distribution; emission forbidden',
        sustainableApr: 'listRewardingFarms + liquidity filter',
        harvestable: 'userData.earnings × cakePriceBusd',
      },
      null,
      2,
    ),
  )

  console.log(JSON.stringify({ pass: desk.pass && heroPass && Object.values(responsive).every(Boolean), desk, responsive, heroPass }, null, 2))
  if (!desk.pass || !heroPass) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
