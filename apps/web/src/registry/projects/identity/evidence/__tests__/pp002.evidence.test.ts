import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { getProjectBySlug } from '../../../getProjectBySlug'
import {
  buildConflictGroupId,
  buildEvidenceId,
  buildProjectEvidencePack,
  createEvidenceRecord,
  detectEvidenceConflicts,
  evaluateFreshness,
  isEvidenceClaimType,
  isEvidenceStatus,
  isEvidenceVerificationLevel,
  loadProjectEvidencePack,
  normalizeClaimValue,
  normalizeProjectDocument,
  toEvidenceSummaryForProjectApi,
  toPublicEvidenceJson,
  toPublicProjectJson,
  validateDerivedEvidence,
  assertSafeSourceReference,
  PROJECT_EVIDENCE_SCHEMA_VERSION,
} from '../../index'
import type { ProjectEvidenceRecord } from '../types'

const FIXED_AS_OF = '2026-07-20T12:00:00.000Z'

function baseSubject(projectId: string, fieldPath: string | null = null) {
  return { subjectType: 'PROJECT' as const, projectId, subjectId: projectId, fieldPath }
}

describe('PP002 evidence identity and enums', () => {
  it('generates deterministic evidence IDs', () => {
    const subject = baseSubject('upi://test/project/a@1', 'identity.displayName')
    const a = buildEvidenceId({
      projectId: 'upi://test/project/a@1',
      claimType: 'PROJECT_NAME',
      subject,
      sourceType: 'PROJECT_ATTESTED',
      sourceReference: 'registry://x',
      normalizedClaimValue: 'Acme',
    })
    const b = buildEvidenceId({
      projectId: 'upi://test/project/a@1',
      claimType: 'PROJECT_NAME',
      subject,
      sourceType: 'PROJECT_ATTESTED',
      sourceReference: 'registry://x',
      normalizedClaimValue: 'Acme',
    })
    expect(a).toBe(b)
    expect(a.startsWith('ev_')).toBe(true)
  })

  it('validates claim type, status, and verification level enums', () => {
    expect(isEvidenceClaimType('OFFICIAL_WEBSITE')).toBe(true)
    expect(isEvidenceClaimType('NOT_A_CLAIM')).toBe(false)
    expect(isEvidenceStatus('ASSERTED')).toBe(true)
    expect(isEvidenceStatus('TRUE')).toBe(false)
    expect(isEvidenceVerificationLevel('MELEGA_VERIFIED')).toBe(true)
    expect(isEvidenceVerificationLevel('SAFE')).toBe(false)
  })

  it('validates subject references via createEvidenceRecord', () => {
    const record = createEvidenceRecord({
      projectId: 'upi://x',
      subject: baseSubject('upi://x', 'identity.projectId'),
      claimType: 'PROJECT_IDENTITY',
      claimValue: 'upi://x',
      sourceType: 'MELEGA_VERIFIED',
      sourceReference: 'upi://x',
      status: 'OBSERVED',
      verificationLevel: 'MELEGA_VERIFIED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
    })
    expect(record?.subject.subjectType).toBe('PROJECT')
    expect(record?.subject.subjectId).toBe('upi://x')
    expect(record?.schemaVersion).toBe(PROJECT_EVIDENCE_SCHEMA_VERSION)
  })
})

describe('PP002 project evidence resolution', () => {
  it('resolves valid project, canonical slug, and alias to same projectId', () => {
    const bySlug = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AS_OF, asOf: FIXED_AS_OF })
    const byAlias = loadProjectEvidencePack('melega', { generatedAt: FIXED_AS_OF, asOf: FIXED_AS_OF })
    expect(bySlug?.document.projectId).toBe('upi://melega/project/melega-dex@1')
    expect(byAlias?.document.projectId).toBe(bySlug?.document.projectId)
    expect(bySlug?.evidencePack.schemaVersion).toBe(PROJECT_EVIDENCE_SCHEMA_VERSION)
    expect(bySlug?.evidencePack.evidence.length).toBeGreaterThan(0)
  })

  it('returns null for unknown project (API maps to 404)', () => {
    expect(loadProjectEvidencePack('does-not-exist')).toBeNull()
    expect(loadProjectEvidencePack('../etc')).toBeNull()
  })
})

