#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const playwrightModule = process.env.PLAYWRIGHT_MODULE || 'playwright'
const { chromium } = await import(playwrightModule)

const dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.resolve(dirname, '../../../docs/screenshots/r031-final-all-routes')
const base = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3013'
const captureScreenshots = process.env.CAPTURE_SCREENSHOTS !== '0'
const settleMs = Number(process.env.QA_SETTLE_MS || 2500)

const routes = [
  ['home', '/'],
  ['swap', '/swap'],
  ['bridge', '/bridge'],
  ['liquidity', '/liquidity'],
  ['liquidity-add', '/liquidity?view=add'],
  ['liquidity-remove', '/liquidity?view=remove'],
  ['remove-deep-link', '/remove/BNB/0x55d398326f99059ff775485246999027b3197955'],
  ['farms', '/farms?view=explore'],
  ['pools', '/pools?view=explore'],
  ['portfolio', '/portfolio'],
  ['projects', '/projects'],
  ['project-detail', '/project/marco'],
  ['list-tools', '/list'],
  ['service-featured', '/list?intent=featured'],
  ['service-trend-boost', '/list?intent=trend-boost'],
  ['service-liquidity', '/list?intent=liquidity'],
  ['service-project', '/list?intent=create-project'],
]
const allViewports = [
  ['320', 320, 780],
  ['390', 390, 844],
  ['430', 430, 932],
  ['768', 768, 1024],
  ['1440', 1440, 1000],
]
const requestedViewports = new Set((process.env.QA_VIEWPORTS || '').split(',').filter(Boolean))
const viewports = requestedViewports.size
  ? allViewports.filter(([tag]) => requestedViewports.has(tag))
  : allViewports

function audit() {
  const root = document.documentElement
  const body = document.body
  const overflow = Math.max(root.scrollWidth, body?.scrollWidth || 0) - innerWidth
  const main = document.querySelector('main, [data-farms-studio-screen], [data-pools-studio-screen], [data-liquidity-studio]')
  const buttons = [...document.querySelectorAll('button, a')].filter((node) => {
    const rect = node.getBoundingClientRect()
    const style = getComputedStyle(node)
    return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden' && style.display !== 'none'
  })
  return {
    title: document.title,
    overflow,
    hasMainSurface: Boolean(main),
    interactiveCount: buttons.length,
    bodyTextLength: (body?.innerText || '').trim().length,
    visibleH1: [...document.querySelectorAll('h1')].some((node) => node.getBoundingClientRect().height > 0),
    nextError: Boolean(document.querySelector('nextjs-portal')),
  }
}

fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
})
const rows = []
for (const [name, route] of routes) {
  for (const [viewport, width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height } })
    const consoleErrors = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 500))
    })
    let status = 0
    let error = null
    try {
      const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
      status = response?.status() || 0
      if (settleMs > 0) await page.waitForTimeout(settleMs)
      const checks = await page.evaluate(audit)
      let screenshot = null
      if (captureScreenshots && (viewport === '390' || viewport === '1440')) {
        screenshot = `${name}-${viewport}.png`
        await page.screenshot({ path: path.join(out, screenshot), fullPage: true })
      }
      rows.push({ name, route, viewport, status, screenshot, checks, consoleErrors })
      console.log(name, viewport, status, checks.overflow)
    } catch (caught) {
      error = String(caught)
      rows.push({ name, route, viewport, status, error, consoleErrors })
      console.error(name, viewport, error)
    }
    await page.close()
  }
}
await browser.close()

const report = {
  task: 'R031 FINAL ALL-ROUTES PREMIUM UX + TERMINATED SAFETY',
  base,
  capturedAt: new Date().toISOString(),
  rows,
  summary: {
    checks: rows.length,
    navigationErrors: rows.filter((row) => row.error || row.status >= 400 || row.status === 0).length,
    overflowFailures: rows.filter((row) => (row.checks?.overflow || 0) > 2).length,
    nextErrors: rows.filter((row) => row.checks?.nextError).length,
    emptySurfaces: rows.filter((row) => (row.checks?.bodyTextLength || 0) < 40).length,
    consoleErrorRows: rows.filter((row) => row.consoleErrors?.length).length,
    screenshots: rows.filter((row) => row.screenshot).length,
  },
}
fs.writeFileSync(path.join(out, 'route-matrix.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report.summary))
if (report.summary.navigationErrors || report.summary.overflowFailures || report.summary.nextErrors || report.summary.emptySurfaces) process.exitCode = 1
