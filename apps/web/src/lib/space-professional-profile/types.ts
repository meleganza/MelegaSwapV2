/**
 * Read-only SPACE Professional Profile models for Project Page widgets.
 * SPACE is the sole authority — DEX never invents credentials or services.
 */

export type SpaceLinkProvenance =
  | 'EXPLICIT_SPACE_PROFILE_ID'
  | 'PASSPORT_SUBJECT'
  | 'VERIFIED_SHARED_OWNERSHIP'
  | 'TOKEN_CONTRACT'
  | 'ORG_WALLET'
  | 'REGISTRY_RELATIONSHIP'
  | 'APPROVED_ALIAS'

/** Forbidden automatic match classes (must never produce a link). */
export type SpaceForbiddenMatchClass =
  | 'DISPLAY_NAME'
  | 'SIMILAR_NAME'
  | 'TOKEN_SYMBOL'
  | 'LOGO'
  | 'UNVERIFIED_SOCIAL'
  | 'FUZZY_TEXT'
  | 'HOMEPAGE_URL_ONLY'

export type SpaceWidgetStatus =
  | 'NO_CANONICAL_LINK'
  | 'PROFILE_LINKED'
  | 'PARTIAL_DATA'
  | 'SPACE_UNAVAILABLE'
  | 'STALE_DATA'
  | 'SUSPENDED_PROFILE'
  | 'PROFILE_NOT_FOUND'

export type SpaceCredentialVisualStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED' | 'UNAVAILABLE'

export type SpaceCredentialKind = 'BADGE' | 'VERIFICATION' | 'CERTIFICATION'

export interface SpaceProfileReference {
  profileId: string
  source: SpaceLinkProvenance
  linkedAt: string
  linkProvenance: string
  /** DEX-side link attestation only — never implies SPACE verification. */
  linkAttestation: 'declared'
}

export interface SpaceBadgeSnapshot {
  badgeId: string
  publicName: string
  shortMeaning?: string
  issuer?: string
  issuedAt?: string
  status: SpaceCredentialVisualStatus
  validUntil?: string
  revocationState?: string
  evidenceUrl?: string
  artworkUrl?: string
  provenance: 'SPACE'
}

export interface SpaceCertificationSnapshot {
  certificationId: string
  publicTitle: string
  scope?: string
  issuer?: string
  issuedAt?: string
  validUntil?: string
  status: SpaceCredentialVisualStatus
  evidenceUrl?: string
  provenance: 'SPACE'
}

export interface SpaceServiceSnapshot {
  serviceId?: string
  title: string
  category?: string
  shortOutcome?: string
  status?: string
  priceStatus?: string
  mCreditsSupported?: boolean
  directCryptoSupported?: boolean
  serviceUrl?: string
  provenance: 'SPACE'
}

export interface SpaceProfessionalProfileSnapshot {
  authority: 'SPACE'
  status: SpaceWidgetStatus
  profileId: string | null
  canonicalUrl: string | null
  displayName?: string
  profileType?: string
  avatarOrLogo?: string
  shortProfessionalDescription?: string
  /** Only when SPACE explicitly reports verification — never inferred. */
  verificationState?: string
  profileStatus?: string
  services: SpaceServiceSnapshot[]
  badges: SpaceBadgeSnapshot[]
  certifications: SpaceCertificationSnapshot[]
  reputationSummary?: Record<string, unknown>
  version?: string
  updatedAt?: string | null
  fetchedAt: string
  freshness: 'current' | 'stale' | 'unknown' | 'unavailable'
  provenance: 'SPACE'
  partialData: boolean
  errorState: string | null
  message: string
}

export interface SpaceProfessionalProfileApiSummary {
  authority: 'SPACE'
  status: SpaceWidgetStatus
  profileId: string | null
  canonicalUrl: string | null
  profileType: string | null
  verificationState: string | null
  profileStatus: string | null
  badgesSummary: { active: number; total: number }
  certificationsSummary: { active: number; total: number }
  servicesSummary: { total: number; shown: number }
  version: string | null
  updatedAt: string | null
  freshness: SpaceProfessionalProfileSnapshot['freshness']
  provenance: 'SPACE'
  fetchedAt: string
  partialData: boolean
  errorState: string | null
  message: string
}
