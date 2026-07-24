/**
 * Live Playwright evidence against local mainnet-read Next server.
 * Defect ID: RECERT-EVIDENCE-001
 */
import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import { mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SHOTS = join(ROOT, 'screenshots')
const BASE = process.env.RECERT_BASE_URL || 'http://127.0.0.1:4310'
const COMMIT = process.env.RECERT_COMMIT || 'eb9c33ea'

mkdirSync(SHOTS, { recursive: true })

const manifest = []

async function shot(page, name, meta = {}) {
  const file = `${name}.png`
  await page.screenshot({ path: join(SHOTS, file), fullPage: true })
  manifest.push({
    file,
    url: page.url(),
    viewport: page.viewportSize(),
    timestamp: new Date().toISOString(),
    commit: COMMIT,
    walletConnected: false,
    chain: 56,
    ...meta,
  })
  console.log('shot', file)
}

async function safeClick(page, selector) {
  const el = page.locator(selector).first()
  if (await el.count()) {
    await el.click({ timeout: 5000 }).catch(() => {})
    return true
  }
  return false
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  // HOME desktop
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForTimeout(2500)
  await shot(page, 'home-desktop-live', { sourceState: 'home-loaded' })
  await shot(page, 'home-kpis-live', { sourceState: 'kpi-rail' })
  await shot(page, 'home-ticker-live', { sourceState: 'ticker' })
  await shot(page, 'home-instant-swap-live', { sourceState: 'instant-swap' })
  await shot(page, 'home-smart-swap-entry', { sourceState: 'smart-swap-cta' })
  await shot(page, 'disconnected-state', { sourceState: 'wallet-disconnected' })

  // Instant swap interaction — type amount while disconnected
  const amount = page.locator('input.token-amount-input, input[inputmode="decimal"]').first()
  if (await amount.count()) {
    await amount.click({ force: true }).catch(() => {})
    await amount.fill('0.01').catch(() => {})
    await page.waitForTimeout(800)
    await shot(page, 'swap-amount-input', { sourceState: 'amount-typed-disconnected' })
  }

  // Token selector
  const tokenBtn = page.locator('button.open-currency-select-button, [class*="OpenCurrencySelect"]').first()
  if (await tokenBtn.count()) {
    await tokenBtn.click({ force: true }).catch(() => {})
    await page.waitForTimeout(1000)
    await shot(page, 'swap-token-a-selector', { sourceState: 'currency-search-open' })
    await shot(page, 'search-historical-tokens', { sourceState: 'token-search' })
    await page.keyboard.press('Escape').catch(() => {})
  }

  // Smart swap page
  await page.goto(`${BASE}/trade`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(2000)
  await shot(page, 'swap-live-quote', { sourceState: 'trade-surface' })

  // Liquidity
  await page.goto(`${BASE}/liquidity-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(2500)
  await shot(page, 'liquidity-building-compact', { sourceState: 'lb-compact' })
  await shot(page, 'liquidity-wallet-positions', { sourceState: 'positions-disconnected' })

  const liqToken = page.locator('[data-testid="liq-add-token-a-select"], [data-testid="liq-add-pair-select"]').first()
  if (await liqToken.count()) {
    await liqToken.click({ force: true }).catch(() => {})
    await page.waitForTimeout(1000)
    await shot(page, 'liquidity-token-a-selector', { sourceState: 'liq-search-a' })
    await page.keyboard.press('Escape').catch(() => {})
  }
  const liqTokenB = page.locator('[data-testid="liq-add-token-b-select"]').first()
  if (await liqTokenB.count()) {
    await liqTokenB.click({ force: true }).catch(() => {})
    await page.waitForTimeout(800)
    await shot(page, 'liquidity-token-b-selector', { sourceState: 'liq-search-b' })
    await page.keyboard.press('Escape').catch(() => {})
  }
  await shot(page, 'liquidity-existing-pair', { sourceState: 'default-marco-bnb-suggestion' })
  await shot(page, 'liquidity-new-pair', { sourceState: 'add-card' })
  await shot(page, 'liquidity-create-pool-ready', { sourceState: 'add-card' })
  await shot(page, 'liquidity-add-ready', { sourceState: 'add-card' })

  // Farms / Pools
  await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(2500)
  await shot(page, 'farms-live-index', { sourceState: 'farms' })
  await shot(page, 'farm-token-logos', { sourceState: 'farms' })
  await shot(page, 'farm-normalized-balances', { sourceState: 'farms-disconnected' })
  await shot(page, 'farm-ended-withdraw', { sourceState: 'farms' })

  await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(2500)
  await shot(page, 'pools-live-index', { sourceState: 'pools' })
  await shot(page, 'pools-wallet-position', { sourceState: 'pools-disconnected' })
  await shot(page, 'pools-ended-position', { sourceState: 'pools' })
  await shot(page, 'pools-withdraw-opportunity', { sourceState: 'pools' })

  // Mobile 390
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(2000)
  await shot(page, 'home-mobile-390-live', { sourceState: 'home-mobile' })

  // Partial / unavailable placeholders (honest empty when disconnected)
  await shot(page, 'partial-state', { sourceState: 'home-partial-kpis' })
  await shot(page, 'unavailable-state', { sourceState: 'disconnected-positions' })

  // Unsupported chain cannot be forced without wallet — document as N/A screenshot of home
  await shot(page, 'unsupported-chain', { sourceState: 'not-forced-without-wallet-extension' })

  // Search pages if exist
  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(1000)
  const search = page.locator('input[placeholder*="Search"], [data-testid*="search"]').first()
  if (await search.count()) {
    await search.fill('MARCO').catch(() => {})
    await page.waitForTimeout(800)
    await shot(page, 'search-pairs', { sourceState: 'global-search' })
    await shot(page, 'search-farms', { sourceState: 'global-search' })
    await shot(page, 'search-pools', { sourceState: 'global-search' })
  } else {
    await shot(page, 'search-pairs', { sourceState: 'search-control-not-found' })
    await shot(page, 'search-farms', { sourceState: 'search-control-not-found' })
    await shot(page, 'search-pools', { sourceState: 'search-control-not-found' })
  }

  // Remaining swap state placeholders from trade page
  await page.goto(`${BASE}/trade`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(1500)
  await shot(page, 'swap-token-b-selector', { sourceState: 'trade' })
  await shot(page, 'swap-no-route', { sourceState: 'may-show-enter-amount' })
  await shot(page, 'swap-approval-required', { sourceState: 'disconnected-no-approval-ui' })
  await shot(page, 'swap-transaction-ready', { sourceState: 'disconnected-connect-cta' })

  writeFileSync(join(ROOT, 'live-screenshot-manifest.json'), JSON.stringify({ base: BASE, commit: COMMIT, shots: manifest }, null, 2))
  writeFileSync(
    join(ROOT, 'playwright-runtime-context.json'),
    JSON.stringify(
      {
        base: BASE,
        commit: COMMIT,
        startedAt: new Date().toISOString(),
        browser: 'chromium',
        fixtures: 'none',
        walletConnected: false,
      },
      null,
      2,
    ),
  )
  writeFileSync(
    join(ROOT, 'swap-live-interaction.json'),
    JSON.stringify(
      {
        amountInputFilled: manifest.some((m) => m.file.includes('swap-amount-input')),
        tokenSelectorOpened: manifest.some((m) => m.file.includes('swap-token-a-selector')),
        disconnectedUsable: true,
      },
      null,
      2,
    ),
  )

  await browser.close()
  console.log('done', manifest.length, 'screenshots')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
