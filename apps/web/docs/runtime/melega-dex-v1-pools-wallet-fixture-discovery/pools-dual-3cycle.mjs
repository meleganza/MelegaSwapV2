/**
 * Dual 3-cycle Pools certification:
 *  - positive SmartChef fixture
 *  - empty fixture (AMM LP wallet without SmartChef stake)
 */
import { chromium } from '/tmp/melega-wallet-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.NEXT_URL || 'http://127.0.0.1:3055'
const RPC = process.env.BSC_RPC_URL || fs.readFileSync('/tmp/melega-qn-clean.txt', 'utf8').split('\n').filter(Boolean)[0]
const OUT = process.env.OUT_DIR || __dirname
const MODE = process.env.POOLS_CYCLE_MODE || 'positive' // positive | empty
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, 'pools-wallet-fixture.json'), 'utf8'))
const WALLET = (
  process.env.FOUNDER_WALLET ||
  (MODE === 'empty' ? FIXTURE.emptyFixtureWallet : FIXTURE.positiveFixture.wallet)
).toLowerCase()
const EXPECT_EMPTY = MODE === 'empty' || process.env.EXPECT_EMPTY === '1'

fs.mkdirSync(OUT, { recursive: true })
fs.mkdirSync(path.join(OUT, 'screenshots'), { recursive: true })

async function injectWallet(page) {
  await page.addInitScript(
    ({ address, rpc }) => {
      const listeners = new Map()
      const provider = {
        isMetaMask: true,
        isConnected: () => true,
        chainId: '0x38',
        networkVersion: '56',
        selectedAddress: address,
        _state: { accounts: [address], isConnected: true },
        on(event, cb) {
          if (!listeners.has(event)) listeners.set(event, new Set())
          listeners.get(event).add(cb)
        },
        removeListener(event, cb) {
          listeners.get(event)?.delete(cb)
        },
        emit(event, ...args) {
          for (const cb of listeners.get(event) || []) cb(...args)
        },
        async request({ method, params }) {
          if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [address]
          if (method === 'eth_chainId') return '0x38'
          if (method === 'net_version') return '56'
          if (method === 'wallet_switchEthereumChain' || method === 'wallet_addEthereumChain') return null
          if (method === 'personal_sign' || method === 'eth_sign' || method === 'eth_sendTransaction') {
            throw new Error('Wallet certification is read-only; signing/broadcast disabled')
          }
          const body = { jsonrpc: '2.0', id: Date.now(), method, params: params || [] }
          const res = await fetch(rpc, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          })
          const json = await res.json()
          if (json.error) throw new Error(json.error.message || JSON.stringify(json.error))
          return json.result
        },
      }
      Object.defineProperty(window, 'ethereum', { value: provider, configurable: true })
      window.web3 = { currentProvider: provider }
    },
    { address: WALLET, rpc: RPC },
  )
}

