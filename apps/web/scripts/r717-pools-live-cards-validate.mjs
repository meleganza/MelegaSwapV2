#!/usr/bin/env node
/** R717 — Pool live cards polish validation. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r717-pools-live-cards')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

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
  const child = spawn('yarn', ['start', '-p', '3000'], {
    cwd: WEB,
    env,
    stdio: 'ignore',
    detached: true,
  })
  child.unref()
  return new Promise((resolve) => setTimeout(resolve, 8000))
}

async function evaluateCards(page) {
  return page.evaluate(() => {
    const grid = document.querySelector('[data-r717-pool-grid]')
    const cards = [...document.querySelectorAll('[data-r717-pool-card]')]
    const first = cards[0]
    const firstRect = first?.getBoundingClientRect()
    const gridStyle = grid ? window.getComputedStyle(grid) : null
    const cols = gridStyle?.gridTemplateColumns ?? ''
    const threeCols = (cols.match(/312px/g) ?? []).length === 3

    const apr = first?.querySelector('[data-ps-pool-apr]')
    const aprStyle = apr ? window.getComputedStyle(apr) : null
    const aprRect = apr?.getBoundingClientRect()
    const aprClipped =
      apr && apr.parentElement
        ? apr.scrollWidth > apr.clientWidth + 1 || aprRect.height < 40
        : false

    const title = first?.querySelector('[data-ps-pool-name]')
    const titleWraps = title ? title.scrollHeight > parseFloat(window.getComputedStyle(title).lineHeight) + 2 : false

    const stake = first?.querySelector('[data-ps-stake-btn]')
    const analyze = first?.querySelector('[data-ps-analyze-toggle]')
    const stakeRect = stake?.getBoundingClientRect()
    const analyzeRect = analyze?.getBoundingClientRect()

    const healthBar = first?.querySelector('[data-r717-pool-card] [aria-hidden]')
    const hasHealthBar = Boolean(first?.querySelector('div > div > div[style*="width"]') || first?.innerHTML.includes('HealthBar'))
    const healthTrack = first?.querySelectorAll('div').length
      ? [...first.querySelectorAll('div')].find((el) => {
          const s = window.getComputedStyle(el)
          return s.width === '72px' && s.height === '5px'
        })
      : null

    const contractCell = first?.textContent?.includes('0x') || first?.textContent?.includes('...')
    const bscInCollapsed = Boolean(first?.querySelector('a[href*="bscscan"]'))

    return {
      cardCount: cards.length,
      threeCols,
      gridColumns: cols,
      cardWidth: firstRect?.width ?? null,
      cardHeight: firstRect?.height ?? null,
      aprFontSize: aprStyle?.fontSize ?? null,
      aprClipped,
      titleWraps,
      stakeWidth: stakeRect?.width ?? null,
      analyzeWidth: analyzeRect?.width ?? null,
      buttonsSameWidth: stakeRect && analyzeRect ? Math.abs(stakeRect.width - analyzeRect.width) < 2 : false,
      buttonHeightsOk:
        stakeRect && analyzeRect ? stakeRect.height >= 42 && analyzeRect.height >= 42 : false,
      healthBarPresent: Boolean(healthTrack),
      contractPresent: contractCell,
      bscInCollapsed,
      docOverflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    }
  })
}

async function evaluateExpanded(page) {
  return page.evaluate(() => {
    const card = document.querySelector('[data-r717-pool-card]')
    const rect = card?.getBoundingClientRect()
    const toggle = document.querySelector('[data-ps-analyze-toggle]')
    const toggleText = toggle?.textContent?.trim()
    const panel = document.querySelector('[data-ps-pool-analyze-panel]')
    const bscBtn = document.querySelector('[data-ps-bscscan-btn]')
    const jsonBtn = document.querySelector('[data-ps-machine-json-btn]')
    const machine = document.querySelector('[data-pools-machine-json]')
    const healthTrack = card
      ? [...card.querySelectorAll('div')].find((el) => {
          const s = window.getComputedStyle(el)
          return s.width === '72px' && s.height === '5px'
        })
      : null

    return {
      expandedHeight: rect?.height ?? null,
      toggleText,
      panelVisible: panel && window.getComputedStyle(panel).display !== 'none',
      bscBtn: Boolean(bscBtn),
      jsonBtn: Boolean(jsonBtn),
      machineJson: Boolean(machine?.getAttribute('data-melega-pool-v2')),
      healthBarPresent: Boolean(healthTrack),
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, errors: [], routeStatus: null, build: 'pending' }

  if (!process.env.SCREENSHOT_BASE_URL) {
    try {
      await buildAndStart()
      report.build = 'passed'
    } catch (e) {
      report.build = 'failed'
      report.passed = false
      report.errors.push(String(e.message || e))
      fs.writeFileSync(path.join(OUT, 'R717_REPORT.json'), JSON.stringify(report, null, 2))
      process.exit(1)
    }
  } else {
    report.build = 'skipped'
  }

  const browser = await chromium.launch()

  // 1440 collapsed
  const ctx1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page1440 = await ctx1440.newPage()
  const res = await page1440.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  report.routeStatus = res?.status() ?? null
  await page1440.waitForSelector('[data-r717-pool-card]', { timeout: 120000 })
  await page1440.waitForTimeout(4000)

  if (ERROR_RE.test(await page1440.locator('body').innerText())) {
    report.passed = false
    report.errors.push('error boundary')
  }

  const collapsed = await evaluateCards(page1440)
  report.collapsed1440 = collapsed
  await page1440.screenshot({ path: path.join(OUT, 'pools-r717-1440.png'), fullPage: true })

  if (collapsed.cardCount < 1) report.errors.push('no cards')
  if (!collapsed.threeCols) report.errors.push('grid not 3x312px columns')
  if (collapsed.aprClipped) report.errors.push('APR clipped')
  if (collapsed.titleWraps) report.errors.push('title wraps')
  if (!collapsed.buttonsSameWidth) report.errors.push('button widths differ')
  if (!collapsed.buttonHeightsOk) report.errors.push('button heights wrong')
  if (!collapsed.healthBarPresent) report.errors.push('health bar missing collapsed')
  if (!collapsed.contractPresent) report.errors.push('contract missing')
  if (!collapsed.bscInCollapsed) report.errors.push('bscscan missing collapsed')
  if (collapsed.cardHeight && Math.abs(collapsed.cardHeight - 258) > 6) {
    report.errors.push(`collapsed height ${collapsed.cardHeight}`)
  }
  if (collapsed.docOverflowX) report.errors.push('overflow 1440')

  // expanded
  await page1440.click('[data-ps-analyze-toggle]').catch(() => undefined)
  await page1440.waitForTimeout(400)
  const expanded = await evaluateExpanded(page1440)
  report.expanded1440 = expanded
  await page1440.screenshot({ path: path.join(OUT, 'pools-r717-1440-expanded.png'), fullPage: true })

  if (expanded.toggleText !== 'Hide Analysis') report.errors.push('analyze toggle text wrong')
  if (expanded.expandedHeight && Math.abs(expanded.expandedHeight - 390) > 6) {
    report.errors.push(`expanded height ${expanded.expandedHeight}`)
  }
  if (!expanded.bscBtn) report.errors.push('bscscan button missing expanded')
  if (!expanded.jsonBtn) report.errors.push('machine json button missing')
  if (!expanded.machineJson) report.errors.push('machine json attr missing')
  if (!expanded.healthBarPresent) report.errors.push('health bar missing expanded')

  await ctx1440.close()

  // 390
  const ctx390 = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page390 = await ctx390.newPage()
  await page390.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page390.waitForSelector('[data-r717-pool-card]', { timeout: 120000 })
  await page390.waitForTimeout(3000)
  await page390.screenshot({ path: path.join(OUT, 'pools-r717-390.png'), fullPage: true })
  const mobile = await page390.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    cardWidth: document.querySelector('[data-r717-pool-card]')?.getBoundingClientRect().width ?? null,
  }))
  report.mobile390 = mobile
  if (mobile.overflow) report.errors.push('overflow 390')
  await ctx390.close()

  await browser.close()

  if (report.routeStatus !== 200) report.errors.push(`HTTP ${report.routeStatus}`)
  if (report.errors.length) report.passed = false

  fs.writeFileSync(path.join(OUT, 'R717_REPORT.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, errors: report.errors }, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
