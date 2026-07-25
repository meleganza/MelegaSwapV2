/**
 * FARMS_ARCHITECTURE_000 — architecture lock contracts only.
 * No UI. No CSS. No React redesign. Geometry/visual modules implement later.
 */

export const FARMS_ARCHITECTURE_ID = 'FARMS_ARCHITECTURE_000' as const

export const FARMS_FOUNDER_MOCKUP = {
  relativePath: 'apps/web/docs/runtime/farms-architecture-000/farms-founder-mockup-lock.png',
  sha256: 'a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a',
  bytes: 148024,
  width: 1024,
  height: 682,
  format: 'JPEG',
  sourceAsset: 'MELEGADEX_FARMS_PAGE-5f95d1a6-4ebf-4e87-acea-2d86624f08ea.png',
} as const

/** Current /farms mount is frozen as legacy until modular cutover. */
export const FARMS_LEGACY_IMPLEMENTATION = {
  label: 'LEGACY_IMPLEMENTATION',
  route: '/farms',
  pageEntry: 'apps/web/src/pages/farms/index.tsx',
  studioShell: 'views/FarmsStudio/FarmsStudioScreen',
  writeHooks: 'views/Farms/hooks/* + farmsRuntime/FarmsActionHost',
  historyRoute: '/farms/history',
  policy:
    'No feature development inside legacy Farms. Critical production bugfixes only until modular replacement.',
} as const

/** First-level product domains (Founder model). */
export const FARMS_PRIMARY_DOMAINS = ['My Farms', 'Explore Farms', 'Finished Farms'] as const

/** Canonical farm status vocabulary for the rebuild. */
export const FARMS_CANONICAL_STATUS = [
  'ACTIVE',
  'ENDED',
  'WITHDRAW_ONLY',
  'EMERGENCY',
  'PARTIAL',
  'UNAVAILABLE',
  'LOADING',
] as const

export type FarmsCanonicalStatus = (typeof FARMS_CANONICAL_STATUS)[number]

export const FARMS_MODULE_PLAN = [
  { id: '000-architecture', name: 'Architecture Lock', phase: 'certified-by-this-mission' },
  { id: '001-hero', name: 'Hero', phase: 'certified-by-module-001' },
  { id: '002-overview-kpis', name: 'Overview KPIs', phase: 'future' },
  { id: '003-my-farms', name: 'My Farms', phase: 'future' },
  { id: '004-explore-farms', name: 'Explore Farms', phase: 'future' },
  { id: '005-finished-farms', name: 'Finished Farms', phase: 'future' },
  { id: '006-yield-advisor', name: 'Yield Advisor', phase: 'future' },
  { id: '007-analytics', name: 'Analytics', phase: 'future' },
  { id: '008-visual-polish', name: 'Final Visual Polish', phase: 'future' },
  { id: '009-integration', name: 'Integration', phase: 'future' },
  { id: '010-certification', name: 'Certification', phase: 'future' },
] as const

export const FARMS_PRODUCT_MODEL = {
  is: 'LP yield farming center',
  isNot: 'single-token staking (Pools) or a list of cards',
  relationship: {
    pools: 'Single-token staking',
    farms: 'LP token staking',
  },
  answers: [
    'Which LP farms exist?',
    'Which LP farms belong to me?',
    'Which LP farms finished?',
    'Which LP rewards are claimable?',
    'Which LP should I farm next?',
  ],
} as const

export const FARMS_USER_ACTIONS = [
  'Stake',
  'Harvest',
  'Withdraw',
  'Emergency Withdraw',
  'Manage',
  'View Farm',
] as const

export const FARMS_DATA_OWNERSHIP = {
  sourceOfTruth: ['LP balances', 'Reward emissions', 'Pending rewards', 'Farm status'],
  derived: ['APR', 'TVL', 'Advisor', 'Analytics'],
} as const

export const FARMS_ARCHITECTURAL_RULES = [
  'One runtime',
  'One wallet model',
  'One LP model',
  'One reward model',
  'One action system',
  'No duplicated logic',
  'One responsibility per module',
] as const

export const FARMS_RESPONSIVE_VIEWPORTS = [
  { name: 'desktop', width: 1440 },
  { name: 'tablet', width: 1024 },
  { name: 'mobile-430', width: 430 },
  { name: 'mobile-390', width: 390 },
] as const
