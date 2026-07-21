/**
 * PP010 — Developer & Documentation Hub schema.
 * Canonical integration surface — not a PDF browser or sitemap.
 */

export const PROJECT_DEVELOPER_SCHEMA_VERSION = 'melega.project-developer.v1' as const
export const DEVELOPER_RESOLVER_REVISION = 'PP010_DEVELOPER_V1' as const
export const PROJECT_PAGE_DEVELOPER_SUMMARY_EXTENSION = 'developerSummary.v1' as const

/** UX grouping hierarchy (ordered). */
export const DEVELOPER_GROUP_KEYS = [
  'DOCUMENTATION',
  'DEVELOPER_RESOURCES',
  'CONTRACTS',
  'DEPLOYMENTS',
  'APIS',
  'SDKS',
  'EXAMPLES',
  'AI_INTEGRATION',
] as const
export type DeveloperGroupKey = (typeof DEVELOPER_GROUP_KEYS)[number]

export const DEVELOPER_RESOURCE_CATEGORIES = [
  'DOCUMENTATION',
  'WHITEPAPER',
  'LITEPAPER',
  'API',
  'OPENAPI',
  'SDK',
  'GRAPHQL',
  'RPC',
  'WEBHOOK',
  'ABI',
  'CONTRACT',
  'DEPLOYMENT',
  'REFERENCE',
  'GUIDE',
  'TUTORIAL',
  'EXAMPLE',
  'FAQ',
  'BRAND',
  'MCP',
  'AI_MANIFEST',
  'SCHEMA',
  'OTHER',
] as const
export type DeveloperResourceCategory = (typeof DEVELOPER_RESOURCE_CATEGORIES)[number]

export const DEVELOPER_RESOURCE_TYPES = [
  'MARKDOWN',
  'HTML',
  'PDF',
  'JSON',
  'OPENAPI',
  'GRAPHQL',
  'YAML',
  'ABI',
  'ZIP',
  'REPOSITORY',
  'ENDPOINT',
] as const
export type DeveloperResourceType = (typeof DEVELOPER_RESOURCE_TYPES)[number]

export const DEVELOPER_RESOURCE_LIFECYCLES = [
  'ACTIVE',
  'BETA',
  'PREVIEW',
  'PLANNED',
  'ARCHIVED',
  'DEPRECATED',
  'UNAVAILABLE',
] as const
export type DeveloperResourceLifecycle = (typeof DEVELOPER_RESOURCE_LIFECYCLES)[number]

export const DEVELOPER_AVAILABILITIES = ['AVAILABLE', 'UNAVAILABLE', 'NOT_APPLICABLE'] as const
export type DeveloperAvailability = (typeof DEVELOPER_AVAILABILITIES)[number]

export const DEVELOPER_RELATION_TYPES = [
  'DOCUMENTS',
  'DESCRIBES',
  'IMPLEMENTS',
  'USES',
  'LINKS_SECTION',
  'LINKS_SERVICE',
  'LINKS_UPDATE',
  'LINKS_EVIDENCE',
] as const
export type DeveloperRelationType = (typeof DEVELOPER_RELATION_TYPES)[number]

export const DEVELOPER_REASON_CODES = [
  'NO_RESOURCES',
  'INVALID_CATEGORY_DROPPED',
  'INVALID_TYPE_DROPPED',
  'INVALID_LIFECYCLE_DROPPED',
  'UNSAFE_ROUTE_DROPPED',
  'UNSAFE_URL_DROPPED',
  'EVIDENCE_UNRESOLVED',
  'RELATION_TARGET_MISSING',
] as const
export type DeveloperReasonCode = (typeof DEVELOPER_REASON_CODES)[number]

