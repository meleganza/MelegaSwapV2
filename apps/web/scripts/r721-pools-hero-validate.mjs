#!/usr/bin/env node
/** R721 — Featured Hero enterprise polish validation. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r721-pools-hero')
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
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-r721-featured-hero]', { timeout: 120000 })
  await page.waitForTimeout(4000)

  const checks = await page.evaluate(() => {
    const hero = document.querySelector('[data-r721-featured-hero]')
    const apr = hero?.querySelector('[data-ps-live-apr]')
    const donut = hero?.querySelector('[data-ps-live-donut] svg')
    const donutCenter = hero?.querySelector('[data-ps-donut-health-center]')
    const healthBelowDonut = hero?.querySelector('[data-ps-hero-health-bar]')
    const allocationText = hero?.querySelector('[data-ps-featured-allocation]')?.textContent ?? ''
    const healthTextUnderDonut = /Health\s+\d+\s*\/\s*100/i.test(allocationText.replace(donutCenter?.textContent ?? '', ''))
    const aprStyle = apr ? window.getComputedStyle(apr) : null
    const kpi = hero?.querySelector('[data-ps-hero-kpi-box]')
    const kpiRect = kpi?.getBoundingClientRect()
    const stake = hero?.querySelector('[data-ps-stake-btn]')
    const stakeRect = stake?.getBoundingClientRect()

    return {
      heroHeight: hero?.getBoundingClientRect().height,
      donutSize: donut?.getBoundingClientRect().width,
      aprFontSize: aprStyle?.fontSize,
      donutCenterScore: donutCenter?.querySelector('[data-ps-donut-health-score]')?.textContent?.trim(),
      donutCenterLabel: donutCenter?.textContent?.includes('HEALTH'),
      healthTextUnderDonut,
      healthBarW: healthBelowDonut?.getBoundingClientRect().width,
      healthBarH: healthBelowDonut?.getBoundingClientRect().height,
      kpiCount: hero?.querySelectorAll('[data-ps-hero-kpi-box]').length ?? 0,
      stakeW: stakeRect?.width,
      stakeH: stakeRect?.height,
    }
  })

  await page.screenshot({ path: path.join(OUT, 'pools-r721-1440.png'), fullPage: true })
  await page.locator('[data-r721-featured-hero]').screenshot({ path: path.join(OUT, 'pools-r721-hero-closeup.png') })

  if (checks.heroHeight && Math.abs(checks.heroHeight - 300) > 4) report.errors.push(`height ${checks.heroHeight}`)
  if ((checks.donutSize ?? 0) > 88) report.errors.push(`donut ${checks.donutSize}`)
  if (checks.aprFontSize !== '64px') report.errors.push(`apr ${checks.aprFontSize}`)
  if (checks.healthTextUnderDonut) report.errors.push('health text under donut')
  if (!checks.donutCenterLabel) report.errors.push('donut center missing')
  if (Math.abs((checks.healthBarW ?? 0) - 96) > 2) report.errors.push(`health bar w ${checks.healthBarW}`)
  if (checks.kpiCount !== 4) report.errors.push(`kpi ${checks.kpiCount}`)

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mobile.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mobile.waitForTimeout(3000)
  await mobile.screenshot({ path: path.join(OUT, 'pools-r721-390.png'), fullPage: true })

  await browser.close()
  if (report.errors.length) report.passed = false
  fs.writeFileSync(path.join(OUT, 'R721_REPORT.json'), JSON.stringify({ ...report, checks }, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