describe('PP002 freshness', () => {
  it('does not stale evidence without freshness requirement', () => {
    const result = evaluateFreshness(
      {
        status: 'ASSERTED',
        observedAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
        expiresAt: null,
        freshnessPolicy: null,
      },
      { asOf: FIXED_AS_OF },
    )
    expect(result.freshnessState).toBe('NONE')
    expect(result.freshnessReason).toBe('NO_FRESHNESS_REQUIREMENT')
  })

  it('marks expired evidence when past expiresAt', () => {
    const result = evaluateFreshness(
      {
        status: 'OBSERVED',
        observedAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
        expiresAt: '2021-01-01T00:00:00.000Z',
        freshnessPolicy: null,
      },
      { asOf: FIXED_AS_OF },
    )
    expect(result.freshnessState).toBe('EXPIRED')
    expect(result.status).toBe('EXPIRED')
  })

  it('marks stale when maxAge policy exceeded', () => {
    const result = evaluateFreshness(
      {
        status: 'OBSERVED',
        observedAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
        expiresAt: null,
        freshnessPolicy: { maxAgeMs: 1000, reasonCode: 'MAX_AGE_EXCEEDED' },
      },
      { asOf: FIXED_AS_OF },
    )
    expect(result.freshnessState).toBe('STALE')
    expect(result.freshnessReason).toBe('MAX_AGE_EXCEEDED')
  })
})

describe('PP002 conflicts and normalization', () => {
  it('does not false-conflict on URL trailing slash / casing', () => {
    expect(normalizeClaimValue('OFFICIAL_WEBSITE', 'https://Example.com/Path/')).toBe(
      normalizeClaimValue('OFFICIAL_WEBSITE', 'https://example.com/Path'),
    )
  })

  it('does not false-conflict on CAIP address casing', () => {
    const a = normalizeClaimValue('CONTRACT_IDENTITY', 'eip155:56:0x963556de0eb8138E97A85F0A86eE0acD159D210b')
    const b = normalizeClaimValue('CONTRACT_IDENTITY', 'eip155:56:0x963556de0eb8138e97a85f0a86ee0acd159d210b')
    expect(a).toBe(b)
  })

  it('detects incompatible official website conflict with deterministic group id', () => {
    const projectId = 'upi://fixture/conflict@1'
    const subject = baseSubject(projectId, 'resources.website')
    const left = createEvidenceRecord({
      projectId,
      subject,
      claimType: 'OFFICIAL_WEBSITE',
      claimValue: 'https://a.example/',
      sourceType: 'PROJECT_ATTESTED',
      sourceReference: 'https://a.example/',
      status: 'ASSERTED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
    })!
    const right = createEvidenceRecord({
      projectId,
      subject,
      claimType: 'OFFICIAL_WEBSITE',
      claimValue: 'https://b.example/',
      sourceType: 'THIRD_PARTY',
      sourceReference: 'https://b.example/',
      status: 'ASSERTED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
    })!
    const { records, conflicts } = detectEvidenceConflicts([left, right])
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].conflictGroupId).toBe(
      buildConflictGroupId({ projectId, claimType: 'OFFICIAL_WEBSITE', subject }),
    )
    expect(records.every((r) => r.status === 'CONFLICTED')).toBe(true)
    expect(records.every((r) => r.availability === 'CONFLICTED')).toBe(true)
  })

  it('detects incompatible contract classification conflict', () => {
    const projectId = 'upi://fixture/class@1'
    const subject = {
      subjectType: 'CONTRACT' as const,
      projectId,
      subjectId: 'eip155:56:0x963556de0eb8138e97a85f0a86ee0acd159d210b',
      fieldPath: 'classification',
    }
    const a = createEvidenceRecord({
      projectId,
      subject,
      claimType: 'CONTRACT_CLASSIFICATION',
      claimValue: 'token_contract',
      sourceType: 'PROJECT_ATTESTED',
      sourceReference: 'registry://a',
      status: 'ASSERTED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
    })!
    const b = createEvidenceRecord({
      projectId,
      subject,
      claimType: 'CONTRACT_CLASSIFICATION',
      claimValue: 'router_contract',
      sourceType: 'THIRD_PARTY',
      sourceReference: 'registry://b',
      status: 'ASSERTED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
    })!
    const { conflicts } = detectEvidenceConflicts([a, b])
    expect(conflicts).toHaveLength(1)
  })

  it('detects incompatible project identity conflict', () => {
    const projectId = 'upi://fixture/id@1'
    const subject = baseSubject(projectId, 'identity.projectId')
    const a = createEvidenceRecord({
      projectId,
      subject,
      claimType: 'PROJECT_IDENTITY',
      claimValue: 'upi://fixture/id@1',
      sourceType: 'MELEGA_VERIFIED',
      sourceReference: 'upi://fixture/id@1',
      status: 'VERIFIED',
      verificationLevel: 'MELEGA_VERIFIED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
    })!
    const b = createEvidenceRecord({
      projectId,
      subject,
      claimType: 'PROJECT_IDENTITY',
      claimValue: 'upi://fixture/other@1',
      sourceType: 'THIRD_PARTY',
      sourceReference: 'upi://fixture/other@1',
      status: 'ASSERTED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
    })!
    expect(detectEvidenceConflicts([a, b]).conflicts).toHaveLength(1)
  })
})

