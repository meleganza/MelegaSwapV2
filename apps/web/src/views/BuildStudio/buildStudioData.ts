export interface BuildKpiItem {
  id: string
  label: string
  value: string
  delta: string
  deltaPositive: boolean
  sparkline: number[]
}

export interface ValidationCheck {
  id: string
  label: string
  status: 'green' | 'yellow' | 'red'
}

export type ExecutionStatusTone = 'green' | 'yellow' | 'gray'

export interface RecentBuildRow {
  id: string
  time: string
  action: string
  project: string
  builder: string
  status: 'Ready' | 'In Progress' | 'Validated'
  infrastructure: string
  executionStatus: string
  executionStatusTone: ExecutionStatusTone
  aiVerified: boolean
}

export interface OptionalService {
  id: string
  title: string
  purpose: string
  activationTime: string
}

export interface BuilderTemplate {
  id: string
  title: string
  description: string
}

export interface StakingTemplate {
  id: string
  title: string
  description: string
  featured?: boolean
  stakeToken: string
  lockStakeToken?: boolean
}

export interface FarmSimulation {
  estimatedApr: string
  estimatedTvl: string
  estimatedEmissions: string
  rewardDuration: string
  treasuryImpact: string
}

export const BUILD_KPIS: BuildKpiItem[] = [
  { id: 'projects', label: 'Projects Onboarded', value: '128', delta: '+12 this week', deltaPositive: true, sparkline: [4, 5, 6, 8, 9, 10, 12] },
  { id: 'tokens', label: 'Tokens Created', value: '243', delta: '+18 this week', deltaPositive: true, sparkline: [6, 7, 8, 9, 11, 14, 18] },
  { id: 'pools', label: 'Active Staking Pools', value: '87', delta: '+7 this week', deltaPositive: true, sparkline: [3, 4, 5, 5, 6, 7, 7] },
  { id: 'farms', label: 'Active Farms', value: '56', delta: '+4 this week', deltaPositive: true, sparkline: [2, 3, 3, 4, 4, 4, 4] },
  { id: 'manifests', label: 'AI Ready Manifests', value: '92', delta: 'Excellent', deltaPositive: true, sparkline: [80, 82, 85, 87, 89, 91, 92] },
]

export const SUPPORTED_CHAINS = ['BNB', 'Ethereum', 'Base', 'Polygon', 'Solana'] as const

export const IMPORT_PIPELINE_STEPS = [
  'Paste Contract',
  'AI Recognition',
  'Infrastructure Analysis',
  'Project Detected',
  'Infrastructure Ready',
] as const

export const IMPORT_DETECTIONS = [
  'Logo', 'Name', 'Ticker', 'Category', 'Website', 'Socials',
  'Liquidity', 'Market Cap', 'Holders', 'DEX presence',
  'CoinMarketCap', 'CoinGecko', 'DexTools', 'DexScreener', 'TokenSniffer',
  'Audit sources', 'Ownership', 'Taxes', 'Blacklist', 'Proxy', 'LP Lock',
  'Whales', 'Developer wallet', 'Age', 'Verified contracts',
  'Open-source repositories', 'Social activity', 'Community quality',
  'AI Classification', 'Machine-readable summary',
] as const

export const GENERATED_INFRASTRUCTURE = [
  'Create Project Profile',
  'Create Staking Pool',
  'Create Farm',
  'Radar Index',
  'Trending eligibility',
] as const

export const ADVISOR_WORKFLOW = [
  'Import Existing Token',
  'Create Staking Pool',
  'Radar Indexing',
  'Projects Verification',
  'Trending Eligibility',
  'SmartDrop Campaign',
  'Professional Audit',
] as const

export const ADVISOR_DATA = {
  confidence: 95,
  reasoning: [
    'Existing tokens should enter through import-first infrastructure validation.',
    'Staking and radar indexing follow once machine-readable manifest is generated.',
    'Extensions activate only after core infrastructure passes operational checks.',
  ],
  infrastructureReady: 95,
}

export const STAKING_TEMPLATES: StakingTemplate[] = [
  {
    id: 'marco-holders',
    title: 'Reward MARCO Holders',
    description: 'Stake MARCO, configure reward token only — holder incentive pool.',
    featured: true,
    stakeToken: 'MARCO',
    lockStakeToken: true,
  },
  {
    id: 'flexible',
    title: 'Flexible Pool',
    description: 'Unlocked staking with configurable reward emissions.',
    stakeToken: 'TOKEN',
  },
  {
    id: 'locked',
    title: 'Locked Pool',
    description: 'Time-locked stake with boosted reward weight.',
    stakeToken: 'TOKEN',
  },
  {
    id: 'community',
    title: 'Community Pool',
    description: 'Community-governed staking with transparent parameters.',
    stakeToken: 'TOKEN',
  },
  {
    id: 'institutional',
    title: 'Institutional Pool',
    description: 'Institutional-grade staking with compliance metadata.',
    stakeToken: 'TOKEN',
  },
  {
    id: 'private',
    title: 'Private Pool',
    description: 'Restricted access pool for approved participants.',
    stakeToken: 'TOKEN',
  },
]

export const FARM_SIMULATION: FarmSimulation = {
  estimatedApr: '24.5%',
  estimatedTvl: '$840K',
  estimatedEmissions: '50K MARCO',
  rewardDuration: '90 days',
  treasuryImpact: 'Low — within budget',
}

