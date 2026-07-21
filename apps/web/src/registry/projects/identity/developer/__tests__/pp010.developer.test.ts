/**
 * PP010 — Developer & Documentation Hub tests.
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
import { buildWalletRelationshipDocument, disconnectedObservation } from '../../walletRelationship'
import {
  PROJECT_DEVELOPER_SCHEMA_VERSION,
  DEVELOPER_RESOURCE_CATEGORIES,
  DEVELOPER_RESOURCE_LIFECYCLES,
  DEVELOPER_RESOURCE_TYPES,
  buildDeveloperResourceId,
  isDeveloperResourceCategory,
  isDeveloperResourceLifecycle,
  isDeveloperResourceType,
  loadProjectDeveloperDocument,
  toDeveloperSummaryForProjectApi,
} from '../index'

const FIXED_AT = '2026-07-21T00:00:00.000Z'

describe('PP010 developer hub model', () => {
  it('1. deterministic resource IDs', () => {
    const a = buildDeveloperResourceId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.dev.api.project-page',
      category: 'API',
      version: '1.0.0',
    })
    const b = buildDeveloperResourceId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.dev.api.project-page',
      category: 'API',
      version: '1.0.0',
    })
    expect(a).toBe(b)
    expect(a.startsWith('dev_')).toBe(true)
  })

  it('2–4. category, type, lifecycle validation', () => {
    expect(isDeveloperResourceCategory('API')).toBe(true)
    expect(isDeveloperResourceCategory('TWEET')).toBe(false)
    expect(isDeveloperResourceType('ENDPOINT')).toBe(true)
    expect(isDeveloperResourceType('BLOB')).toBe(false)
    expect(isDeveloperResourceLifecycle('ACTIVE')).toBe(true)
    expect(isDeveloperResourceLifecycle('LIVE')).toBe(false)
    expect(DEVELOPER_RESOURCE_CATEGORIES).toContain('MCP')
    expect(DEVELOPER_RESOURCE_TYPES).toContain('OPENAPI')
    expect(DEVELOPER_RESOURCE_LIFECYCLES).toContain('PLANNED')
  })

  it('5. version handling', () => {
    const doc = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    for (const r of doc.resources) {
      expect(r.version).toBeTruthy()
      expect(r.revision).toMatch(/^[0-9a-f]{8}$/)
    }
  })

  it('6. public API shape', () => {
    const doc = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    expect(doc.schemaVersion).toBe(PROJECT_DEVELOPER_SCHEMA_VERSION)
    const body = stringify(doc)
    expect(body).toContain('relationships')
    expect(body).toContain('developerRevision')
    expect(body).not.toMatch(/apiKey|privateKey|webhookSecret/i)
  })

  it('7. PP001 summary extension', () => {
    const doc = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    const summary = toDeveloperSummaryForProjectApi(doc)
    expect(summary.endpoint).toBe('/api/public/projects/melega-dex/developer/')
    expect(Object.keys(summary.categoryCounts).length).toBeGreaterThan(0)
    expect(Object.keys(summary.resourceCounts).length).toBeGreaterThan(0)
    expect(Object.keys(summary).sort()).toEqual(
      ['categoryCounts', 'endpoint', 'extension', 'resourceCounts', 'revision', 'schemaVersion'].sort(),
    )
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    expect(
      stringify(
        toPublicProjectJson(loaded.document, {
          developerSummary: summary as unknown as Record<string, unknown>,
        }),
      ),
    ).toContain('developerSummary')
    expect(stringify(buildProjectJsonLd(loaded.document))).not.toContain('developerSummary')
  })

  it('8. HTML/API parity', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectDeveloperSection.tsx'),
      'utf8',
    )
    expect(ui).toContain('Developer')
    expect(ui).toContain('DEVELOPER_GROUP_KEYS')
    expect(ui).toContain('resource-open')
    expect(ui).not.toContain('dangerouslySetInnerHTML')
  })

  it('9. relationships exposed', () => {
    const doc = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    expect(doc.relationships.length).toBeGreaterThan(0)
    for (const rel of doc.relationships) {
      expect(rel.relationId.startsWith('drel_')).toBe(true)
      expect(doc.resources.some((r) => r.resourceId === rel.fromResourceId)).toBe(true)
      expect(doc.resources.some((r) => r.resourceId === rel.toResourceId)).toBe(true)
    }
  })

  it('10–11. provenance and evidence', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const doc = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    const withEvidence = doc.resources.filter((r) => r.evidenceIds.length > 0)
    expect(withEvidence.length).toBeGreaterThan(0)
    const publicIds = new Set(
      loaded.evidencePack.evidence.filter((e) => e.visibility === 'PUBLIC').map((e) => e.evidenceId),
    )
    for (const r of withEvidence) {
      expect(r.provenance.sourceClass).toBeTruthy()
      for (const id of r.evidenceIds) expect(publicIds.has(id)).toBe(true)
    }
  })

  it('12. ecosystem integration via relatedServiceIds', () => {
    const eco = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    const dev = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    const marketsApi = dev.resources.find((r) => r.stableKey === 'melega-dex.dev.api.markets')!
    expect(marketsApi.relatedServiceIds.length).toBeGreaterThan(0)
    expect(eco.services.some((s) => marketsApi.relatedServiceIds.includes(s.serviceId))).toBe(true)
  })

  it('13. updates integration via relatedUpdateIds', () => {
    const updates = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    const dev = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    const withUpdates = dev.resources.find((r) => r.relatedUpdateIds.length > 0)!
    expect(updates.updates.some((u) => withUpdates.relatedUpdateIds.includes(u.updateId))).toBe(true)
  })

  it('14–15. accessibility and responsive contracts', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectDeveloperSection.tsx'),
      'utf8',
    )
    expect(ui).toContain('aria-labelledby="developer-heading"')
    expect(ui).toContain('flex-direction: column')
    expect(ui).toContain('<time dateTime=')
    expect(ui).toContain('min-height: 44px')
    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('ProjectDeveloperSection')
    expect(shell).toContain('project-developer-slot')
  })

  it('honest AI / OpenAPI states', () => {
    const doc = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    expect(doc.resources.find((r) => r.stableKey === 'melega-dex.dev.openapi')!.lifecycle).toBe('UNAVAILABLE')
    expect(doc.resources.find((r) => r.stableKey === 'melega-dex.dev.mcp')!.lifecycle).toBe('UNAVAILABLE')
    expect(doc.resources.find((r) => r.stableKey === 'melega-dex.dev.agent-discovery')!.lifecycle).toBe('ACTIVE')
    expect(doc.resources.find((r) => r.stableKey === 'melega-dex.dev.api.project-page')!.lifecycle).toBe('ACTIVE')
  })
})

describe('PP010 regressions PP001–PP009', () => {
  it('16–24. prior missions remain loadable', () => {
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

    expect(existsSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/developer.ts'))).toBe(true)
    const hq = readFileSync(path.join(__dirname, '../../../../../pages/project-hq/[slug].tsx'), 'utf8')
    expect(hq).toContain('developerDocument')
    expect(hq).toContain('developerAlternate')
    const publicApi = readFileSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug].ts'), 'utf8')
    expect(publicApi).toContain('developerSummary')
    expect(publicApi).toContain('ecosystemSummary')
  })

  it('alias parity', () => {
    const a = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    const b = loadProjectDeveloperDocument('melega', FIXED_AT)!
    expect(a.projectId).toBe(b.projectId)
    expect(stringify(a.resources.map((r) => r.resourceId))).toBe(stringify(b.resources.map((r) => r.resourceId)))
  })
})
