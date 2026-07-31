/**
 * Human-facing Create Farm copy — no protocol terminology.
 * Protocol modules remain unchanged; this layer only shapes UX language.
 */

export const CREATE_FARM_UX = {
  title: 'Create Farm',
  subtitle: 'Choose a pair, make sure it has enough liquidity, then set your rewards.',
  step1: 'Select LP Pair',
  useExisting: 'Use existing LP Pair',
  createNew: 'Create a new LP Pair',
  searchPlaceholder: 'Search by name or token…',
  searchHint: 'Pick the pair you want to farm.',
  pairStatus: 'Pair Status',
  pairExists: 'Pair exists',
  pairIndexed: 'Indexed',
  tvl: 'TVL',
  minimumRequired: 'Minimum required',
  statusReady: 'Ready',
  statusNotReady: 'Not ready yet',
  youNeed: 'You need',
  moreLiquidity: 'more liquidity.',
  increaseLiquidity: 'Increase Liquidity',
  addLiquidityManually: 'Add Liquidity Manually',
  continue: 'Continue',
  createFarm: 'Create Farm',
  rewardToken: 'Reward Token',
  rewardBudget: 'Reward Budget',
  duration: 'Duration',
  emission: 'Emission',
  creationFee: 'Creation Fee',
  estimatedApr: 'Estimated APR',
  review: 'Review',
  advanced: 'Advanced',
  feeTreasuryNote: 'Paid to the Melega Treasury.',
  marcoRewardFriendly:
    'MARCO rewards are reserved for official Melega Farms.\n\nChoose another reward token.',
  createUnavailable:
    'Farm creation is temporarily unavailable. Your setup is saved — please try again shortly.',
  nextSelectPair: 'Select a pair to continue.',
  nextIncreaseLiquidity: 'Add a little more liquidity to continue.',
  nextConfigure: 'Fill in your reward details to continue.',
  nextCreate: 'Everything looks good — create your farm.',
} as const

/** Terms that must never appear in the public Create Farm UI surface. */
export const CREATE_FARM_FORBIDDEN_PUBLIC_TERMS = [
  'MasterBuilder',
  'Eligibility Engine',
  'permissionless',
  'Permissionless',
  'TVL verifier',
  'Attestation',
  'attestation',
  'Treasury Runtime',
  'Factory Deployment',
  'factory deployment',
  'protocol-only',
  'protocol admin',
  'eligibilitySigner',
  'Public Farm Factory',
  'B_FACTORY_DEPLOYMENT_REQUIRED',
  'C_ADMIN_ONLY_MASTERBUILDER',
] as const
