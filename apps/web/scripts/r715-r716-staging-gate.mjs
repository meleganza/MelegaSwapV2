#!/usr/bin/env node
/** R715+R716 — Post-push staging gate (v2.melega.finance). */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r715-r716-staging-gate')
const BASE = process.env.STAGING_URL || 'https://v2.melega.finance'
const TARGET_SHA = process.env.TARGET_SHA || 'e9ab328'
const ERROR_RE = /oops,?\s*something\s*wrong|error boundary/i

const ROUTES = [
  { path: '/pools', slug: 'pools', fullPage: true },
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
    const empty = document.querySelector('[data-r716-featured-empty]')
    const advisor = document.querySelector('[data-r716-advisor-wrap]')
    const emptyRect = empty?.getBoundingClientRect()
    const advisorRect = advisor?.getBoundingClientRect()
    const hero = document.querySelector('[data-r715-pools-hero]')

    return {
      fixtureEnabled: Boolean(fixture),
      tickerText: tickerText.slice(0, 500),
      topPoolSegment: topPoolSegment.slice(0, 120),
      poolAprDash: /APR\s*—|APR\s*–/i.test(tickerText),
      poolAprHonestEmpty: /no sustainable pool/i.test(topPoolSegment),
      poolAprValid: /\d+\.?\d*%\s*APR/i.test(topPoolSegment),
      tickerPoolAprOk:
        !/APR\s*—|APR\s*–/i.test(tickerText) &&
        (/\d+\.?\d*%\s*APR/i.test(topPoolSegment) || /no sustainable pool/i.test(topPoolSegment)),
      heroPresent: Boolean(hero),
      emptyPresent: Boolean(empty),
      advisorPresent: Boolean(advisor),
      topAlignDeltaPx:
        emptyRect && advisorRect && window.innerWidth > 767
          ? Math.abs(emptyRect.top - advisorRect.top)
          : null,
      topAligned:
        emptyRect && advisorRect && window.innerWidth > 767
          ? Math.abs(emptyRect.top - advisorRect.top) <= 2
          : true,
      emptyHeight: emptyRect?.height ?? null,
      advisorHeight: advisorRect?.height ?? null,
      docOverflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      poolsTitle: document.querySelector('[data-ps-pools-title]')?.textContent?.trim() ?? null,
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const report = {
    task: 'R715+R716 Staging Gate',
    targetSha: TARGET_SHA,
    deploymentUrl: BASE,
    deployedAt: null,
    deployStatus: null,
    passed: true,
    routes: {},
    screenshots: [],
    checks: {},
    errors: [],
  }

  try {
    const hit = await fetch(
      `https://api.github.com/repos/meleganza/MelegaSwapV2/deployments?per_page=5`,
      { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'r715-r716-staging-gate' } },
    ).then((r) => r.json())
    const dep = hit.find((d) => String(d.sha).startsWith(TARGET_SHA))
    if (dep) {
      report.deployedAt = dep.created_at
      const statuses = await fetch(
        `https://api.github.com/repos/meleganza/MelegaSwapV2/deployments/${dep.id}/statuses?per_page=3`,
        { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'r715-r716-staging-gate' } },
      ).then((r) => r.json())
      report.deployStatus = statuses[0]?.state ?? 'unknown'
    }
  } catch {
    /* ignore */
  }

  const browser = await chromium.launch()
  const viewports = [
    { slug: '1440', width: 1440, height: 900 },
    { slug: '390', width: 390, height: 844 },
  ]

  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const res = await page.goto(`${BASE}${route.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    })
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

    if (route.fullPage) {
      const shot = `staging-${route.slug}-1440.png`
      await page.screenshot({ path: path.join(OUT, shot), fullPage: true })
      report.screenshots.push(shot)
      report.checks.pools1440 = await evaluatePools(page)
      if (!report.checks.pools1440.tickerPoolAprOk) {
        report.passed = false
        report.errors.push('ticker: APR — or invalid Top Pool copy')
      }
      if (report.checks.pools1440.fixtureEnabled) {
        report.passed = false
        report.errors.push('fixture enabled on staging')
      }
      if (!report.checks.pools1440.topAligned) {
        report.passed = false
        report.errors.push(`panel/advisor misaligned by ${report.checks.pools1440.topAlignDeltaPx}px`)
      }
      if (report.checks.pools1440.docOverflowX) {
        report.passed = false
        report.errors.push('1440: horizontal overflow on /pools')
      }
    }
    await page.close()
  }

  for (const vp of viewports) {
    if (vp.slug === '1440') continue
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(5000)
    const shot = `staging-pools-${vp.slug}.png`
    await page.screenshot({ path: path.join(OUT, shot), fullPage: true })
    report.screenshots.push(shot)
    const checks = await evaluatePools(page)
    report.checks[`pools${vp.slug}`] = checks
    if (checks.docOverflowX) {
      report.passed = false
      report.errors.push(`${vp.slug}: horizontal overflow`)
    }
    if (!checks.tickerPoolAprOk) {
      report.passed = false
      report.errors.push(`${vp.slug}: ticker invalid`)
    }
    await page.close()
  }

  await browser.close()

  const md = [
    '# R715+R716 Staging Gate',
    '',
    `**Result:** ${report.passed ? 'PASSED' : 'FAILED'}`,
    `**SHA:** \`${TARGET_SHA}\``,
    `**URL:** ${BASE}`,
    `**Deploy status:** ${report.deployStatus ?? 'unknown'}`,
    `**Deployed at:** ${report.deployedAt ?? 'unknown'}`,
    '',
    '## Routes',
    ...Object.entries(report.routes).map(([k, v]) => `- /${k}: ${v.status}${v.errorBoundary ? ' (ERROR BOUNDARY)' : ''}`),
    '',
    '## Ticker (1440)',
    `- \`${report.checks.pools1440?.topPoolSegment ?? 'n/a'}\``,
    '',
    '## Screenshots',
    ...report.screenshots.map((s) => `- docs/screenshots/r715-r716-staging-gate/${s}`),
    '',
    '## Errors',
    ...(report.errors.length ? report.errors.map((e) => `- ${e}`) : ['- none']),
  ].join('\n')

  fs.writeFileSync(path.join(OUT, 'R715_R716_STAGING_GATE.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(path.join(OUT, 'R715_R716_STAGING_GATE.md'), md)

  console.log(JSON.stringify({ passed: report.passed, sha: TARGET_SHA, deployStatus: report.deployStatus, errors: report.errors }, null, 2))
  process.exit(report.passed ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
