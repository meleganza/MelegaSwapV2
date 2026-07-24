/**
 * PASSPORT_MODULE_002 — DOM measurements + screenshots.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const REPO = path.resolve(__dirname, '../../../../../')
const BASE = (process.env.CERT_BASE || 'http://127.0.0.1:52302').replace(/\/$/, '')
const EXPECTED_SHA = '14e0f0e570583aa05d06dc67b1e3f327bf890a17f6bd06b5787664bd699024df'
const MOCKUP_REL = 'apps/web/docs/runtime/passport-architecture-000/founder-approved-passport-mockup.png'

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
        width: Math.round(r.width * 100) / 100,
        height: Math.round(r.height * 100) / 100,
        left: Math.round(r.left * 100) / 100,
        top: Math.round(r.top * 100) / 100,
        right: Math.round(r.right * 100) / 100,
        bottom: Math.round(r.bottom * 100) / 100,
      }
    }
    const trending = document.querySelector('[data-testid="melega-global-trending-bar"]')
    const hero = document.querySelector('[data-testid="passport-hero-identity-module"]')
    const module = document.querySelector('[data-testid="passport-portfolio-overview"]')
    const summary = document.querySelector('[data-testid="passport-portfolio-summary"]')
    const chart = document.querySelector('[data-testid="passport-portfolio-chart"]')
    const kpiRow = document.querySelector('[data-testid="passport-portfolio-kpi-row"]')
    const kpis = [...document.querySelectorAll('[data-testid^="passport-portfolio-kpi-"]')].filter(
      (el) => !el.getAttribute('data-testid')?.endsWith('-value') && !el.getAttribute('data-testid')?.endsWith('-status'),
    )
    const hBox = box(hero)
    const mBox = box(module)
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      trending: box(trending),
      hero: hBox,
      module: mBox,
      summary: box(summary),
      chart: box(chart),
      kpiRow: box(kpiRow),
      kpis: kpis.map((el) => ({ id: el.getAttribute('data-testid'), ...box(el) })),
      heroToPortfolioGap: hBox && mBox ? mBox.top - hBox.bottom : null,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      totalText: document.querySelector('[data-testid="passport-portfolio-total"]')?.textContent?.trim(),
      chartPlaceholder: document
        .querySelector('[data-testid="passport-portfolio-chart-placeholder"]')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim(),
      laterAssets: Boolean(document.querySelector('[data-passport-module="003"]')),
      heroHeight: hBox?.height ?? null,
    }
  })
}

function evaluateDesktop(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('moduleWidth', m.module?.width, 1376)
  add('moduleHeight', m.module?.height, 176)
  add('moduleLeft', m.module?.left, 32)
  add('heroHeightFrozen', m.heroHeight, 360)
  add('heroToPortfolioGap', m.heroToPortfolioGap, 16)
  add('summaryWidth', m.summary?.width, 560)
  add('chartWidth', m.chart?.width, 320)
  add('kpiRowWidth', m.kpiRow?.width, 480)
  const kpiCards = (m.kpis || []).filter((k) =>
    /passport-portfolio-kpi-(crypto|mcredits|projects)$/.test(k.id || ''),
  )
  checks.push({ name: 'kpiCount', actual: kpiCards.length, target: 3, ok: kpiCards.length === 3 })
  kpiCards.forEach((k, i) => {
    add(`kpi${i}Width`, k.width, 160)
    add(`kpi${i}Height`, k.height, 120)
  })
  checks.push({
    name: 'noFakeTotal',
    actual: m.totalText,
    target: '—',
    ok: m.totalText === '—' || m.totalText === 'Not Available',
  })
  checks.push({
    name: 'noFakeChart',
    actual: m.chartPlaceholder,
    target: 'unavailable',
    ok: /unavailable/i.test(m.chartPlaceholder || ''),
  })
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({ name: 'noModule003', actual: m.laterAssets, target: false, ok: m.laterAssets === false })
  return { pass: checks.every((c) => c.ok), checks }
}

function evaluateMobile(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('moduleWidth', m.module?.width, 358, 2)
  checks.push({
    name: 'moduleAutoHeight',
    actual: m.module?.height,
    target: '>300',
    ok: (m.module?.height ?? 0) > 300,
  })
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  return { pass: checks.every((c) => c.ok), checks }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const mockupBytes = fs.readFileSync(path.join(REPO, MOCKUP_REL))
  const sha = createHash('sha256').update(mockupBytes).digest('hex')
  if (sha !== EXPECTED_SHA) {
    console.error('Mockup SHA mismatch', sha)
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: true })
  const desk = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await desk.goto(`${BASE}/passport/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForSelector('[data-testid="passport-portfolio-overview"]', { timeout: 90000 })
  await desk.waitForSelector('[data-testid="passport-hero-identity-module"]', { timeout: 30000 })
  await desk.waitForTimeout(1500)
  const desktop = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440.png'), fullPage: false })
  await desk.locator('[data-testid="passport-portfolio-overview"]').screenshot({
    path: path.join(OUT, 'desktop-module-crop.png'),
  })
  await desk.close()

  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mob.goto(`${BASE}/passport/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="passport-portfolio-overview"]', { timeout: 90000 })
  await mob.waitForTimeout(1200)
  const mobile = await measure(mob)
  await mob.screenshot({ path: path.join(OUT, 'mobile-390.png'), fullPage: false })
  await mob.close()

  const tab = await browser.newPage({ viewport: { width: 1024, height: 900 } })
  await tab.goto(`${BASE}/passport/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await tab.waitForSelector('[data-testid="passport-portfolio-overview"]', { timeout: 90000 })
  await tab.waitForTimeout(1000)
  await tab.screenshot({ path: path.join(OUT, 'tablet-1024.png'), fullPage: false })
  await tab.close()

  await browser.close()

  const deskEval = evaluateDesktop(desktop)
  const mobEval = evaluateMobile(mobile)
  const report = {
    measuredAt: new Date().toISOString(),
    base: BASE,
    desktop,
    mobile,
    desktopChecks: deskEval,
    mobileChecks: mobEval,
    pass: deskEval.pass && mobEval.pass,
    mockupSha256: sha,
  }
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(OUT, 'data-source-map.json'),
    JSON.stringify(
      {
        totalPortfolioValue: {
          rule: 'crypto + liquidity only when certified USD exists',
          production: 'unavailable',
        },
        performance: { h24: 'unavailable', d7: 'unavailable', d30: 'unavailable' },
        chart: { production: 'compact placeholder — no fake series' },
        cryptoAssets: { production: 'unavailable' },
        mCredits: {
          production: 'unavailable',
          neverInTotal: true,
          neverErc20: true,
        },
        projects: { production: 'unavailable controlled count', neverInTotal: true },
      },
      null,
      2,
    ),
  )

  console.log(
    JSON.stringify(
      {
        pass: report.pass,
        failedDesktop: deskEval.checks.filter((c) => !c.ok),
        failedMobile: mobEval.checks.filter((c) => !c.ok),
      },
      null,
      2,
    ),
  )
  if (!report.pass) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
