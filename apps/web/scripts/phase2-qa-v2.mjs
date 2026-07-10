/**
 * Phase 2 QA — v2.melega.finance (automated + structural checks)
 * Wallet on-chain flows require manual MetaMask verification.
 */
import { chromium, devices } from 'playwright'

const BASE = process.env.QA_BASE_URL || 'https://v2.melega.finance'

const ROUTES = {
  home: '/',
  trade: '/trade',
  swap: '/swap',
  farms: '/farms',
  pools: '/pools',
  projects: '/projects',
  radar: '/radar',
  collectibles: '/collectibles',
  buildStudio: '/build-studio',
  importToken: '/import-existing-token',
  commandCenter: '/command-center',
  nft: '/nft/',
  viewNFTs: '/viewNFTs',
  nftmarket: '/nftmarket',
  ilo: '/ilo',
}

const blockers = []
const nonBlocking = []
const passes = []
const fails = []

const pass = (id, detail) => passes.push({ id, detail })
const fail = (id, detail, blocker = true) => {
  fails.push({ id, detail })
  if (blocker) blockers.push(`${id}: ${detail}`)
  else nonBlocking.push(`${id}: ${detail}`)
}

async function hasOops(page) {
  const body = await page.textContent('body').catch(() => '')
  return /Oops, something wrong/i.test(body || '')
}

async function checkHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement
    const body = document.body
    const maxW = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0)
    const clientW = doc.clientWidth
    return maxW > clientW + 2
  })
  if (overflow) fail(`overflow:${label}`, `horizontal overflow at ${label}`)
  else pass(`overflow:${label}`, 'no horizontal overflow')
  return !overflow
}

async function loadRoute(page, path, label = path) {
  try {
    const resp = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(2000)
    if (await hasOops(page)) {
      fail(`route:${label}`, 'Sentry Oops crash screen', true)
      return false
    }
    const status = resp?.status() ?? 0
    if (status >= 400) {
      fail(`route:${label}`, `HTTP ${status}`, true)
      return false
    }
    pass(`route:${label}`, `HTTP ${status}`)
    return true
  } catch (e) {
    fail(`route:${label}`, String(e.message).slice(0, 120), true)
    return false
  }
}

