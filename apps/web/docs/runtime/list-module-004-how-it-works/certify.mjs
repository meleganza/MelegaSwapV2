/**
 * LIST_MODULE_004 — geometry, a11y, frozen-module integrity screenshots.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3498'
const REPO = path.resolve(__dirname, '../../../../../')

function within(actual, target, tol = 2) {
  if (actual == null || Number.isNaN(actual)) return false
  return Math.abs(actual - target) <= tol
}

function frozenIntegrity() {
  const files = [
    'apps/web/src/views/ListStudio/ListPageHero.tsx',
    'apps/web/src/views/ListStudio/ListActionCards.tsx',
    'apps/web/src/views/ListStudio/useListIntent.ts',
    'apps/web/src/views/ListStudio/ListWhyBuildRail.tsx',
  ]
  const results = files.map((f) => {
    const diff = execSync(`git diff 10c37d62 -- ${f}`, { cwd: REPO, encoding: 'utf8' })
    return { file: f, unchanged: diff === '' }
  })
  return { pass: results.every((r) => r.unchanged), results, base: '10c37d62' }
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        left: r.left,
      }
    }
    const hero = document.querySelector('[data-testid="list-one-page-header"]')
    const cards = document.querySelector('[data-testid="list-action-cards"]')
    const why = document.querySelector('[data-testid="list-why-build"]')
    const how = document.querySelector('[data-testid="list-how-it-works"]')
    const header = document.querySelector('[data-testid="list-how-header"]')
    const timeline = document.querySelector('[data-testid="list-how-timeline"]')
    const connector = document.querySelector('[data-testid="list-how-connector"]')
    const steps = [...document.querySelectorAll('[data-pixel-how-step="208x108"]')]
    const circles = [...document.querySelectorAll('[data-testid^="list-how-circle-"]')]
    const pad = how
      ? {
          top: parseFloat(getComputedStyle(how).paddingTop),
          right: parseFloat(getComputedStyle(how).paddingRight),
          bottom: parseFloat(getComputedStyle(how).paddingBottom),
          left: parseFloat(getComputedStyle(how).paddingLeft),
        }
      : null
    const gaps = []
    for (let i = 0; i < steps.length - 1; i += 1) {
      const a = steps[i].getBoundingClientRect()
      const b = steps[i + 1].getBoundingClientRect()
      gaps.push(
        window.innerWidth < 768
          ? Math.round((b.top - a.bottom) * 100) / 100
          : Math.round((b.left - a.right) * 100) / 100,
      )
    }
    const hBox = box(how)
    const wBox = box(why)
    const interactive = how
      ? getComputedStyle(how).pointerEvents === 'none' ||
        ![...how.querySelectorAll('a,button,[role="button"]')].length
      : false
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: box(hero),
      cards: box(cards),
      why: wBox,
      how: hBox,
      header: box(header),
      timeline: box(timeline),
      connector: box(connector),
      steps: steps.map((s) => box(s)),
      circles: circles.map((c) => box(c)),
      gaps,
      pad,
      whyToHowGap: wBox && hBox ? hBox.top - wBox.bottom : null,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      semantic: {
        section: how?.tagName === 'SECTION',
        heading: Boolean(document.querySelector('#list-how-it-works-title')),
        list: document.querySelector('[data-testid="list-how-steps"]')?.tagName === 'OL',
        items: steps.every((s) => s.tagName === 'LI'),
        itemCount: steps.length,
      },
      noInteractiveControls: interactive,
      cursor: how ? getComputedStyle(how).cursor : null,
    }
  })
}

function evaluateDesktop(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('heroW', m.hero?.width, 1376)
  add('heroH', m.hero?.height, 360)
  add('cardsW', m.cards?.width, 1376)
  add('cardsH', m.cards?.height, 272)
  add('whyW', m.why?.width, 1376)
  add('whyH', m.why?.height, 112)
  add('whyToHowGap', m.whyToHowGap, 24, 1)
  add('howW', m.how?.width, 1376)
  add('howH', m.how?.height, 176)
  add('pad', m.pad?.top, 20, 1)
  add('headerH', m.header?.height, 28, 1)
  add('timelineW', m.timeline?.width, 1336)
  add('timelineH', m.timeline?.height, 108)
  add('connectorW', m.connector?.width, 1088, 3)
  ;(m.steps || []).forEach((s, i) => {
    add(`step${i}W`, s?.width, 208)
    add(`step${i}H`, s?.height, 108)
  })
  ;(m.circles || []).forEach((c, i) => {
    add(`circle${i}W`, c?.width, 32, 1)
    add(`circle${i}H`, c?.height, 32, 1)
  })
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({ name: 'semanticOL', actual: m.semantic?.list, target: true, ok: m.semantic?.list === true })
  checks.push({ name: 'stepCount', actual: m.semantic?.itemCount, target: 5, ok: m.semantic?.itemCount === 5 })
  checks.push({
    name: 'noInteractiveControls',
    actual: m.noInteractiveControls,
    target: true,
    ok: m.noInteractiveControls === true,
  })
  return { pass: checks.every((c) => c.ok), checks }
}

function evaluateMobile(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('howW', m.how?.width, 358, 2)
  ;(m.circles || []).forEach((c, i) => {
    add(`circle${i}W`, c?.width, 28, 1)
    add(`circle${i}H`, c?.height, 28, 1)
  })
  ;(m.gaps || []).forEach((g, i) => add(`gap${i}`, g, 8, 1))
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({
    name: 'howAutoHeight',
    actual: m.how?.height,
    target: '~322',
    ok: (m.how?.height ?? 0) >= 280 && (m.how?.height ?? 0) <= 420,
  })
  return { pass: checks.every((c) => c.ok), checks }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const frozen = frozenIntegrity()
  fs.writeFileSync(path.join(OUT, 'frozen-modules-integrity.json'), JSON.stringify(frozen, null, 2))

  const browser = await chromium.launch({ headless: true })

  const desk = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await desk.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForSelector('[data-testid="list-how-it-works"]', { timeout: 90000 })
  await desk.waitForTimeout(1600)
  const desktop = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440.png'), fullPage: false })
  await desk.locator('[data-testid="list-how-it-works"]').screenshot({
    path: path.join(OUT, 'desktop-how-module.png'),
  })
  await desk.close()

  const desk1600 = await browser.newPage({ viewport: { width: 1600, height: 1200 } })
  await desk1600.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk1600.waitForSelector('[data-testid="list-how-it-works"]', { timeout: 90000 })
  await desk1600.waitForTimeout(1000)
  await desk1600.screenshot({ path: path.join(OUT, 'desktop-1600.png'), fullPage: false })
  await desk1600.close()

  const tab = await browser.newPage({ viewport: { width: 1024, height: 900 } })
  await tab.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await tab.waitForSelector('[data-testid="list-how-it-works"]', { timeout: 90000 })
  await tab.waitForTimeout(1000)
  const tablet = await measure(tab)
  await tab.screenshot({ path: path.join(OUT, 'tablet-1024.png'), fullPage: false })
  await tab.close()

  const mob = await browser.newPage({ viewport: { width: 390, height: 900 } })
  await mob.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="list-how-it-works"]', { timeout: 90000 })
  await mob.waitForTimeout(1000)
  const mobile = await measure(mob)
  await mob.screenshot({ path: path.join(OUT, 'mobile-390.png'), fullPage: false })
  await mob.close()

  await browser.close()

  const deskEval = evaluateDesktop(desktop)
  const mobEval = evaluateMobile(mobile)
  const a11y = {
    pass: Boolean(
      desktop.semantic?.section &&
        desktop.semantic?.heading &&
        desktop.semantic?.list &&
        desktop.semantic?.items &&
        desktop.semantic?.itemCount === 5,
    ),
    desktop: desktop.semantic,
    tablet: tablet.semantic,
    mobile: mobile.semantic,
  }

  const geometry = {
    desktop,
    tablet: { how: tablet.how, steps: tablet.steps },
    mobile,
    desktopChecks: deskEval,
    mobileChecks: mobEval,
    pass: deskEval.pass && mobEval.pass && frozen.pass,
    deviationTargetPct: 3,
  }

  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(geometry, null, 2))
  fs.writeFileSync(path.join(OUT, 'accessibility-validation.json'), JSON.stringify(a11y, null, 2))

  // Overlay: module crop with geometry guide box; diff vs solid target plate.
  const moduleShot = path.join(OUT, 'desktop-how-module.png')
  const overlayPath = path.join(OUT, 'desktop-overlay.png')
  const diffPath = path.join(OUT, 'desktop-diff.png')
  let overlayStats = null
  if (fs.existsSync(moduleShot)) {
    const py = `
from PIL import Image, ImageDraw, ImageChops, ImageEnhance
import json
img=Image.open(${JSON.stringify(moduleShot)}).convert('RGBA')
ov=img.copy()
d=ImageDraw.Draw(ov)
# target plate 1376x176 scaled to module crop size
w,h=ov.size
d.rectangle([0,0,w-1,h-1], outline=(221,185,47,220), width=2)
d.rectangle([20,20,w-21,48], outline=(245,245,245,160), width=1)
d.rectangle([20,68,w-21,h-21], outline=(221,185,47,120), width=1)
ov.convert('RGB').save(${JSON.stringify(overlayPath)})
plate=Image.new('RGB', (w,h), (17,17,17))
pd=ImageDraw.Draw(plate)
pd.rectangle([0,0,w-1,h-1], outline=(40,40,40), width=1)
diff=ImageChops.difference(img.convert('RGB'), plate)
ImageEnhance.Brightness(diff).enhance(2.2).save(${JSON.stringify(diffPath)})
ra=list(img.convert('RGB').getdata()); rb=list(plate.getdata())
step=max(1,len(ra)//120000); tot=0; n=0
for i in range(0,len(ra),step):
  x,y=ra[i],rb[i]; tot += (abs(x[0]-y[0])+abs(x[1]-y[1])+abs(x[2]-y[2]))/3; n+=1
print(json.dumps({"mae": tot/max(1,n), "size":[w,h], "maePctOf255": (tot/max(1,n))/255*100}))
`
    try {
      const { spawnSync } = await import('child_process')
      const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' })
      if (r.status === 0 && r.stdout.trim()) {
        overlayStats = JSON.parse(r.stdout.trim().split('\n').pop())
      }
    } catch {
      /* optional */
    }
  }
  if (overlayStats) {
    fs.writeFileSync(path.join(OUT, 'overlay-stats.json'), JSON.stringify(overlayStats, null, 2))
  }

  console.log(
    JSON.stringify(
      {
        pass: geometry.pass && a11y.pass,
        desktop: deskEval,
        mobile: mobEval,
        a11y,
        frozen,
        overlayStats,
      },
      null,
      2,
    ),
  )
  if (!(geometry.pass && a11y.pass)) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
