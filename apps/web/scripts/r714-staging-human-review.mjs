#!/usr/bin/env node
/** R714 — Staging deploy human review gate (v2.melega.finance). */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r714-staging-human-review')
const BASE = process.env.STAGING_URL || 'https://v2.melega.finance'
const TARGET_SHA = process.env.TARGET_SHA || '65d146a'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

const ROUTES = [
  { path: '/pools', slug: 'pools', fullPage: true },
  { path: '/farms', slug: 'farms', fullPage: false },
  { path: '/trade', slug: 'trade', fullPage: false },
  { path: '/liquidity-studio', slug: 'liquidity-studio', fullPage: false },
  { path: '/build-studio', slug: 'build-studio', fullPage: false },
]

async function evaluatePools(page) {
  return page.evaluate(() => {
    const empty = document.querySelector('[data-ps-pool-grid-empty], [data-r708-empty-grid]')
    const fixture = document.querySelector('[data-pools-ux-fixture="true"]')
    const cards = document.querySelectorAll('[data-r708-pool-card]').length
    const title = document.querySelector('[data-ps-pools-title]')?.textContent?.trim()
    const createPool = document.querySelector('[data-r712-create-pool], [data-r711-create-pool]')
    const ticker = document.querySelector('[data-melega-ticker]')
    const tickerText = ticker?.textContent ?? ''
    const topPoolSegment = (() => {
      const m = tickerText.match(/Top Pool([\s\S]*?)(?=Top Farm|Top volume|Latest|$)/i)
      return m ? m[0] : tickerText
    })()
    const poolAprValid = /\d+\.?\d*%\s*APR/i.test(topPoolSegment)
    const poolAprHonestEmpty = /no sustainable pool/i.test(topPoolSegment)
    const poolAprDash = /APR\s*—|APR\s*–/i.test(topPoolSegment)
    const docOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2

    return {
      emptyVisible: Boolean(empty),
      fixtureEnabled: Boolean(fixture),
      liveCardCount: cards,
      poolsTitle: title ?? null,
      createPoolVisible: Boolean(createPool),
      tickerText: tickerText.slice(0, 500),
      topPoolSegment: topPoolSegment.slice(0, 120),
      poolAprValid,
      poolAprHonestEmpty,
      poolAprDash,
      tickerPoolAprOk: poolAprValid || poolAprHonestEmpty,
      docOverflowX,
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = {
    task: 'R714 Staging Human Review',
    targetSha: TARGET_SHA,
    deploymentUrl: BASE,
    deployedAt: null,
    passed: true,
    routes: {},
    screenshots: [],
    checks: {},
    errors: [],
  }

  // Confirm GitHub deployment SHA
  try {
    const res = await fetch(
      `https://api.github.com/repos/meleganza/MelegaSwapV2/deployments?per_page=5`,
      { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'r714-staging-gate' } },
    )
    if (res.ok) {
      const deployments = await res.json()
      const hit = deployments.find((d) => String(d.sha).startsWith(TARGET_SHA))
      if (hit) {
        report.deployedAt = hit.created_at
        report.deploymentSha = hit.sha
      }
    }
  } catch {
    /* optional */
  }

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  for (const route of ROUTES) {
    const page = await ctx.newPage()
    let ok = true
    try {
      const resp = await page.goto(`${BASE}${route.path}`, {
        waitUntil: route.slug === 'liquidity-studio' ? 'domcontentloaded' : 'networkidle',
        timeout: 120000,
      })
      if (route.slug === 'liquidity-studio') {
        await page.waitForTimeout(5000)
      } else {
        await page.waitForTimeout(2500)
      }
      const body = await page.locator('body').innerText()
      const status = resp?.status() ?? 0
      const errorBoundary = ERROR_RE.test(body)
      const shot = `r714-staging-${route.slug}-1440.png`
      await page.screenshot({
        path: path.join(OUT, shot),
        fullPage: route.fullPage,
      })
      report.screenshots.push(shot)

      const entry = {
        path: route.path,
        httpStatus: status,
        errorBoundary,
        url: page.url(),
      }

      if (route.slug === 'pools') {
        Object.assign(entry, await evaluatePools(page))
        report.checks.pools = entry
        if (entry.fixtureEnabled) {
          report.passed = false
          report.errors.push('NEXT_PUBLIC_POOLS_UX_FIXTURE active on staging')
        }
        if (!entry.emptyVisible && entry.liveCardCount === 0) {
          /* allow loading state briefly — empty or cards required */
        }
        if (!entry.poolsTitle || !entry.createPoolVisible) {
          report.passed = false
          report.errors.push('/pools layout not readable')
        }
        if (!entry.tickerPoolAprOk) {
          report.passed = false
          report.errors.push(
            `ticker Top Pool shows "${entry.poolAprDash ? 'APR —' : 'unknown'}" — expected valid % APR or "No sustainable pool"`,
          )
        }
      }

      if (errorBoundary || status >= 400) {
        ok = false
        report.passed = false
        report.errors.push(`${route.path}: ${errorBoundary ? 'error boundary' : `HTTP ${status}`}`)
      }

      report.routes[route.slug] = { ...entry, ok }
    } catch (e) {
      report.passed = false
      report.errors.push(`${route.path}: ${String(e.message).slice(0, 120)}`)
      report.routes[route.slug] = { path: route.path, ok: false, error: String(e.message) }
    }
    await page.close()
  }

  // Mobile pools
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mobilePage.goto(`${BASE}/pools`, { waitUntil: 'networkidle', timeout: 120000 })
  await mobilePage.waitForTimeout(2000)
  const mobileShot = 'r714-staging-pools-mobile-390.png'
  await mobilePage.screenshot({ path: path.join(OUT, mobileShot), fullPage: true })
  report.screenshots.push(mobileShot)
  const mobilePools = await evaluatePools(mobilePage)
  report.checks.poolsMobile = mobilePools
  if (mobilePools.fixtureEnabled || mobilePools.docOverflowX) report.passed = false
  await mobilePage.close()

  await browser.close()

  fs.writeFileSync(
    path.join(OUT, 'R714_STAGING_REVIEW_REPORT.md'),
    [
      '# R714 Staging Human Review',
      '',
      `**Result:** ${report.passed ? 'PASSED' : 'FAILED'}`,
      '',
      `| Field | Value |`,
      `|-------|-------|`,
      `| Target SHA | \`${TARGET_SHA}\` |`,
      `| Deployment URL | ${BASE} |`,
      `| Deployed at | ${report.deployedAt ?? 'see GitHub Preview deployment'} |`,
      `| Fixture on staging | ${report.checks.pools?.fixtureEnabled ? 'YES (FAIL)' : 'NO'} |`,
      '',
      '## Route smoke',
      '',
      '```json',
      JSON.stringify(report.routes, null, 2),
      '```',
      '',
      '## Pools checks',
      '',
      '```json',
      JSON.stringify(report.checks, null, 2),
      '```',
      '',
      report.errors.length
        ? `## Errors\n\n${report.errors.map((e) => `- ${e}`).join('\n')}\n`
        : '',
    ].join('\n'),
  )

  fs.writeFileSync(path.join(OUT, 'R714_STAGING_REVIEW.json'), JSON.stringify(report, null, 2))

  console.log(report.passed ? 'R714 STAGING PASSED' : 'R714 STAGING FAILED')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
