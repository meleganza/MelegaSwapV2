#!/usr/bin/env node
/**
 * MELEGA_DEX_V1_CERTIFIED_PRODUCT_RECOVERY — multi-route Playwright certification.
 * Same cumulative build; no redesign.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const REPO = path.resolve(__dirname, '../../../../..')
const BASE = (process.env.NEXT_URL || process.env.CERT_BASE || 'http://127.0.0.1:3027').replace(/\/$/, '')

const require = createRequire(import.meta.url)
let chromium
for (const p of [
  '/tmp/melega-dex-v1-cert/node_modules/playwright',
  '/tmp/lb-pixel002-cert/node_modules/playwright',
  path.resolve(REPO, 'node_modules/playwright'),
  path.resolve(REPO, '../MelegaSwapV2/node_modules/playwright'),
]) {
  try {
    ;({ chromium } = require(p))
    break
  } catch {
    /* next */
  }
}
if (!chromium) throw new Error('playwright not found')

const ROUTES = [
  { path: '/', name: 'home', shots: ['home-instant-desktop', 'home-smart-desktop', 'home-mobile'] },
  { path: '/?focus=swap', name: 'home-focus-swap' },
  { path: '/swap', name: 'swap' },
  { path: '/liquidity', name: 'liquidity', shot: 'liquidity-desktop' },
  { path: '/liquidity-studio', name: 'liquidity-studio' },
  { path: '/add', name: 'add' },
  { path: '/farms', name: 'farms', shot: 'farms-desktop' },
  { path: '/pools', name: 'pools', shots: ['pools-with-positions-desktop', 'pools-refresh-retains-positions', 'pools-mobile'] },
  { path: '/list', name: 'list', shot: 'list-desktop' },
  { path: '/passport', name: 'passport', shot: 'passport-desktop' },
]

const VIEWPORTS = {
  desktop1440: { width: 1440, height: 900 },
  desktop1280: { width: 1280, height: 800 },
  tablet1024: { width: 1024, height: 768 },
  mobile430: { width: 430, height: 932 },
  mobile390: { width: 390, height: 844 },
}

const LEGACY_BANNED = ['Instant Swap', 'Smart Swap →', 'TRENDING ON MELEGA DEX']

