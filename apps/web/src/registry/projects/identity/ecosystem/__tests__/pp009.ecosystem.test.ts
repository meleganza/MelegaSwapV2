/**
 * PP009 — Project Ecosystem & Utilities Graph tests.
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
import { buildWalletRelationshipDocument, disconnectedObservation } from '../../walletRelationship'
import {
  PROJECT_ECOSYSTEM_SCHEMA_VERSION,
  SERVICE_CATEGORIES,
  SERVICE_LIFECYCLES,
  SERVICE_TYPES,
  buildServiceId,
  isServiceCategory,
  isServiceLifecycle,
  isServiceType,
  loadProjectEcosystemDocument,
  toEcosystemSummaryForProjectApi,
} from '../index'

const FIXED_AT = '2026-07-20T23:30:00.000Z'

describe('PP009 ecosystem model', () => {
  it('1. deterministic service IDs', () => {
    const a = buildServiceId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.service.trade',
      category: 'DEX',
      type: 'WEB_APP',
    })
    const b = buildServiceId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.service.trade',
      category: 'DEX',
      type: 'WEB_APP',
    })
    expect(a).toBe(b)
    expect(a.startsWith('svc_')).toBe(true)
  })

  it('2–4. category, type, lifecycle validation', () => {
    expect(isServiceCategory('DEX')).toBe(true)
    expect(isServiceCategory('TWEET')).toBe(false)
    expect(isServiceType('WEB_APP')).toBe(true)
    expect(isServiceType('UNKNOWN_TYPE')).toBe(false)
    expect(isServiceLifecycle('ACTIVE')).toBe(true)
    expect(isServiceLifecycle('LIVE')).toBe(false)
    expect(SERVICE_CATEGORIES.length).toBeGreaterThan(10)
    expect(SERVICE_TYPES).toContain('RUNTIME')
    expect(SERVICE_LIFECYCLES).toContain('PLANNED')
  })

  it('5. service ordering prefers ACTIVE then category/title', () => {
    const doc = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    expect(doc.services.length).toBeGreaterThan(5)
    const firstActiveIdx = doc.services.findIndex((s) => s.lifecycle === 'ACTIVE')
    const firstPlannedIdx = doc.services.findIndex((s) => s.lifecycle === 'PLANNED')
    expect(firstActiveIdx).toBeGreaterThanOrEqual(0)
    if (firstPlannedIdx >= 0) expect(firstActiveIdx).toBeLessThan(firstPlannedIdx)
  })

  it('6. public API shape', () => {
    const doc = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    expect(doc.schemaVersion).toBe(PROJECT_ECOSYSTEM_SCHEMA_VERSION)
    const body = stringify(doc)
    expect(body).toContain('relationships')
    expect(body).toContain('ecosystemRevision')
    expect(body).not.toMatch(/tvlUsd|apr|likeCount|screenshot/i)
  })

  it('7. PP001 summary extension', () => {
    const doc = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    const summary = toEcosystemSummaryForProjectApi(doc)
    expect(summary.activeServiceCount).toBe(doc.summary.activeServiceCount)
    expect(summary.endpoint).toBe('/api/public/projects/melega-dex/ecosystem/')
    expect(Object.keys(summary.categoryCounts).length).toBeGreaterThan(0)
    expect(Object.keys(summary).sort()).toEqual(
      ['activeServiceCount', 'categoryCounts', 'endpoint', 'extension', 'revision', 'schemaVersion'].sort(),
    )
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const body = stringify(
      toPublicProjectJson(loaded.document, {
        ecosystemSummary: summary as unknown as Record<string, unknown>,
      }),
    )
    expect(body).toContain('ecosystemSummary')
    expect(stringify(buildProjectJsonLd(loaded.document))).not.toContain('ecosystemSummary')
  })

  it('8. HTML/API parity contracts', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectEcosystemSection.tsx'),
      'utf8',
    )
    expect(ui).toContain('Ecosystem')
    expect(ui).toContain('GROUP_LABELS')
    expect(ui).toContain('ECOSYSTEM_GROUP_KEYS')
    expect(ui).toContain('service-open')
    expect(ui).toContain('Supported chains and deployments')
    expect(ui).not.toContain('dangerouslySetInnerHTML')
    expect(ui).not.toMatch(/screenshot|tvlUsd|\"apr\"/i)
  })

  it('9. relationships exposed', () => {
    const doc = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    expect(doc.relationships.length).toBeGreaterThan(0)
    for (const rel of doc.relationships) {
      expect(rel.relationId.startsWith('rel_')).toBe(true)
      expect(doc.services.some((s) => s.serviceId === rel.fromServiceId)).toBe(true)
      expect(doc.services.some((s) => s.serviceId === rel.toServiceId)).toBe(true)
    }
  })

  it('10–11. provenance and evidence', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const doc = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    const withEvidence = doc.services.filter((s) => s.evidenceIds.length > 0)
    expect(withEvidence.length).toBeGreaterThan(0)
    const publicIds = new Set(
      loaded.evidencePack.evidence.filter((e) => e.visibility === 'PUBLIC').map((e) => e.evidenceId),
    )
    for (const svc of withEvidence) {
      expect(svc.provenance.sourceClass).toBeTruthy()
      for (const id of svc.evidenceIds) expect(publicIds.has(id)).toBe(true)
    }
  })

  it('12. updates integration via relatedUpdateIds', () => {
    const updates = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    const eco = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    const trade = eco.services.find((s) => s.stableKey === 'melega-dex.service.trade')!
    expect(trade.relatedUpdateIds.length).toBeGreaterThan(0)
    expect(updates.updates.some((u) => trade.relatedUpdateIds.includes(u.updateId))).toBe(true)
  })

  it('13–14. accessibility and responsive contracts', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectEcosystemSection.tsx'),
      'utf8',
    )
    expect(ui).toContain('aria-labelledby="ecosystem-heading"')
    expect(ui).toContain('flex-direction: column')
    expect(ui).toContain('<time dateTime=')
    expect(ui).toContain('min-height: 44px')
    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('ProjectEcosystemSection')
    expect(shell).toContain('project-ecosystem-slot')
  })

  it('never invents ACTIVE for planned-only capabilities', () => {
    const doc = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    const radar = doc.services.find((s) => s.stableKey === 'melega-dex.service.radar')!
    expect(radar.lifecycle).toBe('PLANNED')
    const smartdrop = doc.services.find((s) => s.stableKey === 'melega-dex.service.smartdrop')!
    expect(smartdrop.lifecycle).toBe('UNAVAILABLE')
    const trade = doc.services.find((s) => s.stableKey === 'melega-dex.service.trade')!
    expect(trade.lifecycle).toBe('ACTIVE')
  })
})

describe('PP009 regressions PP001–PP008', () => {
  it('15–22. prior missions remain loadable', () => {
    expect(resolveProjectBySlug('melega-dex').ok).toBe(true)
    expect(loadProjectEvidencePack('melega-dex')).not.toBeNull()
    expect(loadProjectReadinessDocument('melega-dex')).not.toBeNull()
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const wr = buildWalletRelationshipDocument({
      document: loaded.document,
      evidencePack: loaded.evidencePack,
      observation: disconnectedObservation(FIXED_AT),
      generatedAt: FIXED_AT,
    })
    expect(wr.status).toBe('DISCONNECTED')
    expect(loadProjectMarketsDocument('melega-dex')).not.toBeNull()
    expect(loadProjectParticipationDocument('melega-dex')).not.toBeNull()
    expect(loadProjectLiquidityBuildingDocument('melega-dex')).not.toBeNull()
    expect(loadProjectUpdatesDocument('melega-dex')).not.toBeNull()
    expect(loadProjectEcosystemDocument('melega-dex')).not.toBeNull()

    expect(existsSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/ecosystem.ts'))).toBe(true)
    const hq = readFileSync(path.join(__dirname, '../../../../../pages/project-hq/[slug].tsx'), 'utf8')
    expect(hq).toContain('ecosystemDocument')
    expect(hq).toContain('ecosystemAlternate')
    const publicApi = readFileSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug].ts'), 'utf8')
    expect(publicApi).toContain('ecosystemSummary')
    expect(publicApi).toContain('updatesSummary')
  })

  it('alias parity', () => {
    const a = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    const b = loadProjectEcosystemDocument('melega', FIXED_AT)!
    expect(a.projectId).toBe(b.projectId)
    expect(stringify(a.services.map((s) => s.serviceId))).toBe(stringify(b.services.map((s) => s.serviceId)))
  })
})
