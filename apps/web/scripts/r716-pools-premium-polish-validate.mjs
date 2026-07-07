#!/usr/bin/env node
/** R716 — Featured empty panel + Reward Advisor alignment validation. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r716-pools-premium-polish')
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
  const env = { ...process.env }
  delete env.NEXT_PUBLIC_POOLS_UX_FIXTURE
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

async function evaluateSection(page) {
  return page.evaluate(() => {
    const empty = document.querySelector('[data-r716-featured-empty]')
    const advisor = document.querySelector('[data-r716-advisor-wrap]')
    const explorer = document.querySelector('[data-ps-pool-explorer]')
    const emptyRect = empty?.getBoundingClientRect()
    const advisorRect = advisor?.getBoundingClientRect()
    const explorerRect = explorer?.getBoundingClientRect()

    const emptyStyle = empty ? window.getComputedStyle(empty) : null
    const advisorStyle = advisor ? window.getComputedStyle(advisor) : null

    const createBtn = empty?.querySelector('[data-ps-empty-create]')
    const studioBtn = empty?.querySelector('[data-ps-empty-studio]')
    const createRect = createBtn?.getBoundingClientRect()
    const studioRect = studioBtn?.getBoundingClientRect()

    const topDelta = emptyRect && advisorRect ? Math.abs(emptyRect.top - advisorRect.top) : null
    const sectionToExplorer =
      emptyRect && explorerRect && window.innerWidth > 767 ? explorerRect.top - emptyRect.bottom : null

    const clipped = [empty, advisor].some((el) => {
      if (!el) return false
      const rect = el.getBoundingClientRect()
      const parent = el.parentElement
      if (!parent) return false
      const pr = parent.getBoundingClientRect()
      return rect.bottom > pr.bottom + 2 || rect.right > pr.right + 2
    })

    const docOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2

    const advisorBelowPanelMobile = (() => {
      if (window.innerWidth > 767 || !emptyRect || !advisorRect) return true
      return advisorRect.top >= emptyRect.bottom + 16
    })()

    return {
      emptyVisible: Boolean(empty),
      advisorVisible: Boolean(advisor),
      emptyHeight: emptyRect?.height ?? null,
      advisorHeight: advisorRect?.height ?? null,
      topAlignDeltaPx: topDelta,
      topAligned: topDelta !== null && topDelta <= 2,
      sectionToExplorerGapPx: sectionToExplorer,
      explorerGapOk: sectionToExplorer === null || sectionToExplorer >= 44,
      emptyBorderRadius: emptyStyle?.borderRadius ?? null,
      emptyPadding: emptyStyle?.padding ?? null,
      advisorBorderRadius: advisorStyle?.borderRadius ?? null,
      advisorPadding: advisorStyle?.padding ?? null,
      buttonsVisible:
        Boolean(createRect && createRect.width > 0 && createRect.height >= 40) &&
        Boolean(studioRect && studioRect.width > 0 && studioRect.height >= 40),
      clipped,
      docOverflowX,
      advisorBelowPanelMobile,
      emptyTitle: empty?.querySelector('[data-ps-empty-title]')?.textContent?.trim() ?? null,
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = {
    task: 'R716 Pools Premium Polish — Step B',
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    build: 'pending',
    routeSmoke: { path: '/pools', status: null },
    screenshots: [],
    checks: {},
    pixelNotes: [],
    passed: true,
    errors: [],
  }

  if (!process.env.SCREENSHOT_BASE_URL) {
    try {
      await buildAndStart()
      report.build = 'passed'
    } catch (e) {
      report.build = 'failed'
      report.passed = false
      report.errors.push(String(e.message || e))
      fs.writeFileSync(path.join(OUT, 'R716_REPORT.json'), JSON.stringify(report, null, 2))
      process.exit(1)
    }
  } else {
    report.build = 'skipped (external base URL)'
  }

  const browser = await chromium.launch()
  const viewports = [
    { slug: '1440', width: 1440, height: 900 },
    { slug: '1728', width: 1728, height: 900 },
    { slug: '390', width: 390, height: 844 },
  ]

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await context.newPage()

    const res = await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    if (vp.slug === '1440') report.routeSmoke.status = res?.status() ?? null

    await page.waitForSelector('[data-pools-studio-screen]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const bodyText = await page.locator('body').innerText()
    if (ERROR_RE.test(bodyText)) {
      report.passed = false
      report.errors.push(`Error boundary at ${vp.slug}`)
    }

    const shot = `pools-r716-${vp.slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: true })
    report.screenshots.push(shot)

    const evalResult = await evaluateSection(page)
    report.checks[vp.slug] = evalResult

    if (vp.slug === '1440') {
      if (!evalResult.topAligned) report.errors.push(`1440: panel/advisor top misaligned by ${evalResult.topAlignDeltaPx}px`)
      if (evalResult.emptyHeight && Math.abs(evalResult.emptyHeight - 260) > 4) {
        report.errors.push(`1440: empty panel height ${evalResult.emptyHeight}px (expected 260px)`)
      }
      if (evalResult.advisorHeight && Math.abs(evalResult.advisorHeight - 260) > 4) {
        report.errors.push(`1440: advisor height ${evalResult.advisorHeight}px (expected 260px)`)
      }
      if (!evalResult.explorerGapOk) {
        report.errors.push(`1440: explorer gap ${evalResult.sectionToExplorerGapPx}px (expected ~48px)`)
      }
      report.pixelNotes.push(
        `1440 top-align delta: ${evalResult.topAlignDeltaPx}px`,
        `1440 empty/advisor heights: ${evalResult.emptyHeight}/${evalResult.advisorHeight}px`,
        `1440 panel→explorer gap: ${evalResult.sectionToExplorerGapPx}px`,
      )
    }

    if (!evalResult.buttonsVisible && evalResult.emptyVisible) {
      report.errors.push(`${vp.slug}: empty panel buttons not fully visible`)
    }
    if (evalResult.clipped) report.errors.push(`${vp.slug}: section clipping detected`)
    if (evalResult.docOverflowX) report.errors.push(`${vp.slug}: horizontal overflow`)
    if (vp.slug === '390' && !evalResult.advisorBelowPanelMobile) {
      report.errors.push('390: Reward Advisor not below empty panel')
    }

    await context.close()
  }

  await browser.close()

  if (report.routeSmoke.status !== 200) {
    report.passed = false
    report.errors.push(`Route /pools returned ${report.routeSmoke.status}`)
  }
  if (report.errors.length) report.passed = false

  const md = [
    '# R716 Pools Premium Polish — Step B',
    '',
    `**Result:** ${report.passed ? 'PASSED' : 'FAILED'}`,
    `**Build:** ${report.build}`,
    `**Route /pools:** ${report.routeSmoke.status}`,
    '',
    '## Pixel validation',
    ...report.pixelNotes.map((n) => `- ${n}`),
    '',
    '## Screenshots',
    ...report.screenshots.map((s) => `- \`docs/screenshots/r716-pools-premium-polish/${s}\``),
    '',
    '## Errors',
    ...(report.errors.length ? report.errors.map((e) => `- ${e}`) : ['- none']),
  ].join('\n')

  fs.writeFileSync(path.join(OUT, 'R716_REPORT.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(path.join(OUT, 'R716_REPORT.md'), md)

  console.log(JSON.stringify({ passed: report.passed, errors: report.errors, pixelNotes: report.pixelNotes }, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
