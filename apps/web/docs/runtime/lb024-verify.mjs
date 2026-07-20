#!/usr/bin/env node
/**
 * LB024 live verification — Liquidity Building access from Liquidity Studio.
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'lb024-screenshots')
const BASE = process.env.LB024_BASE || 'http://localhost:3490'

async function captureAt(page, width, name) {
  await page.setViewportSize({ width, height: width <= 430 ? 844 : 900 })
  await page.waitForTimeout(800)
  const shot = path.join(OUT, `${name}-${width}.png`)
  await page.screenshot({ path: shot, fullPage: true })
  const overflow = await page.evaluate(() => {
    const el = document.documentElement
    return el.scrollWidth > el.clientWidth + 2
  })
  return { shot, overflow }
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const checks = []

  // 1. Add Liquidity title (manual form)
  await page.goto(`${BASE}/liquidity-studio?view=add`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(4000)
  const addTitle = await page.locator('[data-testid="ls-builder-title"]').first().textContent().catch(() => '')
  const tabBuilding = await page.locator('[data-testid="ls-tab-liquidity-building"]').count()
  const tabAdd = await page.locator('[data-testid="ls-tab-add-liquidity"]').count()
  const builderLabelCount = await page.locator('text=Liquidity Builder').count()
  const addShot = await captureAt(page, 1440, '01-add-liquidity')
  checks.push({
    id: 'add-liquidity-title',
    ok: (addTitle || '').includes('Add Liquidity') && builderLabelCount === 0,
    addTitle,
    builderLabelCount,
    tabAdd,
    screenshot: addShot.shot,
  })

  // 2. Liquidity Building navigation + product
  await page.goto(`${BASE}/liquidity-studio?view=building`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(4000)
  const panel = await page.locator('[data-liquidity-building-panel]').count()
  const setupCta = await page.locator('[data-testid="lb-primary-cta"]').first().textContent().catch(() => '')
  const entryLead = await page.locator('[data-testid="lb-entry-lead"]').first().textContent().catch(() => '')
  const pending = await page.locator('[data-testid="lb-activation-pending-badge"], [data-testid="lb-blocked-banner"]').count()
  const noBuilderUnderBuilding = await page.locator('[data-ls-builder]').count()
  const building1440 = await captureAt(page, 1440, '02-liquidity-building')
  checks.push({
    id: 'liquidity-building-mounted',
    ok: tabBuilding > 0 && panel > 0 && /Set Up Liquidity Building/i.test(setupCta || '') && noBuilderUnderBuilding === 0,
    panel,
    setupCta,
    entryLead,
    pending,
    noBuilderUnderBuilding,
    screenshot: building1440.shot,
    overflow1440: building1440.overflow,
  })

  // 3. Setup accessible
  const cta = page.locator('[data-testid="lb-primary-cta"]').first()
  if (await cta.count()) {
    await cta.click()
    await page.waitForTimeout(1000)
  }
  const setupView = await page.locator('[data-testid="lb-setup-view"]').count()
  const setupShot = await captureAt(page, 1440, '03-setup')
  checks.push({
    id: 'setup-accessible',
    ok: setupView > 0,
    setupView,
    screenshot: setupShot.shot,
  })

  // 4. Responsive 768 / 390 — tab still present
  const b768 = await captureAt(page, 768, '04-building')
  const tab768 = await page.locator('[data-testid="ls-tab-liquidity-building"]').count()
  const b390 = await captureAt(page, 390, '05-building')
  const tab390 = await page.locator('[data-testid="ls-tab-liquidity-building"]').count()
  checks.push({
    id: 'responsive',
    ok: tab768 > 0 && tab390 > 0 && !b768.overflow && !b390.overflow,
    tab768,
    tab390,
    overflow768: b768.overflow,
    overflow390: b390.overflow,
    screenshots: [b768.shot, b390.shot],
  })

  // 5. Direct URL refresh survival
  await page.goto(`${BASE}/liquidity-studio?view=building`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(3000)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  const afterRefresh = await page.locator('[data-liquidity-building-panel]').count()
  const refreshShot = await captureAt(page, 1440, '06-refresh-building')
  checks.push({
    id: 'url-refresh',
    ok: afterRefresh > 0 && page.url().includes('view=building'),
    afterRefresh,
    url: page.url(),
    screenshot: refreshShot.shot,
  })

  await browser.close()
  const report = {
    mission: 'LB024',
    base: BASE,
    verifiedAt: new Date().toISOString(),
    checks,
    verdict: checks.every((c) => c.ok) ? 'LB024_LIVE_VERIFIED' : 'LB024_LIVE_BLOCKED',
  }
  const reportPath = path.join(__dirname, 'lb024-live-verification.json')
  await writeFile(reportPath, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.verdict === 'LB024_LIVE_VERIFIED' ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
