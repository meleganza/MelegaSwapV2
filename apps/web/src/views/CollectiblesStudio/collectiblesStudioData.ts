export type UtilityBadge =
  | 'verified'
  | 'ai-rated'
  | 'genesis'
  | 'utility'
  | 'builder'
  | 'validator'
  | 'membership'

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
  utilities: string[]
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

export const COLLECTIBLES_KPIS: CollectiblesKpiItem[] = [
  {
    id: 'total',
    label: 'Total Collectibles',
    value: '12.8K',
    delta: '+185 24h',
    deltaPositive: true,
    sparkline: [4, 5, 6, 7, 8, 9, 10, 11],
    icon: 'cube',
  },
  {
    id: 'owners',
    label: 'Total Owners',
    value: '8.42K',
    delta: '+124 24h',
    deltaPositive: true,
    sparkline: [5, 5, 6, 7, 7, 8, 9, 10],
    icon: 'users',
  },
  {
    id: 'volume',
    label: '24h Volume',
    value: '$1.28M',
    delta: '+36.7%',
    deltaPositive: true,
    sparkline: [3, 4, 5, 6, 8, 9, 10, 12],
    icon: 'volume',
  },
  {
    id: 'verified',
    label: 'Verified Collections',
    value: '320',
    delta: '+12 24h',
    deltaPositive: true,
    icon: 'shield',
  },
  {
    id: 'ai',
    label: 'AI Rated Collections',
    value: '285',
    delta: '+18 24h',
    deltaPositive: true,
    icon: 'brain',
  },
]

export const FEATURED_COLLECTION = {
  title: 'MASTER M GENESIS COLLECTION',
  description:
    'The first genesis collection of the Melega Civilization. Only 1,000 Genesis Passports grant Builder Identity, governance rights, and exclusive Civilization access.',
  floorPrice: '1.25 BNB',
  owners: '842',
  items: '1,000',
  volume: '1,254 BNB',
  utilityScore: 98,
  utilities: ['Builder Identity', 'Governance Rights', 'Civilization Access', 'Premium Services'],
}

export const AI_ADVISOR_ROWS: AdvisorRow[] = [
  { category: 'Best Long Term', title: 'Master M Genesis', score: 98, artTheme: 'genesis' },
  { category: 'Most Undervalued', title: 'Civilization Portal', score: 94, artTheme: 'hooded' },
  { category: 'Highest Utility', title: 'Validator Passport', score: 96, artTheme: 'validator' },
  { category: 'Emerging Collection', title: 'AI Agent Genesis', score: 92, artTheme: 'ai' },
  { category: 'Highest Activity', title: 'Golden Lion Elite', score: 90, artTheme: 'lion' },
]

export const FILTER_CHIPS = [
  'All',
  'Verified',
  'Membership',
  'Utility',
  'Art',
  'Gaming',
  'AI',
  'Genesis',
  'Limited',
  'Newest',
  'Most Traded',
  'Premium',
  'Builder',
  'Validator',
] as const

export const COLLECTION_CARDS: CollectionCard[] = [
  {
    id: 'c1',
    title: 'Civilization Portal',
    creator: 'Melega Studio',
    slug: 'civilization-portal',
    floorPrice: '0.85 BNB',
    volume24h: '142 BNB',
    items: '2,500',
    aiScore: 96,
    badges: ['verified', 'ai-rated', 'utility'],
    artTheme: 'hooded',
    utilities: ['Civilization Access', 'Governance Rights'],
  },
  {
    id: 'c2',
    title: 'Golden Lion Elite',
    creator: 'Melega Studio',
    slug: 'golden-lion-elite',
    floorPrice: '1.12 BNB',
    volume24h: '98 BNB',
    items: '500',
    aiScore: 95,
    badges: ['verified', 'genesis', 'membership'],
    artTheme: 'lion',
    utilities: ['Founder Membership', 'Premium Services'],
  },
  {
    id: 'c3',
    title: 'Neon Metropolis',
    creator: 'Civilization Labs',
    slug: 'neon-metropolis',
    floorPrice: '0.42 BNB',
    volume24h: '67 BNB',
    items: '3,200',
    aiScore: 88,
    badges: ['verified', 'utility'],
    artTheme: 'city',
    utilities: ['Marketplace Privileges'],
  },
  {
    id: 'c4',
    title: 'AI Agent Passport',
    creator: 'Melega AI',
    slug: 'ai-agent-passport',
    floorPrice: '0.68 BNB',
    volume24h: '54 BNB',
    items: '1,800',
    aiScore: 97,
    badges: ['ai-rated', 'utility'],
    artTheme: 'ai',
    utilities: ['AI Agent Passport', 'Future Civilization Benefits'],
  },
  {
    id: 'c5',
    title: 'Genesis Cube',
    creator: 'Melega Studio',
    slug: 'genesis-cube',
    floorPrice: '0.95 BNB',
    volume24h: '112 BNB',
    items: '1,000',
    aiScore: 94,
    badges: ['genesis', 'verified'],
    artTheme: 'cube',
    utilities: ['Builder Identity', 'Governance Rights'],
  },
  {
    id: 'c6',
    title: 'Validator Seal',
    creator: 'Melega Network',
    slug: 'validator-seal',
    floorPrice: '0.55 BNB',
    volume24h: '38 BNB',
    items: '750',
    aiScore: 93,
    badges: ['validator', 'utility'],
    artTheme: 'validator',
    utilities: ['Validator Identity'],
  },
  {
    id: 'c7',
    title: 'Builder Forge',
    creator: 'Civilization Labs',
    slug: 'builder-forge',
    floorPrice: '0.38 BNB',
    volume24h: '29 BNB',
    items: '2,100',
    aiScore: 89,
    badges: ['builder', 'utility'],
    artTheme: 'builder',
    utilities: ['Builder Identity'],
  },
  {
    id: 'c8',
    title: 'MARCO Founder Pass',
    creator: 'Melega DAO',
    slug: 'marco-founder-pass',
    floorPrice: '1.45 BNB',
    volume24h: '186 BNB',
    items: '250',
    aiScore: 98,
    badges: ['verified', 'genesis', 'membership'],
    artTheme: 'genesis',
    utilities: ['Founder Membership', 'Governance Rights', 'Premium Services'],
  },
  {
    id: 'c9',
    title: 'Arena Champion',
    creator: 'Melega Gaming',
    slug: 'arena-champion',
    floorPrice: '0.22 BNB',
    volume24h: '45 BNB',
    items: '5,000',
    aiScore: 82,
    badges: ['utility'],
    artTheme: 'gaming',
    utilities: ['Marketplace Privileges'],
  },
  {
    id: 'c10',
    title: 'Elite Membership',
    creator: 'Melega Studio',
    slug: 'elite-membership',
    floorPrice: '0.72 BNB',
    volume24h: '61 BNB',
    items: '1,200',
    aiScore: 91,
    badges: ['membership', 'verified'],
    artTheme: 'membership',
    utilities: ['Premium Services', 'Civilization Access'],
  },
]

