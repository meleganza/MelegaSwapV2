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

export const SUPPORTED_CHAINS = ['BNB', 'Ethereum', 'Base', 'Polygon', 'Solana'] as const

export const IMPORT_PIPELINE_STEPS = [
  'Paste Contract',
  'AI Recognition',
  'Infrastructure Analysis',
  'Project Detected',
  'Infrastructure Ready',
] as const

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

export const FLOW_STEPS = [
  'Idea', 'Token', 'Liquidity', 'Staking', 'Farm', 'Projects', 'Radar', 'Trending', 'DEX Ready',
] as const

export const TRUSTED_INFRASTRUCTURE_COPY = {
  title: 'Trusted Infrastructure',
  text: 'Melega DEX builds trusted economic infrastructure. Labs creates narratives. Every infrastructure component is AI-readable, operationally validated and machine interpretable before deployment.',
}
