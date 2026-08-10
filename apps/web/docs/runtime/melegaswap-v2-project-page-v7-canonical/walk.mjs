/**
 * Project Page V7 browser acceptance.
 */
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const BASE = process.env.ACCEPT_BASE || 'http://127.0.0.1:3066'
const OUT = path.resolve('docs/runtime/melegaswap-v2-project-page-v7-canonical')
const SHOTS = path.join(OUT, 'screenshots')
mkdirSync(SHOTS, { recursive: true })

const PROJECTS = ['mm72', 'marco', 'eyed', 'blion', 'young-degens']
const UNCLAIMED = process.env.UNCLAIMED_TOKEN || 'bsc/0x00000000000000000000000000000000000000aa'

async function main() {
  let chromium
  try {
    ;({ chromium } = await import('playwright-core'))
  } catch {
    ;({ chromium } = await import('playwright'))
  }
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  })

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const results = {
    at: new Date().toISOString(),
    base: BASE,
    projects: {},
    performance: {},
    checks: {},
    bugs: [],
  }

  async function openProject(slug) {
    const t0 = Date.now()
    await page.goto(`${BASE}/@${slug}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    const routeMs = Date.now() - t0
    await page.waitForSelector('[data-project-page="v7"]', { timeout: 15000 }).catch(() => null)
    const shellMs = Date.now() - t0
    await page.waitForTimeout(1200)
    return { routeMs, shellMs }
  }

  async function inspect(slug) {
    return page.evaluate((s) => {
      const root = document.querySelector('[data-project-page="v7"]')
      const text = document.body.innerText || ''
      const contract = document.querySelector('[data-testid="project-v7-contract"]')
      const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      const chartEmpty = Boolean(document.querySelector('[data-chart-empty="compact"]'))
      const swap = Boolean(document.querySelector('[data-testid="project-v7-swap"]'))
      const smartCta = Boolean(document.querySelector('[data-testid="project-v7-smart-swap-cta"]'))
      const buyToken = /Buy Token/i.test(text)
      const transparency = /Technical Transparency/i.test(text)
      return {
        slug: s,
        v7: Boolean(root),
        mode: root?.getAttribute('data-project-mode') || null,
        contractFull: contract ? (contract.textContent || '').includes('0x') : false,
        overflow,
        chartEmpty,
        swap,
        smartCta,
        buyToken,
        transparency,
        hierarchy: {
          hero: Boolean(document.querySelector('[data-testid="project-v7-hero"]')),
          market: Boolean(document.querySelector('[data-testid="project-v7-market"]')),
          economy: Boolean(document.querySelector('[data-testid="project-v7-economy"]')),
          intel: Boolean(document.querySelector('[data-testid="project-v7-intel"]')),
          boost: Boolean(document.querySelector('[data-testid="project-v7-boost"]')),
          related: Boolean(document.querySelector('[data-testid="project-v7-related"]')),
        },
      }
    }, slug)
  }

  for (const slug of PROJECTS) {
    try {
      const perf = await openProject(slug)
      results.performance[slug] = perf
      const info = await inspect(slug)
      results.projects[slug] = info
      if (slug === 'marco') {
        await page.screenshot({ path: path.join(SHOTS, 'claimed-desktop.png'), fullPage: true })
        await page.setViewportSize({ width: 390, height: 844 })
        await page.waitForTimeout(400)
        await page.screenshot({ path: path.join(SHOTS, 'claimed-mobile.png'), fullPage: true })
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.locator('[data-testid="project-v7-terminal"]').screenshot({
          path: path.join(SHOTS, 'smart-swap-hero.png'),
        }).catch(() => null)
        await page.locator('[data-testid="project-v7-economy"]').screenshot({
          path: path.join(SHOTS, 'project-economy.png'),
        }).catch(() => null)
        await page.locator('[data-testid="project-v7-intel"]').screenshot({
          path: path.join(SHOTS, 'activity-score.png'),
        }).catch(() => null)
      }
      if (!info.v7) results.bugs.push(`${slug}: missing v7 shell`)
      if (info.buyToken) results.bugs.push(`${slug}: Buy Token visible`)
      if (info.transparency) results.bugs.push(`${slug}: Technical Transparency visible`)
      if (perf.shellMs > 1500) results.bugs.push(`${slug}: shell ${perf.shellMs}ms > 1500`)
    } catch (e) {
      results.bugs.push(`${slug}: ${e.message}`)
    }
  }

  try {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE}/token/${UNCLAIMED}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForSelector('[data-project-mode="unclaimed"]', { timeout: 15000 }).catch(() => null)
    await page.waitForTimeout(800)
    const unclaimed = await page.evaluate(() => ({
      mode: document.querySelector('[data-project-page="v7"]')?.getAttribute('data-project-mode'),
      claimCta: Boolean(document.querySelector('[data-testid="project-v7-claim-cta"]')),
      desc: Boolean(document.querySelector('[data-testid="project-v7-desc"]')),
    }))
    results.checks.unclaimed = unclaimed
    await page.screenshot({ path: path.join(SHOTS, 'unclaimed-desktop.png'), fullPage: true })
    if (unclaimed.mode !== 'unclaimed') results.bugs.push('unclaimed mode missing')
    if (!unclaimed.claimCta) results.bugs.push('unclaimed claim CTA missing')
  } catch (e) {
    results.bugs.push(`unclaimed: ${e.message}`)
  }

  results.checks.pass = results.bugs.length === 0
  writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(results, null, 2))
  const perfSummary = {
    at: results.at,
    targetShellMs: 1500,
    byProject: results.performance,
  }
  writeFileSync(path.join(OUT, 'performance.json'), JSON.stringify(perfSummary, null, 2))
  await browser.close()
  console.log(JSON.stringify({ pass: results.checks.pass, bugs: results.bugs }, null, 2))
  if (!results.checks.pass) process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
