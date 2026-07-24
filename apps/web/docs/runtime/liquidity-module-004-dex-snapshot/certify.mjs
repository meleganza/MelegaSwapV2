import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const OUT = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3504'

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
    const card = q('[data-testid="liq-one-dex-snapshot"]')
    const header = q('[data-testid="liq-snap-header"]')
    const kpis = q('[data-testid="liq-snap-kpis"]')
    const chart = q('[data-testid="liq-snap-chart"]')
    const footer = q('[data-testid="liq-snap-footer"]')
    const kpiTvl = q('[data-testid="liq-snap-kpi-tvl"]')
    const kpiVol = q('[data-testid="liq-snap-kpi-volume"]')
    const donut = q('[data-testid="liq-snap-donut"]')
    const text = card?.innerText || ''
    return {
      card: box(card),
      header: box(header),
      kpis: box(kpis),
      chart: box(chart),
      footer: box(footer),
      kpiTvl: box(kpiTvl),
      kpiVol: box(kpiVol),
      donut: box(donut),
      hasFabricated: /\$58\.74M|Top 50 Pairs/.test(text),
      hasAwaiting: /Awaiting Indexer/.test(text),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      text: text.slice(0, 900),
    }
  })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await page.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="liq-one-dex-snapshot"]', { timeout: 90000 })
  await page.waitForTimeout(2500)

  const desktop = await measure(page)
  await page.locator('[data-testid="liq-one-dex-snapshot"]').screenshot({
    path: path.join(OUT, 'after-desktop-dex-snapshot.png'),
  })
  await page.screenshot({ path: path.join(OUT, 'after-desktop-page.png'), fullPage: false })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(800)
  const mobile = await measure(page)
  await page.locator('[data-testid="liq-one-dex-snapshot"]').screenshot({
    path: path.join(OUT, 'after-mobile-dex-snapshot.png'),
  })

  const before = path.join(OUT, 'before-desktop-dex-snapshot.png')
  const after = path.join(OUT, 'after-desktop-dex-snapshot.png')
  const overlay = path.join(OUT, 'overlay-desktop-dex-snapshot.png')
  const diff = path.join(OUT, 'diff-desktop-dex-snapshot.png')
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
ImageEnhance.Brightness(d).enhance(2.2).save(${JSON.stringify(diff)})
ra=list(a.convert('RGB').getdata()); rb=list(b.convert('RGB').getdata())
step=max(1,len(ra)//150000); tot=0; n=0
for i in range(0,len(ra),step):
  x,y=ra[i],rb[i]; tot += (abs(x[0]-y[0])+abs(x[1]-y[1])+abs(x[2]-y[2]))/3; n+=1
print(json.dumps({"mae": tot/max(1,n), "size":[w,h], "maePctOf255": (tot/max(1,n))/255*100}))
`
    const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' })
    if (r.status === 0) overlayStats = JSON.parse(r.stdout.trim().split('\n').pop())
    else overlayStats = { error: r.stderr || r.stdout }
  }

  const checks = []
  const add = (name, actual, target, tol = 2) =>
    checks.push({ name, actual, target, ok: within(actual, target, tol) })
  add('cardW', desktop.card?.w, 672)
  add('cardH', desktop.card?.h, 324)
  add('headerH', desktop.header?.h, 44)
  add('kpisH', desktop.kpis?.h, 76)
  add('chartH', desktop.chart?.h, 132)
  add('footerH', desktop.footer?.h, 72)
  add('kpiTvlH', desktop.kpiTvl?.h, 76)
  add('kpiVolH', desktop.kpiVol?.h, 76)
  if (desktop.donut) {
    add('donutW', desktop.donut.w, 132)
    add('donutH', desktop.donut.h, 132)
  }
  const sum =
    (desktop.header?.h || 0) +
    (desktop.kpis?.h || 0) +
    (desktop.chart?.h || 0) +
    (desktop.footer?.h || 0)
  checks.push({ name: 'sectionSum324', actual: sum, target: 324, ok: within(sum, 324) })
  checks.push({
    name: 'noFabricated',
    actual: desktop.hasFabricated,
    target: false,
    ok: desktop.hasFabricated === false,
  })
  checks.push({
    name: 'noOverflowDesktop',
    actual: desktop.overflowX,
    target: false,
    ok: desktop.overflowX === false,
  })
  checks.push({
    name: 'mobileNaturalHeight',
    actual: mobile.card?.h,
    target: 'auto/natural',
    ok: mobile.card?.h != null && mobile.card.h > 0,
  })

  const geomDev = Math.max(
    ...[
      ['w', desktop.card?.w, 672],
      ['h', desktop.card?.h, 324],
    ].map(([, a, t]) => (a == null ? 100 : (Math.abs(a - t) / t) * 100)),
  )

  const pass = checks.every((c) => c.ok) && geomDev < 3
  const report = {
    generatedAt: new Date().toISOString(),
    desktop,
    mobile,
    checks,
    overlayStats,
    geometryDeviationPct: geomDev,
    pass,
  }
  fs.writeFileSync(path.join(OUT, 'dex-snapshot-measurements.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  process.exit(pass ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
