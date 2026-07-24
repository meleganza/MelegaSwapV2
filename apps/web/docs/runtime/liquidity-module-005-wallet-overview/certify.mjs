import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const OUT = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3505'

function within(a, t, tol = 2) {
  return a != null && Math.abs(a - t) <= tol
}

async function measure(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s)
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        w: Math.round(r.width * 100) / 100,
        h: Math.round(r.height * 100) / 100,
        padT: parseFloat(cs.paddingTop) || 0,
        padX: (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0),
      }
    }
    const module = q('[data-testid="liq-one-overview"]')
    const grid = q('[data-testid="liq-overview-grid"]')
    const cols = {
      A: q('[data-testid="liq-overview-col-value"]'),
      B: q('[data-testid="liq-overview-col-holdings"]'),
      C: q('[data-testid="liq-overview-col-positions"]'),
      D: q('[data-testid="liq-overview-col-networks"]'),
      E: q('[data-testid="liq-overview-col-fees"]'),
    }
    let gaps = null
    if (cols.A && cols.B) {
      const a = cols.A.getBoundingClientRect()
      const b = cols.B.getBoundingClientRect()
      gaps = Math.round((b.left - a.right) * 100) / 100
    }
    return {
      module: box(module),
      grid: box(grid),
      colA: box(cols.A),
      colB: box(cols.B),
      colC: box(cols.C),
      colD: box(cols.D),
      colE: box(cols.E),
      gapAB: gaps,
      disconnected: Boolean(q('[data-testid="liq-overview-disconnected"]')),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      text: (module?.innerText || '').slice(0, 1000),
    }
  })
}

