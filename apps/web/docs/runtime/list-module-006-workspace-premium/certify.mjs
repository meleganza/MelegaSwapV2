/**
 * LIST_MODULE_006 — premium workspace geometry + frozen integrity.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3500'
const REPO = path.resolve(__dirname, '../../../../../')
const FROZEN = 'c75cd6fb'

function within(actual, target, tol = 2) {
  if (actual == null || Number.isNaN(actual)) return false
  return Math.abs(actual - target) <= tol
}

function isListPath(pathname) {
  return pathname === '/list' || pathname === '/list/'
}

function frozenIntegrity() {
  const files = [
    'apps/web/src/views/ListStudio/ListPageHero.tsx',
    'apps/web/src/views/ListStudio/ListActionCards.tsx',
    'apps/web/src/views/ListStudio/useListIntent.ts',
    'apps/web/src/views/ListStudio/ListWhyBuildRail.tsx',
    'apps/web/src/views/ListStudio/ListHowItWorks.tsx',
    'apps/web/src/views/ListStudio/ListStudioScreen.tsx',
  ]
  const results = files.map((f) => {
    const diff = execSync(`git diff ${FROZEN} -- ${f}`, { cwd: REPO, encoding: 'utf8' })
    return { file: f, unchanged: diff === '' }
  })
  return { pass: results.every((r) => r.unchanged), results, base: FROZEN }
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { width: r.width, height: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right }
    }
    const ws = document.querySelector('[data-testid="list-workspace"]')
    const header = document.querySelector('[data-testid="list-workspace-header"]')
    const body = document.querySelector('[data-testid="list-workspace-body"]')
    const footer = document.querySelector('[data-testid="list-workspace-footer"]')
    const left = document.querySelector('[data-testid="list-workspace-left"]')
    const right = document.querySelector('[data-testid="list-workspace-right"]')
    const progress = document.querySelector('[data-testid="list-workspace-progress"]')
    const dots = progress ? [...progress.querySelectorAll('[data-state]')] : []
    const completeness = document.querySelector('[data-testid="list-workspace-completeness"]')
    const ring = completeness?.querySelector('div')
    const autosave = document.querySelector('[data-testid="list-workspace-autosave"]')
    const status = document.querySelector('[data-testid="list-workspace-status"]')
    const hero = document.querySelector('[data-testid="list-one-page-header"]')
    const how = document.querySelector('[data-testid="list-how-it-works"]')
    const buttons = [...(footer?.querySelectorAll('button') || [])].map((b) => b.textContent?.trim())
    return {
      pathname: location.pathname,
      intent: new URLSearchParams(location.search).get('intent'),
      workspace: box(ws),
      header: box(header),
      body: box(body),
      footer: box(footer),
      left: box(left),
      right: box(right),
      progress: box(progress),
      dots: dots.map((d) => box(d)),
      dotStates: dots.map((d) => d.getAttribute('data-state')),
      completeness: box(completeness),
      ring: box(ring),
      autosave: autosave?.textContent?.trim() || null,
      status: status?.textContent?.trim() || null,
      hero: box(hero),
      how: box(how),
      footerButtons: buttons,
      hasModal: Boolean(document.querySelector('[role="dialog"]')),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      module: ws?.getAttribute('data-list-module'),
    }
  })
}

function evaluateDesktop(m) {
  const checks = []
  const add = (name, actual, target, tol = 2) => {
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  }
  add('workspaceW', m.workspace?.width, 1376)
  add('workspaceH', m.workspace?.height, 920)
  add('headerH', m.header?.height, 64, 1)
  add('bodyH', m.body?.height, 760, 2)
  add('footerH', m.footer?.height, 72, 1)
  add('rightW', m.right?.width, 340, 2)
  add('rightH', m.right?.height, 760, 2)
  add('heroH', m.hero?.height, 360)
  add('howH', m.how?.height, 176)
  checks.push({ name: 'dots', actual: m.dots?.length, target: 5, ok: m.dots?.length === 5 })
  checks.push({
    name: 'dotSize',
    actual: m.dots?.[0]?.width,
    target: 20,
    ok: within(m.dots?.[0]?.width, 20, 1),
  })
  checks.push({
    name: 'ringApprox',
    actual: m.ring?.width,
    target: 72,
    ok: within(m.ring?.width, 72, 4),
  })
  checks.push({ name: 'footerMax2', actual: m.footerButtons?.length, target: '<=2', ok: (m.footerButtons?.length || 0) <= 2 })
  checks.push({ name: 'noModal', actual: m.hasModal, target: false, ok: !m.hasModal })
  checks.push({ name: 'onList', actual: m.pathname, target: '/list', ok: isListPath(m.pathname) })
  checks.push({ name: 'module006', actual: m.module, target: '006', ok: m.module === '006' })
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  return { pass: checks.every((c) => c.ok), checks }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const frozen = frozenIntegrity()
  fs.writeFileSync(path.join(OUT, 'frozen-modules-integrity.json'), JSON.stringify(frozen, null, 2))

  const browser = await chromium.launch({ headless: true })
  const desk = await browser.newPage({ viewport: { width: 1440, height: 1400 } })
  await desk.goto(`${BASE}/list/?intent=import-token`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForSelector('[data-testid="list-workspace"]', { timeout: 90000 })
  await desk.waitForTimeout(1400)
  const desktop = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440.png'), fullPage: false })
  await desk.locator('[data-testid="list-workspace"]').screenshot({
    path: path.join(OUT, 'desktop-workspace-module.png'),
  })

  // trigger autosave path
  await desk.fill('input[placeholder="0x…"]', '0x1234567890abcdef1234567890abcdef12345678')
  await desk.waitForTimeout(2300)
  const afterSave = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-autosaved.png'), fullPage: false })

  for (const intent of ['create-token', 'claim-project', 'create-project', 'ai-assistant']) {
    await desk.goto(`${BASE}/list/?intent=${intent}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await desk.waitForSelector(`[data-list-intent="${intent}"]`, { timeout: 60000 })
    await desk.waitForTimeout(700)
    await desk.screenshot({ path: path.join(OUT, `desktop-1440-${intent}.png`), fullPage: false })
  }
  await desk.close()

  const mob = await browser.newPage({ viewport: { width: 390, height: 900 } })
  await mob.goto(`${BASE}/list/?intent=import-token`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="list-workspace"]', { timeout: 90000 })
  await mob.waitForTimeout(1000)
  const mobile = await measure(mob)
  await mob.screenshot({ path: path.join(OUT, 'mobile-390.png'), fullPage: false })
  await mob.close()
  await browser.close()

  const deskEval = evaluateDesktop(desktop)
  const mobileOk =
    within(mobile.workspace?.width, 358, 2) &&
    mobile.overflowX === false &&
    isListPath(mobile.pathname) &&
    (mobile.right?.top ?? 0) >= (mobile.left?.bottom ?? 0) - 2

  const geometry = {
    desktop,
    afterSave: { autosave: afterSave.autosave, status: afterSave.status },
    mobile,
    desktopChecks: deskEval,
    mobileOk,
    pass: deskEval.pass && frozen.pass && mobileOk,
  }
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(geometry, null, 2))

  const moduleShot = path.join(OUT, 'desktop-workspace-module.png')
  if (fs.existsSync(moduleShot)) {
    const py = `
from PIL import Image, ImageDraw, ImageChops, ImageEnhance
img=Image.open(${JSON.stringify(moduleShot)}).convert('RGBA')
ov=img.copy(); d=ImageDraw.Draw(ov); w,h=ov.size
d.rectangle([0,0,w-1,h-1], outline=(221,185,47,220), width=2)
d.rectangle([w-340-24,75,w-24,h-83], outline=(245,245,245,150), width=1)
ov.convert('RGB').save(${JSON.stringify(path.join(OUT, 'desktop-overlay.png'))})
plate=Image.new('RGB',(w,h),(16,16,16))
diff=ImageChops.difference(img.convert('RGB'), plate)
ImageEnhance.Brightness(diff).enhance(2.2).save(${JSON.stringify(path.join(OUT, 'desktop-diff.png'))})
print('ok')
`
    spawnSync('python3', ['-c', py], { encoding: 'utf8' })
  }

  console.log(JSON.stringify({ pass: geometry.pass, desktop: deskEval, mobileOk, frozen, afterSave: geometry.afterSave }, null, 2))
  if (!geometry.pass) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
