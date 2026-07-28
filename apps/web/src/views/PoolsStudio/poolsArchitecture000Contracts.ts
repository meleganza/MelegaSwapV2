/**
 * POOLS_ARCHITECTURE_000 — architecture lock contracts only.
 * No UI. No CSS. No React. Geometry/visual modules implement later.
 */

export const POOLS_ARCHITECTURE_ID = 'POOLS_ARCHITECTURE_000' as const

export const POOLS_FOUNDER_MOCKUP = {
  relativePath: 'apps/web/docs/runtime/pools-architecture-000/pools-founder-mockup-lock.png',
  sha256: '549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f',
  bytes: 166617,
  width: 934,
  height: 1024,
  format: 'JPEG',
} as const

/** Current /pools mount is frozen as legacy until modular cutover. */
export const POOLS_LEGACY_IMPLEMENTATION = {
  label: 'LEGACY_IMPLEMENTATION',
  route: '/pools',
  pageEntry: 'apps/web/src/pages/pools/index.tsx',
  studioShell: 'views/PoolsStudio/PoolsStudioScreen',
  writeHooks: 'views/Pools/hooks/*',
  historyRoute: '/pools/history',
  policy: 'No feature development inside legacy. Critical production bugfixes only until replacement.',
} as const

/** First-level product domains (Founder model). */
export const POOLS_PRIMARY_DOMAINS = ['My Positions', 'Explore Pools', 'Finished'] as const

/** Canonical pool status vocabulary for the rebuild. */
export const POOLS_CANONICAL_STATUS = [
  'ACTIVE',
  'ENDED',
  'WITHDRAW_ONLY',
  'EMERGENCY',
  'UNAVAILABLE',
  'PARTIAL',
  'LOADING',
] as const

export type PoolsCanonicalStatus = (typeof POOLS_CANONICAL_STATUS)[number]

export const POOLS_MODULE_PLAN = [
  { id: '000-architecture', name: 'Architecture Lock', phase: 'certified-by-this-mission' },
  { id: '001-hero', name: 'Hero', phase: 'future' },
  { id: '002-overview-kpis', name: 'Overview KPIs', phase: 'future' },
  { id: '003-my-positions', name: 'My Positions', phase: 'future' },
  { id: '004-explore-pools', name: 'Explore Pools', phase: 'future' },
  { id: '005-finished-pools', name: 'Finished Pools', phase: 'future' },
  { id: '006-reward-advisor', name: 'Reward Advisor', phase: 'future' },
  { id: '007-analytics', name: 'Analytics', phase: 'future' },
  { id: '008-visual-polish', name: 'Visual Polish', phase: 'future' },
  { id: '009-integration', name: 'Integration', phase: 'future' },
  { id: '010-certification', name: 'Certification', phase: 'future' },
] as const

export const POOLS_PRODUCT_MODEL = {
  is: 'complete staking center',
  isNot: 'a list of cards',
  answers: [
    'What pools exist?',
    'Which pools belong to me?',
    'Which pools finished?',
    'Which rewards are claimable?',
    'Which withdrawals are available?',
  ],
} as const

export const POOLS_ARCHITECTURAL_RULES = [
  'One responsibility per module',
  'No duplicated wallet logic',
  'No duplicated reward logic',
  'No duplicated LP logic',
  'No duplicated status logic',
  'No duplicated layouts',
] as const
