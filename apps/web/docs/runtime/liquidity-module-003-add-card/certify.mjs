import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const OUT = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3503'

function within(a, t, tol = 2) {
  return a != null && Math.abs(a - t) <= tol
}

async function measure(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s)
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100, x: r.x, y: r.y }
    }
    const card = q('[data-testid="liq-one-add-card"]')
    const header = q('[data-testid="liq-add-header"]')
    const pair = q('[data-testid="liq-add-pair"]')
    const form = q('[data-testid="liq-add-form"]')
    const summary = q('[data-testid="liq-add-summary"]')
    const footer = q('[data-testid="liq-add-footer"]')
    const artwork = q('[data-testid="liq-add-artwork"]')
    const pairSelect = q('[data-testid="liq-add-pair-select"]')
    const tokenA = q('[data-testid="liq-add-token-a"]')
    const tokenB = q('[data-testid="liq-add-token-b"]')
    const swap = q('[data-testid="liq-add-swap"]')
    const cta = q('[data-testid="liq-add-cta"]') || q('[data-testid="liq-add-footer"] button')
    const explore = Array.from(document.querySelectorAll('[data-testid="liq-one-add-card"] *')).some((el) =>
      (el.textContent || '').includes('Explore Liquidity'),
    )
    return {
      card: box(card),
      header: box(header),
      pair: box(pair),
      form: box(form),
      summary: box(summary),
      footer: box(footer),
      artwork: box(artwork),
      pairSelect: box(pairSelect),
      tokenA: box(tokenA),
      tokenB: box(tokenB),
      swap: box(swap),
      cta: box(cta),
      exploreLiquidityPresent: explore,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      text: (card?.innerText || '').slice(0, 800),
    }
  })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await page.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="liq-one-add-card"]', { timeout: 90000 })
  await page.waitForTimeout(2500)

  const desktop = await measure(page)
  await page.locator('[data-testid="liq-one-add-card"]').screenshot({
    path: path.join(OUT, 'after-desktop-add-card.png'),
  })
  await page.screenshot({ path: path.join(OUT, 'after-desktop-page.png'), fullPage: false })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(800)
  const mobile = await measure(page)
  await page.locator('[data-testid="liq-one-add-card"]').screenshot({
    path: path.join(OUT, 'after-mobile-add-card.png'),
  })

  const before = path.join(OUT, 'before-desktop-add-card.png')
  const after = path.join(OUT, 'after-desktop-add-card.png')
  const overlay = path.join(OUT, 'overlay-desktop-add-card.png')
  const diff = path.join(OUT, 'diff-desktop-add-card.png')
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
  add('cardH', desktop.card?.h, 520)
  add('headerH', desktop.header?.h, 96)
  add('pairH', desktop.pair?.h, 70)
  add('formH', desktop.form?.h, 250)
  add('summaryH', desktop.summary?.h, 44)
  add('footerH', desktop.footer?.h, 60)
  add('artworkW', desktop.artwork?.w, 160)
  add('artworkH', desktop.artwork?.h, 110)
  add('pairSelectH', desktop.pairSelect?.h, 48)
  add('tokenAH', desktop.tokenA?.h, 72)
  add('tokenBH', desktop.tokenB?.h, 72)
  add('swapW', desktop.swap?.w, 40)
  add('swapH', desktop.swap?.h, 40)
  add('ctaH', desktop.cta?.h, 44)
  checks.push({
    name: 'sectionSum520',
    actual:
      (desktop.header?.h || 0) +
      (desktop.pair?.h || 0) +
      (desktop.form?.h || 0) +
      (desktop.summary?.h || 0) +
      (desktop.footer?.h || 0),
    target: 520,
    ok: within(
      (desktop.header?.h || 0) +
        (desktop.pair?.h || 0) +
        (desktop.form?.h || 0) +
        (desktop.summary?.h || 0) +
        (desktop.footer?.h || 0),
      520,
    ),
  })
  checks.push({
    name: 'noExploreLiquidity',
    actual: desktop.exploreLiquidityPresent,
    target: false,
    ok: desktop.exploreLiquidityPresent === false,
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
  checks.push({
    name: 'viewYourPositionsOnly',
    actual: /View Your Positions/.test(desktop.text || '') && !/View Pools/.test(desktop.text || ''),
    target: true,
    ok: /View Your Positions/.test(desktop.text || '') && !/View Pools/.test(desktop.text || ''),
  })

  const pass = checks.every((c) => c.ok)
  const report = {
    generatedAt: new Date().toISOString(),
    desktop,
    mobile,
    checks,
    overlayStats,
    pass,
  }
  fs.writeFileSync(path.join(OUT, 'add-card-measurements.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  process.exit(pass ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
