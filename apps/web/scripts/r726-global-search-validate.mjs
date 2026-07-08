#!/usr/bin/env node
/** R726 — Global search runtime validation + screenshots. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r726-global-search')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

function killPort(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' })
  } catch {
    /* ignore */
  }
}

async function waitForServer(url, attempts = 30) {
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

function buildAndStart() {
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

async function runSearch(page, query, slug) {
  const input = page.locator('[data-global-search-root] input')
  await input.click()
  await input.fill('')
  await input.fill(query)
  await page.waitForTimeout(400)

  const dropdown = page.locator('[data-global-search-dropdown]')
  await dropdown.waitFor({ state: 'visible', timeout: 8000 })

  const empty = page.locator('[data-global-search-empty]')
  const results = page.locator('[data-global-search-result]')
  const emptyVisible = await empty.isVisible().catch(() => false)
  const resultCount = await results.count()

  const snapshot = await page.evaluate(() => {
    const emptyEl = document.querySelector('[data-global-search-empty]')
    const resultEls = [...document.querySelectorAll('[data-global-search-result]')]
    return {
      emptyText: emptyEl?.textContent?.trim() ?? null,
      resultLabels: resultEls.map((el) => el.querySelector('span')?.textContent?.trim() ?? ''),
      resultCount: resultEls.length,
    }
  })

  await page.screenshot({
    path: path.join(OUT, `${slug}.png`),
    fullPage: false,
  })

  return { query, emptyVisible, resultCount, snapshot }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })

  if (!process.env.SCREENSHOT_BASE_URL) {
    buildAndStart()
    await waitForServer(BASE)
  }

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/trade`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-global-search-root] input').waitFor({ state: 'visible', timeout: 60000 })

  const checks = []
  checks.push(await runSearch(page, 'master', 'search-master'))
  checks.push(await runSearch(page, 'marco', 'search-marco'))
  checks.push(await runSearch(page, 'mxmx', 'search-mxmx'))
  checks.push(await runSearch(page, 'qxqzqzqzqzqzq', 'search-invalid'))

  await browser.close()

  const failures = []

  const master = checks[0]
  if (master.resultCount === 0) failures.push('master: expected results')

  const marco = checks[1]
  if (marco.resultCount === 0) failures.push('marco: expected results')

  const mxmx = checks[2]
  if (mxmx.resultCount === 0) failures.push('mxmx: expected results')

  const invalid = checks[3]
  if (!invalid.emptyVisible || invalid.snapshot.emptyText !== 'No results found') {
    failures.push('invalid: expected "No results found" empty state')
  }

  const report = {
    gate: failures.length === 0 ? 'PASS' : 'FAIL',
    checks,
    screenshots: OUT,
    failures,
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))

  if (failures.length) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
