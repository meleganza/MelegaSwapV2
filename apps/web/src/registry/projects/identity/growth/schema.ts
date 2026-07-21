/**
 * PP013 — Project Growth Hub schema.
 * Orchestration / discovery only — not campaign execution, SmartDrop runtime, or referral settlement.
 */

export const PROJECT_GROWTH_SCHEMA_VERSION = 'melega.project-growth.v1' as const
export const GROWTH_RESOLVER_REVISION = 'PP013_GROWTH_V1' as const
export const PROJECT_PAGE_GROWTH_SUMMARY_EXTENSION = 'growthSummary.v1' as const

/** UX grouping hierarchy (ordered). */
export const GROWTH_GROUP_KEYS = [
  'CAMPAIGNS',
  'SMARTDROP',
  'REFERRAL',
  'ONBOARDING',
  'LIQUIDITY_INCENTIVES',
  'COMMUNITY',
  'RESOURCES',
] as const
export type GrowthGroupKey = (typeof GROWTH_GROUP_KEYS)[number]

export const GROWTH_PROGRAM_CATEGORIES = [
  'SMARTDROP',
  'CAMPAIGN',
  'REFERRAL',
  'AIRDROP',
  'MISSION',
  'ONBOARDING',
  'AMBASSADOR',
  'LIQUIDITY_INCENTIVE',
  'STAKING_INCENTIVE',
  'COMMUNITY',
  'MARKETING',
  'ECOSYSTEM',
  'LAUNCHPAD',
  'OTHER',
] as const
export type GrowthProgramCategory = (typeof GROWTH_PROGRAM_CATEGORIES)[number]

export const GROWTH_PROGRAM_TYPES = ['PROGRAM', 'CAMPAIGN', 'PORTAL', 'TOOLING', 'RESOURCE', 'DISCOVERY'] as const
export type GrowthProgramType = (typeof GROWTH_PROGRAM_TYPES)[number]

export const GROWTH_PROGRAM_STATUSES = ['ACTIVE', 'BETA', 'PREVIEW', 'PLANNED', 'ARCHIVED', 'UNAVAILABLE'] as const
export type GrowthProgramStatus = (typeof GROWTH_PROGRAM_STATUSES)[number]

export const GROWTH_AVAILABILITIES = ['AVAILABLE', 'UNAVAILABLE', 'NOT_APPLICABLE'] as const
export type GrowthAvailability = (typeof GROWTH_AVAILABILITIES)[number]

export const GROWTH_RELATION_TYPES = [
  'LINKS_SECTION',
  'LINKS_SERVICE',
  'LINKS_UPDATE',
  'LINKS_EVIDENCE',
  'LINKS_DEVELOPER',
  'USES',
  'COMPOSES',
] as const
export type GrowthRelationType = (typeof GROWTH_RELATION_TYPES)[number]

export const GROWTH_REASON_CODES = [
  'NO_PROGRAMS',
  'INVALID_CATEGORY_DROPPED',
  'INVALID_TYPE_DROPPED',
  'INVALID_STATUS_DROPPED',
  'UNSAFE_ROUTE_DROPPED',
  'UNSAFE_URL_DROPPED',
  'EVIDENCE_UNRESOLVED',
  'RELATION_TARGET_MISSING',
  'ACTIVE_WITHOUT_DESTINATION',
] as const
export type GrowthReasonCode = (typeof GROWTH_REASON_CODES)[number]

export const GROWTH_LIMITATIONS = [
  'The Growth Hub orchestrates discovery of growth mechanisms — it does not execute campaigns, SmartDrop, referrals, or reward claims.',
  'ACTIVE is assigned only when a certified live route or external URL exists; never invented from marketing copy.',
  'Campaign metrics, participation counts, and reward amounts are intentionally omitted.',
  'Participation, Liquidity Building, Updates, and Control Center are not duplicated; programs may link to those sections.',
  'Full-text growth search is prepared via machineTags but not implemented in PP013.',
] as const

/** Certified same-origin destinations for growth programs. */
export const CERTIFIED_GROWTH_ROUTES = [
  '/radar',
  '/build-studio',
  '/ilo',
  '/runtime/labs',
  '/trending',
  '/import-existing-token',
  '/farms',
  '/pools',
  '/liquidity-studio?view=building',
] as const

export const CATEGORY_TO_GROWTH_GROUP: Record<GrowthProgramCategory, GrowthGroupKey> = {
  CAMPAIGN: 'CAMPAIGNS',
  MARKETING: 'CAMPAIGNS',
  AIRDROP: 'CAMPAIGNS',
  MISSION: 'CAMPAIGNS',
  AMBASSADOR: 'CAMPAIGNS',
  SMARTDROP: 'SMARTDROP',
  REFERRAL: 'REFERRAL',
  ONBOARDING: 'ONBOARDING',
  LIQUIDITY_INCENTIVE: 'LIQUIDITY_INCENTIVES',
  STAKING_INCENTIVE: 'LIQUIDITY_INCENTIVES',
  LAUNCHPAD: 'LIQUIDITY_INCENTIVES',
  COMMUNITY: 'COMMUNITY',
  ECOSYSTEM: 'COMMUNITY',
  OTHER: 'RESOURCES',
}

export const GROWTH_GROUP_LABELS: Record<GrowthGroupKey, string> = {
  CAMPAIGNS: 'Campaigns',
  SMARTDROP: 'SmartDrop',
  REFERRAL: 'Referral',
  ONBOARDING: 'Onboarding',
  LIQUIDITY_INCENTIVES: 'Liquidity Incentives',
  COMMUNITY: 'Community',
  RESOURCES: 'Resources',
}

export function isGrowthProgramCategory(value: string): value is GrowthProgramCategory {
  return (GROWTH_PROGRAM_CATEGORIES as readonly string[]).includes(value)
}

export function isGrowthProgramType(value: string): value is GrowthProgramType {
  return (GROWTH_PROGRAM_TYPES as readonly string[]).includes(value)
}

export function isGrowthProgramStatus(value: string): value is GrowthProgramStatus {
  return (GROWTH_PROGRAM_STATUSES as readonly string[]).includes(value)
}

export function isGrowthRelationType(value: string): value is GrowthRelationType {
  return (GROWTH_RELATION_TYPES as readonly string[]).includes(value)
}

export function isCertifiedGrowthRoute(route: string): boolean {
  if ((CERTIFIED_GROWTH_ROUTES as readonly string[]).includes(route)) return true
  const pathOnly = route.split('?')[0]
  return (CERTIFIED_GROWTH_ROUTES as readonly string[]).some((allowed) => allowed.split('?')[0] === pathOnly)
}
