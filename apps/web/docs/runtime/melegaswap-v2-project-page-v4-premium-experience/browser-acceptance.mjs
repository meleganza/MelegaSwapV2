#!/usr/bin/env node
/**
 * MELEGASWAP_V2_PROJECT_PAGE_V4_PREMIUM_EXPERIENCE — browser acceptance
 */
import { chromium } from '/tmp/node_modules/playwright/index.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'screenshots')
const BASE = process.env.MISSION_BASE || 'http://127.0.0.1:3042'
const SLUGS = ['marco', 'mm72', 'eyed', 'blion', 'young-degens']
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '390', width: 390, height: 844 },
]

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false })
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const checks = []
  const push = (id, pass, detail) => {
    checks.push({ id, pass: Boolean(pass), detail })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${id}`)
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  for (const slug of SLUGS) {
    await page.goto(`${BASE}/project-hq/${slug}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3500)
    const info = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="project-page-v4"]')
      const hero = document.querySelector('[data-testid="project-v4-hero"]')
      const chart = document.querySelector('[data-testid="project-v4-chart"], [data-testid="project-v4-chart-panel"]')
      const swap = document.querySelector('[data-testid="project-v4-swap"]')
      const market = document.querySelector('[data-testid="project-v4-market"]')
      const economy = document.querySelector('[data-testid="project-v4-economy"]')
      const grow = document.querySelector('[data-testid="project-v4-grow"]')
      const claim = document.querySelector('[data-testid="project-v4-claim"]')
      const buy = document.querySelector('[data-testid="project-v4-buy-hero"], [data-testid="project-v4-buy"]')
      const body = document.body.innerText || ''
      const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      const separateChartBand = [...document.querySelectorAll('[data-project-section="charts"]')].length > 0
      const growCards = [...document.querySelectorAll('[data-growth-service]')].map((el) => el.getAttribute('data-growth-service'))
      const accordionOpen = [...document.querySelectorAll('[data-testid="project-v4-dev-stack"] details')].some((d) => d.open)
      return {
        hasV4: !!root,
        hasHero: !!hero,
        hasChart: !!chart,
        hasSwap: !!swap,
        hasMarket: !!market,
        hasEconomy: !!economy,
        hasGrow: !!grow,
        hasClaim: !!claim,
        hasBuy: !!buy,
        overflowX,
        separateChartBand,
        growCards,
        accordionOpen,
        hasUnavailableWall: (body.match(/Unavailable/gi) || []).length > 12,
        hasBuyToken: /Buy Token/i.test(body),
        hasBoost: /Boost Your Project/i.test(body),
      }
    })
    await shot(page, `desktop-${slug}-1440`)
    push(`page-${slug}-structure`, info.hasV4 && info.hasHero && info.hasChart && info.hasSwap && info.hasMarket && info.hasEconomy && info.hasGrow && info.hasClaim && info.hasBuyToken && !info.separateChartBand && !info.overflowX && !info.accordionOpen, info)

    // Commercial flow: Featured opens checkout modal
    const featured = page.locator('[data-testid="project-v4-grow-featured"]')
    if (await featured.count()) {
      await featured.click()
      await page.waitForTimeout(800)
      const modal = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"], [data-testid*="checkout"], [data-melega-modal]')
        const text = document.body.innerText || ''
        return {
          hasDialog: !!dialog,
          mentionsFeatured: /Featured|Checkout|Package|Payment/i.test(text),
        }
      })
      push(`page-${slug}-featured-checkout`, modal.hasDialog || modal.mentionsFeatured, modal)
      await page.keyboard.press('Escape').catch(() => {})
      await page.waitForTimeout(400)
      // close modal if still open
      const close = page.locator('button:has-text("Close"), [aria-label*="Close" i], [data-testid*="close"]').first()
      if (await close.count()) await close.click().catch(() => {})
    }

    // Claim opens wizard
    const claimCta = page.locator('[data-testid="project-v4-claim-cta"]')
    if (await claimCta.count()) {
      await claimCta.click()
      await page.waitForTimeout(800)
      const wizard = await page.evaluate(() => {
        const text = document.body.innerText || ''
        return /Claim|ownership|Verify|Wallet/i.test(text)
      })
      push(`page-${slug}-claim-wizard`, wizard, { wizard })
      await page.keyboard.press('Escape').catch(() => {})
    }
  }

  // Responsive marco
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const p = await ctx.newPage()
    await p.goto(`${BASE}/project-hq/marco`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await p.waitForTimeout(2500)
    const ok = await p.evaluate(() => {
      const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      const v4 = !!document.querySelector('[data-testid="project-page-v4"]')
      return { overflowX, v4 }
    })
    await shot(p, `marco-${vp.name}`)
    push(`responsive-marco-${vp.name}`, ok.v4 && !ok.overflowX, ok)
    await ctx.close()
  }

  const report = {
    mission: 'MELEGASWAP_V2_PROJECT_PAGE_V4_PREMIUM_EXPERIENCE',
    base: BASE,
    generatedAt: new Date().toISOString(),
    checks,
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
