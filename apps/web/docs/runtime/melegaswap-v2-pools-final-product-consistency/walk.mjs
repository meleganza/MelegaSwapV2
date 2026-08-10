/**
 * Pools final product consistency — browser acceptance.
 */
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.ACCEPT_BASE || 'http://127.0.0.1:3067'
const OUT = __dirname
const SHOTS = path.join(OUT, 'screenshots')
mkdirSync(SHOTS, { recursive: true })

async function loadChromium() {
  const candidates = [
    'playwright-core',
    'playwright',
    '/tmp/pools-pw/node_modules/playwright-core/index.mjs',
  ]
  for (const id of candidates) {
    try {
      const mod = await import(id)
      if (mod.chromium) return mod.chromium
    } catch {
      /* try next */
    }
  }
  throw new Error('playwright-core not available')
}

async function main() {
  const chromium = await loadChromium()
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const results = {
    at: new Date().toISOString(),
    base: BASE,
    viewports: {},
    checks: {},
    bugs: [],
  }

  async function goto(url) {
    await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(2500)
  }

  async function shot(name) {
    await page.screenshot({ path: path.join(SHOTS, name), fullPage: false })
  }

  // Home Top Pools regression surface
  await goto('/')
  const home = await page.evaluate(() => {
    const text = document.body.innerText || ''
    return {
      healthy: !/Application error/i.test(text),
      hasTopPools: /Top Pools/i.test(text),
    }
  })
  results.checks.home = home
  if (!home.healthy) results.bugs.push('home unhealthy')

  // Pools page 1440
  await goto('/pools')
  await page.waitForSelector('[data-testid="pools-explore-pools-module"], [data-ps-pool-explorer]', {
    timeout: 20000,
  }).catch(() => null)
  await page.waitForTimeout(2000)

  const pools1440 = await page.evaluate(() => {
    const text = document.body.innerText || ''
    const explore = document.querySelector('[data-testid="pools-explore-pools-module"]')
    const toolbar = document.querySelector('[data-testid="pools-explore-toolbar"]')
    const my = document.querySelector('[data-testid="pools-my-positions-module"]')
    const manage = /Manage/i.test(
      Array.from(document.querySelectorAll('[data-testid="pools-explore-card"]'))
        .map((el) => el.textContent || '')
        .join('\n'),
    )
    const stake = Boolean(document.querySelector('[data-testid="pools-explore-stake"]'))
    const viewPool = Boolean(document.querySelector('[data-testid="pools-explore-view-pool"]'))
    const spark = document.querySelectorAll('[data-testid="pools-explore-activity-spark"]').length
    const cards = document.querySelectorAll('[data-testid="pools-explore-card"]').length
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    return {
      healthy: !/Application error/i.test(text),
      explore: Boolean(explore),
      toolbar: Boolean(toolbar),
      myPositionsShown: Boolean(my),
      managePresent: manage,
      stake,
      viewPool,
      spark,
      cards,
      overflow,
      viewAllLabel: Boolean(document.querySelector('[data-testid="pools-view-all-my-positions"]')),
      viewAllText: document.querySelector('[data-testid="pools-view-all-my-positions"]')?.textContent || null,
    }
  })
  results.viewports['1440'] = pools1440
  await shot('pools-1440.png')
  await page.locator('[data-testid="pools-explore-toolbar"]').screenshot({ path: path.join(SHOTS, 'explore-toolbar.png') }).catch(() => null)
  await page.locator('[data-testid="pools-explore-grid"]').screenshot({ path: path.join(SHOTS, 'explore-pools-cards.png') }).catch(() => null)
  if (pools1440.myPositionsShown) {
    await page.locator('[data-testid="pools-my-positions-module"]').screenshot({ path: path.join(SHOTS, 'my-positions-preview.png') }).catch(() => null)
  }
  if (pools1440.managePresent) results.bugs.push('Manage still present on explore cards')
  if (!pools1440.toolbar) results.bugs.push('explore toolbar missing')
  if (!pools1440.stake || !pools1440.viewPool) results.bugs.push('Stake/View Pool missing')

  // Explore list
  const listToggle = page.locator('[data-testid="pools-explore-list-toggle"]')
  if (await listToggle.count()) {
    await listToggle.click()
    await page.waitForTimeout(600)
    const listOk = await page.locator('[data-testid="pools-explore-list-header"]').count()
    results.checks.exploreList = listOk > 0
    await shot('explore-pools-list.png')
    if (!listOk) results.bugs.push('explore list header missing')
    await page.locator('[data-testid="pools-explore-cards"]').click().catch(() => null)
  }

  // My positions expand if available
  const viewAll = page.locator('[data-testid="pools-view-all-my-positions"]')
  if (await viewAll.count()) {
    const label = await viewAll.innerText()
    results.checks.viewAllLabelExact = label.trim() === 'View all my positions'
    if (label.trim() !== 'View all my positions') results.bugs.push(`bad view-all label: ${label}`)
    await viewAll.click()
    await page.waitForTimeout(500)
    results.checks.expanded = (await page.locator('[data-my-positions-expanded="true"]').count()) > 0
    await shot('my-positions-expanded-cards.png')
    await page.locator('[data-testid="pools-my-positions-list-toggle"]').click().catch(() => null)
    await page.waitForTimeout(400)
    await shot('my-positions-expanded-list.png')
    await viewAll.click()
    await page.waitForTimeout(400)
    results.checks.showLess = (await viewAll.innerText()).trim() === 'View all my positions' || (await page.locator('[data-my-positions-expanded="false"]').count()) > 0
  } else {
    results.checks.myPositionsHiddenOrFew = true
  }

  // Create Pool token selector portal
  const createBtn = page.locator('button:has-text("Create Pool"), [data-testid*="create-pool"]').first()
  if (await createBtn.count()) {
    await createBtn.click().catch(() => null)
    await page.waitForTimeout(800)
    const tokenSelect = page.locator('[data-ps-create-token-select]').first()
    if (await tokenSelect.count()) {
      await tokenSelect.click()
      await page.waitForTimeout(400)
      const portal = await page.evaluate(() => {
        const dd = document.querySelector('[data-ps-create-token-dropdown]')
        if (!dd) return { open: false }
        const parent = dd.parentElement
        const inBody = parent === document.body || document.body.contains(dd)
        const style = window.getComputedStyle(dd)
        const rect = dd.getBoundingClientRect()
        return {
          open: true,
          inBody,
          position: style.position,
          zIndex: style.zIndex,
          height: rect.height,
          width: rect.width,
          clippedGuess: rect.height < 40,
        }
      })
      results.checks.tokenSelector = portal
      await shot('create-pool-token-selector.png')
      if (!portal.open) results.bugs.push('token dropdown did not open')
      if (portal.open && portal.position !== 'fixed') results.bugs.push('token dropdown not fixed portal')
      await page.keyboard.press('Escape')
    }
  }

  // 1280 / 1024 / 390
  for (const [w, h, name] of [
    [1280, 800, '1280'],
    [1024, 768, '1024'],
    [390, 844, '390'],
  ]) {
    await page.setViewportSize({ width: w, height: h })
    await goto('/pools')
    await page.waitForTimeout(1500)
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      toolbar: Boolean(document.querySelector('[data-testid="pools-explore-toolbar"]')),
      manage: /Manage/i.test(
        Array.from(document.querySelectorAll('[data-testid="pools-explore-card"]'))
          .map((el) => el.textContent || '')
          .join('\n'),
      ),
    }))
    results.viewports[name] = info
    if (name === '390') await shot('pools-mobile-390.png')
    if (info.overflow) results.bugs.push(`overflow at ${name}`)
    if (info.manage) results.bugs.push(`Manage at ${name}`)
  }

  results.checks.pass = results.bugs.length === 0
  writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(results, null, 2))
  await browser.close()
  console.log(JSON.stringify({ pass: results.checks.pass, bugs: results.bugs }, null, 2))
  if (!results.checks.pass) process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
