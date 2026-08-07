/**
 * Liquidity Studio V3 — presentation tokens (match Project Page V5 / Farms).
 */
import { uxRebuildColors, uxRebuildLayout, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'

export const liqV3 = {
  contentMax: uxRebuildLayout.contentMax,
  pageBg: uxRebuildColors.pageBg,
  gold: uxRebuildColors.gold,
  goldLine: 'rgba(221, 185, 47, 0.32)',
  text: uxRebuildColors.text,
  mute: uxRebuildColors.secondary,
  mute2: uxRebuildColors.muted,
  line: 'rgba(255, 255, 255, 0.08)',
  panel: 'rgba(14, 14, 14, 0.96)',
  panel2: 'rgba(18, 18, 18, 0.98)',
  radius: uxRebuildRadius.card,
  heroMaxH: '200px',
  emptyMaxH: '120px',
} as const

export const LIQ_V3_LIVE_CHAINS: Array<{ id: number; label: string }> = [
  { id: 56, label: 'BNB' },
  { id: 8453, label: 'Base' },
  { id: 137, label: 'Polygon' },
  { id: 1, label: 'Ethereum' },
  { id: 42161, label: 'Arbitrum' },
  { id: 43114, label: 'Avalanche' },
]

export type LiquidityV3Tab = 'positions' | 'add' | 'building'

export const LIQ_V3_COPY = {
  title: 'Liquidity',
  subtitle: 'Provide liquidity, earn fees, and manage your positions across Melega DEX.',
  addCta: 'Add Liquidity',
  positionsCta: 'My Positions',
  aiEntry: 'AI Liquidity Builder',
  aiSub: 'Automate liquidity building for your token.',
  aiBeta: 'BETA · BNB only',
  aiOpen: 'Open Liquidity Builder',
  tabPositions: 'My Liquidity',
  tabAdd: 'Add Liquidity',
  tabAi: 'AI Liquidity Builder · BETA',
  emptyPositions: 'No liquidity positions yet.',
  emptyAdd: 'Add Liquidity',
  snapshot: {
    total: 'Total Liquidity',
    volume: '24H Volume',
    fees: '24H LP Fees',
    positions: 'My Positions',
    chains: 'Chains',
  },
  createFarmNudge: 'Want to incentivize this liquidity?',
  createFarmCta: 'Create Farm',
} as const
