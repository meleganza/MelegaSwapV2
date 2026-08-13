export type CommercialServiceId =
  | 'featured'
  | 'trend-boost'
  | 'sponsored-research'
  | 'liquidity'
  | 'create-farm'
  | 'create-pool'
  | 'claim-project'

export type CommercialCheckoutStep = 'configure' | 'confirm'

export type CommercialPaymentAsset = 'BNB' | 'USDT' | 'USDC' | 'MARCO'

export type MarketingHistoryKind =
  | 'featured'
  | 'trend-boost'
  | 'sponsored-research'
  | 'claim'
  | 'farm'
  | 'pool'
  | 'liquidity'

export type MarketingHistoryStatus = 'Completed' | 'Running' | 'Expired'

export type MarketingHistoryEntry = {
  id: string
  kind: MarketingHistoryKind
  label: string
  status: MarketingHistoryStatus
  packageId?: string
  createdAt: string
  expiresAt?: string | null
}

export const COMMERCIAL_SERVICES: Array<{
  id: CommercialServiceId
  title: string
  description: string
  priceHint: string
  icon: string
  needsPackage: boolean
  availability?: 'active' | 'pending'
  externalHref?: (chainId: number) => string
}> = [
  {
    id: 'featured',
    title: 'Featured',
    description: 'Homepage + Projects rotation for maximum discovery.',
    priceHint: 'From $29',
    icon: '★',
    needsPackage: true,
  },
  {
    id: 'trend-boost',
    title: 'Trend Boost',
    description: 'Amplify reach on Trending and Discovery surfaces.',
    priceHint: 'From $29',
    icon: '↗',
    needsPackage: true,
  },
  {
    id: 'sponsored-research',
    title: 'Sponsored Research',
    description: 'A clearly labelled research placement for verified project information.',
    priceHint: 'Activation pending',
    icon: '◈',
    needsPackage: false,
    availability: 'pending',
  },
  {
    id: 'liquidity',
    title: 'Liquidity',
    description: 'Deepen markets with LP on Melega DEX.',
    priceHint: 'Studio',
    icon: '◇',
    needsPackage: false,
    externalHref: (chainId) => `/liquidity-studio?view=add&chain=${chainId}`,
  },
  {
    id: 'create-farm',
    title: 'Create Farm',
    description: 'Launch incentives for LP holders.',
    priceHint: 'Studio',
    icon: '▣',
    needsPackage: false,
    externalHref: (chainId) => `/farms?create=1&chain=${chainId}`,
  },
  {
    id: 'create-pool',
    title: 'Create Pool',
    description: 'Stake rewards for single-asset holders.',
    priceHint: 'Studio',
    icon: '◉',
    needsPackage: false,
    externalHref: (chainId) => `/pools?create=1&chain=${chainId}`,
  },
  {
    id: 'claim-project',
    title: 'Claim Project',
    description: 'Verify ownership and publish your project identity.',
    priceHint: 'Wizard',
    icon: '✓',
    needsPackage: false,
  },
]

export const FEATURED_PACKAGE_BADGES = ['impressions', 'rotation', 'homepage', 'projects', 'ranking'] as const

export const TREND_PACKAGE_BADGES = ['Estimated Reach', 'Discovery Boost', 'Trending Surface'] as const

export const COMMERCIAL_CHAINS = [
  { id: 56, label: 'BNB Chain', short: 'BSC' },
] as const
