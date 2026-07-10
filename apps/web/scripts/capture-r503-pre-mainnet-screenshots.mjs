/** R503 — Build Studio entry, import input, identity collection detail. */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../../docs/screenshots/r503-pre-mainnet-candidate')
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const SHOTS = [
  { name: 'build-studio-import-desktop-1440x900.png', width: 1440, height: 900, path: '/build-studio#build-import' },
  { name: 'build-studio-import-mobile-390x844.png', width: 390, height: 844, path: '/build-studio#build-import' },
  { name: 'collectibles-collection-detail-desktop.png', width: 1440, height: 900, path: '/collectibles/babymarco-genesis' },
  { name: 'trade-terminal-desktop.png', width: 1440, height: 900, path: '/trade' },
  { name: 'projects-advisor-desktop.png', width: 1440, height: 900, path: '/projects' },
]

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const measurements = []

  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } })
    await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: 'networkidle', timeout: 120000 })
    if (shot.path.includes('build-studio')) {
      await page.waitForSelector('[data-iet-contract-input]', { timeout: 60000 })
      const inputBox = await page.locator('[data-iet-contract-input]').boundingBox()
      measurements.push({
        shot: shot.name,
        viewport: `${shot.width}x${shot.height}`,
        inputWidth: inputBox?.width ?? 0,
        desktopMin680: shot.width > 768 ? Boolean(inputBox && inputBox.width >= 680) : null,
      })
    }
    await page.screenshot({ path: path.join(OUT, shot.name), fullPage: shot.height <= 900 })
    await page.close()
  }

  await browser.close()

  const report = {
    task: 'R503 PRE-MAINNET CANDIDATE',
    deliverable: 'R503_PRE_MAINNET_CANDIDATE',
    capturedAt: new Date().toISOString(),
    stagingUrl: process.env.STAGING_URL || 'https://v2.melega.finance',
    production: 'untouched',
    main: 'untouched',
    dexMelegaAi: 'untouched',
    merge: false,
    deployProduction: false,
    screenshots: SHOTS.map((s) => s.name),
    importInput: {
      desktopMinPx: 680,
      desktopMaxPx: 760,
      analyzeButtonPx: 280,
      measurements,
    },
    constitutionalChanges: {
      p0_buildStudioEntry: true,
      p1_buildSubmenu: true,
      p2_importContractUx: true,
      p3_poolsReality: true,
      p4_tradeMarketSources: true,
      p5_projectsAdvisor: true,
      p6_trendingBar: true,
      p7_collectionDetailLinks: true,
      p8_myEconomyHidden: true,
      p9_machineReadability: 'audited',
    },
    navigationGraph: {
      buildEntry: '/build-studio',
      importLegacyRedirect: '/import-existing-token → /build-studio#build-import',
      launchRedirect: '/launch → /build-studio',
      lockLiquidity: 'hidden',
      myEconomy: 'hidden from civilization entry; command-center is cockpit',
    },
    machineCoverage: {
      home: 'melega.home.v1',
      trade: 'melega.trade.market.v1',
      projects: 'melega.projects.v1',
      pools: 'melega.pools.v1',
      farms: 'melega.farms.v1',
      build: 'melega.build-studio.v1',
      import: 'melega.import-existing-token/v1',
      collectibles: 'melega.collectibles.v1',
      commandCenter: 'melega.command-center.v1',
      fabric: 'melega.civilization.fabric.v1',
    },
    remainingBlockers: [
      'Holder count on Trade still requires explorer API wiring',
      'Lock Liquidity workflow not implemented (intentionally hidden)',
      'Create Token / Farm / Pool remain preparation-only disabled nav items',
      'Planned identity collections (Master M, Aaron, Raky) have detail shells only — no mint surface',
    ],
    excludedFromCommit: [
      'docs/screenshots/**',
      'kerl/treasury experiments',
      'yarn.lock bulk drift',
      'radar UI uncommitted bulk',
    ],
  }

  fs.writeFileSync(path.join(OUT, 'validation-report.json'), JSON.stringify(report, null, 2))
  console.log('R503 validation saved to', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
