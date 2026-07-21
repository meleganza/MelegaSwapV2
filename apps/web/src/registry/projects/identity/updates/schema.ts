/**
 * PP008 — Project Activity & Verified Updates Hub schema.
 * Canonical operational timeline — not a social feed.
 */

export const PROJECT_UPDATES_SCHEMA_VERSION = 'melega.project-updates.v1' as const
export const UPDATES_RESOLVER_REVISION = 'PP008_UPDATES_V1' as const
export const PROJECT_PAGE_UPDATES_SUMMARY_EXTENSION = 'updatesSummary.v1' as const

export const UPDATE_CATEGORIES = [
  'PROJECT_NEWS',
  'PRODUCT_RELEASE',
  'PROTOCOL_UPGRADE',
  'DEPLOYMENT',
  'SMART_CONTRACT',
  'SECURITY_NOTICE',
  'DOCUMENTATION',
  'GOVERNANCE',
  'TOKENOMICS',
  'PARTNERSHIP',
  'INTEGRATION',
  'MARKET_AVAILABILITY',
  'LIQUIDITY',
  'FARM',
  'POOL',
  'LIQUIDITY_BUILDING',
  'AI',
  'INFRASTRUCTURE',
  'BUG_FIX',
  'MAINTENANCE',
  'ROADMAP',
  'COMMUNITY',
  'OTHER',
] as const
export type UpdateCategory = (typeof UPDATE_CATEGORIES)[number]

export const UPDATE_AUTHOR_TYPES = ['PROJECT', 'MELEGA', 'AUTOMATED_RUNTIME', 'UNKNOWN'] as const
export type UpdateAuthorType = (typeof UPDATE_AUTHOR_TYPES)[number]

export const UPDATE_STATUSES = ['ACTIVE', 'SUPERSEDED', 'RETRACTED', 'ARCHIVED'] as const
export type UpdateStatus = (typeof UPDATE_STATUSES)[number]

export const UPDATE_VISIBILITIES = ['PUBLIC'] as const
export type UpdateVisibility = (typeof UPDATE_VISIBILITIES)[number]

export const UPDATE_AVAILABILITIES = ['AVAILABLE', 'UNAVAILABLE', 'NOT_APPLICABLE'] as const
export type UpdateAvailability = (typeof UPDATE_AVAILABILITIES)[number]

export const UPDATE_VERIFICATION_STATES = [
  'NONE',
  'SOURCE_CONFIRMED',
  'CONTROL_CONFIRMED',
  'INDEPENDENTLY_VERIFIED',
  'MELEGA_VERIFIED',
  'UNVERIFIED',
] as const
export type UpdateVerificationState = (typeof UPDATE_VERIFICATION_STATES)[number]

export const UPDATE_REASON_CODES = [
  'NO_PUBLIC_UPDATES',
  'INVALID_CATEGORY_DROPPED',
  'INVALID_AUTHOR_DROPPED',
  'EVIDENCE_UNRESOLVED',
  'CONTENT_SANITIZED',
  'SUPERSESSION_CHAIN',
] as const
export type UpdateReasonCode = (typeof UPDATE_REASON_CODES)[number]

export const UPDATES_LIMITATIONS = [
  'Updates are official project events — not social posts, comments, or marketing blurbs.',
  'History is append-only: superseded, retracted, and archived entries remain in the timeline.',
  'Verification and evidence reuse PP002; this layer never invents verification.',
  'Publishing UI is deferred to PP012; PP008 exposes the canonical read model only.',
  'Full-text search indexing is prepared via machineTags but not implemented in PP008.',
] as const

export function isUpdateCategory(value: string): value is UpdateCategory {
  return (UPDATE_CATEGORIES as readonly string[]).includes(value)
}

export function isUpdateAuthorType(value: string): value is UpdateAuthorType {
  return (UPDATE_AUTHOR_TYPES as readonly string[]).includes(value)
}

export function isUpdateStatus(value: string): value is UpdateStatus {
  return (UPDATE_STATUSES as readonly string[]).includes(value)
}
