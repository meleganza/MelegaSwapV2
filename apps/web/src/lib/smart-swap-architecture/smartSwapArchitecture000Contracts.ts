/**
 * SMART_SWAP_ARCHITECTURE_000 — architecture lock contracts only.
 * No UI. No routing changes. No fee/economic modifications.
 */

export const SMART_SWAP_ARCHITECTURE_ID = 'SMART_SWAP_ARCHITECTURE_000' as const

export const SMART_SWAP_CERTIFIED_BASE = {
  label: 'MELEGA_DEX_V1_GLOBAL_PRODUCT_CERTIFIED',
  tip: '94d4979a9a95f6a0e17919b2a94fb983b6458c90',
  tipShort: '94d4979a',
  productionAncestor: 'ff6d6179243dd754570e870adc5564ed2d0c9498',
  productionAncestorShort: 'ff6d6179',
  productionLabel: 'MELEGA_DEX_V1_RUNTIME_RECOVERY_DEPLOYED',
} as const

/** Live architecture phase — must not be silently advanced by product modules. */
export const SMART_SWAP_ARCHITECTURE_PHASE = {
  current: 'ADAPTER',
  target: 'WRAPPER',
  constantSource: 'lib/melega-smart-router/types.ts#MELEGA_SMART_ROUTER_ARCHITECTURE',
} as const

/** Instant Swap vs Smart Swap — product surfaces, not dual DEXes. */
export const SMART_SWAP_SURFACES = {
  instantSwap: {
    id: 'instant-swap',
    purpose: 'Fast direct execution with minimal explanation',
    mount: 'Home Instant Swap widget (DexHomeScreen / HomeSwapPanel)',
    routeEntry: '/?focus=swap',
    engine: 'SmartSwapForm',
    characteristics: ['simple route presentation', 'user-controlled', 'minimal explanation', 'standard swap UX'],
  },
  smartSwap: {
    id: 'smart-swap',
    purpose: 'Optimized execution with route explanation and economic attribution',
    mount: 'Trade Terminal /swap (TradeCockpit) + ProjectSwapCard',
    routeEntry: '/swap',
    tradeRedirectNote: '/trade and /trade/ redirect to /?focus=swap (Instant Swap surface)',
    engine: 'SmartSwapForm',
    characteristics: [
      'route discovery',
      'liquidity comparison',
      'price impact evaluation',
      'gas awareness',
      'multi-hop possibility',
      'execution explanation',
      'economic attribution / treasury handoff status',
    ],
  },
} as const

export const SMART_SWAP_CANONICAL_OWNERSHIP = {
  swapExecution: 'DEX contracts / Router (wallet-signed)',
  routingIntelligence: 'Smart Swap runtime (DEX smart-router on mainnet; KERL on KRMP testnet)',
  tokenIdentity: 'Canonical Token Registry',
  liquidityDiscovery: 'DEX indexed liquidity + on-chain pair reserves',
  fees: 'Canonical fee engine (D87 protocol fee policy + on-chain LP fee)',
  settlement: 'Treasury Runtime (where applicable)',
  economicAttribution: 'KERL / civilization economic layer (policy + handoff; Runtime settles)',
} as const

export const SMART_SWAP_FORBIDDEN = [
  'invent liquidity',
  'fabricate savings',
  'guarantee best price',
  'bypass Router rules',
  'create independent balances',
  'custody funds',
  'become a wallet',
  'become a market maker',
  'create fake routes',
  'locally split FSC-01 waterfall',
  'own settlement_id / referral / buyback amounts',
] as const

export const SMART_SWAP_MUST_ANSWER_BEFORE_EXECUTION = [
  'Why this route?',
  'What pools are used?',
  'What fees apply?',
  'What price impact exists?',
  'What is the estimated output?',
  'What is the execution confidence?',
] as const

export const SMART_SWAP_MODULE_PLAN = [
  { id: '000-architecture', name: 'Architecture Lock', phase: 'certified-by-this-mission' },
  { id: '001-hero', name: 'Hero', phase: 'future', code: 'SMART_SWAP_MODULE_001_HERO' },
  { id: '002-route-engine', name: 'Route Engine', phase: 'future', code: 'SMART_SWAP_MODULE_002_ROUTE_ENGINE' },
  {
    id: '003-execution-preview',
    name: 'Execution Preview',
    phase: 'future',
    code: 'SMART_SWAP_MODULE_003_EXECUTION_PREVIEW',
  },
  {
    id: '004-fee-transparency',
    name: 'Fee Transparency',
    phase: 'future',
    code: 'SMART_SWAP_MODULE_004_FEE_TRANSPARENCY',
  },
  { id: '005-history', name: 'History', phase: 'future', code: 'SMART_SWAP_MODULE_005_HISTORY' },
  {
    id: '006-ai-assistance',
    name: 'AI Assistance',
    phase: 'future',
    code: 'SMART_SWAP_MODULE_006_AI_ASSISTANCE',
  },
  { id: '007-analytics', name: 'Analytics', phase: 'future', code: 'SMART_SWAP_MODULE_007_ANALYTICS' },
  {
    id: '008-final-polish',
    name: 'Final Visual Polish',
    phase: 'future',
    code: 'SMART_SWAP_MODULE_008_FINAL_POLISH',
  },
] as const

export const SMART_SWAP_CONTRACT_ANCHORS = {
  bscSmartRouter: '0xC6665d98Efd81f47B03801187eB46cbC63F328B0',
  bscV2Router: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3',
  lpBaseFeeBps: 25,
  protocolFeeStandardBps: 30,
  protocolFeeBuyMarcoBps: 20,
} as const

export const SMART_SWAP_DOC_PATHS = [
  'apps/web/docs/runtime/SMART_SWAP_ARCHITECTURE_000_REPORT.md',
  'apps/web/docs/runtime/SMART_SWAP_RUNTIME_BOUNDARIES.md',
  'apps/web/docs/runtime/SMART_SWAP_ECONOMIC_FLOW.md',
  'apps/web/docs/runtime/SMART_SWAP_MODULE_OWNERSHIP_MAP.md',
  'apps/web/docs/runtime/SMART_SWAP_DATA_SOURCE_MAP.md',
  'apps/web/docs/runtime/SMART_SWAP_FEE_AUTHORITY_MAP.md',
] as const
