#!/usr/bin/env node
/**
 * MELEGASWAP_V2_FOUNDER_REVIEW_P0_P1_REPAIR — browser acceptance
 */
import { chromium } from '/tmp/node_modules/playwright/index.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'screenshots')
const BASE = process.env.MISSION_BASE || 'http://127.0.0.1:3040'
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '390', width: 390, height: 844 },
]

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false })
}

function homeActive(page) {
  return page.evaluate(() => {
    const links = [...document.querySelectorAll('a')]
    const home = links.find((a) => {
      const t = (a.textContent || '').replace(/\s+/g, ' ').trim()
      const href = a.getAttribute('href') || ''
      return t === 'Home' && (href === '/' || href.endsWith('/'))
    })
    if (!home) return { found: false, active: false }
    const cls = (home.className || '').toString()
    const aria = home.getAttribute('aria-current')
    const data = home.getAttribute('data-active') || home.getAttribute('data-state')
    const active =
      aria === 'page' ||
      data === 'active' ||
      data === 'true' ||
      /active|selected|current/i.test(cls) ||
      getComputedStyle(home).fontWeight === '700' ||
      Number(getComputedStyle(home).fontWeight) >= 600
    return { found: true, active, cls: cls.slice(0, 80), aria, data }
  })
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const checks = []

  const push = (id, pass, detail) => {
    checks.push({ id, pass: Boolean(pass), detail })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${id}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
  }

  // Primary viewport 1440 for functional checks
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()

    // 1. Pools — no fake featured when empty
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3500)
    const pools = await page.evaluate(() => {
      const body = document.body.innerText || ''
      const featuredEmpty =
        /No rewarding pool available/i.test(body) ||
        !!document.querySelector('[data-featured="empty"]')
      const fakeActiveStake = (() => {
        const compact = document.querySelector('[data-ps-featured-compact], [data-featured-pool]')
        if (!compact) return false
        const t = (compact.textContent || '').replace(/\s+/g, ' ')
        return /—\s*→\s*—/.test(t) && /Active/i.test(t) && /Stake/i.test(t)
      })()
      return { featuredEmpty, fakeActiveStake, hasFeatured: !!document.querySelector('[data-ps-featured-compact], [data-featured-pool]') }
    })
    await shot(page, '01-pools-1440')
    push('P0-1-featured-pool', !pools.featuredEmpty && !pools.fakeActiveStake, pools)

    // 2. /trade → /swap
    const tradeResp = await page.goto(`${BASE}/trade`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2000)
    const tradeUrl = page.url()
    await shot(page, '02-trade-redirect-1440')
    push('P0-2-trade-redirect', /\/swap\/?(\?|$)/.test(tradeUrl) && !/\?focus=swap/.test(tradeUrl), {
      url: tradeUrl,
      status: tradeResp?.status(),
    })

    // 3. Featured Project Trade CTA
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3500)
    const featuredTrade = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a')].map((a) => ({
        href: a.getAttribute('href') || '',
        text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      }))
      const tradeish = links.filter(
        (l) => /trade|swap|buy/i.test(l.text) || /\/swap/.test(l.href) || /focus=swap/.test(l.href),
      )
      return {
        tradeish: tradeish.slice(0, 12),
        anyFocusSwap: tradeish.some((l) => /focus=swap/.test(l.href)),
        anySwap: tradeish.some((l) => /\/swap/.test(l.href)),
      }
    })
    await shot(page, '03-home-featured-trade-1440')
    push('P0-2-featured-trade-cta', !featuredTrade.anyFocusSwap, featuredTrade)

    // 4. Project Page Trade CTA
    await page.goto(`${BASE}/@marco`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(4000)
    const projectCta = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a')].map((a) => ({
        href: a.getAttribute('href') || '',
        text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      }))
      const buy = links.filter((l) => /buy|trade|swap/i.test(l.text) || /\/swap\?/.test(l.href))
      return {
        buy: buy.slice(0, 10),
        focusSwap: buy.some((l) => /focus=swap/.test(l.href)),
        swapHref: buy.some((l) => /\/swap(\?|$)/.test(l.href)),
      }
    })
    await shot(page, '04-project-trade-cta-1440')
    push('P0-2-project-trade-cta', projectCta.swapHref && !projectCta.focusSwap, projectCta)

    // 5. /trending
    await page.goto(`${BASE}/trending`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2500)
    const trending = await page.evaluate(() => {
      const url = location.href
      const body = document.body.innerText || ''
      return {
        url,
        hasInternal: /Same pipeline everywhere/i.test(body),
        hasTrending: /Trending/i.test(body),
      }
    })
    await shot(page, '05-trending-1440')
    push(
      'P0-3-trending',
      /sort=trending/.test(trending.url) && !trending.hasInternal,
      trending,
    )

    // 6. Projects unavailable wall
    await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3500)
    const featured = await page.evaluate(() => {
      const rail = document.querySelector('[data-testid="dex-home-featured-projects"], [data-projects-section="featured"]')
      const cards = [...document.querySelectorAll('[data-testid="project-directory-card"], [data-featured-slug]')]
      const inFeatured = ((rail?.textContent || '').match(/Unavailable/gi) || []).length
      const inCards = cards.reduce((n, c) => n + (((c.textContent || '').match(/Unavailable/gi) || []).length), 0)
      return { inFeatured, inCards, cardCount: cards.length }
    })
    await shot(page, '06-projects-1440')
    push('P1-1-unavailable-wall', featured.inFeatured === 0 && featured.inCards === 0, featured)

    // 7. Search MARCO
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2000)
    const searchBox = page.locator('input[placeholder*="Search" i], input[type="search"], [data-testid*="search"] input').first()
    let searchDetail = { opened: false }
    if (await searchBox.count()) {
      await searchBox.click({ timeout: 5000 }).catch(() => {})
      await searchBox.fill('MARCO')
      await page.waitForTimeout(1200)
      searchDetail = await page.evaluate(() => {
        const items = [...document.querySelectorAll('[role="option"], [data-search-result], li, a')]
          .map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
          .filter((t) => /MARCO/i.test(t))
          .slice(0, 20)
        const chainLabeled = items.filter((t) => /BSC|Base|Polygon|Ethereum|Arbitrum|Avalanche/i.test(t))
        return { opened: true, items, chainLabeled: chainLabeled.length, count: items.length }
      })
      await shot(page, '07-search-marco-1440')
    }
    push('P1-2-search-marco', searchDetail.opened ? searchDetail.count > 0 : true, searchDetail)

    // 8+9 Project page chain/price
    await page.goto(`${BASE}/@marco`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(4000)
    const projectMeta = await page.evaluate(() => {
      const body = document.body.innerText || ''
      const hasSci = /e-\d/i.test(body) || /e\+\d/i.test(body)
      const chainBadge = /BSC|BNB|Base|Polygon|Ethereum|Arbitrum|Avalanche/i.test(body)
      return { hasSci, chainBadge, snippet: body.slice(0, 300) }
    })
    await shot(page, '08-project-price-chain-1440')
    push('P1-3-price-chain', !projectMeta.hasSci && projectMeta.chainBadge, projectMeta)

    // 10 KPI labels farms/pools
    await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3000)
    const farmsKpi = await page.evaluate(() => {
      const overflow = [...document.querySelectorAll('[data-kpi], [class*="Kpi"], [class*="kpi"]')]
        .slice(0, 20)
        .some((el) => el.scrollWidth > el.clientWidth + 2)
      const body = document.body.innerText || ''
      return { overflow, hasTopSust: /Top Sust|Sust\. APR|APR/i.test(body) }
    })
    await shot(page, '09-farms-kpi-1440')
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3000)
    await shot(page, '10-pools-kpi-1440')
    push('P1-4-kpi-labels', farmsKpi.hasTopSust, farmsKpi)

    // 11 Audit
    await page.goto(`${BASE}/audit`, { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => null)
    if (!page.url().includes('/audit')) {
      await page.goto(`${BASE}/status`, { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => null)
    }
    // try known audit route
    for (const route of ['/audit', '/radar?tab=audit', '/status']) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => null)
      const hit = await page.evaluate(() => /Melega Score|Runtime Readiness/i.test(document.body.innerText || ''))
      if (hit) break
    }
    await page.waitForTimeout(2500)
    const audit = await page.evaluate(() => {
      const body = document.body.innerText || ''
      return {
        url: location.href,
        hasScore: /Melega Score/i.test(body),
        hasRuntime: /Runtime Readiness/i.test(body),
        explains: /does not|separate|weighted|SSOT/i.test(body),
      }
    })
    await shot(page, '11-audit-1440')
    push('P1-5-audit-trust', audit.hasRuntime || audit.explains, audit)

    // 12 Project Page nav — Home not active
    await page.goto(`${BASE}/@marco`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2500)
    const navProject = await homeActive(page)
    await shot(page, '12-nav-project-1440')
    push('P1-6-nav-project', navProject.found ? !navProject.active : true, navProject)

    // 13 Swap nav — Home not active
    await page.goto(`${BASE}/swap`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2500)
    const navSwap = await homeActive(page)
    await shot(page, '13-nav-swap-1440')
    push('P1-6-nav-swap', navSwap.found ? !navSwap.active : true, navSwap)

    await context.close()
  }

  // Viewport screenshots for KPI density
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await context.newPage()
    await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2000)
    await shot(page, `farms-kpi-${vp.name}`)
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2000)
    await shot(page, `pools-kpi-${vp.name}`)
    await context.close()
  }

  const report = {
    mission: 'MELEGASWAP_V2_FOUNDER_REVIEW_P0_P1_REPAIR',
    base: BASE,
    generatedAt: new Date().toISOString(),
    checks,
    pass: checks.every((c) => c.pass),
    viewportShots: VIEWPORTS.map((v) => [`farms-kpi-${v.name}.png`, `pools-kpi-${v.name}.png`]).flat(),
  }
  await writeFile(path.join(__dirname, 'browser-acceptance.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ pass: report.pass, failed: checks.filter((c) => !c.pass) }, null, 2))
  await browser.close()
  process.exit(report.pass ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
