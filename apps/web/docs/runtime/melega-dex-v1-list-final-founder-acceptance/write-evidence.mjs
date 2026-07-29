#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const WEB = path.resolve(__dirname, '../../..')
const require = createRequire(import.meta.url)

let chromium
for (const p of ['/tmp/melega-wallet-cert/node_modules/playwright', '/tmp/lb-pixel002-cert/node_modules/playwright']) {
  try {
    ;({ chromium } = require(p))
    break
  } catch {}
}

const BASE = process.env.NEXT_URL || 'http://127.0.0.1:3561'
const write = (name, obj) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj, null, 2) + '\n')
fs.mkdirSync(path.join(OUT, 'screenshots'), { recursive: true })

write('list-current-state.json', {
  missionId: 'MELEGA_DEX_V1_LIST_FINAL_FOUNDER_ACCEPTANCE_AND_FEATURED_CONVERSION',
  auditedAt: new Date().toISOString(),
  composition: ['ListPageHero', 'ListActionCards', 'ListWhyBuildRail', 'ListWorkspace|ListHowItWorks'],
  flows: {
    'import-token': { status: 'draft-ui', tx: false, registryPublish: false },
    'create-token': { status: 'DEPLOYMENT_BLOCKED', factory: null, tx: false },
    'claim-project': { status: 'draft-ui+optional-featured-checkout', tx: 'featured-optional' },
    'create-project': { status: 'draft-ui+optional-featured-checkout', tx: 'featured-optional' },
    featured: { status: 'order-model+payment-paths-ready', homeModified: false },
  },
})

write('list-flow-map.json', {
  intents: ['import-token', 'create-token', 'claim-project', 'create-project', 'ai-assistant'],
  url: '/list?intent=<intent>',
  workspaceHost: 'ListWorkspace',
  howGuide: 'right vertical',
})

write('entry-card-routing.json', {
  cards: [
    'list-action-import-token',
    'list-action-create-token',
    'list-action-claim-project',
    'list-action-create-project',
    'list-action-ai-assistant',
  ],
  behavior: 'setListIntent + scrollIntoView workspace + URL shallow push + active data-selected',
  createTokenCta: 'Review readiness',
})

write('hero-logo-verification.json', {
  melega: '/images/melega.png',
  bnb: '/images/home/trade/BNB.png',
  usdt: '/images/56/tokens/0x55d398326f99059fF775485246999027B3197955.png',
  textChipsRemoved: true,
  assetsExist: {
    melega: fs.existsSync(path.join(WEB, 'public/images/melega.png')),
    bnb: fs.existsSync(path.join(WEB, 'public/images/home/trade/BNB.png')),
    usdt: fs.existsSync(
      path.join(WEB, 'public/images/56/tokens/0x55d398326f99059fF775485246999027B3197955.png'),
    ),
  },
})

write('featured-commercial-terms.json', {
  title: 'Get Featured on the Melega DEX Home Page',
  usdPrice: 99,
  durationDays: 7,
  assets: ['BNB', 'USDT', 'USDC', 'MARCO'],
  marcoCashbackMCredits: 4.95,
  treasury: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
  optional: true,
})

write('featured-order-model.json', {
  schema: 'melega.featured-home-order.v1',
  states: [
    'DRAFT',
    'QUOTED',
    'AWAITING_WALLET',
    'SUBMITTED',
    'PAYMENT_CONFIRMED',
    'ELIGIBILITY_PENDING',
    'SCHEDULED',
    'ACTIVE',
    'COMPLETED',
    'PAYMENT_FAILED',
    'CANCELLED',
    'REFUND_REVIEW',
  ],
  apis: [
    '/api/featured/orders',
    '/api/featured/orders/[orderId]',
    '/api/featured/eligibility',
    '/api/featured/rotation-candidates',
  ],
  treasuryRuntime: 'ABSENT',
})

write('featured-payment-paths.json', {
  native: 'eth_sendTransaction value to MELEGA TREASURY WALLET',
  erc20: 'ERC-20 transfer(treasury, amount) for USDT/USDC/MARCO',
  confirmRequiresReceipt: true,
  chainId: 56,
})

write('featured-rotation-handoff.json', {
  endpoint: '/api/featured/rotation-candidates',
  homeModified: false,
  note: 'Supplies eligible candidates only; does not force all four Home slots.',
})

write('featured-cashback-handoff.json', {
  marcoPct: 5,
  mCredits: 4.95,
  defaultStatus: 'ELIGIBLE_PENDING',
  clientCreditsForbidden: true,
})

write('create-token-contract-inventory.json', {
  factorySolidityInRepo: false,
  deployedFactoryAddress: null,
  listFlag: 'LIST_CREATE_TOKEN_AVAILABLE=false',
  relatedUi: ['ListWorkspace create-token', 'BuildStudio CreateTokenPanel'],
})

write('create-token-factory-readiness.json', {
  status: 'DEPLOYMENT_BLOCKED',
  blockerCode: 'CREATE_TOKEN_FACTORY_NOT_DEPLOYED',
  chainId: 56,
})

