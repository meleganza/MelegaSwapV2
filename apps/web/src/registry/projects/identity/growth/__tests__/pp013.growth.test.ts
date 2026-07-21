/**
 * PP013 — Project Growth Hub tests.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import stringify from 'fast-json-stable-stringify'
import { resolveProjectBySlug } from '../../resolveProject'
import { toPublicProjectJson, buildProjectJsonLd } from '../../normalizeProject'
import { loadProjectEvidencePack } from '../../evidence'
import { loadProjectReadinessDocument } from '../../readiness'
import { loadProjectMarketsDocument } from '../../markets'
import { loadProjectParticipationDocument } from '../../participation'
import { loadProjectLiquidityBuildingDocument } from '../../liquidityBuilding'
import { loadProjectUpdatesDocument } from '../../updates'
import { loadProjectEcosystemDocument } from '../../ecosystem'
import { loadProjectDeveloperDocument } from '../../developer'
import { loadProjectGovernanceDocument } from '../../governance'
import { loadProjectControlCenterDocument } from '../../controlCenter'
import { buildWalletRelationshipDocument, disconnectedObservation } from '../../walletRelationship'
import {
  GROWTH_PROGRAM_CATEGORIES,
  GROWTH_PROGRAM_STATUSES,
  PROJECT_GROWTH_SCHEMA_VERSION,
  buildGrowthProgramId,
  isGrowthProgramCategory,
  isGrowthProgramStatus,
  loadProjectGrowthDocument,
  toGrowthSummaryForProjectApi,
} from '../index'

const FIXED_AT = '2026-07-21T00:00:00.000Z'

describe('PP013 growth hub', () => {
  it('deterministic program IDs', () => {
    const a = buildGrowthProgramId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.growth.smartdrop',
      category: 'SMARTDROP',
      type: 'CAMPAIGN',
    })
    const b = buildGrowthProgramId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.growth.smartdrop',
      category: 'SMARTDROP',
      type: 'CAMPAIGN',
    })
    expect(a).toBe(b)
    expect(a.startsWith('grp_')).toBe(true)
  })

  it('category validation', () => {
    expect(isGrowthProgramCategory('SMARTDROP')).toBe(true)
    expect(isGrowthProgramCategory('REFERRAL')).toBe(true)
    expect(isGrowthProgramCategory('TWEET')).toBe(false)
    expect(GROWTH_PROGRAM_CATEGORIES).toContain('LIQUIDITY_INCENTIVE')
    expect(GROWTH_PROGRAM_CATEGORIES).toContain('ONBOARDING')
  })

  it('status validation — never invent ACTIVE', () => {
    expect(isGrowthProgramStatus('ACTIVE')).toBe(true)
    expect(isGrowthProgramStatus('PLANNED')).toBe(true)
    expect(isGrowthProgramStatus('LIVE')).toBe(false)
    expect(GROWTH_PROGRAM_STATUSES).toContain('UNAVAILABLE')
    const doc = loadProjectGrowthDocument('melega-dex', FIXED_AT)!
    expect(doc.summary.activeProgramCount).toBe(0)
    expect(doc.programs.every((p) => p.status !== 'ACTIVE')).toBe(true)
    expect(doc.programs.find((p) => p.stableKey === 'melega-dex.growth.smartdrop')!.status).toBe('UNAVAILABLE')
  })

  it('public API shape', () => {
    const doc = loadProjectGrowthDocument('melega-dex', FIXED_AT)!
    expect(doc.schemaVersion).toBe(PROJECT_GROWTH_SCHEMA_VERSION)
    const body = stringify(doc)
    expect(body).toContain('programs')
    expect(body).toContain('categories')
    expect(body).toContain('relationships')
    expect(body).not.toMatch(/"participants"|"impressions"|"conversionRate"|"rewardAmount"/i)
    expect(body).not.toMatch(/apiKey|privateKey|webhookSecret/i)
  })

  it('PP001 summary extension', () => {
    const doc = loadProjectGrowthDocument('melega-dex', FIXED_AT)!
    const summary = toGrowthSummaryForProjectApi(doc)
    expect(summary.endpoint).toBe('/api/public/projects/melega-dex/growth/')
    expect(summary.programCount).toBeGreaterThan(0)
    expect(summary.activeProgramCount).toBe(0)
    expect(Object.keys(summary).sort()).toEqual(
      ['activeProgramCount', 'endpoint', 'extension', 'programCount', 'revision', 'schemaVersion'].sort(),
    )
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    expect(
      stringify(
        toPublicProjectJson(loaded.document, {
          growthSummary: summary as unknown as Record<string, unknown>,
        }),
      ),
    ).toContain('growthSummary')
    expect(stringify(buildProjectJsonLd(loaded.document))).not.toContain('growthSummary')
  })

  it('relationships exposed', () => {
    const doc = loadProjectGrowthDocument('melega-dex', FIXED_AT)!
    expect(doc.relationships.length).toBeGreaterThan(0)
    const sectionLinks = doc.relationships.filter((r) => r.relationType === 'LINKS_SECTION')
    expect(sectionLinks.length).toBeGreaterThan(0)
    const eco = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    const serviceLinks = doc.relationships.filter((r) => r.relationType === 'LINKS_SERVICE')
    expect(serviceLinks.length).toBeGreaterThan(0)
    expect(eco.services.some((s) => serviceLinks.some((r) => r.toId === s.serviceId))).toBe(true)
  })

  it('HTML/API parity and no metrics', () => {
    const ui = readFileSync(path.join(__dirname, '../../../../../views/ProjectPage/ProjectGrowthSection.tsx'), 'utf8')
    expect(ui).toContain('Growth')
    expect(ui).toContain('GROWTH_GROUP_KEYS')
    expect(ui).toContain('growth-open')
    expect(ui).toContain('intentionally not shown')
    expect(ui).not.toContain('dangerouslySetInnerHTML')
    expect(ui).not.toMatch(/participantsCount|impressions|conversionRate/i)
  })

  it('accessibility and responsive contracts', () => {
    const ui = readFileSync(path.join(__dirname, '../../../../../views/ProjectPage/ProjectGrowthSection.tsx'), 'utf8')
    expect(ui).toContain('aria-labelledby="growth-heading"')
    expect(ui).toContain('flex-direction: column')
    expect(ui).toContain('<time dateTime=')
    expect(ui).toContain('min-height: 44px')
    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('ProjectGrowthSection')
    expect(shell).toContain('project-growth-slot')
  })

  it('updates and developer integration', () => {
    const growth = loadProjectGrowthDocument('melega-dex', FIXED_AT)!
    const updates = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    const developer = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    const onboarding = growth.programs.find((p) => p.stableKey === 'melega-dex.growth.onboarding')!
    expect(onboarding.relatedUpdateIds.length).toBeGreaterThan(0)
    expect(updates.updates.some((u) => onboarding.relatedUpdateIds.includes(u.updateId))).toBe(true)
    expect(onboarding.relatedDeveloperResourceIds.length).toBeGreaterThan(0)
    expect(developer.resources.some((r) => onboarding.relatedDeveloperResourceIds.includes(r.resourceId))).toBe(true)
  })
})

describe('PP013 regressions PP001–PP012', () => {
  it('prior missions remain loadable', () => {
    expect(resolveProjectBySlug('melega-dex').ok).toBe(true)
    expect(loadProjectEvidencePack('melega-dex')).not.toBeNull()
    expect(loadProjectReadinessDocument('melega-dex')).not.toBeNull()
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    expect(
      buildWalletRelationshipDocument({
        document: loaded.document,
        evidencePack: loaded.evidencePack,
        observation: disconnectedObservation(FIXED_AT),
        generatedAt: FIXED_AT,
      }).status,
    ).toBe('DISCONNECTED')
    expect(loadProjectMarketsDocument('melega-dex')).not.toBeNull()
    expect(loadProjectParticipationDocument('melega-dex')).not.toBeNull()
    expect(loadProjectLiquidityBuildingDocument('melega-dex')).not.toBeNull()
    expect(loadProjectUpdatesDocument('melega-dex')).not.toBeNull()
    expect(loadProjectEcosystemDocument('melega-dex')).not.toBeNull()
    expect(loadProjectDeveloperDocument('melega-dex')).not.toBeNull()
    expect(loadProjectGovernanceDocument('melega-dex')).not.toBeNull()
    expect(loadProjectControlCenterDocument('melega-dex')).not.toBeNull()
    expect(loadProjectGrowthDocument('melega-dex')).not.toBeNull()

    expect(existsSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/growth.ts'))).toBe(true)
    const hq = readFileSync(path.join(__dirname, '../../../../../pages/project-hq/[slug].tsx'), 'utf8')
    expect(hq).toContain('growthDocument')
    expect(hq).toContain('growthAlternate')
    const publicApi = readFileSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug].ts'), 'utf8')
    expect(publicApi).toContain('growthSummary')
    expect(publicApi).toContain('controlCenterSummary')
  })

  it('alias parity', () => {
    const a = loadProjectGrowthDocument('melega-dex', FIXED_AT)!
    const b = loadProjectGrowthDocument('melega', FIXED_AT)!
    expect(a.projectId).toBe(b.projectId)
    expect(stringify(a.programs.map((p) => p.programId))).toBe(stringify(b.programs.map((p) => p.programId)))
  })
})
