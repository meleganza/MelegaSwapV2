#!/usr/bin/env node
/**
 * R788 — 88-route responsive screenshot matrix with per-card unavailable detection.
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r788-screenshots')
const BASE = process.env.R788_BASE || process.env.R787_BASE || process.env.R786_BASE || 'https://melega.finance'
const BYPASS = process.env.VERCEL_BYPASS || 'MVa5gLdCeuFd5saGeRqRXnJLi1w6AQO4'

const VIEWPORTS = [
  { w: 1728, h: 1080 },
  { w: 1440, h: 900 },
  { w: 1280, h: 800 },
  { w: 1024, h: 768 },
  { w: 768, h: 1024 },
  { w: 430, h: 932 },
  { w: 390, h: 844 },
  { w: 360, h: 800 },
]

const ROUTES = [
  ['home', '/'],
  ['trade', '/trade'],
  ['liquidity-studio', '/liquidity-studio'],
  ['pools', '/pools'],
  ['farms', '/farms'],
  ['trending', '/trending'],
  ['projects', '/projects'],
  ['radar', '/radar'],
  ['collectibles', '/collectibles'],
  ['build-studio', '/build-studio'],
  ['status', '/status'],
]

const CARD_SELECTORS = [
  '[data-pool-card]',
  '[data-ps-pool-card]',
  '[data-ps-kpi-card]',
  '[data-farm-card]',
  '[data-cs-collection-card]',
  '[data-cs-kpi-card]',
  '[data-ls-panel]',
  '[data-collectible-card]',
].join(',')

async function audit(page) {
  return page.evaluate((cardSelectors) => {
    const scrollOverflow = document.documentElement.scrollWidth > window.innerWidth + 2
    const brokenImg = [...document.querySelectorAll('img')].some(
      (img) => img.complete && img.naturalWidth === 0 && img.src && !img.src.startsWith('data:'),
    )
    const body = document.body?.innerText ?? ''
    const cards = [...document.querySelectorAll(cardSelectors)]
    const dupUnavailable = cards.some((card) => {
      const text = card.textContent ?? ''
      const matches = text.match(/Unavailable/gi) ?? []
      return matches.length >= 2
    })
    return {
      scrollOverflow,
      brokenImg,
      dupUnavailable,
      hasAppError: body.includes('Application error'),
      hasNaN: body.includes('NaN'),
      hasUndefined: /\bundefined\b/i.test(body),
    }
  }, CARD_SELECTORS)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS },
  })
  const page = await ctx.newPage()
  const rows = []

  for (const vp of VIEWPORTS) {
    const dir = path.join(OUT, `${vp.w}x${vp.h}`)
    await mkdir(dir, { recursive: true })
    await page.setViewportSize({ width: vp.w, height: vp.h })
    for (const [name, route] of ROUTES) {
      const file = path.join(dir, `${name}.png`)
      let ok = false
      let checks = {}
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 90000 })
        await page.waitForTimeout(5000)
        checks = await audit(page)
        ok =
          !checks.scrollOverflow &&
          !checks.brokenImg &&
          !checks.hasAppError &&
          !checks.hasNaN &&
          !checks.dupUnavailable
        await page.screenshot({ path: file, fullPage: false })
      } catch (e) {
        checks = { error: e instanceof Error ? e.message : String(e) }
      }
      rows.push({ viewport: `${vp.w}x${vp.h}`, route: name, path: route, ok, checks, file: `${vp.w}x${vp.h}/${name}.png` })
    }
  }

  await browser.close()
  const report = {
    mission: 'R788',
    base: BASE,
    capturedAt: new Date().toISOString(),
    expected: 88,
    actual: rows.length,
    pass: rows.every((r) => r.ok),
    failed: rows.filter((r) => !r.ok).length,
    rows,
  }
  await writeFile(path.join(OUT, 'r788-matrix-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ pass: report.pass, actual: report.actual, failed: report.failed }, null, 2))
  process.exit(report.pass ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
