import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const OUT = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3506'

function within(a, t, tol = 2) {
  return a != null && Math.abs(a - t) <= tol
}

async function measure(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s)
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100 }
    }
    const section = q('[data-testid="liq-one-positions"]')
    const shell = q('[data-testid="liq-positions-shell"]')
    const chrome = q('[data-testid="liq-positions-chrome"]')
    const thead = q('[data-testid="liq-positions-table-head"]')
    const row = q('[data-pixel-pos-row="68"]')
    const hide = q('[data-testid="liq-positions-hide-closed"]')
    return {
      section: box(section),
      shell: box(shell),
      chrome: box(chrome),
      thead: box(thead),
      row: box(row),
      hideClosedOnlyAction: Boolean(hide),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      text: (section?.innerText || '').slice(0, 1200),
      rowCount: document.querySelectorAll('[data-pixel-pos-row="68"]').length,
    }
  })
}

async function shot(page, name) {
  await page.locator('[data-testid="liq-one-positions"]').screenshot({ path: path.join(OUT, name) })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })

  // Empty / disconnected baseline
  await page.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="liq-one-positions"]', { timeout: 90000 })
  await page.waitForTimeout(2000)
  const disconnected = await measure(page)
  await shot(page, 'desktop-disconnected.png')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(600)
  const mobileEmpty = await measure(page)
  await shot(page, 'mobile-390-empty.png')

  // Mixed fixture
  await page.addInitScript(() => {
    window.__LIQ_MODULE_006_FIXTURE__ = {
      rows: [
        {
          id: 'm1',
          tokenA: 'TOKEN_A',
          tokenB: 'TOKEN_B',
          feeLabel: '0.25% fee',
          type: 'Manual',
          isLb: false,
          value: '$1,200.50',
          share: '0.42%',
          fees: '—',
          status: 'Active',
          closed: false,
          contract: null,
        },
        {
          id: 'lb1',
          tokenA: 'TOKEN_C',
          tokenB: 'TOKEN_B',
          feeLabel: 'Program',
          type: 'Liquidity Building',
          isLb: true,
          value: '—',
          share: '—',
          fees: '—',
          status: 'Active',
          closed: false,
          contract: null,
        },
        {
          id: 'm2',
          tokenA: 'TOKEN_D',
          tokenB: 'TOKEN_A',
          feeLabel: '0.25% fee',
          type: 'Manual',
          isLb: false,
          value: '$80.00',
          share: '0.01%',
          fees: '—',
          status: 'Stopped',
          closed: true,
          contract: null,
        },
      ],
    }
  })

  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-pixel-pos-row="68"]', { timeout: 90000 })
  await page.waitForTimeout(1500)
  const mixed = await measure(page)
  await shot(page, 'desktop-mixed-positions.png')
  await page.screenshot({ path: path.join(OUT, 'desktop-page-mixed.png'), fullPage: false })

  // Reveal closed
  await page.locator('[data-testid="liq-positions-hide-closed"]').click()
  await page.waitForTimeout(400)
  const withClosed = await measure(page)
  await shot(page, 'desktop-with-closed.png')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(600)
  const mobileMixed = await measure(page)
  await shot(page, 'mobile-390-mixed-positions.png')

  const before = path.join(OUT, 'desktop-disconnected.png')
  const after = path.join(OUT, 'desktop-mixed-positions.png')
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

  const checks = []
  const add = (name, actual, target, tol = 2) =>
    checks.push({ name, actual, target, ok: within(actual, target, tol) })
  add('sectionW', mixed.section?.w, 1376)
  add('chromeH', mixed.chrome?.h, 64)
  add('theadH', mixed.thead?.h, 52)
  add('rowH', mixed.row?.h, 68)
  checks.push({
    name: 'hideClosedPresent',
    actual: mixed.hideClosedOnlyAction,
    target: true,
    ok: mixed.hideClosedOnlyAction === true,
  })
  checks.push({
    name: 'noOverflowDesktop',
    actual: mixed.overflowX,
    target: false,
    ok: mixed.overflowX === false,
  })
  checks.push({
    name: 'mobileNoOverflow',
    actual: mobileMixed.overflowX,
    target: false,
    ok: mobileMixed.overflowX === false,
  })
  checks.push({
    name: 'hideClosedFilters',
    actual: mixed.rowCount,
    target: 2,
    ok: mixed.rowCount === 2,
  })
  checks.push({
    name: 'showClosedAddsRow',
    actual: withClosed.rowCount,
    target: 3,
    ok: withClosed.rowCount === 3,
  })
  checks.push({
    name: 'hasTableColumns',
    actual: /pool share/i.test(mixed.text || '') && /liquidity building/i.test(mixed.text || ''),
    target: true,
    ok: /pool share/i.test(mixed.text || '') && /liquidity building/i.test(mixed.text || ''),
  })

  const geomDev = Math.max(
    ...[
      [mixed.chrome?.h, 64],
      [mixed.thead?.h, 52],
      [mixed.row?.h, 68],
      [mixed.section?.w, 1376],
    ].map(([a, t]) => (a == null ? 100 : (Math.abs(a - t) / t) * 100)),
  )

  const pass = checks.every((c) => c.ok) && geomDev < 3
  const report = {
    generatedAt: new Date().toISOString(),
    disconnected,
    mixed,
    withClosed,
    mobileEmpty,
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
