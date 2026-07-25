import { describe, expect, it } from 'vitest'
import {
  activeCredentials,
  resolveSpaceProfileReference,
  toSpaceProfessionalProfileApiSummary,
  wouldRejectNameMatch,
  wouldRejectSymbolMatch,
  fetchSpaceProfessionalProfile,
} from 'lib/space-professional-profile'
import type { StaticProjectRecord } from 'registry/projects/types'
import type { SpaceBadgeSnapshot, SpaceProfessionalProfileSnapshot } from '../types'

function baseProject(over: Partial<StaticProjectRecord> = {}): StaticProjectRecord {
  return {
    upi: 'upi://melega/project/demo@1',
    slug: 'demo',
    displayName: 'Demo',
    description: 'd',
    registryStatus: 'listed',
    phase: 'registered',
    verificationStatus: 'unverified',
    trustBadges: ['unverified'],
    endorsementStatus: 'none',
    riskTier: 'unknown',
    legacyImport: false,
    isCanonical: true,
    mvpStatic: true,
    sectorTags: [],
    supportedChains: [56],
    resources: { tokens: [], liquidityPools: [], farms: [], stakingPools: [] },
    capabilities: {
      tradable: { status: 'none' },
      liquidity: { status: 'none' },
      farm: { status: 'none' },
      pool: { status: 'none' },
      lock: { status: 'none' },
      vesting: { status: 'none' },
      launch: { status: 'none' },
      smartdrop: { status: 'none' },
      radar: { status: 'none' },
      space: { status: 'partial' },
      labs: { status: 'none' },
      aiReport: { status: 'none' },
      machineManifest: { status: 'none' },
      treasuryCompatible: { status: 'none' },
    },
    primaryTokenRefs: [],
    deepLinks: {},
    disclaimer: 'd',
    asOf: '2026-07-24',
    ...over,
  }
}

describe('SPACE Professional Profile link policy', () => {
  it('rejects homepage URL-only spaceProfileUrl as canonical link', () => {
    const r = resolveSpaceProfileReference(baseProject({ spaceProfileUrl: 'https://melega.space/' }))
    expect(r.reference).toBeNull()
    expect(r.rejected).toBe('HOMEPAGE_URL_ONLY')
  })

  it('accepts explicit spaceProfileReference.profileId', () => {
    const r = resolveSpaceProfileReference(
      baseProject({
        spaceProfileReference: {
          profileId: 'space:profile:demo-1',
          source: 'EXPLICIT_SPACE_PROFILE_ID',
          linkedAt: '2026-07-24T00:00:00.000Z',
          linkProvenance: 'founder-approved registry reference',
        },
      }),
    )
    expect(r.reference?.profileId).toBe('space:profile:demo-1')
  })

  it('rejects name and symbol match classes', () => {
    expect(wouldRejectNameMatch('MARCO', 'MARCO')).toBe('DISPLAY_NAME')
    expect(wouldRejectSymbolMatch('MARCO')).toBe('TOKEN_SYMBOL')
  })
})

describe('SPACE credential filtering', () => {
  it('never treats revoked/expired as active', () => {
    const badges: SpaceBadgeSnapshot[] = [
      { badgeId: '1', publicName: 'A', status: 'ACTIVE', provenance: 'SPACE' },
      { badgeId: '2', publicName: 'B', status: 'REVOKED', provenance: 'SPACE' },
      { badgeId: '3', publicName: 'C', status: 'EXPIRED', provenance: 'SPACE' },
    ]
    expect(activeCredentials(badges).map((b) => b.badgeId)).toEqual(['1'])
  })
})

describe('SPACE fetch without API base', () => {
  it('returns NO_CANONICAL_LINK when unlinked', async () => {
    const snap = await fetchSpaceProfessionalProfile(null)
    expect(snap.status).toBe('NO_CANONICAL_LINK')
    expect(snap.authority).toBe('SPACE')
    expect(snap.services).toEqual([])
    expect(snap.badges).toEqual([])
  })

  it('returns SPACE_UNAVAILABLE when linked but API base missing', async () => {
    const prev = process.env.SPACE_PUBLIC_PROFILE_API_BASE
    delete process.env.SPACE_PUBLIC_PROFILE_API_BASE
    delete process.env.NEXT_PUBLIC_SPACE_PUBLIC_PROFILE_API_BASE
    const snap = await fetchSpaceProfessionalProfile({
      profileId: 'space:profile:x',
      source: 'EXPLICIT_SPACE_PROFILE_ID',
      linkedAt: '2026-07-24T00:00:00.000Z',
      linkProvenance: 'test',
      linkAttestation: 'declared',
    })
    expect(snap.status).toBe('SPACE_UNAVAILABLE')
    expect(snap.errorState).toBe('SPACE_PUBLIC_PROFILE_API_BASE_NOT_CONFIGURED')
    if (prev) process.env.SPACE_PUBLIC_PROFILE_API_BASE = prev
  })
})

describe('SPACE API summary', () => {
  it('identifies SPACE as authority and never invents actives', () => {
    const snapshot: SpaceProfessionalProfileSnapshot = {
      authority: 'SPACE',
      status: 'NO_CANONICAL_LINK',
      profileId: null,
      canonicalUrl: null,
      services: [],
      badges: [],
      certifications: [],
      fetchedAt: '2026-07-24T00:00:00.000Z',
      freshness: 'unknown',
      provenance: 'SPACE',
      partialData: false,
      errorState: null,
      message: 'unlinked',
    }
    const summary = toSpaceProfessionalProfileApiSummary(snapshot)
    expect(summary.authority).toBe('SPACE')
    expect(summary.provenance).toBe('SPACE')
    expect(summary.badgesSummary.active).toBe(0)
  })
})
