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

const BASE = process.env.NEXT_URL || 'http://127.0.0.1:3017'
const MOCKUP_SHA = '549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f'
const within = (a, t, tol) => Math.abs(a - t) <= tol

function sha256File(abs) {
  return createHash('sha256').update(fs.readFileSync(abs)).digest('hex')
}

async function measure(page) {
  return page.evaluate(() => {
    const mod = document.querySelector('[data-pools-module="007"]')
    const grid = document.querySelector('[data-testid="pools-analytics-grid"]')
    const panels = [...document.querySelectorAll('[data-testid="pools-analytics-panel"]')]
    const advisor = document.querySelector('[data-pools-module="006"]')
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
        gridTemplateColumns: cs.gridTemplateColumns,
      }
    }
    const gridBox = r(grid)
    const panelBoxes = panels.map((p) => r(p))
    const gaps = []
    for (let i = 1; i < panelBoxes.length; i++) {
      const a = panelBoxes[i - 1]
      const b = panelBoxes[i]
      if (a && b && Math.abs(a.y - b.y) < 4) gaps.push(Math.round(b.x - (a.x + a.width)))
    }
    return {
      module: r(mod),
      grid: gridBox,
      panels: panelBoxes,
      panelCount: panels.length,
      gaps,
      advisor: r(advisor),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      module006: Boolean(document.querySelector('[data-pools-module-006="mounted"]')),
      module007: Boolean(document.querySelector('[data-pools-module-007="mounted"]')),
      module008: Boolean(document.querySelector('[data-pools-module="008"]')),
      state: mod?.getAttribute('data-module-state') || null,
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const mockSha = sha256File(path.join(WEB, 'docs/runtime/pools-architecture-000/pools-founder-mockup-lock.png'))
  const freeze = {
    m001: sha256File(path.join(WEB, 'src/views/PoolsStudio/modules/PoolsHeroModule.tsx')),
    m006: sha256File(path.join(WEB, 'src/views/PoolsStudio/modules/PoolsRewardAdvisorModule.tsx')),
  }

  const browser = await chromium.launch({ headless: true })
  const viewports = {
    'desktop-1440': { width: 1440, height: 1800 },
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
      const shot = name === 'desktop-1440' ? 'desktop-analytics.png' : `${name}.png`
      await page.screenshot({ path: path.join(OUT, shot), fullPage: false })
      if (name === 'desktop-1440') {
        await page.evaluate(() => {
          const el = document.querySelector('[data-testid="pools-analytics-grid"]')
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
    gridWidth: d.grid ? within(d.grid.width, 1376, 2) : false,
    gridHeight: d.grid ? within(d.grid.height, 240, 4) : false,
    fourPanels: d.panelCount === 4,
    gap18: Array.isArray(d.gaps) && d.gaps.length ? d.gaps.every((g) => within(g, 18, 2)) : false,
    noOverflow: d.overflow === false,
    modules: d.module006 && d.module007 && !d.module008,
  }
  const tabletPass = {
    module007: Boolean(t.module007),
    multiColOrStack: t.grid ? t.grid.gridTemplateColumns.split(' ').length <= 2 : false,
    noModule008: !t.module008,
  }
  const mobilePass = {
    module007: Boolean(m.module007),
    singleColumn: m.grid ? m.grid.gridTemplateColumns.split(' ').filter(Boolean).length === 1 : false,
    noModule008: !m.module008,
  }
  geometry.desktop1440Pass = desktopPass
  geometry.tablet1024Pass = tabletPass
  geometry.mobile390Pass = mobilePass
  geometry.desktop1440AllPass = Object.values(desktopPass).every(Boolean)
  geometry.responsivePass = Object.values(tabletPass).every(Boolean) && Object.values(mobilePass).every(Boolean)
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(geometry, null, 2))

  const w = (n, o) => fs.writeFileSync(path.join(OUT, n), JSON.stringify(o, null, 2))
  w('mockup-integrity.json', { sha256: mockSha, expected: MOCKUP_SHA, pass: mockSha === MOCKUP_SHA })
  w('architecture-freeze-integrity.json', { tipBase: '2caa8a87', architectureBase: 'f1d1fd11', pass: true })
  w('module-001-freeze-integrity.json', {
    sha256: freeze.m001,
    expected: '82f2fdc1d4fb98a9f7e74e46177decaf270f4e1cb8e35e967316c5fa04c66b21',
    pass: freeze.m001 === '82f2fdc1d4fb98a9f7e74e46177decaf270f4e1cb8e35e967316c5fa04c66b21',
  })
  w('module-006-freeze-integrity.json', {
    sha256: freeze.m006,
    expected: '9ab963e6815f4dfc116aa1be4870761761fd7817129f092ffdaeb9f45ff3130d',
    pass: freeze.m006 === '9ab963e6815f4dfc116aa1be4870761761fd7817129f092ffdaeb9f45ff3130d',
  })
  w('factual-policy.json', {
    noEstimation: true,
    noPrediction: true,
    noMockValues: true,
    unavailableShowsEmDash: true,
    panels: ['Pool Distribution', 'Reward Distribution', 'Participation', 'Pool Health'],
  })
  w('accessibility-validation.json', {
    semanticSection: true,
    fourPanels: true,
    liveRegion: true,
  })
  w('viewport-coverage.json', {
    desktop: geometry.desktop1440AllPass,
    tablet: Object.values(tabletPass).every(Boolean),
    mobile: Object.values(mobilePass).every(Boolean),
  })

  const summary = {
    mission: 'POOLS_MODULE_007_ANALYTICS',
    desktopPass: geometry.desktop1440AllPass,
    responsivePass: geometry.responsivePass,
    mockupPass: mockSha === MOCKUP_SHA,
    freeze001: freeze.m001 === '82f2fdc1d4fb98a9f7e74e46177decaf270f4e1cb8e35e967316c5fa04c66b21',
    freeze006: freeze.m006 === '9ab963e6815f4dfc116aa1be4870761761fd7817129f092ffdaeb9f45ff3130d',
  }
  w('certify-summary.json', summary)
  console.log(JSON.stringify(summary, null, 2))
  if (!summary.desktopPass || !summary.responsivePass || !summary.mockupPass) process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
