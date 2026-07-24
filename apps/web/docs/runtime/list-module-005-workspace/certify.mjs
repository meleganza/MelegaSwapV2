/**
 * LIST_MODULE_005 — workspace geometry, intents, frozen-module integrity.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3499'
const REPO = path.resolve(__dirname, '../../../../../')
const FROZEN_BASE = 'f879c6c8'

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
    'apps/web/src/views/ListStudio/ListHowItWorks.tsx',
  ]
  const results = files.map((f) => {
    const diff = execSync(`git diff ${FROZEN_BASE} -- ${f}`, { cwd: REPO, encoding: 'utf8' })
    return { file: f, unchanged: diff === '' }
  })
  return { pass: results.every((r) => r.unchanged), results, base: FROZEN_BASE }
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { width: r.width, height: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right }
    }
    const hero = document.querySelector('[data-testid="list-one-page-header"]')
    const cards = document.querySelector('[data-testid="list-action-cards"]')
    const why = document.querySelector('[data-testid="list-why-build"]')
    const how = document.querySelector('[data-testid="list-how-it-works"]')
    const ws = document.querySelector('[data-testid="list-workspace"]')
    const header = document.querySelector('[data-testid="list-workspace-header"]')
    const body = document.querySelector('[data-testid="list-workspace-body"]')
    const footer = document.querySelector('[data-testid="list-workspace-footer"]')
    const placeholder = document.querySelector('[data-testid="list-intent-placeholder"]')
    const pad = ws
      ? {
          top: parseFloat(getComputedStyle(ws).paddingTop),
          right: parseFloat(getComputedStyle(ws).paddingRight),
          bottom: parseFloat(getComputedStyle(ws).paddingBottom),
          left: parseFloat(getComputedStyle(ws).paddingLeft),
        }
      : null
    const hBox = box(how)
    const wBox = box(ws)
    const modal = Boolean(document.querySelector('[role="dialog"], [data-modal], .ReactModal__Overlay'))
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hero: box(hero),
      cards: box(cards),
      why: box(why),
      how: hBox,
      workspace: wBox,
      header: box(header),
      body: box(body),
      footer: box(footer),
      pad,
      howToWsGap: hBox && wBox ? wBox.top - hBox.bottom : null,
      placeholderDisplay: placeholder ? getComputedStyle(placeholder).display : null,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      pathname: window.location.pathname,
      intent: new URLSearchParams(window.location.search).get('intent'),
      hasModal: modal,
      title: document.querySelector('#list-workspace-title')?.textContent || null,
      hasContinue: Boolean([...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Continue')),
      hasCancel: Boolean([...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Cancel')),
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
  add('howW', m.how?.width, 1376)
  add('howH', m.how?.height, 176)
  add('howToWsGap', m.howToWsGap, 24, 1)
  add('workspaceW', m.workspace?.width, 1376)
  add('workspaceH', m.workspace?.height, 920)
  add('padX', m.pad?.left, 24, 1)
  add('headerH', m.header?.height, 64, 1)
  add('bodyH', m.body?.height, 760, 2)
  add('footerH', m.footer?.height, 72, 1)
  checks.push({ name: 'noOverflowX', actual: m.overflowX, target: false, ok: m.overflowX === false })
  checks.push({
    name: 'placeholderHidden',
    actual: m.placeholderDisplay,
    target: 'none',
    ok: m.placeholderDisplay === 'none',
  })
  checks.push({ name: 'noModal', actual: m.hasModal, target: false, ok: m.hasModal === false })
  const onList = m.pathname === '/list' || m.pathname === '/list/'
  checks.push({ name: 'onList', actual: m.pathname, target: '/list', ok: onList })
  return { pass: checks.every((c) => c.ok), checks }
}

function isListPath(pathname) {
  return pathname === '/list' || pathname === '/list/'
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const frozen = frozenIntegrity()
  fs.writeFileSync(path.join(OUT, 'frozen-modules-integrity.json'), JSON.stringify(frozen, null, 2))

  const browser = await chromium.launch({ headless: true })
  const intents = ['import-token', 'create-token', 'claim-project', 'create-project', 'ai-assistant']
  const intentResults = []

  const desk = await browser.newPage({ viewport: { width: 1440, height: 1400 } })
  await desk.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForSelector('[data-testid="list-workspace"]', { timeout: 90000 })
  await desk.waitForTimeout(1400)
  const desktopIdle = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-idle.png'), fullPage: false })
  await desk.locator('[data-testid="list-workspace"]').screenshot({
    path: path.join(OUT, 'desktop-workspace-idle.png'),
  })

  for (const intent of intents) {
    await desk.goto(`${BASE}/list?intent=${intent}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await desk.waitForSelector(`[data-testid="list-workspace"][data-list-intent="${intent}"]`, {
      timeout: 90000,
    })
    await desk.waitForTimeout(900)
    const m = await measure(desk)
    const labels = await desk.evaluate(() => document.body.innerText)
    const ok =
      isListPath(m.pathname) &&
      m.intent === intent &&
      !m.hasModal &&
      within(m.workspace?.width, 1376) &&
      within(m.workspace?.height, 920) &&
      (intent !== 'create-token' || /Coming Soon/i.test(labels))
    intentResults.push({
      intent,
      ok,
      title: m.title,
      workspace: m.workspace,
      hasContinue: m.hasContinue,
      pathname: m.pathname,
      labelOk: intent !== 'create-token' || /Coming Soon/i.test(labels),
    })
    await desk.screenshot({ path: path.join(OUT, `desktop-1440-${intent}.png`), fullPage: false })
  }

  const importMeasure = await measure(desk)
  await desk.goto(`${BASE}/list?intent=import-token`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForTimeout(800)
  const desktopImport = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440.png'), fullPage: false })
  await desk.locator('[data-testid="list-workspace"]').screenshot({
    path: path.join(OUT, 'desktop-workspace-module.png'),
  })
  await desk.close()

  const mob = await browser.newPage({ viewport: { width: 390, height: 900 } })
  await mob.goto(`${BASE}/list?intent=import-token`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="list-workspace"]', { timeout: 90000 })
  await mob.waitForTimeout(900)
  const mobile = await measure(mob)
  await mob.screenshot({ path: path.join(OUT, 'mobile-390.png'), fullPage: false })
  await mob.close()
  await browser.close()

  const deskEval = evaluateDesktop(desktopImport)
  const mobileChecks = [
    { name: 'workspaceW', ok: within(mobile.workspace?.width, 358, 2), actual: mobile.workspace?.width },
    { name: 'noOverflowX', ok: mobile.overflowX === false, actual: mobile.overflowX },
    { name: 'naturalHeight', ok: (mobile.workspace?.height ?? 0) > 200, actual: mobile.workspace?.height },
    { name: 'onList', ok: isListPath(mobile.pathname), actual: mobile.pathname },
    { name: 'noModal', ok: mobile.hasModal === false, actual: mobile.hasModal },
  ]
  const mobileOk = mobileChecks.every((c) => c.ok)

  const geometry = {
    desktopIdle,
    desktopImport,
    importMeasure,
    mobile,
    desktopChecks: deskEval,
    mobileChecks,
    intents: intentResults,
    pass: deskEval.pass && frozen.pass && intentResults.every((r) => r.ok) && mobileOk,
  }

  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(geometry, null, 2))
  fs.writeFileSync(
    path.join(OUT, 'intent-state-validation.json'),
    JSON.stringify({ pass: intentResults.every((r) => r.ok), results: intentResults }, null, 2),
  )

  const moduleShot = path.join(OUT, 'desktop-workspace-module.png')
  const overlayPath = path.join(OUT, 'desktop-overlay.png')
  const diffPath = path.join(OUT, 'desktop-diff.png')
  if (fs.existsSync(moduleShot)) {
    const py = `
from PIL import Image, ImageDraw, ImageChops, ImageEnhance
import json
img=Image.open(${JSON.stringify(moduleShot)}).convert('RGBA')
ov=img.copy(); d=ImageDraw.Draw(ov); w,h=ov.size
d.rectangle([0,0,w-1,h-1], outline=(221,185,47,220), width=2)
d.rectangle([24,11,w-25,75], outline=(245,245,245,140), width=1)
d.rectangle([24,h-83,w-25,h-12], outline=(245,245,245,140), width=1)
ov.convert('RGB').save(${JSON.stringify(overlayPath)})
plate=Image.new('RGB', (w,h), (16,16,16))
diff=ImageChops.difference(img.convert('RGB'), plate)
ImageEnhance.Brightness(diff).enhance(2.2).save(${JSON.stringify(diffPath)})
print(json.dumps({"size":[w,h]}))
`
    spawnSync('python3', ['-c', py], { encoding: 'utf8' })
  }

  console.log(JSON.stringify({ pass: geometry.pass, desktop: deskEval, intents: intentResults, frozen, mobileOk }, null, 2))
  if (!geometry.pass) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
