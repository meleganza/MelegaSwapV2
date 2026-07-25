import type { StaticProjectRecord } from 'registry/projects/types'
import type { SpaceForbiddenMatchClass, SpaceProfileReference } from './types'

/**
 * Canonical Project → SPACE link resolution.
 * Rejects name/symbol/logo/homepage-only heuristics.
 */
export function resolveSpaceProfileReference(
  project: Pick<StaticProjectRecord, 'slug' | 'displayName' | 'spaceProfileUrl' | 'spaceProfileReference' | 'resources'>,
): { reference: SpaceProfileReference | null; rejected?: SpaceForbiddenMatchClass; reason: string } {
  const explicit = project.spaceProfileReference
  if (explicit?.profileId && typeof explicit.profileId === 'string' && explicit.profileId.trim()) {
    const id = explicit.profileId.trim()
    if (!/^[a-zA-Z0-9:_@./-]{3,128}$/.test(id)) {
      return { reference: null, reason: 'spaceProfileReference.profileId failed format validation' }
    }
    return {
      reference: {
        profileId: id,
        source: explicit.source,
        linkedAt: explicit.linkedAt,
        linkProvenance: explicit.linkProvenance,
        linkAttestation: 'declared',
      },
      reason: 'explicit spaceProfileReference.profileId',
    }
  }

  // Homepage / marketing URLs are not profile IDs.
  if (project.spaceProfileUrl) {
    return {
      reference: null,
      rejected: 'HOMEPAGE_URL_ONLY',
      reason:
        'spaceProfileUrl is a marketing/homepage link only and is not a canonical SPACE Professional Profile identifier',
    }
  }

  return { reference: null, reason: 'no canonical SPACE profile reference on project registry' }
}

/** Explicit reject helpers for tests — never used to create links. */
export function wouldRejectNameMatch(_displayName: string, _spaceName: string): SpaceForbiddenMatchClass {
  return 'DISPLAY_NAME'
}

export function wouldRejectSymbolMatch(_symbol: string): SpaceForbiddenMatchClass {
  return 'TOKEN_SYMBOL'
}
