/**
 * PP014 — AI Agent Interface & Machine Actions schema.
 * Discovery / navigation descriptors only — no execution, signing, quotes, or calldata.
 */

export const PROJECT_MACHINE_SCHEMA_VERSION = 'melega.project-machine.v1' as const
export const MACHINE_RESOLVER_REVISION = 'PP014_MACHINE_V1' as const
export const PROJECT_PAGE_MACHINE_SUMMARY_EXTENSION = 'machineSummary.v1' as const
export const MACHINE_INTERFACE_VERSION = '1.0.0' as const

export const MACHINE_CAPABILITIES = [
  'VIEW_PROJECT',
  'VIEW_EVIDENCE',
  'VIEW_READINESS',
  'VIEW_TRUST',
  'VIEW_WALLET_RELATIONSHIP',
  'VIEW_MARKETS',
  'SWAP',
  'VIEW_PARTICIPATION',
  'ADD_LIQUIDITY',
  'OPEN_FARM',
  'OPEN_POOL',
  'OPEN_LIQUIDITY_BUILDING',
  'VIEW_UPDATES',
  'VIEW_ECOSYSTEM',
  'VIEW_DEVELOPER',
  'VIEW_GOVERNANCE',
  'VIEW_GROWTH',
  'VIEW_CONTROL_CENTER',
  'VIEW_MACHINE',
] as const
export type MachineCapability = (typeof MACHINE_CAPABILITIES)[number]

export const MACHINE_ACTION_KINDS = ['NAVIGATE', 'FETCH', 'DISCOVER'] as const
export type MachineActionKind = (typeof MACHINE_ACTION_KINDS)[number]

export const MACHINE_AVAILABILITIES = ['AVAILABLE', 'UNAVAILABLE', 'NOT_APPLICABLE'] as const
export type MachineAvailability = (typeof MACHINE_AVAILABILITIES)[number]

export const MACHINE_ACTION_STATUSES = ['ACTIVE', 'PREVIEW', 'PLANNED', 'UNAVAILABLE'] as const
export type MachineActionStatus = (typeof MACHINE_ACTION_STATUSES)[number]

export const MACHINE_RESOURCE_KINDS = [
  'ENDPOINT',
  'SCHEMA',
  'WELL_KNOWN',
  'MANIFEST',
  'SECTION',
  'DOCUMENTATION',
] as const
export type MachineResourceKind = (typeof MACHINE_RESOURCE_KINDS)[number]

export const MACHINE_RELATION_TYPES = [
  'EXPOSES',
  'IMPLEMENTS',
  'LINKS_SECTION',
  'LINKS_ENDPOINT',
  'LINKS_SCHEMA',
  'USES_CAPABILITY',
] as const
export type MachineRelationType = (typeof MACHINE_RELATION_TYPES)[number]

export const MACHINE_REASON_CODES = [
  'NO_CAPABILITIES',
  'INVALID_CAPABILITY_DROPPED',
  'INVALID_ACTION_DROPPED',
  'UNSAFE_ROUTE_DROPPED',
  'UNSAFE_URL_DROPPED',
  'RELATION_TARGET_MISSING',
] as const
export type MachineReasonCode = (typeof MACHINE_REASON_CODES)[number]

export const MACHINE_LIMITATIONS = [
  'The Machine Interface exposes discovery, capabilities, and navigation action descriptors only.',
  'No autonomous transactions, quotes, calldata, signatures, or runtime authority are provided.',
  'Execution always remains in Swap, Liquidity Studio, Farms, Pools, Liquidity Building, Control Center, and other human product surfaces.',
  'Private Control Center mutation APIs are not exposed to AI agents.',
  'OpenAPI and MCP are honestly UNAVAILABLE until published in the repository.',
  'Developer, Trust, Markets, Participation, Updates, Growth, and Governance hubs are linked — not duplicated.',
] as const

/** Certified same-origin routes / API paths for machine actions. */
export const CERTIFIED_MACHINE_ROUTES = [
  '/project-hq/melega-dex',
  '/trade',
  '/swap',
  '/liquidity-studio',
  '/liquidity-studio?view=building',
  '/farms',
  '/pools',
  '/api/public/projects/melega-dex/',
  '/api/public/projects/melega-dex/evidence/',
  '/api/public/projects/melega-dex/readiness/',
  '/api/public/projects/melega-dex/markets/',
  '/api/public/projects/melega-dex/participation/',
  '/api/public/projects/melega-dex/liquidity-building/',
  '/api/public/projects/melega-dex/updates/',
  '/api/public/projects/melega-dex/ecosystem/',
  '/api/public/projects/melega-dex/developer/',
  '/api/public/projects/melega-dex/governance/',
  '/api/public/projects/melega-dex/control-center/',
  '/api/public/projects/melega-dex/growth/',
  '/api/public/projects/melega-dex/machine/',
  '/.well-known/melega-dex-discovery.json',
  '/.well-known/melega-dex-machine.json',
  '/registry/projects/melega-dex.json',
  '/registry/projects/discovery.json',
  '/registry/projects/index.json',
] as const

export function isMachineCapability(value: string): value is MachineCapability {
  return (MACHINE_CAPABILITIES as readonly string[]).includes(value)
}

export function isMachineActionKind(value: string): value is MachineActionKind {
  return (MACHINE_ACTION_KINDS as readonly string[]).includes(value)
}

export function isMachineAvailability(value: string): value is MachineAvailability {
  return (MACHINE_AVAILABILITIES as readonly string[]).includes(value)
}

export function isMachineActionStatus(value: string): value is MachineActionStatus {
  return (MACHINE_ACTION_STATUSES as readonly string[]).includes(value)
}

export function isMachineResourceKind(value: string): value is MachineResourceKind {
  return (MACHINE_RESOURCE_KINDS as readonly string[]).includes(value)
}

export function isMachineRelationType(value: string): value is MachineRelationType {
  return (MACHINE_RELATION_TYPES as readonly string[]).includes(value)
}

export function isCertifiedMachineRoute(route: string): boolean {
  if ((CERTIFIED_MACHINE_ROUTES as readonly string[]).includes(route)) return true
  // Allow slug aliases of public project APIs.
  if (/^\/api\/public\/projects\/[a-z0-9-]+(\/[a-z0-9-]+)?\/?$/.test(route)) return true
  if (/^\/project-hq\/[a-z0-9-]+\/?$/.test(route)) return true
  if (/^\/\.well-known\/melega-dex-[a-z0-9-]+\.json$/.test(route)) return true
  if (/^\/registry\/projects\/[a-z0-9.-]+\.json$/.test(route)) return true
  const pathOnly = route.split('?')[0]
  return (CERTIFIED_MACHINE_ROUTES as readonly string[]).some((allowed) => allowed.split('?')[0] === pathOnly)
}
