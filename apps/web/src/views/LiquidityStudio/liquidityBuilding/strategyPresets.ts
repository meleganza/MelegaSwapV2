/**
 * Founder-facing strategy presets → existing on-chain StrategyMode mapping.
 * Does not change fee economics or contract ABI — presentation mapping only.
 */
import type { StrategyMode } from './programStatus'

export type StrategyPreset = 'CONSERVATIVE' | 'BALANCED' | 'AI_OPTIMIZED' | 'AGGRESSIVE'

export type QuoteAssetKey = 'WBNB' | 'USDT' | 'USDC'

export const QUOTE_ASSET_OPTIONS: { key: QuoteAssetKey; label: string; address: string }[] = [
  { key: 'WBNB', label: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
  { key: 'USDT', label: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955' },
  { key: 'USDC', label: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
]

export const STRATEGY_PRESET_OPTIONS: {
  key: StrategyPreset
  title: string
  body: string
  tooltip: string
  recommended?: boolean
}[] = [
  {
    key: 'CONSERVATIVE',
    title: 'Conservative',
    body: 'Slower, safer growth. Builds liquidity carefully when markets are calm.',
    tooltip: 'Conservative: slower, safer growth. Builds liquidity carefully when markets are calm.',
  },
  {
    key: 'BALANCED',
    title: 'Balanced',
    body: 'Steady growth with moderate intensity across market conditions.',
    tooltip: 'Balanced: steady growth with moderate intensity across market conditions.',
  },
  {
    key: 'AI_OPTIMIZED',
    title: 'AI Optimized',
    body: 'Melega decides when and how much to build from real market demand.',
    tooltip: 'AI Optimized: Melega decides when and how much to build from real market demand.',
    recommended: true,
  },
  {
    key: 'AGGRESSIVE',
    title: 'Aggressive',
    body: 'Faster liquidity growth when eligible demand is strong.',
    tooltip: 'Aggressive: faster liquidity growth when eligible demand is strong.',
  },
]

export const LIQUIDITY_GOAL_OPTIONS = [
  {
    key: 'STEADY',
    label: 'Steady Growth',
    hint: 'Build liquidity gradually over time',
    tooltip: 'Steady Growth: build liquidity gradually over time with controlled steps.',
  },
  {
    key: 'DEPTH',
    label: 'Deeper Market',
    hint: 'Focus on thicker, more resilient pools',
    tooltip: 'Deeper Market: focus on thicker, more resilient pools for healthier trading.',
  },
  {
    key: 'LAUNCH',
    label: 'Launch Support',
    hint: 'Support early trading with careful growth',
    tooltip: 'Launch Support: support early trading with careful, founder-friendly growth.',
  },
] as const

export type LiquidityGoalKey = (typeof LIQUIDITY_GOAL_OPTIONS)[number]['key']

/** Map founder preset → existing FULL_AI / DYNAMIC_RANGE on-chain modes. */
export function mapStrategyPreset(preset: StrategyPreset): {
  strategy: StrategyMode
  minimumRateBps: string
  maximumRateBps: string
} {
  switch (preset) {
    case 'CONSERVATIVE':
      return { strategy: 'DYNAMIC_RANGE', minimumRateBps: '50', maximumRateBps: '500' }
    case 'BALANCED':
      return { strategy: 'DYNAMIC_RANGE', minimumRateBps: '100', maximumRateBps: '1500' }
    case 'AGGRESSIVE':
      return { strategy: 'DYNAMIC_RANGE', minimumRateBps: '500', maximumRateBps: '5000' }
    case 'AI_OPTIMIZED':
    default:
      return { strategy: 'FULL_AI', minimumRateBps: '', maximumRateBps: '' }
  }
}
