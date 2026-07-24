/**
 * PASSPORT_MODULE_004 — DOM measurements + screenshots.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const REPO = path.resolve(__dirname, '../../../../../')
const BASE = (process.env.CERT_BASE || 'http://127.0.0.1:52304').replace(/\/$/, '')
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
    const hero = document.querySelector('[data-testid="passport-hero-identity-module"]')
    const portfolio = document.querySelector('[data-testid="passport-portfolio-overview"]')
    const assets = document.querySelector('[data-testid="passport-assets-module"]')
    const module = document.querySelector('[data-testid="passport-projects-module"]')
    const create = document.querySelector('[data-testid="passport-create-project-card"]')
    const cta = document.querySelector('[data-testid="passport-create-project-cta"]')
    const explain = document.querySelector('[data-testid="passport-projects-empty-explain"]')
    const aBox = box(assets)
    const mBox = box(module)
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: box(hero),
      portfolio: box(portfolio),
      assets: aBox,
      module: mBox,
      create: box(create),
      explain: box(explain),
      assetsToProjectsGap: aBox && mBox ? mBox.top - aBox.bottom : null,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      createHref: cta?.getAttribute('href'),
      empty: module?.getAttribute('data-projects-empty'),
      projectCards: document.querySelectorAll('[data-testid="passport-project-card"]').length,
      laterLiquidity: Boolean(document.querySelector('[data-passport-module="005"]')),
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
  add('heroHeightFrozen', m.hero?.height, 360)
  add('portfolioHeightFrozen', m.portfolio?.height, 176)
  add('assetsHeightFrozen', m.assets?.height, 176)
  add('assetsToProjectsGap', m.assetsToProjectsGap, 16)
  add('createWidth', m.create?.width, 256)
  add('createHeight', m.create?.height, 144)
  // Next trailingSlash may render `/list/?intent=…`; source CTA remains `/list?intent=create-project`.
  const hrefOk =
    m.createHref === '/list?intent=create-project' ||
    m.createHref === '/list/?intent=create-project'
  checks.push({
    name: 'createHref',
    actual: m.createHref,
    target: '/list?intent=create-project',
    ok: hrefOk,
  })
  checks.push({
    name: 'emptyState',
    actual: m.empty,
    target: 'true',
    ok: m.empty === 'true' && m.projectCards === 0 && Boolean(m.explain),
  })
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({ name: 'noModule005', actual: m.laterLiquidity, target: false, ok: m.laterLiquidity === false })
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
    target: '>160',
    ok: (m.module?.height ?? 0) > 160,
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
  await desk.waitForSelector('[data-testid="passport-projects-module"]', { timeout: 90000 })
  await desk.waitForTimeout(1500)
  const desktop = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440.png'), fullPage: false })
  await desk.locator('[data-testid="passport-projects-module"]').screenshot({
    path: path.join(OUT, 'desktop-module-crop.png'),
  })
  await desk.close()

  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mob.goto(`${BASE}/passport/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="passport-projects-module"]', { timeout: 90000 })
  await mob.waitForTimeout(1200)
  const mobile = await measure(mob)
  await mob.screenshot({ path: path.join(OUT, 'mobile-390.png'), fullPage: false })
  await mob.close()

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
        controlledProjects: {
          production: 'empty — no Passport controlled-projects producer',
          neverInferFromHoldings: true,
        },
        createProject: { href: '/list?intent=create-project' },
        statusRole: 'only from factual control records when available',
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
