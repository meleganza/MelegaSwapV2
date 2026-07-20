/**
 * PP003 — Project Readiness and Trust Snapshot tests.
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import stringify from 'fast-json-stable-stringify'
import { describe, expect, it } from 'vitest'
import {
  CIVILIZATION_READINESS_MAX,
  CIVILIZATION_READINESS_POINT_CAPS,
  CIVILIZATION_READINESS_WEIGHTS,
  computeCivilizationReadiness,
  computeCivilizationReadinessBreakdown,
} from '../../../discovery'
import { STATIC_PROJECTS } from '../../../projects.data'
import type { StaticProjectRecord } from '../../../types'
import { loadProjectEvidencePack } from '../../evidence/loadEvidence'
import { buildProjectEvidencePack, toEvidenceSummaryForProjectApi } from '../../evidence/buildProjectEvidence'
import { normalizeProjectDocument, toPublicProjectJson } from '../../normalizeProject'
import {
  READINESS_COMPONENT_IDS,
  READINESS_LIMITATIONS,
  READINESS_STATE_THRESHOLDS,
  readinessStateFromScore,
  PROJECT_READINESS_SCHEMA_VERSION,
} from '../schema'
import { buildReadinessMethodology } from '../methodology'
import {
  buildProjectReadinessDocument,
  loadProjectReadinessDocument,
  toReadinessSummaryForProjectApi,
  toTrustSnapshotSummaryForProjectApi,
} from '../buildProjectReadinessDocument'

const FIXED_AT = '2026-07-20T12:00:00.000Z'

function cloneProject(overrides: Partial<StaticProjectRecord> = {}): StaticProjectRecord {
  const base = STATIC_PROJECTS[0]
  return {
    ...base,
    ...overrides,
    capabilities: { ...base.capabilities, ...(overrides.capabilities ?? {}) },
    resources: {
      tokens: overrides.resources?.tokens ?? [...base.resources.tokens],
      liquidityPools: overrides.resources?.liquidityPools ?? [...base.resources.liquidityPools],
      farms: overrides.resources?.farms ?? [...base.resources.farms],
      stakingPools: overrides.resources?.stakingPools ?? [...base.resources.stakingPools],
    },
    supportedChains: overrides.supportedChains ?? [...base.supportedChains],
    trustBadges: overrides.trustBadges ?? [...base.trustBadges],
    sectorTags: overrides.sectorTags ?? [...base.sectorTags],
    socialLinks: overrides.socialLinks ?? (base.socialLinks ? [...base.socialLinks] : undefined),
    aliases: overrides.aliases ?? (base.aliases ? [...base.aliases] : undefined),
  }
}

function readinessFor(project: StaticProjectRecord) {
  const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
  const evidencePack = buildProjectEvidencePack(document, project, { generatedAt: FIXED_AT, asOf: FIXED_AT })
  return buildProjectReadinessDocument({ project, document, evidencePack, generatedAt: FIXED_AT })
}

describe('PP003 readiness calculation', () => {
  it('1–4. deterministic score, max, weights, component sum', () => {
    const project = cloneProject()
    const a = computeCivilizationReadinessBreakdown(project)
    const b = computeCivilizationReadinessBreakdown(project)
    expect(a.totalScore).toBe(b.totalScore)
    expect(a.totalScore).toBe(computeCivilizationReadiness(project))
    expect(a.maxScore).toBe(CIVILIZATION_READINESS_MAX)
    expect(a.totalScore).toBeLessThanOrEqual(CIVILIZATION_READINESS_MAX)
    expect(CIVILIZATION_READINESS_POINT_CAPS.identity).toBe(15)
    expect(CIVILIZATION_READINESS_POINT_CAPS.capabilities).toBe(30)
    expect(CIVILIZATION_READINESS_POINT_CAPS.ecosystemSurfaces).toBe(25)
    expect(CIVILIZATION_READINESS_POINT_CAPS.machineReadiness).toBe(15)
    expect(CIVILIZATION_READINESS_POINT_CAPS.multiChain).toBe(10)
    expect(CIVILIZATION_READINESS_POINT_CAPS.trustSignals).toBe(5)
    const weightSum =
      CIVILIZATION_READINESS_WEIGHTS.identity +
      CIVILIZATION_READINESS_WEIGHTS.capabilities +
      CIVILIZATION_READINESS_WEIGHTS.ecosystemSurfaces +
      CIVILIZATION_READINESS_WEIGHTS.machineReadiness +
      CIVILIZATION_READINESS_WEIGHTS.multiChain +
      CIVILIZATION_READINESS_WEIGHTS.trustSignals
    expect(weightSum).toBeCloseTo(1, 10)
    const exact =
      a.achievedPoints.identity +
      a.achievedPoints.capabilities +
      a.achievedPoints.ecosystemSurfaces +
      a.achievedPoints.machineReadiness +
      a.achievedPoints.multiChain +
      a.achievedPoints.trustSignals
    expect(Math.round(exact)).toBe(a.totalScore)

    const doc = readinessFor(project)
    const componentExact = doc.components.reduce((s, c) => s + c.achievedPoints, 0)
    expect(Math.round(componentExact)).toBe(doc.readiness.score)
  })

  it('5–6. readiness state thresholds centralized', () => {
    expect(readinessStateFromScore(0)).toBe('FOUNDATIONAL')
    expect(readinessStateFromScore(24)).toBe('FOUNDATIONAL')
    expect(readinessStateFromScore(25)).toBe('DEVELOPING')
    expect(readinessStateFromScore(50)).toBe('OPERATIONAL')
    expect(readinessStateFromScore(75)).toBe('ADVANCED')
    expect(readinessStateFromScore(90)).toBe('COMPREHENSIVE')
    expect(READINESS_STATE_THRESHOLDS).toHaveLength(5)
    const methodology = buildReadinessMethodology()
    expect(methodology.thresholds).toEqual(
      READINESS_STATE_THRESHOLDS.map((t) => ({
        state: t.state,
        minInclusive: t.minInclusive,
        maxInclusive: t.maxInclusive,
      })),
    )
  })

  it('7–8. complete vs missing optional identity', () => {
    const complete = readinessFor(cloneProject())
    expect(complete.components.find((c) => c.componentId === 'IDENTITY')!.achievedPoints).toBeGreaterThan(0)
    const missing = readinessFor(
      cloneProject({ tagline: undefined, websiteUrl: undefined, docsUrl: undefined, spaceProfileUrl: undefined }),
    )
    expect(missing.readiness.score).toBeLessThanOrEqual(complete.readiness.score)
    expect(missing.components.find((c) => c.componentId === 'IDENTITY')!.unmetCheckIds.length).toBeGreaterThan(0)
  })

  it('9–10. tokenless project not penalized for contracts; multi-asset ok', () => {
    const tokenless = readinessFor(
      cloneProject({
        resources: { tokens: [], liquidityPools: [], farms: [], stakingPools: [] },
        primaryTokenRefs: [],
      }),
    )
    const contracts = tokenless.trustDimensions.find((d) => d.dimensionId === 'CONTRACTS')
    const assets = tokenless.trustDimensions.find((d) => d.dimensionId === 'ASSETS')
    // filtered out when NOT_APPLICABLE — ensure no CONTRACTS penalty warning for tokenless
    expect(contracts === undefined || contracts.availability === 'NOT_APPLICABLE').toBe(true)
    expect(assets === undefined || assets.availability === 'NOT_APPLICABLE').toBe(true)
    expect(
      tokenless.warnings.some((w) => w.category === 'NO_CONTRACT_VERIFICATION_EVIDENCE'),
    ).toBe(false)

    const multi = readinessFor(cloneProject())
    expect(multi.trustSnapshot.assetAndContractEvidenceState).not.toBe('NOT_APPLICABLE')
  })

  it('11–15. chains/resources/evidence de-duplication', () => {
    const one = computeCivilizationReadiness(cloneProject({ supportedChains: [56] }))
    const dupChains = computeCivilizationReadiness(cloneProject({ supportedChains: [56, 56, 56] }))
    expect(dupChains).toBe(one)
    const a = readinessFor(cloneProject())
    const b = readinessFor(cloneProject())
    expect(a.readiness.score).toBe(b.readiness.score)
    expect(a.components).toHaveLength(READINESS_COMPONENT_IDS.length)
  })

  it('16–23. attested/private/stale/conflict/unavailable treatments', () => {
    const doc = readinessFor(cloneProject())
    expect(doc.provenance.notes.join(' ')).toMatch(/public evidence/i)
    // Project-attested must not be described as independent verification in methodology
    expect(doc.methodology.sourceDistinctions).toMatch(/PROJECT_ATTESTED/)
    expect(doc.methodology.privateEvidenceTreatment).toMatch(/Private evidence/)
    expect(doc.methodology.staleEvidenceTreatment).toMatch(/Stale/)
    expect(doc.methodology.conflictTreatment).toMatch(/Conflicted/)
    expect(doc.methodology.notApplicableTreatment).toMatch(/NOT_APPLICABLE/)
  })

  it('24–31. trust dimensions, warnings, severity, IDs', () => {
    const doc = readinessFor(cloneProject())
    expect(doc.trustDimensions.length).toBeGreaterThan(0)
    expect(doc.trustSnapshot.conflictSummary.activeConflictCount).toBe(
      doc.trustSnapshot.conflictSummary.conflictGroupIds.length,
    )
    for (const w of doc.warnings) {
      expect(w.warningId).toMatch(/^warn_/)
      expect(['INFO', 'NOTICE', 'ATTENTION']).toContain(w.severity)
      expect(w.publicExplanation).not.toMatch(/scam|unsafe|high risk|do not invest|trusted|safe project/i)
    }
    // deterministic warning ids
    const again = readinessFor(cloneProject())
    expect(again.warnings.map((w) => w.warningId).sort()).toEqual(doc.warnings.map((w) => w.warningId).sort())
  })

  it('32–35. limitations and forbidden language', () => {
    const doc = readinessFor(cloneProject())
    expect(doc.limitations).toEqual([...READINESS_LIMITATIONS])
    const blob = stringify(doc).toLowerCase()
    expect(blob).not.toMatch(/\bsafe\b/)
    expect(blob).not.toMatch(/\btrusted\b/)
    expect(blob).not.toMatch(/investment grade/)
    expect(blob).not.toMatch(/low risk/)
    expect(READINESS_LIMITATIONS.join(' ')).toMatch(/not a security guarantee/i)
  })

  it('36–40. API load, alias, 404 shape, serialization, private boundary', () => {
    const canonical = loadProjectReadinessDocument('melega-dex', { generatedAt: FIXED_AT })
    const alias = loadProjectReadinessDocument('melega', { generatedAt: FIXED_AT })
    expect(canonical).not.toBeNull()
    expect(alias).not.toBeNull()
    expect(alias!.projectId).toBe(canonical!.projectId)
    expect(alias!.slug).toBe('melega-dex')
    expect(loadProjectReadinessDocument('does-not-exist-zz', { generatedAt: FIXED_AT })).toBeNull()
    expect(canonical!.schemaVersion).toBe(PROJECT_READINESS_SCHEMA_VERSION)
    expect(stringify(canonical)).toBe(stringify(loadProjectReadinessDocument('melega-dex', { generatedAt: FIXED_AT })))
    expect(stringify(canonical)).not.toMatch(/"visibility":"PRIVATE"/)
  })

  it('41–45. PP001/PP002 parity for counts and score', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT, asOf: FIXED_AT })
    expect(loaded).not.toBeNull()
    const project = STATIC_PROJECTS.find((p) => p.slug === 'melega-dex')!
    const readiness = buildProjectReadinessDocument({
      project,
      document: loaded!.document,
      evidencePack: loaded!.evidencePack,
      generatedAt: FIXED_AT,
    })
    const evidenceSummary = toEvidenceSummaryForProjectApi(loaded!.evidencePack)
    const projectJson = toPublicProjectJson(loaded!.document, {
      evidenceSummary,
      readinessSummary: toReadinessSummaryForProjectApi(readiness) as unknown as Record<string, unknown>,
      trustSnapshotSummary: toTrustSnapshotSummaryForProjectApi(readiness) as unknown as Record<
        string,
        unknown
      >,
    })
    expect(projectJson.projectId).toBe(readiness.projectId)
    expect(projectJson.slug).toBe(readiness.slug)
    expect((projectJson.evidenceSummary as { activeConflictCount: number }).activeConflictCount).toBe(
      readiness.trustSnapshot.conflictSummary.activeConflictCount,
    )
    expect((projectJson.evidenceSummary as { staleEvidenceCount: number }).staleEvidenceCount).toBe(
      readiness.trustSnapshot.freshnessSummary.staleCount,
    )
    expect((projectJson.readinessSummary as { score: number }).score).toBe(readiness.readiness.score)
    expect((projectJson.readiness as { value: { score: number } }).value.score).toBe(readiness.readiness.score)
    expect(readiness.readiness.score).toBe(computeCivilizationReadiness(project))
  })

  it('46. methodology/code configuration parity', () => {
    const methodology = buildReadinessMethodology()
    expect(methodology.components.map((c) => c.maxPoints)).toEqual([15, 30, 25, 15, 10, 5])
    expect(methodology.scoreMaximum).toBe(100)
  })

  it('47–55. UI and frozen surface regressions (source contracts)', () => {
    const shell = readFileSync(
      path.resolve(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    const snapshot = readFileSync(
      path.resolve(__dirname, '../../../../../views/ProjectPage/ReadinessTrustSnapshot.tsx'),
      'utf8',
    )
    const apiReadiness = path.resolve(__dirname, '../../../../../pages/api/public/projects/[slug]/readiness.ts')
    expect(existsSync(apiReadiness)).toBe(true)
    expect(shell).toMatch(/ReadinessTrustSnapshot/)
    expect(shell).toMatch(/TrustEvidencePanel/)
    expect(shell).toMatch(/hero-readiness-chip/)
    expect(shell).not.toMatch(/Trusted|Safe project|Approved|Melega recommends|Low risk/i)
    expect(snapshot).toMatch(/aria-valuenow/)
    expect(snapshot).toMatch(/Methodology and limitations/)
    expect(snapshot).toMatch(/<Details/)
    expect(snapshot).not.toMatch(/green shield|investment rating/i)

    // PP001/PP002 regression anchors
    expect(
      existsSync(path.resolve(__dirname, '../../../../../docs/runtime/PP001_CANONICAL_PROJECT_IDENTITY_SHELL_FINAL_REPORT.md')) ||
        existsSync(
          path.resolve(
            __dirname,
            '../../../../../../docs/runtime/PP001_CANONICAL_PROJECT_IDENTITY_SHELL_FINAL_REPORT.md',
          ),
        ),
    ).toBe(true)

    const discovery = readFileSync(path.resolve(__dirname, '../../../discovery.ts'), 'utf8')
    expect(discovery).toMatch(/computeCivilizationReadinessBreakdown/)
    // Frozen DEX pages untouched by this mission — presence only
    expect(existsSync(path.resolve(__dirname, '../../../../../pages/liquidity-studio.tsx'))).toBe(true)
    expect(existsSync(path.resolve(__dirname, '../../../../../pages/farms/index.tsx'))).toBe(true)
    expect(existsSync(path.resolve(__dirname, '../../../../../pages/pools/index.tsx'))).toBe(true)
  })
})
