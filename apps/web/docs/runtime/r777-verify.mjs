#!/usr/bin/env node
/**
 * R777 — Founder UX Stabilization production verification.
 * Usage: node apps/web/docs/runtime/r777-verify.mjs
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'r777-screenshots')
const BASE = 'https://www.melega.finance'
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'

const routes = [
  { name: 'homepage', path: '/' },
  { name: 'pools', path: '/pools' },
  { name: 'farms', path: '/farms' },
  { name: 'radar', path: '/radar' },
  { name: 'dex-intelligence', path: '/dex-intelligence' },
  { name: 'build-studio', path: '/build-studio' },
]

async function pageHealthy(page) {
  const oops = await page.locator('text=Oops').count()
  const boundary = await page.locator('[data-sentry-component="ErrorBoundary"]').count()
  return oops === 0 && boundary === 0
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS },
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  const results = []

  let productionSha = null
  try {
    const shaRes = await fetch(`${BASE}/api/runtime/readiness`, {
      headers: { 'x-vercel-protection-bypass': BYPASS },
    })
    if (shaRes.ok) {
      const json = await shaRes.json()
      productionSha = json?.deploy?.sha ?? json?.sha ?? null
    }
  } catch {
    /* optional */
  }

  for (const route of routes) {
    const url = `${BASE}${route.path}`
    let ok = false
    let note = ''
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 })
      await page.waitForTimeout(2500)
      ok = (response?.status() ?? 0) < 400 && (await pageHealthy(page))
      if (!ok) note = 'error boundary or HTTP failure'
      const shot = path.join(OUT_DIR, `${route.name}.png`)
      await page.screenshot({ path: shot, fullPage: route.name === 'homepage' || route.name === 'build-studio' })
      results.push({ route: route.path, url, ok, note, screenshot: shot })
    } catch (err) {
      results.push({ route: route.path, url, ok: false, note: String(err), screenshot: null })
    }
  }

  await browser.close()

  const report = {
    mission: 'R777',
    productionUrl: BASE,
    productionSha,
    verifiedAt: new Date().toISOString(),
    results,
    verdict: results.every((r) => r.ok) ? 'FOUNDER_UX_BATCH_COMPLETE' : 'FOUNDER_UX_BATCH_BLOCKED',
  }

  const reportPath = path.join(__dirname, 'r777-founder-ux-batch-report.json')
  await writeFile(reportPath, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.verdict === 'FOUNDER_UX_BATCH_COMPLETE' ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
