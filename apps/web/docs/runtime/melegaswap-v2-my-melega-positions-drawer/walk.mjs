/**
 * My Melega Positions Drawer — browser acceptance.
 */
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.ACCEPT_BASE || 'http://127.0.0.1:3066'
const OUT = __dirname
const SHOTS = path.join(OUT, 'screenshots')
mkdirSync(SHOTS, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
]

const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'project', path: '/@marco' },
  { id: 'farms', path: '/farms' },
  { id: 'pools', path: '/pools' },
  { id: 'liquidity', path: '/liquidity-studio' },
  { id: 'portfolio', path: '/portfolio' },
]

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

  const results = {
    at: new Date().toISOString(),
    base: BASE,
    viewports: {},
    routes: {},
    checks: {},
    bugs: [],
  }

  async function probe(page) {
    return page.evaluate(() => {
      const text = document.body.innerText || ''
      const trigger =
        document.querySelector('[data-testid="melega-header-my-melega"]') ||
        document.querySelector('[data-testid="melega-mobile-my-melega"]')
      const overflow = document.querySelector('[data-testid="melega-header-overflow"]')
      const primaryNav = Array.from(
        document.querySelectorAll('[data-testid="melega-header-primary-nav"] a, [data-testid="melega-header-primary-nav"] button'),
      ).map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
      const drawer = document.querySelector('[data-testid="my-melega-drawer"]')
      const overlay = document.querySelector('[data-testid="my-melega-overlay"]')
      const z = overlay ? Number(getComputedStyle(overlay).zIndex) || 0 : 0
      return {
        hasTrigger: Boolean(trigger),
        hasOverflow: Boolean(overflow),
        primaryNav,
        portfolioInPrimary: primaryNav.some((t) => /^Portfolio$/i.test(t)),
        drawerOpen: Boolean(drawer),
        overlayZ: z,
        passportCopy: /Passport status|Guest|Subject|Verification/i.test(text) && Boolean(drawer),
        disconnected: Boolean(document.querySelector('[data-testid="my-melega-disconnected"]')),
        connected: Boolean(document.querySelector('[data-testid="my-melega-positions"]')),
        viewPortfolio: Boolean(document.querySelector('[data-testid="my-melega-full-portfolio"]')),
        pageBehind: Boolean(document.querySelector('[data-melega-app-shell]')),
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      }
    })
  }

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  for (const route of ROUTES) {
    const t0 = Date.now()
    await desktop.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await desktop.waitForTimeout(900)
    const before = await probe(desktop)
    const triggerSel =
      (await desktop.$('[data-testid="melega-header-my-melega"]')) != null
        ? '[data-testid="melega-header-my-melega"]'
        : '[data-testid="melega-mobile-my-melega"]'
    const openT0 = Date.now()
    await desktop.locator(triggerSel).click({ force: true })
    await desktop.waitForSelector('[data-testid="my-melega-drawer"]', { timeout: 3000 })
    const openMs = Date.now() - openT0
    const open = await probe(desktop)
    if (route.id === 'home') {
      await desktop.screenshot({ path: path.join(SHOTS, 'home-drawer-desktop.png'), fullPage: false })
    }
    if (route.id === 'project') {
      await desktop.screenshot({ path: path.join(SHOTS, 'project-drawer-desktop.png'), fullPage: false })
    }
    if (route.id === 'farms') {
      await desktop.screenshot({ path: path.join(SHOTS, 'farms-drawer-desktop.png'), fullPage: false })
    }
    if (route.id === 'portfolio') {
      await desktop.click('[data-testid="my-melega-close"]').catch(() => null)
      await desktop.waitForTimeout(200)
      await desktop.screenshot({ path: path.join(SHOTS, 'portfolio-secondary-route.png'), fullPage: false })
      await desktop.locator(triggerSel).click({ force: true })
      await desktop.waitForSelector('[data-testid="my-melega-drawer"]', { timeout: 3000 })
    }
    await desktop.keyboard.press('Escape')
    await desktop.waitForTimeout(200)
    const closed = await probe(desktop)
    results.routes[route.id] = {
      path: route.path,
      loadMs: Date.now() - t0,
      openMs,
      before,
      open,
      closedDrawer: !closed.drawerOpen,
      pageRemains: closed.pageBehind,
    }
    // openMs is Playwright round-trip (includes paint wait); shell itself is sync context open.
    if (!open.hasTrigger) results.bugs.push(`${route.id}: missing My Melega trigger`)
    if (open.hasOverflow) results.bugs.push(`${route.id}: hamburger still present`)
    if (open.portfolioInPrimary) results.bugs.push(`${route.id}: Portfolio still in primary nav`)
    if (open.overlayZ < 10040) results.bugs.push(`${route.id}: overlay z-index ${open.overlayZ}`)
    if (open.passportCopy) results.bugs.push(`${route.id}: Passport copy in drawer`)
  }

  // Navigate Farms → back → reopen (use count row when connected; else primary nav)
  await desktop.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await desktop.locator('[data-testid="melega-header-my-melega"]').click({ force: true })
  await desktop.waitForSelector('[data-testid="my-melega-drawer"]')
  const countFarms = await desktop.$('[data-testid="my-melega-count-farms"]')
  if (countFarms) {
    await countFarms.click()
  } else {
    await desktop.keyboard.press('Escape')
    await desktop.waitForTimeout(200)
    await desktop.locator('[data-testid="melega-header-nav-farms"]').click({ force: true })
  }
  await desktop.waitForTimeout(1200)
  const onFarms = desktop.url().includes('/farms')
  await desktop.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await desktop.waitForTimeout(600)
  await desktop.locator('[data-testid="melega-header-my-melega"]').click({ force: true })
  await desktop.waitForSelector('[data-testid="my-melega-drawer"]')
  const reopened = await probe(desktop)
  const portfolioLink = await desktop.$('[data-testid="my-melega-full-portfolio"]')
  if (portfolioLink) {
    await portfolioLink.click()
    await desktop.waitForTimeout(1200)
  } else {
    await desktop.keyboard.press('Escape')
    await desktop.goto(`${BASE}/portfolio`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  }
  results.checks.navFarmsBackReopen = {
    onFarms,
    reopened: reopened.drawerOpen,
    landedPortfolio: desktop.url().includes('/portfolio'),
    disconnectedFallback: !countFarms,
  }

  // Mobile sheet
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mobile.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await mobile.waitForTimeout(800)
  await mobile.locator('[data-testid="melega-mobile-my-melega"]').click({ force: true })
  await mobile.waitForSelector('[data-testid="my-melega-drawer"]', { timeout: 3000 })
  const mobileProbe = await probe(mobile)
  await mobile.screenshot({ path: path.join(SHOTS, 'drawer-mobile.png'), fullPage: false })
  // zero / disconnected capture
  await mobile.screenshot({ path: path.join(SHOTS, 'drawer-zero-state.png'), fullPage: false })
  results.checks.mobile = mobileProbe

  for (const vp of VIEWPORTS) {
    const p = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await p.waitForTimeout(600)
    const sel =
      vp.width < 1024 ? '[data-testid="melega-mobile-my-melega"]' : '[data-testid="melega-header-my-melega"]'
    const box = await p.locator(sel).boundingBox()
    const inView = box ? box.x + box.width <= vp.width + 1 && box.x >= -1 : false
    await p.locator(sel).click({ force: true })
    await p.waitForSelector('[data-testid="my-melega-drawer"]', { timeout: 3000 })
    const pr = await probe(p)
    results.viewports[vp.name] = {
      width: vp.width,
      drawerOpen: pr.drawerOpen,
      overflow: pr.horizontalOverflow,
      triggerInView: inView,
      z: pr.overlayZ,
    }
    if (!inView) results.bugs.push(`${vp.name}: My Melega trigger outside viewport`)
    await p.close()
  }

  results.checks.pass =
    results.bugs.length === 0 &&
    Object.values(results.routes).every((r) => r.open.drawerOpen && r.closedDrawer) &&
    results.checks.mobile.drawerOpen

  writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify({ pass: results.checks.pass, bugs: results.bugs, openMs: Object.fromEntries(Object.entries(results.routes).map(([k, v]) => [k, v.openMs])) }, null, 2))
  await browser.close()
  if (!results.checks.pass) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
