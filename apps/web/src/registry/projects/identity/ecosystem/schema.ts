/**
 * PP009 — Project Ecosystem & Utilities Graph schema.
 * Canonical operational service graph — not a sitemap or nav menu.
 */

export const PROJECT_ECOSYSTEM_SCHEMA_VERSION = 'melega.project-ecosystem.v1' as const
export const ECOSYSTEM_RESOLVER_REVISION = 'PP009_ECOSYSTEM_V1' as const
export const PROJECT_PAGE_ECOSYSTEM_SUMMARY_EXTENSION = 'ecosystemSummary.v1' as const

/** UX + machine grouping hierarchy (ordered). */
export const ECOSYSTEM_GROUP_KEYS = [
  'PRODUCTS',
  'INFRASTRUCTURE',
  'DEVELOPER',
  'ECONOMY',
  'AI',
  'GOVERNANCE',
  'RESOURCES',
] as const
export type EcosystemGroupKey = (typeof ECOSYSTEM_GROUP_KEYS)[number]

export const SERVICE_CATEGORIES = [
  'DEX',
  'WALLET',
  'MARKETPLACE',
  'BRIDGE',
  'AI',
  'API',
  'SDK',
  'DOCUMENTATION',
  'TREASURY',
  'GOVERNANCE',
  'EXPLORER',
  'INFRASTRUCTURE',
  'ANALYTICS',
  'LAUNCHPAD',
  'NFT',
  'IDENTITY',
  'AUTOMATION',
  'STAKING',
  'DEVELOPER',
  'COMMUNITY',
  'MEDIA',
  'LIQUIDITY',
  'OTHER',
] as const
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export const SERVICE_TYPES = [
  'WEB_APP',
  'API',
  'RUNTIME',
  'SERVICE',
  'MODULE',
  'MICROSERVICE',
  'LIBRARY',
  'MOBILE_APP',
  'EXTENSION',
  'SMART_CONTRACT',
  'PORTAL',
] as const
export type ServiceType = (typeof SERVICE_TYPES)[number]

export const SERVICE_LIFECYCLES = [
  'ACTIVE',
  'BETA',
  'PREVIEW',
  'PLANNED',
  'DEPRECATED',
  'ARCHIVED',
  'UNAVAILABLE',
] as const
export type ServiceLifecycle = (typeof SERVICE_LIFECYCLES)[number]

export const SERVICE_AVAILABILITIES = ['AVAILABLE', 'UNAVAILABLE', 'NOT_APPLICABLE'] as const
export type ServiceAvailability = (typeof SERVICE_AVAILABILITIES)[number]

export const SERVICE_RELATION_TYPES = ['PROVIDES', 'USES', 'COMPOSES', 'LINKS_SECTION', 'DOCUMENTS', 'SECURES'] as const
export type ServiceRelationType = (typeof SERVICE_RELATION_TYPES)[number]

export const ECOSYSTEM_REASON_CODES = [
  'NO_SERVICES',
  'INVALID_CATEGORY_DROPPED',
  'INVALID_TYPE_DROPPED',
  'INVALID_LIFECYCLE_DROPPED',
  'UNSAFE_ROUTE_DROPPED',
  'UNSAFE_URL_DROPPED',
  'EVIDENCE_UNRESOLVED',
  'RELATION_TARGET_MISSING',
] as const
export type EcosystemReasonCode = (typeof ECOSYSTEM_REASON_CODES)[number]

export const ECOSYSTEM_LIMITATIONS = [
  'The ecosystem graph describes operational services of the project — not a sitemap or marketing directory.',
  'ACTIVE is assigned only from certified capability/orchestration or registry-backed live surfaces.',
  'Markets, Participation, Trust, and Updates are not recreated here; services may link to those sections.',
  'Full-text service search indexing is prepared via machineTags but not implemented in PP009.',
] as const

/** Certified same-origin product routes only — never invent destinations. */
export const CERTIFIED_INTERNAL_ROUTES = [
  '/trade',
  '/swap',
  '/liquidity',
  '/liquidity-studio',
  '/liquidity-studio?view=building',
  '/farms',
  '/pools',
  '/command-center',
  '/radar',
  '/build-studio',
  '/ilo',
  '/runtime/labs',
  '/status',
  '/identity',
  '/collectibles',
  '/projects',
  '/registry/projects/melega-dex.json',
] as const

export const CATEGORY_TO_GROUP: Record<ServiceCategory, EcosystemGroupKey> = {
  DEX: 'PRODUCTS',
  LIQUIDITY: 'PRODUCTS',
  STAKING: 'PRODUCTS',
  LAUNCHPAD: 'PRODUCTS',
  NFT: 'PRODUCTS',
  MARKETPLACE: 'PRODUCTS',
  WALLET: 'PRODUCTS',
  BRIDGE: 'PRODUCTS',
  ANALYTICS: 'PRODUCTS',
  IDENTITY: 'PRODUCTS',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  AUTOMATION: 'INFRASTRUCTURE',
  EXPLORER: 'INFRASTRUCTURE',
  API: 'DEVELOPER',
  SDK: 'DEVELOPER',
  DEVELOPER: 'DEVELOPER',
  TREASURY: 'ECONOMY',
  AI: 'AI',
  GOVERNANCE: 'GOVERNANCE',
  DOCUMENTATION: 'RESOURCES',
  COMMUNITY: 'RESOURCES',
  MEDIA: 'RESOURCES',
  OTHER: 'RESOURCES',
}

export const GROUP_LABELS: Record<EcosystemGroupKey, string> = {
  PRODUCTS: 'Products',
  INFRASTRUCTURE: 'Infrastructure',
  DEVELOPER: 'Developer Resources',
  ECONOMY: 'Economy',
  AI: 'AI',
  GOVERNANCE: 'Governance',
  RESOURCES: 'Resources',
}

export function isServiceCategory(value: string): value is ServiceCategory {
  return (SERVICE_CATEGORIES as readonly string[]).includes(value)
}

export function isServiceType(value: string): value is ServiceType {
  return (SERVICE_TYPES as readonly string[]).includes(value)
}

export function isServiceLifecycle(value: string): value is ServiceLifecycle {
  return (SERVICE_LIFECYCLES as readonly string[]).includes(value)
}

export function isServiceRelationType(value: string): value is ServiceRelationType {
  return (SERVICE_RELATION_TYPES as readonly string[]).includes(value)
}

export function isCertifiedInternalRoute(route: string): boolean {
  if ((CERTIFIED_INTERNAL_ROUTES as readonly string[]).includes(route)) return true
  // Allow certified path prefixes with safe query strings already listed, or bare path match.
  const pathOnly = route.split('?')[0]
  return (CERTIFIED_INTERNAL_ROUTES as readonly string[]).some((allowed) => allowed.split('?')[0] === pathOnly)
}
