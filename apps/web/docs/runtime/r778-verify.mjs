#!/usr/bin/env node
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'r778-screenshots')
const BASE = 'https://www.melega.finance'
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'

const routes = [
  { name: 'homepage', path: '/', checks: ['data-melega-ticker', 'data-live-activity-feed'] },
  { name: 'trade', path: '/trade', checks: ['data-trade-terminal-screen'] },
  { name: 'liquidity-studio', path: '/liquidity-studio', checks: ['data-liquidity-studio-screen'] },
  { name: 'farms', path: '/farms', checks: ['data-farms-studio-screen'] },
  { name: 'pools', path: '/pools', checks: ['data-pools-studio-screen'] },
]

async function healthy(page) {
  const oops = await page.locator('text=Oops').count()
  return oops === 0
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS },
    viewport: { width: 1440, height: 900 },
  })
  const page = await ctx.newPage()
  const results = []

  for (const route of routes) {
    const url = `${BASE}${route.path}`
    let ok = false
    let note = ''
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 })
      await page.waitForTimeout(2500)
      const markers = await Promise.all(route.checks.map((c) => page.locator(`[${c}]`).count()))
      ok = (res?.status() ?? 500) < 400 && (await healthy(page)) && markers.every((n) => n > 0)
      if (!ok) note = 'marker or error boundary'
      const shot = path.join(OUT, `${route.name}.png`)
      await page.screenshot({ path: shot, fullPage: route.name !== 'trade' })
      results.push({ route: route.path, url, ok, note, screenshot: shot })
    } catch (err) {
      results.push({ route: route.path, url, ok: false, note: String(err), screenshot: null })
    }
  }

  await browser.close()
  const report = {
    mission: 'R778',
    productionUrl: BASE,
    verifiedAt: new Date().toISOString(),
    results,
    verdict: results.every((r) => r.ok) ? 'FOUNDER_BATCH3_COMPLETE' : 'FOUNDER_BATCH3_BLOCKED',
  }
  const reportPath = path.join(__dirname, 'r778-founder-batch-report.json')
  await writeFile(reportPath, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.verdict === 'FOUNDER_BATCH3_COMPLETE' ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
