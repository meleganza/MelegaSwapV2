/**
 * LIQUIDITY_ARCHITECTURE_000 — architecture lock contracts only.
 * No UI. No CSS. No React redesign. Geometry/visual modules implement later.
 */

export const LIQUIDITY_ARCHITECTURE_ID = 'LIQUIDITY_ARCHITECTURE_000' as const

export const LIQUIDITY_FOUNDER_MOCKUP = {
  relativePath: 'apps/web/docs/runtime/liquidity-architecture-000/liquidity-founder-mockup-lock.png',
  sha256: 'c14eea98d6c15e4d9012378597fb6d7414ad9be2595c0ae9acd764053d35147d',
  bytes: 101108,
  width: 1024,
  height: 528,
  format: 'JPEG',
  sourceAsset: 'MELEGADEX_-_LIQUIDITY_STUDIO_1-2ca5dd55-6712-4860-a602-9dc3ce7f6f24.png',
} as const

/**
 * Current production mounts are frozen as legacy until modular cutover.
 * Nav still points at classic /liquidity; product Studio lives at /liquidity-studio.
 */
export const LIQUIDITY_LEGACY_IMPLEMENTATION = {
  label: 'LEGACY_IMPLEMENTATION',
  navRoute: '/liquidity',
  navMount: 'views/Pool',
  studioRoute: '/liquidity-studio',
  studioPageEntry: 'apps/web/src/pages/liquidity-studio.tsx',
  studioShell: 'views/LiquidityStudio/LiquidityStudioScreen',
  studioComposition: 'onePage/UnifiedLiquidityPage + prior LIQUIDITY_MODULE_001–007 one-page stack',
  writePath: 'liquidityRuntime/* + liquidityBuilding/* + views/AddLiquidity / RemoveLiquidity bridges',
  policy:
    'No feature development inside legacy Liquidity / Liquidity Studio IA. Critical production bugfixes only until modular replacement.',
} as const

/** Two primary user journeys — everything else supports these. */
export const LIQUIDITY_PRIMARY_JOURNEYS = [
  'Provide liquidity manually',
  'Use Melega AI Liquidity Builder',
] as const

/** First-level journey domains under Liquidity Actions (Module 002). */
export const LIQUIDITY_ACTION_DOMAINS = [
  'Add Liquidity',
  'Remove Liquidity',
  'My Positions',
  'Simulation',
] as const

export const LIQUIDITY_MODULE_PLAN = [
  { id: '000-architecture', name: 'Architecture Lock', phase: 'certified-by-this-mission' },
  { id: '001-hero', name: 'Hero', phase: 'certified-by-this-mission' },
  { id: '002-liquidity-actions', name: 'Liquidity Actions', phase: 'certified-by-this-mission' },
  { id: '003-pool-discovery', name: 'Pool Discovery', phase: 'certified-by-this-mission' },
  { id: '004-add-liquidity', name: 'Add Liquidity', phase: 'certified-by-this-mission' },
  { id: '005-market-snapshot', name: 'Market Snapshot', phase: 'certified-by-this-mission' },
  { id: '006-your-positions', name: 'Your Positions', phase: 'future' },
  { id: '007-analytics', name: 'Analytics', phase: 'future' },
  { id: '008-visual-polish', name: 'Visual Polish', phase: 'future' },
  { id: '009-integration', name: 'Integration', phase: 'future' },
  { id: '010-certification', name: 'Certification', phase: 'future' },
] as const

export const LIQUIDITY_PRODUCT_MODEL = {
  is: 'Liquidity center with two primary journeys',
  isNot: 'dashboard of peer panels, database tables, or empty analytics shells',
  journeys: LIQUIDITY_PRIMARY_JOURNEYS,
  principle: 'Everything else supports Provide liquidity manually OR Use Melega AI Liquidity Builder',
  visualDirection: {
    style: 'Premium DEX',
    surfaces: 'dark surfaces',
    accents: 'gold accents',
    cards: 'compact cards',
    hierarchy: 'Apple-like hierarchy',
    avoid: ['dashboards', 'database tables', 'empty panels'],
  },
} as const

export const LIQUIDITY_USER_ACTIONS = [
  'Add Liquidity',
  'Remove Liquidity',
  'Select Pool',
  'Open AI Liquidity Builder',
  'Review Position',
  'Manage Position',
  'View Pool',
] as const

export const LIQUIDITY_DATA_OWNERSHIP = {
  sourceOfTruth: [
    'LP balances',
    'Pair reserves',
    'Mint / burn events',
    'Factory pair inventory',
    'Wallet allowances',
  ],
  derived: ['Pool share', 'Estimated APR', '24H fees', 'IL preview', 'Market snapshot deltas', 'Analytics aggregates'],
} as const

export const LIQUIDITY_ARCHITECTURAL_RULES = [
  'One runtime',
  'One wallet LP model',
  'One pair / pool discovery model',
  'One mint / remove action system',
  'Two primary journeys only',
  'No duplicated liquidity logic',
  'One responsibility per module',
] as const

export const LIQUIDITY_RESPONSIVE_VIEWPORTS = [
  { name: 'desktop', width: 1440 },
  { name: 'tablet', width: 1024 },
  { name: 'mobile-430', width: 430 },
  { name: 'mobile-390', width: 390 },
] as const

/** Prior one-page module IDs are historical — superseded by this architecture plan. */
export const LIQUIDITY_SUPERSEDED_ONE_PAGE_MODULES = [
  'LIQUIDITY_MODULE_001_HERO',
  'LIQUIDITY_MODULE_002_LB_CARD',
  'LIQUIDITY_MODULE_003_ADD_LIQUIDITY_CARD',
  'LIQUIDITY_MODULE_004_DEX_SNAPSHOT',
  'LIQUIDITY_MODULE_005_WALLET_OVERVIEW',
  'LIQUIDITY_MODULE_006_POSITIONS',
  'LIQUIDITY_MODULE_007_VISUAL_POLISH',
] as const
