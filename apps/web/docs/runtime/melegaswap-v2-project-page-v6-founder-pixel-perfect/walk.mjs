/**
 * Project Page V6 browser acceptance.
 */
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const BASE = process.env.ACCEPT_BASE || 'http://127.0.0.1:3066'
const OUT = path.resolve('docs/runtime/melegaswap-v2-project-page-v6-founder-pixel-perfect')
const SHOTS = path.join(OUT, 'screenshots')
mkdirSync(SHOTS, { recursive: true })

const PROJECTS = ['mm72', 'marco', 'eyed', 'blion', 'young-degens']

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
  const results = { at: new Date().toISOString(), base: BASE, projects: {}, performance: {}, checks: {}, bugs: [] }

  async function openProject(slug) {
    const t0 = Date.now()
    await page.goto(`${BASE}/@${slug}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    const routeMs = Date.now() - t0
    await page.waitForSelector('[data-project-page="v6"]', { timeout: 15000 }).catch(() => null)
    const shellMs = Date.now() - t0
    await page.waitForTimeout(1200)
    return { routeMs, shellMs }
  }

  async function inspect(slug) {
    return page.evaluate((s) => {
      const root = document.querySelector('[data-project-page="v6"]')
      const text = document.body.innerText || ''
      const contract = document.querySelector('[data-testid="project-v6-contract"]')
      const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      const farmsEmpty = Boolean(document.querySelector('[data-testid="project-v6-economy-farms-empty"]'))
      const poolsEmpty = Boolean(document.querySelector('[data-testid="project-v6-economy-pools-empty"]'))
      const farmsMeta = document.querySelector('[data-testid="project-v6-economy-farms"]')?.textContent || ''
      const poolsMeta = document.querySelector('[data-testid="project-v6-economy-pools"]')?.textContent || ''
      const chartEmpty = Boolean(document.querySelector('[data-chart-empty="compact"]'))
      const chartPanel = Boolean(document.querySelector('[data-testid="project-v5-chart-panel"], [data-testid="project-v6-chart"]'))
      const swap = Boolean(document.querySelector('[data-testid="project-v6-swap"]'))
      const score = document.querySelector('[data-testid="project-v6-score"]')?.textContent || ''
      const transparency = /Technical Transparency/i.test(text)
      const buyToken = /Buy Token/i.test(text)
      return {
        slug: s,
        v6: Boolean(root),
        contractFull: contract ? (contract.textContent || '').includes('0x') : false,
        overflow,
        farmsEmpty,
        poolsEmpty,
        farmsMeta: farmsMeta.slice(0, 120),
        poolsMeta: poolsMeta.slice(0, 120),
        chartEmpty,
        chartPanel,
        swap,
        hasScore: /Melega Score/i.test(score) || /Melega Score/i.test(text),
        transparency,
        buyToken,
        hierarchy: {
          hero: Boolean(document.querySelector('[data-testid="project-v6-hero"]')),
          market: Boolean(document.querySelector('[data-testid="project-v6-market"]')),
          economy: Boolean(document.querySelector('[data-testid="project-v6-economy"]')),
          intel: Boolean(document.querySelector('[data-testid="project-v6-intel"]')),
          boost: Boolean(document.querySelector('[data-testid="project-v6-boost"]')),
          related: Boolean(document.querySelector('[data-testid="project-v6-related"]')),
        },
      }
    }, slug)
  }

  for (const slug of PROJECTS) {
    const perf = await openProject(slug)
    results.performance[slug] = perf
    const info = await inspect(slug)
    results.projects[slug] = info
    if (['mm72', 'marco', 'eyed'].includes(slug)) {
      await page.screenshot({ path: path.join(SHOTS, `${slug}-desktop.png`), fullPage: false })
      await page.setViewportSize({ width: 390, height: 844 })
      await page.waitForTimeout(400)
      await page.screenshot({ path: path.join(SHOTS, `${slug}-mobile.png`), fullPage: false })
      await page.setViewportSize({ width: 1440, height: 900 })
    }
  }

  // Section shots on MM72
  await openProject('mm72')
  for (const [sel, name] of [
    ['[data-testid="project-v6-economy"]', 'project-economy.png'],
    ['[data-testid="project-v6-intel"]', 'activity-holders-score.png'],
    ['[data-testid="project-v6-boost-console"]', 'boost-console.png'],
  ]) {
    const el = page.locator(sel).first()
    if ((await el.count()) > 0) {
      await el.screenshot({ path: path.join(SHOTS, name) }).catch(async () => {
        await page.screenshot({ path: path.join(SHOTS, name), fullPage: false })
      })
    }
  }

  // Regression smoke
  for (const pathName of ['/', '/liquidity-studio', '/farms', '/pools', '/projects', '/audit']) {
    const t0 = Date.now()
    await page.goto(`${BASE}${pathName}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    results.performance[`nav:${pathName}`] = { routeMs: Date.now() - t0 }
  }

  const allV6 = PROJECTS.every((s) => results.projects[s]?.v6)
  const noTransparency = PROJECTS.every((s) => !results.projects[s]?.transparency)
  const noBuy = PROJECTS.every((s) => !results.projects[s]?.buyToken)
  const shellFast = PROJECTS.every((s) => (results.performance[s]?.shellMs || 99999) < 8000)

  results.checks = {
    allV6,
    noTransparency,
    noBuyTokenCta: noBuy,
    shellUnder8s: shellFast,
    mm72Hierarchy: results.projects.mm72?.hierarchy,
  }
  results.pass = allV6 && noTransparency && noBuy && shellFast

  writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(results, null, 2))
  writeFileSync(
    path.join(OUT, 'performance.json'),
    JSON.stringify({ at: results.at, base: BASE, performance: results.performance }, null, 2),
  )
  console.log(JSON.stringify({ pass: results.pass, checks: results.checks, performance: results.performance }, null, 2))
  await browser.close()
  if (!results.pass) process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
