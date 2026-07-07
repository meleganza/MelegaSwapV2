#!/usr/bin/env node
/** R715 — Top Pool ticker fix + Pools Hero polish validation. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r715-pools-premium-polish')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

const FORBIDDEN_TICKER = ['APR —', '— APR', 'undefined', 'NaN', 'Calculating...']

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

async function evaluatePools(page) {
  return page.evaluate((forbidden) => {
    const ticker = document.querySelector('[data-melega-ticker]')
    const tickerText = ticker?.textContent ?? ''
    const topPoolSegment = (() => {
      const m = tickerText.match(/Top Pool([\s\S]*?)(?=Top Farm|Top volume|Latest|$)/i)
      return m ? m[0].trim() : ''
    })()

    const hero = document.querySelector('[data-r715-pools-hero]')
    const title = document.querySelector('[data-ps-pools-title]')
    const subtitle = document.querySelector('[data-ps-pools-subtitle]')
    const actions = document.querySelector('[data-ps-hero-actions]')
    const titleRect = title?.getBoundingClientRect()
    const actionsRect = actions?.getBoundingClientRect()
    const subtitleLines = subtitle ? [...subtitle.querySelectorAll('span')].map((s) => s.textContent?.trim()) : []

    const poolAprValid = /\d+\.?\d*%\s*APR/i.test(topPoolSegment)
    const poolAprHonestEmpty = /no sustainable pool/i.test(topPoolSegment)
    const forbiddenHit = forbidden.find((f) => tickerText.includes(f))
    const docOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2

    const titleStyle = title ? window.getComputedStyle(title) : null
    const subtitleStyle = subtitle ? window.getComputedStyle(subtitle) : null

    return {
      tickerText: tickerText.slice(0, 600),
      topPoolSegment: topPoolSegment.slice(0, 160),
      poolAprValid,
      poolAprHonestEmpty,
      tickerPoolAprOk: poolAprValid || poolAprHonestEmpty,
      forbiddenHit: forbiddenHit ?? null,
      heroPresent: Boolean(hero),
      poolsTitle: title?.textContent?.trim() ?? null,
      subtitleLines,
      subtitleLineCount: subtitleLines.length,
      titleFontSize: titleStyle?.fontSize ?? null,
      titleVisible: titleRect ? titleRect.width > 0 && titleRect.height > 0 : false,
      actionsBelowSubtitleMobile: (() => {
        if (window.innerWidth > 767) return true
        const subRect = subtitle?.getBoundingClientRect()
        if (!subRect || !actionsRect) return false
        return actionsRect.top >= subRect.bottom - 2
      })(),
      actionsOverlapTitle: (() => {
        if (!titleRect || !actionsRect || window.innerWidth <= 767) return false
        const horizOverlap = actionsRect.left < titleRect.right - 4 && actionsRect.right > titleRect.left + 4
        const vertOverlap = actionsRect.top < titleRect.bottom - 4 && actionsRect.bottom > titleRect.top + 4
        return horizOverlap && vertOverlap
      })(),
      docOverflowX,
      subtitleColor: subtitleStyle?.color ?? null,
    }
  }, FORBIDDEN_TICKER)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = {
    task: 'R715 Pools Premium Polish — Step 0 + Step A',
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    build: 'pending',
    routeSmoke: { path: '/pools', status: null },
    screenshots: [],
    checks: {},
    tickerTextFound: null,
    topPoolSegment: null,
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
      fs.writeFileSync(path.join(OUT, 'R715_REPORT.json'), JSON.stringify(report, null, 2))
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
    if (vp.slug === '1440') {
      report.routeSmoke.status = res?.status() ?? null
      if (report.routeSmoke.status !== 200) {
        report.passed = false
        report.errors.push(`Route /pools returned ${report.routeSmoke.status}`)
      }
    }

    await page.waitForSelector('[data-pools-studio-screen]', { timeout: 120000 }).catch(() => undefined)
    await page.waitForTimeout(5000)

    const bodyText = await page.locator('body').innerText()
    if (ERROR_RE.test(bodyText)) {
      report.passed = false
      report.errors.push(`Error boundary at ${vp.slug}`)
    }

    const shot = `pools-r715-${vp.slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: true })
    report.screenshots.push(shot)

    const evalResult = await evaluatePools(page)
    report.checks[vp.slug] = evalResult

    if (vp.slug === '1440') {
      report.tickerTextFound = evalResult.tickerText
      report.topPoolSegment = evalResult.topPoolSegment
    }

    if (!evalResult.tickerPoolAprOk) {
      report.passed = false
      report.errors.push(`${vp.slug}: ticker Top Pool missing valid APR or "No sustainable pool"`)
    }
    if (evalResult.forbiddenHit) {
      report.passed = false
      report.errors.push(`${vp.slug}: forbidden ticker string "${evalResult.forbiddenHit}"`)
    }
    if (evalResult.docOverflowX) {
      report.passed = false
      report.errors.push(`${vp.slug}: horizontal overflow`)
    }
    if (vp.slug === '1440') {
      if (evalResult.poolsTitle !== 'POOLS') report.errors.push('1440: title not POOLS')
      if (evalResult.subtitleLineCount !== 3) report.errors.push('1440: subtitle not 3 lines')
      if (evalResult.actionsOverlapTitle) report.errors.push('1440: hero actions overlap title')
    }
    if (vp.slug === '390' && !evalResult.actionsBelowSubtitleMobile) {
      report.passed = false
      report.errors.push('390: hero actions not below subtitle on mobile')
    }

    await context.close()
  }

  await browser.close()

  if (report.errors.length) report.passed = false

  const md = [
    '# R715 Pools Premium Polish Report',
    '',
    `**Result:** ${report.passed ? 'PASSED' : 'FAILED'}`,
    `**Timestamp:** ${report.timestamp}`,
    `**Build:** ${report.build}`,
    `**Route smoke /pools:** ${report.routeSmoke.status}`,
    '',
    '## Ticker (1440)',
    `- **Top Pool segment:** \`${report.topPoolSegment}\``,
    `- **Full ticker excerpt:** \`${String(report.tickerTextFound).slice(0, 200)}…\``,
    '',
    '## Screenshots',
    ...report.screenshots.map((s) => `- \`docs/screenshots/r715-pools-premium-polish/${s}\``),
    '',
    '## Errors',
    ...(report.errors.length ? report.errors.map((e) => `- ${e}`) : ['- none']),
    '',
    '## Checks',
    '```json',
    JSON.stringify(report.checks, null, 2),
    '```',
  ].join('\n')

  fs.writeFileSync(path.join(OUT, 'R715_REPORT.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(path.join(OUT, 'R715_REPORT.md'), md)

  console.log(JSON.stringify({ passed: report.passed, topPoolSegment: report.topPoolSegment, errors: report.errors }, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
