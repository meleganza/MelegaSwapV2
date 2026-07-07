#!/usr/bin/env node
/** R713 — Pools live-state verification gate. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r713-live-state-gate')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

function killPort(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' })
  } catch {
    /* ignore */
  }
}

function buildAndStart(fixture) {
  killPort(3000)
  const env = { ...process.env }
  if (fixture) {
    env.NEXT_PUBLIC_POOLS_UX_FIXTURE = '1'
  } else {
    delete env.NEXT_PUBLIC_POOLS_UX_FIXTURE
  }
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

async function evaluatePools(page, { expectFixture, expectExpanded }) {
  return page.evaluate(
    ({ expectFixture, expectExpanded }) => {
      const cards = [...document.querySelectorAll('[data-r708-pool-card]')]
      const empty = document.querySelector('[data-ps-pool-grid-empty]')
      const analyzeBtns = [...document.querySelectorAll('[data-ps-analyze-toggle]')]
      const bscScan = document.querySelector('[data-ps-pool-analyze-panel] a[href*="bscscan.com"]')
      const machine = document.querySelector('[data-pools-machine-json]')
      const machineRaw = machine?.getAttribute('data-melega-pool-v2') ?? ''
      let machineOk = false
      try {
        const parsed = JSON.parse(machineRaw)
        machineOk = Boolean(parsed && typeof parsed === 'object')
      } catch {
        machineOk = false
      }

      const overlaps = (() => {
        const rects = cards.map((c) => c.getBoundingClientRect())
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i]
            const b = rects[j]
            if (a.width > 0 && b.width > 0 && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1) {
              return true
            }
          }
        }
        return false
      })()

      const aprTexts = cards.map((c) => c.querySelector('[data-ps-pool-apr]')?.textContent?.trim() ?? '')
      const names = cards.map((c) => {
        const blocks = c.querySelectorAll('span')
        return blocks[1]?.textContent?.trim() ?? blocks[0]?.textContent?.trim() ?? ''
      })

      const clipped = cards.some((card) => {
        const apr = card.querySelector('[data-ps-pool-apr]')
        const title = card.querySelector('[data-ps-pool-apr]')?.nextElementSibling?.querySelector('span')
        const btn = card.querySelector('[data-ps-stake-btn], [data-ps-analyze-toggle]')
        return [apr, title, btn].filter(Boolean).some((el) => {
          const node = el
          return node.scrollWidth > node.clientWidth + 2
        })
      })

      const hideAnalysisVisible = analyzeBtns.some((b) => b.textContent?.trim() === 'Hide Analysis')
      const docOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2

      return {
        fixtureAttr: document.querySelector('[data-pools-ux-fixture]')?.getAttribute('data-pools-ux-fixture') === 'true',
        cardCount: cards.length,
        emptyVisible: Boolean(empty),
        aprTexts,
        names,
        overlaps,
        clipped,
        hideAnalysisVisible,
        bscScanVisible: Boolean(bscScan && bscScan.getBoundingClientRect().height > 0),
        machineOk,
        docOverflowX,
        analyzeBtnCount: analyzeBtns.length,
        expectExpanded,
      }
    },
    { expectFixture, expectExpanded },
  )
}

async function capture(page, name) {
  const file = `pools-r713-${name}.png`
  await page.screenshot({ path: path.join(OUT, file), fullPage: name.includes('desktop') })
  return file
}

async function runBrowserChecks(report, fixture, expanded) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/pools`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForTimeout(1500)

  if (ERROR_RE.test(await page.locator('body').innerText())) {
    report.passed = false
    report.errors = report.errors || []
    report.errors.push('error boundary on /pools')
  }

  if (fixture) {
    await page.locator('[data-r708-pool-grid]').scrollIntoViewIfNeeded()
    if (expanded) {
      await page.locator('[data-ps-analyze-toggle]').first().click()
      await page.waitForTimeout(600)
    }
    const checks = await evaluatePools(page, { expectFixture: true, expectExpanded: expanded })
    report.viewports = report.viewports || {}
    const key = expanded ? 'fixture-expanded-1440' : 'fixture-live-1440'
    report.viewports[key] = checks
    report.screenshots.push(await capture(page, key))

    if (checks.cardCount !== 3) report.passed = false
    if (!checks.fixtureAttr) report.passed = false
    if (checks.overlaps || checks.clipped || checks.docOverflowX) report.passed = false
    if (!checks.machineOk) report.passed = false
    if (expanded) {
      if (!checks.hideAnalysisVisible) report.passed = false
      if (!checks.bscScanVisible) report.passed = false
    }
    const expectedApr = ['10.00%', '28.45%', '38.00%']
    if (!expectedApr.every((apr) => checks.aprTexts.includes(apr))) report.passed = false
  } else {
    const checks = await evaluatePools(page, { expectFixture: false, expectExpanded: false })
    report.viewports = report.viewports || {}
    report.viewports['real-unfunded-1440'] = checks
    report.screenshots.push(await capture(page, 'real-unfunded-1440'))
    if (!checks.emptyVisible && checks.cardCount > 0) {
      /* allow either empty or real pools */
    }
    if (checks.fixtureAttr) report.passed = false
    if (checks.overlaps || checks.docOverflowX) report.passed = false
  }

  await ctx.close()
  await browser.close()
}

async function runMobileFixture(report) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/pools`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.locator('[data-r708-pool-grid], [data-ps-pool-grid]').scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  const checks = await evaluatePools(page, { expectFixture: true, expectExpanded: false })
  report.viewports['fixture-mobile-390'] = checks
  report.screenshots.push(
    await page.screenshot({ path: path.join(OUT, 'pools-r713-fixture-mobile-390.png'), fullPage: false }).then(() => 'pools-r713-fixture-mobile-390.png'),
  )
  if (checks.cardCount !== 3) report.passed = false
  if (checks.overlaps || checks.clipped || checks.docOverflowX) report.passed = false
  await ctx.close()
  await browser.close()
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = { passed: true, screenshots: [], viewports: {}, errors: [] }

  console.log('R713: build real unfunded state…')
  await buildAndStart(false)
  await runBrowserChecks(report, false, false)

  console.log('R713: build fixture live state…')
  await buildAndStart(true)
  await runBrowserChecks(report, true, false)
  await runBrowserChecks(report, true, true)
  await runMobileFixture(report)

  fs.writeFileSync(
    path.join(OUT, 'R713_VALIDATION_REPORT.md'),
    [
      '# R713 Live-State Verification Gate',
      '',
      `Result: **${report.passed ? 'PASSED' : 'FAILED'}**`,
      '',
      'Fixture flag: `NEXT_PUBLIC_POOLS_UX_FIXTURE=1` (build-time, local/screenshot only)',
      '',
      '```json',
      JSON.stringify(report, null, 2),
      '```',
    ].join('\n'),
  )

  console.log(report.passed ? 'R713 PASSED' : 'R713 FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
