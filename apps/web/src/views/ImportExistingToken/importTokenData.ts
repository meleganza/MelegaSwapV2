export type ProvenanceSource =
  | 'Contract'
  | 'Explorer'
  | 'Website'
  | 'CoinGecko'
  | 'CoinMarketCap'
  | 'DexTools'
  | 'DexScreener'
  | 'TokenSniffer'
  | 'GoPlus'
  | 'Social'
  | 'GitHub'
  | 'On-chain'
  | 'Internal AI'

export type ReadinessTone = 'green' | 'yellow' | 'red'

export interface DiscoveryStep {
  id: string
  label: string
  complete: boolean
}

export interface ProvenanceField {
  key: string
  label: string
  value: string
  source: ProvenanceSource
  href?: string
}

export interface ReadinessReason {
  label: string
  tone: ReadinessTone
}

export interface InfrastructureSuggestion {
  id: string
  title: string
  checked: boolean
  estimatedImpact: string
  estimatedCompletion: string
  d87Contribution: string
}

export interface ServiceActivationItem {
  id: string
  title: string
  category: 'infrastructure' | 'optional'
  checked: boolean
  moduleHref: string
  description: string
}

export interface RecentImportEvent {
  id: string
  project: string
  time: string
  events: string[]
}

export interface AdvisorData {
  projectHealth: string
  infrastructureScore: number
  nextAction: string
  warnings: string[]
  confidence: number
  missingItems: string[]
}

export const DISCOVERY_PIPELINE: DiscoveryStep[] = [
  { id: 'paste', label: 'Paste Contract', complete: true },
  { id: 'read', label: 'Read Contract', complete: true },
  { id: 'identify', label: 'Identify Token', complete: true },
  { id: 'website', label: 'Discover Website', complete: true },
  { id: 'socials', label: 'Discover Socials', complete: true },
  { id: 'onchain', label: 'Read On-chain', complete: true },
  { id: 'radar', label: 'Radar Intelligence', complete: true },
  { id: 'ready', label: 'Infrastructure Ready', complete: true },
]

export const SUPPORTED_CHAINS = ['BNB', 'ETH', 'BASE', 'Polygon', 'Solana'] as const

export const EXPLORER_ICONS = [
  { id: 'bsc', label: 'BscScan', href: 'https://bscscan.com' },
  { id: 'eth', label: 'Etherscan', href: 'https://etherscan.io' },
  { id: 'base', label: 'Basescan', href: 'https://basescan.org' },
  { id: 'polygon', label: 'PolygonScan', href: 'https://polygonscan.com' },
  { id: 'sol', label: 'Solscan', href: 'https://solscan.io' },
] as const

export const DEMO_CONTRACT = '0x4a8f9c2e1b7d6e3f0a5c8b2d9e1f4a7c3b6e8d0'

export const PROJECT_DETECTED = {
  logo: 'GL',
  name: 'Golden Lion',
  ticker: 'GLION',
  chain: 'BNB Chain',
  category: 'DeFi Infrastructure',
  age: '14 months',
  website: 'https://goldenlion.io',
  twitter: '@GoldenLionDEX',
  telegram: 't.me/goldenlion',
  discord: 'discord.gg/goldenlion',
  github: 'github.com/goldenlion-protocol',
  whitepaper: 'goldenlion.io/whitepaper.pdf',
  description:
    'Golden Lion is a community-governed DeFi protocol focused on transparent liquidity infrastructure and holder-aligned emissions on BNB Chain.',
  aiSummary:
    'Golden Lion presents as a mature BNB-native DeFi project with verified contract metadata, active social channels, and moderate on-chain liquidity. AI classification: infrastructure-ready with minor audit and lock gaps. Recommended path: Projects Profile → Radar Indexing → MARCO holder staking pool.',
  ownerDescription:
    'We built Golden Lion to reward long-term holders with transparent staking and community governance. Our focus is sustainable liquidity, not short-term hype.',
  fields: [
    { key: 'name', label: 'Name', value: 'Golden Lion', source: 'Contract' as ProvenanceSource },
    { key: 'ticker', label: 'Ticker', value: 'GLION', source: 'Explorer' as ProvenanceSource },
    { key: 'category', label: 'Category', value: 'DeFi Infrastructure', source: 'Internal AI' as ProvenanceSource },
    { key: 'website', label: 'Website', value: 'goldenlion.io', source: 'Website' as ProvenanceSource },
    { key: 'twitter', label: 'Twitter', value: '@GoldenLionDEX', source: 'Social' as ProvenanceSource },
    { key: 'holders', label: 'Holders', value: '4,218', source: 'On-chain' as ProvenanceSource },
    { key: 'liquidity', label: 'Liquidity', value: '$1.2M', source: 'DexScreener' as ProvenanceSource },
    { key: 'score', label: 'TokenSniffer', value: '82/100', source: 'TokenSniffer' as ProvenanceSource },
  ] satisfies ProvenanceField[],
}

export const READINESS_SCORE = 72

export const READINESS_LABEL = 'Infrastructure Ready'

export const READINESS_REASONS: ReadinessReason[] = [
  { label: 'Website missing', tone: 'red' },
  { label: 'Audit missing', tone: 'yellow' },
  { label: 'Liquidity not locked', tone: 'yellow' },
  { label: 'Social verified', tone: 'green' },
  { label: 'Community active', tone: 'green' },
  { label: 'Holder distribution healthy', tone: 'green' },
]

