/**
 * PP012 — Project Control Center schema.
 * Authenticated owner staging surface — not CMS, not runtime authority.
 */

export const PROJECT_CONTROL_CENTER_SCHEMA_VERSION = 'melega.project-control-center.v1' as const
export const CONTROL_CENTER_RESOLVER_REVISION = 'PP012_CONTROL_CENTER_V1' as const
export const PROJECT_PAGE_CONTROL_CENTER_SUMMARY_EXTENSION = 'controlCenterSummary.v1' as const

export const OWNER_IDENTITY_TYPES = ['WALLET', 'OPERATOR', 'PROJECT', 'UNKNOWN'] as const
export type OwnerIdentityType = (typeof OWNER_IDENTITY_TYPES)[number]

export const OWNER_VERIFICATION_STATES = ['UNVERIFIED', 'PENDING', 'VERIFIED', 'SUSPENDED', 'UNAVAILABLE'] as const
export type OwnerVerificationState = (typeof OWNER_VERIFICATION_STATES)[number]

export const OWNER_ROLES = ['OWNER', 'ADMIN', 'EDITOR', 'PUBLISHER', 'AUDITOR', 'VIEWER'] as const
export type OwnerRole = (typeof OWNER_ROLES)[number]

export const OWNER_PERMISSIONS = [
  'EDIT_PROFILE',
  'EDIT_RESOURCES',
  'PUBLISH_UPDATE',
  'MANAGE_DOCUMENTATION',
  'MANAGE_ECOSYSTEM',
  'VIEW_AUDIT',
  'MANAGE_TEAM',
] as const
export type OwnerPermission = (typeof OWNER_PERMISSIONS)[number]

export const CLAIM_STATES = ['UNCLAIMED', 'CLAIM_PENDING', 'CLAIMED', 'VERIFIED', 'SUSPENDED', 'ARCHIVED'] as const
export type ClaimState = (typeof CLAIM_STATES)[number]

export const CONTROL_CENTER_SECTIONS = [
  'OVERVIEW',
  'PROFILE',
  'RESOURCES',
  'UPDATES',
  'DEVELOPER',
  'ECOSYSTEM',
  'VERIFICATION',
  'AUDIT_HISTORY',
] as const
export type ControlCenterSection = (typeof CONTROL_CENTER_SECTIONS)[number]

export const AUDIT_ACTIONS = [
  'SESSION_OPEN',
  'PROFILE_STAGE',
  'RESOURCE_STAGE',
  'UPDATE_PUBLISH_STAGE',
  'ECOSYSTEM_STAGE',
  'DEVELOPER_STAGE',
  'CLAIM_TRANSITION',
] as const
export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const CONTROL_CENTER_REASON_CODES = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'INVALID_PERMISSION',
  'INVALID_PAYLOAD',
  'UNSAFE_URL',
  'RATE_LIMITED',
  'PROJECT_NOT_FOUND',
  'CLAIM_NOT_EDITABLE',
  'MUTATION_REQUIRES_VERIFICATION',
] as const
export type ControlCenterReasonCode = (typeof CONTROL_CENTER_REASON_CODES)[number]

/** Role → permission matrix (server-enforced). */
export const ROLE_PERMISSIONS: Record<OwnerRole, readonly OwnerPermission[]> = {
  OWNER: OWNER_PERMISSIONS,
  ADMIN: [
    'EDIT_PROFILE',
    'EDIT_RESOURCES',
    'PUBLISH_UPDATE',
    'MANAGE_DOCUMENTATION',
    'MANAGE_ECOSYSTEM',
    'VIEW_AUDIT',
    'MANAGE_TEAM',
  ],
  EDITOR: ['EDIT_PROFILE', 'EDIT_RESOURCES', 'MANAGE_DOCUMENTATION', 'MANAGE_ECOSYSTEM'],
  PUBLISHER: ['PUBLISH_UPDATE', 'EDIT_RESOURCES'],
  AUDITOR: ['VIEW_AUDIT'],
  VIEWER: [],
}

export const CONTROL_CENTER_LIMITATIONS = [
  'The Control Center stages registry mutations only — it never edits runtime state, smart contracts, treasury, or governance execution.',
  'Wallet SIWE sessions are not available in this repository; authentication uses the operator Bearer pattern aligned with private indexer APIs.',
  'Staged mutations do not auto-promote into frozen PP001–PP011 static registries; canonical publication remains a human git merge.',
  'Manage Project is never rendered for unauthenticated public visitors.',
  'No automatic owner verification — VERIFIED requires an explicit certified owner record.',
] as const

export function isOwnerIdentityType(value: string): value is OwnerIdentityType {
  return (OWNER_IDENTITY_TYPES as readonly string[]).includes(value)
}

export function isOwnerVerificationState(value: string): value is OwnerVerificationState {
  return (OWNER_VERIFICATION_STATES as readonly string[]).includes(value)
}

export function isOwnerRole(value: string): value is OwnerRole {
  return (OWNER_ROLES as readonly string[]).includes(value)
}

export function isOwnerPermission(value: string): value is OwnerPermission {
  return (OWNER_PERMISSIONS as readonly string[]).includes(value)
}

export function isClaimState(value: string): value is ClaimState {
  return (CLAIM_STATES as readonly string[]).includes(value)
}

export function isAuditAction(value: string): value is AuditAction {
  return (AUDIT_ACTIONS as readonly string[]).includes(value)
}

export function permissionsForRoles(roles: readonly OwnerRole[]): OwnerPermission[] {
  const set = new Set<OwnerPermission>()
  for (const role of roles) {
    if (!isOwnerRole(role)) continue
    for (const permission of ROLE_PERMISSIONS[role]) set.add(permission)
  }
  return [...set].sort()
}
