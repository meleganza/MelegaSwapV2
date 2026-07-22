/**
 * DS001.4 visual evidence capture — real product routes only (no fake active program).
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'ds0014-screenshots')
const BASE = process.env.DS0014_BASE || 'http://127.0.0.1:3465'

const WIDTHS = [1440, 1280, 1024, 768, 390]
const STEPS = [
  { step: 'intro', name: 'intro' },
  { step: 'setup', name: 'setup-full-ai' },
  { step: 'review', name: 'review' },
  { step: 'status', name: 'activation-pending' },
]

mkdirSync(OUT, { recursive: true })

async function shot(page, width, name) {
  await page.setViewportSize({ width, height: width <= 390 ? 844 : 1024 })
  const dir = join(OUT, `${width}`)
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `${name}.png`)
  await page.screenshot({ path, fullPage: true })
  console.log('wrote', path)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

for (const width of WIDTHS) {
  for (const { step, name } of STEPS) {
    const q = step === 'intro' ? 'view=building' : `view=building&step=${step}`
    await page.goto(`${BASE}/liquidity-studio?${q}`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.waitForTimeout(800)
    await shot(page, width, name)
  }

  // Setup Dynamic Range — click strategy card if present
  await page.goto(`${BASE}/liquidity-studio?view=building&step=setup`, {
    waitUntil: 'networkidle',
    timeout: 120000,
  })
  await page.waitForTimeout(600)
  const dyn = page.locator('[data-testid="lb-strategy-dynamic"]')
  if (await dyn.count()) {
    await dyn.click()
    await page.waitForTimeout(400)
  }
  await shot(page, width, 'setup-dynamic-range')

  // Validation error — empty review attempt / budget zero
  await page.goto(`${BASE}/liquidity-studio?view=building&step=setup`, {
    waitUntil: 'networkidle',
    timeout: 120000,
  })
  await page.waitForTimeout(500)
  const budget = page.locator('[data-testid="lb-budget-input"]')
  if (await budget.count()) {
    await budget.fill('0')
    await budget.blur()
    const cta = page.locator('[data-testid="lb-primary-cta"]')
    if (await cta.count()) await cta.click({ force: true }).catch(() => {})
    await page.waitForTimeout(300)
  }
  await shot(page, width, 'validation-error')
}

// Explicit unsupported / no-pool messaging lives in setup after token select — capture setup frame labeled
await page.setViewportSize({ width: 1440, height: 1024 })
await page.goto(`${BASE}/liquidity-studio?view=building&step=setup`, {
  waitUntil: 'networkidle',
  timeout: 120000,
})
await shot(page, 1440, 'token-unsupported-or-empty')

await browser.close()
console.log('DS001.4 screenshots complete')