describe('PP002 derivation', () => {
  it('accepts derived evidence with valid inputs and caps verification level', () => {
    const projectId = 'upi://fixture/der@1'
    const parent = createEvidenceRecord({
      projectId,
      subject: baseSubject(projectId),
      claimType: 'PROJECT_IDENTITY',
      claimValue: projectId,
      sourceType: 'PROJECT_ATTESTED',
      sourceReference: 'registry://p',
      status: 'ASSERTED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
    })!
    const child = createEvidenceRecord({
      projectId,
      subject: baseSubject(projectId, 'readiness'),
      claimType: 'READINESS_INPUT',
      claimValue: '50',
      sourceType: 'DERIVED',
      sourceReference: 'method://x',
      status: 'OBSERVED',
      verificationLevel: 'MELEGA_VERIFIED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
      derivedFromEvidenceIds: [parent.evidenceId],
      derivationMethod: 'TEST',
    })!
    const catalog = new Map<string, ProjectEvidenceRecord>([
      [parent.evidenceId, parent],
      [child.evidenceId, child],
    ])
    const result = validateDerivedEvidence(child, catalog)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.verificationLevel).toBe('SOURCE_CONFIRMED')
  })

  it('rejects missing inputs and circular derivation', () => {
    const projectId = 'upi://fixture/circ@1'
    const a = createEvidenceRecord({
      projectId,
      subject: baseSubject(projectId),
      claimType: 'READINESS_INPUT',
      claimValue: '1',
      sourceType: 'DERIVED',
      sourceReference: 'method://a',
      status: 'OBSERVED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
      derivedFromEvidenceIds: ['ev_missing'],
      derivationMethod: 'TEST',
    })!
    expect(validateDerivedEvidence(a, new Map([[a.evidenceId, a]])).ok).toBe(false)

    const self = createEvidenceRecord({
      projectId,
      subject: baseSubject(projectId, 'self'),
      claimType: 'READINESS_INPUT',
      claimValue: '1',
      sourceType: 'DERIVED',
      sourceReference: 'method://self',
      status: 'OBSERVED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
      derivedFromEvidenceIds: ['placeholder'],
      derivationMethod: 'TEST',
    })!
    const circular = { ...self, derivedFromEvidenceIds: [self.evidenceId] }
    expect(validateDerivedEvidence(circular, new Map([[circular.evidenceId, circular]])).ok).toBe(false)
  })
})

