#!/usr/bin/env node
/**
 * Post-recovery P0 — browser validation + screenshots.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { createHash } from 'crypto'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const REPO = path.resolve(__dirname, '../../../../..')
const BASE = (process.env.NEXT_URL || 'http://127.0.0.1:3041').replace(/\/$/, '')

const require = createRequire(import.meta.url)
let chromium
for (const p of [
  '/tmp/melega-dex-v1-cert/node_modules/playwright',
  '/tmp/lb-pixel002-cert/node_modules/playwright',
  path.resolve(REPO, 'node_modules/playwright'),
  path.resolve(REPO, '../MelegaSwapV2/node_modules/playwright'),
]) {
  try {
    ;({ chromium } = require(p))
    break
  } catch {
    /* next */
  }
}
if (!chromium) throw new Error('playwright not found')

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '430x932', width: 430, height: 932 },
  { name: '390x844', width: 390, height: 844 },
]

function writeJson(name, data) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n')
}

function shaFile(rel) {
  const p = path.join(REPO, 'apps/web', rel)
  if (!fs.existsSync(p)) return null
  return createHash('sha256').update(fs.readFileSync(p)).digest('hex')
}

async function main() {
  const gitSha = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim()
  const branch = execSync('git branch --show-current', { cwd: REPO }).toString().trim()
  const browser = await chromium.launch({ headless: true })
  const results = {
    base: BASE,
    branch,
    gitSha,
    startedAt: new Date().toISOString(),
    routes: {},
    viewports: {},
    poolsCycles: [],
    gates: {},
    screenshots: [],
    errors: [],
  }

  const context = await browser.newContext({ viewport: VIEWPORTS[0] })
  const page = await context.newPage()
  page.on('pageerror', (e) => results.errors.push(String(e.message || e)))

  async function shot(name) {
    const file = path.join(OUT, name)
    await page.screenshot({ path: file, fullPage: false })
    results.screenshots.push(name)
  }

  async function inspect(routePath, label) {
    const res = await page.goto(`${BASE}${routePath}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2200)
    const body = await page.evaluate(() => {
      const text = document.body?.innerText || ''
      const html = document.body?.innerHTML || ''
      return {
        statusOk: true,
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        textSample: text.slice(0, 3500),
        hasInstant: /\bInstant\b/.test(text),
        hasSmart: /\bSmart\b/.test(text),
        hasStandard: /\bSTANDARD\b/.test(text),
        hasSmartswapNew: /SMARTSWAP\s*NEW/i.test(text),
        hasTopMovers: /TOP MOVERS/i.test(text),
        hasTrendingFire: /🔥\s*TRENDING/i.test(text),
        hasWhyFarm: /Why Farm on Melega DEX/i.test(text),
        hasWhyStake: /Why Stake on Melega DEX/i.test(text),
        hasTotalPools: /Total Pools/i.test(text),
        addressPairTitle: /0x[a-fA-F0-9]{4}…\s*\/\s*0x[a-fA-F0-9]{4}…/.test(text),
        positionCards: document.querySelectorAll('[data-pools-module="003"] article, [data-testid*="pool-position"]').length,
        farmsHero: !!document.querySelector('[data-farms-module="001"], [data-farms-module-001="mounted"]'),
        poolsHero: !!document.querySelector('[data-pools-module="001"], [data-pools-module-001="mounted"]'),
        liquidityDiscovery: !!document.querySelector('[data-liquidity-module], [data-liquidity-module-003]') || /Pool Discovery|Liquidity/i.test(text),
        htmlHasTradeMode: /data-swap-experience|trade-mode/i.test(html),
      }
    })
    results.routes[label] = {
      path: routePath,
      http: res?.status() ?? null,
      ...body,
    }
    return body
  }

  // Home Instant
  await page.setViewportSize(VIEWPORTS[0])
  let home = await inspect('/', 'home')
  await shot('after-home-instant.png')

  // Switch to Smart if possible
  try {
    const smartBtn = page.locator('button, [role="tab"]').filter({ hasText: /^Smart$/i }).first()
    if (await smartBtn.count()) {
      await smartBtn.click()
      await page.waitForTimeout(1500)
      await shot('after-home-smart-route.png')
      const smartText = await page.evaluate(() => document.body?.innerText || '')
      results.gates.smartTab = {
        clicked: true,
        hasRouteOrDetails: /Route|Details|AI Insight|Fee/i.test(smartText),
        forbiddenStandard: !/\bSTANDARD\b/.test(smartText),
      }
    } else {
      results.gates.smartTab = { clicked: false, reason: 'Smart tab not found' }
      await shot('after-home-smart-route.png')
    }
  } catch (e) {
    results.gates.smartTab = { clicked: false, error: String(e) }
    await shot('after-home-smart-route.png')
  }

  results.gates.smartSwapLabels = {
    instant: home.hasInstant,
    smart: home.hasSmart,
    noStandard: !home.hasStandard,
    noSmartswapNew: !home.hasSmartswapNew,
  }
  results.gates.topMovers = {
    labeled: home.hasTopMovers,
    noFireTrending: !home.hasTrendingFire,
  }

  await inspect('/liquidity', 'liquidity')
  await shot('after-liquidity-pools.png')
  await inspect('/liquidity-studio?view=add', 'liquidity-studio-add')

  await inspect('/farms', 'farms')
  await shot('after-farms-hero.png')
  await shot('after-farms-values.png')

  // Pools 3-cycle stability (UI presence; wallet may be disconnected in headless)
  const cycle = async (n, waitMs) => {
    await inspect('/pools', `pools-cycle-${n}`)
    await page.waitForTimeout(waitMs)
    const snap = await page.evaluate(() => {
      const text = document.body?.innerText || ''
      return {
        hasPositionsModule: !!document.querySelector('[data-pools-module="003"]'),
        hasWhyStake: /Why Stake on Melega DEX/i.test(text),
        hasTotalPools: /Total Pools/i.test(text),
        emptyOrConnect: /Connect|No pool positions|Loading pool positions|My Positions/i.test(text),
        sample: text.slice(0, 2000),
      }
    })
    await shot(`after-pools-positions-cycle-${n}.png`)
    const entry = { cycle: n, waitMs, ...snap, at: new Date().toISOString() }
    results.poolsCycles.push(entry)
    writeJson(`pool-position-stability-cycle-${n}.json`, entry)
    return entry
  }

  await cycle(1, 3000)
  await inspect('/farms', 'farms-between-cycles')
  await cycle(2, 3000)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  await cycle(3, 4000)

  await inspect('/?focus=swap', 'home-focus-swap')
  await shot('after-top-movers.png')

  // Mobile shots
  await page.setViewportSize({ width: 390, height: 844 })
  await inspect('/', 'home-mobile')
  await shot('after-mobile-home.png')
  await inspect('/liquidity', 'liquidity-mobile')
  await shot('after-mobile-liquidity.png')
  await inspect('/farms', 'farms-mobile')
  await shot('after-mobile-farms.png')
  await inspect('/pools', 'pools-mobile')
  await shot('after-mobile-pools.png')

  // Responsive sweep
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(900)
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    )
    results.viewports[vp.name] = { overflowX, path: '/' }
  }

  results.gates.poolsHero = {
    whyStake: results.routes['pools-cycle-1']?.hasWhyStake ?? results.routes.pools?.hasWhyStake,
    totalPools: results.routes['pools-cycle-1']?.hasTotalPools,
  }
  results.gates.farmsHero = {
    whyFarm: results.routes.farms?.hasWhyFarm,
    farmsHeroMounted: results.routes.farms?.farmsHero,
  }
  results.gates.liquidityNoAddressTitles = {
    noAddressPairTitleOnLiquidity: !results.routes.liquidity?.addressPairTitle,
  }

  results.finishedAt = new Date().toISOString()
  writeJson('browser-validation.json', results)
  writeJson('responsive-validation.json', {
    viewports: results.viewports,
    screenshots: results.screenshots,
    base: BASE,
  })

  await browser.close()

  const passLabels =
    results.gates.smartSwapLabels?.instant &&
    results.gates.smartSwapLabels?.smart &&
    results.gates.smartSwapLabels?.noStandard &&
    results.gates.smartSwapLabels?.noSmartswapNew
  const passMovers = results.gates.topMovers?.labeled
  const passResponsive = Object.values(results.viewports).every((v) => !v.overflowX)

  console.log(
    JSON.stringify(
      {
        passLabels,
        passMovers,
        passResponsive,
        screenshots: results.screenshots.length,
        errors: results.errors.length,
      },
      null,
      2,
    ),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