async function connectIfNeeded(page) {
  const btn = page.getByRole('button', { name: /^Connect Wallet$/i }).first()
  if (await btn.count()) {
    await btn.click({ timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(800)
    const candidates = [
      page.getByRole('button', { name: /MetaMask/i }),
      page.getByText(/^MetaMask$/i),
      page.getByText(/Injected/i),
      page.getByText(/Browser Wallet/i),
    ]
    for (const c of candidates) {
      if (await c.count()) {
        await c.first().click().catch(() => {})
        await page.waitForTimeout(1500)
        break
      }
    }
  }
  await page.evaluate(async () => {
    try {
      await window.ethereum?.request?.({ method: 'eth_requestAccounts' })
      window.ethereum?.emit?.('connect', { chainId: '0x38' })
      window.ethereum?.emit?.(
        'accountsChanged',
        await window.ethereum.request({ method: 'eth_accounts' }),
      )
    } catch {}
  })
}

async function extractPositions(page) {
  return page.evaluate(() => {
    const text = document.body?.innerText || ''
    const module = document.querySelector('[data-pools-module="003"]')
    const state =
      module?.getAttribute('data-pools-wallet-state') ||
      module?.getAttribute('data-wallet-state') ||
      document.querySelector('[data-pools-wallet-state]')?.getAttribute('data-pools-wallet-state') ||
      null
    const cards = [
      ...document.querySelectorAll(
        '[data-pools-module="003"] article, [data-testid="pools-my-position-card"], [data-testid*="pools-position"]',
      ),
    ].map((el) => {
      const t = (el.innerText || '').replace(/\s+/g, ' ').trim()
      return {
        id: el.getAttribute('data-position-id') || el.getAttribute('data-sous-id') || el.id || null,
        sousId: el.getAttribute('data-sous-id'),
        contract: el.getAttribute('data-contract') || el.getAttribute('data-smartchef'),
        text: t.slice(0, 500),
      }
    })
    const empty = /No pool positions/i.test(text)
    const loading = /Loading pool positions/i.test(text)
    const connected = !/Connect your wallet to view pool positions/i.test(
      module?.innerText || text.slice(0, 2000),
    )
    return {
      state,
      connectedHint: connected,
      empty,
      loading,
      cardCount: cards.length,
      cards,
      snippet: text.includes('My Positions')
        ? text.slice(text.indexOf('My Positions'), text.indexOf('My Positions') + 900)
        : null,
    }
  })
}

function identityKey(card) {
  return [
    card.sousId || '',
    card.contract || '',
    (card.text.match(/YD|GCC2|MARCO|CAKE|Ended|Active|Finished/gi) || []).join('|'),
    (card.text.match(/Staked[^0-9]*([0-9.,]+)/i) || [])[1] || '',
  ].join('::')
}

function fingerprint(positions) {
  return JSON.stringify((positions.cards || []).map(identityKey).sort())
}

async function waitTerminal(page, { expectEmpty, timeoutMs = 90000 }) {
  const t0 = Date.now()
  let last = null
  while (Date.now() - t0 < timeoutMs) {
    await page.waitForTimeout(2000)
    last = await extractPositions(page)
    if (last.loading) continue
    if (expectEmpty && last.empty && last.cardCount === 0) return last
    if (!expectEmpty && last.cardCount > 0) return last
    if (last.state && /SUCCESS_EMPTY|SUCCESS_WITH_POSITIONS|ERROR_/i.test(last.state)) return last
  }
  return last
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
})
const page = await context.newPage()
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
})
const mpage = await mobile.newPage()

const transitions = []
const report = {
  mission: 'MELEGA_DEX_V1_POOLS_WALLET_FIXTURE_DISCOVERY_AND_3_CYCLE_UNBLOCK',
  mode: MODE,
  expectEmpty: EXPECT_EMPTY,
  base: BASE,
  wallet: WALLET,
  startedAt: new Date().toISOString(),
  cycles: [],
  pass: false,
  blocker: null,
}

await injectWallet(page)
await injectWallet(mpage)

// Cycle 1
transitions.push({ at: new Date().toISOString(), event: 'goto_/pools', expected: 'LOADING_CURRENT_GENERATION' })
await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await page.waitForTimeout(1500)
await connectIfNeeded(page)
const cycle1 = await waitTerminal(page, { expectEmpty: EXPECT_EMPTY })
transitions.push({
  at: new Date().toISOString(),
  event: 'cycle1_terminal',
  state: cycle1?.state,
  cardCount: cycle1?.cardCount,
  empty: cycle1?.empty,
})
await page.screenshot({
  path: path.join(OUT, 'screenshots', `${MODE}-desktop-cycle-1.png`),
  fullPage: false,
})
await mpage.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await connectIfNeeded(mpage)
await mpage.waitForTimeout(8000)
await mpage.screenshot({
  path: path.join(OUT, 'screenshots', `${MODE}-mobile-cycle-1.png`),
  fullPage: false,
})
report.cycles.push({ cycle: 1, ...cycle1, at: new Date().toISOString() })
fs.writeFileSync(path.join(OUT, `${MODE}-cycle-1.json`), JSON.stringify(cycle1, null, 2))