describe('PP002 privacy, safety, and serialization', () => {
  it('excludes private evidence from public serialization', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AS_OF, asOf: FIXED_AS_OF })!
    const privateRecord = createEvidenceRecord({
      projectId: loaded.document.projectId,
      subject: baseSubject(loaded.document.projectId, 'private'),
      claimType: 'PROJECT_NAME',
      claimValue: 'secret-name',
      sourceType: 'MELEGA_VERIFIED',
      sourceReference: 'internal://review',
      status: 'VERIFIED',
      verificationLevel: 'MELEGA_VERIFIED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
      visibility: 'PRIVATE',
      notes: 'internal review only',
    })!
    const pack = {
      ...loaded.evidencePack,
      evidence: [...loaded.evidencePack.evidence, privateRecord],
    }
    const json = toPublicEvidenceJson(pack)
    const evidence = json.evidence as Array<{ visibility: string; evidenceId: string }>
    expect(evidence.every((e) => e.visibility === 'PUBLIC')).toBe(true)
    expect(evidence.some((e) => e.evidenceId === privateRecord.evidenceId)).toBe(false)
  })

  it('rejects unsafe source references', () => {
    expect(assertSafeSourceReference('javascript:alert(1)')).toBeNull()
    expect(assertSafeSourceReference('<script>x</script>')).toBeNull()
    expect(assertSafeSourceReference('https://example.com')).toBe('https://example.com')
  })

  it('HTML/API/evidence pack agree on identity and conflict/freshness availability', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AS_OF, asOf: FIXED_AS_OF })!
    const projectJson = toPublicProjectJson(loaded.document, {
      evidenceSummary: toEvidenceSummaryForProjectApi(loaded.evidencePack),
    })
    const evidenceJson = toPublicEvidenceJson(loaded.evidencePack)
    expect(projectJson.projectId).toBe(evidenceJson.projectId)
    expect(projectJson.slug).toBe(evidenceJson.slug)
    expect((projectJson.evidenceSummary as { availability: string }).availability).toBe(evidenceJson.availability)
    expect((projectJson.evidenceSummary as { activeConflictCount: number }).activeConflictCount).toBe(
      loaded.evidencePack.summary.activeConflictCount,
    )
    expect(JSON.stringify(evidenceJson)).not.toMatch(/<script/i)
  })

  it('production melega pack has no fake trust score and marks control unavailable', () => {
    const project = getProjectBySlug('melega-dex')!
    const doc = normalizeProjectDocument(project, { generatedAt: FIXED_AS_OF })
    const pack = buildProjectEvidencePack(doc, project, { generatedAt: FIXED_AS_OF, asOf: FIXED_AS_OF })
    expect(pack.summary.controlEvidenceAvailable).toBe(false)
    expect(JSON.stringify(pack)).not.toMatch(/"trustScore"/i)
    expect(JSON.stringify(pack)).not.toMatch(/safe project/i)
    expect(pack.evidence.some((e) => e.claimType === 'PROJECT_CONTROL' && e.availability === 'UNAVAILABLE')).toBe(true)
  })
})

