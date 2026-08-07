/**
 * Supplemental founder acceptance: chain matrix, responsive, List/Claim,
 * Liquidity tabs, Projects search, extra project pages.
 */
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs'
import path from 'path'

const BASE = process.env.ACCEPT_BASE || 'http://127.0.0.1:3320'
const OUT = path.resolve('docs/runtime/melegaswap-v2-founder-release-acceptance-v3')
const SHOTS = path.join(OUT, 'screenshots')
mkdirSync(SHOTS, { recursive: true })

const chainProof = { pages: [], switches: [], crashes: [] }
const responsive = { viewports: [], overflow: [] }
const extra = { projects: {}, list: {}, liquidity: {}, claim: {}, farms: {}, pools: {}, backForward: {} }
const bugs = []

async function main() {
  const { chromium } = await import('playwright-core')
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  async function openChainAndPick(label) {
    // Prefer network/chain control in header
    const candidates = [
      page.locator('button[aria-label*="chain" i]'),
      page.locator('button[aria-label*="network" i]'),
      page.locator('header button').filter({ hasText: /^(BSC|BNB|BNB Chain|Base|ETH|Ethereum|Polygon|Arbitrum|Avalanche|AVAX)$/i }),
      page.getByRole('button', { name: /BNB|BSC|Base|ETH|Polygon|Arbitrum|Avalanche|AVAX/i }),
    ]
    let opened = false
    for (const loc of candidates) {
      if (await loc.count()) {
        try {
          await loc.first().click({ timeout: 2500 })
          opened = true
          break
        } catch {
          /* try next */
        }
      }
    }
    await page.waitForTimeout(500)
    const body = await page.evaluate(() => document.body.innerText)
    const hasModal =
      /BNB Chain|Binance|Avalanche|Arbitrum|Polygon|Ethereum|Base/i.test(body) &&
      (await page.locator('[role="dialog"]').count()) > 0
    const pick = page
      .locator('[role="dialog"] button, [role="dialog"] [role="option"], [role="listbox"] button')
      .filter({ hasText: new RegExp(label, 'i') })
      .first()
    let picked = false
    if (await pick.count()) {
      await pick.click().catch(() => {})
      picked = true
      await page.waitForTimeout(600)
    } else {
      // text match outside dialog
      const btn = page.getByRole('button', { name: new RegExp(`^${label}`, 'i') }).first()
      if (await btn.count()) {
        await btn.click().catch(() => {})
        picked = true
        await page.waitForTimeout(600)
      }
    }
    await page.keyboard.press('Escape').catch(() => {})
    return { opened, hasModal, picked, url: page.url() }
  }

  // --- Chain matrix on Home ---
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(800)
  const sequence = [
    { label: 'Base', match: /Base/i },
    { label: 'Polygon', match: /Polygon/i },
    { label: 'Avalanche|AVAX', match: /Avalanche|AVAX/i },
    { label: 'BNB|BSC', match: /BNB|BSC/i },
  ]
  for (const step of sequence) {
    try {
      const r = await openChainAndPick(step.label.split('|')[0])
      chainProof.switches.push({ page: 'home', target: step.label, ...r })
    } catch (e) {
      chainProof.crashes.push({ page: 'home', target: step.label, err: String(e).slice(0, 160) })
      bugs.push({ severity: 'P0', id: 'chain-switch-crash', detail: String(e).slice(0, 200) })
    }
  }
  await page.screenshot({ path: path.join(SHOTS, 'Chain-Switch.png') })

  // Chain on Liquidity / Farms / Pools / Project
  for (const [name, url] of [
    ['liquidity', `${BASE}/liquidity-studio/`],
    ['farms', `${BASE}/farms/`],
    ['pools', `${BASE}/pools/`],
    ['project', `${BASE}/@mm72/`],
  ]) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(700)
    try {
      const r = await openChainAndPick('Base')
      chainProof.pages.push({ page: name, ...r })
      const r2 = await openChainAndPick('BNB')
      chainProof.pages.push({ page: name, backToBnb: r2 })
    } catch (e) {
      chainProof.crashes.push({ page: name, err: String(e).slice(0, 160) })
    }
  }

  // --- Liquidity tabs / route stability ---
  await page.goto(`${BASE}/liquidity-studio/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  const urls = [page.url()]
  for (const tab of [/My Liquidity/i, /Add Liquidity/i, /AI Liquidity Builder/i]) {
    const t = page.getByRole('button', { name: tab }).or(page.getByRole('tab', { name: tab })).first()
    if (await t.count()) {
      await t.click().catch(() => {})
      await page.waitForTimeout(400)
      urls.push(page.url())
    }
  }
  const oscillation = urls.filter((u, i) => i > 0 && u !== urls[i - 1] && /liquidity/i.test(u)).length > 4
  extra.liquidity = {
    urls,
    oscillation,
    hasMy: /My Liquidity/i.test(await page.content()),
    hasAdd: /Add Liquidity/i.test(await page.content()),
    hasAi: /AI Liquidity Builder/i.test(await page.content()),
  }
  if (oscillation) bugs.push({ severity: 'P0', id: 'liquidity-route-oscillation', detail: urls.join(' -> ') })

  // --- Farms / Pools data truth smoke ---
  await page.goto(`${BASE}/farms/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(900)
  extra.farms = await page.evaluate(() => {
    const text = document.body.innerText
    return {
      featured: /Featured/i.test(text),
      explore: /Explore Farms/i.test(text),
      unavailable: /Source not configured|Waiting\.\.\.|Unavailable/i.test(text),
      hugeBigint: /\b\d{20,}\b/.test(text),
      createFarm: !!Array.from(document.querySelectorAll('button')).find((b) => /Create Farm/i.test(b.textContent || '')),
    }
  })
  if (extra.farms.unavailable) bugs.push({ severity: 'P1', id: 'farms-unavailable-wall', detail: 'Unavailable/Waiting wall' })
  if (extra.farms.hugeBigint) bugs.push({ severity: 'P1', id: 'farms-raw-bigint', detail: 'raw huge integer' })

  await page.goto(`${BASE}/pools/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(900)
  extra.pools = await page.evaluate(() => {
    const text = document.body.innerText
    const fakeFeatured = /—\s*→\s*—\s*Active/i.test(text)
    const myPositionsHeading = Array.from(document.querySelectorAll('h2,h3')).some((h) =>
      /^My Positions$/i.test((h.textContent || '').trim()),
    )
    return {
      fakeFeatured,
      myPositionsHeading,
      explore: /Explore Pools/i.test(text),
      unavailable: /Source not configured|Waiting\.\.\./i.test(text),
      kpis: /TVL|Total Pools|Highest Sustainable APR|My Claimable/i.test(text),
    }
  })
  if (extra.pools.fakeFeatured) bugs.push({ severity: 'P0', id: 'pools-fake-featured', detail: '— → — Active' })

  // --- Projects search ---
  await page.goto(`${BASE}/projects/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  const search = page.getByPlaceholder(/Search/i).first()
  for (const q of ['MARCO', 'MM72', 'EYED', 'Young Degens']) {
    if (await search.count()) {
      await search.fill(q)
      await page.waitForTimeout(700)
    }
    extra.projects[q] = await page.evaluate((query) => {
      const cards = [...document.querySelectorAll('[data-testid="project-directory-card"]')]
      const keys = cards.map((c) => c.getAttribute('data-project-key') || c.getAttribute('href') || c.textContent?.slice(0, 40))
      const sameChainDup = keys.length !== new Set(keys).size
      return { query, cards: cards.length, keys: keys.slice(0, 8), sameChainDup }
    }, q)
  }
  await search.fill('').catch(() => {})

  // Extra project pages
  for (const slug of ['marco', 'eyed', 'blion', 'young-degens']) {
    await page.goto(`${BASE}/@${slug}/`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null)
    await page.waitForTimeout(900)
    extra.projects[`page-${slug}`] = await page.evaluate(() => {
      const text = document.body.innerText
      return {
        title: document.title,
        url: location.pathname,
        smartSwap: /Smart Swap/i.test(text),
        economy: /Project Economy/i.test(text),
        scientific: /\d\.?\d*e-\d+/i.test(text),
        treasury: /TREASURY WALLET/i.test(text),
        boost: /Trend Boost|Featured|Boost Your Project/i.test(text),
      }
    })
    if (extra.projects[`page-${slug}`].scientific) {
      bugs.push({ severity: 'P1', id: `scientific-${slug}`, detail: 'e-N' })
    }
    if (extra.projects[`page-${slug}`].treasury) {
      bugs.push({ severity: 'P0', id: `treasury-${slug}`, detail: 'TREASURY WALLET' })
    }
  }

  // --- List / Claim ---
  await page.goto(`${BASE}/list/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  extra.list = await page.evaluate(() => {
    const text = document.body.innerText
    return {
      h1: document.querySelector('h1')?.textContent?.slice(0, 80),
      claim: /Claim/i.test(text),
      create: /Create|Launch|List/i.test(text),
      deadOops: /Oops something wrong/i.test(text),
    }
  })
  const claimCta = page.getByRole('link', { name: /Claim/i }).or(page.getByRole('button', { name: /Claim/i })).first()
  if (await claimCta.count()) {
    await claimCta.click().catch(() => {})
    await page.waitForTimeout(900)
    extra.claim = await page.evaluate(() => {
      const text = document.body.innerText
      return {
        url: location.href,
        wallet: /Wallet/i.test(text),
        ownership: /Ownership/i.test(text),
        customize: /Customize/i.test(text),
        review: /Review/i.test(text),
        editBeforeOwn: /edit project|arbitrary/i.test(text) && !/Ownership/i.test(text),
      }
    })
  }

  // --- Back / Forward ---
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  await page.locator('nav[aria-label="Primary navigation"] a').filter({ hasText: /^Farms/ }).first().click()
  await page.waitForURL(/farms/, { timeout: 8000 })
  await page.goBack()
  await page.waitForTimeout(500)
  const afterBack = page.url()
  await page.goForward()
  await page.waitForTimeout(500)
  const afterFwd = page.url()
  extra.backForward = { afterBack, afterFwd, ok: /\/$|\/\?/.test(afterBack) && /farms/i.test(afterFwd) }
  if (!extra.backForward.ok) bugs.push({ severity: 'P0', id: 'history-regression', detail: JSON.stringify(extra.backForward) })

  // --- Responsive ---
  for (const w of [1440, 1280, 1024, 768, 390]) {
    await page.setViewportSize({ width: w, height: w === 390 ? 844 : 900 })
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    const o = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    }))
    responsive.viewports.push({ w, ...o })
    if (o.overflow) {
      responsive.overflow.push({ page: 'home', w })
      bugs.push({ severity: 'P1', id: `overflow-home-${w}`, detail: `${o.scrollW}>${o.innerW}` })
    }
    if (w === 1024 || w === 768) {
      await page.screenshot({ path: path.join(SHOTS, `Home-${w}.png`) })
    }
  }

  // Audit distinction re-check
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${BASE}/audit/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  extra.audit = await page.evaluate(() => {
    const text = document.body.innerText
    return {
      score: (text.match(/Melega Score[^\d]*(\d+)/i) || [])[1],
      readiness: (text.match(/Runtime Readiness[^\d]*(\d+)/i) || [])[1],
      distinction: /separate|not part of Melega Score|informational|distinct|does not equal|weights/i.test(text),
      contracts: {
        router: /Router/i.test(text),
        factory: /Factory/i.test(text),
        masterchef: /MasterChef|MasterBuilder/i.test(text),
      },
    }
  })

  writeFileSync(path.join(OUT, 'chain-switch-proof.json'), JSON.stringify(chainProof, null, 2))
  writeFileSync(path.join(OUT, 'responsive-proof.json'), JSON.stringify(responsive, null, 2))
  writeFileSync(path.join(OUT, 'supplement-checklist.json'), JSON.stringify(extra, null, 2))
  writeFileSync(
    path.join(OUT, 'bugs-found-supplement.json'),
    JSON.stringify({ bugs, at: new Date().toISOString() }, null, 2),
  )

  console.log(JSON.stringify({ bugs: bugs.length, chainSwitches: chainProof.switches.length, extraKeys: Object.keys(extra) }, null, 2))
  console.log('BUGS', JSON.stringify(bugs, null, 2))
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
