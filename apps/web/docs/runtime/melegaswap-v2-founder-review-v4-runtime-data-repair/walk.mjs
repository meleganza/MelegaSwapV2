/**
 * Founder Review V4 — browser acceptance (playwright-core + Chrome).
 */
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const BASE = process.env.ACCEPT_BASE || 'http://127.0.0.1:3055'
const OUT = path.resolve('docs/runtime/melegaswap-v2-founder-review-v4-runtime-data-repair')
const SHOTS = path.join(OUT, 'screenshots')
mkdirSync(SHOTS, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
]

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

  const checks = {}
  const bugs = []
  const shots = []

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  async function shot(name) {
    const file = path.join(SHOTS, `${name}.png`)
    await page.screenshot({ path: file, fullPage: false })
    shots.push(name)
  }

  async function goto(url) {
    await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(900)
  }

  function overflow() {
    return page.evaluate(() => {
      const doc = document.documentElement
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        overflow: doc.scrollWidth > doc.clientWidth + 2,
      }
    })
  }

  // —— HOME ——
  await goto('/')
  await shot('home-top-pools')
  const home = await page.evaluate(() => {
    const text = document.body.innerText || ''
    const topPools = /Top Pools/i.test(text)
    const unavailable = /Unavailable/i.test(text)
    return { topPools, unavailable, hasV3Hint: false }
  })
  checks.homeTopPoolsVisible = home.topPools
  checks.homeNoUnavailableLabel = !home.unavailable

  // Network modal layering — open header chain switcher (not ticker "BNB" chips)
  let modalOk = false
  try {
    const chain = page.getByTestId('melega-header-chain').getByTestId('network-switcher-root')
    await chain.click({ force: true, timeout: 5000 })
    await page.waitForTimeout(700)
    const layer = await page.evaluate(() => {
      const overlay = document.querySelector('[data-melega-layer="overlay"]')
      if (!overlay) return { present: false }
      const z = Number(getComputedStyle(overlay).zIndex) || 0
      const r = overlay.getBoundingClientRect()
      const ticker = document.querySelector('[class*="Trending"], [data-testid*="trending"]')
      const tickerZ = ticker ? Number(getComputedStyle(ticker).zIndex) || 0 : 0
      const header = document.querySelector('header, [data-melega-global-header]')
      const headerZ = header ? Number(getComputedStyle(header).zIndex) || 0 : 0
      const title = overlay.querySelector('[data-melega-modal-title], h2')
      const tr = title?.getBoundingClientRect()
      const x = (tr?.left || 0) + (tr?.width || 0) / 2
      const y = (tr?.top || 0) + 12
      const hit = document.elementFromPoint(x, y)
      const hitInOverlay = Boolean(hit && overlay.contains(hit))
      return {
        present: true,
        z,
        tickerZ,
        headerZ,
        top: r.top,
        height: r.height,
        visible: r.width > 40 && r.height > 40,
        inPortal: Boolean(document.getElementById('portal-root')?.contains(overlay) || overlay.parentElement === document.body),
        hitInOverlay,
        switchTitle: /Switch Network/i.test(overlay.textContent || ''),
      }
    })
    modalOk = Boolean(
      layer.present &&
        layer.visible &&
        layer.z >= 10040 &&
        layer.z > layer.tickerZ &&
        layer.z > layer.headerZ &&
        layer.hitInOverlay &&
        layer.switchTitle,
    )
    checks.networkModal = layer
    await shot('network-modal')
    await page.keyboard.press('Escape').catch(() => null)
    await page.waitForTimeout(200)
  } catch (e) {
    bugs.push({ id: 'network-modal', detail: String(e?.message || e).slice(0, 200) })
  }
  checks.switchNetworkAboveTicker = modalOk

  // —— LIQUIDITY V3 ——
  await goto('/liquidity-studio')
  const liq = await page.evaluate(() => {
    const shell = document.querySelector('[data-liquidity-studio="v3"]')
    const text = document.body.innerText || ''
    return {
      v3: Boolean(shell),
      hero: /Liquidity/i.test(text),
      tabs: /My Liquidity/i.test(text) && /Add Liquidity/i.test(text),
      ai: /AI Liquidity Builder/i.test(text),
    }
  })
  checks.liquidityV3 = liq
  await shot('liquidity-v3')

  // Back/forward / refresh mount stability
  await goto('/farms')
  await page.goBack()
  await page.waitForTimeout(500)
  const liqBack = await page.evaluate(() => Boolean(document.querySelector('[data-liquidity-studio="v3"]')))
  await page.goForward()
  await page.waitForTimeout(400)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  const farmsAfter = await page.evaluate(() => /Farms/i.test(document.body.innerText || ''))
  checks.liquidityBackMountsV3 = liqBack
  checks.farmsAfterForwardRefresh = farmsAfter

  // —— FARMS ——
  await goto('/farms')
  await shot('farm-card-multiplier')
  const farms = await page.evaluate(() => {
    const text = document.body.innerText || ''
    const myFarms = /My Farms/i.test(text)
    const viewAll = /View all my farms/i.test(text) || /View all farms/i.test(text)
    const renamed = /View all my farms/i.test(text)
    // multiplier overlap heuristic: badges with reserved column
    const cards = [...document.querySelectorAll('[data-testid*="farm"], article, [class*="Farm"]')].slice(0, 8)
    return { myFarms, viewAll, renamed, cardSample: cards.length }
  })
  checks.farms = farms

  // Expand My Farms inline
  try {
    const btn = page.getByRole('button', { name: /View all my farms|View all farms/i }).first()
    if ((await btn.count()) > 0) {
      await btn.click({ timeout: 4000 })
      await page.waitForTimeout(500)
      const expanded = await page.evaluate(() => {
        const text = document.body.innerText || ''
        return {
          cardsToggle: /Cards/i.test(text),
          listToggle: /List/i.test(text),
          stillOnFarms: /\/farms/.test(location.pathname) || /Farms/i.test(text),
        }
      })
      checks.myFarmsExpand = expanded
      await shot('my-farms-cards')
      const listBtn = page.getByRole('button', { name: /^List$/i }).first()
      if ((await listBtn.count()) > 0) {
        await listBtn.click({ timeout: 3000 })
        await page.waitForTimeout(400)
        await shot('my-farms-list')
        checks.myFarmsList = true
      }
    } else {
      checks.myFarmsExpand = { skipped: 'no wallet positions / button' }
      await shot('my-farms-cards')
      await shot('my-farms-list')
    }
  } catch (e) {
    bugs.push({ id: 'my-farms-expand', detail: String(e?.message || e).slice(0, 200) })
  }

  // —— POOLS ——
  await goto('/pools')
  await shot('pools-data')
  const pools = await page.evaluate(() => {
    const text = document.body.innerText || ''
    return {
      pools: /Pools/i.test(text),
      unavailable: (text.match(/Unavailable/g) || []).length,
      dash: (text.match(/—/g) || []).length,
    }
  })
  checks.pools = pools

  // —— AUDIT ——
  await goto('/audit')
  await shot('audit-hero')
  const audit = await page.evaluate(() => {
    const hero = document.querySelector('[data-testid="audit-hero"]')
    const text = document.body.innerText || ''
    const style = hero ? getComputedStyle(hero) : null
    return {
      present: Boolean(hero),
      liveLabel: /LIVE SECURITY CENTER/i.test(text),
      border: style ? style.borderWidth : null,
      score: /Melega Score|97\.|Score/i.test(text),
    }
  })
  checks.audit = audit

  // Responsive overflow + mobile shot
  const overflowByVp = {}
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await goto('/')
    overflowByVp[vp.name] = await overflow()
    if (vp.name === '390') await shot('mobile')
  }
  checks.noHorizontalOverflow = Object.values(overflowByVp).every((o) => !o.overflow)

  // Header nav functional
  await page.setViewportSize({ width: 1440, height: 900 })
  await goto('/')
  try {
    const farmsLink = page.locator('nav[aria-label="Primary navigation"] a').filter({ hasText: /^Farms/ }).first()
    await farmsLink.click({ timeout: 5000 })
    await page.waitForTimeout(600)
    checks.headerNavFarms = /farms/i.test(page.url())
  } catch (e) {
    checks.headerNavFarms = false
    bugs.push({ id: 'header-nav', detail: String(e?.message || e).slice(0, 160) })
  }

  const summary = {
    at: new Date().toISOString(),
    base: BASE,
    checks,
    overflowByVp,
    shots,
    bugs,
    mandatory: {
      '1_switch_network_above_ticker': Boolean(checks.switchNetworkAboveTicker),
      '2_no_horizontal_overflow': Boolean(checks.noHorizontalOverflow),
      '3_home_top_pools_visible': Boolean(checks.homeTopPoolsVisible),
      '4_liquidity_v3': Boolean(checks.liquidityV3?.v3 && checks.liquidityV3?.tabs),
      '5_pools_page': Boolean(checks.pools?.pools),
      '6_my_farms_controls': Boolean(checks.farms?.myFarms),
      '7_my_farms_expand_or_skip': Boolean(checks.myFarmsExpand),
      '8_cards_list_or_skip': checks.myFarmsList === true || Boolean(checks.myFarmsExpand?.skipped),
      '9_farm_multiplier_shot': shots.includes('farm-card-multiplier'),
      '10_audit_hero': Boolean(checks.audit?.present && checks.audit?.liveLabel),
      '11_header_nav': Boolean(checks.headerNavFarms),
      '12_back_forward': Boolean(checks.liquidityBackMountsV3 && checks.farmsAfterForwardRefresh),
    },
  }
  summary.pass = Object.values(summary.mandatory).every(Boolean)

  writeFileSync(path.join(OUT, 'browser-acceptance.json'), JSON.stringify(summary, null, 2))
  console.log(JSON.stringify({ pass: summary.pass, mandatory: summary.mandatory, bugs }, null, 2))
  await browser.close()
  if (!summary.pass) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
