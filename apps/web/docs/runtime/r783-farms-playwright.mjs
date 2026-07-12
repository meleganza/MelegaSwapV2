#!/usr/bin/env node
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'r783-screenshots')
const BASE = process.env.R783_BASE || 'https://melega.finance'

async function checkFarms(page, width, label) {
  await page.setViewportSize({ width, height: 900 })
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  await page.goto(`${BASE}/farms`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForTimeout(12000)
  const body = await page.locator('body').innerText()
  const oops = await page.locator('text=Oops').count()
  const checks = {
    label,
    width,
    oops: oops === 0,
    pageErrors: pageErrors.length === 0,
    kpiRow: (await page.locator('[data-fs-kpi-row]').count()) > 0,
    emitsToday: /Emits Today|Emitted Today/i.test(body),
    featuredFarm: /Featured Farm|Rewards\s*\/\s*Day/i.test(body),
    farmGrid: (await page.locator('[data-fs-farm-grid], [data-fs-farm-card]').count()) > 0,
    noNaN: !body.includes('NaN'),
    noUndefined: !/\bundefined\b/i.test(body),
    bodySnippet: body.slice(body.indexOf('Farms'), body.indexOf('Farms') + 400),
  }
  await page.screenshot({ path: path.join(OUT, `farms-${label}.png`), fullPage: true })
  return { checks, pageErrors }
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const desktop = await checkFarms(page, 1440, '1440')
  const mobile = await checkFarms(page, 390, '390')
  await browser.close()
  const pass = [desktop, mobile].every(
    (r) =>
      Object.entries(r.checks)
        .filter(([k]) => !['label', 'width', 'bodySnippet'].includes(k))
        .every(([, v]) => v === true),
  )
  const report = { mission: 'R783 farms playwright', base: BASE, desktop, mobile, pass, verifiedAt: new Date().toISOString() }
  await writeFile(path.join(OUT, 'r783-farms-playwright.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(pass ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