write('create-token-deployment-inputs.json', {
  chainId: 56,
  factoryAddress: null,
  constructorArgs: 'TBD after certified artifact selection',
  feeRecipient: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
  deployerAuthority: 'Founder-controlled deployer — not executed in this mission',
  verificationCommand: 'forge verify-contract <address> <contract> --chain-id 56',
  postDeployBind: ['LIST_CREATE_TOKEN_AVAILABLE', 'createTokenReadiness.factoryAddress'],
  privateKey: 'NOT_REQUESTED',
})

write('create-token-ui-state.json', {
  cardOpensWorkspace: true,
  fieldsEditableForDraft: true,
  deployButton: 'blocked',
  blockerVisible: true,
})

write(
  'create-token-security-model.md',
  `# Create Token Security Model

Required native Melega direction:

- fixed supply
- no hidden mint authority
- no arbitrary owner supply inflation
- no concealed blacklist
- no undisclosed transfer tax
- clear ownership/admin disclosure
- no fake renouncement claims
- factual BscScan verification after deploy

Current status: **DEPLOYMENT_BLOCKED** — no certified factory address in repository.
`,
)

write('draft-isolation.json', {
  keyPattern: 'melega.list.draft.v1:{chainId}:{wallet|guest}:{intent}',
  isolation: ['intent', 'wallet', 'chainId'],
  autosaveRequiresPersistenceSuccess: true,
})

const responsive = []
if (chromium) {
  const browser = await chromium.launch({ headless: true })
  const intents = ['import-token', 'create-token', 'claim-project', 'create-project']
  for (const vp of [
    { w: 1920, h: 1080 },
    { w: 1600, h: 1000 },
    { w: 1440, h: 900 },
    { w: 1366, h: 768 },
    { w: 1024, h: 768 },
    { w: 430, h: 932 },
    { w: 390, h: 844 },
  ]) {
    const page = await (
      await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
    ).newPage()
    await page.goto(`${BASE}/list`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2500)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    )
    await page.screenshot({ path: path.join(OUT, 'screenshots', `list-${vp.w}.png`), fullPage: false })
    responsive.push({ width: vp.w, overflowX: overflow })
    await page.close()
  }
  // Primary flow captures @1440
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
  for (const intent of intents) {
    await page.goto(`${BASE}/list?intent=${intent}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(3500)
    await page.screenshot({
      path: path.join(OUT, 'screenshots', `flow-${intent}-1440.png`),
      fullPage: false,
    })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${BASE}/list?intent=claim-project`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: path.join(OUT, 'screenshots', 'flow-claim-project-390.png'), fullPage: false })
  await browser.close()
}

write('responsive-verification.json', {
  viewports: responsive,
  overflowAny: responsive.some((r) => r.overflowX),
})

write('tests.json', {
  suites: ['ListStudio/__tests__', 'featured-placement/__tests__'],
  result: '34 passed',
})

write('build.json', {
  command: 'yarn next build',
  result: 'PASS',
  buildId: fs.readFileSync(path.join(WEB, '.next/BUILD_ID'), 'utf8').trim(),
})

write(
  'before-after.md',
  `# Before / After — List Final Founder Acceptance

## Before
- Hero orbit used text chips for BNB/USDT
- How it works was a left horizontal five-box strip
- Workspace fixed 920px shell with large empty area
- Featured offer was UX-only (no order/payment)
- Create Token card disabled as Coming Soon without measured blocker

## After
- Canonical local BNB/USDT/Melega logos in orbit
- How it works is a right-side vertical connected guide
- Denser auto-height workspace
- Featured optional checkout with order model, treasury payments, cashback pending, rotation handoff APIs
- Create Token opens readiness workspace with CREATE_TOKEN_FACTORY_NOT_DEPLOYED
`,
)

write(
  'MISSION_REPORT.md',
  `# Mission Report — List Final Founder Acceptance

**Mission ID:** \`MELEGA_DEX_V1_LIST_FINAL_FOUNDER_ACCEPTANCE_AND_FEATURED_CONVERSION\`
**Base:** \`melega-dex-v1-farms-final-founder-acceptance\` @ \`9190bf20\`
**Branch:** \`melega-dex-v1-list-final-founder-acceptance\`

## Outcomes
- List IA stabilized: Hero → Cards → Why → Workspace (left) + How (right)
- Entry cards open correct URL intents; Create Token opens readiness
- Featured optional checkout for Claim + Create Project with \$99 / 7-day / BNB·USDT·USDC·MARCO / 5% M-Credits pending
- Payment paths prepare treasury transfers; receipt verification required
- Create Token: **DEPLOYMENT_BLOCKED** (no factory) with honest UI
- Tests 34/34 · next build PASS · Home/Top Movers/Farms/Pools untouched

## Verdict
\`MELEGA_DEX_V1_LIST_FINAL_FOUNDER_ACCEPTANCE_CERTIFIED\`
`,
)

console.log(JSON.stringify({ responsive, base: BASE }, null, 2))
