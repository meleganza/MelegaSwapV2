/**
 * FARMS_MODULE_001_HERO — DOM measurements + screenshots.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const WEB = path.resolve(__dirname, '../../..')
const REPO = path.resolve(WEB, '../..')
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3511'
const MOCKUP_SHA = 'a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a'

function within(actual, target, tol = 2) {
  if (actual == null || Number.isNaN(actual)) return false
  return Math.abs(actual - target) <= tol
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left }
    }
    const hero = document.querySelector('[data-testid="farms-hero-module"]')
    const left = document.querySelector('[data-testid="farms-hero-left"]')
    const artwork = document.querySelector('[data-testid="farms-hero-artwork"]')
    const trust = document.querySelector('[data-testid="farms-hero-trust"]')
    const content = document.querySelector('[data-fs-content]')
    const trending = document.querySelector('[data-testid="melega-global-trending-bar"]')
    const explore = document.getElementById('explore-farms')
    const title = document.getElementById('farms-hero-title')
    const exploreCta = document.querySelector('[data-testid="farms-hero-explore-farms"]')
    const howCta = document.querySelector('[data-testid="farms-hero-how-farming-works"]')
    const h = box(hero)
    const l = box(left)
    const a = box(artwork)
    const t = box(trust)
    const tr = box(trending)
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: h,
      left: l,
      artwork: a,
      trust: t,
      content: box(content),
      trending: tr,
      gaps: {
        leftToArt: a && l ? a.left - l.right : null,
        artToTrust: t && a ? t.left - a.right : null,
        top: {
          heroY: h?.top ?? null,
          assumedStackPx: 116,
          gapAfterStack: h && tr ? h.top - tr.bottom : null,
        },
      },
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasExploreAnchor: Boolean(explore),
      module002: Boolean(document.querySelector('[data-farms-module="002"]')),
      module008: Boolean(document.querySelector('[data-farms-module="008"]')),
      titleText: title?.textContent?.trim() || null,
      exploreHref: exploreCta?.getAttribute('href') || null,
      howHref: howCta?.getAttribute('href') || null,
      howRendered: Boolean(howCta),
      legacyHeader: Boolean(document.querySelector('[data-studio-header="farms"]')),
      rootMounted: document.querySelector('[data-farms-module-001="mounted"]') != null,
    }
  })
}

function evaluateDesktop1440(m) {
  const checks = {
    heroWidth: within(m.hero?.width, 1376, 2),
    heroHeight: within(m.hero?.height, 260, 2),
    topGap: within(m.gaps?.top?.gapAfterStack, 24, 2),
    left: within(m.left?.width, 440, 2),
    artwork: within(m.artwork?.width, 480, 3) && within(m.artwork?.height, 230, 3),
    trust: within(m.trust?.width, 360, 3) && within(m.trust?.height, 230, 3),
    gapLeftArt: within(m.gaps?.leftToArt, 48, 2),
    gapArtTrust: within(m.gaps?.artToTrust, 48, 2),
    noOverflow: m.overflow === false,
    title: m.titleText === 'Farms',
    exploreHref: m.exploreHref === '#explore-farms',
    howOmitted: m.howRendered === false,
    noModule002: m.module002 === false,
    noLegacyHeader: m.legacyHeader === false,
    rootMounted: m.rootMounted === true,
  }
  return { pass: Object.values(checks).every(Boolean), checks }
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: false })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })

  const mockupPath = path.join(REPO, 'apps/web/docs/runtime/farms-architecture-000/farms-founder-mockup-lock.png')
  const mockupBytes = fs.readFileSync(mockupPath)
  const mockupSha = createHash('sha256').update(mockupBytes).digest('hex')
  fs.writeFileSync(
    path.join(OUT, 'mockup-integrity.json'),
    JSON.stringify(
      {
        sha256: mockupSha,
        expected: MOCKUP_SHA,
        bytes: mockupBytes.length,
        pass: mockupSha === MOCKUP_SHA,
      },
      null,
      2,
    ),
  )

  const browser = await chromium.launch({ headless: true })
  const viewports = {
    'desktop-1440': { width: 1440, height: 1200 },
    'desktop-1280': { width: 1280, height: 900 },
    'tablet-1024': { width: 1024, height: 900 },
    'mobile-430': { width: 430, height: 932 },
    'mobile-390': { width: 390, height: 844 },
  }

  const results = {}
  for (const [name, vp] of Object.entries(viewports)) {
    const page = await browser.newPage({ viewport: vp })
    await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-testid="farms-hero-module"]', { timeout: 90000 })
    await page.waitForTimeout(1500)
    results[name] = await measure(page)
    await shot(page, `${name}.png`)
    await page.close()
  }

  // Reduced motion / keyboard smoke on desktop
  const a11y = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await a11y.emulateMedia({ reducedMotion: 'reduce' })
  await a11y.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await a11y.waitForSelector('[data-testid="farms-hero-module"]', { timeout: 90000 })
  await a11y.focus('[data-testid="farms-hero-explore-farms"]')
  const focused = await a11y.evaluate(() => document.activeElement?.getAttribute('data-testid'))
  await a11y.keyboard.press('Enter')
  await a11y.waitForTimeout(400)
  const exploreInView = await a11y.evaluate(() => {
    const el = document.getElementById('explore-farms')
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.top < window.innerHeight && r.bottom > 0
  })
  await a11y.close()
  await browser.close()

  const desk = evaluateDesktop1440(results['desktop-1440'])
  const report = {
    auditedAt: new Date().toISOString(),
    viewports: results,
    desktop1440Pass: desk.checks,
    desktop1440AllPass: desk.pass,
    accessibility: {
      reducedMotionEmulated: true,
      focusTarget: focused,
      exploreScrollAfterEnter: exploreInView,
      pass: focused === 'farms-hero-explore-farms' && exploreInView,
    },
    responsive: {
      tabletOverflow: results['tablet-1024'].overflow === false,
      mobile390Overflow: results['mobile-390'].overflow === false,
      mobile430Overflow: results['mobile-430'].overflow === false,
      mobile390WidthOk: within(results['mobile-390'].hero?.width, 358, 4),
      mobile430WidthOk: within(results['mobile-430'].hero?.width, 398, 4),
    },
  }

  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(OUT, 'responsive-validation.json'),
    JSON.stringify({ ...report.responsive, pass: Object.values(report.responsive).every(Boolean) }, null, 2),
  )
  fs.writeFileSync(
    path.join(OUT, 'accessibility-validation.json'),
    JSON.stringify(report.accessibility, null, 2),
  )
  fs.writeFileSync(
    path.join(OUT, 'destination-validation.json'),
    JSON.stringify(
      {
        exploreFarms: {
          href: '#explore-farms',
          reservedForModule: '004',
          temporaryLegacyDestination: 'on-page #explore-farms band (legacy featured/explore)',
          onPageElementPresent: results['desktop-1440'].hasExploreAnchor,
          deadButton: false,
        },
        howFarmingWorks: {
          rendered: false,
          reason: 'No dedicated factual How Farming Works destination exists on-site; omitted honestly per Architecture.',
          blankModal: false,
          newExplanatoryContentCreated: false,
        },
      },
      null,
      2,
    ),
  )

  console.log(
    JSON.stringify(
      {
        pass: desk.pass && report.accessibility.pass && Object.values(report.responsive).every(Boolean),
        desktop1440: desk,
        responsive: report.responsive,
        accessibility: report.accessibility,
      },
      null,
      2,
    ),
  )
  if (!desk.pass) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
