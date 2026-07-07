import type { PoolAnalyzePreview, PoolPreviewCard } from '../poolsStudioData'

const FIXTURE_CONTRACTS = {
  marcoLocked: '0x71C7656EC7ab88b098defB751B7401B0fCCd3B6c',
  mxmx: '0x9Ac64Cc6e441514C455BD478E9bB5e4C0b1d4C2e',
  rfx: '0xB794F5eA0ba39494a0A8365EAB2451B0E0e3d0d6',
} as const

/** Enabled only when NEXT_PUBLIC_POOLS_UX_FIXTURE is exactly "1". */
export function isPoolsUxFixtureEnabled(): boolean {
  return process.env.NEXT_PUBLIC_POOLS_UX_FIXTURE === '1'
}

function shortContract(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function buildAnalyzePreview(contract: string, rewardToken: string): PoolAnalyzePreview {
  return {
    rewardBudget: '$125,000',
    remainingRewards: `84,200 ${rewardToken}`,
    dailyEmission: '1,240 / day',
    emissionEndEstimate: '180 days',
    aprHistory: 'Stable 30d',
    rewardSustainability: 'High',
    risk: 'Low',
    contractAddress: contract,
    contractExplorerUrl: `https://bscscan.com/address/${contract}`,
    sousChefAddress: contract,
    depositFee: '0%',
    withdrawFee: '0%',
    harvestInterval: '6h',
    autoCompound: 'Optional',
    poolVersion: 'v2',
    created: '2024-01-15',
    lastUpdated: '2026-06-01',
    rewardToken,
    emission: '1,240 / day',
    contract: shortContract(contract),
    rewardContract: shortContract(contract),
    stakeContract: shortContract(FIXTURE_CONTRACTS.marcoLocked),
    tokenExplorerUrl: `https://bscscan.com/token/${contract}`,
    estimatedRoi: '—',
    duration: '180 days',
    poolHistory: 'Fixture preview',
    transactions: 'Fixture preview',
  }
}

function buildFixtureCard(
  id: string,
  name: string,
  tokens: string[],
  rewardToken: string,
  apr: string,
  aprExact: number,
  contract: string,
  visualType: string,
  rewardBadge: 'Official' | 'Partner' | 'Community',
): PoolPreviewCard {
  return {
    id,
    name,
    tokens,
    stakeToken: tokens[0],
    apr,
    aprExact,
    rawApr: aprExact,
    sustainableAprDisplay: apr,
    aprDisplayReason: 'APR_WITHIN_RANGE',
    currentApr: apr,
    status: 'live',
    displayStatus: 'LIVE',
    visibilityStatus: 'VISIBLE',
    healthScore: 82,
    rewardBadge,
    visualType,
    tvl: '$42.5K',
    rewardToken,
    dailyRewards: '1,240 / day',
    estimatedDailyReward: '1,240 / day',
    remainingRewards: `84,200 ${rewardToken}`,
    remainingRewardsPct: 67,
    remainingRewardsTone: 'green',
    rewardBudgetUsd: '$125,000',
    estimatedDuration: '180 days',
    participants: '128',
    lockPeriod: visualType === '365 Days' ? '365 Days' : 'Flexible',
    cooldown: 'None',
    poolSafetyRisk: 'Low',
    rewardSustainability: 'High',
    sustainabilityScore: 82,
    weeklyRewards: '8,680 / week',
    monthlyRewards: '37,200 / month',
    contractAddress: contract,
    contractLabel: shortContract(contract),
    explorerUrl: `https://bscscan.com/address/${contract}`,
    cta: 'stake',
    analyzePreview: buildAnalyzePreview(contract, rewardToken),
    sousId: id === 'fixture-marco-locked' ? 0 : id === 'fixture-marco-mxmx' ? 101 : 102,
    poolTypeLabel: visualType,
  }
}

/** R713 screenshot fixture — exactly 3 live pools, dev/screenshot only. */
export function getPoolsUxFixtureCards(): PoolPreviewCard[] {
  return [
    buildFixtureCard(
      'fixture-marco-locked',
      'MARCO Locked',
      ['MARCO'],
      'MARCO',
      '10.00%',
      10,
      FIXTURE_CONTRACTS.marcoLocked,
      '365 Days',
      'Official',
    ),
    buildFixtureCard(
      'fixture-marco-mxmx',
      'MARCO → MXMX',
      ['MARCO', 'MXMX'],
      'MXMX',
      '28.45%',
      28.45,
      FIXTURE_CONTRACTS.mxmx,
      'Partner',
      'Partner',
    ),
    buildFixtureCard(
      'fixture-marco-rfx',
      'MARCO → RFX',
      ['MARCO', 'RFX'],
      'RFX',
      '38.00%',
      38,
      FIXTURE_CONTRACTS.rfx,
      '30 Days',
      'Partner',
    ),
  ]
}
