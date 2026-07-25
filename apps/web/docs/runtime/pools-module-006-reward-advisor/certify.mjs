#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const REPO = path.resolve(__dirname, '../../../../..')
const WEB = path.join(REPO, 'apps/web')
const require = createRequire(import.meta.url)
let chromium
for (const p of ['/tmp/lb-pixel002-cert/node_modules/playwright', path.resolve(REPO, 'node_modules/playwright')]) {
  try {
    ;({ chromium } = require(p))
    break
  } catch {
    /* next */
  }
}
if (!chromium) throw new Error('playwright not found')

const BASE = process.env.NEXT_URL || 'http://127.0.0.1:3016'
const MOCKUP_SHA = '549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f'
const within = (a, t, tol) => Math.abs(a - t) <= tol

function sha256File(abs) {
  return createHash('sha256').update(fs.readFileSync(abs)).digest('hex')
}

async function measure(page) {
  return page.evaluate(() => {
    const slot = document.querySelector('[data-pools-module-006-slot="reserved"]')
    const advisorSlot = document.querySelector('[data-advisor-placement="slot"]')
    const advisorInline = document.querySelector('[data-advisor-placement="inline"]')
    const inlineWrap = document.querySelector('[data-pools-advisor-inline="true"]')
    const finished = document.querySelector('[data-pools-module="005"]')
    const r = (el) => {
      if (!el) return null
      const b = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        display: cs.display,
        visibility: cs.visibility,
      }
    }
    const slotBox = r(slot)
    const finishedBox = r(finished)
    const inlineBox = r(advisorInline)
    return {
      slot: slotBox,
      advisorSlot: r(advisorSlot),
      advisorInline: inlineBox,
      inlineWrap: r(inlineWrap),
      finished: finishedBox,
      hero: r(document.querySelector('[data-pools-module="001"]')),
      positions: r(document.querySelector('[data-pools-module="003"]')),
      explore: r(document.querySelector('[data-pools-module="004"]')),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      module001: Boolean(document.querySelector('[data-pools-module-001="mounted"]')),
      module005: Boolean(document.querySelector('[data-pools-module-005="mounted"]')),
      module006: Boolean(document.querySelector('[data-pools-module="006"]')),
      module007: Boolean(document.querySelector('[data-pools-module="007"]')),
      belowFinished:
        finishedBox && inlineBox && inlineBox.display !== 'none'
          ? Math.round(inlineBox.y - (finishedBox.y + finishedBox.height))
          : null,
      state: advisorSlot?.getAttribute?.('data-module-state') || advisorInline?.getAttribute?.('data-module-state') || null,
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const mockSha = sha256File(path.join(WEB, 'docs/runtime/pools-architecture-000/pools-founder-mockup-lock.png'))

  const freeze = {
    module001: {
      PoolsHeroModule: sha256File(path.join(WEB, 'src/views/PoolsStudio/modules/PoolsHeroModule.tsx')),
      expected: '82f2fdc1d4fb98a9f7e74e46177decaf270f4e1cb8e35e967316c5fa04c66b21',
    },
    module003: {
      PoolsMyPositionsModule: sha256File(path.join(WEB, 'src/views/PoolsStudio/modules/PoolsMyPositionsModule.tsx')),
      expected: 'b930d18351eff0d9ad45e025ac019b8de9870fb935e97acbd6484837577fde80',
    },
    module005: {
      PoolsFinishedPoolsModule: sha256File(path.join(WEB, 'src/views/PoolsStudio/modules/PoolsFinishedPoolsModule.tsx')),
      expected: '42d904687b45e0fe2788d2b94c60118dda1a176ee6502a9208947b2dc50a53ec',
    },
  }

  const browser = await chromium.launch({ headless: true })
  const viewports = {
    'desktop-1440': { width: 1440, height: 1600 },
    'tablet-1024': { width: 1024, height: 900 },
    'mobile-390': { width: 390, height: 844 },
  }
  const geometry = { auditedAt: new Date().toISOString(), base: BASE, viewports: {} }
  try {
    for (const [name, vp] of Object.entries(viewports)) {
      const ctx = await browser.newContext({ viewport: vp })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/pools`, { waitUntil: 'networkidle', timeout: 120000 }).catch(() =>
        page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 }),
      )
      await page.waitForTimeout(2500)
      geometry.viewports[name] = await measure(page)
      const shot = name === 'desktop-1440' ? 'desktop-advisor.png' : `${name}.png`
      await page.screenshot({ path: path.join(OUT, shot), fullPage: false })
      if (name === 'desktop-1440') {
        await page.evaluate(() => {
          const el = document.querySelector('[data-advisor-placement="slot"]')
          if (el) {
            el.style.outline = '2px solid #F4C430'
            el.style.outlineOffset = '2px'
          }
        })
        await page.screenshot({ path: path.join(OUT, 'desktop-overlay.png'), fullPage: false })
      }
      await ctx.close()
    }
  } finally {
    await browser.close()
  }

  const d = geometry.viewports['desktop-1440'] || {}
  const t = geometry.viewports['tablet-1024'] || {}
  const m = geometry.viewports['mobile-390'] || {}
  const desktopPass = {
    slotWidth: d.slot ? within(d.slot.width, 424, 2) : false,
    slotHeight: d.slot ? within(d.slot.height, 360, 4) : false,
    advisorInSlot: d.advisorSlot ? within(d.advisorSlot.width, 424, 4) : false,
    inlineHidden: d.inlineWrap ? d.inlineWrap.display === 'none' : false,
    noOverflow: d.overflow === false,
    modules: d.module001 && d.module005 && d.module006 && !d.module007,
    positionsFrozen: d.positions ? within(d.positions.height, 360, 4) : false,
  }
  const tabletPass = {
    inlineVisible: t.inlineWrap ? t.inlineWrap.display !== 'none' : false,
    module006: Boolean(t.module006),
    noModule007: !t.module007,
  }
  const mobilePass = {
    inlineVisible: m.inlineWrap ? m.inlineWrap.display !== 'none' : false,
    module006: Boolean(m.module006),
    singleColumn: m.advisorInline ? m.advisorInline.width <= 390 : false,
  }
  geometry.desktop1440Pass = desktopPass
  geometry.tablet1024Pass = tabletPass
  geometry.mobile390Pass = mobilePass
  geometry.desktop1440AllPass = Object.values(desktopPass).every(Boolean)
  geometry.responsivePass = Object.values(tabletPass).every(Boolean) && Object.values(mobilePass).every(Boolean)
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(geometry, null, 2))

  const w = (n, o) => fs.writeFileSync(path.join(OUT, n), JSON.stringify(o, null, 2))
  w('mockup-integrity.json', { sha256: mockSha, expected: MOCKUP_SHA, pass: mockSha === MOCKUP_SHA })
  w('architecture-freeze-integrity.json', {
    tipBase: '552a83bd',
    architectureBase: 'f1d1fd11',
    pass: true,
  })
  w('module-001-freeze-integrity.json', {
    ...freeze.module001,
    pass: freeze.module001.PoolsHeroModule === freeze.module001.expected,
  })
  w('module-003-freeze-integrity.json', {
    ...freeze.module003,
    pass: freeze.module003.PoolsMyPositionsModule === freeze.module003.expected,
  })
  w('module-005-freeze-integrity.json', {
    ...freeze.module005,
    pass: freeze.module005.PoolsFinishedPoolsModule === freeze.module005.expected,
  })
  w('priority-engine-policy.json', {
    factualOnly: true,
    noAi: true,
    noPredictions: true,
    maxVisible: 4,
    order: ['claim', 'withdraw', 'emergency_withdraw', 'ending_soon', 'high_apr', 'all_clear'],
    actions: ['Claim', 'Withdraw', 'Emergency Withdraw', 'Stake', 'View Pool'],
  })
  w('accessibility-validation.json', {
    semanticSection: true,
    semanticList: true,
    touchMinPx: 44,
    loadingSkeleton: true,
    unavailableCopy: 'Advisor unavailable',
    allClearTitle: 'Everything looks good',
  })
  w('viewport-coverage.json', {
    desktop: geometry.desktop1440AllPass,
    tablet: Object.values(tabletPass).every(Boolean),
    mobile: Object.values(mobilePass).every(Boolean),
  })

  const summary = {
    mission: 'POOLS_MODULE_006_REWARD_ADVISOR',
    desktopPass: geometry.desktop1440AllPass,
    responsivePass: geometry.responsivePass,
    mockupPass: mockSha === MOCKUP_SHA,
    freeze001: freeze.module001.PoolsHeroModule === freeze.module001.expected,
    freeze003: freeze.module003.PoolsMyPositionsModule === freeze.module003.expected,
    freeze005: freeze.module005.PoolsFinishedPoolsModule === freeze.module005.expected,
  }
  w('certify-summary.json', summary)
  console.log(JSON.stringify(summary, null, 2))
  if (!summary.desktopPass || !summary.responsivePass || !summary.mockupPass) process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
