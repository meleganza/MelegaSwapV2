#!/usr/bin/env node
/** R725 — Pools final staging gate (post-push). */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r725-pools-staging-gate')
const BASE = process.env.STAGING_URL || 'https://v2.melega.finance'
const TARGET_SHA = process.env.TARGET_SHA || ''
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

const ROUTES = [
  { path: '/pools', slug: 'pools' },
  { path: '/farms', slug: 'farms' },
  { path: '/trade', slug: 'trade' },
  { path: '/liquidity-studio', slug: 'liquidity-studio' },
  { path: '/build-studio', slug: 'build-studio' },
]

async function evaluatePools(page) {
  return page.evaluate(() => {
    const fixture = document.querySelector('[data-pools-ux-fixture="true"]')
    const ticker = document.querySelector('[data-melega-ticker]')
    const tickerText = ticker?.textContent ?? ''
    const topPoolSegment = (() => {
      const m = tickerText.match(/Top Pool([\s\S]*?)(?=Top Farm|Top volume|Latest|$)/i)
      return m ? m[0].trim() : ''
    })()
    const createPool = document.querySelector('[data-r723-create-pool]')
    const root = createPool
    const compact = root?.hasAttribute('data-r723-create-pool-compact') ?? false
    const expanded = root?.hasAttribute('data-r723-create-pool-expanded') ?? false
    const wizardProgress = Boolean(root?.querySelector('[data-r722-wizard-progress]'))
    return {
      fixtureEnabled: Boolean(fixture),
      tickerPoolAprOk:
        !/APR\s*—|APR\s*–/i.test(tickerText) &&
        (/\d+\.?\d*%\s*APR/i.test(topPoolSegment) || /no sustainable pool/i.test(topPoolSegment)),
      topPoolSegment: topPoolSegment.slice(0, 120),
      docOverflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      createPoolCompact: compact,
      createPoolExpanded: expanded,
      wizardHiddenByDefault: !wizardProgress,
      createPoolPresent: Boolean(createPool),
    }
  })
}

async function evaluatePoolsMobileWizard(page) {
  await page.locator('[data-ps-create-pool-expand]').click({ timeout: 15000 })
  await page.waitForTimeout(400)
  return page.evaluate(() => {
    const root = document.querySelector('[data-r723-create-pool]')
    const nextBtn = root?.querySelector('[data-ps-wizard-next]')
    const nextRect = nextBtn?.getBoundingClientRect()
    const progress = root?.querySelector('[data-r722-wizard-progress]')
    const progressRect = progress?.getBoundingClientRect()
    const actions = root?.querySelector('[data-ps-wizard-actions]')
    const actionsRect = actions?.getBoundingClientRect()
    return {
      expanded: root?.hasAttribute('data-r723-create-pool-expanded') ?? false,
      nextFullWidth: nextRect ? nextRect.width >= window.innerWidth * 0.85 : false,
      progressVisible: (progressRect?.width ?? 0) > 0,
      actionsFullWidth: actionsRect ? actionsRect.width >= window.innerWidth * 0.85 : false,
      docOverflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      wizardReadable: Boolean(root?.querySelector('[data-ps-create-pool-grid]')),
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = {
    task: 'R725 Pools Staging Gate',
    targetSha: TARGET_SHA,
    deploymentUrl: BASE,
    passed: true,
    routes: {},
    checks: {},
    screenshots: [],
    errors: [],
  }

  const browser = await chromium.launch()

  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const res = await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(route.path === '/pools' ? 6000 : 2500)
    const status = res?.status() ?? 0
    const bodyText = await page.locator('body').innerText()
    const errorBoundary = ERROR_RE.test(bodyText)
    report.routes[route.slug] = { status, errorBoundary }
    if (status !== 200) {
      report.passed = false
      report.errors.push(`${route.slug}: HTTP ${status}`)
    }
    if (errorBoundary) {
      report.passed = false
      report.errors.push(`${route.slug}: error boundary`)
    }
    if (route.path === '/pools') {
      const shot = 'staging-pools-1440.png'
      await page.screenshot({ path: path.join(OUT, shot), fullPage: true })
      report.screenshots.push(shot)
      report.checks.pools1440 = await evaluatePools(page)
      if (report.checks.pools1440.fixtureEnabled) {
        report.passed = false
        report.errors.push('fixture enabled on staging')
      }
      if (!report.checks.pools1440.tickerPoolAprOk) {
        report.passed = false
        report.errors.push('ticker: APR — or invalid Top Pool copy')
      }
      if (!report.checks.pools1440.createPoolCompact) {
        report.passed = false
        report.errors.push('create pool not compact by default')
      }
      if (report.checks.pools1440.wizardHiddenByDefault === false) {
        report.passed = false
        report.errors.push('wizard visible by default')
      }
      if (report.checks.pools1440.docOverflowX) {
        report.passed = false
        report.errors.push('1440: horizontal overflow on /pools')
      }
    }
    await page.close()
  }

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mobile.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await mobile.waitForTimeout(5000)
  const shot390 = 'staging-pools-390.png'
  await mobile.screenshot({ path: path.join(OUT, shot390), fullPage: true })
  report.screenshots.push(shot390)
  report.checks.pools390 = await evaluatePools(mobile)
  if (report.checks.pools390.docOverflowX) {
    report.passed = false
    report.errors.push('390: horizontal overflow')
  }
  if (!report.checks.pools390.tickerPoolAprOk) {
    report.passed = false
    report.errors.push('390: ticker invalid')
  }
  try {
    report.checks.pools390Wizard = await evaluatePoolsMobileWizard(mobile)
    if (!report.checks.pools390Wizard.expanded) report.errors.push('390: wizard did not expand')
    if (!report.checks.pools390Wizard.wizardReadable) report.errors.push('390: wizard not readable')
    if (report.checks.pools390Wizard.docOverflowX) report.errors.push('390: wizard overflow')
    if (report.errors.length) report.passed = false
  } catch (e) {
    report.passed = false
    report.errors.push(`390 wizard: ${e instanceof Error ? e.message : String(e)}`)
  }

  await browser.close()

  fs.writeFileSync(path.join(OUT, 'R725_STAGING_GATE.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, errors: report.errors, checks: report.checks }, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
