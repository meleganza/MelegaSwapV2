#!/usr/bin/env node
/**
 * R107-B Visual Validation Certification
 * Captures screenshots + runs automated overlap/overflow checks.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r107b-visual-certification')
const BASE = process.env.SCREENSHOT_BASE_URL || 'https://v2.melega.finance'

const ROUTES = [
  '/',
  '/trade',
  '/liquidity-studio',
  '/farms',
  '/pools',
  '/projects',
  '/trending',
  '/radar',
  '/collectibles',
  '/build-studio',
  '/import-existing-token',
  '/command-center',
]

const VIEWPORTS = [
  { tag: '390x844', width: 390, height: 844, mobile: true },
  { tag: '428x926', width: 428, height: 926, mobile: true },
  { tag: '1440x900', width: 1440, height: 900, mobile: false },
  { tag: '1728x1117', width: 1728, height: 1117, mobile: false },
]

function routeSlug(route) {
  if (route === '/') return 'home'
  return route.replace(/^\//, '').replace(/\//g, '-')
}

async function auditPage(page) {
  return page.evaluate(() => {
    const issues = []
    const doc = document.documentElement
    const body = document.body
    const hOverflow = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0) - window.innerWidth
    if (hOverflow > 2) {
      issues.push({
        type: 'horizontal_overflow',
        severity: 'high',
        detail: `${hOverflow}px beyond viewport`,
        coords: { x: window.innerWidth, y: 0 },
      })
    }

    const selectors = 'button, a, h1, h2, h3, h4, p, span, div[data-ps-pool-card], div[data-fs-farm-card], article'
    const nodes = Array.from(document.querySelectorAll(selectors)).filter((el) => {
      const r = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return r.width > 4 && r.height > 4 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0'
    })

    const textNodes = nodes.filter((el) => {
      const t = (el.textContent || '').trim()
      return t.length > 2 && el.children.length < 8
    })

    const buttons = nodes.filter((el) => el.tagName === 'BUTTON' || (el.tagName === 'A' && el.getAttribute('role') === 'button'))

    function overlap(a, b) {
      const ar = a.getBoundingClientRect()
      const br = b.getBoundingClientRect()
      const xOverlap = Math.min(ar.right, br.right) - Math.max(ar.left, br.left)
      const yOverlap = Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top)
      if (xOverlap <= 1 || yOverlap <= 1) return null
      const area = xOverlap * yOverlap
      const minArea = Math.min(ar.width * ar.height, br.width * br.height)
      if (area / minArea < 0.15) return null
      return {
        x: Math.round((ar.left + br.left) / 2),
        y: Math.round((ar.top + br.top) / 2),
        overlapPx: Math.round(area),
      }
    }

    for (let i = 0; i < textNodes.length; i++) {
      for (let j = i + 1; j < textNodes.length; j++) {
        const a = textNodes[i]
        const b = textNodes[j]
        if (a.contains(b) || b.contains(a)) continue
        const hit = overlap(a, b)
        if (hit) {
          const aText = (a.textContent || '').trim().slice(0, 40)
          const bText = (b.textContent || '').trim().slice(0, 40)
          if (aText === bText) continue
          issues.push({
            type: 'text_overlap',
            severity: 'high',
            detail: `"${aText}" ∩ "${bText}"`,
            coords: { x: hit.x, y: hit.y },
          })
        }
      }
      if (issues.length > 25) break
    }

    for (const btn of buttons.slice(0, 40)) {
      for (const txt of textNodes.slice(0, 80)) {
        if (btn.contains(txt) || txt.contains(btn)) continue
        const hit = overlap(btn, txt)
        if (hit) {
          issues.push({
            type: 'button_text_overlap',
            severity: 'high',
            detail: `button "${(btn.textContent || '').trim().slice(0, 30)}" over text "${(txt.textContent || '').trim().slice(0, 30)}"`,
            coords: { x: hit.x, y: hit.y },
          })
        }
      }
      if (issues.length > 40) break
    }

    const clipped = []
    for (const el of textNodes.slice(0, 120)) {
      const r = el.getBoundingClientRect()
      const parent = el.parentElement
      if (!parent) continue
      const pr = parent.getBoundingClientRect()
      const style = getComputedStyle(el)
      if (style.overflow === 'hidden' || style.textOverflow === 'ellipsis') {
        if (el.scrollWidth > el.clientWidth + 2 && (el.textContent || '').trim().length > 8) {
          clipped.push({
            type: 'text_clipped',
            severity: 'medium',
            detail: (el.textContent || '').trim().slice(0, 60),
            coords: { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) },
          })
        }
      }
      if (r.bottom > pr.bottom + 2 && r.height > 12) {
        clipped.push({
          type: 'overflow_parent',
          severity: 'medium',
          detail: (el.textContent || '').trim().slice(0, 60),
          coords: { x: Math.round(r.left), y: Math.round(r.bottom) },
        })
      }
    }

    return {
      issues: issues.slice(0, 30),
      clipped: clipped.slice(0, 20),
      hOverflow,
      title: document.title,
      hasR107Style: !!document.querySelector('style[data-styled]') || document.body.innerHTML.includes('safe-area-inset-bottom'),
    }
  })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const results = []

  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      const name = `${routeSlug(route)}-${vp.tag}.png`
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
      const url = `${BASE}${route}`
      let status = 0
      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 })
        status = resp?.status() ?? 0
        await page.waitForTimeout(2500)
        await page.screenshot({ path: path.join(OUT, name), fullPage: vp.mobile })
        const audit = await auditPage(page)
        results.push({ route, viewport: vp.tag, screenshot: name, status, url, ...audit })
        console.log('ok', name, 'issues', audit.issues.length, 'overflow', audit.hOverflow)
      } catch (err) {
        results.push({ route, viewport: vp.tag, screenshot: name, status, url, error: String(err) })
        console.error('fail', name, err.message)
      }
      await page.close()
    }
  }

  await browser.close()

  const report = {
    task: 'R107-B VISUAL VALIDATION CERTIFICATION',
    baseUrl: BASE,
    capturedAt: new Date().toISOString(),
    routes: ROUTES,
    viewports: VIEWPORTS.map((v) => v.tag),
    results,
    summary: {
      totalShots: results.length,
      shotsWithHorizontalOverflow: results.filter((r) => (r.hOverflow ?? 0) > 2).length,
      shotsWithOverlapIssues: results.filter((r) => (r.issues?.length ?? 0) > 0).length,
      shotsWithClipping: results.filter((r) => (r.clipped?.length ?? 0) > 0).length,
      errors: results.filter((r) => r.error).length,
    },
  }

  fs.writeFileSync(path.join(OUT, 'certification-audit.json'), JSON.stringify(report, null, 2))
  console.log('done', OUT)
  console.log(JSON.stringify(report.summary))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