describe('PP002 superseded / rejected fixture behavior', () => {
  it('keeps superseded and rejected evidence out of conflict winners', () => {
    const projectId = 'upi://fixture/super@1'
    const subject = baseSubject(projectId, 'resources.website')
    const old = createEvidenceRecord({
      projectId,
      subject,
      claimType: 'OFFICIAL_WEBSITE',
      claimValue: 'https://old.example/',
      sourceType: 'PROJECT_ATTESTED',
      sourceReference: 'https://old.example/',
      status: 'SUPERSEDED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    })!
    const rejected = createEvidenceRecord({
      projectId,
      subject,
      claimType: 'OFFICIAL_WEBSITE',
      claimValue: 'https://bad.example/',
      sourceType: 'THIRD_PARTY',
      sourceReference: 'https://bad.example/',
      status: 'REJECTED',
      verificationLevel: 'NONE',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
    })!
    const current = createEvidenceRecord({
      projectId,
      subject,
      claimType: 'OFFICIAL_WEBSITE',
      claimValue: 'https://new.example/',
      sourceType: 'PROJECT_ATTESTED',
      sourceReference: 'https://new.example/',
      status: 'ASSERTED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: FIXED_AS_OF,
      updatedAt: FIXED_AS_OF,
      supersedesEvidenceId: old.evidenceId,
    })!
    const { conflicts } = detectEvidenceConflicts([old, rejected, current])
    expect(conflicts).toHaveLength(0)
  })
})

describe('PP002 source contracts and regressions', () => {
  const shell = readFileSync(
    path.resolve(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
    'utf8',
  )
  const trust = readFileSync(path.resolve(__dirname, '../../../../../views/ProjectPage/TrustEvidencePanel.tsx'), 'utf8')
  const hq = readFileSync(path.resolve(__dirname, '../../../../../pages/project-hq/[slug].tsx'), 'utf8')
  const apiProject = readFileSync(path.resolve(__dirname, '../../../../../pages/api/public/projects/[slug].ts'), 'utf8')
  const apiEvidence = readFileSync(
    path.resolve(__dirname, '../../../../../pages/api/public/projects/[slug]/evidence.ts'),
    'utf8',
  )
  const nextConfig = readFileSync(path.resolve(__dirname, '../../../../../../next.config.mjs'), 'utf8')

  it('exposes evidence endpoint and additive project summary', () => {
    expect(apiEvidence).toMatch(
      /melega\.project-evidence|PROJECT_EVIDENCE|stableEvidencePayload|toPublicEvidenceJson|loadProjectEvidencePack/,
    )
    expect(apiProject).toMatch(/evidenceSummary/)
    expect(apiEvidence).toMatch(/status\(404\)/)
  })

  it('does not render fake trust score or safe-project language', () => {
    expect(trust).not.toMatch(/Safe project|Low Risk|Trusted Project/i)
    expect(trust).not.toMatch(/numerical trust score|project score/i)
    expect(trust).toMatch(/not a trust score/)
    expect(trust).toMatch(/not a safety claim/)
    expect(trust).toMatch(/styled\.details/)
    expect(trust).toMatch(/focus-visible/)
    expect(trust).toMatch(/Summary/)
  })

  it('wires evidence pack into PP001 shell without redesign markers', () => {
    expect(hq).toMatch(/loadProjectEvidencePack/)
    expect(hq).toMatch(/evidencePack/)
    expect(shell).toMatch(/TrustEvidencePanel/)
    expect(shell).toMatch(/evidencePack/)
  })

  it('preserves PP001 routing and discovery redirects', () => {
    expect(nextConfig).toMatch(/source: '\/@:slug/)
    expect(nextConfig).toMatch(/source: '\/projects\/:slug/)
    const discovery = readFileSync(path.resolve(__dirname, '../../../../../pages/projects/index.tsx'), 'utf8')
    expect(discovery).toMatch(/ProjectsStudioScreen/)
  })

  it('frozen DEX page entrypoints remain present', () => {
    for (const rel of [
      '../../../../../pages/command-center/index.tsx',
      '../../../../../pages/liquidity-studio.tsx',
      '../../../../../pages/farms/index.tsx',
      '../../../../../pages/pools/index.tsx',
      '../../../../../pages/liquidity.tsx',
      '../../../../../pages/api/liquidity-building/health.ts',
    ]) {
      expect(() => readFileSync(path.resolve(__dirname, rel), 'utf8')).not.toThrow()
    }
  })
})
