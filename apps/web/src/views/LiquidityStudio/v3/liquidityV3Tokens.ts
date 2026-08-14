/**
 * Liquidity Studio V3 — presentation tokens (Farms / Pools / Project Page parity).
 */
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'

export const liqV3 = {
  contentMax: '1376px',
  pageBg: uxRebuildColors.pageBg,
  /** Farms/Pools hero gold (premium parity). */
  gold: '#F4C430',
  goldHover: '#FFD34D',
  goldLine: 'rgba(244, 196, 48, 0.45)',
  text: uxRebuildColors.text,
  mute: uxRebuildColors.secondary,
  mute2: uxRebuildColors.muted,
  line: 'rgba(255, 255, 255, 0.09)',
  panel: 'rgba(15, 15, 15, 0.92)',
  panel2: 'rgba(18, 18, 18, 0.98)',
  radius: uxRebuildRadius.card,
  /** Dense laptop hero — full first viewport with snapshot (Farms language, tighter chrome). */
  heroMaxH: '220px',
  leftW: '440px',
  artworkW: '480px',
  trustW: '360px',
  columnGap: '20px',
  emptyMaxH: '100px',
  titleSize: '44px',
  titleLine: '48px',
  descSize: '15px',
  descLine: '22px',
  ctaH: '40px',
  pagePadY: '16px',
  pageGap: '14px',
  tabletBreak: '1199px',
  mobileBreak: '767px',
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
  addCta: 'Add / Remove',
  positionsCta: 'My Liquidity',
  aiEntry: 'AI Liquidity Builder',
  aiSub: 'Automate liquidity growth for your token.',
  aiBeta: 'BETA · BNB only',
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
