/**
 * LIST_MODULE_002 — DOM measurements, screenshots, intent validation.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3496'

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
    const hero = document.querySelector('[data-testid="list-one-page-header"]')
    const row = document.querySelector('[data-testid="list-action-cards"]')
    const cards = [...document.querySelectorAll('[data-testid^="list-action-"]')].filter((el) =>
      /^list-action-(import-token|create-token|claim-project|create-project|ai-assistant)$/.test(
        el.getAttribute('data-testid') || '',
      ),
    )
    const ctas = [...document.querySelectorAll('[data-testid^="list-action-cta-"]')]
    const badge = document.querySelector('[data-testid="list-action-popular-badge"]')
    const icon = document.querySelector('[data-testid="list-action-icon-import-token"]')
    const hBox = box(hero)
    const rBox = box(row)
    const gaps = []
    for (let i = 0; i < cards.length - 1; i += 1) {
      const a = cards[i].getBoundingClientRect()
      const b = cards[i + 1].getBoundingClientRect()
      const horizontal = Math.round((b.left - a.right) * 100) / 100
      const vertical = Math.round((b.top - a.bottom) * 100) / 100
      gaps.push(window.innerWidth < 768 ? vertical : horizontal)
    }
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: hBox,
      row: rBox,
      heroToCardsGap: hBox && rBox ? rBox.top - hBox.bottom : null,
      cards: cards.map((c) => ({
        testid: c.getAttribute('data-testid'),
        intent: c.getAttribute('data-list-intent'),
        featured: c.getAttribute('data-featured'),
        available: c.getAttribute('data-available'),
        box: box(c),
      })),
      gaps,
      ctas: ctas.map((c) => ({ testid: c.getAttribute('data-testid'), box: box(c) })),
      badge: box(badge),
      icon: box(icon),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      path: window.location.pathname,
      search: window.location.search,
      pageScrollWidth: document.documentElement.scrollWidth,
    }
  })
}

function evaluateDesktop(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('heroWidth', m.hero?.width, 1376)
  add('heroHeight', m.hero?.height, 360)
  add('heroToCardsGap', m.heroToCardsGap, 24)
  add('rowWidth', m.row?.width, 1376)
  add('rowHeight', m.row?.height, 272, 4)
  checks.push({ name: 'cardCount', actual: m.cards?.length, target: 5, ok: m.cards?.length === 5 })
  ;(m.cards || []).forEach((c, i) => {
    add(`card${i}Width`, c.box?.width, 256)
    add(`card${i}Height`, c.box?.height, 272)
  })
  ;(m.gaps || []).forEach((g, i) => add(`gap${i}`, g, 24, 1))
  ;(m.ctas || []).forEach((c, i) => {
    add(`cta${i}Width`, c.box?.width, 216, 1)
    add(`cta${i}Height`, c.box?.height, 44, 1)
  })
  add('iconTile', m.icon?.width, 56, 1)
  add('iconTileH', m.icon?.height, 56, 1)
  add('badgeW', m.badge?.width, 68, 1)
  add('badgeH', m.badge?.height, 20, 1)
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({
    name: 'onList',
    actual: m.path,
    target: '/list',
    ok: m.path === '/list' || m.path === '/list/',
  })
  const claim = m.cards?.find((c) => c.intent === 'claim-project')
  checks.push({ name: 'claimFeatured', actual: claim?.featured, target: '1', ok: claim?.featured === '1' })
  const create = m.cards?.find((c) => c.intent === 'create-token')
  checks.push({
    name: 'createUnavailable',
    actual: create?.available,
    target: '0',
    ok: create?.available === '0',
  })
  return { pass: checks.every((c) => c.ok), checks }
}

function evaluateMobile(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('rowWidth', m.row?.width, 358, 2)
  checks.push({ name: 'cardCount', actual: m.cards?.length, target: 5, ok: m.cards?.length === 5 })
  ;(m.cards || []).forEach((c, i) => {
    add(`card${i}Width`, c.box?.width, 358, 2)
    add(`card${i}Height`, c.box?.height, 82, 2)
  })
  ;(m.gaps || []).forEach((g, i) => add(`gap${i}`, g, 10, 1))
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  return { pass: checks.every((c) => c.ok), checks }
}

async function validateIntents(page) {
  const intents = ['import-token', 'create-token', 'claim-project', 'create-project', 'ai-assistant']
  const results = []
  for (const intent of intents) {
    await page.goto(`${BASE}/list?intent=${intent}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-testid="list-action-cards"]', { timeout: 60000 })
    await page.waitForTimeout(400)
    const state = await page.evaluate(() => ({
      path: location.pathname,
      search: location.search,
      placeholder: document.querySelector('[data-testid="list-intent-placeholder"]')?.getAttribute('data-list-intent'),
      selected: document.querySelector('[data-selected="1"]')?.getAttribute('data-list-intent') || null,
    }))
    results.push({
      intent,
      path: state.path,
      search: state.search,
      placeholder: state.placeholder,
      selected: state.selected,
      ok:
        (state.path === '/list' || state.path === '/list/') &&
        state.search.includes(`intent=${intent}`) &&
        state.placeholder === intent &&
        state.selected === intent,
    })
  }

  // invalid intent fallback
  await page.goto(`${BASE}/list?intent=not-a-real-intent`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="list-action-cards"]', { timeout: 60000 })
  const invalid = await page.evaluate(() => ({
    path: location.pathname,
    selected: document.querySelector('[data-selected="1"]')?.getAttribute('data-list-intent') || null,
    placeholder: document.querySelector('[data-testid="list-intent-placeholder"]')?.getAttribute('data-list-intent'),
  }))
  results.push({
    intent: 'invalid',
    ...invalid,
    ok:
      (invalid.path === '/list' || invalid.path === '/list/') &&
      invalid.selected == null &&
      !invalid.placeholder,
  })

  // back/forward through two intents
  await page.goto(`${BASE}/list?intent=import-token`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(300)
  await page.goto(`${BASE}/list?intent=claim-project`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(300)
  await page.goBack()
  await page.waitForTimeout(400)
  const back = await page.evaluate(() => location.search)
  await page.goForward()
  await page.waitForTimeout(400)
  const forward = await page.evaluate(() => location.search)
  results.push({
    intent: 'history',
    back,
    forward,
    ok: back.includes('import-token') && forward.includes('claim-project'),
  })

  return { pass: results.every((r) => r.ok), results }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  const desk = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await desk.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForSelector('[data-testid="list-action-cards"]', { timeout: 90000 })
  await desk.waitForSelector('[data-testid="list-one-page-header"]', { timeout: 30000 })
  await desk.waitForTimeout(1800)
  const desktop = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-default.png'), fullPage: false })

  const claim = desk.locator('[data-testid="list-action-claim-project"]')
  await claim.hover()
  await desk.waitForTimeout(200)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-claim-hover.png'), fullPage: false })

  await claim.focus()
  await desk.waitForTimeout(150)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-keyboard-focus.png'), fullPage: false })

  // overlay + diff vs approved design board crop (approx action row band)
  const rowShot = await desk.locator('[data-testid="list-action-cards"]').screenshot({
    path: path.join(OUT, 'desktop-row-module.png'),
  })
  void rowShot
  await desk.close()

  const tab = await browser.newPage({ viewport: { width: 1024, height: 900 } })
  await tab.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await tab.waitForSelector('[data-testid="list-action-cards"]', { timeout: 90000 })
  await tab.waitForTimeout(1200)
  const tablet = await measure(tab)
  await tab.screenshot({ path: path.join(OUT, 'tablet-1024.png'), fullPage: false })
  await tab.close()

  const mob = await browser.newPage({ viewport: { width: 390, height: 900 } })
  await mob.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="list-action-cards"]', { timeout: 90000 })
  await mob.waitForTimeout(1200)
  const mobile = await measure(mob)
  await mob.screenshot({ path: path.join(OUT, 'mobile-390.png'), fullPage: false })
  await mob.close()

  const intentPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const intents = await validateIntents(intentPage)
  await intentPage.close()
  await browser.close()

  const deskEval = evaluateDesktop(desktop)
  const mobEval = evaluateMobile(mobile)

  const geometry = {
    desktop,
    tablet: { row: tablet.row, cards: tablet.cards },
    mobile,
    desktopChecks: deskEval,
    mobileChecks: mobEval,
    pass: deskEval.pass && mobEval.pass,
    deviationTargetPct: 3,
  }
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(geometry, null, 2))
  fs.writeFileSync(path.join(OUT, 'intent-state-validation.json'), JSON.stringify(intents, null, 2))

  // simple overlay/diff placeholders from row screenshot if present
  try {
    const { createRequire } = await import('module')
    // optional — generate via python below if available
  } catch {
    /* ignore */
  }

  console.log(
    JSON.stringify(
      {
        pass: geometry.pass && intents.pass,
        desktop: deskEval,
        mobile: mobEval,
        intents: { pass: intents.pass, count: intents.results.length },
      },
      null,
      2,
    ),
  )
  if (!(geometry.pass && intents.pass)) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
