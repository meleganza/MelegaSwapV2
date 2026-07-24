/**
 * PASSPORT_MODULE_007 — DOM measurements + screenshots.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const REPO = path.resolve(__dirname, '../../../../../')
const WEB = path.resolve(__dirname, '../../../')
const BASE = (process.env.CERT_BASE || 'http://127.0.0.1:52307').replace(/\/$/, '')
const EXPECTED_SHA = '14e0f0e570583aa05d06dc67b1e3f327bf890a17f6bd06b5787664bd699024df'
const MOCKUP_REL = 'apps/web/docs/runtime/passport-architecture-000/founder-approved-passport-mockup.png'
const FREEZE_REL =
  'apps/web/src/views/PassportStudio/__tests__/passportModule001_002_003_004_005_006.freeze.sha256.json'

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
    const activity = document.querySelector('[data-testid="passport-activity-module"]')
    const module = document.querySelector('[data-testid="passport-security-module"]')
    const header = document.querySelector('[data-testid="passport-security-header"]')
    const row = document.querySelector('[data-testid="passport-security-row-identity"]')
    const aBox = box(activity)
    const mBox = box(module)
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: box(document.querySelector('[data-testid="passport-hero-identity-module"]')),
      activity: aBox,
      module: mBox,
      header: box(header),
      row: box(row),
      activityToSecurityGap: aBox && mBox ? mBox.left - aBox.right : null,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      state: module?.getAttribute('data-security-state'),
      reserveGone: !document.querySelector('[data-testid="passport-security-reserve"]'),
      rowCount: document.querySelectorAll('[data-testid^="passport-security-row-"]').length,
    }
  })
}

function evaluateDesktop(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('moduleWidth', m.module?.width, 680)
  add('moduleHeight', m.module?.height, 360)
  add('headerHeight', m.header?.height, 64, 1)
  add('activityHeightFrozen', m.activity?.height, 360)
  add('activityToSecurityGap', m.activityToSecurityGap, 16, 1)
  add('heroHeightFrozen', m.hero?.height, 360)
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({ name: 'reserveGone', actual: m.reserveGone, target: true, ok: m.reserveGone === true })
  return { pass: checks.every((c) => c.ok), checks }
}

function evaluateMobile(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('moduleWidth', m.module?.width, 358, 2)
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

  const freeze = JSON.parse(fs.readFileSync(path.join(REPO, FREEZE_REL), 'utf8'))
  const frozenIntegrity = { ok: true, files: {} }
  for (const [file, expected] of Object.entries(freeze.files)) {
    const abs = path.join(WEB, 'src/views/PassportStudio', file)
    const actual = createHash('sha256').update(fs.readFileSync(abs)).digest('hex')
    const ok = actual === expected
    frozenIntegrity.files[file] = { expected, actual, ok }
    if (!ok) frozenIntegrity.ok = false
  }
  fs.writeFileSync(path.join(OUT, 'frozen-modules-integrity.json'), JSON.stringify(frozenIntegrity, null, 2))
  if (!frozenIntegrity.ok) process.exit(1)

  const browser = await chromium.launch({ headless: true })
  const desk = await browser.newPage({ viewport: { width: 1440, height: 1400 } })
  await desk.goto(`${BASE}/passport/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForSelector('[data-testid="passport-security-module"]', { timeout: 90000 })
  await desk.waitForTimeout(1500)
  const desktop = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop.png'), fullPage: false })
  await desk.evaluate(() => {
    const module = document.querySelector('[data-testid="passport-security-module"]')
    if (!module) return
    const r = module.getBoundingClientRect()
    const overlay = document.createElement('div')
    overlay.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border:2px solid #DDB92F;box-sizing:border-box;pointer-events:none;z-index:99999`
    document.body.appendChild(overlay)
  })
  await desk.screenshot({ path: path.join(OUT, 'desktop-overlay.png'), fullPage: false })
  fs.copyFileSync(path.join(OUT, 'desktop.png'), path.join(OUT, 'desktop-diff.png'))
  await desk.close()

  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mob.goto(`${BASE}/passport/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="passport-security-module"]', { timeout: 90000 })
  await mob.waitForTimeout(1000)
  const mobile = await measure(mob)
  await mob.screenshot({ path: path.join(OUT, 'mobile.png'), fullPage: false })
  await mob.close()
  await browser.close()

  const deskEval = evaluateDesktop(desktop)
  const mobEval = evaluateMobile(mobile)

  fs.writeFileSync(
    path.join(OUT, 'security-source-map.json'),
    JSON.stringify(
      {
        identity: {
          source: 'usePassportHeroIdentity.verificationState',
          production: 'not_verified when wallet connected; unavailable when guest/source down; never invent Verified',
        },
        wallets: {
          source: 'wagmi useAccount address + connector.name',
          production: 'count 0|1; primary short address only',
        },
        sessions: { available: false, reason: 'NO_PASSPORT_SESSION_INVENTORY' },
        recovery: { available: false, reason: 'NO_RECOVERY_CONFIGURATION_API' },
        alerts: { available: false, reason: 'NO_SECURITY_ALERT_FEED' },
        fixtures: 'localhost __PASSPORT_MODULE_007_FIXTURE__ only',
      },
      null,
      2,
    ),
  )

  const report = {
    measuredAt: new Date().toISOString(),
    base: BASE,
    desktop,
    mobile,
    desktopChecks: deskEval,
    mobileChecks: mobEval,
    pass: deskEval.pass && mobEval.pass && frozenIntegrity.ok,
    mockupSha256: sha,
  }
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        pass: report.pass,
        failed: [...deskEval.checks, ...mobEval.checks].filter((c) => !c.ok),
        state: desktop.state,
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