async function shotModule(page, name) {
  await page.locator('[data-testid="liq-one-overview"]').screenshot({ path: path.join(OUT, name) })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })

  // 1) Disconnected
  await page.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="liq-one-overview"]', { timeout: 90000 })
  await page.waitForTimeout(2000)
  const disconnected = await measure(page)
  await shotModule(page, 'desktop-disconnected.png')
  await page.screenshot({ path: path.join(OUT, 'desktop-page-disconnected.png'), fullPage: false })

  // Mobile disconnected
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(600)
  const mobileDisc = await measure(page)
  await shotModule(page, 'mobile-390-disconnected.png')

  // 2) No positions (localhost cert)
  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.goto(`${BASE}/liquidity-studio?overviewCert=force-connected-empty`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await page.waitForSelector('[data-testid="liq-overview-grid"]', { timeout: 90000 })
  await page.waitForTimeout(1500)
  const noPositions = await measure(page)
  await shotModule(page, 'desktop-no-positions.png')

  // 3) Unavailable
  await page.goto(`${BASE}/liquidity-studio?overviewCert=force-unavailable`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await page.waitForSelector('[data-testid="liq-overview-grid"]', { timeout: 90000 })
  await page.waitForTimeout(1200)
  const unavailable = await measure(page)
  await shotModule(page, 'desktop-unavailable-data.png')

  // 4) Mixed positions via injected localhost fixture (not production data)
  await page.addInitScript(() => {
    window.__LIQ_MODULE_005_FIXTURE__ = {
      lbPrograms: 1,
      positions: [
        {
          title: 'TOKEN_A / TOKEN_B',
          currentValueUsd: '1200.5',
          claimableValueUsd: null,
          chainId: 56,
          chainName: 'BNB Smart Chain',
          underlyings: [
            { symbol: 'TOKEN_A', valueUsd: '720.3' },
            { symbol: 'TOKEN_B', valueUsd: '480.2' },
          ],
        },
        {
          title: 'TOKEN_C / TOKEN_B',
          currentValueUsd: '340',
          claimableValueUsd: null,
          chainId: 56,
          chainName: 'BNB Smart Chain',
          underlyings: [
            { symbol: 'TOKEN_C', valueUsd: '170' },
            { symbol: 'TOKEN_B', valueUsd: '170' },
          ],
        },
      ],
    }
  })
  await page.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="liq-overview-grid"]', { timeout: 90000 })
  await page.waitForTimeout(1500)
  const mixed = await measure(page)
  await shotModule(page, 'desktop-mixed-positions.png')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(600)
  const mobileMixed = await measure(page)
  await shotModule(page, 'mobile-390-mixed-positions.png')

  // Overlay disconnected before vs after geometry (use no-positions as after composition)
  const before = path.join(OUT, 'desktop-disconnected.png')
  const after = path.join(OUT, 'desktop-no-positions.png')
  const overlay = path.join(OUT, 'desktop-overlay.png')
  let overlayStats = null
  if (fs.existsSync(before) && fs.existsSync(after)) {
    const py = `
from PIL import Image, ImageChops, ImageEnhance
import json
a=Image.open(${JSON.stringify(before)}).convert('RGBA')
b=Image.open(${JSON.stringify(after)}).convert('RGBA')
w=min(a.size[0],b.size[0]); h=min(a.size[1],b.size[1])
a=a.crop((0,0,w,h)); b=b.crop((0,0,w,h))
ov=a.copy(); bb=b.copy(); bb.putalpha(128); ov.alpha_composite(bb)
ov.convert('RGB').save(${JSON.stringify(overlay)})
d=ImageChops.difference(a.convert('RGB'), b.convert('RGB'))
ImageEnhance.Brightness(d).enhance(2.2).save(${JSON.stringify(path.join(OUT, 'desktop-diff.png'))})
ra=list(a.convert('RGB').getdata()); rb=list(b.convert('RGB').getdata())
step=max(1,len(ra)//150000); tot=0; n=0
for i in range(0,len(ra),step):
  x,y=ra[i],rb[i]; tot += (abs(x[0]-y[0])+abs(x[1]-y[1])+abs(x[2]-y[2]))/3; n+=1
print(json.dumps({"mae": tot/max(1,n), "size":[w,h], "maePctOf255": (tot/max(1,n))/255*100}))
`
    const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' })
    if (r.status === 0) overlayStats = JSON.parse(r.stdout.trim().split('\n').pop())
  }

  const geom = noPositions
  const checks = []
  const add = (name, actual, target, tol = 2) =>
    checks.push({ name, actual, target, ok: within(actual, target, tol) })
  add('moduleW', geom.module?.w, 1376)
  add('moduleH', geom.module?.h, 180)
  add('padApprox', geom.module?.padT, 16, 1)
  add('gridW', geom.grid?.w, 1344)
  add('gridH', geom.grid?.h, 148)
  add('colA', geom.colA?.w, 336)
  add('colB', geom.colB?.w, 336)
  add('colC', geom.colC?.w, 216)
  add('colD', geom.colD?.w, 216)
  add('colE', geom.colE?.w, 192)
  add('colAH', geom.colA?.h, 148)
  add('gapAB', geom.gapAB, 12, 1)
  checks.push({
    name: 'disconnectedCompact',
    actual: disconnected.disconnected,
    target: true,
    ok: disconnected.disconnected === true && disconnected.module?.h != null && within(disconnected.module.h, 180),
  })
  checks.push({
    name: 'noOverflowDesktop',
    actual: geom.overflowX,
    target: false,
    ok: geom.overflowX === false,
  })
  checks.push({
    name: 'mobileNoHScroll',
    actual: mobileMixed.overflowX,
    target: false,
    ok: mobileMixed.overflowX === false,
  })
  checks.push({
    name: 'noPositionsZeroValue',
    actual: /\$0\.00/.test(noPositions.text || ''),
    target: true,
    ok: /\$0\.00/.test(noPositions.text || '') && /No holdings yet/.test(noPositions.text || ''),
  })
  checks.push({
    name: 'unavailableHonest',
    actual: /Valuation unavailable|Holdings composition unavailable|Fees unavailable/.test(
      unavailable.text || '',
    ),
    target: true,
    ok: /Valuation unavailable/.test(unavailable.text || ''),
  })
  checks.push({
    name: 'mixedHasHoldings',
    actual: /TOKEN_A|TOKEN_B/.test(mixed.text || ''),
    target: true,
    ok: /TOKEN_A/.test(mixed.text || '') && /LB Programs 1/.test(mixed.text || ''),
  })

  const geomDev = Math.max(
    ...[
      [geom.module?.w, 1376],
      [geom.module?.h, 180],
      [geom.colA?.w, 336],
      [geom.colE?.w, 192],
    ].map(([a, t]) => (a == null ? 100 : (Math.abs(a - t) / t) * 100)),
  )

  const pass = checks.every((c) => c.ok) && geomDev < 3
  const report = {
    generatedAt: new Date().toISOString(),
    disconnected,
    noPositions,
    unavailable,
    mixed,
    mobileDisc,
    mobileMixed,
    checks,
    overlayStats,
    geometryDeviationPct: geomDev,
    pass,
  }
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  process.exit(pass ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
