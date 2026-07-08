#!/usr/bin/env node
/** R730A — DEX runtime indexing foundation gate. */
import { chromium } from 'playwright'
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r730a-indexing-foundation')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000'

const ROUTES = [
  { path: '/', alias: 'home' },
  { path: '/trade', alias: 'trade' },
  { path: '/liquidity-studio', alias: 'liquidity-studio' },
  { path: '/farms', alias: 'farms' },
  { path: '/pools', alias: 'pools' },
  { path: '/trending', alias: 'trending' },
  { path: '/projects', alias: 'projects' },
  { path: '/radar', alias: 'dex-intelligence' },
  { path: '/collectibles', alias: 'identity-hub' },
]

const SOCIAL = {
  telegram: 'https://t.me/melegacommunity',
  x: 'https://x.com/meleganews',
  instagram: 'https://www.instagram.com/melega.finance/',
}

function killPort(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' })
  } catch {
    /* ignore */
  }
}

async function waitForServer(url, attempts = 40) {
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

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  if (!process.env.SCREENSHOT_BASE_URL) {
    killPort(3000)
    execSync('yarn build', { cwd: WEB, stdio: 'inherit' })
    const child = spawn('yarn', ['start'], { cwd: WEB, stdio: 'ignore', detached: true })
    child.unref()
    await waitForServer(BASE)
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()
  const checks = []
  const failures = []

  for (const route of ROUTES) {
    const res = await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    const status = res?.status() ?? 0
    const bodyText = await page.evaluate(() => document.body.innerText)
    const permanentIndexing = /Indexing activity|Indexing liquidity|Indexing swaps/i.test(bodyText)
      && !/Source:|Indexer:|Reason:/i.test(bodyText)
    checks.push({ route: route.path, alias: route.alias, status, permanentIndexing })
    if (status !== 200) failures.push(`${route.path} HTTP ${status}`)
    if (permanentIndexing) failures.push(`${route.path} shows permanent generic indexing copy`)
    await page.screenshot({ path: path.join(OUT, `${route.alias}.png`), fullPage: false })
  }

  await page.goto(`${BASE}/trade`, { waitUntil: 'domcontentloaded' })
  const socialHrefs = await page.$$eval('[data-melega-social-icons] a', (links) =>
    links.map((a) => ({ href: a.getAttribute('href') ?? '', label: a.getAttribute('aria-label') ?? '' })),
  )
  const hasDiscord = socialHrefs.some((l) => /discord/i.test(l.href) || /discord/i.test(l.label))
  const hasTelegram = socialHrefs.some((l) => l.href === SOCIAL.telegram)
  const hasX = socialHrefs.some((l) => l.href === SOCIAL.x)
  const hasInstagram = socialHrefs.some((l) => l.href === SOCIAL.instagram)

  if (hasDiscord) failures.push('Discord icon still present in header')
  if (!hasTelegram) failures.push('Telegram link incorrect or missing')
  if (!hasX) failures.push('X link incorrect or missing')
  if (!hasInstagram) failures.push('Instagram link incorrect or missing')

  await browser.close()
  if (!process.env.SCREENSHOT_BASE_URL) killPort(3000)

  const report = {
    gate: failures.length === 0 ? 'PASS' : 'FAIL',
    verdict: failures.length === 0 ? 'R730A_INDEXING_FOUNDATION_COMPLETE' : 'R730A_INDEXING_FOUNDATION_PARTIAL',
    checks,
    social: { hasTelegram, hasX, hasInstagram, hasDiscord, hrefs: socialHrefs },
    failures,
    screenshots: OUT,
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(failures.length === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
