/**
 * PP011 — Governance & Treasury Transparency schema.
 * Disclosure layer only — not DAO execution, voting, or treasury analytics.
 */

export const PROJECT_GOVERNANCE_SCHEMA_VERSION = 'melega.project-governance.v1' as const
export const GOVERNANCE_RESOLVER_REVISION = 'PP011_GOVERNANCE_V1' as const
export const PROJECT_PAGE_GOVERNANCE_SUMMARY_EXTENSION = 'governanceSummary.v1' as const

/** Declared governance model vocabulary (repository-controlled). */
export const GOVERNANCE_MODELS = ['DAO', 'MULTISIG', 'FOUNDATION', 'OWNER', 'TIMELOCK', 'HYBRID', 'UNKNOWN'] as const
export type GovernanceModel = (typeof GOVERNANCE_MODELS)[number]

export const GOVERNANCE_LIFECYCLES = ['ACTIVE', 'DECLARED', 'PLANNED', 'ARCHIVED', 'UNAVAILABLE', 'UNKNOWN'] as const
export type GovernanceLifecycle = (typeof GOVERNANCE_LIFECYCLES)[number]

export const GOVERNANCE_AVAILABILITIES = ['AVAILABLE', 'UNAVAILABLE', 'NOT_APPLICABLE'] as const
export type GovernanceAvailability = (typeof GOVERNANCE_AVAILABILITIES)[number]

export const TREASURY_TYPES = [
  'COMMUNITY_TREASURY',
  'PROTOCOL_TREASURY',
  'MULTISIG',
  'FOUNDATION',
  'REVENUE',
  'GRANTS',
  'OTHER',
] as const
export type TreasuryType = (typeof TREASURY_TYPES)[number]

export const TREASURY_LIFECYCLES = ['ACTIVE', 'DECLARED', 'PLANNED', 'ARCHIVED', 'UNAVAILABLE', 'UNKNOWN'] as const
export type TreasuryLifecycle = (typeof TREASURY_LIFECYCLES)[number]

export const DISCLOSURE_LEVELS = ['PUBLIC_VERIFIED', 'PUBLIC_DECLARED', 'PARTIAL', 'UNAVAILABLE', 'UNKNOWN'] as const
export type DisclosureLevel = (typeof DISCLOSURE_LEVELS)[number]

export const UPGRADEABILITY_MODELS = ['IMMUTABLE', 'PROXY', 'UNKNOWN', 'UNAVAILABLE'] as const
export type UpgradeabilityModel = (typeof UPGRADEABILITY_MODELS)[number]

export const OWNER_MODELS = ['OWNABLE', 'MULTISIG', 'DAO', 'FOUNDATION', 'UNKNOWN', 'UNAVAILABLE'] as const
export type OwnerModel = (typeof OWNER_MODELS)[number]

export const PROXY_MODELS = ['NONE', 'TRANSPARENT', 'UUPS', 'BEACON', 'CLONE', 'UNKNOWN', 'UNAVAILABLE'] as const
export type ProxyModel = (typeof PROXY_MODELS)[number]

export const TIMELOCK_MODELS = ['NONE', 'TIMELOCK', 'UNKNOWN', 'UNAVAILABLE'] as const
export type TimelockModel = (typeof TIMELOCK_MODELS)[number]

export const GOVERNANCE_RESOURCE_KINDS = [
  'DOCUMENTATION',
  'PORTAL',
  'SNAPSHOT',
  'FORUM',
  'SAFE',
  'CONTRACT',
  'REGISTRY',
  'OTHER',
] as const
export type GovernanceResourceKind = (typeof GOVERNANCE_RESOURCE_KINDS)[number]

export const GOVERNANCE_CAPABILITIES = [
  'VOTING',
  'PROPOSALS',
  'MULTISIG_SIGNING',
  'TIMELOCK_EXECUTION',
  'TREASURY_DISCLOSURE',
  'OWNER_ADMIN',
  'UPGRADE_CONTROL',
] as const
export type GovernanceCapabilityKey = (typeof GOVERNANCE_CAPABILITIES)[number]

export const GOVERNANCE_RELATION_TYPES = [
  'DOCUMENTS',
  'DISCLOSES',
  'LINKS_SECTION',
  'LINKS_SERVICE',
  'LINKS_UPDATE',
  'LINKS_EVIDENCE',
  'LINKS_DEVELOPER',
  'REFERENCES_CONTRACT',
] as const
export type GovernanceRelationType = (typeof GOVERNANCE_RELATION_TYPES)[number]

export const GOVERNANCE_REASON_CODES = [
  'NO_GOVERNANCE_DECLARED',
  'INVALID_MODEL_DROPPED',
  'INVALID_TREASURY_TYPE_DROPPED',
  'INVALID_DISCLOSURE_DROPPED',
  'INVALID_LIFECYCLE_DROPPED',
  'UNSAFE_URL_DROPPED',
  'INVALID_WALLET_DROPPED',
  'EVIDENCE_UNRESOLVED',
  'RELATION_TARGET_MISSING',
  'PUBLIC_VERIFIED_FORBIDDEN_WITHOUT_EVIDENCE',
] as const
export type GovernanceReasonCode = (typeof GOVERNANCE_REASON_CODES)[number]

export const GOVERNANCE_LIMITATIONS = [
  'Governance transparency describes declared and registered disclosures — it does not execute governance or voting.',
  'Treasury transparency discloses registered wallet references only — no balances, USD values, charts, or portfolio analytics.',
  'PUBLIC_VERIFIED is never invented; it requires independent evidence resolution.',
  'Governance model is never inferred from token ownership or wallet balances.',
  'Trust, Evidence, Developer, Ecosystem, and Updates are linked, not duplicated.',
  'Full-text governance search is prepared via machineTags but not implemented in PP011.',
] as const

export function isGovernanceModel(value: string): value is GovernanceModel {
  return (GOVERNANCE_MODELS as readonly string[]).includes(value)
}

export function isGovernanceLifecycle(value: string): value is GovernanceLifecycle {
  return (GOVERNANCE_LIFECYCLES as readonly string[]).includes(value)
}

export function isTreasuryType(value: string): value is TreasuryType {
  return (TREASURY_TYPES as readonly string[]).includes(value)
}

export function isTreasuryLifecycle(value: string): value is TreasuryLifecycle {
  return (TREASURY_LIFECYCLES as readonly string[]).includes(value)
}

export function isDisclosureLevel(value: string): value is DisclosureLevel {
  return (DISCLOSURE_LEVELS as readonly string[]).includes(value)
}

export function isUpgradeabilityModel(value: string): value is UpgradeabilityModel {
  return (UPGRADEABILITY_MODELS as readonly string[]).includes(value)
}

export function isOwnerModel(value: string): value is OwnerModel {
  return (OWNER_MODELS as readonly string[]).includes(value)
}

export function isProxyModel(value: string): value is ProxyModel {
  return (PROXY_MODELS as readonly string[]).includes(value)
}

export function isTimelockModel(value: string): value is TimelockModel {
  return (TIMELOCK_MODELS as readonly string[]).includes(value)
}

export function isGovernanceResourceKind(value: string): value is GovernanceResourceKind {
  return (GOVERNANCE_RESOURCE_KINDS as readonly string[]).includes(value)
}

export function isGovernanceCapabilityKey(value: string): value is GovernanceCapabilityKey {
  return (GOVERNANCE_CAPABILITIES as readonly string[]).includes(value)
}

export function isGovernanceRelationType(value: string): value is GovernanceRelationType {
  return (GOVERNANCE_RELATION_TYPES as readonly string[]).includes(value)
}
