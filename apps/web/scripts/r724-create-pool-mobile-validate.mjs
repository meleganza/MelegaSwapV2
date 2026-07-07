#!/usr/bin/env node
/** R724 — Create Pool wizard mobile fix validation. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r724-create-pool-mobile')
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

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, errors: [] }
  if (!process.env.SCREENSHOT_BASE_URL) await buildAndStart()

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-r723-create-pool]', { timeout: 120000 })
  await page.evaluate(() => document.getElementById('create-pool')?.scrollIntoView({ block: 'start' }))
  await page.waitForTimeout(800)
  await page.locator('[data-ps-create-pool-expand]').click()
  await page.waitForTimeout(400)

  const checks = await page.evaluate(() => {
    const root = document.querySelector('[data-r723-create-pool]')
    const progress = root?.querySelector('[data-r722-wizard-progress]')
    const rewardLabel = root?.querySelector('[data-ps-wizard-step="1"] span')
    const rewardRect = rewardLabel?.getBoundingClientRect()
    const cardRect = root?.getBoundingClientRect()
    const nextBtn = root?.querySelector('[data-ps-wizard-next]')
    const cancelBtn = root?.querySelector('[data-ps-wizard-cancel], [data-ps-wizard-back]')
    const nextRect = nextBtn?.getBoundingClientRect()
    const cancelRect = cancelBtn?.getBoundingClientRect()
    const previewCol = root?.querySelector('[data-ps-create-wizard-preview]')?.parentElement
    const footer = root?.querySelector('[data-ps-wizard-footer-progress]')?.parentElement
    const footerRect = footer?.getBoundingClientRect()
    const progressStyle = progress ? window.getComputedStyle(progress) : null
    const nextStyle = nextBtn ? window.getComputedStyle(nextBtn) : null
    const cancelStyle = cancelBtn ? window.getComputedStyle(cancelBtn) : null
    const previewStyle = previewCol ? window.getComputedStyle(previewCol) : null

    const rewardLeftClipped = rewardRect && cardRect ? rewardRect.left < cardRect.left + 1 : true
    const rewardRightClipped = rewardRect && cardRect ? rewardRect.right > cardRect.right - 1 : false
    const rewardText = rewardLabel?.textContent?.trim() ?? ''

    return {
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      progressPadL: progressStyle ? parseFloat(progressStyle.paddingLeft) : 0,
      progressPadR: progressStyle ? parseFloat(progressStyle.paddingRight) : 0,
      progressOverflowX: progressStyle?.overflowX,
      rewardText,
      rewardFullyVisible:
        !rewardLeftClipped && !rewardRightClipped && rewardText === 'Reward' && (rewardRect?.width ?? 0) > 20,
      nextW: nextRect?.width,
      nextH: nextRect?.height,
      nextMaxWidth: nextStyle?.maxWidth,
      cancelBelowNext: cancelRect && nextRect ? cancelRect.top >= nextRect.bottom - 1 : false,
      cancelGap: cancelRect && nextRect ? cancelRect.top - nextRect.bottom : 0,
      previewMarginTop: previewStyle ? parseFloat(previewStyle.marginTop) : 0,
      footerBottomGap: footerRect ? window.innerHeight - footerRect.bottom : 0,
      footerVisible: footerRect ? footerRect.bottom <= window.innerHeight && footerRect.top > 0 : false,
    }
  })

  await page.evaluate(() => {
    const footer = document.querySelector('[data-ps-wizard-footer-progress]')
    footer?.scrollIntoView({ block: 'end' })
  })
  await page.waitForTimeout(400)
  await page.locator('[data-r723-create-pool]').screenshot({ path: path.join(OUT, 'wizard-mobile-390.png') })

  if (checks.overflowX) report.errors.push('horizontal overflow')
  if (Math.abs(checks.progressPadL - 16) > 1 || Math.abs(checks.progressPadR - 16) > 1) {
    report.errors.push(`progress padding ${checks.progressPadL}/${checks.progressPadR}`)
  }
  if (checks.progressOverflowX !== 'auto') report.errors.push(`progress scroll ${checks.progressOverflowX}`)
  if (!checks.rewardFullyVisible) report.errors.push(`reward label clipped (${checks.rewardText})`)
  if (checks.nextW && checks.nextW < 280) report.errors.push(`next width ${checks.nextW}`)
  if (checks.nextH && Math.abs(checks.nextH - 46) > 2) report.errors.push(`next height ${checks.nextH}`)
  if (checks.nextMaxWidth && checks.nextMaxWidth !== 'none') report.errors.push(`next max-width ${checks.nextMaxWidth}`)
  if (!checks.cancelBelowNext) report.errors.push('cancel/back not below next')
  if (checks.cancelGap && (checks.cancelGap < 8 || checks.cancelGap > 12)) {
    report.errors.push(`cancel gap ${checks.cancelGap}`)
  }
  if (Math.abs(checks.previewMarginTop - 24) > 1) report.errors.push(`preview margin ${checks.previewMarginTop}`)

  const footerPad = await page.evaluate(() => {
    const footer = document.querySelector('[data-ps-wizard-footer-progress]')?.parentElement
    const style = footer ? window.getComputedStyle(footer) : null
    return style ? parseFloat(style.paddingBottom) : 0
  })
  if (footerPad < 96) report.errors.push(`footer padding-bottom ${footerPad}`)

  await browser.close()

  report.passed = report.errors.length === 0
  fs.writeFileSync(path.join(OUT, 'validation-result.json'), JSON.stringify({ ...report, checks, footerPad }, null, 2))
  console.log(report.passed ? 'PASS' : 'FAIL')
  if (report.errors.length) console.log(report.errors.join('\n'))
  console.log(`Screenshot: ${path.join(OUT, 'wizard-mobile-390.png')}`)
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
