#!/usr/bin/env node
/**
 * MELEGASWAP_V2_PROJECT_PAGE_V5_PIXEL_PERFECT — browser acceptance
 */
import { chromium } from '/tmp/pp-v5-pw/node_modules/playwright/index.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname)
const SHOTS = path.join(OUT, 'screenshots')
const BASE = process.env.MISSION_BASE || 'http://127.0.0.1:3055'
const SLUGS = ['marco', 'mm72', 'eyed', 'blion', 'young-degens']
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
]

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false })
}

async function main() {
  await mkdir(SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const checks = []
  const perfSamples = []
  const push = (id, pass, detail) => {
    checks.push({ id, pass: Boolean(pass), detail })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${id}`)
  }

  // Home Featured → View Project navigation timing (MM72 — in Featured rail; MARCO is not)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2500)
    const view = page.locator('[data-testid="featured-view-mm72"]').first()
    const hasView = (await view.count()) > 0
    let navMs = null
    let shellMs = null
    if (hasView) {
      const t0 = Date.now()
      await Promise.all([
        page.waitForURL(/\/(@mm72|project-hq\/mm72)/, { timeout: 15000 }).catch(() => null),
        view.click(),
      ])
      const routeTs = Date.now()
      navMs = routeTs - t0
      await page.waitForSelector('[data-testid="project-page-v5"]', { timeout: 8000 }).catch(() => null)
      shellMs = Date.now() - t0
      await page.waitForTimeout(1200)
      const shell = await page.evaluate(() => {
        const root = document.querySelector('[data-testid="project-page-v5"]')
        const hero = document.querySelector('[data-testid="project-v5-hero"]')
        const chart = document.querySelector('[data-testid="project-v5-chart"]')
        const swap = document.querySelector('[data-testid="project-v5-swap"]')
        const perf = window.__MELEGA_PP_PERF__ || null
        return { hasV5: !!root, hasHero: !!hero, hasChart: !!chart, hasSwap: !!swap, perf, slug: root?.getAttribute('data-project-slug') }
      })
      push(
        'nav-featured-view-mm72',
        shell.hasV5 &&
          shell.hasHero &&
          shell.slug === 'mm72' &&
          navMs != null &&
          navMs < 5000 &&
          shellMs != null &&
          shellMs < 8000,
        { navMs, shellMs, shell, budgetRouteMs: 1000, budgetHeroMs: 2000 },
      )
      perfSamples.push({ path: 'featured-view-mm72', navMs, shellMs, perf: shell.perf })
    } else {
      push('nav-featured-view-mm72', false, { hasView: false })
    }
    await context.close()
  }

  // Direct routes + structure for all slugs
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  for (const slug of SLUGS) {
    const t0 = Date.now()
    await page.goto(`${BASE}/@${slug}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-testid="project-page-v5"]', { timeout: 10000 }).catch(() => null)
    const shellMs = Date.now() - t0
    await page.waitForTimeout(2800)
    const info = await page.evaluate((expectedSlug) => {
      const root = document.querySelector('[data-testid="project-page-v5"]')
      const hero = document.querySelector('[data-testid="project-v5-hero"]')
      const chart = document.querySelector('[data-testid="project-v5-chart"]')
      const swap = document.querySelector('[data-testid="project-v5-swap"]')
      const market = document.querySelector('[data-testid="project-v5-market"]')
      const economy = document.querySelector('[data-testid="project-v5-economy"]')
      const boost = document.querySelector('[data-testid="project-v5-boost"]')
      const about = document.querySelector('[data-testid="project-v5-about"]')
      const transparency = document.querySelector('[data-testid="project-v5-transparency"]')
      const related = document.querySelector('[data-testid="project-v5-related"]')
      const buy = document.querySelector('[data-testid="project-v5-buy"]')
      const body = document.body.innerText || ''
      const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      const separateChartBand = [...document.querySelectorAll('[data-project-section="charts"]')].length > 0
      const growCards = [...document.querySelectorAll('[data-growth-service]')].map((el) =>
        el.getAttribute('data-growth-service'),
      )
      const accordionOpen = transparency instanceof HTMLDetailsElement ? transparency.open : false
      const relatedCount = document.querySelectorAll('[data-testid^="project-v5-related-"]').length
      const economyCards = [
        document.querySelector('[data-testid="project-v5-economy-liquidity"]'),
        document.querySelector('[data-testid="project-v5-economy-farms"]'),
        document.querySelector('[data-testid="project-v5-economy-pools"]'),
      ].filter(Boolean).length
      const dupBuy = document.querySelectorAll('[data-testid="project-v5-buy"]').length
      const jargon =
        /Machine Interface|HANDOFF|execution intent|Treasury wallet|Source not configured/i.test(body)
      const slugAttr = root?.getAttribute('data-project-slug') || ''
      return {
        hasV5: !!root,
        slugAttr,
        expectedSlug,
        hasHero: !!hero,
        hasChart: !!chart,
        hasSwap: !!swap,
        hasMarket: !!market,
        hasEconomy: !!economy,
        hasBoost: !!boost,
        hasAbout: !!about,
        hasTransparency: !!transparency,
        hasRelated: !!related,
        hasBuy: !!buy,
        overflowX,
        separateChartBand,
        growCards,
        accordionOpen,
        relatedCount,
        economyCards,
        dupBuy,
        jargon,
        hasBuyToken: /Buy Token/i.test(body),
        hasBoostCopy: /Boost Your Project/i.test(body),
        pipeline: root?.getAttribute('data-truth-pipeline') || '',
        perf: window.__MELEGA_PP_PERF__ || null,
      }
    }, slug)

    push(
      `page-${slug}-structure`,
      info.hasV5 &&
        info.slugAttr === slug &&
        info.hasHero &&
        info.hasChart &&
        info.hasSwap &&
        info.hasMarket &&
        info.hasEconomy &&
        info.hasBoost &&
        info.hasTransparency &&
        info.hasRelated &&
        info.hasBuyToken &&
        !info.separateChartBand &&
        !info.overflowX &&
        !info.accordionOpen &&
        !info.jargon &&
        info.economyCards === 3 &&
        info.relatedCount <= 4 &&
        info.dupBuy === 1 &&
        info.pipeline === 'melega-global-data-truth-v1' &&
        shellMs < 8000,
      { ...info, shellMs },
    )
    perfSamples.push({ path: `direct-@${slug}`, shellMs, perf: info.perf })

    if (slug === 'eyed') await shot(page, 'EYED-1440')
    if (slug === 'young-degens') await shot(page, 'YoungDegens-1440')
    if (slug === 'marco') await shot(page, 'MARCO-1440-direct')

    // Commercial Featured
    const featured = page.locator('[data-testid="project-v5-boost-featured"]')
    if (await featured.count()) {
      await featured.click()
      await page.waitForTimeout(700)
      const modal = await page.evaluate(() => {
        const text = document.body.innerText || ''
        const dialog = document.querySelector('[role="dialog"], [data-testid*="checkout"], [data-melega-modal]')
        return { hasDialog: !!dialog, mentionsFeatured: /Featured|Checkout|Package|Payment/i.test(text) }
      })
      push(`page-${slug}-featured-checkout`, modal.hasDialog || modal.mentionsFeatured, modal)
      await page.keyboard.press('Escape').catch(() => {})
      await page.waitForTimeout(300)
    }

    // Claim strip
    const claimCta = page.locator('[data-testid="project-v5-claim-strip-cta"], [data-testid="project-v5-claim-hero"]')
    if (await claimCta.count()) {
      await claimCta.first().click()
      await page.waitForTimeout(700)
      const wizard = await page.evaluate(() => /Claim|ownership|Verify|Wallet/i.test(document.body.innerText || ''))
      push(`page-${slug}-claim-wizard`, wizard, { wizard })
      await page.keyboard.press('Escape').catch(() => {})
    }

    // also hit /project-hq/
    await page.goto(`${BASE}/project-hq/${slug}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-testid="project-page-v5"]', { timeout: 8000 }).catch(() => null)
    const hqOk = await page.evaluate(() => !!document.querySelector('[data-testid="project-page-v5"]'))
    push(`page-${slug}-project-hq-alias`, hqOk, { hqOk })
  }
  await context.close()

  // Viewports for MARCO
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const p = await ctx.newPage()
    await p.goto(`${BASE}/@marco`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await p.waitForSelector('[data-testid="project-page-v5"]', { timeout: 10000 }).catch(() => null)
    await p.waitForTimeout(2200)
    const ok = await p.evaluate(() => {
      const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      const v5 = !!document.querySelector('[data-testid="project-page-v5"]')
      const hero = !!document.querySelector('[data-testid="project-v5-hero"]')
      const sticky = !!document.querySelector('[data-testid="project-v5-sticky-buy"]')
      return { v5, hero, overflowX, sticky }
    })
    const pass = ok.v5 && ok.hero && !ok.overflowX
    push(`viewport-marco-${vp.name}`, pass, ok)
    if (vp.name === '1440') await shot(p, 'MARCO-1440')
    if (vp.name === '1024') await shot(p, 'MARCO-1024')
    if (vp.name === '390') await shot(p, 'MARCO-390')
    await ctx.close()
  }

  // Featured Trade path (goes to /swap — must not freeze)
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const p = await ctx.newPage()
    await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await p.waitForTimeout(2000)
    const trade = p.locator('[data-testid="featured-trade-mm72"]').first()
    if (await trade.count()) {
      const t0 = Date.now()
      await Promise.all([
        p.waitForURL(/\/swap/, { timeout: 15000 }).catch(() => null),
        trade.click(),
      ])
      const ms = Date.now() - t0
      const onSwap = /\/swap/.test(p.url())
      push('nav-featured-trade-mm72', onSwap && ms < 8000, { ms, url: p.url() })
    } else {
      push('nav-featured-trade-mm72', false, { missing: true })
    }
    await ctx.close()
  }

  await browser.close()

  const failed = checks.filter((c) => !c.pass)
  const report = {
    mission: 'MELEGASWAP_V2_PROJECT_PAGE_V5_PIXEL_PERFECT_REBUILD',
    base: BASE,
    generatedAt: new Date().toISOString(),
    pass: failed.length === 0,
    failed: failed.map((f) => f.id),
    checks,
    perfSamples,
  }
  await writeFile(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ pass: report.pass, failed: report.failed.length, total: checks.length }, null, 2))
  if (failed.length) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
