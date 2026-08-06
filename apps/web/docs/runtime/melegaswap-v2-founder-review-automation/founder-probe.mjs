#!/usr/bin/env node
/**
 * Founder Review Automation — try to break the production product surface.
 * No feature work. Capture screenshots + structured observations.
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

const BASE = (process.env.BASE_URL || 'https://www.melega.finance').replace(/\/$/, '')
const OUT = __dirname
const SHOTS = path.join(OUT, 'screenshots')
fs.mkdirSync(SHOTS, { recursive: true })

const PAGES = [
  { id: 'home', path: '/' },
  { id: 'projects', path: '/projects' },
  { id: 'project-page', path: '/project-hq/marco' },
  { id: 'smart-swap', path: '/swap' },
  { id: 'trade', path: '/trade' },
  { id: 'farms', path: '/farms' },
  { id: 'pools', path: '/pools' },
  { id: 'portfolio', path: '/portfolio' },
  { id: 'list', path: '/list' },
  { id: 'audit', path: '/audit' },
  { id: 'trending', path: '/trending' },
  { id: 'liquidity-studio', path: '/liquidity-studio' },
]

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]

function extractSignals(text) {
  const t = text || ''
  const count = (re) => (t.match(re) || []).length
  return {
    unavailable: count(/\bUnavailable\b/gi),
    emDash: count(/(^|\s)—(\s|$)/g),
    comingSoon: count(/coming soon|not available|TODO|WIP|placeholder/gi),
    error: count(/\berror\b|\bfailed\b|\bsomething went wrong\b/gi),
    emptyZero: count(/\b0\.00\b|\b\$0\b|\bn\/a\b/gi),
    connectWallet: count(/connect wallet/gi),
    loading: count(/\bloading\b|\bFetching\b/gi),
  }
}

async function pageProbe(page) {
  return page.evaluate(() => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ').trim()
    const title = document.title
    const h1 = [...document.querySelectorAll('h1')].map((el) => el.textContent?.trim()).filter(Boolean)
    const h2 = [...document.querySelectorAll('h2')].map((el) => el.textContent?.trim()).filter(Boolean).slice(0, 20)
    const buttons = [...document.querySelectorAll('button, a[role="button"], [data-testid]')].length
    const modalOpen = !!document.querySelector('[data-melega-modal="true"], [role="dialog"]')
    const overflowX = document.documentElement.scrollWidth > window.innerWidth + 2
    const header = document.querySelector('header, [data-melega-global-header], [data-testid*="header"]')
    const search = document.querySelector(
      'input[type="search"], input[placeholder*="Search" i], [data-testid*="search"] input, [data-testid*="search"]',
    )
    const chain = document.querySelector('[data-testid="melega-header-chain"], [data-testid*="chain"]')
    const featured = !!document.querySelector('[data-testid="dex-home-featured-projects"], [data-featured-pipeline]')
    const grow = (document.querySelector('[data-testid="project-v3-grow"]')?.innerText || '').slice(0, 200)
    const duplicates = (() => {
      const labels = [...document.querySelectorAll('h2, h3, [class*="Title"]')]
        .map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
        .filter((s) => s.length > 3 && s.length < 60)
      const map = {}
      for (const l of labels) map[l] = (map[l] || 0) + 1
      return Object.entries(map)
        .filter(([, n]) => n > 1)
        .map(([l, n]) => ({ label: l, count: n }))
        .slice(0, 12)
    })()
    const blankish = [...document.querySelectorAll('main, [data-testid]')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const t = (el.innerText || '').trim()
        return r.height > 120 && t.length < 8
      })
      .slice(0, 5)
      .map((el) => ({ testid: el.getAttribute('data-testid'), h: Math.round(el.getBoundingClientRect().height) }))
    return {
      title,
      h1,
      h2,
      textSample: text.slice(0, 900),
      textLen: text.length,
      buttons,
      modalOpen,
      overflowX,
      hasHeader: !!header,
      hasSearch: !!search,
      hasChainControl: !!chain,
      featured,
      grow,
      duplicates,
      blankish,
      href: location.href,
    }
  })
}

const findings = []
const pageNotes = {}
const browser = await chromium.launch({ headless: true })

try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })
    const page = await context.newPage()
    page.setDefaultTimeout(45000)

    for (const route of PAGES) {
      const key = `${route.id}-${vp.name}`
      try {
        const res = await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
        await page.waitForTimeout(2400)
        const status = res?.status() ?? 0
        const probe = await pageProbe(page)
        const signals = extractSignals(probe.textSample + ' ' + (await page.evaluate(() => document.body.innerText)))
        await page.screenshot({ path: path.join(SHOTS, `${key}.png`), fullPage: false })
        // mid-scroll for density issues
        await page.evaluate(() => window.scrollBy(0, Math.min(900, document.body.scrollHeight * 0.35)))
        await page.waitForTimeout(500)
        await page.screenshot({ path: path.join(SHOTS, `${key}-scroll.png`), fullPage: false })

        pageNotes[key] = { status, probe, signals, ok: status >= 200 && status < 400 }

        if (status >= 400) {
          findings.push({ id: `http-${key}`, priority: 'P0', page: route.id, viewport: vp.name, issue: `HTTP ${status}` })
        }
        if (probe.overflowX) {
          findings.push({
            id: `overflow-${key}`,
            priority: 'P1',
            page: route.id,
            viewport: vp.name,
            issue: 'Horizontal overflow',
          })
        }
        if (signals.unavailable >= 4) {
          findings.push({
            id: `unavail-${key}`,
            priority: 'P1',
            page: route.id,
            viewport: vp.name,
            issue: `${signals.unavailable}× Unavailable labels`,
          })
        }
        if (signals.error >= 2) {
          findings.push({
            id: `err-${key}`,
            priority: 'P0',
            page: route.id,
            viewport: vp.name,
            issue: `Error copy visible (${signals.error})`,
          })
        }
      } catch (e) {
        pageNotes[key] = { ok: false, error: e instanceof Error ? e.message : String(e) }
        findings.push({
          id: `crash-${key}`,
          priority: 'P0',
          page: route.id,
          viewport: vp.name,
          issue: e instanceof Error ? e.message : String(e),
        })
      }
    }

    // Interactive flows — desktop only
    if (vp.name === '1440') {
      // SEARCH
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      const searchBox = page
        .locator(
          'input[placeholder*="Search" i], input[type="search"], [data-testid*="search"] input, header input',
        )
        .first()
      let searchResult = { tried: false }
      if ((await searchBox.count()) > 0) {
        searchResult.tried = true
        await searchBox.click().catch(() => {})
        await searchBox.fill('MARCO').catch(() => {})
        await page.waitForTimeout(1200)
        await page.screenshot({ path: path.join(SHOTS, 'search-marco-1440.png') })
        searchResult = {
          ...searchResult,
          ...(await page.evaluate(() => {
            const text = document.body.innerText || ''
            return {
              hasResults: /MARCO|Marco|project/i.test(text),
              dropdown: !!document.querySelector('[role="listbox"], [data-testid*="search-result"], [data-testid*="suggest"]'),
              textSnippet: text.slice(0, 400),
            }
          })),
        }
      }
      pageNotes['search-1440'] = searchResult

      // CHAIN SWITCH
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1500)
      const chainBtn = page.locator('[data-testid="melega-header-chain"]').first()
      let chainResult = { open: false }
      if ((await chainBtn.count()) > 0) {
        await chainBtn.click().catch(() => {})
        await page.waitForTimeout(900)
        chainResult = await page.evaluate(() => {
          const modal = document.querySelector('[data-melega-modal="true"], [role="dialog"]')
          return {
            open: !!modal,
            system: modal?.getAttribute('data-melega-modal-system'),
            title: modal?.querySelector('[data-melega-modal-title]')?.textContent?.trim() || null,
            text: (modal?.innerText || '').slice(0, 400),
          }
        })
        await page.screenshot({ path: path.join(SHOTS, 'chain-switch-1440.png') })
        await page.keyboard.press('Escape').catch(() => {})
      }
      pageNotes['chain-switch-1440'] = chainResult

      // FARMS CREATE MODAL
      await page.goto(`${BASE}/farms?create=1`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2200)
      const farmModal = await page.evaluate(() => {
        const m = document.querySelector('[data-melega-modal="true"]')
        if (!m) return { open: false }
        const r = m.getBoundingClientRect()
        return {
          open: true,
          system: m.getAttribute('data-melega-modal-system'),
          title: m.querySelector('[data-melega-modal-title]')?.textContent?.trim(),
          height: Math.round(r.height),
          within: r.bottom <= window.innerHeight + 4,
        }
      })
      await page.screenshot({ path: path.join(SHOTS, 'modal-create-farm-1440.png') })
      pageNotes['modal-farm-1440'] = farmModal

      // POOLS CREATE MODAL
      await page.goto(`${BASE}/pools?create=1`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2200)
      const poolModal = await page.evaluate(() => {
        const m = document.querySelector('[data-melega-modal="true"]')
        if (!m) return { open: false }
        return {
          open: true,
          system: m.getAttribute('data-melega-modal-system'),
          title: m.querySelector('[data-melega-modal-title]')?.textContent?.trim(),
        }
      })
      await page.screenshot({ path: path.join(SHOTS, 'modal-create-pool-1440.png') })
      pageNotes['modal-pool-1440'] = poolModal

      // PROJECT PAGE — Boost / Featured / Claim
      await page.goto(`${BASE}/project-hq/marco`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2800)
      await page.locator('[data-testid="project-v3-grow"]').scrollIntoViewIfNeeded().catch(() => {})
      await page.waitForTimeout(400)
      await page.screenshot({ path: path.join(SHOTS, 'project-boost-hub-1440.png') })

      const featuredCta = page.locator('[data-testid="project-v3-grow-featured"]').first()
      let featuredCheckout = { open: false }
      if ((await featuredCta.count()) > 0) {
        await featuredCta.click().catch(() => {})
        await page.waitForTimeout(800)
        featuredCheckout = await page.evaluate(() => {
          const m = document.querySelector('[data-melega-modal="true"]')
          return {
            open: !!m,
            testId: m?.getAttribute('data-testid'),
            title: m?.querySelector('[data-melega-modal-title]')?.textContent?.trim(),
            system: m?.getAttribute('data-melega-modal-system'),
            steps: [...(m?.querySelectorAll('[data-melega-modal-steps] span') || [])].map((el) =>
              el.textContent?.trim(),
            ),
          }
        })
        await page.screenshot({ path: path.join(SHOTS, 'featured-checkout-1440.png') })
        await page.keyboard.press('Escape').catch(() => {})
        await page.waitForTimeout(400)
      } else {
        // production may still link out
        featuredCheckout = await page.evaluate(() => {
          const a = document.querySelector('[data-testid="project-v3-grow-featured"]')
          return { open: false, href: a?.getAttribute('href') || null, tag: a?.tagName || null }
        })
      }
      pageNotes['featured-checkout-1440'] = featuredCheckout

      const trendCta = page.locator('[data-testid="project-v3-grow-trend"]').first()
      let trendCheckout = { open: false }
      if ((await trendCta.count()) > 0) {
        await trendCta.click().catch(() => {})
        await page.waitForTimeout(800)
        trendCheckout = await page.evaluate(() => {
          const m = document.querySelector('[data-melega-modal="true"]')
          return {
            open: !!m,
            testId: m?.getAttribute('data-testid'),
            title: m?.querySelector('[data-melega-modal-title]')?.textContent?.trim(),
          }
        })
        await page.screenshot({ path: path.join(SHOTS, 'trend-checkout-1440.png') })
        await page.keyboard.press('Escape').catch(() => {})
      }
      pageNotes['trend-checkout-1440'] = trendCheckout

      // LIST studio commercial anchors
      await page.goto(`${BASE}/list?intent=claim-project&slug=marco`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2500)
      await page.screenshot({ path: path.join(SHOTS, 'list-claim-1440.png') })
      const listCommercial = await page.evaluate(() => {
        const featured = document.querySelector('[data-testid*="featured"], #featured')
        const trend = document.querySelector('[data-testid*="trend"], #trend-boost')
        return {
          featuredVisible: !!featured,
          trendVisible: !!trend,
          text: (document.body.innerText || '').slice(0, 700),
        }
      })
      pageNotes['list-commercial-1440'] = listCommercial
      await page.evaluate(() => document.querySelector('#featured')?.scrollIntoView())
      await page.waitForTimeout(500)
      await page.screenshot({ path: path.join(SHOTS, 'list-featured-anchor-1440.png') })
    }

    await context.close()
  }
} finally {
  await browser.close()
}

const report = {
  mission: 'MELEGASWAP_V2_FOUNDER_REVIEW_AUTOMATION',
  base: BASE,
  at: new Date().toISOString(),
  findings,
  pageNotes,
  screenshotCount: fs.readdirSync(SHOTS).length,
}

fs.writeFileSync(path.join(OUT, 'probe-raw.json'), JSON.stringify(report, null, 2))
console.log(
  JSON.stringify(
    {
      base: BASE,
      findings: findings.length,
      screenshots: report.screenshotCount,
      keys: Object.keys(pageNotes),
      p0: findings.filter((f) => f.priority === 'P0').length,
      sampleFindings: findings.slice(0, 20),
    },
    null,
    2,
  ),
)