export const INFRASTRUCTURE_SUGGESTIONS: InfrastructureSuggestion[] = [
  {
    id: 'profile',
    title: 'Projects Profile',
    checked: true,
    estimatedImpact: 'High visibility',
    estimatedCompletion: '~20 min',
    d87Contribution: 'High',
  },
  {
    id: 'radar',
    title: 'Radar Indexing',
    checked: true,
    estimatedImpact: 'Operational discovery',
    estimatedCompletion: '~15 min',
    d87Contribution: 'Medium',
  },
  {
    id: 'trending',
    title: 'Trending Eligibility',
    checked: false,
    estimatedImpact: 'Discovery boost',
    estimatedCompletion: '~20 min',
    d87Contribution: 'Medium',
  },
  {
    id: 'pool',
    title: 'Create Staking Pool',
    checked: true,
    estimatedImpact: 'Holder incentives',
    estimatedCompletion: '~30 min',
    d87Contribution: 'High',
  },
  {
    id: 'farm',
    title: 'Create Farm',
    checked: false,
    estimatedImpact: 'LP emissions',
    estimatedCompletion: '~25 min',
    d87Contribution: 'High',
  },
  {
    id: 'marco',
    title: 'Reward MARCO Holders',
    checked: true,
    estimatedImpact: 'Ecosystem alignment',
    estimatedCompletion: '~35 min',
    d87Contribution: 'Very High',
  },
  {
    id: 'audit',
    title: 'Professional Audit',
    checked: false,
    estimatedImpact: 'Trust infrastructure',
    estimatedCompletion: '2–5 days',
    d87Contribution: 'Medium',
  },
  {
    id: 'smartdrop',
    title: 'SmartDrop Campaign',
    checked: false,
    estimatedImpact: 'Distribution infra',
    estimatedCompletion: '~45 min',
    d87Contribution: 'High',
  },
]

export const SERVICE_ACTIVATION: ServiceActivationItem[] = [
  {
    id: 'project-page',
    title: 'Project Page',
    category: 'infrastructure',
    checked: true,
    moduleHref: '/projects',
    description: 'Constitutional project directory profile',
  },
  {
    id: 'radar',
    title: 'Radar',
    category: 'infrastructure',
    checked: true,
    moduleHref: '/radar',
    description: 'Operational intelligence indexing',
  },
  {
    id: 'pools',
    title: 'Pools',
    category: 'infrastructure',
    checked: true,
    moduleHref: '/pools',
    description: 'Staking pool infrastructure',
  },
  {
    id: 'farms',
    title: 'Farms',
    category: 'infrastructure',
    checked: false,
    moduleHref: '/farms',
    description: 'Yield farm infrastructure',
  },
  {
    id: 'marco-rewards',
    title: 'MARCO Rewards',
    category: 'infrastructure',
    checked: true,
    moduleHref: '/build-studio',
    description: 'MARCO holder reward pool',
  },
  {
    id: 'space-audit',
    title: 'Space Audit',
    category: 'optional',
    checked: false,
    moduleHref: 'https://space.melega.io',
    description: 'Professional due diligence via Melega Space',
  },
  {
    id: 'labs-narrative',
    title: 'Labs Narrative',
    category: 'optional',
    checked: false,
    moduleHref: '/runtime/labs',
    description: 'Labs narrative activation — separate from DEX infra',
  },
  {
    id: 'smartdrop',
    title: 'SmartDrop',
    category: 'optional',
    checked: false,
    moduleHref: '/build-studio',
    description: 'Distribution infrastructure extension',
  },
  {
    id: 'verification',
    title: 'Projects Verification',
    category: 'optional',
    checked: true,
    moduleHref: '/projects',
    description: 'Constitutional infrastructure verification',
  },
  {
    id: 'trending-priority',
    title: 'Trending Priority',
    category: 'optional',
    checked: false,
    moduleHref: '/trending',
    description: 'Trending eligibility after validation',
  },
]

export const AI_MANIFEST_PREVIEW = {
  manifestVersion: '1.0.0',
  onboardingId: 'iet-onboard-glion-7f3a9c2e',
  project: { name: 'Golden Lion', ticker: 'GLION', chain: 'BNB', contract: DEMO_CONTRACT },
  capabilities: ['project.profile', 'radar.index', 'pool.stake', 'farm.yield'],
  readiness: { score: 72, label: 'Infrastructure Ready', dexDryRunOnly: true },
  sources: ['Contract', 'Explorer', 'DexScreener', 'TokenSniffer', 'Internal AI'],
  configuration: {
    stakeTemplate: 'marco-holders',
    executionReadiness: 'dry-run',
    fundraisingPermitted: false,
  },
  humanSummary: 'Golden Lion onboarding manifest — infrastructure proposal only.',
} as const

export const ADVISOR_DATA: AdvisorData = {
  projectHealth: 'Good — minor gaps',
  infrastructureScore: 72,
  nextAction: 'Activate Projects Profile + Radar Indexing',
  warnings: ['Audit not on record', 'LP lock below constitutional threshold'],
  confidence: 88,
  missingItems: ['Professional audit', 'LP lock extension', 'Trending eligibility'],
}

export const RECENT_IMPORTS: RecentImportEvent[] = [
  {
    id: '1',
    project: 'Golden Lion',
    time: '12 min ago',
    events: ['Imported', 'Infrastructure Built', 'Radar Indexed', 'AI Summary Generated'],
  },
  {
    id: '2',
    project: 'Neon City',
    time: '1h ago',
    events: ['Imported', 'Infrastructure Built', 'Pool Created', 'Project Verified'],
  },
  {
    id: '3',
    project: 'MARCO Utility',
    time: '3h ago',
    events: ['Imported', 'Farm Created', 'Radar Indexed', 'AI Summary Generated'],
  },
]
