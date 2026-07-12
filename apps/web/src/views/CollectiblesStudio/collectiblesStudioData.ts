export type UtilityBadge =
  | 'verified'
  | 'ai-rated'
  | 'genesis'
  | 'utility'
  | 'builder'
  | 'validator'
  | 'membership'

export interface IdentityBinding {
  transferable?: string
  soulbound?: string
  delegable?: string
  walletBound?: string
  expiration?: string
}

export interface CollectiblesKpiItem {
  id: string
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  sparkline?: number[]
  icon: 'cube' | 'users' | 'volume' | 'shield' | 'brain'
}

export interface CollectionCard {
  id: string
  title: string
  creator: string
  slug: string
  floorPrice: string
  volume24h: string
  items: string
  aiScore: number
  badges: UtilityBadge[]
  artTheme: 'hooded' | 'lion' | 'city' | 'ai' | 'cube' | 'validator' | 'builder' | 'genesis' | 'membership' | 'gaming'
  identityLine: string
  utilityChips: string[]
  agentEnabled?: boolean
  identityBinding: IdentityBinding
  utilities: string[]
  previewImageUrl?: string
  fallbackImageUrl?: string
}

export interface AdvisorRow {
  category: string
  title: string
  score: number
  artTheme: CollectionCard['artTheme']
}

export interface SidebarListItem {
  rank?: number
  title: string
  price: string
  change?: string
  changePositive?: boolean
  artTheme: CollectionCard['artTheme']
}

/** Civilization identity categories — not generic NFT taxonomy. */
export const FILTER_CHIPS = [
  'All',
  'Builder',
  'Validator',
  'Governance',
  'Infrastructure',
  'AI',
  'Founder',
  'Identity',
  'Genesis',
  'Membership',
  'Utility',
] as const

export const BADGE_LABELS: Record<UtilityBadge, string> = {
  verified: 'Verified',
  'ai-rated': 'AI Rated',
  genesis: 'Genesis',
  utility: 'Utility',
  builder: 'Builder',
  validator: 'Validator',
  membership: 'Membership',
}

export const BADGE_COLORS: Record<UtilityBadge, { bg: string; border: string; color: string }> = {
  verified: { bg: 'rgba(27,231,122,0.12)', border: '#1BE77A', color: '#1BE77A' },
  'ai-rated': { bg: 'rgba(155,124,255,0.12)', border: '#9B7CFF', color: '#9B7CFF' },
  genesis: { bg: 'rgba(214,180,69,0.12)', border: '#D6B445', color: '#D6B445' },
  utility: { bg: 'rgba(76,163,255,0.12)', border: '#4CA3FF', color: '#4CA3FF' },
  builder: { bg: 'rgba(214,180,69,0.08)', border: 'rgba(214,180,69,0.55)', color: '#D6B445' },
  validator: { bg: 'rgba(27,231,122,0.08)', border: 'rgba(27,231,122,0.55)', color: '#1BE77A' },
  membership: { bg: 'rgba(240,75,75,0.08)', border: 'rgba(240,75,75,0.45)', color: '#F04B4B' },
}

export const BINDING_LABELS: Record<keyof IdentityBinding, string> = {
  transferable: 'Transferable',
  soulbound: 'Soulbound',
  delegable: 'Delegable',
  walletBound: 'Wallet Bound',
  expiration: 'Expiration',
}
