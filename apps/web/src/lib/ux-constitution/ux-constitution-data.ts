import {
  UX_CONSTITUTION_AUTHORITY,
  UX_CONSTITUTION_MANIFEST_URI,
  UX_CONSTITUTION_STATUS,
  UX_CONSTITUTION_VERSION,
  UxConstitutionSummary,
} from './ux-constitution-types'

export const UX_CONSTITUTION_BRAND = 'Melega DEX'
export const UX_CONSTITUTION_FORBIDDEN_PUBLIC_LABEL = 'MelegaSwap'
export const UX_CONSTITUTION_HUMAN_NAV = [
  'Home',
  'Swap',
  'Earn',
  'Launch',
  'Discover',
  'Workspace',
] as const

export const UX_CONSTITUTION_LISTING_CTA = 'List your project on Melega DEX'
export const UX_CONSTITUTION_HOMEPAGE_MODEL = 'live_dex'
export const UX_CONSTITUTION_RECOMMENDED_STAKING_TEMPLATE = 'Stake MARCO -> Earn your token'
export const UX_CONSTITUTION_EARN_TABS = ['Farms', 'Staking Pools'] as const

/** Read-only resolver — canonical UX authority summary for agents and tooling. */
export const resolveUxConstitutionSummary = (): UxConstitutionSummary => ({
  documentVersion: UX_CONSTITUTION_VERSION,
  status: UX_CONSTITUTION_STATUS,
  authority: UX_CONSTITUTION_AUTHORITY,
  brand: UX_CONSTITUTION_BRAND,
  forbiddenPublicLabel: UX_CONSTITUTION_FORBIDDEN_PUBLIC_LABEL,
  humanNav: UX_CONSTITUTION_HUMAN_NAV,
  aiModeSeparated: true,
  homepageModel: UX_CONSTITUTION_HOMEPAGE_MODEL,
  listingCta: UX_CONSTITUTION_LISTING_CTA,
  recommendedStakingTemplate: UX_CONSTITUTION_RECOMMENDED_STAKING_TEMPLATE,
  realDataOnly: true,
  noFakeMetrics: true,
  manifestUri: UX_CONSTITUTION_MANIFEST_URI,
})
