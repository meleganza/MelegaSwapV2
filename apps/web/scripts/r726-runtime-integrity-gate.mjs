#!/usr/bin/env node
/** R726 — Production runtime data integrity gate. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r726-runtime-integrity')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ROUTES = ['/trade', '/pricing-fees', '/build-studio', '/pools', '/farms', '/projects', '/radar', '/liquidity-studio']

function killPort(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' })
  } catch {
    /* ignore */
  }
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error(`Server not ready at ${url}`)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  if (!process.env.SCREENSHOT_BASE_URL) {
    killPort(3000)
    execSync('yarn build', { cwd: WEB, stdio: 'inherit' })
    const child = spawn('yarn', ['start'], { cwd: WEB, stdio: 'ignore', detached: true })
    child.unref()
    await waitForServer(BASE)
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()
  const checks = []
  const runtimeComponents = []

  for (const route of ROUTES) {
    const res = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 60000 })
    const status = res?.status() ?? 0
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    const errorBoundary = await page.evaluate(() =>
      /something went wrong|application error|error boundary/i.test(document.body.innerText),
    )
    checks.push({ route, status, overflow, errorBoundary })
    await page.screenshot({ path: path.join(OUT, `${route.replace(/\//g, '') || 'home'}.png`), fullPage: false })
  }

  await page.goto(`${BASE}/trade`, { waitUntil: 'domcontentloaded' })
  const hasGlobalSearch = await page.locator('[data-global-search-root]').count()
  await page.locator('[data-global-search-root] input').fill('master')
  await page.waitForTimeout(400)
  const masterResults = await page.locator('[data-global-search-result]').count()
  const noResultsVisible = await page.locator('[data-global-search-empty]').count()

  runtimeComponents.push({
    component: 'global-search',
    source: 'registry',
    indexer: 'static-index',
    status: hasGlobalSearch > 0 && masterResults > 0 ? 'ready' : 'fail',
    reason: hasGlobalSearch > 0 ? (masterResults > 0 ? 'master query returns results' : 'master query empty') : 'GlobalSearch not mounted',
  })

  await browser.close()
  if (!process.env.SCREENSHOT_BASE_URL) killPort(3000)

  const failures = checks.filter((c) => c.status !== 200 || c.overflow || c.errorBoundary)
  const report = {
    gate: failures.length === 0 && masterResults > 0 ? 'PASS' : 'FAIL',
    checks,
    globalSearch: { mounted: hasGlobalSearch > 0, masterResults, noResultsVisible },
    runtimeComponents,
    failures,
    screenshots: OUT,
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (report.gate !== 'PASS') process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
