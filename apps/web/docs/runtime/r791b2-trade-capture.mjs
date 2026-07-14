import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'r791b2-screenshots')
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'
const BASE =
  process.env.R791B2_BASE ||
  process.env.R791B_BASE ||
  'https://melega-swap-v2-zai3lf26b-melegazas-projects.vercel.app'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS },
  viewport: { width: 1440, height: 900 },
})
const page = await context.newPage()

await page.goto(`${BASE}/trade`, { waitUntil: 'domcontentloaded', timeout: 90_000 })
await page.waitForTimeout(8000)

await page.screenshot({ path: path.join(OUT, 'trade-1440-full.png'), fullPage: false })

const chart = page.locator('[data-trade-chart], [data-trade-chart-area]').first()
if (await chart.count()) {
  await chart.screenshot({ path: path.join(OUT, 'trade-1440-chart.png') })
}

const swaps = page.locator('[data-trade-recent-swaps]').first()
if (await swaps.count()) {
  await swaps.screenshot({ path: path.join(OUT, 'trade-1440-swaps.png') })
}

const body = await page.locator('body').innerText()
const signals = {
  insufficientHistory: body.includes('Insufficient indexed history'),
  noIndexedSwaps: body.includes('No indexed swaps yet'),
  hasLiquidity: /Liquidity/i.test(body) && !/Liquidity unavailable/i.test(body),
  hasMarco: body.includes('MARCO'),
}
console.log(JSON.stringify({ base: BASE, out: OUT, signals }, null, 2))

await browser.close()
