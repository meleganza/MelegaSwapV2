#!/usr/bin/env node
/** R720 — Featured Hero final balance validation. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r720-pools-hero')
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
  await page.waitForSelector('[data-r720-featured-hero]', { timeout: 120000 })
  await page.waitForTimeout(4000)

  const checks = await page.evaluate(() => {
    const hero = document.querySelector('[data-r720-featured-hero]')
    const apr = hero?.querySelector('[data-ps-live-apr]')
    const name = hero?.querySelector('[data-ps-live-pool-name]')
    const badges = hero?.querySelector('[data-ps-hero-badges]')
    const donut = hero?.querySelector('[data-ps-live-donut] svg')
    const divider = hero?.querySelector('[aria-hidden]')?.style?.background === '#262626'
    const hasDividerEl = hero ? [...hero.querySelectorAll('div')].some((el) => {
      const s = window.getComputedStyle(el)
      return s.width === '1px' && parseFloat(s.height) > 100 && s.backgroundColor !== 'rgba(0, 0, 0, 0)'
    }) : false
    const kpiBoxes = hero?.querySelectorAll('[data-ps-hero-kpi-box]').length ?? 0
    const stake = hero?.querySelector('[data-ps-stake-btn]')
    const analyze = hero?.querySelector('[data-ps-hero-analyze]')
    const heroRect = hero?.getBoundingClientRect()
    const aprRect = apr?.getBoundingClientRect()
    const donutRect = donut?.getBoundingClientRect()
    const nameRect = name?.getBoundingClientRect()
    const badgesRect = badges?.getBoundingClientRect()
    const badgesOnTitleRow = nameRect && badgesRect ? Math.abs(nameRect.top - badgesRect.top) < 4 : false
    const healthBar = hero?.querySelector('[data-ps-hero-health-bar]')
    const healthBarStyle = healthBar ? window.getComputedStyle(healthBar) : null

    return {
      heroHeight: heroRect?.height,
      kpiBoxes,
      donutSize: donutRect?.width,
      aprClipped: apr ? apr.scrollWidth > apr.clientWidth + 1 : false,
      aprLargerThanDonut: (aprRect?.height ?? 0) >= (donutRect?.height ?? 999) * 0.65,
      hasDividerEl,
      badgesOnTitleRow,
      healthBar96:
        Boolean(healthBar) &&
        Math.abs(parseFloat(healthBarStyle?.width ?? '0') - 96) <= 2 &&
        Math.abs(parseFloat(healthBarStyle?.height ?? '0') - 6) <= 2,
      stakeW: stake?.getBoundingClientRect().width,
      buttonsAligned: stake && analyze ? Math.abs(stake.getBoundingClientRect().top - analyze.getBoundingClientRect().top) < 2 : false,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    }
  })

  await page.screenshot({ path: path.join(OUT, 'pools-r720-1440.png'), fullPage: true })
  await page.locator('[data-r720-featured-hero]').screenshot({ path: path.join(OUT, 'pools-r720-hero-closeup.png') })

  if (checks.heroHeight && Math.abs(checks.heroHeight - 300) > 4) report.errors.push(`height ${checks.heroHeight}`)
  if ((checks.donutSize ?? 0) > 88) report.errors.push(`donut ${checks.donutSize}`)
  if (checks.hasDividerEl) report.errors.push('divider exists')
  if (checks.badgesOnTitleRow) report.errors.push('badges on title row')
  if (checks.aprClipped) report.errors.push('apr clipped')
  if (checks.kpiBoxes !== 4) report.errors.push(`kpi ${checks.kpiBoxes}`)
  if (!checks.aprLargerThanDonut) report.errors.push('apr smaller than donut')
  if (!checks.healthBar96) report.errors.push('health bar missing')

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mobile.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mobile.waitForTimeout(3000)
  await mobile.screenshot({ path: path.join(OUT, 'pools-r720-390.png'), fullPage: true })
  if (await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)) {
    report.errors.push('overflow 390')
  }

  await browser.close()
  if (report.errors.length) report.passed = false
  fs.writeFileSync(path.join(OUT, 'R720_REPORT.json'), JSON.stringify({ ...report, checks }, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
