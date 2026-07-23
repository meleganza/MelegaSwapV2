import { chromium } from '/tmp/lb-pixel002-cert/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const OUT = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.LIVE_BASE || 'https://www.melega.finance'
const routes = [
  { name: 'live-1440-liquidity-studio', w: 1440, h: 1200, path: '/liquidity-studio' },
  { name: 'live-1440-building', w: 1440, h: 1200, path: '/liquidity-studio?view=building' },
  { name: 'live-1440-add', w: 1440, h: 1200, path: '/liquidity-studio?view=add' },
  { name: 'live-390-liquidity-studio', w: 390, h: 844, path: '/liquidity-studio' },
  { name: 'live-390-building', w: 390, h: 844, path: '/liquidity-studio?view=building' },
  { name: 'live-390-add', w: 390, h: 844, path: '/liquidity-studio?view=add' },
]

const browser = await chromium.launch({ headless: true })
const report = { capturedAt: new Date().toISOString(), base: BASE, shots: [] }

for (const r of routes) {
  const page = await browser.newPage({ viewport: { width: r.w, height: r.h } })
  await page.goto(BASE + r.path, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('[data-testid="liq-one-unified-page"]', { timeout: 90000 }).catch(() => {})
  await page.waitForTimeout(3500)
  const info = await page.evaluate(() => {
    const pageEl = document.querySelector('[data-testid="liq-one-unified-page"]')
    const lb = document.querySelector('[data-testid="liq-one-building-card"]')
    const add = document.querySelector('[data-testid="liq-one-add-card"]')
    const snap = document.querySelector('[data-testid="liq-one-dex-snapshot"]')
    const right = document.querySelector('[data-testid="liq-one-right-col"]')
    const box = (el) => {
      if (!el) return null
      const b = el.getBoundingClientRect()
      return { x: b.x, w: b.width, h: b.height }
    }
    return {
      pixel: pageEl?.getAttribute('data-pixel-perfection'),
      onePage: pageEl?.getAttribute('data-liquidity-one-page'),
      contentW: pageEl?.getBoundingClientRect().width ?? null,
      contentLeft: pageEl?.getBoundingClientRect().left ?? null,
      lb: box(lb),
      add: box(add),
      snap: box(snap),
      right: box(right),
      hasUnified: !!pageEl,
      title: document.title,
    }
  })
  const file = path.join(OUT, `${r.name}.png`)
  await page.screenshot({ path: file, fullPage: r.w < 800 })
  report.shots.push({ ...r, file, info })
  console.log(JSON.stringify({ name: r.name, info }))
  await page.close()
}

fs.writeFileSync(path.join(OUT, 'live-verification.json'), JSON.stringify(report, null, 2))
await browser.close()
const ok = report.shots.every((s) => s.info.hasUnified && s.info.pixel === '001')
console.log(JSON.stringify({ done: report.shots.length, livePixelLocked: ok }, null, 2))
process.exit(ok ? 0 : 2)
