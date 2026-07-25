import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  activeCredentials,
  resolveSpaceProfileReference,
  toSpaceProfessionalProfileApiSummary,
  wouldRejectNameMatch,
  wouldRejectSymbolMatch,
  fetchSpaceProfessionalProfile,
  DEFAULT_SPACE_PUBLIC_PROFILE_API_BASE,
  SPACE_PUBLIC_PROFILE_SCHEMA,
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

const linkedRef = {
  profileId: 'pp_demo_1',
  source: 'EXPLICIT_SPACE_PROFILE_ID' as const,
  linkedAt: '2026-07-24T00:00:00.000Z',
  linkProvenance: 'test',
  linkAttestation: 'declared' as const,
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  delete process.env.SPACE_PUBLIC_PROFILE_API_BASE
  delete process.env.NEXT_PUBLIC_SPACE_PUBLIC_PROFILE_API_BASE
})

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
      { badgeId: '4', publicName: 'D', status: 'SUSPENDED', provenance: 'SPACE' },
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

  it('returns SPACE_UNAVAILABLE when API base explicitly disabled', async () => {
    process.env.SPACE_PUBLIC_PROFILE_API_BASE = ''
    const snap = await fetchSpaceProfessionalProfile(linkedRef)
    expect(snap.status).toBe('SPACE_UNAVAILABLE')
    expect(snap.errorState).toBe('SPACE_PUBLIC_PROFILE_API_BASE_NOT_CONFIGURED')
  })
})

describe('SPACE live-contract adapter mapping', () => {
  it('defaults to published SPACE production base', () => {
    expect(DEFAULT_SPACE_PUBLIC_PROFILE_API_BASE).toBe('https://space.melega.ai')
    expect(SPACE_PUBLIC_PROFILE_SCHEMA).toBe('space.professional-profile.public.v1')
  })

  it('maps space.professional-profile.public.v1 detail without inventing verification', async () => {
    const detail = {
      schema: 'space.professional-profile.public.v1',
      profile_id: 'pp_demo_1',
      canonical_url: 'https://space.melega.ai/professional/pp_demo_1',
      subject: {
        type: 'PROJECT',
        display_name: 'Demo Project',
        avatar_url: null,
        short_description: 'Public description',
      },
      profile_status: 'ACTIVE',
      verification: { status: 'NOT_VERIFIED', authority: 'SPACE' },
      services_summary: {
        count: 1,
        items: [
          {
            service_id: 'svc_1',
            title: 'Security review',
            family: 'security',
            short_description: 'Outcome',
            public_status: 'AVAILABLE_FOR_BROWSING',
            price_status: 'TREASURY_QUOTE_REQUIRED',
            m_credits_supported: true,
            direct_crypto_supported: true,
            canonical_service_url: 'https://space.melega.ai/services/svc_1',
            provenance: { authority: 'SPACE' },
          },
          {
            service_id: 'svc_hidden',
            title: 'Hidden',
            public_status: 'HIDDEN',
          },
        ],
      },
      badges_summary: {
        active_count: 1,
        items: [
          { badge_id: 'b1', public_name: 'Active Badge', status: 'ACTIVE', issuer: 'SPACE' },
          { badge_id: 'b2', public_name: 'Revoked Badge', status: 'REVOKED', issuer: 'SPACE' },
        ],
      },
      certifications_summary: {
        active_count: 0,
        items: [{ certification_id: 'c1', public_title: 'Expired Cert', status: 'EXPIRED', issuer: 'SPACE' }],
      },
      reputation_summary: null,
      ecosystem_references: { melega_project_ids: [], tokens: [] },
      version: '2026-07-25T00:00:00.000Z',
      updated_at: '2026-07-25T00:00:00.000Z',
      freshness: 'CURRENT',
      provenance: { authority: 'SPACE', source: 'space-professional-profile-store', generated_at: '2026-07-25T00:00:00.000Z' },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).endsWith('/services') || String(url).endsWith('/credentials')) {
          return { ok: false, status: 404, json: async () => ({}) }
        }
        return { ok: true, status: 200, json: async () => detail }
      }),
    )

    const snap = await fetchSpaceProfessionalProfile(linkedRef)
    expect(snap.status).toBe('PROFILE_LINKED')
    expect(snap.authority).toBe('SPACE')
    expect(snap.canonicalUrl).toBe('https://space.melega.ai/professional/pp_demo_1')
    expect(snap.verificationState).toBe('NOT_VERIFIED')
    expect(snap.services.map((s) => s.serviceId)).toEqual(['svc_1'])
    expect(activeCredentials(snap.badges)).toHaveLength(1)
    expect(activeCredentials(snap.certifications)).toHaveLength(0)
    expect(snap.services[0]?.mCreditsSupported).toBe(true)
  })

  it('maps PROFILE_NOT_FOUND without converting to empty badges', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({
          schema: 'space.professional-profile.public.v1',
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: 'profile not found',
            profile_id: 'pp_demo_1',
            authority: 'SPACE',
          },
        }),
      })),
    )
    const snap = await fetchSpaceProfessionalProfile(linkedRef)
    expect(snap.status).toBe('PROFILE_NOT_FOUND')
    expect(snap.errorState).toBe('PROFILE_NOT_FOUND')
    expect(snap.badges).toEqual([])
    expect(snap.message).not.toMatch(/no badge/i)
  })

  it('rejects non-SPACE canonical hosts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).endsWith('/services') || String(url).endsWith('/credentials')) {
          return { ok: false, status: 404, json: async () => ({}) }
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            schema: 'space.professional-profile.public.v1',
            profile_id: 'pp_demo_1',
            canonical_url: 'https://evil.example/profile',
            subject: { type: 'PROJECT', display_name: 'X', avatar_url: null, short_description: 'd' },
            profile_status: 'ACTIVE',
            verification: { status: 'VERIFIED', authority: 'SPACE' },
            services_summary: { count: 0, items: [] },
            badges_summary: { active_count: 0, items: [] },
            certifications_summary: { active_count: 0, items: [] },
            reputation_summary: null,
            ecosystem_references: {},
            version: 'v',
            updated_at: '2026-07-25T00:00:00.000Z',
            freshness: 'CURRENT',
            provenance: { authority: 'SPACE', source: 't', generated_at: '2026-07-25T00:00:00.000Z' },
          }),
        }
      }),
    )
    const snap = await fetchSpaceProfessionalProfile(linkedRef)
    expect(snap.canonicalUrl).toBeNull()
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
