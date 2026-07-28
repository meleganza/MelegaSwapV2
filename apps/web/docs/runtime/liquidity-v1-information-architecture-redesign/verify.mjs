/**
 * LIQUIDITY_V1_INFORMATION_ARCHITECTURE_REDESIGN — responsive visual + DOM order verification.
 */
import { createRequire } from 'module'
const require = createRequire('/tmp/pw-liq-ia/package.json')
const { chromium } = require('playwright')
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'screenshots')
const BASE = process.env.LIQ_IA_BASE || 'http://127.0.0.1:3055'
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
  { name: '1024', width: 1024, height: 768 },
  { name: '390', width: 390, height: 844 },
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const report = {
  mission: 'LIQUIDITY_V1_INFORMATION_ARCHITECTURE_REDESIGN',
  base: BASE,
  capturedAt: new Date().toISOString(),
  viewports: [],
  hierarchy: null,
  overflow: [],
  verdictHints: [],
}

try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    page.setDefaultTimeout(45000)
    await page.goto(`${BASE}/liquidity/`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3500)
    // Explore is async (factory/indexer) — wait briefly without failing validation.
    await page
      .waitForSelector('[data-testid="liquidity-pool-discovery-card"]', { timeout: 12000 })
      .catch(() => null)

    const ia = await page.evaluate(() => {
      const root = document.querySelector('[data-liquidity-ia="provider-first-v1"]')
      const order = [
        'liquidity-hero',
        'liquidity-actions-module',
        'liquidity-my-positions',
        'liquidity-insights-module',
        'liquidity-pool-discovery',
      ].map((key) => {
        const el =
          document.querySelector(`[data-testid="${key}"]`) ||
          document.querySelector(`[data-liquidity-module*="${key.replace('liquidity-', '')}"]`) ||
          document.querySelector(`#${key}`) ||
          document.querySelector(`[data-testid="${key}-module"]`) ||
          null
        // Prefer canonical testids used by modules
        return { key, found: Boolean(el), top: el ? el.getBoundingClientRect().top + window.scrollY : null }
      })

      const modules = {
        hero: document.querySelector('[data-liquidity-module="001-hero"], [data-testid="liquidity-hero-module"]'),
        actions: document.querySelector('[data-testid="liquidity-actions-module"]'),
        positions: document.querySelector('[data-testid="liquidity-my-positions-module"], [data-liquidity-module="006-my-positions"]'),
        insights: document.querySelector('[data-testid="liquidity-insights-module"]'),
        explore: document.querySelector('[data-testid="liquidity-pool-discovery-module"], [data-liquidity-module="003-pool-discovery"]'),
        addForm: document.querySelector('[data-testid="liquidity-add-form-panel"], [data-liquidity-module="004-add-liquidity"]'),
        builder: document.querySelector('[data-testid="liq-building-card"]'),
        newBadge: document.querySelector('[data-testid="liquidity-actions-ai-new-badge"]'),
        journeys: document.querySelector('[data-testid="liquidity-hero-journeys"]'),
      }

      const tops = Object.fromEntries(
        Object.entries(modules).map(([k, el]) => [k, el ? el.getBoundingClientRect().top + window.scrollY : null]),
      )

      const overflowX = document.documentElement.scrollWidth > window.innerWidth + 1
      const bodyOverflow = document.body.scrollWidth > window.innerWidth + 1

      const exploreCards = [...document.querySelectorAll('[data-testid="liquidity-pool-discovery-card"]')]
      const cardBox = exploreCards[0]?.getBoundingClientRect()
      const grid = document.querySelector('[data-testid="liquidity-pool-discovery-grid"]')
      const gridW = grid?.getBoundingClientRect().width || 0
      const cardsPerRowApprox = cardBox && gridW ? Math.floor(gridW / cardBox.width) : null

      return {
        iaAttr: root?.getAttribute('data-liquidity-ia') || null,
        tops,
        overflowX: overflowX || bodyOverflow,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        addEmbedded: document.querySelector('[data-liquidity-add-embedded="1"]') != null,
        builderExpanded: document.querySelector('[data-lb-force-expanded="1"]') != null,
        newBadgeText: modules.newBadge?.textContent?.trim() || null,
        journeysPresent: Boolean(modules.journeys),
        exploreCardCount: exploreCards.length,
        cardsPerRowApprox,
        cardWidth: cardBox ? Math.round(cardBox.width) : null,
        denseAttr: exploreCards[0]?.getAttribute('data-discovery-density') || null,
      }
    })

    const shot = path.join(OUT, `${vp.name}-full.png`)
    await page.screenshot({ path: shot, fullPage: true })
    const aboveFold = path.join(OUT, `${vp.name}-above-fold.png`)
    await page.screenshot({ path: aboveFold, fullPage: false })

    // Actions workspace focus
    const actions = page.locator('[data-testid="liquidity-actions-module"]')
    if (await actions.count()) {
      await actions.scrollIntoViewIfNeeded()
      await page.screenshot({ path: path.join(OUT, `${vp.name}-actions.png`), fullPage: false })
    }

    report.viewports.push({
      ...vp,
      screenshots: {
        full: path.relative(__dirname, shot),
        aboveFold: path.relative(__dirname, aboveFold),
      },
      ia,
    })

    if (!report.hierarchy) {
      report.hierarchy = {
        before: [
          'Hero',
          'Actions (nav cards / journey)',
          'Explore Pools (discovery)',
          'Add Liquidity (often below discovery)',
          'My Positions',
          'Market Snapshot',
          'Liquidity Analytics',
        ],
        after: [
          '001 Hero (single Add Liquidity CTA)',
          '002 Actions 50/50 — Add form + AI Builder expanded',
          '003 My Positions',
          '004 Liquidity Insights (Snapshot + Analytics merged)',
          '005 Explore Pools (dense, bottom)',
        ],
        measuredTops: ia.tops,
      }
    }

    if (ia.overflowX) report.overflow.push(vp.name)
    if (!ia.addEmbedded) report.verdictHints.push(`${vp.name}: add form not embedded`)
    if (!ia.builderExpanded) report.verdictHints.push(`${vp.name}: builder not forceExpanded`)
    if (ia.journeysPresent) report.verdictHints.push(`${vp.name}: hero journeys still present`)
    if (ia.tops.actions != null && ia.tops.hero != null && ia.tops.actions < ia.tops.hero) {
      report.verdictHints.push(`${vp.name}: actions above hero`)
    }
    if (ia.tops.explore != null && ia.tops.positions != null && ia.tops.explore < ia.tops.positions) {
      report.verdictHints.push(`${vp.name}: explore before positions`)
    }
    if (ia.tops.insights != null && ia.tops.positions != null && ia.tops.insights < ia.tops.positions) {
      report.verdictHints.push(`${vp.name}: insights before positions`)
    }

    await context.close()
  }
} finally {
  await browser.close()
}

const tops = report.hierarchy?.measuredTops || {}
const orderOk =
  tops.hero != null &&
  tops.actions != null &&
  tops.positions != null &&
  tops.insights != null &&
  tops.explore != null &&
  tops.hero < tops.actions &&
  tops.actions < tops.positions &&
  tops.positions < tops.insights &&
  tops.insights < tops.explore

report.orderOk = orderOk
report.overflowOk = report.overflow.length === 0
report.certifiedCandidate =
  orderOk &&
  report.overflowOk &&
  report.verdictHints.length === 0 &&
  report.viewports.every((v) => v.ia.addEmbedded && v.ia.builderExpanded && v.ia.denseAttr === 'compact')

writeFileSync(path.join(__dirname, 'verification.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ orderOk, overflowOk: report.overflowOk, certifiedCandidate: report.certifiedCandidate, hints: report.verdictHints, cards: report.viewports.map((v) => ({ vp: v.name, cardW: v.ia.cardWidth, perRow: v.ia.cardsPerRowApprox, dense: v.ia.denseAttr })) }, null, 2))
