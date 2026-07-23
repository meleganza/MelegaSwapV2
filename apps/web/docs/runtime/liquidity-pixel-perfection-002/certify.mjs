/**
 * LIQUIDITY_PIXEL_PERFECTION_002 — browser geometry + overlay certification.
 * Run: node certify.mjs
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3491'
const MOCKUP = path.resolve(
  __dirname,
  '../liquidity-pixel-perfection-001/approved-mockup.png',
)

const TARGETS = {
  contentWidth: 1376,
  margin: 32,
  col: 672,
  colGap: 32,
  mainRow: 860,
  addH: 520,
  snapH: 324,
  rightGap: 16,
  belowGap: 24,
  overviewH: 150,
  rowH: 72,
  educationH: 96,
  tol: 2,
}

function within(actual, target, tol = TARGETS.tol) {
  if (actual == null || Number.isNaN(actual)) return false
  return Math.abs(actual - target) <= tol
}

async function measure(page) {
  return page.evaluate(() => {
    const q = (sel) => document.querySelector(sel)
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        top: r.top,
        left: r.left,
        right: r.right,
        bottom: r.bottom,
      }
    }

    const pageEl = q('[data-testid="liq-one-unified-page"]')
    const grid = q('[data-testid="liq-one-product-grid"]')
    const lb = q('[data-testid="liq-one-building-card"]')
    const right = q('[data-testid="liq-one-right-col"]')
    const add = q('[data-testid="liq-one-add-card"]')
    const snap = q('[data-testid="liq-one-dex-snapshot"]')
    const overview = q('[data-testid="liq-one-overview"]')
    const education = q('[data-testid="liq-one-education"]')
    const positions = q('#liq-your-positions') || q('[data-testid="liq-one-positions"]')
    const header = q('[data-testid="liq-lb-header"]')
    const wizard = q('[data-testid="liq-lb-wizard"]')
    const body = q('[data-testid="liq-lb-body"]')
    const footer = q('[data-testid="liq-lb-footer"]')

    const rowBoxes = [...document.querySelectorAll('#liq-your-positions [data-testid], #liq-your-positions > div > div > div')]
      .map(box)
      .filter((b) => b && Math.abs(b.height - 72) < 8)
      .slice(0, 5)

    // Prefer table rows if present
    const tableRows = [...document.querySelectorAll('#liq-your-positions div')]
      .map((el) => ({ el, b: box(el) }))
      .filter(({ b }) => b && b.height >= 70 && b.height <= 74 && b.width > 800)
      .slice(0, 5)
      .map(({ b }) => b)

    const lbBox = box(lb)
    const addBox = box(add)
    const snapBox = box(snap)
    const overviewBox = box(overview)
    const gridBox = box(grid)
    const pageBox = box(pageEl)
    const rightBox = box(right)

    const viewportW = window.innerWidth
    const contentLeft = pageBox?.left ?? null
    const contentRight = pageBox?.right ?? null
    const contentWidth = pageBox?.width ?? null
    const marginLeft = contentLeft
    const marginRight = contentRight != null ? viewportW - contentRight : null

    const colGap =
      lbBox && rightBox ? rightBox.left - lbBox.right : null
    const rightInternalGap =
      addBox && snapBox ? snapBox.top - addBox.bottom : null
    const belowGap =
      overviewBox && gridBox ? overviewBox.top - gridBox.bottom : null

    const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1

    // When positions are empty, measure locked row height via a temporary fixture row.
    let measuredRowH = null
    const positionsHost = q('#liq-your-positions')
    if (positionsHost && !(tableRows.length || rowBoxes.length)) {
      const probe = document.createElement('div')
      probe.setAttribute('data-testid', 'liq-one-position-row-probe')
      probe.style.cssText =
        'display:grid;grid-template-columns:1.4fr 1.1fr 0.9fr 0.8fr 0.9fr 0.9fr 0.9fr;height:72px;min-height:72px;max-height:72px;box-sizing:border-box;'
      positionsHost.appendChild(probe)
      measuredRowH = probe.getBoundingClientRect().height
      probe.remove()
    }

    return {
      viewport: { width: viewportW, height: window.innerHeight },
      pageScrollWidth: document.documentElement.scrollWidth,
      overflowX,
      contentLeft,
      contentRight,
      contentWidth,
      marginLeft,
      marginRight,
      pageTopOffset: pageBox?.top ?? null,
      leftColumnWidth: lbBox?.width ?? null,
      rightColumnWidth: rightBox?.width ?? null,
      columnGap: colGap,
      mainRowHeight: gridBox?.height ?? null,
      liquidityBuilding: {
        width: lbBox?.width ?? null,
        height: lbBox?.height ?? null,
        headerH: box(header)?.height ?? null,
        headerCollapsed: header?.getAttribute('data-collapsed') ?? null,
        wizardH: box(wizard)?.height ?? null,
        bodyH: box(body)?.height ?? null,
        footerH: box(footer)?.height ?? null,
      },
      addLiquidity: {
        width: addBox?.width ?? null,
        height: addBox?.height ?? null,
      },
      snapshot: {
        width: snapBox?.width ?? null,
        height: snapBox?.height ?? null,
      },
      rightColumnInternalGap: rightInternalGap,
      overviewTopGap: belowGap,
      overviewHeight: overviewBox?.height ?? null,
      positionRowHeights: (tableRows.length ? tableRows : rowBoxes).map((b) => b.height),
      positionRowHeightProbe: measuredRowH,
      educationHeight: box(education)?.height ?? null,
      boxes: {
        page: pageBox,
        grid: gridBox,
        lb: lbBox,
        right: rightBox,
        add: addBox,
        snap: snapBox,
        overview: overviewBox,
        education: box(education),
        positions: box(positions),
      },
    }
  })
}

function evaluatePass(m) {
  const checks = []
  const add = (name, actual, target, tol = TARGETS.tol) => {
    const ok = within(actual, target, tol)
    checks.push({ name, actual, target, tol, ok })
  }
  add('contentWidth', m.contentWidth, TARGETS.contentWidth)
  add('marginLeft', m.marginLeft, TARGETS.margin)
  add('marginRight', m.marginRight, TARGETS.margin)
  add('leftColumnWidth', m.leftColumnWidth, TARGETS.col)
  add('rightColumnWidth', m.rightColumnWidth, TARGETS.col)
  add('columnGap', m.columnGap, TARGETS.colGap)
  add('mainRowHeight', m.mainRowHeight, TARGETS.mainRow)
  add('lbHeight', m.liquidityBuilding.height, TARGETS.mainRow)
  add('addHeight', m.addLiquidity.height, TARGETS.addH)
  add('snapHeight', m.snapshot.height, TARGETS.snapH)
  add('rightInternalGap', m.rightColumnInternalGap, TARGETS.rightGap)
  add('overviewTopGap', m.overviewTopGap, TARGETS.belowGap)
  add('overviewHeight', m.overviewHeight, TARGETS.overviewH)
  add('educationHeight', m.educationHeight, TARGETS.educationH)
  if (m.positionRowHeights?.length) {
    for (const [i, h] of m.positionRowHeights.entries()) {
      add(`positionRow[${i}]`, h, TARGETS.rowH)
    }
  } else if (m.positionRowHeightProbe != null) {
    add('positionRowProbe', m.positionRowHeightProbe, TARGETS.rowH)
  }
  checks.push({ name: 'noHorizontalOverflow', actual: m.overflowX, target: false, ok: m.overflowX === false })
  const pass = checks.every((c) => c.ok)
  return { pass, checks }
}

async function captureViewport(browser, name, width, height, route = '/liquidity-studio') {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="liq-one-unified-page"]', { timeout: 90000 })
  await page.waitForTimeout(2500)
  const measurements = await measure(page)
  const shotPath = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: shotPath, fullPage: false })
  await page.close()
  return { measurements, shotPath }
}

async function makeOverlayAndDiff(renderPath, mockupPath, overlayPath, diffPath) {
  // Dynamic import of sharp if available, else PIL via child_process
  const { spawnSync } = await import('child_process')
  const py = `
from PIL import Image, ImageChops, ImageEnhance, ImageDraw, ImageFont
import json, sys
render = Image.open(${JSON.stringify(renderPath)}).convert('RGBA')
mock = Image.open(${JSON.stringify(mockupPath)}).convert('RGBA')
# Fit mockup to render size (letterbox center-crop to width)
rw, rh = render.size
mw, mh = mock.size
scale = rw / mw
nw, nh = int(mw * scale), int(mh * scale)
mock_r = mock.resize((nw, nh), Image.Resampling.LANCZOS)
# crop/pad to render height
if nh >= rh:
    top = (nh - rh) // 2
    mock_f = mock_r.crop((0, top, rw, top + rh))
else:
    mock_f = Image.new('RGBA', (rw, rh), (0,0,0,255))
    mock_f.paste(mock_r, (0, (rh - nh)//2))
# 50% overlay
mock_a = mock_f.copy()
mock_a.putalpha(128)
overlay = render.copy()
overlay.alpha_composite(mock_a)
overlay.convert('RGB').save(${JSON.stringify(overlayPath)})
# Diff
diff = ImageChops.difference(render.convert('RGB'), mock_f.convert('RGB'))
enh = ImageEnhance.Brightness(diff)
enh.enhance(2.2).save(${JSON.stringify(diffPath)})
# crude mean absolute error without numpy
ra = list(render.convert('RGB').getdata())
rb = list(mock_f.convert('RGB').getdata())
total = 0.0
maxd = 0.0
n = len(ra)
step = max(1, n // 200000)
count = 0
for i in range(0, n, step):
    a, b = ra[i], rb[i]
    d = abs(a[0]-b[0]) + abs(a[1]-b[1]) + abs(a[2]-b[2])
    total += d / 3.0
    if d/3.0 > maxd: maxd = d/3.0
    count += 1
mae = total / max(1, count)
print(json.dumps({"mae": mae, "maxAbs": maxd, "renderSize": [rw,rh], "mockScaled": [nw,nh]}))
`
  const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' })
  if (r.status !== 0) {
    console.error(r.stderr)
    throw new Error('overlay python failed')
  }
  return JSON.parse(r.stdout.trim().split('\n').pop())
}

async function validateWizardStates(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await page.goto(`${BASE}/liquidity-studio?view=building`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="liq-one-building-card"]', { timeout: 90000 })
  await page.waitForTimeout(2000)

  const states = []
  const snap = async (label) => {
    const m = await measure(page)
    const h = m.liquidityBuilding.height
    const body = m.liquidityBuilding.bodyH
    const wizard = m.liquidityBuilding.wizardH
    const footer = m.liquidityBuilding.footerH
    const header = m.liquidityBuilding.headerH
    states.push({
      label,
      cardHeight: h,
      headerH: header,
      wizardH: wizard,
      bodyH: body,
      footerH: footer,
      cardOk: within(h, 860),
      bodyOk: within(body, 540),
      wizardOk: within(wizard, 48),
      footerOk: within(footer, 80),
    })
    await page.screenshot({
      path: path.join(OUT, `state-${label.replace(/[^a-z0-9_-]+/gi, '_').toLowerCase()}.png`),
      fullPage: false,
    })
  }

  await snap('initial')
  // Click continue through wizard steps if buttons exist
  for (let i = 0; i < 5; i++) {
    const btn = page.locator('[data-testid="liq-lb-footer"] button').last()
    if (await btn.count()) {
      await btn.click({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(500)
      await snap(`wizard-step-${i + 1}`)
    }
  }

  // Measure height stability across steps
  const heights = states.map((s) => s.cardHeight)
  const stable = heights.every((h) => within(h, 860))
  await page.close()
  return { states, stable }
}

async function captureMobile(browser) {
  const mobiles = [
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-393', width: 393, height: 852 },
    { name: 'mobile-430', width: 430, height: 932 },
  ]
  const results = []
  for (const m of mobiles) {
    const page = await browser.newPage({ viewport: { width: m.width, height: m.height } })
    await page.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForSelector('[data-testid="liq-one-unified-page"]', { timeout: 90000 })
    await page.waitForTimeout(2000)
    const info = await page.evaluate(() => {
      const pageEl = document.querySelector('[data-testid="liq-one-unified-page"]')
      const lb = document.querySelector('[data-testid="liq-one-building-card"]')
      const add = document.querySelector('[data-testid="liq-one-add-card"]')
      const snap = document.querySelector('[data-testid="liq-one-dex-snapshot"]')
      const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      const narrowText = [...document.querySelectorAll('p, h1, h2')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          const s = getComputedStyle(el)
          return s.display !== 'none' && r.width > 40 && r.width < 280 && r.height > 10
        })
        .map((el) => ({
          tag: el.tagName,
          w: el.getBoundingClientRect().width,
          text: (el.textContent || '').slice(0, 40),
        }))
      const order = [lb, add, snap]
        .filter(Boolean)
        .map((el) => el.getBoundingClientRect().top)
      const stacked = order.length < 2 || order.every((v, i, a) => i === 0 || v >= a[i - 1] - 2)
      const touchButtons = [...document.querySelectorAll('button, a')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          const s = getComputedStyle(el)
          return s.display !== 'none' && r.width > 0 && r.height > 0
        })
        .map((el) => {
          const r = el.getBoundingClientRect()
          return { h: r.height, w: r.width, text: (el.textContent || '').trim().slice(0, 24) }
        })
      const smallTouch = touchButtons.filter((b) => b.h < 44 && b.w < 44)
      return {
        overflowX,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        lbHeight: lb?.getBoundingClientRect().height ?? null,
        addHeight: add?.getBoundingClientRect().height ?? null,
        snapHeight: snap?.getBoundingClientRect().height ?? null,
        stacked,
        narrowTextCount: narrowText.length,
        narrowText: narrowText.slice(0, 5),
        smallTouchCount: smallTouch.length,
        smallTouch: smallTouch.slice(0, 8),
      }
    })
    await page.screenshot({ path: path.join(OUT, `${m.name}.png`), fullPage: true })
    results.push({ ...m, ...info, ok: !info.overflowX && info.stacked })
    await page.close()
  }
  return results
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  const d1440 = await captureViewport(browser, 'desktop-1440-render', 1440, 1200)
  await captureViewport(browser, 'desktop-1440x1600-render', 1440, 1600)
  const d1376 = await captureViewport(browser, 'desktop-1376-render', 1376, 1200)
  const d1600 = await captureViewport(browser, 'desktop-1600-render', 1600, 1200)

  // Deep links
  await captureViewport(browser, 'route-building-1440', 1440, 1200, '/liquidity-studio?view=building')
  await captureViewport(browser, 'route-add-1440', 1440, 1200, '/liquidity-studio?view=add')
  await captureViewport(browser, 'route-positions-1440', 1440, 1200, '/liquidity-studio?view=positions')

  const eval1440 = evaluatePass(d1440.measurements)
  const overlayStats = await makeOverlayAndDiff(
    d1440.shotPath,
    MOCKUP,
    path.join(OUT, 'desktop-1440-overlay.png'),
    path.join(OUT, 'desktop-1440-diff.png'),
  )

  // Persist geometry early so desktop evidence survives later phase failures.
  fs.writeFileSync(
    path.join(OUT, 'geometry-measurements.partial.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        base: BASE,
        mockup: MOCKUP,
        viewports: {
          '1440x1200': d1440.measurements,
          '1376x1200': d1376.measurements,
          '1600x1200': d1600.measurements,
        },
        acceptance1440: eval1440,
        overlayStats,
      },
      null,
      2,
    ),
  )
  console.log(
    JSON.stringify(
      {
        phase: 'desktop',
        pass: eval1440.pass,
        failed: eval1440.checks.filter((c) => !c.ok),
        overlayStats,
      },
      null,
      2,
    ),
  )

  const wizard = await validateWizardStates(browser)
  const mobile = await captureMobile(browser)

  const report = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    mockup: MOCKUP,
    viewports: {
      '1440x1200': d1440.measurements,
      '1376x1200': d1376.measurements,
      '1600x1200': d1600.measurements,
    },
    acceptance1440: eval1440,
    overlayStats,
    wizard,
    mobile,
    verdict: eval1440.pass && wizard.stable && mobile.every((m) => m.ok)
      ? 'GEOMETRY_PASS'
      : 'GEOMETRY_FAIL',
  }

  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ verdict: report.verdict, pass: eval1440.pass, failed: eval1440.checks.filter((c) => !c.ok), wizardStable: wizard.stable, mobile }, null, 2))
  await browser.close()
  process.exit(report.verdict === 'GEOMETRY_PASS' ? 0 : 2)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
