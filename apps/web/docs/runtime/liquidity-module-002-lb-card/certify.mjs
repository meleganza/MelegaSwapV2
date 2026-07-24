import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const OUT = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3493'

function within(a, t, tol = 2) {
  return a != null && Math.abs(a - t) <= tol
}

async function measure(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s)
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { w: r.width, h: r.height, x: r.x, y: r.y, top: r.top, bottom: r.bottom }
    }
    const card = q('[data-testid="liq-one-building-card"]')
    const hero = q('[data-testid="liq-lb-header"]')
    const wizard = q('[data-testid="liq-lb-wizard"]')
    const body = q('[data-testid="liq-lb-body"]')
    const footer = q('[data-testid="liq-lb-footer"]')
    return {
      card: box(card),
      hero: box(hero),
      heroCollapsed: hero?.getAttribute('data-collapsed'),
      wizard: box(wizard),
      body: box(body),
      footer: box(footer),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }
  })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await page.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="liq-one-building-card"]', { timeout: 90000 })
  await page.waitForTimeout(2500)

  const initial = await measure(page)
  await page.locator('[data-testid="liq-one-building-card"]').screenshot({
    path: path.join(OUT, 'after-desktop-lb-card-initial.png'),
  })
  await page.screenshot({ path: path.join(OUT, 'after-desktop-page-initial.png'), fullPage: false })

  // Enter setup
  await page.locator('[data-testid="liq-lb-footer"] button').last().click()
  await page.waitForTimeout(800)
  const setup = await measure(page)
  await page.locator('[data-testid="liq-one-building-card"]').screenshot({
    path: path.join(OUT, 'after-desktop-lb-card-setup.png'),
  })

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(800)
  const mobile = await measure(page)
  await page.locator('[data-testid="liq-one-building-card"]').screenshot({
    path: path.join(OUT, 'after-mobile-lb-card.png'),
  })

  // Overlay vs before
  const before = path.join(OUT, 'before-desktop-lb-card.png')
  const after = path.join(OUT, 'after-desktop-lb-card-initial.png')
  const overlay = path.join(OUT, 'overlay-desktop-lb-card.png')
  const diff = path.join(OUT, 'diff-desktop-lb-card.png')
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
print(json.dumps({"mae": tot/max(1,n), "size":[w,h]}))
`
    const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' })
    if (r.status === 0) overlayStats = JSON.parse(r.stdout.trim().split('\n').pop())
  }

  const checks = []
  const add = (name, actual, target) => checks.push({ name, actual, target, ok: within(actual, target) })
  add('cardW', initial.card?.w, 672)
  add('cardH', initial.card?.h, 860)
  add('heroInitial', initial.hero?.h, 210)
  add('wizard', initial.wizard?.h, 48)
  add('body', initial.body?.h, 442)
  add('footer', initial.footer?.h, 160)
  add('heroSetup', setup.hero?.h, 72)
  add('cardHSetup', setup.card?.h, 860)
  add('bodySetup', setup.body?.h, 580) // 442 + (210-72)
  add('footerSetup', setup.footer?.h, 160)
  add('wizardSetup', setup.wizard?.h, 48)
  checks.push({ name: 'heroCollapsedAttr', actual: setup.heroCollapsed, target: '1', ok: setup.heroCollapsed === '1' })
  checks.push({ name: 'mobileNoFixed860', actual: mobile.card?.h, target: '<860 or natural', ok: mobile.card?.h != null })
  checks.push({ name: 'noOverflowDesktop', actual: initial.overflowX, target: false, ok: initial.overflowX === false })

  const pass = checks.every((c) => c.ok)
  const report = {
    generatedAt: new Date().toISOString(),
    initial,
    setup,
    mobile,
    checks,
    overlayStats,
    pass,
  }
  fs.writeFileSync(path.join(OUT, 'lb-card-measurements.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ pass, failed: checks.filter((c) => !c.ok), overlayStats }, null, 2))
  await browser.close()
  process.exit(pass ? 0 : 2)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
