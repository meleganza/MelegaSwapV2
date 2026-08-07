/**
 * Founder Release Acceptance V3 — real browser walk (playwright-core + Chrome).
 */
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const BASE = process.env.ACCEPT_BASE || 'http://127.0.0.1:3320'
const OUT = path.resolve('docs/runtime/melegaswap-v2-founder-release-acceptance-v3')
const SHOTS = path.join(OUT, 'screenshots')
mkdirSync(SHOTS, { recursive: true })

async function main() {
  let chromium
  try {
    ;({ chromium } = await import('playwright-core'))
  } catch {
    ;({ chromium } = await import('playwright'))
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const nav = []
  const bugs = []
  const checklist = {}

  const flush = () => {
    const slow = nav.filter((n) => n.ms > 1500)
    const p1Slow = nav.filter((n) => n.ms > 3000)
    const p0Slow = nav.filter((n) => n.ms > 8000)
    for (const n of p0Slow) bugs.push({ severity: 'P0', id: `nav-slow-${n.label}`, detail: `${n.ms}ms` })
    for (const n of p1Slow.filter((x) => x.ms <= 8000)) {
      if (!bugs.some((b) => b.id === `nav-noticeable-${n.label}`)) {
        bugs.push({ severity: 'P1', id: `nav-noticeable-${n.label}`, detail: `${n.ms}ms` })
      }
    }
    writeFileSync(path.join(OUT, 'navigation-performance.json'), JSON.stringify({ base: BASE, nav, slow, p1Slow, p0Slow }, null, 2))
    writeFileSync(path.join(OUT, 'bugs-found.json'), JSON.stringify({ bugs, at: new Date().toISOString() }, null, 2))
    writeFileSync(path.join(OUT, 'acceptance-checklist.json'), JSON.stringify({ checklist, at: new Date().toISOString() }, null, 2))
  }

  async function timedGoto(label, url) {
    const t0 = Date.now()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(700)
    const ms = Date.now() - t0
    nav.push({ label, kind: 'goto', url: page.url(), ms })
    return ms
  }

  async function timedClickNav(label, name) {
    const from = page.url()
    const t0 = Date.now()
    try {
      const link = page.locator('nav[aria-label="Primary navigation"] a').filter({ hasText: new RegExp(`^${name}`) }).first()
      await Promise.all([
        page.waitForURL(
          (u) => {
            const p = u.pathname
            if (name === 'Home') return p === '/' || p === ''
            if (name === 'Liquidity') return /liquidity/i.test(p)
            if (name === 'Farms') return /farms/i.test(p)
            if (name === 'Pools') return /pools/i.test(p)
            if (name === 'List') return /list/i.test(p)
            if (name === 'Portfolio') return /portfolio/i.test(p)
            return false
          },
          { timeout: 8000 },
        ).catch(() => null),
        link.click({ timeout: 5000 }),
      ])
      await page.waitForTimeout(400)
    } catch (err) {
      bugs.push({
        severity: 'P0',
        id: `nav-stall-${name}`,
        detail: `Click ${name} from ${from}; now ${page.url()}; ${String(err?.message || err).slice(0, 160)}`,
      })
    }
    const ms = Date.now() - t0
    let homeStuck = false
    let h1 = ''
    let ariaCurrent = ''
    try {
      homeStuck = await page.evaluate(
        () => !!document.querySelector('[data-testid="dex-home-ecosystem"]') && location.pathname !== '/',
      )
      h1 = (await page.locator('h1').first().textContent()) || ''
      ariaCurrent = (await page.locator('nav a[aria-current="page"]').first().textContent()) || ''
    } catch {
      /* ignore */
    }
    if (homeStuck) {
      bugs.push({ severity: 'P0', id: 'url-content-mismatch', detail: `Home DOM still mounted at ${page.url()}` })
    }
    nav.push({ label, kind: 'click', from, url: page.url(), ms, h1, ariaCurrent, homeStuck })
    return ms
  }

  try {
    await timedGoto('home', `${BASE}/`)
    await page.screenshot({ path: path.join(SHOTS, 'Home-1440.png') })

    checklist.home = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="dex-home-ecosystem"]')
      const text = root?.innerText || ''
      const body = document.body.innerText
      return {
        hasPassport: /PASSPORT/i.test(text),
        hasSmartdrop: /SMARTDROP/i.test(text),
        hasBlack: /\bBLACK\b/.test(text),
        hasSpace: /SPACE/i.test(text),
        hasMaiora: /MAIORA/i.test(text),
        hasBlackPumpLabel: /BlackPump/i.test(text),
        hasLabs: /\bLabs\b/.test(text) && /Explore Melega Ecosystem/i.test(body),
        hasRadar: /\bRadar\b/.test(text),
        hasUnavailableWall: /Source not configured|Waiting explorer/.test(body),
        protocolFee: /Protocol fee/i.test(body),
        treasuryExposed: /TREASURY WALLET/i.test(body),
        newListingsMarcoDup: (body.match(/MARCO MARCO Indexed/g) || []).length,
        smartSwap: /Smart Swap/i.test(body),
        featured: /Featured Projects/i.test(body) || !!document.querySelector('[data-home-section="featured-projects"]'),
      }
    })
    if (checklist.home.hasBlackPumpLabel) bugs.push({ severity: 'P1', id: 'ecosystem-blackpump-label', detail: 'BlackPump label' })
    if (checklist.home.hasRadar) bugs.push({ severity: 'P0', id: 'ecosystem-radar', detail: 'Radar on Home ecosystem' })
    if (!checklist.home.hasPassport || !checklist.home.hasBlack) {
      bugs.push({ severity: 'P1', id: 'ecosystem-incomplete', detail: JSON.stringify(checklist.home) })
    }
    if (checklist.home.treasuryExposed) bugs.push({ severity: 'P0', id: 'home-treasury-exposed', detail: 'TREASURY WALLET on Home' })
    if (checklist.home.newListingsMarcoDup >= 3) {
      bugs.push({
        severity: 'P1',
        id: 'home-new-listings-marco-dup',
        detail: `MARCO listed ${checklist.home.newListingsMarcoDup} times without clear chain distinction in a11y text`,
      })
    }

    await timedClickNav('nav-liquidity', 'Liquidity')
    await page.screenshot({ path: path.join(SHOTS, 'Liquidity-1440.png') })
    await timedClickNav('nav-farms', 'Farms')
    await page.screenshot({ path: path.join(SHOTS, 'Farms-1440.png') })
    await timedClickNav('nav-pools', 'Pools')
    await page.screenshot({ path: path.join(SHOTS, 'Pools-1440.png') })
    await timedClickNav('nav-list', 'List')
    await timedClickNav('nav-portfolio', 'Portfolio')
    await page.screenshot({ path: path.join(SHOTS, 'Portfolio-1440.png') })
    checklist.portfolio = await page.evaluate(() => {
      const text = document.body.innerText
      return {
        hasPassportUi: /Create Passport|Wallet-linked Passport|Identity enrollment/i.test(text),
        hasAssets: /Assets/i.test(text),
      }
    })
    if (checklist.portfolio.hasPassportUi) {
      bugs.push({ severity: 'P0', id: 'portfolio-passport-leak', detail: 'Passport UI on Portfolio' })
    }

    await timedClickNav('nav-home', 'Home')

    const tProjects = Date.now()
    const explore = page.getByRole('button', { name: /Explore Trending Projects/i })
    if (await explore.count()) await explore.click()
    else await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/projects/, { timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(900)
    nav.push({ label: 'home-to-projects', kind: 'cta', url: page.url(), ms: Date.now() - tProjects })
    await page.screenshot({ path: path.join(SHOTS, 'Projects-1440.png') })
    checklist.projects = await page.evaluate(() => ({
      v3: document.querySelector('[data-projects-directory]')?.getAttribute('data-projects-directory'),
      hero: !!document.querySelector('[data-projects-hero="compact-v3"]'),
      count: document.querySelector('[data-testid="projects-directory-count"]')?.textContent,
      cards: document.querySelectorAll('[data-testid="project-directory-card"]').length,
      loadMore: !!document.querySelector('[data-testid="projects-load-more"]'),
      featured: !!document.querySelector('[data-featured-pipeline="FeaturedProjectsRail"]'),
    }))
    if (checklist.projects.v3 !== 'v3') bugs.push({ severity: 'P0', id: 'projects-not-v3', detail: JSON.stringify(checklist.projects) })

    const tMm72 = Date.now()
    await page.goto(`${BASE}/@mm72/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(1100)
    nav.push({ label: 'to-mm72', kind: 'goto', url: page.url(), ms: Date.now() - tMm72 })
    await page.screenshot({ path: path.join(SHOTS, 'Project-MM72-1440.png') })
    checklist.projectMm72 = await page.evaluate(() => {
      const text = document.body.innerText
      return {
        title: document.title,
        hasSmartSwap: /Smart Swap/i.test(text),
        hasEconomy: /Project Economy/i.test(text),
        hasClaim: /Claim/i.test(text),
        hasBoost: /Trend Boost|Featured|Boost/i.test(text),
        scientific: /\d\.?\d*e-\d+/i.test(text),
        treasury: /TREASURY WALLET/i.test(text),
        projectsDirLeak: !!document.querySelector('[data-projects-directory]'),
      }
    })
    if (!checklist.projectMm72.hasSmartSwap) bugs.push({ severity: 'P0', id: 'mm72-missing-smart-swap', detail: 'missing' })
    if (checklist.projectMm72.scientific) bugs.push({ severity: 'P1', id: 'scientific-notation', detail: 'e-N on Project Page' })
    if (checklist.projectMm72.treasury) bugs.push({ severity: 'P0', id: 'treasury-exposed', detail: 'on Project Page' })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(SHOTS, 'Project-MM72-390.png') })
    await page.setViewportSize({ width: 1440, height: 900 })

    const tTrade = Date.now()
    const tradeBtn = page.locator('a[href*="/swap"]').filter({ hasText: /Trade|Buy/i }).first()
    if (await tradeBtn.count()) {
      await tradeBtn.click()
      await page.waitForURL(/swap/, { timeout: 8000 }).catch(() => {})
    } else {
      await page.goto(`${BASE}/swap`, { waitUntil: 'domcontentloaded' })
    }
    nav.push({ label: 'project-to-swap', kind: 'click', url: page.url(), ms: Date.now() - tTrade })
    if (!/\/swap/.test(page.url())) bugs.push({ severity: 'P0', id: 'trade-not-swap', detail: page.url() })

    await timedGoto('audit', `${BASE}/audit`)
    await page.screenshot({ path: path.join(SHOTS, 'Audit-1440.png') })
    checklist.audit = await page.evaluate(() => {
      const text = document.body.innerText
      const score = (text.match(/Melega Score[^\d]*(\d+)/i) || [])[1]
      const readiness = (text.match(/Runtime Readiness[^\d]*(\d+)/i) || [])[1]
      return {
        score,
        readiness,
        distinction: /informational|not a safety|distinct from|Runtime readiness measures/i.test(text),
      }
    })
    if (
      checklist.audit.score &&
      checklist.audit.readiness &&
      Number(checklist.audit.score) >= 90 &&
      Number(checklist.audit.readiness) <= 40 &&
      !checklist.audit.distinction
    ) {
      bugs.push({
        severity: 'P0',
        id: 'audit-trust-conflict',
        detail: `Score ${checklist.audit.score} vs Readiness ${checklist.audit.readiness}`,
      })
    }

    await timedGoto('home-chain', `${BASE}/`)
    const chainBtn = page.locator('button').filter({ hasText: /^(BSC|BNB|Base|ETH)$/ }).first()
    if (await chainBtn.count()) {
      await chainBtn.click().catch(() => {})
      await page.waitForTimeout(700)
      await page.screenshot({ path: path.join(SHOTS, 'Chain-Switch.png') })
      checklist.chainSwitchOpened = true
      await page.keyboard.press('Escape').catch(() => {})
    } else {
      checklist.chainSwitchOpened = false
    }

    await timedGoto('farms-modal', `${BASE}/farms`)
    const createFarm = page.getByRole('button', { name: /Create Farm/i }).first()
    if (await createFarm.count()) {
      await createFarm.click()
      await page.waitForTimeout(900)
      await page.screenshot({ path: path.join(SHOTS, 'Create-Farm.png') })
      await page.keyboard.press('Escape').catch(() => {})
      await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded' })
    }

    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(700)
    const createPool = page.getByRole('button', { name: /Create Pool/i }).first()
    if (await createPool.count()) {
      await createPool.click()
      await page.waitForTimeout(900)
      await page.screenshot({ path: path.join(SHOTS, 'Create-Pool.png') })
      await page.keyboard.press('Escape').catch(() => {})
    }

    await timedGoto('growth', `${BASE}/@mm72/`)
    const growth = page.locator('a[href*="featured"], a[href*="trend"], a[href*="list?"]').first()
    if (await growth.count()) {
      await growth.click()
      await page.waitForTimeout(1200)
      await page.screenshot({ path: path.join(SHOTS, 'Growth-Checkout.png') })
      checklist.growthOpened = /list|featured|boost|checkout|payment/i.test(page.url() + (await page.content()).slice(0, 2000))
    } else {
      checklist.growthOpened = false
      bugs.push({ severity: 'P1', id: 'growth-cta-missing', detail: 'No growth CTA on MM72' })
    }

    await page.setViewportSize({ width: 390, height: 844 })
    await timedGoto('home-390', `${BASE}/`)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    if (overflow) bugs.push({ severity: 'P1', id: 'home-390-overflow', detail: 'horizontal overflow' })
    await page.screenshot({ path: path.join(SHOTS, 'Home-390.png') })
  } catch (err) {
    bugs.push({ severity: 'P0', id: 'walk-crash', detail: String(err?.message || err).slice(0, 300) })
  } finally {
    flush()
    await browser.close().catch(() => {})
  }

  console.log(JSON.stringify({ bugs: bugs.length, nav: nav.length, p0: bugs.filter((b) => b.severity === 'P0').length }, null, 2))
  console.log('BUGS', JSON.stringify(bugs, null, 2))
  console.log('NAV', JSON.stringify(nav, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
