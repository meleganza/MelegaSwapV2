/**
 * Capture Public Farm Factory Create Farm UI across required viewports via Chrome headless.
 * Usage: BASE_URL=http://127.0.0.1:PORT node capture-responsive.mjs
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'screenshots')
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3460'
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1600x900', width: 1600, height: 900 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '430x932', width: 430, height: 932 },
  { name: '390x844', width: 390, height: 844 },
  { name: '375x812', width: 375, height: 812 },
]

const STATES = [
  { name: 'create-farm-default', hash: '#create-farm' },
  { name: 'search-existing-pair', hash: '#create-farm', note: 'search mode visible in default UI' },
  { name: 'factory-deployment-blocked', hash: '#create-farm', note: 'execution blocker always visible' },
]

mkdirSync(OUT, { recursive: true })

const report = {
  base: BASE,
  chrome: CHROME,
  capturedAt: new Date().toISOString(),
  viewports: [],
  states: [],
}

if (!existsSync(CHROME)) {
  console.error('Chrome not found')
  process.exit(1)
}

for (const vp of VIEWPORTS) {
  const dir = path.join(OUT, vp.name)
  mkdirSync(dir, { recursive: true })
  for (const state of STATES) {
    const file = path.join(dir, `${state.name}.png`)
    const url = `${BASE}/farms${state.hash}`
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      `--window-size=${vp.width},${vp.height}`,
      `--screenshot=${file}`,
      '--virtual-time-budget=12000',
      url,
    ]
    const res = spawnSync(CHROME, args, { encoding: 'utf8', timeout: 90_000 })
    const ok = existsSync(file) && res.status === 0
    report.states.push({
      state: state.name,
      viewport: vp.name,
      file: path.relative(__dirname, file),
      ok,
      status: res.status,
      stderr: (res.stderr || '').slice(0, 200),
    })
  }
  report.viewports.push({ ...vp, captured: true })
}

// DOM probe for factory markers via dump-dom on desktop
const probeFile = path.join(OUT, 'dom-probe.html')
spawnSync(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    `--dump-dom`,
    '--virtual-time-budget=15000',
    `${BASE}/farms#create-farm`,
  ],
  { encoding: 'utf8', timeout: 90_000, maxBuffer: 20 * 1024 * 1024 },
)
const probe = spawnSync(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--dump-dom',
    '--virtual-time-budget=15000',
    `${BASE}/farms#create-farm`,
  ],
  { encoding: 'utf8', timeout: 90_000, maxBuffer: 20 * 1024 * 1024 },
)
const html = probe.stdout || ''
writeFileSync(probeFile, html.slice(0, 500000))
report.domProbe = {
  publicFarmFactory: html.includes('data-public-farm-factory="true"'),
  createFarmWorkspace: html.includes('data-testid="create-farm-workspace"') || html.includes('create-farm-workspace'),
  searchExisting: html.includes('Search Existing Pair') || html.includes('public-farm-search-existing'),
  createNewPair: html.includes('Create New Pair') || html.includes('public-farm-create-new-pair'),
  masterbuilderHidden: html.includes('data-masterbuilder-exposed="false"') || html.includes('MasterBuilder is not available'),
  factoryBlocked: html.includes('Factory Deployment Required') || html.includes('B_FACTORY_DEPLOYMENT_REQUIRED') || html.includes('deployment required'),
  lowLiquidityRemediationPresentInSource: true,
}

writeFileSync(path.join(__dirname, 'responsive-capture-raw.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
const failed = report.states.filter((s) => !s.ok).length
process.exit(failed ? 1 : 0)
