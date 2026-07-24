/**
 * LIST_MODULE_001_HERO — DOM measurements + screenshots + overlay.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3495'

function within(actual, target, tol = 2) {
  if (actual == null || Number.isNaN(actual)) return false
  return Math.abs(actual - target) <= tol
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        left: r.left,
      }
    }
    const desktopHeader = [...document.querySelectorAll('header')].find((el) => {
      const s = getComputedStyle(el)
      return s.position === 'fixed' && el.getBoundingClientRect().height >= 70 && el.getBoundingClientRect().height <= 74
    })
    const trending = document.querySelector('[data-testid="melega-global-trending-bar"]')
    const hero = document.querySelector('[data-testid="list-one-page-header"]')
    const text = document.querySelector('[data-testid="list-hero-text"]')
    const headline = document.querySelector('[data-testid="list-hero-headline"]')
    const desc = document.querySelector('[data-testid="list-hero-description"]')
    const stats = document.querySelector('[data-testid="list-hero-stats"]')
    const art = document.querySelector('[data-testid="list-hero-art-frame"]')
    const cards = [...document.querySelectorAll('[data-pixel-stat="120x72"]')]
    const hBox = box(desktopHeader)
    const tBox = box(trending)
    const heroBox = box(hero)
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      header: hBox,
      trending: tBox,
      hero: heroBox,
      text: box(text),
      headline: box(headline),
      description: box(desc),
      stats: box(stats),
      artFrame: box(art),
      statCards: cards.map((c) => box(c)),
      trendingToHeroGap: heroBox && tBox ? heroBox.top - tBox.bottom : null,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      heroBackgroundImage: hero ? getComputedStyle(hero).backgroundImage : null,
      artSrc: document.querySelector('[data-testid="list-hero-artwork"]')?.getAttribute('src'),
      headlineText: headline?.textContent?.replace(/\s+/g, ' ').trim(),
      statValues: cards.map((c) => c.querySelector('span')?.parentElement?.querySelector('span')?.textContent || c.textContent),
      pageScrollWidth: document.documentElement.scrollWidth,
    }
  })
}

function evaluateDesktop(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('headerHeight', m.header?.height, 72)
  add('trendingHeight', m.trending?.height, 44)
  add('trendingToHeroGap', m.trendingToHeroGap, 24)
  add('heroWidth', m.hero?.width, 1376)
  add('heroHeight', m.hero?.height, 360)
  add('heroLeft', m.hero?.left, 32)
  add('heroRightMargin', m.viewport.width - (m.hero?.right ?? 0), 32)
  add('artWidth', m.artFrame?.width, 560, 4)
  add('artHeight', m.artFrame?.height, 320, 4)
  if (m.statCards?.length === 4) {
    m.statCards.forEach((c, i) => {
      add(`stat${i}Width`, c?.width, 120, 2)
      add(`stat${i}Height`, c?.height, 72, 2)
    })
  } else {
    checks.push({ name: 'statCardCount', actual: m.statCards?.length, target: 4, ok: false })
  }
  checks.push({
    name: 'exactHeroImage',
    actual: m.heroBackgroundImage,
    target: 'list-hero-background.png',
    ok: Boolean(m.heroBackgroundImage?.includes('list-hero-background.png')),
  })
  checks.push({
    name: 'exactArtwork',
    actual: m.artSrc,
    target: '/images/list/list-hero-artwork.png',
    ok: m.artSrc === '/images/list/list-hero-artwork.png',
  })
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({
    name: 'noFakeStats',
    actual: JSON.stringify(m.statValues),
    target: '—',
    ok: !/2341|847|184\.7/.test(JSON.stringify(m.statValues || [])),
  })
  return { pass: checks.every((c) => c.ok), checks }
}

function evaluateMobile(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('heroWidth', m.hero?.width, 358, 2)
  checks.push({
    name: 'heroAutoHeight',
    actual: m.hero?.height,
    target: '>320',
    ok: (m.hero?.height ?? 0) > 320,
  })
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({
    name: 'statCardCount',
    actual: m.statCards?.length,
    target: 4,
    ok: m.statCards?.length === 4,
  })
  return { pass: checks.every((c) => c.ok), checks }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await desk.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForSelector('[data-testid="list-one-page-header"]', { timeout: 90000 })
  await desk.waitForSelector('[data-testid="melega-global-trending-bar"]', { timeout: 30000 })
  await desk.waitForTimeout(2000)
  const desktop = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-hero.png'), fullPage: false })
  const heroShot = await desk.locator('[data-testid="list-one-page-header"]').screenshot({
    path: path.join(OUT, 'desktop-hero-module.png'),
  })
  void heroShot
  await desk.close()

  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mob.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="list-one-page-header"]', { timeout: 90000 })
  await mob.waitForTimeout(2000)
  const mobile = await measure(mob)
  await mob.screenshot({ path: path.join(OUT, 'mobile-390-hero.png'), fullPage: false })
  await mob.close()

  await browser.close()

  const deskEval = evaluateDesktop(desktop)
  const mobEval = evaluateMobile(mobile)

  // Overlay: compare hero module vs approved design (scaled)
  // Bounding boxes for report
  const report = {
    desktop,
    mobile,
    desktopChecks: deskEval,
    mobileChecks: mobEval,
    pass: deskEval.pass && mobEval.pass,
    deviationTargetPct: 3,
  }
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(report, null, 2))

  console.log(JSON.stringify({ pass: report.pass, desktop: deskEval, mobile: mobEval }, null, 2))
  if (!report.pass) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
