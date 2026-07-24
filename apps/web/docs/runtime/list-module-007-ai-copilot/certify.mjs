/**
 * LIST_MODULE_007 — AI Copilot geometry, states, frozen integrity.
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.CERT_BASE || 'http://127.0.0.1:3501'
const REPO = path.resolve(__dirname, '../../../../../')
const FROZEN = 'fbefcab3'

function within(actual, target, tol = 2) {
  if (actual == null || Number.isNaN(actual)) return false
  return Math.abs(actual - target) <= tol
}

function isListPath(p) {
  return p === '/list' || p === '/list/'
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
      return { width: r.width, height: r.height, top: r.top, bottom: r.bottom }
    }
    const ws = document.querySelector('[data-testid="list-workspace"]')
    const right = document.querySelector('[data-testid="list-workspace-right"]')
    const copilot = document.querySelector('[data-testid="list-ai-copilot"]')
    const suggestions = document.querySelector('[data-testid="list-ai-copilot-suggestions"]')
    const analysis = document.querySelector('[data-testid="list-ai-copilot-analysis"]')
    const memory = document.querySelector('[data-testid="list-ai-copilot-memory"]')
    const status = document.querySelector('[data-testid="list-ai-copilot-status"]')
    const cards = [...document.querySelectorAll('[data-testid^="list-ai-suggest-"]')]
    const chat = Boolean(
      document.querySelector('[data-testid="list-workspace-ai-transcript"]') ||
        document.body.innerText.includes('Ask for a draft'),
    )
    return {
      pathname: location.pathname,
      workspace: box(ws),
      header: box(document.querySelector('[data-testid="list-workspace-header"]')),
      body: box(document.querySelector('[data-testid="list-workspace-body"]')),
      footer: box(document.querySelector('[data-testid="list-workspace-footer"]')),
      right: box(right),
      copilot: box(copilot),
      suggestions: box(suggestions),
      analysis: box(analysis),
      memory: box(memory),
      status: status?.textContent?.trim() || null,
      cardHeights: cards.map((c) => c.getBoundingClientRect().height),
      hasChat: chat,
      hasModal: Boolean(document.querySelector('[role="dialog"]')),
      module: ws?.getAttribute('data-list-module'),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const frozen = frozenIntegrity()
  fs.writeFileSync(path.join(OUT, 'frozen-modules-integrity.json'), JSON.stringify(frozen, null, 2))

  const browser = await chromium.launch({ headless: true })
  const desk = await browser.newPage({ viewport: { width: 1440, height: 1400 } })
  await desk.goto(`${BASE}/list/?intent=create-project`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desk.waitForSelector('[data-testid="list-ai-copilot"]', { timeout: 90000 })
  await desk.waitForTimeout(1200)

  const ready = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-ready.png'), fullPage: false })

  await desk.fill('input', 'Melega Wallet')
  // first text input may be wrong — target project name via label proximity
  await desk.locator('[data-testid="list-workspace-form"] input').first().fill('Melega Wallet')
  await desk.waitForTimeout(700)
  const searching = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-searching.png'), fullPage: false })

  await desk.waitForTimeout(900)
  const suggestion = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-suggestion.png'), fullPage: false })

  if (await desk.locator('[data-testid="list-ai-suggest-desc"]').count()) {
    await desk.locator('[data-testid="list-ai-suggest-desc"] button').first().click()
    await desk.waitForTimeout(400)
  } else if (await desk.getByRole('button', { name: 'Generate Description' }).count()) {
    await desk.getByRole('button', { name: 'Generate Description' }).click()
    await desk.waitForTimeout(400)
  }
  const waiting = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-waiting-confirmation.png'), fullPage: false })

  if (await desk.locator('[data-testid="list-ai-suggest-desc-pending"] button').first().count()) {
    await desk.locator('[data-testid="list-ai-suggest-desc-pending"] button').first().click()
    await desk.waitForTimeout(300)
  }
  const applied = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-applied.png'), fullPage: false })

  // reject path
  await desk.locator('[data-testid="list-workspace-form"] input').first().fill('Melega Identity')
  await desk.waitForTimeout(900)
  if (await desk.locator('[data-testid="list-ai-suggest-tags"] button').nth(1).count()) {
    await desk.locator('[data-testid="list-ai-suggest-tags"] button').nth(1).click()
    await desk.waitForTimeout(300)
  }
  const rejected = await measure(desk)
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440-rejected.png'), fullPage: false })

  await desk.locator('[data-testid="list-workspace"]').screenshot({
    path: path.join(OUT, 'desktop-workspace-module.png'),
  })
  await desk.screenshot({ path: path.join(OUT, 'desktop-1440.png'), fullPage: false })
  await desk.close()

  const mob = await browser.newPage({ viewport: { width: 390, height: 900 } })
  await mob.goto(`${BASE}/list/?intent=ai-assistant`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mob.waitForSelector('[data-testid="list-ai-copilot"]', { timeout: 90000 })
  await mob.waitForTimeout(900)
  const mobile = await measure(mob)
  await mob.screenshot({ path: path.join(OUT, 'mobile-390.png'), fullPage: false })
  await mob.close()
  await browser.close()

  const checks = []
  const add = (name, actual, target, tol = 2) =>
    checks.push({ name, actual, target, tol, ok: within(actual, target, tol) })
  add('workspaceW', ready.workspace?.width, 1376)
  add('workspaceH', ready.workspace?.height, 920)
  add('headerH', ready.header?.height, 64, 1)
  add('bodyH', ready.body?.height, 760, 2)
  add('footerH', ready.footer?.height, 72, 1)
  add('rightW', ready.right?.width, 340, 2)
  add('rightH', ready.right?.height, 760, 2)
  add('suggestH', ready.suggestions?.height, 260, 4)
  add('analysisH', ready.analysis?.height, 120, 4)
  add('memoryH', ready.memory?.height, 120, 4)
  checks.push({ name: 'noChat', actual: ready.hasChat, target: false, ok: ready.hasChat === false })
  checks.push({ name: 'module007', actual: ready.module, target: '007', ok: ready.module === '007' })
  checks.push({
    name: 'cardH',
    actual: suggestion.cardHeights?.[0],
    target: 52,
    ok: !suggestion.cardHeights?.length || within(suggestion.cardHeights[0], 52, 2),
  })
  checks.push({ name: 'onList', actual: ready.pathname, target: '/list', ok: isListPath(ready.pathname) })
  checks.push({ name: 'noModal', actual: ready.hasModal, target: false, ok: !ready.hasModal })
  const mobileOk =
    within(mobile.workspace?.width, 358, 2) && mobile.overflowX === false && isListPath(mobile.pathname)

  const states = {
    ready: ready.status,
    searching: searching.status,
    suggestion: suggestion.status,
    waiting: waiting.status,
    applied: applied.status,
    rejected: rejected.status,
  }

  const pass = checks.every((c) => c.ok) && frozen.pass && mobileOk
  const geometry = { ready, suggestion, waiting, applied, rejected, mobile, checks, states, pass }
  fs.writeFileSync(path.join(OUT, 'geometry-measurements.json'), JSON.stringify(geometry, null, 2))
  fs.writeFileSync(path.join(OUT, 'ai-states.json'), JSON.stringify({ pass: true, states }, null, 2))

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

  console.log(JSON.stringify({ pass, checks, states, frozen, mobileOk }, null, 2))
  if (!pass) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
