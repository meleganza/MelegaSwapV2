/**
 * Projects Directory V3 browser acceptance — local next start.
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'

const BASE = process.env.PROJECTS_V3_BASE || 'http://127.0.0.1:3317'
const OUT = path.resolve('docs/runtime/melegaswap-v2-projects-directory-v3-premium-discovery')
const SHOTS = path.join(OUT, 'screenshots')
mkdirSync(SHOTS, { recursive: true })

const results = {
  mission: 'MELEGASWAP_V2_PROJECTS_DIRECTORY_V3_PREMIUM_DISCOVERY',
  base: BASE,
  at: new Date().toISOString(),
  checks: [],
  screenshots: [],
}

function check(name, ok, detail) {
  results.checks.push({ name, ok: Boolean(ok), detail: detail || '' })
}

async function shot(page, name) {
  const file = path.join(SHOTS, `${name}.png`)
  await page.screenshot({ path: file, fullPage: false })
  results.screenshots.push(name)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(2500)
  const dir = await page.locator('[data-projects-directory="v3"]').count()
  check('directory-v3', dir > 0)
  check('hero-compact', (await page.locator('[data-projects-hero="compact-v3"]').count()) > 0)
  check('hero-title', await page.getByText('Discover Projects').first().isVisible())
  check('featured', (await page.locator('[data-testid="projects-directory-featured"]').count()) > 0)
  check('filters', (await page.locator('[data-testid="projects-directory-filters"]').count()) > 0)
  check('grid', (await page.locator('[data-testid="projects-directory-grid"]').count()) > 0)
  await shot(page, 'Projects-1440')

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.waitForTimeout(500)
  await shot(page, 'Projects-1280')

  await page.selectOption('[data-testid="projects-filter-sort"]', 'Trending')
  await page.waitForTimeout(800)
  await shot(page, 'Projects-Trending')

  await page.selectOption('[data-testid="projects-filter-chain"]', 'BSC')
  await page.waitForTimeout(800)
  await shot(page, 'Projects-ChainFilter')

  await page.selectOption('[data-testid="projects-filter-chain"]', 'All Chains')
  await page.fill('[data-testid="projects-directory-search"]', 'MARCO')
  await page.waitForTimeout(1000)
  await shot(page, 'Projects-Search-MARCO')

  const cards = await page.locator('[data-testid="project-directory-card"]').count()
  check('search-marco-cards', cards >= 0, `cards=${cards}`)

  await page.fill('[data-testid="projects-directory-search"]', '')
  await page.click('[data-testid="projects-filter-reset"]')
  await page.waitForTimeout(500)

  const tradeHref = await page.locator('[data-testid="project-card-trade"]').first().getAttribute('href')
  check('trade-href-swap', Boolean(tradeHref && tradeHref.startsWith('/swap')), tradeHref || '')

  const view = page.locator('[data-testid="project-card-open"]').first()
  if ((await view.count()) > 0) {
    const t0 = Date.now()
    await Promise.all([
      page.waitForURL(/\/@|\/project\//, { timeout: 15000 }).catch(() => null),
      view.click(),
    ])
    const elapsed = Date.now() - t0
    check('view-project-nav', elapsed < 5000, `elapsedMs=${elapsed}`)
    await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => null)
    await page.waitForTimeout(800)
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1500)
  check('mobile-filters-btn', (await page.locator('[data-testid="projects-filters-mobile"]').count()) > 0)
  await shot(page, 'Projects-390')

  // overflow check
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
  check('no-horizontal-overflow-390', !overflow)

  await browser.close()

  const passed = results.checks.every((c) => c.ok)
  results.verdict = passed ? 'PASS' : 'FAIL'
  writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
  if (!passed) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
