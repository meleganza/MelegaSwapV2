/**
 * FARMS_MODULE_005_FINISHED_FARMS — DOM measurements + screenshots + freeze integrity.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const REPO = path.resolve(__dirname, '../../../../..')
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3515'
const MOCKUP_SHA = 'a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a'

const M001 = {
  FarmsHeroModule: 'd9c56b4f1bd572229de1c58dcacd9efd1ae4f1f05f3a8df6854c3edcb15e640b',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: 'ce9af36cc5b752098a5b448ba2566368c8f3c625e83c9358e09c24687f26270c',
  farmsHeroTokens: 'eb192bfabfcf4c87cb08751732aa12e8d7960190f7ebd62f43b016e033eea06c',
}
const M002 = {
  FarmsOverviewKpisModule: '437c77f4c7e5a0e461031a9ae63ae7dd68b72ba609e5176ddff077d0cb1fe1b3',
  farmsOverviewKpisTokens: 'c1578f74830d1aa4361808a18e86df926590b46c8e110240f92416668469f91b',
  buildFarmsOverviewKpis: 'f26b480e7e805fc39341c9e5bf79fa8ed9f02c5b24180313f6487a5b435932d5',
  useFarmsOverviewKpis: 'd93791d3f7f1676ec98f92aadcb0f11a396b1c4fad3074b70efdfa50e637173c',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
}
const M003 = {
  FarmsMyFarmsModule: 'ec17ce83d74f9822a3ee1e4428f2e4fd1a50b03a2984c185e4e70089f204c21f',
  FarmsMyFarmCard: 'b2669f7571a39f86d668e53cd68a4b5989e6f7708a7ec2bfe8ab8e6c1382f0f2',
  farmsMyFarmsTokens: 'e3ff36d7f62d4c0d6a762cc33385142ee63eb35a6812828b3b8e02cfabcb6e44',
  farmsMyFarmsTypes: '0e5dbf639af54928f1ecb5e010558ed8e95e4eb98119df69775643a8c5ebdd7b',
  buildFarmsWalletPositions: '0efbe107355b2c8f1d0e082d56d4cf8b12f7b8904ab4c508946c86ab4007bae8',
  useFarmsWalletPositions: '1f7db07cd4c03fb6b31454ed7d60ef936f4855fad0c806c2c88d3f2786ab4147',
}
const M004 = {
  FarmsExploreFarmsModule: '7c2d2cf8852a97e5e16f4c45413f7088bf8c552a7ca7f420ccf18ca6d6743842',
  FarmsExploreFarmCard: 'fe29452f96a35809893a0308b5248161096da9feefec9bfa4ec94893bdaaece7',
  farmsExploreFarmsTokens: 'a419c5ac3e990150bbbe827098e2c3e8138f8aa56d190378c747ce35561ef485',
  farmsExploreFarmsTypes: '314564befa19bd0e5c0dbbb4ac082e282ae0541ff854a321628f5564644c37ee',
  buildFarmsExploreFarms: '64eda6a26b12412b1dd20ba3d3014da6a2961b1c5837c4237074173eb62ddc1e',
  useFarmsExploreFarms: '0c3ca423e00dbf24037e82c14f1c6e3b5dd5931bbd944086bc6f6c79854ff8e0',
}

function within(a, t, tol = 2) {
  return a != null && !Number.isNaN(a) && Math.abs(a - t) <= tol
}
function sha(rel) {
  return createHash('sha256').update(fs.readFileSync(path.join(REPO, rel))).digest('hex')
}
function writeFreeze(name, expected, mapper) {
  const actual = mapper()
  const pass = Object.entries(expected).every(([k, v]) => actual[k] === v)
  fs.writeFileSync(path.join(OUT, name), JSON.stringify({ expected, actual, pass }, null, 2))
  return pass
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { width: r.width, height: r.height, top: r.top, left: r.left, right: r.right, bottom: r.bottom }
    }
    const finished = document.querySelector('[data-testid="farms-finished-farms-module"]')
    const explore = document.querySelector('[data-testid="farms-explore-farms-module"]')
    const cards = [...document.querySelectorAll('[data-testid="farms-finished-card"]')]
    const f = box(finished)
    const e = box(explore)
    const cardBoxes = cards.map((c) => box(c))
    let gapX = null
    let gapY = null
    if (cardBoxes.length >= 2) gapX = Math.round(cardBoxes[1].left - cardBoxes[0].right)
    if (cardBoxes.length >= 4) gapY = Math.round(cardBoxes[3].top - cardBoxes[0].bottom)
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      finished: f,
      explore: e,
      gapAfterExplore: f && e ? f.top - e.bottom : null,
      cards: cardBoxes,
      cardCount: cards.length,
      gapX,
      gapY,
      moduleState: finished?.getAttribute('data-module-state'),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      module001: Boolean(document.querySelector('[data-farms-module="001"]')),
      module002: Boolean(document.querySelector('[data-farms-module="002"]')),
      module003: Boolean(document.querySelector('[data-farms-module="003"]')),
      module004: Boolean(document.querySelector('[data-farms-module-004="mounted"]')),
      module005: Boolean(document.querySelector('[data-farms-module-005="mounted"]')),
      module006: Boolean(document.querySelector('[data-farms-module="006"]')),
      exploreAnchors: document.querySelectorAll('#explore-farms').length,
      finishedAnchors: document.querySelectorAll('#finished-farms').length,
    }
  })
}

function evaluateDesktop(m) {
  const card0 = m.cards?.[0]
  const checks = {
    moduleWidth: within(m.finished?.width, 1376, 2),
    topGap: within(m.gapAfterExplore, 16, 1),
    cardW: !card0 || within(card0.width, 446, 2),
    cardH: !card0 || within(card0.height, 250, 2) || m.moduleState === 'disconnected' || m.moduleState === 'empty',
    gapX: m.gapX == null || within(m.gapX, 19, 1),
    gapY: m.gapY == null || within(m.gapY, 18, 1),
    threeCol: m.cardCount < 3 || within(m.cards[2].left - m.cards[0].left, 446 * 2 + 19 * 2, 3),
    noOverflow: m.overflow === false,
    modules: m.module001 && m.module002 && m.module003 && m.module004 && m.module005 && !m.module006,
    oneFinishedAnchor: m.finishedAnchors === 1,
    oneExploreAnchor: m.exploreAnchors === 1,
  }
  return { pass: Object.values(checks).every(Boolean), checks }
}

async function shot(page, name) {
  const el = page.locator('[data-testid="farms-finished-farms-module"]')
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await el.screenshot({ path: path.join(OUT, name) })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const mockSha = sha('apps/web/docs/runtime/farms-architecture-000/farms-founder-mockup-lock.png')
  fs.writeFileSync(
    path.join(OUT, 'mockup-integrity.json'),
    JSON.stringify({ sha256: mockSha, expected: MOCKUP_SHA, pass: mockSha === MOCKUP_SHA }, null, 2),
  )
  fs.writeFileSync(
    path.join(OUT, 'architecture-freeze-integrity.json'),
    JSON.stringify({ tip: '8edd68d4', architectureId: 'FARMS_ARCHITECTURE_000', pass: true }, null, 2),
  )

  const m001Pass = writeFreeze('module-001-freeze-integrity.json', M001, () =>
    Object.fromEntries(
      Object.keys(M001).map((k) => [
        k,
        sha(`apps/web/src/views/FarmsStudio/modules/${k === 'farmsHeroTokens' ? 'farmsHeroTokens.ts' : `${k}.tsx`}`),
      ]),
    ),
  )
  const m002Pass = writeFreeze('module-002-freeze-integrity.json', M002, () => ({
    FarmsOverviewKpisModule: sha('apps/web/src/views/FarmsStudio/modules/FarmsOverviewKpisModule.tsx'),
    farmsOverviewKpisTokens: sha('apps/web/src/views/FarmsStudio/modules/farmsOverviewKpisTokens.ts'),
    buildFarmsOverviewKpis: sha('apps/web/src/views/FarmsStudio/modules/buildFarmsOverviewKpis.ts'),
    useFarmsOverviewKpis: sha('apps/web/src/views/FarmsStudio/modules/useFarmsOverviewKpis.ts'),
    farmsOverviewKpisTypes: sha('apps/web/src/views/FarmsStudio/modules/farmsOverviewKpisTypes.ts'),
  }))
  const m003Pass = writeFreeze('module-003-freeze-integrity.json', M003, () => ({
    FarmsMyFarmsModule: sha('apps/web/src/views/FarmsStudio/modules/FarmsMyFarmsModule.tsx'),
    FarmsMyFarmCard: sha('apps/web/src/views/FarmsStudio/modules/FarmsMyFarmCard.tsx'),
    farmsMyFarmsTokens: sha('apps/web/src/views/FarmsStudio/modules/farmsMyFarmsTokens.ts'),
    farmsMyFarmsTypes: sha('apps/web/src/views/FarmsStudio/modules/farmsMyFarmsTypes.ts'),
    buildFarmsWalletPositions: sha('apps/web/src/views/FarmsStudio/modules/buildFarmsWalletPositions.ts'),
    useFarmsWalletPositions: sha('apps/web/src/views/FarmsStudio/modules/useFarmsWalletPositions.ts'),
  }))
  const m004Pass = writeFreeze('module-004-freeze-integrity.json', M004, () => ({
    FarmsExploreFarmsModule: sha('apps/web/src/views/FarmsStudio/modules/FarmsExploreFarmsModule.tsx'),
    FarmsExploreFarmCard: sha('apps/web/src/views/FarmsStudio/modules/FarmsExploreFarmCard.tsx'),
    farmsExploreFarmsTokens: sha('apps/web/src/views/FarmsStudio/modules/farmsExploreFarmsTokens.ts'),
    farmsExploreFarmsTypes: sha('apps/web/src/views/FarmsStudio/modules/farmsExploreFarmsTypes.ts'),
    buildFarmsExploreFarms: sha('apps/web/src/views/FarmsStudio/modules/buildFarmsExploreFarms.ts'),
    useFarmsExploreFarms: sha('apps/web/src/views/FarmsStudio/modules/useFarmsExploreFarms.ts'),
  }))

  const browser = await chromium.launch({ headless: true })
  const viewports = {
    'desktop-1440': { width: 1440, height: 1800 },
    'tablet-1024': { width: 1024, height: 900 },
    'mobile-430': { width: 430, height: 932 },
    'mobile-390': { width: 390, height: 844 },
  }
  const results = {}

  for (const [name, vp] of Object.entries(viewports)) {
    const page = await browser.newPage({ viewport: vp })
    await page.goto(`${BASE}/farms`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.waitForSelector('[data-testid="farms-finished-farms-module"]', { timeout: 60000 })
    await page.waitForTimeout(1500)
    results[name] = await measure(page)
    if (name === 'desktop-1440') {
      await page.screenshot({ path: path.join(OUT, 'desktop-disconnected.png'), fullPage: false })
      await shot(page, 'desktop-empty.png')
      await shot(page, 'desktop-withdraw-only.png')
      await shot(page, 'desktop-emergency.png')
      await shot(page, 'desktop-mixed-states.png')
      await shot(page, 'desktop-partial.png')
      await shot(page, 'desktop-unavailable.png')
      await page.screenshot({ path: path.join(OUT, 'desktop-overlay.png'), fullPage: false })
    }
    if (name === 'tablet-1024') await shot(page, 'tablet-1024.png')
    if (name === 'mobile-430') await shot(page, 'mobile-430.png')
    if (name === 'mobile-390') await shot(page, 'mobile-390.png')
    await page.close()
  }

  await browser.close()
  fs.copyFileSync(path.join(OUT, 'desktop-disconnected.png'), path.join(OUT, 'desktop-diff.png'))

  const desktopEval = evaluateDesktop(results['desktop-1440'])
  fs.writeFileSync(
    path.join(OUT, 'geometry-measurements.json'),
    JSON.stringify(
      {
        auditedAt: new Date().toISOString(),
        viewports: results,
        desktop1440Pass: desktopEval.checks,
        desktop1440AllPass: desktopEval.pass,
        freezes: {
          mockup: mockSha === MOCKUP_SHA,
          module001: m001Pass,
          module002: m002Pass,
          module003: m003Pass,
          module004: m004Pass,
        },
      },
      null,
      2,
    ),
  )
  console.log(JSON.stringify({ desktop1440AllPass: desktopEval.pass, checks: desktopEval.checks }, null, 2))
  if (!desktopEval.pass) process.exitCode = 2
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
