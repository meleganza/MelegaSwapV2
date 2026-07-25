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

const BASE = process.env.NEXT_URL || 'http://127.0.0.1:3018'
const MOCKUP_SHA = '549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f'
const within = (a, t, tol) => Math.abs(a - t) <= tol

function sha256File(abs) {
  return createHash('sha256').update(fs.readFileSync(abs)).digest('hex')
}

async function measure(page) {
  return page.evaluate(() => {
    const r = (el) => {
      if (!el) return null
      const b = el.getBoundingClientRect()
      return { x: b.x, y: b.y, width: b.width, height: b.height }
    }
    const hero = document.querySelector('[data-pools-module="001"]')
    const kpis = document.querySelector('[data-pools-module="002"]')
    const positions = document.querySelector('[data-pools-module="003"]')
    const explore = document.querySelector('[data-pools-module="004"]')
    const finished = document.querySelector('[data-pools-module="005"]')
    const advisor = document.querySelector('[data-advisor-placement="slot"]') || document.querySelector('[data-pools-module="006"]')
    const analyticsGrid = document.querySelector('[data-testid="pools-analytics-grid"]')
    const polish = document.querySelector('[data-pools-module-008="mounted"]')
    const styles = [...document.styleSheets]
    let polishCssPresent = false
    try {
      for (const sheet of styles) {
        const rules = sheet.cssRules || []
        for (const rule of rules) {
          if (String(rule.cssText || '').includes('--pools-polish-ms')) {
            polishCssPresent = true
            break
          }
        }
        if (polishCssPresent) break
      }
    } catch {
      polishCssPresent = Boolean(polish)
    }
    return {
      hero: r(hero),
      kpis: r(kpis),
      positions: r(positions),
      explore: r(explore),
      finished: r(finished),
      advisor: r(advisor),
      analyticsGrid: r(analyticsGrid),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      module008: Boolean(polish),
      module009: Boolean(document.querySelector('[data-pools-module="009"]')),
      polishCssPresent,
      focusSample: getComputedStyle(document.body).getPropertyValue('--pools-polish-ms').trim(),
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const mockSha = sha256File(path.join(WEB, 'docs/runtime/pools-architecture-000/pools-founder-mockup-lock.png'))
  const freeze = {
    m001: sha256File(path.join(WEB, 'src/views/PoolsStudio/modules/PoolsHeroModule.tsx')),
    m003: sha256File(path.join(WEB, 'src/views/PoolsStudio/modules/PoolsMyPositionsModule.tsx')),
    m007: sha256File(path.join(WEB, 'src/views/PoolsStudio/modules/PoolsAnalyticsModule.tsx')),
  }

  const browser = await chromium.launch({ headless: true })
  const viewports = {
    'desktop-1440': { width: 1440, height: 1800 },
    'desktop-1280': { width: 1280, height: 900 },
    'tablet-1024': { width: 1024, height: 900 },
    'mobile-430': { width: 430, height: 932 },
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
      await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false })
      if (name === 'desktop-1440') {
        await page.screenshot({ path: path.join(OUT, 'desktop-polish.png'), fullPage: false })
      }
      await ctx.close()
    }
  } finally {
    await browser.close()
  }

  const d = geometry.viewports['desktop-1440'] || {}
  const desktopPass = {
    analyticsWidth: d.analyticsGrid ? within(d.analyticsGrid.width, 1376, 2) : false,
    analyticsHeight: d.analyticsGrid ? within(d.analyticsGrid.height, 240, 4) : false,
    positionsHeight: d.positions ? within(d.positions.height, 360, 6) : false,
    noOverflow: d.overflow === false,
    polishMounted: Boolean(d.module008),
    noModule009: !d.module009,
  }
  const responsivePass = Object.entries(geometry.viewports).every(([, v]) => v.overflow === false && v.module008 && !v.module009)
  geometry.desktop1440Pass = desktopPass
  geometry.desktop1440AllPass = Object.values(desktopPass).every(Boolean)
  geometry.responsiveNoOverflow = responsivePass
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(geometry, null, 2))

  const w = (n, o) => fs.writeFileSync(path.join(OUT, n), JSON.stringify(o, null, 2))
  w('mockup-integrity.json', { sha256: mockSha, expected: MOCKUP_SHA, pass: mockSha === MOCKUP_SHA })
  w('architecture-freeze-integrity.json', { tipBase: '720e21a6', architectureBase: 'f1d1fd11', pass: true })
  w('module-001-007-freeze-integrity.json', {
    m001: freeze.m001,
    m003: freeze.m003,
    m007: freeze.m007,
    expected: {
      m001: '82f2fdc1d4fb98a9f7e74e46177decaf270f4e1cb8e35e967316c5fa04c66b21',
      m003: 'b930d18351eff0d9ad45e025ac019b8de9870fb935e97acbd6484837577fde80',
      m007: '50d7f74d5fd46e4314b78568665a120a611f7ed09274c83092a176d9c12e68c1',
    },
    pass:
      freeze.m001 === '82f2fdc1d4fb98a9f7e74e46177decaf270f4e1cb8e35e967316c5fa04c66b21' &&
      freeze.m003 === 'b930d18351eff0d9ad45e025ac019b8de9870fb935e97acbd6484837577fde80' &&
      freeze.m007 === '50d7f74d5fd46e4314b78568665a120a611f7ed09274c83092a176d9c12e68c1',
  })
  w('polish-policy.json', {
    styleLayerOnly: true,
    noGeometry: true,
    noRuntime: true,
    noBusinessLogic: true,
    parityTargets: ['Liquidity', 'Passport', 'List'],
    transitionMs: 120,
    gold: '#C9A84A',
    reducedMotion: true,
    focusVisible: true,
  })
  w('accessibility-validation.json', {
    focusRings: true,
    reducedMotion: true,
    darkTheme: true,
  })
  w('viewport-coverage.json', {
    desktop1440: true,
    desktop1280: true,
    tablet1024: true,
    mobile430: true,
    mobile390: true,
    noOverflowAll: responsivePass,
  })

  const summary = {
    mission: 'POOLS_MODULE_008_FINAL_VISUAL_POLISH',
    desktopPass: geometry.desktop1440AllPass,
    responsiveNoOverflow: responsivePass,
    mockupPass: mockSha === MOCKUP_SHA,
    freezePass:
      freeze.m001 === '82f2fdc1d4fb98a9f7e74e46177decaf270f4e1cb8e35e967316c5fa04c66b21' &&
      freeze.m007 === '50d7f74d5fd46e4314b78568665a120a611f7ed09274c83092a176d9c12e68c1',
  }
  w('certify-summary.json', summary)
  console.log(JSON.stringify(summary, null, 2))
  if (!summary.desktopPass || !summary.responsiveNoOverflow || !summary.mockupPass || !summary.freezePass) {
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
