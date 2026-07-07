#!/usr/bin/env node
/** R718 — Pool card micro-polish validation. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r718-pools-live-cards')
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
  await page.waitForSelector('[data-r718-pool-card]', { timeout: 120000 })
  await page.waitForTimeout(4000)

  const collapsed = await page.evaluate(() => {
    const card = document.querySelector('[data-r718-pool-card]')
    const grid = document.querySelector('[data-r717-pool-grid]')
    const info = card?.querySelector('[data-ps-collapsed-info]')
    const cells = info ? info.querySelectorAll(':scope > div').length : 0
    const apr = card?.querySelector('[data-ps-pool-apr]')
    const aprStyle = apr ? window.getComputedStyle(apr) : null
    const title = card?.querySelector('[data-ps-pool-name]')
    const footer = card?.querySelector('[data-ps-card-footer]')
    const stake = card?.querySelector('[data-ps-stake-btn]')
    const analyze = card?.querySelector('[data-ps-analyze-toggle]')
    const cardRect = card?.getBoundingClientRect()
    const footerStyle = footer ? window.getComputedStyle(footer) : null
    const healthBar = card?.querySelector('[data-ps-pool-health] div[style], [data-ps-pool-health] div')
    const bars = card
      ? [...card.querySelectorAll('div')].filter((el) => {
          const s = window.getComputedStyle(el)
          return s.width === '64px' && s.height === '5px'
        })
      : []
    const text = card?.textContent ?? ''
    const hasDurationCollapsed = info?.textContent?.includes('Duration')
    const hasDailyCollapsed = info?.textContent?.match(/Daily Rewards/i)
    const hasContractCollapsed = info?.textContent?.includes('Contract')
    const gridCols = grid ? window.getComputedStyle(grid).gridTemplateColumns : ''

    const overlaps = (() => {
      if (!footer || !info) return false
      const fr = footer.getBoundingClientRect()
      const ir = info.getBoundingClientRect()
      return ir.bottom > fr.top - 2
    })()

    return {
      collapsedCells: cells,
      aprFontSize: aprStyle?.fontSize,
      aprLineHeight: aprStyle?.lineHeight,
      titleWraps: title ? title.scrollHeight > 30 : false,
      aprClipped: apr ? apr.scrollWidth > apr.clientWidth + 1 : false,
      cardHeight: cardRect?.height,
      footerPosition: footerStyle?.position,
      stakeW: stake?.getBoundingClientRect().width,
      analyzeW: analyze?.getBoundingClientRect().width,
      stakeH: stake?.getBoundingClientRect().height,
      healthBar64: bars.length > 0,
      hasDurationCollapsed,
      hasDailyCollapsed,
      hasContractCollapsed,
      threeCols: (gridCols.match(/312px/g) ?? []).length === 3,
      overlaps,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    }
  })

  await page.screenshot({ path: path.join(OUT, 'pools-r718-1440.png'), fullPage: true })

  if (collapsed.collapsedCells !== 4) report.errors.push(`collapsed cells ${collapsed.collapsedCells}`)
  if (collapsed.hasDurationCollapsed) report.errors.push('duration in collapsed')
  if (collapsed.hasDailyCollapsed) report.errors.push('daily in collapsed')
  if (collapsed.hasContractCollapsed) report.errors.push('contract in collapsed')
  if (collapsed.overlaps) report.errors.push('content overlaps buttons')
  if (collapsed.titleWraps) report.errors.push('title wraps')
  if (collapsed.aprClipped) report.errors.push('apr clipped')
  if (!collapsed.healthBar64) report.errors.push('health bar missing')
  if (collapsed.footerPosition !== 'absolute') report.errors.push('footer not absolute')
  if (Math.abs((collapsed.stakeW ?? 0) - 132) > 2) report.errors.push(`stake width ${collapsed.stakeW}`)
  if (!collapsed.threeCols) report.errors.push('not 3 columns')

  await page.click('[data-ps-analyze-toggle]')
  await page.waitForTimeout(400)

  const expanded = await page.evaluate(() => {
    const card = document.querySelector('[data-r718-pool-card]')
    const rect = card?.getBoundingClientRect()
    const toggle = document.querySelector('[data-ps-analyze-toggle]')?.textContent?.trim()
    const bsc = document.querySelector('[data-ps-bscscan-btn]')
    const machine = document.querySelector('[data-ps-machine-json-btn]')
  const heading = document.querySelector('[data-ps-pool-analyze-panel]')?.textContent?.includes('Pool Analysis')
    const gridCells = document.querySelector('[data-ps-pool-analyze-panel] [class]')
    const analysisGrid = document.querySelector('[data-ps-pool-analyze-panel] > div:last-child')
    const cells = analysisGrid ? analysisGrid.querySelectorAll(':scope > div').length : 0
    return {
      height: rect?.height,
      toggle,
      bsc: Boolean(bsc),
      machine: Boolean(machine),
      heading,
      analysisCells: cells,
    }
  })

  await page.screenshot({ path: path.join(OUT, 'pools-r718-1440-expanded.png'), fullPage: true })
  if (expanded.toggle !== 'Hide Analysis') report.errors.push('toggle text')
  if (expanded.height && Math.abs(expanded.height - 390) > 6) report.errors.push(`expanded h ${expanded.height}`)
  if (!expanded.bsc) report.errors.push('bsc missing')
  if (!expanded.machine) report.errors.push('machine missing')
  if (!expanded.heading) report.errors.push('heading missing')

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mobile.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mobile.waitForSelector('[data-r718-pool-card]', { timeout: 120000 })
  await mobile.waitForTimeout(3000)
  await mobile.screenshot({ path: path.join(OUT, 'pools-r718-390.png'), fullPage: true })
  const mob = await mobile.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    cols: window.getComputedStyle(document.querySelector('[data-r717-pool-grid]')).gridTemplateColumns,
  }))
  if (mob.overflow) report.errors.push('mobile overflow')
  if (!mob.cols.includes('1fr') && mob.cols !== '312px') {
    /* single column ok */
  }

  await browser.close()
  if (report.errors.length) report.passed = false
  fs.writeFileSync(path.join(OUT, 'R718_REPORT.json'), JSON.stringify({ ...report, collapsed, expanded }, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
