#!/usr/bin/env node
/** R723 — Create Pool wizard activation model validation. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r723-create-pool-activation')
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
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await desktop.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await desktop.waitForSelector('[data-r723-create-pool]', { timeout: 120000 })
  await desktop.evaluate(() => document.getElementById('create-pool')?.scrollIntoView({ block: 'center' }))
  await desktop.waitForTimeout(1200)

  const card = desktop.locator('[data-r723-create-pool]')

  const defaultState = await desktop.evaluate(() => {
    const root = document.querySelector('[data-r723-create-pool]')
    const rect = root?.getBoundingClientRect()
    return {
      height: rect?.height,
      compact: root?.hasAttribute('data-r723-create-pool-compact') ?? false,
      expanded: root?.hasAttribute('data-r723-create-pool-expanded') ?? false,
      wizardProgress: Boolean(root?.querySelector('[data-r722-wizard-progress]')),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    }
  })

  await card.screenshot({ path: path.join(OUT, 'create-pool-compact-desktop.png') })

  if (!defaultState.compact) report.errors.push('compact card missing on load')
  if (defaultState.expanded) report.errors.push('wizard expanded by default')
  if (defaultState.wizardProgress) report.errors.push('wizard progress visible by default')
  if (defaultState.height && defaultState.height > 192) report.errors.push(`compact height ${defaultState.height}`)
  if (defaultState.overflowX) report.errors.push('horizontal overflow')

  await desktop.locator('[data-ps-create-pool-expand]').click()
  await desktop.waitForTimeout(350)

  const expanded = await desktop.evaluate(() => {
    const root = document.querySelector('[data-r723-create-pool]')
    return {
      expanded: root?.hasAttribute('data-r723-create-pool-expanded') ?? false,
      closeBtn: Boolean(root?.querySelector('[data-ps-create-pool-close]')),
      previewSticky: (() => {
        const col = root?.querySelector('[data-ps-create-wizard-preview]')?.parentElement
        return col ? window.getComputedStyle(col).position === 'sticky' : false
      })(),
    }
  })

  if (!expanded.expanded) report.errors.push('click did not expand wizard')
  if (!expanded.closeBtn) report.errors.push('close button missing')

  await card.screenshot({ path: path.join(OUT, 'wizard-step-1-expanded-desktop.png') })

  await desktop.locator('[data-ps-wizard-next]').click()
  await desktop.waitForTimeout(250)
  await desktop.fill('[aria-label="Daily Rewards"]', '888')
  await desktop.locator('[data-ps-create-pool-close]').click()
  await desktop.waitForTimeout(300)
  await desktop.locator('[data-ps-create-pool-expand]').click()
  await desktop.waitForTimeout(350)
  const preserved = await desktop.inputValue('[aria-label="Daily Rewards"]')
  if (preserved !== '888') report.errors.push(`state not preserved (${preserved})`)

  await desktop.locator('[data-ps-wizard-next]').click()
  await desktop.waitForTimeout(200)
  await desktop.locator('[data-ps-wizard-next]').click()
  await desktop.waitForTimeout(200)
  await desktop.locator('[data-ps-wizard-next]').click()
  await desktop.waitForTimeout(200)
  await desktop.locator('[data-ps-wizard-next]').click()
  await desktop.waitForTimeout(300)

  const step5 = await desktop.evaluate(() => {
    const root = document.querySelector('[data-r723-create-pool]')
    const ready = root?.querySelector('[data-ps-wizard-pool-ready]')?.textContent ?? ''
    const back = root?.querySelector('[data-ps-wizard-back]')
    const backRect = back?.getBoundingClientRect()
    const grid = root?.querySelector('[data-ps-wizard-review] > div')
    return {
      poolReady: /Pool Ready/i.test(ready),
      backW: backRect?.width,
      backH: backRect?.height,
      gridCols: grid ? window.getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0,
      machineStatus: root?.querySelector('[data-ps-wizard-review]')?.textContent?.includes('Machine Status'),
    }
  })

  await card.screenshot({ path: path.join(OUT, 'wizard-step-5-desktop.png') })
  if (!step5.poolReady) report.errors.push('step 5 missing Pool Ready')
  if (step5.backW && Math.abs(step5.backW - 96) > 6) report.errors.push(`back btn w ${step5.backW}`)
  if (step5.backH && Math.abs(step5.backH - 50) > 6) report.errors.push(`back btn h ${step5.backH}`)
  if (step5.gridCols < 2) report.errors.push('review not 2 columns')
  if (!step5.machineStatus) report.errors.push('machine status row missing')

  await desktop.locator('[data-ps-create-pool-close]').click()
  await desktop.waitForTimeout(300)
  const collapsed = await desktop.evaluate(() => {
    const root = document.querySelector('[data-r723-create-pool]')
    return root?.hasAttribute('data-r723-create-pool-compact') ?? false
  })
  if (!collapsed) report.errors.push('close did not collapse wizard')

  if (expanded.previewSticky) {
    /* desktop sticky ok */
  }

  const mobile = await browser.newPage({ viewport: { width: 390, height: 900 } })
  await mobile.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mobile.waitForSelector('[data-r723-create-pool]', { timeout: 120000 })
  await mobile.evaluate(() => document.getElementById('create-pool')?.scrollIntoView({ block: 'start' }))
  await mobile.waitForTimeout(1000)
  await mobile.locator('[data-r723-create-pool]').screenshot({ path: path.join(OUT, 'create-pool-compact-mobile.png') })
  await mobile.locator('[data-ps-create-pool-expand]').click()
  await mobile.waitForTimeout(350)
  await mobile.locator('[data-r723-create-pool]').screenshot({ path: path.join(OUT, 'wizard-expanded-mobile.png') })

  const mobileChecks = await mobile.evaluate(() => {
    const root = document.querySelector('[data-r723-create-pool]')
    const col = root?.querySelector('[data-ps-create-wizard-preview]')?.parentElement
    const gridTop = root?.querySelector('[data-ps-create-pool-grid]')?.getBoundingClientRect().top ?? 0
    const previewTop = root?.querySelector('[data-ps-create-wizard-preview]')?.getBoundingClientRect().top ?? 0
    return {
      previewBelow: previewTop > gridTop,
      sticky: col ? window.getComputedStyle(col).position === 'sticky' : false,
    }
  })
  if (!mobileChecks.previewBelow) report.errors.push('mobile preview not below step')
  if (mobileChecks.sticky) report.errors.push('mobile preview should not be sticky')

  await browser.close()

  report.passed = report.errors.length === 0
  fs.writeFileSync(
    path.join(OUT, 'validation-result.json'),
    JSON.stringify({ ...report, defaultState, expanded, step5, mobileChecks, preserved }, null, 2),
  )
  console.log(report.passed ? 'PASS' : 'FAIL')
  if (report.errors.length) console.log(report.errors.join('\n'))
  console.log(`Screenshots: ${OUT}`)
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
