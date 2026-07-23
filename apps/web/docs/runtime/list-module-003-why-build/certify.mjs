/**
 * LIST_MODULE_003 — DOM measurements + screenshots + a11y checks.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3497'

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
    const cards = document.querySelector('[data-testid="list-action-cards"]')
    const why = document.querySelector('[data-testid="list-why-build"]')
    const inner = document.querySelector('[data-testid="list-why-inner"]')
    const intro = document.querySelector('[data-testid="list-why-intro"]')
    const benefits = [...document.querySelectorAll('[data-pixel-why-benefit="265x80"]')]
    const icons = [...document.querySelectorAll('[data-testid^="list-why-icon-"]')]
    const placeholder = document.querySelector('[data-testid="list-intent-placeholder"]')
    const hBox = box(hero)
    const cBox = box(cards)
    const wBox = box(why)
    const gaps = []
    for (let i = 0; i < benefits.length - 1; i += 1) {
      const a = benefits[i].getBoundingClientRect()
      const b = benefits[i + 1].getBoundingClientRect()
      gaps.push(
        window.innerWidth < 768
          ? Math.round((b.top - a.bottom) * 100) / 100
          : Math.round((b.left - a.right) * 100) / 100,
      )
    }
    const semantic = {
      section: why?.tagName === 'SECTION',
      heading: Boolean(document.querySelector('#list-why-build-title')),
      list: document.querySelector('[data-testid="list-why-benefits"]')?.tagName === 'UL',
      items: benefits.every((b) => b.tagName === 'LI'),
      itemCount: benefits.length,
    }
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: hBox,
      cards: cBox,
      why: wBox,
      inner: box(inner),
      intro: box(intro),
      benefits: benefits.map((b) => box(b)),
      icons: icons.map((i) => box(i)),
      gaps,
      cardsToWhyGap: cBox && wBox ? wBox.top - cBox.bottom : null,
      heroUnchanged: hBox ? withinish(hBox.width, 1376) && withinish(hBox.height, 360) : null,
      cardsUnchanged: cBox ? withinish(cBox.width, 1376) && withinish(cBox.height, 272) : null,
      placeholderAfterWhy: placeholder && wBox ? placeholder.getBoundingClientRect().top >= wBox.bottom - 1 : null,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      semantic,
    }
    function withinish(a, t) {
      return Math.abs(a - t) <= 2
    }
  })
}

function evaluateDesktop(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('heroW', m.hero?.width, 1376)
  add('heroH', m.hero?.height, 360)
  add('cardsW', m.cards?.width, 1376)
  add('cardsH', m.cards?.height, 272)
  add('cardsToWhyGap', m.cardsToWhyGap, 24, 1)
  add('whyW', m.why?.width, 1376)
  add('whyH', m.why?.height, 112)
  add('innerW', m.inner?.width, 1344)
  add('innerH', m.inner?.height, 80)
  add('introW', m.intro?.width, 220)
  add('introH', m.intro?.height, 80)
  ;(m.benefits || []).forEach((b, i) => {
    add(`benefit${i}W`, b?.width, 265)
    add(`benefit${i}H`, b?.height, 80)
  })
  ;(m.gaps || []).forEach((g, i) => add(`gap${i}`, g, 16, 1))
  ;(m.icons || []).forEach((ic, i) => {
    add(`icon${i}W`, ic?.width, 44, 1)
    add(`icon${i}H`, ic?.height, 44, 1)
  })
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({
    name: 'placeholderAfterWhy',
    actual: m.placeholderAfterWhy,
    target: true,
    ok: m.placeholderAfterWhy === true,
  })
  checks.push({ name: 'semanticSection', actual: m.semantic?.section, target: true, ok: m.semantic?.section === true })
  checks.push({ name: 'semanticList', actual: m.semantic?.list, target: true, ok: m.semantic?.list === true })
  checks.push({ name: 'semanticItems', actual: m.semantic?.items, target: true, ok: m.semantic?.items === true })
  checks.push({ name: 'benefitCount', actual: m.semantic?.itemCount, target: 4, ok: m.semantic?.itemCount === 4 })
  return { pass: checks.every((c) => c.ok), checks }
}

function evaluateMobile(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('whyW', m.why?.width, 358, 2)
  checks.push({
    name: 'whyAutoHeight',
    actual: m.why?.height,
    target: '360-410',
    ok: (m.why?.height ?? 0) >= 300 && (m.why?.height ?? 0) <= 480,
  })
  ;(m.benefits || []).forEach((b, i) => {
    add(`benefit${i}H`, b?.height, 64, 2)
  })
  ;(m.gaps || []).forEach((g, i) => add(`gap${i}`, g, 10, 1))
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  return { pass: checks.every((c) => c.ok), checks }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  const desk = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await desk.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForSelector('[data-testid="list-why-build"]', { timeout: 90000 })
  await desk.waitForSelector('[data-testid="list-action-cards"]', { timeout: 30000 })
  await desk.waitForTimeout(1600)
  const desktop = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440.png'), fullPage: false })
  await desk.locator('[data-testid="list-why-build"]').screenshot({ path: path.join(OUT, 'desktop-why-module.png') })
  await desk.close()

  const tab = await browser.newPage({ viewport: { width: 1024, height: 900 } })
  await tab.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await tab.waitForSelector('[data-testid="list-why-build"]', { timeout: 90000 })
  await tab.waitForTimeout(1200)
  const tablet = await measure(tab)
  await tab.screenshot({ path: path.join(OUT, 'tablet-1024.png'), fullPage: false })
  await tab.close()

  const mob = await browser.newPage({ viewport: { width: 390, height: 900 } })
  await mob.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="list-why-build"]', { timeout: 90000 })
  await mob.waitForTimeout(1200)
  const mobile = await measure(mob)
  await mob.screenshot({ path: path.join(OUT, 'mobile-390.png'), fullPage: false })
  await mob.close()

  const mob430 = await browser.newPage({ viewport: { width: 430, height: 900 } })
  await mob430.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob430.waitForSelector('[data-testid="list-why-build"]', { timeout: 90000 })
  await mob430.waitForTimeout(800)
  const mobile430 = await measure(mob430)
  await mob430.close()

  await browser.close()

  const deskEval = evaluateDesktop(desktop)
  const mobEval = evaluateMobile(mobile)
  const a11y = {
    pass:
      desktop.semantic?.section &&
      desktop.semantic?.heading &&
      desktop.semantic?.list &&
      desktop.semantic?.items &&
      desktop.semantic?.itemCount === 4,
    desktop: desktop.semantic,
    tablet: tablet.semantic,
    mobile: mobile.semantic,
    mobile430Width: mobile430.why?.width,
  }

  const geometry = {
    desktop,
    tablet: { why: tablet.why, benefits: tablet.benefits },
    mobile,
    mobile430: { why: mobile430.why, overflowX: mobile430.overflowX },
    desktopChecks: deskEval,
    mobileChecks: mobEval,
    pass: deskEval.pass && mobEval.pass,
    deviationTargetPct: 3,
  }

  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(geometry, null, 2))
  fs.writeFileSync(path.join(OUT, 'accessibility-validation.json'), JSON.stringify(a11y, null, 2))

  console.log(JSON.stringify({ pass: geometry.pass && a11y.pass, desktop: deskEval, mobile: mobEval, a11y }, null, 2))
  if (!(geometry.pass && a11y.pass)) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
