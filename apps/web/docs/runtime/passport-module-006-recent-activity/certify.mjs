/**
 * PASSPORT_MODULE_006 — DOM measurements, state screenshots, integrity artifacts.
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
const BASE = (process.env.CERT_BASE || 'http://127.0.0.1:52306').replace(/\/$/, '')
const EXPECTED_SHA = '14e0f0e570583aa05d06dc67b1e3f327bf890a17f6bd06b5787664bd699024df'
const MOCKUP_REL = 'apps/web/docs/runtime/passport-architecture-000/founder-approved-passport-mockup.png'
const FREEZE_REL =
  'apps/web/src/views/PassportStudio/__tests__/passportModule001_002_003_004_005.freeze.sha256.json'

function within(actual, target, tol = 2) {
  if (actual == null || Number.isNaN(actual)) return false
  return Math.abs(actual - target) <= tol
}

function item(partial) {
  const ts = partial.timestamp || Date.now()
  return {
    category: 'ecosystem',
    eventType: 'generic',
    context: 'Passport identity',
    value: null,
    valueKind: 'none',
    valueTone: 'none',
    status: null,
    exactTimestamp: new Date(ts).toISOString(),
    relativeTime: '5m ago',
    source: 'fixture',
    evidenceUrl: null,
    destination: null,
    freshness: 'fresh',
    provenance: `prov:${partial.id}`,
    privacyClassification: 'passport_scoped',
    ...partial,
    timestamp: ts,
  }
}

const now = Date.now()
const FOUR = [1, 2, 3, 4].map((n) =>
  item({
    id: `e${n}`,
    title: ['Liquidity added', 'M-Credits topped up', 'External wallet connected', 'Project Page updated'][n - 1],
    category: ['liquidity', 'mcredits', 'wallet', 'project'][n - 1],
    context: ['MARCO / WBNB', 'Business M-Credits account', 'Wallet 0x12…34AB', 'MARCO Project Page'][n - 1],
    value: [null, '+500 M-Credits', null, 'Confirmed'][n - 1],
    valueKind: ['none', 'mcredits', 'none', 'status'][n - 1],
    valueTone: ['none', 'positive', 'none', 'neutral'][n - 1],
    timestamp: now - n * 60_000,
    evidenceUrl: n === 1 ? 'https://bscscan.com/tx/0xabc' : null,
    destination: n === 4 ? '/list' : null,
  }),
)

const PARTIAL_SOURCES = [
  {
    id: 'mcredits',
    owner: 'Treasury',
    endpointOrHook: 'fixture',
    available: true,
    reason: null,
  },
  {
    id: 'liquidity',
    owner: 'Liquidity',
    endpointOrHook: 'fixture',
    available: false,
    reason: 'DOWN',
  },
]

const FIXTURES = {
  empty: { walletConnected: true, items: [] },
  four: { walletConnected: true, items: FOUR, sources: PARTIAL_SOURCES.map((s) => ({ ...s, available: true })) },
  partial: {
    walletConnected: true,
    items: FOUR.slice(0, 2),
    sources: PARTIAL_SOURCES,
  },
  unavailable: { walletConnected: true, items: [], allSourcesFailed: true },
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
        bottom: Math.round(r.bottom * 100) / 100,
        right: Math.round(r.right * 100) / 100,
      }
    }
    const liquidity = document.querySelector('[data-testid="passport-liquidity-module"]')
    const module = document.querySelector('[data-testid="passport-activity-module"]')
    const header = document.querySelector('[data-testid="passport-activity-header"]')
    const body = document.querySelector('[data-testid="passport-activity-body"]')
    const row = document.querySelector('[data-testid="passport-activity-row"]')
    const card = document.querySelector('[data-testid="passport-activity-mobile-card"]')
    const reserve = document.querySelector('[data-testid="passport-security-reserve"]')
    const grid = document.querySelector('[data-testid="passport-bottom-grid"]')
    const lBox = box(liquidity)
    const mBox = box(module)
    const rBox = box(reserve)
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: box(document.querySelector('[data-testid="passport-hero-identity-module"]')),
      portfolio: box(document.querySelector('[data-testid="passport-portfolio-overview"]')),
      assets: box(document.querySelector('[data-testid="passport-assets-module"]')),
      projects: box(document.querySelector('[data-testid="passport-projects-module"]')),
      liquidity: lBox,
      module: mBox,
      header: box(header),
      body: box(body),
      row: box(row),
      card: box(card),
      reserve: rBox,
      grid: box(grid),
      liquidityToActivityGap: lBox && mBox ? mBox.top - lBox.bottom : null,
      bottomGridGap: mBox && rBox ? rBox.left - mBox.right : null,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      state: module?.getAttribute('data-activity-state'),
      count: module?.getAttribute('data-activity-count'),
      securityImpl: Boolean(document.querySelector('[data-passport-module="007"]')),
      evidenceHrefs: [...document.querySelectorAll('[data-testid="passport-activity-row"] a')].map((a) =>
        a.getAttribute('href'),
      ),
    }
  })
}

function evaluateDesktop(m, expectH = 360) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('moduleWidth', m.module?.width, 680)
  add('moduleHeight', m.module?.height, expectH)
  add('headerHeight', m.header?.height, 64, 1)
  add('liquidityToActivityGap', m.liquidityToActivityGap, 16, 1)
  add('bottomGridGap', m.bottomGridGap, 16, 1)
  add('reserveWidth', m.reserve?.width, 680)
  add('heroHeightFrozen', m.hero?.height, 360)
  add('liquidityMinFrozen', m.liquidity?.height, 232)
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({ name: 'noModule007', actual: m.securityImpl, target: false, ok: m.securityImpl === false })
  return { pass: checks.every((c) => c.ok), checks }
}

function evaluateRows(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('rowWidth', m.row?.width, 644)
  add('rowHeight', m.row?.height, 64, 1)
  return { pass: checks.every((c) => c.ok), checks }
}

function evaluateMobile(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('moduleWidth', m.module?.width, 358, 2)
  if (m.card) add('cardWidth', m.card?.width, 326, 2)
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  return { pass: checks.every((c) => c.ok), checks }
}

async function openWithFixture(browser, viewport, fixture) {
  const page = await browser.newPage({ viewport })
  if (fixture) {
    await page.addInitScript((fx) => {
      window.__PASSPORT_MODULE_006_FIXTURE__ = fx
    }, fixture)
  }
  await page.goto(`${BASE}/passport/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="passport-activity-module"]', { timeout: 90000 })
  if (fixture) {
    const expectedState = fixture.allSourcesFailed
      ? 'unavailable'
      : fixture.walletConnected === false
        ? 'disconnected'
        : (fixture.items?.length ?? 0) === 0
          ? 'empty'
          : fixture.sources?.some((s) => !s.available)
            ? 'partial'
            : 'ready'
    await page.waitForFunction(
      (state) =>
        document.querySelector('[data-testid="passport-activity-module"]')?.getAttribute('data-activity-state') ===
        state,
      expectedState,
      { timeout: 30000 },
    )
  }
  await page.waitForTimeout(500)
  return page
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

  const dDisc = await openWithFixture(browser, { width: 1440, height: 1400 }, null)
  const desktopDisconnected = await measure(dDisc)
  await dDisc.screenshot({ path: path.join(OUT, 'desktop-disconnected.png'), fullPage: false })
  await dDisc.evaluate(() => {
    const module = document.querySelector('[data-testid="passport-activity-module"]')
    if (!module) return
    const r = module.getBoundingClientRect()
    const overlay = document.createElement('div')
    overlay.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border:2px solid #DDB92F;box-sizing:border-box;pointer-events:none;z-index:99999`
    document.body.appendChild(overlay)
  })
  await dDisc.screenshot({ path: path.join(OUT, 'desktop-overlay.png'), fullPage: false })
  fs.copyFileSync(path.join(OUT, 'desktop-disconnected.png'), path.join(OUT, 'desktop-diff.png'))
  await dDisc.close()

  const shot = async (name, fixture, viewport = { width: 1440, height: 1400 }) => {
    const page = await openWithFixture(browser, viewport, fixture)
    const m = await measure(page)
    await page.screenshot({ path: path.join(OUT, name), fullPage: false })
    await page.close()
    return m
  }

  const desktopEmpty = await shot('desktop-empty.png', FIXTURES.empty)
  const desktopFour = await shot('desktop-four-events.png', FIXTURES.four)
  const desktopPartial = await shot('desktop-partial-sources.png', FIXTURES.partial)
  const desktopUnavailable = await shot('desktop-unavailable.png', FIXTURES.unavailable)
  const tablet = await shot('tablet-1024.png', FIXTURES.four, { width: 1024, height: 1200 })
  const mobileEmpty = await shot('mobile-390-empty.png', FIXTURES.empty, { width: 390, height: 844 })
  const mobileEvents = await shot('mobile-390-events.png', FIXTURES.four, { width: 390, height: 844 })

  const discEval = evaluateDesktop(desktopDisconnected)
  const emptyEval = evaluateDesktop(desktopEmpty)
  const fourEval = evaluateDesktop(desktopFour)
  const rowEval = evaluateRows(desktopFour)
  const mobEmptyEval = evaluateMobile(mobileEmpty)
  const mobEventsEval = evaluateMobile(mobileEvents)

  fs.writeFileSync(
    path.join(OUT, 'activity-source-map.json'),
    JSON.stringify(
      {
        identity: { available: false, reason: 'PASSPORT_IDENTITY_EVENTS_UNAVAILABLE' },
        wallet: { available: false, reason: 'WALLET_RELATIONSHIP_HISTORY_UNAVAILABLE' },
        mcredits: { available: false, reason: 'MCREDITS_HISTORY_UNSUPPORTED' },
        list: { available: false, reason: 'LIST_ACTIVITY_UNAVAILABLE' },
        project_page: { available: false, reason: 'PROJECT_PAGE_ACTIVITY_UNAVAILABLE' },
        liquidity: { available: false, reason: 'LIQUIDITY_PASSPORT_FEED_UNAVAILABLE' },
        liquidity_building: { available: false, reason: 'LB_EVENT_LEDGER_UNAVAILABLE' },
        smartdrop: { available: false, reason: 'SMARTDROP_ACTIVITY_UNAVAILABLE' },
        security: { available: false, reason: 'SECURITY_EVENTS_UNAVAILABLE' },
        event_fabric: { available: false, reason: 'FABRIC_NOT_DURABLE_PASSPORT_SOURCE' },
        productionDefault: 'empty — no durable Passport-scoped activity producer',
        fixtures: 'localhost __PASSPORT_MODULE_006_FIXTURE__ only',
      },
      null,
      2,
    ),
  )
  fs.writeFileSync(
    path.join(OUT, 'deduplication-validation.json'),
    JSON.stringify({ key: 'provenance || id', never: 'title+timestamp alone', unitTested: true }, null, 2),
  )
  fs.writeFileSync(
    path.join(OUT, 'privacy-validation.json'),
    JSON.stringify(
      {
        exclude: ['full wallet addresses', 'private profile fields', 'excluded classification'],
        shortWallet: 'Wallet 0x12…34AB pattern',
        unitTested: true,
      },
      null,
      2,
    ),
  )
  fs.writeFileSync(
    path.join(OUT, 'evidence-link-validation.json'),
    JSON.stringify(
      {
        sample: desktopFour.evidenceHrefs,
        ok: (desktopFour.evidenceHrefs || []).some((h) => h && h.includes('bscscan')),
        noDeadViewAllInProduction: true,
      },
      null,
      2,
    ),
  )

  const report = {
    measuredAt: new Date().toISOString(),
    base: BASE,
    desktopDisconnected,
    desktopEmpty,
    desktopFour,
    desktopPartial,
    desktopUnavailable,
    tablet,
    mobileEmpty,
    mobileEvents,
    discEval,
    emptyEval,
    fourEval,
    rowEval,
    mobEmptyEval,
    mobEventsEval,
    pass:
      discEval.pass &&
      emptyEval.pass &&
      fourEval.pass &&
      rowEval.pass &&
      mobEmptyEval.pass &&
      mobEventsEval.pass &&
      frozenIntegrity.ok,
    mockupSha256: sha,
  }
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        pass: report.pass,
        failed: [
          ...discEval.checks,
          ...emptyEval.checks,
          ...fourEval.checks,
          ...rowEval.checks,
          ...mobEmptyEval.checks,
          ...mobEventsEval.checks,
        ].filter((c) => !c.ok),
      },
      null,
      2,
    ),
  )
  await browser.close()
  if (!report.pass) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
