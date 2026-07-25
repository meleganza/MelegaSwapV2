import { activeCredentials } from './fetchSpaceProfile'
import type { SpaceProfessionalProfileApiSummary, SpaceProfessionalProfileSnapshot } from './types'

export function toSpaceProfessionalProfileApiSummary(
  snapshot: SpaceProfessionalProfileSnapshot,
): SpaceProfessionalProfileApiSummary {
  const activeBadges = activeCredentials(snapshot.badges)
  const activeCerts = activeCredentials(snapshot.certifications)
  return {
    authority: 'SPACE',
    status: snapshot.status,
    profileId: snapshot.profileId,
    canonicalUrl: snapshot.canonicalUrl,
    profileType: snapshot.profileType ?? null,
    verificationState: snapshot.verificationState ?? null,
    profileStatus: snapshot.profileStatus ?? null,
    badgesSummary: { active: activeBadges.length, total: snapshot.badges.length },
    certificationsSummary: { active: activeCerts.length, total: snapshot.certifications.length },
    servicesSummary: { total: snapshot.services.length, shown: Math.min(3, snapshot.services.length) },
    version: snapshot.version ?? null,
    updatedAt: snapshot.updatedAt ?? null,
    freshness: snapshot.freshness,
    provenance: 'SPACE',
    fetchedAt: snapshot.fetchedAt,
    partialData: snapshot.partialData,
    errorState: snapshot.errorState,
    message: snapshot.message,
  }
}
