/**
 * Founder Product Acceptance V5 — READ-ONLY browser walk.
 * Does not modify product code.
 */
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.ACCEPT_BASE || 'http://127.0.0.1:3066'
const OUT = __dirname
const SHOTS = path.join(OUT, 'screenshots')

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
]

const PROJECTS = ['marco', 'mm72', 'eyed', 'blion', 'young-degens']

function ensure(dir) {
  mkdirSync(dir, { recursive: true })
}

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

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    // Clean session
    storageState: undefined,
  })
  const page = await context.newPage()

  const nav = []
  const issues = []
  const checks = {}
  const dataTruth = { surfaces: {}, classifications: [] }
  const shots = []

  const issue = (sev, id, fields) => {
    issues.push({ severity: sev, id, at: new Date().toISOString(), ...fields })
  }

  async function shot(group, name) {
    const dir = path.join(SHOTS, group)
    ensure(dir)
    const file = path.join(dir, `${name}.png`)
    await page.screenshot({ path: file, fullPage: false })
    shots.push(`${group}/${name}.png`)
    return file
  }

  async function shellProbe() {
    return page.evaluate(() => {
      const text = document.body.innerText || ''
      const doc = document.documentElement
      const header = document.querySelector('[data-testid="melega-global-header"], [data-melega-global-header]')
      const primary = Array.from(
        document.querySelectorAll('[data-testid="melega-header-primary-nav"] a, [data-testid="melega-header-primary-nav"] button'),
      ).map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
      const myMelega =
        document.querySelector('[data-testid="melega-header-my-melega"]') ||
        document.querySelector('[data-testid="melega-mobile-my-melega"]')
      const overflow = document.querySelector('[data-testid="melega-header-overflow"]')
      const ticker = document.querySelector('[data-melega-trending-bar], [data-testid*="trending"]')
      const drawer = document.querySelector('[data-testid="my-melega-drawer"]')
      const overlay = document.querySelector('[data-testid="my-melega-overlay"], [data-melega-layer="overlay"]')
      const homeStuck =
        Boolean(document.querySelector('[data-dex-home-screen], [data-testid="dex-home-ecosystem"]')) &&
        location.pathname !== '/' &&
        !location.pathname.startsWith('/swap')
      return {
        path: location.pathname + location.search,
        title: document.title,
        h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 80),
        primaryNav: primary,
        portfolioInPrimary: primary.some((t) => /^Portfolio$/i.test(t)),
        hasMyMelega: Boolean(myMelega),
        hasHamburger: Boolean(overflow),
        hasHeader: Boolean(header),
        hasShell: Boolean(document.querySelector('[data-melega-app-shell]')),
        hasTicker: Boolean(ticker),
        drawerOpen: Boolean(drawer),
        overlayZ: overlay ? Number(getComputedStyle(overlay).zIndex) || 0 : 0,
        homeStuck,
        horizontalOverflow: doc.scrollWidth > doc.clientWidth + 2,
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        unavailableCount: (text.match(/Unavailable/gi) || []).length,
        scientific: /[0-9]\.[0-9]+e[+\-]?[0-9]+/i.test(text),
        passportLang: /Passport status|Identity Hub|Guest mode|Subject ID|Verification status/i.test(text),
        blackPump: /BlackPump/i.test(text),
        textSample: text.replace(/\s+/g, ' ').trim().slice(0, 400),
      }
    })
  }

  async function timedGoto(label, url, waitMs = 900) {
    const t0 = Date.now()
    await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(waitMs)
    const ms = Date.now() - t0
    const probe = await shellProbe()
    nav.push({ label, kind: 'goto', url: page.url(), ms, path: probe.path, homeStuck: probe.homeStuck })
    if (ms > 3000) issue('P1', `nav-slow-${label}`, { route: url, viewport: '1440', expected: '<3s', actual: `${ms}ms`, likelyRootCause: 'slow local prod shell or heavy route', minimalFix: 'profile route bundle / data hydrate', filesLikely: [] })
    if (probe.homeStuck) issue('P0', `home-stuck-${label}`, { route: url, viewport: '1440', expected: 'destination mounted', actual: 'Home DOM still present', likelyRootCause: 'soft nav remount race', minimalFix: 'route key remount', filesLikely: ['pages/_app-full.tsx'] })
    if (probe.horizontalOverflow) issue('P1', `overflow-${label}`, { route: url, viewport: String(page.viewportSize()?.width || 1440), expected: 'no horizontal overflow', actual: `${probe.scrollWidth}>${probe.clientWidth}`, likelyRootCause: 'layout width', minimalFix: 'constrain overflow-x', filesLikely: [] })
    return { ms, probe }
  }

  async function timedClickPrimary(name) {
    const from = page.url()
    const t0 = Date.now()
    const link = page.locator('[data-testid="melega-header-primary-nav"] a').filter({ hasText: new RegExp(`^${name}`) }).first()
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 12000 }).catch(() => null),
      link.click({ force: true, timeout: 8000 }).catch((e) => {
        issue('P0', `nav-click-fail-${name}`, {
          route: from,
          viewport: '1440',
          expected: `navigate to ${name}`,
          actual: String(e.message).slice(0, 160),
          likelyRootCause: 'missing nav link',
          minimalFix: 'restore primary nav',
          filesLikely: ['globalHeaderNav.ts'],
        })
      }),
    ])
    await page.waitForLoadState('domcontentloaded').catch(() => null)
    await page.waitForTimeout(700)
    const ms = Date.now() - t0
    let probe = null
    for (let i = 0; i < 3; i++) {
      try {
        probe = await shellProbe()
        break
      } catch {
        await page.waitForTimeout(250)
      }
    }
    if (!probe) probe = { homeStuck: false, primaryNav: [], path: page.url() }
    nav.push({ label: `click-${name}`, kind: 'click', from, url: page.url(), ms, homeStuck: probe.homeStuck, aria: probe.primaryNav })
    if (ms > 3000) issue('P1', `click-slow-${name}`, { route: page.url(), viewport: '1440', expected: '<3s', actual: `${ms}ms`, likelyRootCause: 'nav transition stall', minimalFix: 'hard-nav fallback', filesLikely: ['MelegaGlobalHeader.tsx'] })
    if (probe.homeStuck) issue('P0', `click-home-stuck-${name}`, { route: page.url(), viewport: '1440', expected: `${name} mounted`, actual: 'Home still mounted', likelyRootCause: 'soft nav remount', minimalFix: 'route key', filesLikely: ['pages/_app-full.tsx'] })
    return { ms, probe }
  }

  async function openMyMelega(fromLabel) {
    const sel =
      (await page.$('[data-testid="melega-header-my-melega"]')) != null
        ? '[data-testid="melega-header-my-melega"]'
        : '[data-testid="melega-mobile-my-melega"]'
    const t0 = Date.now()
    await page.locator(sel).click({ force: true })
    await page.waitForSelector('[data-testid="my-melega-drawer"]', { timeout: 3000 }).catch(() => null)
    const openMs = Date.now() - t0
    const probe = await shellProbe()
    const detail = await page.evaluate(() => {
      const d = document.querySelector('[data-testid="my-melega-drawer"]')
      const text = d?.textContent || ''
      return {
        open: Boolean(d),
        disconnected: Boolean(document.querySelector('[data-testid="my-melega-disconnected"]')),
        positions: Boolean(document.querySelector('[data-testid="my-melega-positions"]')),
        portfolioLink: Boolean(document.querySelector('[data-testid="my-melega-full-portfolio"]')),
        passport: /Passport|Guest|Subject|Verification/i.test(text),
        counts: {
          liq: document.querySelector('[data-testid="my-melega-count-liquidity"]')?.textContent || null,
          farms: document.querySelector('[data-testid="my-melega-count-farms"]')?.textContent || null,
          pools: document.querySelector('[data-testid="my-melega-count-pools"]')?.textContent || null,
          builder: document.querySelector('[data-testid="my-melega-count-builder"]')?.textContent || null,
        },
        z: (() => {
          const o = document.querySelector('[data-testid="my-melega-overlay"]')
          return o ? Number(getComputedStyle(o).zIndex) || 0 : 0
        })(),
      }
    })
    if (!detail.open) issue('P0', `my-melega-open-fail-${fromLabel}`, { route: page.url(), viewport: String(page.viewportSize()?.width), expected: 'drawer opens', actual: 'not open', likelyRootCause: 'provider/trigger', minimalFix: 'wire MyMelega', filesLikely: ['MelegaAppShell.tsx'] })
    if (detail.z > 0 && detail.z < 10040) issue('P1', `my-melega-z-${fromLabel}`, { route: page.url(), viewport: '1440', expected: 'z>=10040', actual: String(detail.z), likelyRootCause: 'z-index', minimalFix: 'use melegaZIndex.overlay', filesLikely: ['MyMelegaDrawer.tsx'] })
    if (detail.passport) issue('P1', `my-melega-passport-${fromLabel}`, { route: page.url(), viewport: '1440', expected: 'no Passport copy', actual: 'Passport language present', likelyRootCause: 'copy leak', minimalFix: 'remove identity copy', filesLikely: ['MyMelegaDrawer.tsx'] })
    await shot('my-melega', `${fromLabel}-open`)
    await page.keyboard.press('Escape').catch(() => null)
    await page.waitForTimeout(200)
    return { openMs, detail, probe }
  }

  // ═══════════════ A/B/C HOME + SHELL ═══════════════
  console.log('HOME…')
  const homeNav = await timedGoto('home', '/', 1100)
  await shot('home', '1440-hero')
  const home = await page.evaluate(() => {
    const text = document.body.innerText || ''
    const q = (sel) => Boolean(document.querySelector(sel))
    const section = (re) => re.test(text)
    const topFarmsBlock = (() => {
      const el = [...document.querySelectorAll('[data-home-section], section, [data-testid]')].find((n) =>
        /Top Farms/i.test(n.textContent || ''),
      )
      return (el?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 500)
    })()
    const topPoolsBlock = (() => {
      const el = [...document.querySelectorAll('[data-home-section], section, [data-testid]')].find((n) =>
        /Top Pools/i.test(n.textContent || ''),
      )
      return (el?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 500)
    })()
    const eco = (document.querySelector('[data-testid="dex-home-ecosystem"]')?.textContent || '').replace(/\s+/g, ' ')
    return {
      hero: section(/Melega|Trade|Discover/i),
      swap: q('[data-testid="dex-home-instant-swap"]'),
      featured: section(/Featured/i),
      kpi: q('[data-testid="dex-home-kpi-rail"]'),
      movers: section(/Top Movers/i) || q('[data-testid="home-top-mover-row"]'),
      topFarms: section(/Top Farms/i),
      topPools: section(/Top Pools/i),
      newListings: section(/New Listing/i),
      ecosystem: q('[data-testid="dex-home-ecosystem"]') || section(/Ecosystem/i),
      treasuryPublic: /0x[a-fA-F0-9]{40}/.test(
        document.querySelector('[data-testid="dex-home-instant-swap"]')?.textContent || '',
      ),
      unavailable: (text.match(/Unavailable/gi) || []).length,
      blackPump: /BlackPump/i.test(text),
      ecoSlice: eco.slice(0, 300),
      topFarmsBlock,
      topPoolsBlock,
      hasPassportInEco: /PASSPORT/i.test(eco),
      hasBlack: /\bBLACK\b/i.test(eco),
      hasSmartdrop: /SMARTDROP/i.test(eco),
      hasSpace: /SPACE/i.test(eco),
      hasMaiora: /MAIORA/i.test(eco),
    }
  })
  checks.home = home
  checks.shellHome = homeNav.probe
  if (homeNav.probe.portfolioInPrimary) issue('P1', 'portfolio-in-primary-nav', { route: '/', viewport: '1440', expected: 'no Portfolio in primary', actual: String(homeNav.probe.primaryNav), likelyRootCause: 'nav IA regression', minimalFix: 'remove Portfolio from GLOBAL_HEADER_NAV', filesLikely: ['globalHeaderNav.ts'] })
  if (homeNav.probe.hasHamburger) issue('P1', 'dead-hamburger', { route: '/', viewport: '1440', expected: 'My Melega trigger', actual: 'hamburger present', likelyRootCause: 'trigger regression', minimalFix: 'restore My Melega', filesLikely: ['MelegaGlobalHeader.tsx'] })
  if (!homeNav.probe.hasMyMelega) issue('P0', 'missing-my-melega-trigger', { route: '/', viewport: '1440', expected: 'My Melega control', actual: 'missing', likelyRootCause: 'header wire', minimalFix: 'mount trigger', filesLikely: ['MelegaGlobalHeader.tsx'] })
  if (home.blackPump) issue('P1', 'home-blackpump-legacy', { route: '/', viewport: '1440', expected: 'BLACK naming', actual: 'BlackPump', likelyRootCause: 'legacy copy', minimalFix: 'rename', filesLikely: ['ecosystemDestinations.ts'] })
  if (home.treasuryPublic) issue('P1', 'home-swap-treasury-address', { route: '/', viewport: '1440', expected: 'no public Treasury address in swap', actual: '0x address in swap panel', likelyRootCause: 'debug leak', minimalFix: 'hide address', filesLikely: ['HomeSwapPanel'] })
  dataTruth.surfaces.homeTopFarms = { text: home.topFarmsBlock, unavailable: home.unavailable }
  dataTruth.surfaces.homeTopPools = { text: home.topPoolsBlock }

  // Trending bar
  const ticker = await page.evaluate(() => {
    const bar = document.querySelector('[data-melega-trending-bar], [class*="GlobalTrending"], [data-testid*="trending-bar"]')
    if (!bar) return { present: false }
    const r = bar.getBoundingClientRect()
    const links = [...bar.querySelectorAll('a')].slice(0, 12).map((a) => ({
      href: a.getAttribute('href'),
      t: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
    }))
    const imgs = [...bar.querySelectorAll('img')].length
    const broken = [...bar.querySelectorAll('img')].filter((img) => !img.naturalWidth).length
    return {
      present: true,
      inViewport: r.top >= 0 && r.left >= 0 && r.right <= window.innerWidth + 2,
      height: r.height,
      links,
      imgs,
      brokenImgs: broken,
      z: Number(getComputedStyle(bar).zIndex) || 0,
    }
  })
  checks.ticker = ticker
  if (ticker.present && !ticker.inViewport) issue('P1', 'ticker-outside-viewport', { route: '/', viewport: '1440', expected: 'ticker in viewport', actual: 'clipped', likelyRootCause: 'layout', minimalFix: 'constrain ticker', filesLikely: ['GlobalTrendingBar.tsx'] })

  // Sequential primary nav
  console.log('PRIMARY NAV SEQUENCE…')
  for (const name of ['Liquidity', 'Farms', 'Pools', 'List', 'Home']) {
    await timedClickPrimary(name)
    await shot('home', `nav-after-${name.toLowerCase()}`)
  }

  // ═══════════════ E PROJECTS ═══════════════
  console.log('PROJECTS…')
  await timedGoto('projects', '/projects', 1200)
  await shot('projects', '1440-directory')
  const projects = await page.evaluate(() => {
    const text = document.body.innerText || ''
    const cards = document.querySelectorAll('[data-testid*="project-card"], [data-project-card], a[href*="/@"], a[href*="/project-hq"]')
    const dashHeavy = [...document.querySelectorAll('[data-testid*="project"], article, [class*="Card"]')]
      .slice(0, 20)
      .filter((el) => {
        const t = el.textContent || ''
        const dashes = (t.match(/—|–|-/g) || []).length
        return dashes >= 8 && t.length < 220
      }).length
    return {
      featured: /Featured/i.test(text),
      search: Boolean(document.querySelector('input[type="search"], input[placeholder*="Search" i]')),
      filters: /Filter|Sort|Chain|Category/i.test(text),
      trade: /Trade/i.test(text),
      openProject: /Open Project|View Project|Open/i.test(text),
      cardCount: cards.length,
      dashHeavyCards: dashHeavy,
      trendingDup: (text.match(/Trending/gi) || []).length,
      unavailable: (text.match(/Unavailable/gi) || []).length,
    }
  })
  checks.projects = projects
  if (projects.dashHeavyCards > 6) {
    issue('P2', 'projects-dash-walls', {
      route: '/projects',
      viewport: '1440',
      expected: 'cards not walls of dashes',
      actual: `${projects.dashHeavyCards} dash-heavy cards`,
      likelyRootCause: 'missing metrics presentation',
      minimalFix: 'compact dash layout',
      filesLikely: ['ProjectsDirectory'],
    })
  }

  // ═══════════════ F PROJECT PAGES V6 ═══════════════
  console.log('PROJECT PAGES…')
  checks.projectPages = {}
  for (const slug of PROJECTS) {
    await timedGoto(`project-${slug}`, `/@${slug}`, 1400)
    await shot('project-pages', `${slug}-1440`)
    const pp = await page.evaluate((s) => {
      const text = document.body.innerText || ''
      const root = document.querySelector('[data-project-page="v6"]')
      const chartEmpty = Boolean(document.querySelector('[data-chart-empty="compact"], [data-chart-empty]'))
      const chartPanel = Boolean(document.querySelector('[data-testid="project-v5-chart-panel"], [data-testid="project-v6-chart"], [data-testid*="chart"]'))
      const swap = Boolean(document.querySelector('[data-testid="project-v6-swap"], [data-testid*="swap"]'))
      const contract = (document.querySelector('[data-testid="project-v6-contract"]')?.textContent || '').trim()
      const farmsMeta = (document.querySelector('[data-testid="project-v6-economy-farms"]')?.textContent || '').slice(0, 160)
      const poolsMeta = (document.querySelector('[data-testid="project-v6-economy-pools"]')?.textContent || '').slice(0, 160)
      const farmsEmpty = Boolean(document.querySelector('[data-testid="project-v6-economy-farms-empty"]'))
      const poolsEmpty = Boolean(document.querySelector('[data-testid="project-v6-economy-pools-empty"]'))
      const buyToken = /Buy Token/i.test(text)
      const transparencyDom = /Technical Transparency/i.test(text)
      const scientific = /[0-9]\.[0-9]+e[+\-]?[0-9]+/i.test(text)
      return {
        slug: s,
        v6: Boolean(root),
        hero: Boolean(document.querySelector('[data-testid="project-v6-hero"]')),
        market: Boolean(document.querySelector('[data-testid="project-v6-market"]')),
        economy: Boolean(document.querySelector('[data-testid="project-v6-economy"]')),
        intel: Boolean(document.querySelector('[data-testid="project-v6-intel"]')),
        boost: Boolean(document.querySelector('[data-testid="project-v6-boost"]')),
        related: Boolean(document.querySelector('[data-testid="project-v6-related"]')),
        chartEmpty,
        chartPanel,
        swap,
        contractHas0x: /0x[a-fA-F0-9]{40}/.test(contract) || /0x[a-fA-F0-9]{8,}/.test(contract),
        farmsMeta,
        poolsMeta,
        farmsEmpty,
        poolsEmpty,
        buyToken,
        transparencyDom,
        scientific,
        score: /Melega Score/i.test(text),
        claim: /Claim/i.test(text),
        community: /Community|Telegram|Twitter|X\.com|Website/i.test(text),
      }
    }, slug)
    checks.projectPages[slug] = pp
    if (!pp.v6) issue('P0', `project-v6-missing-${slug}`, { route: `/@${slug}`, viewport: '1440', expected: 'V6 shell', actual: 'not mounted', likelyRootCause: 'route/shell', minimalFix: 'mount ProjectPageV6Shell', filesLikely: ['pages/project-hq'] })
    if (pp.scientific) issue('P1', `project-scientific-${slug}`, { route: `/@${slug}`, viewport: '1440', expected: 'no scientific notation', actual: 'scientific number present', likelyRootCause: 'formatter', minimalFix: 'human format', filesLikely: ['project page formatters'] })
    if (pp.chartPanel && pp.chartEmpty && !pp.swap) {
      issue('P1', `project-chart-blank-no-swap-${slug}`, { route: `/@${slug}`, viewport: '1440', expected: 'swap dominates if chart empty', actual: 'empty chart without swap', likelyRootCause: 'layout', minimalFix: 'collapse chart', filesLikely: ['ProjectPageV6'] })
    }
    dataTruth.surfaces[`project-${slug}-economy`] = { farms: pp.farmsMeta, pools: pp.poolsMeta, farmsEmpty: pp.farmsEmpty, poolsEmpty: pp.poolsEmpty }
  }

  // ═══════════════ G LIQUIDITY V3 ═══════════════
  console.log('LIQUIDITY…')
  await timedGoto('liquidity', '/liquidity-studio', 1200)
  await shot('liquidity', '1440-studio')
  const liq = await page.evaluate(() => {
    const text = document.body.innerText || ''
    return {
      v3: Boolean(document.querySelector('[data-liquidity-studio="v3"]')),
      my: /My Liquidity/i.test(text),
      add: /Add Liquidity/i.test(text),
      ai: /AI Liquidity Builder/i.test(text),
      beta: /BETA/i.test(text),
      preview: /Position Preview|Preview/i.test(text),
      legacyGeneric: /Liquidity Studio V2|Legacy Liquidity/i.test(text),
    }
  })
  checks.liquidity = liq
  if (!liq.v3) issue('P0', 'liquidity-v3-missing', { route: '/liquidity-studio', viewport: '1440', expected: 'V3 shell', actual: 'not mounted', likelyRootCause: 'wrong surface', minimalFix: 'mount V3', filesLikely: ['LiquidityStudio'] })
  if (!liq.my || !liq.add || !liq.ai) issue('P1', 'liquidity-v3-tabs', { route: '/liquidity-studio', viewport: '1440', expected: 'My / Add / AI Builder', actual: JSON.stringify(liq), likelyRootCause: 'tabs missing', minimalFix: 'restore tabs', filesLikely: ['LiquidityStudio'] })

  // ═══════════════ H FARMS ═══════════════
  console.log('FARMS…')
  await timedGoto('farms', '/farms', 1200)
  await shot('farms', '1440-explore')
  const farms = await page.evaluate(() => {
    const text = document.body.innerText || ''
    const myBlankAdvisor = Boolean(document.querySelector('[data-testid*="advisor"]')) && /My Farms/i.test(text)
    const bigintLeak = /\d{20,}/.test(text)
    return {
      hero: /Farms/i.test(text),
      kpi: /TVL|APR|Farms/i.test(text),
      my: /My Farms|My Position/i.test(text),
      explore: /Explore|All Farms/i.test(text),
      harvest: /Harvest/i.test(text),
      create: /Create Farm/i.test(text),
      bigintLeak,
      unavailable: (text.match(/Unavailable/gi) || []).length,
      multiplierOverlapSuspect: false,
    }
  })
  checks.farms = farms
  if (farms.bigintLeak) issue('P1', 'farms-bigint-leak', { route: '/farms', viewport: '1440', expected: 'formatted amounts', actual: 'raw bigint-like digits', likelyRootCause: 'formatter', minimalFix: 'format LP/USD', filesLikely: ['FarmsStudio'] })

  // Create Farm modal
  try {
    const createBtn = page.getByRole('button', { name: /Create Farm/i }).first()
    if (await createBtn.count()) {
      await createBtn.click({ timeout: 4000 })
      await page.waitForTimeout(700)
      const modal = await page.evaluate(() => {
        const o = document.querySelector('[data-melega-layer="overlay"], [role="dialog"]')
        if (!o) return { present: false }
        const r = o.getBoundingClientRect()
        const text = o.textContent || ''
        return {
          present: true,
          z: Number(getComputedStyle(o).zIndex) || 0,
          fits: r.height <= window.innerHeight + 4,
          titles: (text.match(/Create Farm/gi) || []).length,
          treasury: /Treasury|0x[a-fA-F0-9]{40}/i.test(text),
          accordion: /Advanced|Details|Configuration/i.test(text),
        }
      })
      checks.createFarmModal = modal
      await shot('modals', 'create-farm')
      if (modal.present && modal.z < 10040) issue('P1', 'create-farm-z', { route: '/farms', viewport: '1440', expected: 'overlay z>=10040', actual: String(modal.z), likelyRootCause: 'legacy modal', minimalFix: 'MelegaModal V3', filesLikely: ['CreateFarm'] })
      if (modal.present && modal.titles > 2) issue('P2', 'create-farm-multi-title', { route: '/farms', viewport: '1440', expected: 'single title', actual: `${modal.titles} titles`, likelyRootCause: 'duplicate headers', minimalFix: 'collapse titles', filesLikely: ['CreateFarm'] })
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }
  } catch (e) {
    checks.createFarmModal = { error: String(e.message).slice(0, 120) }
  }

  // ═══════════════ I POOLS ═══════════════
  console.log('POOLS…')
  await timedGoto('pools', '/pools', 1200)
  await shot('pools', '1440-explore')
  const pools = await page.evaluate(() => {
    const text = document.body.innerText || ''
    const giantEmpty = [...document.querySelectorAll('section, [class*="Card"], [data-testid]')].some((el) => {
      const t = (el.textContent || '').replace(/\s+/g, ' ')
      const r = el.getBoundingClientRect()
      return /My Positions/i.test(t) && /No position|Connect/i.test(t) && r.height > 280
    })
    return {
      hero: /Pools/i.test(text),
      explore: /Explore|All Pools/i.test(text),
      create: /Create Pool/i.test(text),
      giantEmptyMyPositions: giantEmpty,
      unavailable: (text.match(/Unavailable/gi) || []).length,
    }
  })
  checks.pools = pools
  if (pools.giantEmptyMyPositions) issue('P1', 'pools-giant-empty-my-positions', { route: '/pools', viewport: '1440', expected: 'compact/no giant empty My Positions', actual: 'giant empty card', likelyRootCause: 'empty state sizing', minimalFix: 'collapse empty module', filesLikely: ['PoolsStudio'] })

  try {
    const createPool = page.getByRole('button', { name: /Create Pool/i }).first()
    if (await createPool.count()) {
      await createPool.click({ timeout: 4000 })
      await page.waitForTimeout(700)
      const modal = await page.evaluate(() => {
        const o = document.querySelector('[data-melega-layer="overlay"], [role="dialog"]')
        if (!o) return { present: false }
        const r = o.getBoundingClientRect()
        const text = o.textContent || ''
        return {
          present: true,
          z: Number(getComputedStyle(o).zIndex) || 0,
          fits: r.height <= window.innerHeight + 4,
          titles: (text.match(/Create Pool/gi) || []).length,
          treasury: /Treasury address|Fee recipient:\s*0x/i.test(text),
        }
      })
      checks.createPoolModal = modal
      await shot('modals', 'create-pool')
      if (modal.present && modal.treasury) issue('P1', 'create-pool-treasury-exposed', { route: '/pools', viewport: '1440', expected: 'no exposed Treasury address', actual: 'treasury/address visible', likelyRootCause: 'debug field', minimalFix: 'hide treasury', filesLikely: ['CreatePool'] })
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }
  } catch (e) {
    checks.createPoolModal = { error: String(e.message).slice(0, 120) }
  }

  // ═══════════════ J AUDIT ═══════════════
  console.log('AUDIT…')
  await timedGoto('audit', '/audit', 1200)
  await shot('audit', '1440-security')
  const audit = await page.evaluate(() => {
    const text = document.body.innerText || ''
    return {
      live: /LIVE SECURITY|Security Center|Melega Score/i.test(text),
      score: /Melega Score/i.test(text),
      formula: /formula|score/i.test(text),
      runtime: /Runtime Readiness|Runtime/i.test(text),
      contracts: /0x[a-fA-F0-9]{10,}/.test(text),
      multichain: /BSC|Base|Polygon|Ethereum|Arbitrum|Avalanche/i.test(text),
      conflictSuspect: /Melega Score[\s\S]{0,80}Runtime Readiness[\s\S]{0,80}conflict/i.test(text),
    }
  })
  checks.audit = audit
  if (!audit.score) issue('P1', 'audit-score-missing', { route: '/audit', viewport: '1440', expected: 'Melega Score visible', actual: 'missing', likelyRootCause: 'audit surface', minimalFix: 'restore score', filesLikely: ['Audit'] })

  // ═══════════════ K MY MELEGA from multiple pages ═══════════════
  console.log('MY MELEGA…')
  checks.myMelega = {}
  for (const [label, url] of [
    ['home', '/'],
    ['project', '/@marco'],
    ['liquidity', '/liquidity-studio'],
    ['farms', '/farms'],
    ['pools', '/pools'],
  ]) {
    await timedGoto(`mm-${label}`, url, 800)
    checks.myMelega[label] = await openMyMelega(label)
  }

  // ═══════════════ L PORTFOLIO ═══════════════
  console.log('PORTFOLIO…')
  await timedGoto('portfolio', '/portfolio', 1100)
  await shot('portfolio', '1440-secondary')
  const portfolio = await page.evaluate(() => {
    const text = document.body.innerText || ''
    return {
      shell: Boolean(document.querySelector('[data-melega-app-shell]')),
      header: Boolean(document.querySelector('[data-testid="melega-global-header"], [data-melega-global-header]')),
      passport: /Passport status|Identity Console|Guest|Subject/i.test(text),
      title: /Portfolio|Connect/i.test(text),
    }
  })
  checks.portfolio = portfolio
  if (!portfolio.shell || !portfolio.header) issue('P0', 'portfolio-missing-shell', { route: '/portfolio', viewport: '1440', expected: 'full Melega shell', actual: JSON.stringify(portfolio), likelyRootCause: 'shell bypass', minimalFix: 'wrap Portfolio in shell', filesLikely: ['pages/portfolio'] })
  if (portfolio.passport) issue('P1', 'portfolio-passport-lang', { route: '/portfolio', viewport: '1440', expected: 'no Passport language', actual: 'Passport/identity copy', likelyRootCause: 'legacy copy', minimalFix: 'strip identity language', filesLikely: ['PortfolioStudio'] })

  // Drawer → View Full Portfolio (disconnected may lack link)
  await openMyMelega('portfolio-page')
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)
  await page.locator('[data-testid="melega-header-my-melega"]').click({ force: true })
  await page.waitForTimeout(400)
  const hasPortLink = await page.$('[data-testid="my-melega-full-portfolio"]')
  if (hasPortLink) {
    await hasPortLink.click()
    await page.waitForTimeout(900)
    checks.drawerToPortfolio = page.url().includes('/portfolio')
    if (!checks.drawerToPortfolio) issue('P1', 'drawer-portfolio-nav-fail', { route: '/', viewport: '1440', expected: '/portfolio', actual: page.url(), likelyRootCause: 'link href', minimalFix: 'MY_MELEGA_ROUTES.portfolio', filesLikely: ['MyMelegaDrawer.tsx'] })
  } else {
    checks.drawerToPortfolio = 'skipped-disconnected'
  }

  // ═══════════════ M COMMERCIAL FUNNELS (no payment) ═══════════════
  console.log('COMMERCIAL…')
  await timedGoto('project-boost', '/@marco', 1000)
  const commercial = await page.evaluate(() => {
    const text = document.body.innerText || ''
    const btns = [...document.querySelectorAll('a, button')].map((el) => (el.textContent || '').trim())
    return {
      featured: btns.some((t) => /Featured|Get Featured/i.test(t)),
      trendBoost: btns.some((t) => /Trend Boost|Boost/i.test(t)),
      claim: btns.some((t) => /Claim Project|Claim/i.test(t)),
      labels: btns.filter((t) => /Featured|Boost|Claim|Pay/i.test(t)).slice(0, 20),
    }
  })
  checks.commercial = commercial
  // Try open Featured CTA if present
  try {
    const feat = page.getByRole('button', { name: /Featured|Get Featured/i }).first()
    if (await feat.count()) {
      await feat.click({ timeout: 4000 })
      await page.waitForTimeout(800)
      const funnel = await page.evaluate(() => {
        const text = document.body.innerText || ''
        const dialog = document.querySelector('[role="dialog"], [data-melega-layer="overlay"]')
        return {
          open: Boolean(dialog),
          packages: /Package|Starter|Growth|Pro/i.test(text),
          chain: /BSC|BNB|Base|Chain/i.test(text),
          pay: /Pay|Review|Activate/i.test(text),
        }
      })
      checks.featuredFunnel = funnel
      await shot('modals', 'featured-funnel')
      if (!funnel.open) issue('P1', 'featured-funnel-dead', { route: '/@marco', viewport: '1440', expected: 'checkout opens', actual: 'no dialog', likelyRootCause: 'dead CTA', minimalFix: 'wire commercial modal', filesLikely: ['ProjectPageV6 boost'] })
      await page.keyboard.press('Escape')
    } else {
      checks.featuredFunnel = { skipped: 'no Featured button found' }
    }
  } catch (e) {
    checks.featuredFunnel = { error: String(e.message).slice(0, 120) }
  }

  // ═══════════════ N SWITCH NETWORK MODAL ═══════════════
  console.log('NETWORK MODAL…')
  await timedGoto('net-modal', '/', 700)
  try {
    const chain = page.getByTestId('melega-header-chain').getByTestId('network-switcher-root')
    await chain.click({ force: true, timeout: 5000 })
    await page.waitForTimeout(600)
    const layer = await page.evaluate(() => {
      const overlay = document.querySelector('[data-melega-layer="overlay"]')
      if (!overlay) return { present: false }
      const z = Number(getComputedStyle(overlay).zIndex) || 0
      const ticker = document.querySelector('[data-melega-trending-bar]')
      const tickerZ = ticker ? Number(getComputedStyle(ticker).zIndex) || 0 : 0
      const header = document.querySelector('[data-melega-global-header]')
      const headerZ = header ? Number(getComputedStyle(header).zIndex) || 0 : 0
      return {
        present: true,
        z,
        tickerZ,
        headerZ,
        switchTitle: /Switch Network/i.test(overlay.textContent || ''),
        above: z > tickerZ && z > headerZ,
      }
    })
    checks.networkModal = layer
    await shot('modals', 'switch-network')
    if (!layer.present || !layer.above) issue('P1', 'network-modal-layering', { route: '/', viewport: '1440', expected: 'overlay above header/ticker', actual: JSON.stringify(layer), likelyRootCause: 'z-index', minimalFix: 'melegaZIndex.overlay', filesLikely: ['NetworkSwitcher'] })
    await page.keyboard.press('Escape')
  } catch (e) {
    issue('P1', 'network-modal-open-fail', { route: '/', viewport: '1440', expected: 'Switch Network modal', actual: String(e.message).slice(0, 160), likelyRootCause: 'switcher', minimalFix: 'restore switcher', filesLikely: ['NetworkSwitcher'] })
  }

  // ═══════════════ SWAP ═══════════════
  await timedGoto('swap', '/swap', 1000)
  await shot('home', 'swap-route')
  checks.swap = await page.evaluate(() => {
    const text = document.body.innerText || ''
    return {
      shell: Boolean(document.querySelector('[data-melega-app-shell]')),
      form: /Swap|From|To|Connect/i.test(text),
      treasury: /Treasury/i.test(text) && /0x[a-fA-F0-9]{40}/.test(text),
    }
  })
  if (checks.swap.treasury) issue('P1', 'swap-treasury-exposed', { route: '/swap', viewport: '1440', expected: 'no treasury address', actual: 'treasury+address', likelyRootCause: 'debug UI', minimalFix: 'hide', filesLikely: ['Swap'] })

  // ═══════════════ O RESPONSIVE MATRIX ═══════════════
  console.log('RESPONSIVE…')
  checks.responsive = {}
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await timedGoto(`resp-home-${vp.name}`, '/', 700)
    const probe = await shellProbe()
    const triggerSel =
      vp.width < 1024 ? '[data-testid="melega-mobile-my-melega"]' : '[data-testid="melega-header-my-melega"]'
    const box = await page.locator(triggerSel).boundingBox().catch(() => null)
    const inView = box ? box.x + box.width <= vp.width + 2 && box.x >= -2 : false
    await page.locator(triggerSel).click({ force: true }).catch(() => null)
    await page.waitForTimeout(350)
    const drawer = await page.$('[data-testid="my-melega-drawer"]')
    if (vp.name === '390') await shot('mobile', 'home-my-melega')
    if (vp.name === '768') await shot('mobile', '768-home')
    await page.keyboard.press('Escape').catch(() => null)
    // sample key routes
    for (const [g, u] of [
      ['projects', '/projects'],
      ['farms', '/farms'],
      ['pools', '/pools'],
    ]) {
      await page.goto(`${BASE}${u}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(500)
      const ov = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
      if (ov) issue('P1', `overflow-${g}-${vp.name}`, { route: u, viewport: vp.name, expected: 'no overflow', actual: 'horizontal overflow', likelyRootCause: 'responsive layout', minimalFix: 'overflow-x/grid', filesLikely: [] })
      if (vp.name === '390' && g === 'farms') await shot('mobile', 'farms-390')
      if (vp.name === '390' && g === 'projects') await shot('mobile', 'projects-390')
    }
    checks.responsive[vp.name] = { ...probe, triggerInView: inView, drawerOpened: Boolean(drawer) }
    if (!inView) issue('P1', `trigger-out-${vp.name}`, { route: '/', viewport: vp.name, expected: 'My Melega in viewport', actual: JSON.stringify(box), likelyRootCause: 'header crowding', minimalFix: 'shrink search/cluster', filesLikely: ['MelegaGlobalHeader.tsx'] })
  }

  // Back/forward smoke
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)
  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  await page.goBack().catch(() => null)
  await page.waitForTimeout(500)
  checks.backForward = {
    afterBack: page.url(),
    farms: page.url().includes('/farms'),
  }

  // Classify data-truth dashes
  for (const [k, v] of Object.entries(dataTruth.surfaces)) {
    const t = JSON.stringify(v)
    const hasDash = /—|N\/A|Unavailable/.test(t)
    const hasUnavailable = /Unavailable/i.test(t)
    if (hasUnavailable) {
      dataTruth.classifications.push({ surface: k, class: 'A_or_C', note: 'Unavailable label surfaced — prefer dash', severityHint: 'P1' })
      issue('P1', `data-unavailable-${k}`, { route: k, viewport: '1440', expected: 'dash when unknown', actual: 'Unavailable text', likelyRootCause: 'formatter/copy', minimalFix: 'map Unavailable→—', filesLikely: ['data-truth adapters'] })
    } else if (hasDash) {
      dataTruth.classifications.push({ surface: k, class: 'B', note: 'dash present — acceptable if source missing' })
    } else {
      dataTruth.classifications.push({ surface: k, class: 'ok', note: 'metrics present or empty without Unavailable' })
    }
  }

  const summary = {
    at: new Date().toISOString(),
    base: BASE,
    p0: issues.filter((i) => i.severity === 'P0').length,
    p1: issues.filter((i) => i.severity === 'P1').length,
    p2: issues.filter((i) => i.severity === 'P2').length,
    issueIds: issues.map((i) => `${i.severity}:${i.id}`),
  }

  writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify({ summary, checks, nav, shots, issues }, null, 2))
  writeFileSync(path.join(OUT, 'performance.json'), JSON.stringify({ base: BASE, nav, slow: nav.filter((n) => n.ms > 1500), p1Slow: nav.filter((n) => n.ms > 3000) }, null, 2))
  writeFileSync(path.join(OUT, 'data-truth-audit.md'), `# Data Truth Audit V5\n\n${dataTruth.classifications.map((c) => `- **${c.surface}**: ${c.class} — ${c.note}`).join('\n')}\n\n## Surfaces\n\n\`\`\`json\n${JSON.stringify(dataTruth.surfaces, null, 2)}\n\`\`\`\n`)

  console.log(JSON.stringify(summary, null, 2))
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