export const BUILDER_TEMPLATES: BuilderTemplate[] = [
  { id: 'official', title: 'Official Token', description: 'Canonical project token with governance hooks.' },
  { id: 'governance', title: 'Governance Token', description: 'Voting-weight infrastructure for DAO operations.' },
  { id: 'reward', title: 'Reward Token', description: 'Emission token for staking and farm rewards.' },
  { id: 'community', title: 'Community Token', description: 'Community-governed utility with transparent supply.' },
  { id: 'enterprise', title: 'Enterprise Token', description: 'Institutional-grade token with compliance metadata.' },
  { id: 'ai', title: 'AI Token', description: 'Machine-readable token with AI manifest compatibility.' },
]

export const VALIDATION_CHECKS: ValidationCheck[] = [
  { id: 'ticker', label: 'Ticker conflict', status: 'green' },
  { id: 'dup', label: 'Token duplication', status: 'green' },
  { id: 'contract', label: 'Contract compatibility', status: 'green' },
  { id: 'liq', label: 'Liquidity recommendations', status: 'yellow' },
  { id: 'owner', label: 'Ownership', status: 'green' },
  { id: 'taxes', label: 'Taxes', status: 'green' },
  { id: 'machine', label: 'Machine readability', status: 'green' },
  { id: 'score', label: 'Infrastructure score', status: 'green' },
]

export const FLOW_STEPS = [
  'Idea', 'Token', 'Liquidity', 'Staking', 'Farm', 'Projects', 'Radar', 'Trending', 'DEX Ready',
] as const

export const OPTIONAL_SERVICES: OptionalService[] = [
  {
    id: 'radar',
    title: 'Radar Visibility',
    purpose: 'Index project infrastructure in ecosystem radar for operational discovery.',
    activationTime: '~15 min',
  },
  {
    id: 'projects',
    title: 'Projects Verification',
    purpose: 'Verify project profile against constitutional infrastructure standards.',
    activationTime: '~30 min',
  },
  {
    id: 'trending',
    title: 'Trending Boost',
    purpose: 'Enable trending eligibility after infrastructure validation completes.',
    activationTime: '~20 min',
  },
  {
    id: 'audit',
    title: 'Professional Audit (Melega Space)',
    purpose: 'Optional security infrastructure extension via Melega Space.',
    activationTime: '2–5 days',
  },
  {
    id: 'smartdrop',
    title: 'SmartDrop Campaign',
    purpose: 'Distribution infrastructure extension — not fundraising.',
    activationTime: '~45 min',
  },
  {
    id: 'narrative',
    title: 'Labs Narrative Activation',
    purpose: 'Labs narrative extension — separate from DEX infrastructure.',
    activationTime: '1–3 days',
  },
]

export const RECENT_BUILDS: RecentBuildRow[] = [
  {
    id: '1',
    time: '2 min ago',
    action: 'Create Token',
    project: 'MARCO Utility',
    builder: '0x4a…9f2',
    status: 'Validated',
    infrastructure: 'Token + Manifest',
    executionStatus: 'Suppressed',
    executionStatusTone: 'gray',
    aiVerified: true,
  },
  {
    id: '2',
    time: '18 min ago',
    action: 'Import Token',
    project: 'Golden Lion',
    builder: '0x8c…1a4',
    status: 'Ready',
    infrastructure: 'Profile + Radar',
    executionStatus: 'Dry Run',
    executionStatusTone: 'green',
    aiVerified: true,
  },
  {
    id: '3',
    time: '42 min ago',
    action: 'Create Staking Pool',
    project: 'MARCO Holders',
    builder: '0x2e…7b8',
    status: 'Ready',
    infrastructure: 'Pool + Farm',
    executionStatus: 'Dry Run',
    executionStatusTone: 'green',
    aiVerified: true,
  },
  {
    id: '4',
    time: '1h ago',
    action: 'Create Farm',
    project: 'MARCO-BNB LP',
    builder: '0x9d…3c1',
    status: 'In Progress',
    infrastructure: 'Farm + DEX',
    executionStatus: 'Pending',
    executionStatusTone: 'yellow',
    aiVerified: false,
  },
  {
    id: '5',
    time: '2h ago',
    action: 'Builder Template',
    project: 'Governance Token',
    builder: '0x1f…6e0',
    status: 'Validated',
    infrastructure: 'Token + Governance',
    executionStatus: 'Suppressed',
    executionStatusTone: 'gray',
    aiVerified: true,
  },
  {
    id: '6',
    time: '3h ago',
    action: 'Import Token',
    project: 'Neon City',
    builder: '0x7a…4d2',
    status: 'Ready',
    infrastructure: 'Profile + Trending',
    executionStatus: 'Dry Run',
    executionStatusTone: 'green',
    aiVerified: true,
  },
]

export const AI_MANIFEST_PREVIEW = {
  manifestVersion: '1.0.0',
  infrastructureId: 'bs-inf-7f3a9c2e',
  capabilities: ['token.create', 'pool.stake', 'farm.yield', 'radar.index'],
  permissions: ['builder.write', 'manifest.read', 'dex.execute.preview'],
  configuration: {
    stakeToken: 'MARCO',
    rewardToken: 'REWARD',
    chain: 'BNB',
    executionReadiness: 'dry-run',
  },
  riskSummary: { level: 'low', flags: [] },
  humanSummary: 'Infrastructure manifest generated for MARCO holder staking pool.',
} as const

export const TRUSTED_INFRASTRUCTURE_COPY = {
  title: 'Trusted Infrastructure',
  text: 'Melega DEX builds trusted economic infrastructure. Labs creates narratives. Every infrastructure component is AI-readable, operationally validated and machine interpretable before deployment.',
}