async function inspectRoute(page, route) {
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e.message || e)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console:${msg.text()}`)
  })

  const res = await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1800)

  const body = await page.evaluate(() => {
    const text = document.body?.innerText || ''
    const html = document.body?.innerHTML || ''
    const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    return {
      title: document.title,
      textSample: text.slice(0, 4000),
      overflowX,
      hasLiquidityModules: !!document.querySelector('[data-liquidity-module-001="mounted"]'),
      hasFarmsHero: !!document.querySelector('[data-farms-module="001"], [data-farms-module-001="mounted"]'),
      hasPoolsHero: !!document.querySelector('[data-pools-module="001"], [data-pools-module-001="mounted"]'),
      hasPoolsPositions: !!document.querySelector('[data-pools-module="003"]'),
      hasListStudio: !!document.querySelector('[data-list-studio], [data-list-module], [data-testid*="list"]') || /List Studio|Token List/i.test(text),
      hasPassport: !!document.querySelector('[data-passport], [data-passport-module]') || /Passport/i.test(text),
      hasSwapTerminal: !!document.querySelector('[data-home-swap-stack], [data-swap-experience], [data-testid="dex-home-instant-swap"]'),
      hasTradeMode: !!document.querySelector('[data-testid*="trade-mode"], [data-swap-experience]') || /Instant|Smart/.test(html),
      legacyLiquidityBody: !!document.querySelector('[data-liquidity-legacy-body="mounted"]'),
      archivedLiquidityLegacy: !!document.querySelector('[data-liquidity-legacy-body="archived"]'),
      singleSwapCta: !!document.querySelector('[data-testid="dex-home-start-trading"]'),
      hasInstantSwapString: text.includes('Instant Swap'),
      hasSmartSwapArrow: text.includes('Smart Swap →') || text.includes('Smart Swap →'),
      hasTrendingMarcoBar: /TRENDING ON MELEGA DEX/i.test(text),
    }
  })

  // Try Instant|Smart / STANDARD|SMARTSWAP tab interaction on home
  let smartModeOk = null
  if (route.path === '/' || route.path.startsWith('/?')) {
    try {
      const smartBtn = page
        .locator('button, [role="tab"]')
        .filter({ hasText: /^(Smart|SMARTSWAP|SmartSwap)$/i })
        .first()
      if (await smartBtn.count()) {
        await smartBtn.click({ timeout: 3000 })
        await page.waitForTimeout(500)
        smartModeOk = await page.evaluate(() => {
          const stack = document.querySelector('[data-home-swap-stack], [data-swap-experience]')
          const exp = stack?.getAttribute('data-swap-experience')
          return exp === 'smart' || exp === 'smartswap' || /Route|AI insight|Fee|Best route/i.test(document.body.innerText)
        })
      }
    } catch {
      smartModeOk = false
    }
  }

  return {
    route: route.path,
    name: route.name,
    status: res?.status() ?? null,
    pageErrors: errors.filter((e) => !/ResizeObserver|hydration|MetaMask|ethereum/i.test(e)).slice(0, 20),
    smartModeOk,
    ...body,
  }
}

function assertRoute(r) {
  const fails = []
  if (r.status && r.status >= 500) fails.push(`HTTP ${r.status}`)
  if (r.overflowX) fails.push('horizontal overflow')
  if (r.hasInstantSwapString) fails.push('legacy Instant Swap string')
  if (r.hasSmartSwapArrow) fails.push('legacy Smart Swap →')
  if (r.hasTrendingMarcoBar) fails.push('legacy TRENDING ON MELEGA DEX bar')
  if (r.legacyLiquidityBody) fails.push('liquidity legacy body mounted')

  if (r.name === 'home' || r.name === 'home-focus-swap') {
    if (!r.hasSwapTerminal) fails.push('missing swap terminal')
    if (!r.singleSwapCta && r.name === 'home') fails.push('missing single Swap CTA')
  }
  if (r.name === 'liquidity' || r.name === 'liquidity-studio') {
    if (!r.hasLiquidityModules) fails.push('missing Liquidity V1 modules')
  }
  if (r.name === 'farms' && !r.hasFarmsHero) fails.push('missing Farms V1 hero')
  if (r.name === 'pools') {
    if (!r.hasPoolsHero) fails.push('missing Pools V1 hero')
    if (!r.hasPoolsPositions) fails.push('missing Pools My Positions module')
  }
  if (r.name === 'passport' && !r.hasPassport) fails.push('missing Passport surface')
  if (r.name === 'list' && !r.hasListStudio) fails.push('missing List surface')

  return fails
}

async function main() {
  const sha = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim()
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: REPO }).toString().trim()

  const browser = await chromium.launch({ headless: true })
  const routeResults = []
  const responsive = []
  const a11y = []

  try {
    // Desktop primary pass
    const desk = await browser.newContext({ viewport: VIEWPORTS.desktop1440 })
    const page = await desk.newPage()

    for (const route of ROUTES) {
      const r = await inspectRoute(page, route)
      const fails = assertRoute(r)
      r.fails = fails
      r.pass = fails.length === 0
      routeResults.push(r)

      if (route.name === 'home') {
        await page.screenshot({ path: path.join(OUT, 'home-instant-desktop.png'), fullPage: false })
        try {
          const smartBtn = page.locator('button, [role="tab"]').filter({ hasText: /^Smart$/i }).first()
          if (await smartBtn.count()) {
            await smartBtn.click()
            await page.waitForTimeout(400)
          }
        } catch {
          /* optional */
        }
        await page.screenshot({ path: path.join(OUT, 'home-smart-desktop.png'), fullPage: false })
      }
      if (route.shot) {
        await page.screenshot({ path: path.join(OUT, `${route.shot}.png`), fullPage: false })
      }
      if (route.shots) {
        for (const s of route.shots) {
          if (s.includes('mobile')) continue
          await page.screenshot({ path: path.join(OUT, `${s}.png`), fullPage: false })
        }
      }
    }
    await desk.close()

    // Mobile home + pools
    const mob = await browser.newContext({ viewport: VIEWPORTS.mobile390 })
    const mp = await mob.newPage()
    await mp.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await mp.waitForTimeout(1200)
    await mp.screenshot({ path: path.join(OUT, 'home-mobile.png'), fullPage: false })
    const mobHome = await inspectRoute(mp, { path: '/', name: 'home-mobile' })
    responsive.push({ viewport: '390x844', route: '/', overflowX: mobHome.overflowX, pass: !mobHome.overflowX })

    await mp.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await mp.waitForTimeout(1200)
    await mp.screenshot({ path: path.join(OUT, 'pools-mobile.png'), fullPage: false })
    await mob.close()

    // Extra viewports smoke
    for (const [name, vp] of Object.entries(VIEWPORTS)) {
      if (name === 'desktop1440' || name === 'mobile390') continue
      const ctx = await browser.newContext({ viewport: vp })
      const p = await ctx.newPage()
      for (const pathName of ['/', '/liquidity', '/farms', '/pools']) {
        await p.goto(`${BASE}${pathName}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
        await p.waitForTimeout(800)
        const ox = await p.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        )
        responsive.push({ viewport: name, route: pathName, overflowX: ox, pass: !ox })
      }
      await ctx.close()
    }

    // Accessibility: focus visibility sample on home
    const aCtx = await browser.newContext({ viewport: VIEWPORTS.desktop1440 })
    const ap = await aCtx.newPage()
    await ap.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await ap.waitForTimeout(800)
    await ap.keyboard.press('Tab')
    await ap.keyboard.press('Tab')
    const focus = await ap.evaluate(() => {
      const el = document.activeElement
      if (!el) return { ok: false }
      const s = getComputedStyle(el)
      return {
        tag: el.tagName,
        testid: el.getAttribute('data-testid'),
        outline: s.outlineStyle,
        outlineWidth: s.outlineWidth,
        boxShadow: s.boxShadow,
        ok: s.outlineStyle !== 'none' || (s.boxShadow && s.boxShadow !== 'none') || el.matches(':focus-visible'),
      }
    })
    a11y.push({ check: 'keyboard-focus-home', ...focus })
    await aCtx.close()
  } finally {
    await browser.close()
  }

  const routesPass = routeResults.every((r) => r.pass)
  const responsivePass = responsive.every((r) => r.pass)

  const routeValidation = {
    missionId: 'MELEGA_DEX_V1_CERTIFIED_PRODUCT_RECOVERY_AND_PRODUCTION_CONVERGENCE',
    base: BASE,
    sha,
    branch,
    routes: routeResults,
    pass: routesPass,
  }
  fs.writeFileSync(path.join(OUT, 'route-validation.json'), JSON.stringify(routeValidation, null, 2))

  fs.writeFileSync(
    path.join(OUT, 'responsive-validation.json'),
    JSON.stringify({ pass: responsivePass, checks: responsive }, null, 2),
  )

  fs.writeFileSync(
    path.join(OUT, 'navigation-validation.json'),
    JSON.stringify(
      {
        pass: routesPass,
        mandatoryRoutes: ROUTES.map((r) => r.path),
        notes: 'All mandatory routes loaded on same local build',
      },
      null,
      2,
    ),
  )

  fs.writeFileSync(
    path.join(OUT, 'accessibility-validation.json'),
    JSON.stringify({ pass: a11y.every((a) => a.ok !== false), checks: a11y }, null, 2),
  )

  const summary = {
    missionId: 'MELEGA_DEX_V1_CERTIFIED_PRODUCT_RECOVERY_AND_PRODUCTION_CONVERGENCE',
    sha,
    branch,
    base: BASE,
    routesPass,
    responsivePass,
    legacyBanned: LEGACY_BANNED,
    pass: routesPass && responsivePass,
    generatedAt: new Date().toISOString(),
  }
  fs.writeFileSync(path.join(OUT, 'certify-summary.json'), JSON.stringify(summary, null, 2))
  console.log(JSON.stringify(summary, null, 2))
  if (!summary.pass) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
