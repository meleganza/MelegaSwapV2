#!/usr/bin/env node
/** R727 — Smart Router Phase 2 staging route smoke. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r727-smart-router-phase2-gate')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'
const ROUTES = ['/trade', '/pricing-fees', '/build-studio', '/farms', '/pools']

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
    const child = spawn('yarn', ['start', '-p', '3000'], {
      cwd: WEB,
      stdio: 'ignore',
      detached: true,
    })
    child.unref()
    await waitForServer(BASE)
  }

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const checks = []

  for (const route of ROUTES) {
    const errors = []
    page.removeAllListeners('pageerror')
    page.on('pageerror', (err) => errors.push(err.message))
    const res = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(600)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    )
    const slug = route.replace(/\//g, '_').replace(/^_/, '') || 'root'
    await page.screenshot({ path: path.join(OUT, `${slug}.png`) })
    checks.push({
      route,
      status: res?.status() ?? 0,
      overflow,
      consoleErrors: errors,
    })
  }

  await browser.close()

  const failures = checks.flatMap((c) => {
    const out = []
    if (c.status !== 200) out.push(`${c.route}: HTTP ${c.status}`)
    if (c.overflow) out.push(`${c.route}: horizontal overflow`)
    if (c.consoleErrors.length) out.push(`${c.route}: ${c.consoleErrors[0]}`)
    return out
  })

  const report = { gate: failures.length ? 'FAIL' : 'PASS', checks, failures, screenshots: OUT }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(failures.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
