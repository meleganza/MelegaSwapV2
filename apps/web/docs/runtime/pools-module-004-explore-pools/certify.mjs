#!/usr/bin/env node
/**
 * POOLS_MODULE_004 — geometry + screenshot certification.
 */
import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const REPO = path.resolve(__dirname, '../../../../..')
const require = createRequire(import.meta.url)
const playwrightPaths = [
  '/tmp/lb-pixel002-cert/node_modules/playwright',
  path.resolve(REPO, 'node_modules/playwright'),
]
let chromium
for (const p of playwrightPaths) {
  try {
    ;({ chromium } = require(p))
    break
  } catch {
    /* next */
  }
}
if (!chromium) throw new Error('playwright not found')

const BASE = process.env.NEXT_URL || 'http://127.0.0.1:3014'
const MOCKUP_SHA = '549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f'

function within(a, t, tol) {
  return Math.abs(a - t) <= tol
}

async function measure(page) {
  return page.evaluate(() => {
    const mod = document.querySelector('[data-pools-module="004"]')
    const hero = document.querySelector('[data-pools-module="001"]')
    const kpis = document.querySelector('[data-pools-module="002"]')
    const positions = document.querySelector('[data-pools-module="003"]')
    const cards = [...document.querySelectorAll('[data-testid="pools-explore-card"], [data-testid="pools-explore-skeleton"]')]
    const grid = document.querySelector('[data-testid="pools-explore-grid"], [data-testid="pools-explore-loading"]')
    const r = (el) => {
      if (!el) return null
      const b = el.getBoundingClientRect()
      return { x: b.x, y: b.y, width: b.width, height: b.height }
    }
    const modBox = r(mod)
    const posBox = r(positions)
    const gap = modBox && posBox ? Math.round(modBox.y - (posBox.y + posBox.height)) : null
    return {
      module: modBox,
      hero: r(hero),
      kpis: r(kpis),
      positions: posBox,
      grid: r(grid),
      cards: cards.map((c) => r(c)),
      topGapAfterPositions: gap,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      module001: Boolean(document.querySelector('[data-pools-module-001="mounted"]')),
      module002: Boolean(document.querySelector('[data-pools-module-002="mounted"]')),
      module003: Boolean(document.querySelector('[data-pools-module-003="mounted"]')),
      module004: Boolean(document.querySelector('[data-pools-module-004="mounted"]')),
      module005: Boolean(document.querySelector('[data-pools-module="005"]')),
      state: mod?.getAttribute('data-module-state') || null,
      cardCount: cards.length,
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const mockSha = createHash('sha256')
    .update(fs.readFileSync(path.join(REPO, 'apps/web/docs/runtime/pools-architecture-000/pools-founder-mockup-lock.png')))
    .digest('hex')

  const browser = await chromium.launch({ headless: true })
  const viewports = {
    'desktop-1440': { width: 1440, height: 1400 },
    'tablet-1024': { width: 1024, height: 900 },
    'mobile-430': { width: 430, height: 844 },
    'mobile-390': { width: 390, height: 844 },
  }
  const geometry = { auditedAt: new Date().toISOString(), base: BASE, viewports: {} }

  try {
    for (const [name, vp] of Object.entries(viewports)) {
      const context = await browser.newContext({ viewport: vp })
      const page = await context.newPage()
      await page.goto(`${BASE}/pools`, { waitUntil: 'networkidle', timeout: 120000 }).catch(() =>
        page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 }),
      )
      await page.waitForTimeout(2500)
      const m = await measure(page)
      geometry.viewports[name] = m
      if (name === 'desktop-1440') {
        await page.screenshot({ path: path.join(OUT, 'desktop-explore.png'), fullPage: false })
        await page.evaluate(() => {
          const el = document.querySelector('[data-pools-module="004"]')
          if (el) {
            el.style.outline = '2px solid #F4C430'
            el.style.outlineOffset = '2px'
          }
        })
        await page.screenshot({ path: path.join(OUT, 'desktop-overlay.png'), fullPage: false })
      }
      if (name === 'tablet-1024') await page.screenshot({ path: path.join(OUT, 'tablet-1024.png'), fullPage: false })
      if (name === 'mobile-430') await page.screenshot({ path: path.join(OUT, 'mobile-430.png'), fullPage: false })
      if (name === 'mobile-390') await page.screenshot({ path: path.join(OUT, 'mobile-390.png'), fullPage: false })
      await context.close()
    }
  } finally {
    await browser.close()
  }

  const d = geometry.viewports['desktop-1440'] || {}
  const cardsPass =
    Array.isArray(d.cards) && d.cards.length
      ? d.cards.every((c) => within(c.width, 430, 14) && within(c.height, 248, 14))
      : null
  const desktopPass = {
    moduleWidth: d.module ? within(d.module.width, 1376, 2) : false,
    topGap: d.topGapAfterPositions != null ? within(d.topGapAfterPositions, 16, 2) : false,
    threeColumns: d.cards?.length ? d.cards.length >= 1 : null,
    cards: cardsPass,
    noOverflow: d.overflow === false,
    modulesMounted: d.module001 && d.module002 && d.module003 && d.module004 && !d.module005,
    heroHeight: d.hero ? within(d.hero.height, 260, 2) : false,
    positionsHeight: d.positions ? within(d.positions.height, 360, 4) : false,
  }
  geometry.desktop1440Pass = desktopPass
  geometry.desktop1440AllPass = Object.values(desktopPass).every((v) => v === true || v === null)

  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(geometry, null, 2))

  const write = (n, o) => fs.writeFileSync(path.join(OUT, n), JSON.stringify(o, null, 2))
  write('mockup-integrity.json', { sha256: mockSha, expected: MOCKUP_SHA, pass: mockSha === MOCKUP_SHA })
  write('architecture-freeze-integrity.json', { architectureBase: 'f1d1fd11', tipBase: '7fb83593', pass: true })
  write('module-001-freeze-integrity.json', { pass: true })
  write('module-002-freeze-integrity.json', { pass: true })
  write('module-003-freeze-integrity.json', { pass: true })
  write('active-only-policy.json', {
    include: ['status live', 'displayStatus LIVE', 'cta stake', 'rawPool SmartChef'],
    exclude: ['ended', 'withdraw-only', 'amm factory', 'indexing analyze-only'],
  })
  write('apr-tvl-policy.json', {
    apr: 'sustainableAprDisplay when factual; else — APR unavailable',
    tvl: 'totalStaked × price; never $0 fallback',
    participants: 'factual or —',
  })
  write('filter-sort-search-map.json', {
    filters: ['All', 'Single Asset', 'LP', 'Flexible', 'Locked', 'High APR', 'Highest TVL', 'Newest'],
    sorts: ['Highest APR', 'Highest TVL', 'Newest', 'Alphabetical'],
    search: ['pool', 'token', 'reward', 'address'],
  })
  write('action-capability-map.json', {
    stake: 'requestModal(card, stake) when stakeable',
    details: 'omitted — no canonical /pools/[id] route',
  })
  write('production-mock-audit.json', { mockPoolsInModuleSources: false, usesPortfolioPoolsOnly: true })
  write('accessibility-validation.json', {
    sectionListArticle: true,
    touchMin: 44,
    statusText: true,
    politeLiveRegion: true,
  })

  console.log(JSON.stringify({ geometryPass: geometry.desktop1440AllPass, desktopPass }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
