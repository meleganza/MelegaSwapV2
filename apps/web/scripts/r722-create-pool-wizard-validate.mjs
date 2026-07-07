#!/usr/bin/env node
/** R722 — Create Pool wizard enterprise UX validation. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r722-create-pool-wizard')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

function killPort(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' })
  } catch {
    /* ignore */
  }
}

function buildAndStart() {
  killPort(3000)
  const env = { ...process.env, NEXT_PUBLIC_POOLS_UX_FIXTURE: '1' }
  execSync('yarn build', { cwd: WEB, stdio: 'inherit', env })
  const child = spawn('yarn', ['start', '-p', '3000'], { cwd: WEB, env, stdio: 'ignore', detached: true })
  child.unref()
  return new Promise((r) => setTimeout(r, 8000))
}

async function countVisibleFields(page) {
  return page.evaluate(() => {
    const fields = Array.from(document.querySelectorAll('[data-ps-create-pool-grid] [data-ps-create-field]'))
    return fields.filter((el) => {
      const r = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      return r.width > 0 && r.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
    }).length
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, errors: [] }
  if (!process.env.SCREENSHOT_BASE_URL) await buildAndStart()

  const browser = await chromium.launch()
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await desktop.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desktop.waitForSelector('[data-r722-create-pool-wizard]', { timeout: 120000 })
  await desktop.locator('[data-ps-header-create-pool], [data-ps-create-pool-btn]').first().click({ timeout: 5000 }).catch(() => {})
  await desktop.evaluate(() => document.getElementById('create-pool')?.scrollIntoView({ block: 'center' }))
  await desktop.waitForTimeout(1500)
  await desktop.locator('[data-ps-create-pool-expand]').click({ timeout: 10000 })
  await desktop.waitForTimeout(400)

  const wizard = desktop.locator('[data-r722-create-pool-wizard]')
  await wizard.screenshot({ path: path.join(OUT, 'wizard-step-1-desktop.png') })

  const step1 = await desktop.evaluate(() => {
    const root = document.querySelector('[data-r722-create-pool-wizard]')
    const progress = root?.querySelector('[data-r722-wizard-progress]')
    const preview = root?.querySelector('[data-ps-create-wizard-preview]')
    const footer = root?.querySelector('[data-ps-wizard-footer-progress]')
    const circle = progress?.querySelector('[data-ps-wizard-step="1"] [class]')
    const progressRect = progress?.getBoundingClientRect()
    const previewRect = preview?.getBoundingClientRect()
    const hero = document.querySelector('[data-r721-featured-hero], [data-ps-featured-hero]')
    const sidebar = document.querySelector('[data-ps-pools-sidebar]')
    const explorer = document.querySelector('[data-ps-pool-explorer]')
    const card = document.querySelector('[data-ps-pool-card]')
    return {
      progressH: progressRect?.height,
      previewW: previewRect?.width,
      footerText: footer?.textContent?.trim(),
      hasPreviewApr: Boolean(root?.querySelector('[data-ps-wizard-preview-apr]')),
      heroUntouched: Boolean(hero),
      sidebarUntouched: Boolean(sidebar),
      explorerUntouched: Boolean(explorer),
      cardUntouched: Boolean(card),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      circleTransition: circle ? window.getComputedStyle(circle).transitionDuration : '',
    }
  })

  const step1Fields = await countVisibleFields(desktop)
  if (step1Fields > 4) report.errors.push(`step1 fields ${step1Fields}`)
  if (step1.progressH && Math.abs(step1.progressH - 44) > 6) report.errors.push(`progress height ${step1.progressH}`)
  if (step1.previewW && Math.abs(step1.previewW - 320) > 4) report.errors.push(`preview width ${step1.previewW}`)
  if (!step1.footerText?.includes('Step 1 / 5')) report.errors.push('footer step missing')
  if (!step1.hasPreviewApr) report.errors.push('preview apr missing')
  if (step1.overflowX) report.errors.push('horizontal overflow')

  const rewardBefore = await desktop.evaluate(() => {
    const btns = document.querySelectorAll('[data-ps-create-token-select]')
    return Array.from(btns).map((b) => b.textContent?.trim())
  })

  await desktop.locator('[data-ps-wizard-next]').click()
  await desktop.waitForTimeout(400)
  await desktop.fill('[aria-label="Daily Rewards"]', '777')
  await desktop.locator('[data-ps-wizard-next]').click()
  await desktop.waitForTimeout(400)

  const step3Fields = await countVisibleFields(desktop)
  await wizard.screenshot({ path: path.join(OUT, 'wizard-step-3-desktop.png') })
  if (step3Fields > 4) report.errors.push(`step3 fields ${step3Fields}`)

  await desktop.locator('[data-ps-wizard-next]').click()
  await desktop.waitForTimeout(400)
  await desktop.locator('[data-ps-wizard-next]').click()
  await desktop.waitForTimeout(400)
  await desktop.locator('[data-ps-wizard-next]').click()
  await desktop.waitForTimeout(400)

  const step5 = await desktop.evaluate(() => {
    const root = document.querySelector('[data-r722-create-pool-wizard]')
    const review = root?.querySelector('[data-ps-wizard-review]')
    const createBtn = root?.querySelector('[data-ps-create-pool-btn]')
    const createRect = createBtn?.getBoundingClientRect()
    return {
      reviewH: review?.getBoundingClientRect().height,
      createW: createRect?.width,
      createH: createRect?.height,
      hasJson: Boolean(root?.querySelector('[data-ps-create-machine-preview], [data-ps-create-machine-preview] + pre, pre')),
    }
  })
  await wizard.screenshot({ path: path.join(OUT, 'wizard-step-5-desktop.png') })
  if (!step5.reviewH || step5.reviewH < 80) report.errors.push('review summary missing')
  if (step5.createW && Math.abs(step5.createW - 220) > 6) report.errors.push(`create btn w ${step5.createW}`)
  if (step5.createH && Math.abs(step5.createH - 50) > 6) report.errors.push(`create btn h ${step5.createH}`)

  await desktop.locator('[data-ps-wizard-back]').click()
  await desktop.waitForTimeout(300)
  await desktop.locator('[data-ps-wizard-back]').click()
  await desktop.waitForTimeout(300)
  await desktop.locator('[data-ps-wizard-back]').click()
  await desktop.waitForTimeout(300)
  await desktop.locator('[data-ps-wizard-back]').click()
  await desktop.waitForTimeout(300)
  const preservedDaily = await desktop.inputValue('[aria-label="Daily Rewards"]')
  if (preservedDaily !== '777') report.errors.push(`state lost on back (${preservedDaily})`)

  await desktop.screenshot({ path: path.join(OUT, 'pools-r722-1440.png'), fullPage: true })

  const mobile = await browser.newPage({ viewport: { width: 390, height: 900 } })
  await mobile.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mobile.waitForSelector('[data-r722-create-pool-wizard]', { timeout: 120000 })
  await mobile.evaluate(() => document.getElementById('create-pool')?.scrollIntoView({ block: 'start' }))
  await mobile.waitForTimeout(1200)
  await mobile.locator('[data-ps-create-pool-expand]').click({ timeout: 10000 })
  await mobile.waitForTimeout(400)
  await mobile.locator('[data-r722-create-pool-wizard]').screenshot({ path: path.join(OUT, 'wizard-step-1-mobile.png') })

  const mobileChecks = await mobile.evaluate(() => {
    const root = document.querySelector('[data-r722-create-pool-wizard]')
    const preview = root?.querySelector('[data-ps-create-wizard-preview]')
    const progress = root?.querySelector('[data-r722-wizard-progress]')
    const body = root?.querySelector('[data-ps-create-pool-wizard-body]')
    const previewTop = preview?.getBoundingClientRect().top ?? 0
    const gridTop = root?.querySelector('[data-ps-create-pool-grid]')?.getBoundingClientRect().top ?? 0
    return {
      previewBelow: previewTop > gridTop,
      progressScroll: progress ? window.getComputedStyle(progress).overflowX : '',
      stickyNext: Boolean(root?.querySelector('[data-ps-wizard-actions]')),
    }
  })
  if (!mobileChecks.previewBelow) report.errors.push('mobile preview not below')
  if (mobileChecks.progressScroll !== 'auto') report.errors.push('progress not scrollable on mobile')

  await browser.close()

  report.passed = report.errors.length === 0
  const resultPath = path.join(OUT, 'validation-result.json')
  fs.writeFileSync(resultPath, JSON.stringify({ ...report, step1Fields, step3Fields, step1, step5, mobileChecks }, null, 2))
  console.log(report.passed ? 'PASS' : 'FAIL')
  if (report.errors.length) console.log(report.errors.join('\n'))
  console.log(`Screenshots: ${OUT}`)
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
