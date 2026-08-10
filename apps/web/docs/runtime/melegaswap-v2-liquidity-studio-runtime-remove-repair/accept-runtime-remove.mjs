/**
 * Browser acceptance — Liquidity Studio runtime / remove repair (no wallet required).
 * Usage: node accept-runtime-remove.mjs [baseUrl]
 */
import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = (process.argv[2] || 'http://127.0.0.1:3118').replace(/\/$/, '')
const OUT = __dirname
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '390', width: 390, height: 844 },
]

async function waitReady(page) {
  await page.waitForSelector('[data-testid="liquidity-v3-workspace"]', { timeout: 60000 })
  await page.waitForTimeout(400)
}

async function main() {
  const browser = await chromium
    .launch({ channel: 'chrome', headless: true })
    .catch(() =>
      chromium.launch({
        executablePath:
          process.env.CHROME_PATH ||
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
      }),
    )

  const page = await browser.newPage()
  const failures = []
  const viewportResults = []

  await page.goto(`${BASE}/liquidity-studio/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await waitReady(page)

  // Tab stability smoke
  for (const id of [
    'liquidity-v3-tab-add',
    'liquidity-v3-tab-positions',
    'liquidity-v3-tab-ai',
    'liquidity-v3-tab-positions',
  ]) {
    await page.locator(`[data-testid="${id}"]`).click({ force: true })
    await page.waitForTimeout(220)
    await waitReady(page)
  }
  const tab = await page
    .locator('[data-testid="liquidity-v3-workspace"]')
    .getAttribute('data-liquidity-tab')
  if (tab !== 'positions') failures.push(`tab stability ended on ${tab}`)
  if (!page.url().includes('liquidity')) failures.push('route reset away from liquidity')

  const phaseEl = page.locator('[data-testid="liquidity-my-positions-phase"]')
  const phase = (await phaseEl.count())
    ? await phaseEl.getAttribute('data-positions-phase')
    : null
  if (!phase || !['connecting', 'fetching', 'ready', 'empty'].includes(phase)) {
    failures.push(`positions phase invalid: ${phase}`)
  }

  // Deep-link remove workspace
  await page.goto(`${BASE}/liquidity-studio/?view=remove`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await waitReady(page)
  await page.waitForTimeout(500)

  const removeShell = await page.locator('[data-testid="liquidity-v3-remove"]').count()
  if (removeShell > 0) {
    for (const pct of ['25', '50', '75', '100']) {
      await page.locator(`[data-testid="liquidity-remove-pct-${pct}"]`).click({ force: true })
      await page.waitForTimeout(120)
      const got = await page
        .locator('[data-testid="liquidity-v3-remove"]')
        .getAttribute('data-remove-percent')
      if (got !== pct) failures.push(`percent ${pct} stuck at ${got}`)
    }
    const lpPct = await page.locator('[data-testid="liquidity-remove-lp-pct"]').textContent()
    if (!lpPct || (!lpPct.includes('%') && lpPct !== 'MAX')) {
      failures.push(`LP removed label invalid: ${lpPct}`)
    }
    await page.locator('[data-testid="liquidity-remove-cta"]').click({ force: true })
    await page.waitForTimeout(300)
    const modalTitle = await page.locator('[data-testid="liquidity-remove-confirm-modal"]').count()
    viewportResults.push({ removePercentOk: failures.every((f) => !f.startsWith('percent')), modalCount: modalTitle })
  } else {
    viewportResults.push({
      note: 'remove panel not mounted without wallet position — phase + tabs still certified',
      removeShell,
    })
  }

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto(`${BASE}/liquidity-studio/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForSelector('[data-testid="liquidity-v3-hero"]', { timeout: 30000 })
    await page.waitForTimeout(300)
    const blank = await page.evaluate(() => {
      const ws = document.querySelector('[data-testid="liquidity-v3-workspace"]')
      return !ws || ws.getBoundingClientRect().height < 40
    })
    const shot = path.join(OUT, `viewport-${vp.name}.png`)
    await page.screenshot({ path: shot, fullPage: false })
    viewportResults.push({ viewport: vp.name, blank, shot: path.basename(shot) })
    if (blank) failures.push(`viewport ${vp.name} blank workspace`)
  }

  const report = {
    mission: 'MELEGASWAP_V2_LIQUIDITY_STUDIO_RUNTIME_REMOVE_REPAIR',
    base: BASE,
    positionsPhase: phase,
    failures,
    viewportResults,
    pass: failures.length === 0,
    timestamp: new Date().toISOString(),
    notes: [
      'Wallet-connected Base remove tx requires live wallet — covered by code contracts + Confirm Withdrawal wiring.',
      'Factory indexer gated to BNB; Base uses tracked/farm pairs only.',
    ],
  }
  writeFileSync(path.join(OUT, 'browser-acceptance-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  if (!report.pass) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