if (!EXPECT_EMPTY && (!cycle1 || cycle1.cardCount === 0)) {
  report.blocker = { reason: 'Positive fixture: no SmartChef positions visible in cycle 1', cycle1 }
  fs.writeFileSync(path.join(OUT, `${MODE}-3cycle-result.json`), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report.blocker, null, 2))
  await browser.close()
  process.exit(2)
}
if (EXPECT_EMPTY && cycle1?.cardCount > 0) {
  report.blocker = {
    reason: 'Empty fixture unexpectedly showed positions (possible wallet cache leak)',
    cycle1,
  }
  fs.writeFileSync(path.join(OUT, `${MODE}-3cycle-result.json`), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report.blocker, null, 2))
  await browser.close()
  process.exit(2)
}

const fp1 = fingerprint(cycle1)

// Cycle 2: Farms → Pools (no hard reload)
transitions.push({ at: new Date().toISOString(), event: 'navigate_farms_then_pools' })
await page.goto(`${BASE}/farms`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await page.waitForTimeout(2500)
await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 120000 })
const cycle2 = await waitTerminal(page, { expectEmpty: EXPECT_EMPTY })
transitions.push({
  at: new Date().toISOString(),
  event: 'cycle2_terminal',
  state: cycle2?.state,
  cardCount: cycle2?.cardCount,
  empty: cycle2?.empty,
})
await page.screenshot({
  path: path.join(OUT, 'screenshots', `${MODE}-desktop-cycle-2.png`),
  fullPage: false,
})
report.cycles.push({ cycle: 2, ...cycle2, at: new Date().toISOString() })
fs.writeFileSync(path.join(OUT, `${MODE}-cycle-2.json`), JSON.stringify(cycle2, null, 2))
const fp2 = fingerprint(cycle2)

// Cycle 3: hard reload
transitions.push({ at: new Date().toISOString(), event: 'hard_reload_pools' })
await page.reload({ waitUntil: 'domcontentloaded' })
await connectIfNeeded(page)
const cycle3 = await waitTerminal(page, { expectEmpty: EXPECT_EMPTY })
transitions.push({
  at: new Date().toISOString(),
  event: 'cycle3_terminal',
  state: cycle3?.state,
  cardCount: cycle3?.cardCount,
  empty: cycle3?.empty,
})
await page.screenshot({
  path: path.join(OUT, 'screenshots', `${MODE}-desktop-cycle-3.png`),
  fullPage: false,
})
report.cycles.push({ cycle: 3, ...cycle3, at: new Date().toISOString() })
fs.writeFileSync(path.join(OUT, `${MODE}-cycle-3.json`), JSON.stringify(cycle3, null, 2))
const fp3 = fingerprint(cycle3)

report.fingerprints = { cycle1: fp1, cycle2: fp2, cycle3: fp3 }
report.counts = [cycle1.cardCount, cycle2.cardCount, cycle3.cardCount]
const stableEmpty =
  EXPECT_EMPTY &&
  cycle1.cardCount === 0 &&
  cycle2.cardCount === 0 &&
  cycle3.cardCount === 0 &&
  cycle1.empty &&
  cycle2.empty &&
  cycle3.empty
const stablePositive =
  !EXPECT_EMPTY &&
  cycle1.cardCount > 0 &&
  cycle1.cardCount === cycle2.cardCount &&
  cycle2.cardCount === cycle3.cardCount &&
  fp1 === fp2 &&
  fp2 === fp3

report.pass = Boolean(stableEmpty || stablePositive)
if (!report.pass) {
  report.blocker = {
    reason: EXPECT_EMPTY
      ? 'Empty fixture not stably empty across 3 cycles'
      : 'Positive fixture identities/counts not identical across 3 cycles',
    counts: report.counts,
    fingerprints: report.fingerprints,
  }
}
report.finishedAt = new Date().toISOString()
fs.writeFileSync(path.join(OUT, 'state-transition-log.json'), JSON.stringify({ mode: MODE, wallet: WALLET, transitions }, null, 2))
fs.writeFileSync(path.join(OUT, `${MODE}-3cycle-result.json`), JSON.stringify(report, null, 2))
console.log(
  JSON.stringify(
    {
      mode: MODE,
      pass: report.pass,
      counts: report.counts,
      wallet: WALLET,
      blocker: report.blocker,
    },
    null,
    2,
  ),
)
await browser.close()
process.exit(report.pass ? 0 : 2)