export const DEVELOPER_LIMITATIONS = [
  'The Developer Hub is the canonical integration surface — not a document browser or marketing page.',
  'ACTIVE is assigned only when a live URL/route or certified public API exists in the repository.',
  'OpenAPI, MCP, webhooks, and published Melega SDKs are represented honestly as PLANNED or UNAVAILABLE when absent.',
  'Trust, Markets, Participation, Updates, and Ecosystem are not duplicated; resources may link to those sections.',
  'Full-text developer resource search is prepared via machineTags but not implemented in PP010.',
] as const

export const CERTIFIED_DEVELOPER_ROUTES = [
  '/api/public/projects/melega-dex/',
  '/api/public/projects/melega-dex/evidence/',
  '/api/public/projects/melega-dex/readiness/',
  '/api/public/projects/melega-dex/markets/',
  '/api/public/projects/melega-dex/participation/',
  '/api/public/projects/melega-dex/liquidity-building/',
  '/api/public/projects/melega-dex/updates/',
  '/api/public/projects/melega-dex/ecosystem/',
  '/registry/projects/melega-dex.json',
  '/registry/projects/index.json',
  '/registry/projects/discovery.json',
  '/.well-known/melega-dex-discovery.json',
  '/build-studio',
] as const

export const CATEGORY_TO_DEVELOPER_GROUP: Record<DeveloperResourceCategory, DeveloperGroupKey> = {
  DOCUMENTATION: 'DOCUMENTATION',
  WHITEPAPER: 'DOCUMENTATION',
  LITEPAPER: 'DOCUMENTATION',
  REFERENCE: 'DOCUMENTATION',
  FAQ: 'DOCUMENTATION',
  GUIDE: 'DOCUMENTATION',
  BRAND: 'DOCUMENTATION',
  ABI: 'CONTRACTS',
  CONTRACT: 'CONTRACTS',
  DEPLOYMENT: 'DEPLOYMENTS',
  API: 'APIS',
  OPENAPI: 'APIS',
  GRAPHQL: 'APIS',
  RPC: 'APIS',
  WEBHOOK: 'APIS',
  SCHEMA: 'APIS',
  SDK: 'SDKS',
  EXAMPLE: 'EXAMPLES',
  TUTORIAL: 'EXAMPLES',
  MCP: 'AI_INTEGRATION',
  AI_MANIFEST: 'AI_INTEGRATION',
  OTHER: 'DEVELOPER_RESOURCES',
}

export const DEVELOPER_GROUP_LABELS: Record<DeveloperGroupKey, string> = {
  DOCUMENTATION: 'Documentation',
  DEVELOPER_RESOURCES: 'Developer Resources',
  CONTRACTS: 'Contracts',
  DEPLOYMENTS: 'Deployments',
  APIS: 'APIs',
  SDKS: 'SDKs',
  EXAMPLES: 'Examples',
  AI_INTEGRATION: 'AI Integration',
}

export function isDeveloperResourceCategory(value: string): value is DeveloperResourceCategory {
  return (DEVELOPER_RESOURCE_CATEGORIES as readonly string[]).includes(value)
}

export function isDeveloperResourceType(value: string): value is DeveloperResourceType {
  return (DEVELOPER_RESOURCE_TYPES as readonly string[]).includes(value)
}

export function isDeveloperResourceLifecycle(value: string): value is DeveloperResourceLifecycle {
  return (DEVELOPER_RESOURCE_LIFECYCLES as readonly string[]).includes(value)
}

export function isDeveloperRelationType(value: string): value is DeveloperRelationType {
  return (DEVELOPER_RELATION_TYPES as readonly string[]).includes(value)
}

export function isCertifiedDeveloperRoute(route: string): boolean {
  if ((CERTIFIED_DEVELOPER_ROUTES as readonly string[]).includes(route)) return true
  // Allow slug aliases of public project APIs: /api/public/projects/{slug}/...
  if (/^\/api\/public\/projects\/[a-z0-9-]+(\/[a-z0-9-]+)?\/?$/.test(route)) return true
  if (/^\/registry\/projects\/[a-z0-9.-]+\.json$/.test(route)) return true
  return false
}