export const TRENDING_NOW: SidebarListItem[] = [
  { rank: 1, title: 'Master M Genesis', price: '1.25 BNB', change: '+24.5%', changePositive: true, artTheme: 'genesis' },
  { rank: 2, title: 'Golden Lion Elite', price: '1.12 BNB', change: '+18.2%', changePositive: true, artTheme: 'lion' },
  { rank: 3, title: 'AI Agent Passport', price: '0.68 BNB', change: '+15.8%', changePositive: true, artTheme: 'ai' },
  { rank: 4, title: 'Civilization Portal', price: '0.85 BNB', change: '+12.4%', changePositive: true, artTheme: 'hooded' },
  { rank: 5, title: 'MARCO Founder Pass', price: '1.45 BNB', change: '+9.7%', changePositive: true, artTheme: 'genesis' },
]

export const NEWEST_COLLECTIONS: SidebarListItem[] = [
  { title: 'Validator Seal', price: '0.55 BNB', artTheme: 'validator' },
  { title: 'Builder Forge', price: '0.38 BNB', artTheme: 'builder' },
  { title: 'Arena Champion', price: '0.22 BNB', artTheme: 'gaming' },
  { title: 'Elite Membership', price: '0.72 BNB', artTheme: 'membership' },
  { title: 'Neon Metropolis', price: '0.42 BNB', artTheme: 'city' },
]

export const HIGHEST_UTILITY: SidebarListItem[] = [
  { title: 'Master M Genesis', price: '98', artTheme: 'genesis' },
  { title: 'MARCO Founder Pass', price: '98', artTheme: 'genesis' },
  { title: 'AI Agent Passport', price: '97', artTheme: 'ai' },
  { title: 'Civilization Portal', price: '96', artTheme: 'hooded' },
  { title: 'Validator Seal', price: '93', artTheme: 'validator' },
]

export const RECENTLY_SOLD: SidebarListItem[] = [
  { title: 'Golden Lion Elite #42', price: '1.18 BNB', artTheme: 'lion' },
  { title: 'Genesis Cube #891', price: '0.99 BNB', artTheme: 'cube' },
  { title: 'AI Agent #204', price: '0.71 BNB', artTheme: 'ai' },
  { title: 'Portal #156', price: '0.88 BNB', artTheme: 'hooded' },
  { title: 'Founder Pass #12', price: '1.52 BNB', artTheme: 'genesis' },
]

export const COLLECTOR_ACTIVITY: SidebarListItem[] = [
  { title: '0x7a3…f2c acquired Portal #89', price: '0.86 BNB', artTheme: 'hooded' },
  { title: '0x1b9…4de listed Lion #17', price: '1.15 BNB', artTheme: 'lion' },
  { title: '0x8f2…a01 minted Validator', price: '0.55 BNB', artTheme: 'validator' },
  { title: '0x3c4…9ab sold AI Agent #55', price: '0.69 BNB', artTheme: 'ai' },
  { title: '0x5e6…7cd bid Founder #3', price: '1.40 BNB', artTheme: 'genesis' },
]

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
  'ai-rated': { bg: 'rgba(167,139,250,0.12)', border: '#A78BFA', color: '#A78BFA' },
  genesis: { bg: 'rgba(214,180,69,0.12)', border: '#D6B445', color: '#D6B445' },
  utility: { bg: 'rgba(77,163,255,0.12)', border: '#4DA3FF', color: '#4DA3FF' },
  builder: { bg: 'rgba(214,180,69,0.08)', border: 'rgba(214,180,69,0.55)', color: '#D6B445' },
  validator: { bg: 'rgba(27,231,122,0.08)', border: 'rgba(27,231,122,0.55)', color: '#1BE77A' },
  membership: { bg: 'rgba(240,75,75,0.08)', border: 'rgba(240,75,75,0.45)', color: '#F04B4B' },
}
