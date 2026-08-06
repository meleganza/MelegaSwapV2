#!/usr/bin/env node
import { chromium } from '/tmp/node_modules/playwright/index.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'screenshots')
const BASE = process.env.MISSION_BASE || 'http://127.0.0.1:3044'
const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'projects', path: '/projects' },
  { id: 'project-marco', path: '/project-hq/marco' },
  { id: 'liquidity', path: '/liquidity-studio' },
  { id: 'farms', path: '/farms' },
  { id: 'pools', path: '/pools' },
  { id: 'portfolio', path: '/portfolio' },
  { id: 'audit', path: '/audit' },
]

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const checks = []
  const push = (id, pass, detail) => {
    checks.push({ id, pass: Boolean(pass), detail })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${id}`)
  }

  const samples = {}

  for (const route of ROUTES) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3500)
    const info = await page.evaluate(() => {
      const body = document.body.innerText || ''
      const unavailable = (body.match(/\bUnavailable\b/gi) || []).length
      const sourceConfigured = /Source not configured/i.test(body)
      const waitingExplorer = /Waiting for explorer/i.test(body)
      const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      return {
        unavailable,
        sourceConfigured,
        waitingExplorer,
        overflowX,
        hasDash: body.includes('—'),
        snippet: body.slice(0, 160).replace(/\s+/g, ' '),
      }
    })
    await page.screenshot({ path: path.join(OUT, `${route.id}-1440.png`), fullPage: false })
    samples[route.id] = info
    push(
      `surface-${route.id}`,
      !info.sourceConfigured && !info.waitingExplorer && !info.overflowX,
      info,
    )
  }

  // Cross-surface: Project Page pipeline + Audit pipeline attrs
  await page.goto(`${BASE}/project-hq/marco`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(2500)
  const pp = await page.evaluate(() => ({
    v4: !!document.querySelector('[data-testid="project-page-v4"]'),
    market: !!document.querySelector('[data-testid="project-v4-market"]'),
  }))
  push('project-page-v4-mounted', pp.v4 && pp.market, pp)

  await page.goto(`${BASE}/audit`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(2500)
  const audit = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="audit-center-v2"]')
    return {
      mounted: !!el,
      pipeline: el?.getAttribute('data-data-truth-pipeline') || null,
    }
  })
  push('audit-data-truth-pipeline', audit.mounted && audit.pipeline === 'melega-global-data-truth-v1', audit)

  const report = {
    mission: 'MELEGASWAP_V2_GLOBAL_DATA_INDEXER_FINALIZATION',
    base: BASE,
    generatedAt: new Date().toISOString(),
    checks,
    samples,
    pass: checks.every((c) => c.pass),
  }
  await writeFile(path.join(__dirname, 'browser-acceptance.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ pass: report.pass, failed: checks.filter((c) => !c.pass).map((c) => c.id) }, null, 2))
  await browser.close()
  process.exit(report.pass ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
