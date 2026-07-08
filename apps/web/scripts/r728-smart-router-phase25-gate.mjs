#!/usr/bin/env node
/** R728 — Smart Router Phase 2.5 staging gate. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r728-smart-router-phase25-gate')
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
    const child = spawn('yarn', ['start'], { cwd: WEB, stdio: 'ignore', detached: true })
    child.unref()
    await waitForServer(BASE)
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()
  const checks = []
  const consoleErrors = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  for (const route of ROUTES) {
    const url = `${BASE}${route}`
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    const status = res?.status() ?? 0
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    await page.screenshot({ path: path.join(OUT, `${route.replace(/\//g, '') || 'home'}.png`), fullPage: false })
    checks.push({ route, status, overflow, consoleErrors: [...consoleErrors] })
    consoleErrors.length = 0
  }

  await browser.close()
  if (!process.env.SCREENSHOT_BASE_URL) killPort(3000)

  const failures = checks.filter((c) => c.status !== 200 || c.overflow)
  const report = {
    gate: failures.length === 0 ? 'PASS' : 'FAIL',
    phase: '2.5',
    checks,
    failures,
    screenshots: OUT,
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (failures.length) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
