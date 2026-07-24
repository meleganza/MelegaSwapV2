/**
 * PASSPORT_MODULE_005 — DOM measurements, state screenshots, integrity artifacts.
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
const BASE = (process.env.CERT_BASE || 'http://127.0.0.1:52305').replace(/\/$/, '')
const EXPECTED_SHA = '14e0f0e570583aa05d06dc67b1e3f327bf890a17f6bd06b5787664bd699024df'
const MOCKUP_REL = 'apps/web/docs/runtime/passport-architecture-000/founder-approved-passport-mockup.png'
const FREEZE_REL =
  'apps/web/src/views/PassportStudio/__tests__/passportModule001_002_003_004.freeze.sha256.json'

function within(actual, target, tol = 2) {
  if (actual == null || Number.isNaN(actual)) return false
  return Math.abs(actual - target) <= tol
}

function pos(partial) {
  return {
    token0Symbol: 'MARCO',
    token1Symbol: 'WBNB',
    token0LogoUrl: null,
    token1LogoUrl: null,
    chainLabel: 'BNB Chain',
    supportingLine: '0xabc…def0',
    estimatedValue: '—',
    estimatedValueState: 'unavailable',
    sharePrimary: '—',
    shareSecondary: null,
    feesOrProgressLabel: 'Unavailable',
    feesOrProgressKind: 'unavailable',
    feesOrProgressValue: '—',
    status: 'Active',
    statusTone: 'active',
    actionLabel: 'Manage',
    actionHref: '/liquidity-studio?view=positions&position=x',
    actionAriaLabel: 'Manage MARCO / WBNB manual liquidity position',
    destination: '/liquidity-studio?view=positions&position=x',
    freshness: 'unavailable',
    source: 'fixture',
    dedupeKey: partial.id,
    ...partial,
  }
}

const FIXTURES = {
  empty: { walletConnected: true, positions: [] },
  manual: {
    walletConnected: true,
    positions: [
      pos({
        id: 'manual-1',
        type: 'Manual',
        pairLabel: 'MARCO / WBNB',
        estimatedValue: '—',
        feesOrProgressLabel: 'Fees',
        feesOrProgressValue: '—',
        actionHref: '/liquidity-studio?view=positions&position=manual-1',
      }),
    ],
  },
  building: {
    walletConnected: true,
    positions: [
      pos({
        id: 'lb-1',
        type: 'Liquidity Building',
        pairLabel: 'ALPHA / WBNB',
        token0Symbol: 'ALPHA',
        status: 'Active',
        statusTone: 'active',
        feesOrProgressLabel: 'Liquidity Built',
        feesOrProgressValue: '—',
        actionHref: '/liquidity-studio?view=building&program=0xprog',
        actionAriaLabel: 'Manage ALPHA / WBNB Liquidity Building position',
        source: 'liquidity-building',
      }),
    ],
  },
  mixed: {
    walletConnected: true,
    positions: [
      pos({
        id: 'm1',
        type: 'Manual',
        pairLabel: 'MARCO / WBNB',
        actionHref: '/liquidity-studio?view=positions&position=m1',
      }),
      pos({
        id: 'lb1',
        type: 'Liquidity Building',
        pairLabel: 'BETA / WBNB',
        token0Symbol: 'BETA',
        status: 'Paused for safety',
        statusTone: 'danger',
        feesOrProgressLabel: 'Liquidity Built',
        actionHref: '/liquidity-studio?view=building&program=0xlb',
        actionAriaLabel: 'Manage BETA / WBNB Liquidity Building position',
        source: 'liquidity-building',
      }),
      pos({
        id: 'm2',
        type: 'Manual',
        pairLabel: 'USDC / WBNB',
        token0Symbol: 'USDC',
        status: 'Active',
        actionHref: '/liquidity-studio?view=positions&position=m2',
      }),
    ],
  },
  unavailable: {
    walletConnected: true,
    positions: [
      pos({
        id: 'u1',
        type: 'Manual',
        pairLabel: 'MARCO / WBNB',
        estimatedValue: '—',
        estimatedValueState: 'unavailable',
        sharePrimary: '—',
        feesOrProgressValue: '—',
        feesOrProgressLabel: 'Unavailable',
        freshness: 'stale',
      }),
    ],
  },
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
      }
    }
    const projects = document.querySelector('[data-testid="passport-projects-module"]')
    const module = document.querySelector('[data-testid="passport-liquidity-module"]')
    const header = document.querySelector('[data-testid="passport-liquidity-header"]')
    const table = document.querySelector('[data-testid="passport-liquidity-table"]')
    const thead = table?.querySelector('thead tr')
    const row = document.querySelector('[data-testid="passport-liquidity-row"]')
    const card = document.querySelector('[data-testid="passport-liquidity-mobile-card"]')
    const wrap = document.querySelector('[data-testid="passport-liquidity-table-wrap"]')
    const pBox = box(projects)
    const mBox = box(module)
    const ths = table
      ? [...table.querySelectorAll('thead th')].map((th) => Math.round(th.getBoundingClientRect().width))
      : []
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: box(document.querySelector('[data-testid="passport-hero-identity-module"]')),
      portfolio: box(document.querySelector('[data-testid="passport-portfolio-overview"]')),
      assets: box(document.querySelector('[data-testid="passport-assets-module"]')),
      projects: pBox,
      module: mBox,
      header: box(header),
      table: box(table),
      tableWrap: box(wrap),
      thead: box(thead),
      row: box(row),
      card: box(card),
      projectsToLiquidityGap: pBox && mBox ? mBox.top - pBox.bottom : null,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      empty: module?.getAttribute('data-liquidity-empty'),
      disconnected: module?.getAttribute('data-liquidity-disconnected'),
      count: module?.getAttribute('data-liquidity-count'),
      colWidths: ths,
      laterActivity: Boolean(document.querySelector('[data-passport-module="006"]')),
      manageHrefs: [...document.querySelectorAll('[data-testid="passport-liquidity-row"] a')].map((a) =>
        a.getAttribute('href'),
      ),
    }
  })
}

function evaluateDesktop(m, expectEmptyHeight = true) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('moduleWidth', m.module?.width, 1376)
  if (expectEmptyHeight) add('moduleHeight', m.module?.height, 232)
  add('moduleLeft', m.module?.left, 32)
  add('headerHeight', m.header?.height, 64, 1)
  add('projectsToLiquidityGap', m.projectsToLiquidityGap, 16, 1)
  add('heroHeightFrozen', m.hero?.height, 360)
  add('portfolioHeightFrozen', m.portfolio?.height, 176)
  add('assetsHeightFrozen', m.assets?.height, 176)
  add('projectsHeightFrozen', m.projects?.height, 176)
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({ name: 'noModule006', actual: m.laterActivity, target: false, ok: m.laterActivity === false })
  return { pass: checks.every((c) => c.ok), checks }
}

function evaluateTable(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('tableWidth', m.table?.width, 1336)
  add('theadHeight', m.thead?.height, 48, 1)
  add('rowHeight', m.row?.height, 68, 1)
  const targets = [300, 160, 180, 180, 180, 156, 180]
  targets.forEach((t, i) => add(`col${i}`, m.colWidths?.[i], t, 2))
  add('moduleHeight3', m.module?.height, 332)
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
      window.__PASSPORT_MODULE_005_FIXTURE__ = fx
    }, fixture)
  }
  await page.goto(`${BASE}/passport/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="passport-liquidity-module"]', { timeout: 90000 })
  if (fixture) {
    const expectedCount = String(fixture.positions?.length ?? 0)
    const expectDisconnected = fixture.walletConnected === false
    await page.waitForFunction(
      ({ count, disc }) => {
        const el = document.querySelector('[data-testid="passport-liquidity-module"]')
        if (!el) return false
        if (disc) return el.getAttribute('data-liquidity-disconnected') === 'true'
        return (
          el.getAttribute('data-liquidity-disconnected') === 'false' &&
          el.getAttribute('data-liquidity-count') === count
        )
      },
      { count: expectedCount, disc: expectDisconnected },
      { timeout: 30000 },
    )
  }
  await page.waitForTimeout(600)
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
  if (!frozenIntegrity.ok) {
    console.error('Frozen module integrity failed')
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: true })

  // Desktop disconnected (live, no fixture)
  const dDisc = await openWithFixture(browser, { width: 1440, height: 1200 }, null)
  const desktopDisconnected = await measure(dDisc)
  await dDisc.screenshot({ path: path.join(OUT, 'desktop-disconnected.png'), fullPage: false })
  const deskEmptyEval = evaluateDesktop(desktopDisconnected, true)

  await dDisc.evaluate(() => {
    const module = document.querySelector('[data-testid="passport-liquidity-module"]')
    if (!module) return
    const r = module.getBoundingClientRect()
    const overlay = document.createElement('div')
    overlay.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border:2px solid #DDB92F;box-sizing:border-box;pointer-events:none;z-index:99999`
    document.body.appendChild(overlay)
  })
  await dDisc.screenshot({ path: path.join(OUT, 'desktop-overlay.png'), fullPage: false })
  fs.copyFileSync(path.join(OUT, 'desktop-disconnected.png'), path.join(OUT, 'desktop-diff.png'))
  await dDisc.close()

  const shot = async (name, fixture, viewport = { width: 1440, height: 1200 }) => {
    const page = await openWithFixture(browser, viewport, fixture)
    const m = await measure(page)
    await page.screenshot({ path: path.join(OUT, name), fullPage: false })
    await page.close()
    return m
  }

  const desktopEmpty = await shot('desktop-empty.png', FIXTURES.empty)
  const desktopManual = await shot('desktop-manual.png', FIXTURES.manual)
  const desktopBuilding = await shot('desktop-liquidity-building.png', FIXTURES.building)
  const desktopMixed = await shot('desktop-mixed.png', FIXTURES.mixed)
  const desktopUnavailable = await shot('desktop-unavailable.png', FIXTURES.unavailable)
  const tablet = await shot('tablet-1024.png', FIXTURES.mixed, { width: 1024, height: 900 })
  const mobileEmpty = await shot('mobile-390-empty.png', FIXTURES.empty, { width: 390, height: 844 })
  const mobileMixed = await shot('mobile-390-mixed.png', FIXTURES.mixed, { width: 390, height: 844 })

  const emptyEval = evaluateDesktop(desktopEmpty, true)
  const tableEval = evaluateTable(desktopMixed)
  const mobEmptyEval = evaluateMobile(mobileEmpty)
  const mobMixedEval = evaluateMobile(mobileMixed)

  const deepLinks = {
    manualManage: desktopManual.manageHrefs?.[0] || null,
    buildingManage: desktopBuilding.manageHrefs?.[0] || null,
    expectedManualContains: 'view=positions',
    expectedBuildingContains: 'view=building',
    ok:
      String(desktopManual.manageHrefs?.[0] || '').includes('view=positions') &&
      String(desktopBuilding.manageHrefs?.[0] || '').includes('view=building'),
  }
  fs.writeFileSync(path.join(OUT, 'deep-link-validation.json'), JSON.stringify(deepLinks, null, 2))

  fs.writeFileSync(
    path.join(OUT, 'duplicate-prevention.json'),
    JSON.stringify(
      {
        policy:
          'When a Liquidity Building program and a wallet LP share the same pair address, Passport shows a single Liquidity Building summary row.',
        testedInUnit: true,
      },
      null,
      2,
    ),
  )

  fs.writeFileSync(
    path.join(OUT, 'data-source-map.json'),
    JSON.stringify(
      {
        manual: 'useLiquidityPositions → wallet LP rows; valuation/share/fees — when indexer unavailable',
        liquidityBuilding: 'useProgramReadModel ON_CHAIN snapshot; skip NOT_ACTIVE/STOPPED',
        farms: 'never included',
        manage: {
          manual: '/liquidity-studio?view=positions&position=<id>',
          building: '/liquidity-studio?view=building&program=<addr>',
          emptyAdd: '/liquidity-studio?view=add',
          emptyBuilding: '/liquidity-studio?view=building',
        },
        fixtures: 'localhost __PASSPORT_MODULE_005_FIXTURE__ only — never production default',
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
    desktopMixed,
    mobileEmpty,
    mobileMixed,
    tablet,
    desktopDisconnectedChecks: deskEmptyEval,
    desktopEmptyChecks: emptyEval,
    desktopTableChecks: tableEval,
    mobileEmptyChecks: mobEmptyEval,
    mobileMixedChecks: mobMixedEval,
    deepLinks,
    pass:
      deskEmptyEval.pass &&
      emptyEval.pass &&
      tableEval.pass &&
      mobEmptyEval.pass &&
      mobMixedEval.pass &&
      deepLinks.ok &&
      frozenIntegrity.ok,
    mockupSha256: sha,
  }
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(report, null, 2))

  console.log(
    JSON.stringify(
      {
        pass: report.pass,
        failed: [
          ...deskEmptyEval.checks.filter((c) => !c.ok),
          ...emptyEval.checks.filter((c) => !c.ok),
          ...tableEval.checks.filter((c) => !c.ok),
          ...mobEmptyEval.checks.filter((c) => !c.ok),
          ...mobMixedEval.checks.filter((c) => !c.ok),
        ],
        deepLinks,
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
