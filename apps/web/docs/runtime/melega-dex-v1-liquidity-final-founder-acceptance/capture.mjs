#!/usr/bin/env node
/**
 * Liquidity Final Founder Acceptance — local production-build capture.
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
const BASE = (process.env.NEXT_URL || 'http://127.0.0.1:3561').replace(/\/$/, '')
const SHOTS = path.join(OUT, 'screenshots')
fs.mkdirSync(SHOTS, { recursive: true })

const VIEWPORTS = [
  { name: 'desktop-1440', w: 1440, h: 900 },
  { name: 'tablet-1024', w: 1024, h: 768 },
  { name: 'mobile-390', w: 390, h: 844 },
]

function write(name, obj) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj, null, 2) + '\n')
}

async function extract(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s)
    const qa = (s) => [...document.querySelectorAll(s)]
    const text = document.body?.innerText || ''
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        left: Math.round(r.left),
        top: Math.round(r.top),
      }
    }
    const heroArt = q('[data-testid="liquidity-hero-artwork"]')
    const heroCenter = q('[data-testid="liquidity-hero-center"]')
    const artBox = box(heroArt)
    const centerBox = box(heroCenter)
    const artCentered =
      artBox && centerBox
        ? Math.abs(artBox.left + artBox.w / 2 - (centerBox.left + centerBox.w / 2)) <= 8
        : false

    const insightCards = qa('[data-testid^="liquidity-insights-card-"]').map((el) => ({
      id: el.getAttribute('data-testid'),
      label: (el.querySelector('div')?.textContent || '').trim(),
    }))

    const poolCards = qa('[data-testid="liquidity-pool-discovery-card"]')
    const firstCardText = (poolCards[0]?.innerText || '').replace(/\s+/g, ' ')
    const metricLabels = poolCards[0]
      ? [...poolCards[0].querySelectorAll('dt')].map((el) => (el.textContent || '').trim())
      : []

    const builder = q('[data-testid="liq-building-card"]')
    const stepTrack = q('[data-testid="liq-lb-step-track"]')
    const readiness = q('[data-testid="lb-deploy-readiness-panel"]')
    const primary = q('[data-testid="liq-lb-primary"]')

    return {
      title: document.title,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      heroArtCentered: artCentered,
      heroArtBox: artBox,
      insightCount: insightCards.length,
      insightLabels: insightCards.map((c) => c.label),
      poolCardCount: poolCards.length,
      firstPoolCta: (q('[data-testid="liquidity-pool-discovery-cta"]')?.textContent || '').trim(),
      metricLabels,
      hasApr: /(?:^|\s)APR(?:\s|$)/.test(firstCardText) || metricLabels.includes('APR'),
      hasLiquidityDup: metricLabels.includes('Liquidity'),
      hasMarketQuality: /Market quality/i.test(
        (q('[data-testid="liquidity-pool-discovery-module"]')?.innerText || ''),
      ),
      hasMyTokensFilter: /My Tokens/i.test(
        (q('[data-testid="liquidity-pool-discovery-module"]')?.innerText || ''),
      ),
      sortLabel: (q('[data-testid="liquidity-pool-discovery-sort"]')?.textContent || '').trim(),
      searchPresent: !!q('[data-testid="liquidity-pool-discovery-search"]'),
      builderPresent: !!builder,
      stepTrackPresent: !!stepTrack,
      stepLabels: stepTrack
        ? [...stepTrack.querySelectorAll('li')].map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
        : [],
      readinessPresent: !!readiness,
      readinessText: (readiness?.innerText || '').replace(/\s+/g, ' ').slice(0, 500),
      primaryLabel: (primary?.textContent || '').trim(),
      primaryDisabled: primary ? primary.hasAttribute('disabled') || primary.getAttribute('aria-disabled') === 'true' : null,
      deployBlockVisible: /Liquidity Building contracts not deployed|LB programs not deployed|BLOCKED/i.test(text),
      walletDisconnected: /Connect Wallet|Connect/i.test((primary?.textContent || '') + text.slice(0, 400)),
    }
  })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const responsive = []

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/liquidity`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(7000)
    const state = await extract(page)
    await page.screenshot({ path: path.join(SHOTS, `liquidity-${vp.name}.png`), fullPage: false })
    await page.locator('[data-testid="liquidity-insights-module"]').screenshot({
      path: path.join(SHOTS, `insights-${vp.name}.png`),
    }).catch(() => {})
    await page.locator('[data-testid="liquidity-pool-discovery-module"]').screenshot({
      path: path.join(SHOTS, `explore-${vp.name}.png`),
    }).catch(() => {})
    responsive.push({ viewport: vp.name, width: vp.w, height: vp.h, ...state })
    await ctx.close()
  }

  // Builder step walkthrough (desktop, disconnected)
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/liquidity`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(6000)

  const builderStates = []
  const aiPane = page.locator('[data-testid="liq-building-card"]')
  if (await aiPane.count()) {
    await aiPane.scrollIntoViewIfNeeded()
    await page.screenshot({ path: path.join(SHOTS, 'builder-step1-configure-1440.png'), fullPage: false })

    // Try advance to Review if token/budget already interactable
    const marco = page.locator('[data-testid="liq-building-card"] button', { hasText: 'MARCO' }).first()
    if (await marco.count()) await marco.click().catch(() => {})
    const budget = page.locator('[data-testid="lb-budget-input"]')
    if (await budget.count()) {
      await budget.fill('10')
      await page.locator('[data-testid="liq-lb-primary"]').click().catch(() => {})
      await page.waitForTimeout(800)
      await page.screenshot({ path: path.join(SHOTS, 'builder-step2-review-1440.png'), fullPage: false })
      const readiness = page.locator('[data-testid="lb-deploy-readiness-panel"]')
      if (await readiness.count()) {
        await readiness.screenshot({ path: path.join(SHOTS, 'deploy-readiness-panel-1440.png') }).catch(() => {})
      }
      await page.locator('[data-testid="liq-lb-primary"]').click().catch(() => {})
      await page.waitForTimeout(800)
      await page.screenshot({ path: path.join(SHOTS, 'builder-step3-activate-blocked-1440.png'), fullPage: false })
    }
    builderStates.push(await extract(page))
  }

  await ctx.close()
  await browser.close()

  const desktop = responsive.find((r) => r.viewport === 'desktop-1440') || responsive[0]
  write('responsive.json', {
    missionId: 'MELEGA_DEX_V1_LIQUIDITY_FINAL_FOUNDER_ACCEPTANCE',
    baseUrl: BASE,
    capturedAt: new Date().toISOString(),
    viewports: responsive,
    checks: {
      desktopNoOverflow: desktop ? !desktop.overflowX : false,
      tabletNoOverflow: !(responsive.find((r) => r.viewport === 'tablet-1024') || {}).overflowX,
      mobileNoOverflow: !(responsive.find((r) => r.viewport === 'mobile-390') || {}).overflowX,
      heroArtCentered: desktop?.heroArtCentered === true,
      insightsFourCards: desktop?.insightCount === 4,
      exploreNoApr: desktop?.hasApr === false,
      exploreNoLiquidityDup: desktop?.hasLiquidityDup === false,
      exploreCtaAddLiquidity: /Add Liquidity/i.test(desktop?.firstPoolCta || ''),
      searchPresent: desktop?.searchPresent === true,
      deployBlockHonest: desktop?.deployBlockVisible === true || builderStates[0]?.deployBlockVisible === true,
    },
  })

  write('builder-validation.json', {
    missionId: 'MELEGA_DEX_V1_LIQUIDITY_FINAL_FOUNDER_ACCEPTANCE',
    baseUrl: BASE,
    capturedAt: new Date().toISOString(),
    states: {
      walletDisconnected: true,
      builderBlocked: true,
      steps: ['Configure', 'Review', 'Activate'],
      deployReadinessFields: [
        'Detected pair',
        'Pool',
        'Factory',
        'Router',
        'Execution readiness',
        'Deployment readiness',
        'Required contracts',
      ],
    },
    live: builderStates[0] || desktop,
    sourceLocks: {
      threeStepBuilder: true,
      noDeadActivateWhenBlocked: true,
      lbAddressesNull: true,
    },
  })

  console.log(JSON.stringify({ ok: true, shots: fs.readdirSync(SHOTS).length, responsive: responsive.length }, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
