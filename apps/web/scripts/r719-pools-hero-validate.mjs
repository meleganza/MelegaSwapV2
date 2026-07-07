#!/usr/bin/env node
/** R719 — Featured Hero premium polish validation. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r719-pools-hero')
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
  await page.waitForSelector('[data-r719-featured-hero]', { timeout: 120000 })
  await page.waitForTimeout(4000)

  const checks = await page.evaluate(() => {
    const hero = document.querySelector('[data-r719-featured-hero]')
    const apr = hero?.querySelector('[data-ps-live-apr]')
    const donut = hero?.querySelector('[data-ps-live-donut] svg')
    const kpiBoxes = hero?.querySelectorAll('[data-ps-hero-kpi-box]').length ?? 0
    const stake = hero?.querySelector('[data-ps-stake-btn]')
    const analyze = hero?.querySelector('[data-ps-hero-analyze]')
    const heroRect = hero?.getBoundingClientRect()
    const aprRect = apr?.getBoundingClientRect()
    const donutRect = donut?.getBoundingClientRect()
    const aprStyle = apr ? window.getComputedStyle(apr) : null
    const stakeRect = stake?.getBoundingClientRect()
    const analyzeRect = analyze?.getBoundingClientRect()
    const btnRow = hero?.querySelector('[data-ps-hero-btn-row]')
    const btnRowRect = btnRow?.getBoundingClientRect()
    const heroBottom = heroRect?.bottom ?? 0

    const healthBar = hero?.querySelector('[data-ps-hero-health-bar]')
    const healthBarStyle = healthBar ? window.getComputedStyle(healthBar) : null

    const rewardRows = hero?.querySelectorAll('[data-ps-hero-reward-rows] > div').length ?? 0

    return {
      heroHeight: heroRect?.height,
      kpiBoxes,
      aprFontSize: aprStyle?.fontSize,
      aprClipped: apr ? apr.scrollWidth > apr.clientWidth + 1 : false,
      donutSize: donutRect?.width,
      aprLargerThanDonut: (aprRect?.height ?? 0) >= (donutRect?.height ?? 999) * 0.65,
      stakeW: stakeRect?.width,
      analyzeW: analyzeRect?.width,
      buttonsAligned: stakeRect && analyzeRect ? Math.abs(stakeRect.top - analyzeRect.top) < 2 : false,
      buttonsBottomAnchored: btnRowRect ? Math.abs(heroBottom - btnRowRect.bottom - 28) < 8 : false,
      healthBar96:
        Boolean(healthBar) &&
        Math.abs(parseFloat(healthBarStyle?.width ?? '0') - 96) <= 2 &&
        Math.abs(parseFloat(healthBarStyle?.height ?? '0') - 6) <= 2,
      rewardRows,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    }
  })

  await page.screenshot({ path: path.join(OUT, 'pools-r719-1440.png'), fullPage: true })
  await page.locator('[data-r719-featured-hero]').screenshot({ path: path.join(OUT, 'pools-r719-hero-closeup.png') })

  if (!checks.heroHeight || Math.abs(checks.heroHeight - 300) > 4) report.errors.push(`hero height ${checks.heroHeight}`)
  if (checks.kpiBoxes !== 4) report.errors.push(`kpi boxes ${checks.kpiBoxes}`)
  if (checks.aprClipped) report.errors.push('apr clipped')
  if ((checks.donutSize ?? 0) > 100) report.errors.push(`donut ${checks.donutSize}`)
  if (!checks.aprLargerThanDonut) report.errors.push('apr smaller than donut visually')
  if (Math.abs((checks.stakeW ?? 0) - 156) > 3) report.errors.push(`stake w ${checks.stakeW}`)
  if (!checks.buttonsAligned) report.errors.push('buttons misaligned')
  if (checks.rewardRows !== 4) report.errors.push(`reward rows ${checks.rewardRows}`)
  if (!checks.healthBar96) report.errors.push('health bar missing')
  if (checks.overflow) report.errors.push('overflow 1440')

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mobile.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mobile.waitForTimeout(3000)
  await mobile.screenshot({ path: path.join(OUT, 'pools-r719-390.png'), fullPage: true })
  const mobOverflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  )
  if (mobOverflow) report.errors.push('overflow 390')

  await browser.close()
  if (report.errors.length) report.passed = false
  fs.writeFileSync(path.join(OUT, 'R719_REPORT.json'), JSON.stringify({ ...report, checks }, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