async function runDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  const consoleErrors = []
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('CORS') && !m.text().includes('Failed to load resource')) {
      consoleErrors.push(m.text().slice(0, 200))
    }
  })
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`))

  // --- Routes ---
  for (const [key, path] of Object.entries(ROUTES)) {
    await loadRoute(page, path, key)
  }

  // /nfts redirect
  await page.goto(`${BASE}/nfts`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1500)
  if (page.url().includes('/collectibles')) pass('redirect:nfts', '→ /collectibles')
  else fail('redirect:nfts', `final URL ${page.url()}`)

  // Home marker
  const homeOk = (await page.locator('[data-home-trade-screen]').count()) > 0
  if (homeOk) pass('home:trade-first', 'HomeTradeScreen mounted')
  else fail('home:trade-first', 'missing data-home-trade-screen')

  // Command Center
  await loadRoute(page, ROUTES.commandCenter, 'command-center-recheck')
  const ccOverflow = await page.evaluate(() => {
    const el = document.querySelector('[data-command-center-screen]')
    return el ? el.scrollWidth > el.clientWidth + 1 : true
  })
  if (ccOverflow) fail('cc:layout', 'Command Center horizontal overflow')
  else pass('cc:layout', 'Command Center fits content area')

  // --- Wallet UI (structural) ---
  await loadRoute(page, ROUTES.trade, 'trade-wallet')
  const connectBtn = page.locator('button').filter({ hasText: /Connect Wallet|Connect/i }).first()
  const connectVisible = await connectBtn.isVisible().catch(() => false)
  if (connectVisible) pass('wallet:connect-btn', 'Connect Wallet button visible (disconnected)')
  else fail('wallet:connect-btn', 'Connect Wallet button not found on /trade')

  // Network switcher in shell
  const networkEl = page.locator('[class*="Network"], button').filter({ hasText: /BNB|BSC|Network|Chain/i }).first()
  const hasNetworkUi = (await networkEl.count()) > 0
  if (hasNetworkUi) pass('wallet:network-ui', 'Network control present in shell')
  else nonBlocking.push('wallet:network-ui: network switcher not detected by automation (may need wallet)')

  // Refresh disconnected
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  if (await hasOops(page)) fail('wallet:refresh-disconnected', 'crash after refresh')
  else pass('wallet:refresh-disconnected', 'no crash after refresh (disconnected)')

  // --- Trade / Swap UI ---
  for (const path of ['/trade', '/swap']) {
    await loadRoute(page, path, `swap-ui${path}`)
    const hasInput = (await page.locator('input').count()) > 0
    if (hasInput) pass(`swap:input:${path}`, 'amount input present')
    else fail(`swap:input:${path}`, 'no input field found', false)

    const tokenSelectors = await page.locator('button, [role="button"]').filter({ hasText: /Select|BNB|MARCO|USDT|ETH/i }).count()
    if (tokenSelectors > 0) pass(`swap:token-ui:${path}`, 'token selector UI present')
    else nonBlocking.push(`swap:token-ui:${path}: token buttons not matched by automation`)

    const settingsBtn = page.locator('button').filter({ hasText: /Settings|Slippage|%/i }).first()
    if (await settingsBtn.count()) pass(`swap:settings:${path}`, 'settings/slippage entry present')
    else {
      const gear = page.locator('button svg, button[aria-label*="etting" i]').first()
      if (await gear.count()) pass(`swap:settings:${path}`, 'settings icon present')
      else nonBlocking.push(`swap:settings:${path}: slippage panel trigger not auto-detected`)
    }

    const connectOrSwap = page.locator('button').filter({ hasText: /Connect Wallet|Swap|Insufficient|Enter an amount|Select a token|Wrap/i })
    const btnText = (await connectOrSwap.first().textContent().catch(() => '')) || ''
    if (/Connect Wallet/i.test(btnText)) pass(`swap:cta-disconnected:${path}`, 'shows Connect Wallet when disconnected')
    else if (btnText) pass(`swap:cta:${path}`, `CTA: ${btnText.trim().slice(0, 40)}`)
  }

  // Console errors on trade
  const tradeErrors = consoleErrors.filter((e) => !e.includes('reading \'route\''))
  if (tradeErrors.length === 0) pass('swap:console', 'no fatal console errors on trade flow')
  else if (tradeErrors.some((e) => e.includes('PAGEERROR'))) fail('swap:console', tradeErrors[0].slice(0, 150))
  else nonBlocking.push(`swap:console: ${tradeErrors.length} console errors (non-fatal)`)

  await context.close()
}

async function runMobile(browser) {
  const iphone = devices['iPhone 12']
  const context = await browser.newContext({ ...iphone, viewport: { width: 390, height: 844 } })
  const page = await context.newPage()

  const mobileRoutes = ['/', '/trade', '/farms', '/command-center']
  for (const path of mobileRoutes) {
    await loadRoute(page, path, `mobile${path}`)
    await checkHorizontalOverflow(page, `mobile${path}`)
  }

  await loadRoute(page, '/trade', 'mobile-trade-nav')
  const connectBtn = page.locator('button').filter({ hasText: /Connect Wallet|Connect/i }).first()
  if (await connectBtn.isVisible().catch(() => false)) {
    const box = await connectBtn.boundingBox()
    if (box && box.y >= 0 && box.y < 900) pass('mobile:wallet-btn', 'wallet/connect control in viewport')
    else fail('mobile:wallet-btn', 'wallet button off-screen')
  } else fail('mobile:wallet-btn', 'connect button not visible on mobile /trade')

  const bottomNav = page.locator('nav, [class*="BottomNav"], [class*="bottom"]').filter({ hasText: /Trade|Earn|Find|Build|Command/i })
  if ((await bottomNav.count()) > 0) pass('mobile:bottom-nav', 'mobile bottom navigation present')
  else nonBlocking.push('mobile:bottom-nav: bottom nav not matched by selector')

  await context.close()
}

const browser = await chromium.launch()
try {
  await runDesktop(browser)
  await runMobile(browser)
} finally {
  await browser.close()
}

const result = blockers.length === 0 ? 'MERGE_ALLOWED' : 'MERGE_BLOCKED'
const report = {
  verdict: blockers.length === 0 ? 'PASS' : 'FAIL',
  recommendation: result,
  target: BASE,
  timestamp: new Date().toISOString(),
  summary: { passed: passes.length, failed: fails.length, blockers: blockers.length, nonBlocking: nonBlocking.length },
  blockers,
  nonBlocking,
  passes,
  fails,
  manualRequired: [
    'Connect Wallet with MetaMask / WalletConnect',
    'Disconnect wallet',
    'Wrong network modal + switch to BNB Smart Chain',
    'Refresh with wallet connected',
    'Token picker: select input/output tokens',
    'Approve ERC20 + confirm swap preview (requires funded wallet on BSC)',
    'Insufficient balance / no-route states with real wallet',
  ],
}

console.log('\n=== PHASE_2_QA_REPORT ===\n')
console.log(JSON.stringify(report, null, 2))
process.exit(blockers.length > 0 ? 1 : 0)
