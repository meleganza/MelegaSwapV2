#!/usr/bin/env node
/** Quick R703 screenshot capture — viewport only for speed. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r703-pools-premium')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

async function capture(page, name, fullPage = false) {
  await page.screenshot({ path: path.join(OUT, name), fullPage })
  console.log('saved', name)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  for (const [w, h, slug] of [
    [1440, 900, '1440'],
    [1728, 900, '1728'],
    [390, 844, '390'],
  ]) {
    const page = await context.newPage({ viewport: { width: w, height: h } })
    await page.goto(`${BASE}/pools`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForSelector('[data-pools-studio-screen]', { timeout: 60000 }).catch(() => undefined)
    await page.waitForTimeout(5000)
    await capture(page, `pools-r703-${slug}.png`, slug === '1440')
    if (slug === '1440') {
      const btn = page.locator('[data-ps-pool-card] button:has-text("Analyze")').first()
      if (await btn.count()) {
        await btn.click()
        await page.waitForTimeout(400)
      }
      await capture(page, 'pools-r703-1440-analyze.png', true)
      const body = await page.locator('body').innerText()
      const forbidden = await page.evaluate(() => {
        const exact = new Set(['0%', '0.00%', 'Calculating...', 'NaN', 'Infinity', 'APR —'])
        const hits = []
        document.querySelectorAll('[data-pools-studio-screen] *').forEach((el) => {
          if (el.closest('[data-ps-create-pool-builder]')) return
          if (!(el.childNodes.length === 1 && el.childNodes[0].nodeType === 3)) return
          const t = el.textContent?.trim() ?? ''
          if (exact.has(t) || t === 'Calculating' || /^nan/i.test(t)) hits.push(t)
          const n = parseFloat(t.replace('%', ''))
          if (t.endsWith('%') && Number.isFinite(n) && n > 0 && n <= 50 && t !== `${n.toFixed(2)}%` && t.includes('0.00')) {
            /* allow 40.00% etc */
          } else if (t === '0.00%') hits.push(t)
        })
        return [...new Set(hits)]
      })
      console.log('POOLS visible:', body.includes('POOLS'))
      console.log('pool cards:', await page.locator('[data-ps-pool-card]').count())
      console.log('featured hero:', await page.locator('[data-ps-featured-hero]').count())
      console.log('sidebar:', await page.locator('[data-ps-sidebar]').count())
      console.log('forbidden:', forbidden)
      console.log('error boundary:', /oops, something wrong/i.test(body))
    }
    await page.close()
  }

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
