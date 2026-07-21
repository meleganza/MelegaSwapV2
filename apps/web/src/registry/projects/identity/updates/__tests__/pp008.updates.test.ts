/**
 * PP008 — Project Activity & Verified Updates Hub tests.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import stringify from 'fast-json-stable-stringify'
import { resolveProjectBySlug } from '../../resolveProject'
import { normalizeProjectDocument, toPublicProjectJson, buildProjectJsonLd } from '../../normalizeProject'
import { loadProjectEvidencePack } from '../../evidence'
import { loadProjectReadinessDocument } from '../../readiness'
import { loadProjectMarketsDocument } from '../../markets'
import { loadProjectParticipationDocument } from '../../participation'
import { loadProjectLiquidityBuildingDocument } from '../../liquidityBuilding'
import { buildWalletRelationshipDocument, disconnectedObservation } from '../../walletRelationship'
import {
  UPDATE_AUTHOR_TYPES,
  UPDATE_CATEGORIES,
  UPDATE_STATUSES,
  PROJECT_UPDATES_SCHEMA_VERSION,
  buildUpdateId,
  buildProjectUpdatesDocument,
  loadProjectUpdatesDocument,
  toUpdatesSummaryForProjectApi,
  isUpdateCategory,
  isUpdateAuthorType,
} from '../index'

const FIXED_AT = '2026-07-20T23:00:00.000Z'

describe('PP008 update model and chronology', () => {
  it('1. deterministic update IDs', () => {
    const a = buildUpdateId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.canonical-project-page-identity',
      version: '1.0.0',
      publishedAt: '2026-07-18T16:00:00.000Z',
      category: 'PRODUCT_RELEASE',
    })
    const b = buildUpdateId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.canonical-project-page-identity',
      version: '1.0.0',
      publishedAt: '2026-07-18T16:00:00.000Z',
      category: 'PRODUCT_RELEASE',
    })
    expect(a).toBe(b)
    expect(a.startsWith('upd_')).toBe(true)
  })

  it('2. chronology ordering newest first', () => {
    const doc = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    expect(doc.updates.length).toBeGreaterThanOrEqual(4)
    for (let i = 1; i < doc.updates.length; i += 1) {
      expect(doc.updates[i - 1].publishedAt >= doc.updates[i].publishedAt).toBe(true)
    }
  })

  it('3. revision handling', () => {
    const doc = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    for (const u of doc.updates) {
      expect(u.revision).toMatch(/^[0-9a-f]{8}$/)
      expect(u.version).toBeTruthy()
    }
    expect(doc.updatesRevision).toMatch(/^[0-9a-f]{8}$/)
  })

  it('4–6. superseded, archived, retracted remain in timeline', () => {
    const doc = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    const statuses = new Set(doc.updates.map((u) => u.status))
    expect(statuses.has('SUPERSEDED')).toBe(true)
    expect(statuses.has('ARCHIVED')).toBe(true)
    expect(statuses.has('RETRACTED')).toBe(true)
    expect(statuses.has('ACTIVE')).toBe(true)
    const superseded = doc.updates.find((u) => u.status === 'SUPERSEDED')!
    const successor = doc.updates.find((u) => u.supersedesUpdate === superseded.updateId)
    expect(successor).toBeTruthy()
  })

  it('7–8. category and author validation', () => {
    expect(isUpdateCategory('LIQUIDITY_BUILDING')).toBe(true)
    expect(isUpdateCategory('TWEET')).toBe(false)
    expect(isUpdateAuthorType('MELEGA')).toBe(true)
    expect(isUpdateAuthorType('PERSON')).toBe(false)
    expect(UPDATE_CATEGORIES.length).toBeGreaterThan(10)
    expect(UPDATE_AUTHOR_TYPES).toEqual(['PROJECT', 'MELEGA', 'AUTOMATED_RUNTIME', 'UNKNOWN'])
    expect(UPDATE_STATUSES).toEqual(['ACTIVE', 'SUPERSEDED', 'RETRACTED', 'ARCHIVED'])
    const doc = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    for (const u of doc.updates) {
      expect(isUpdateCategory(u.category)).toBe(true)
      expect(isUpdateAuthorType(u.authorType)).toBe(true)
    }
  })

  it('9–10. provenance reuse and evidence references', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const doc = buildProjectUpdatesDocument({
      project: resolveProjectBySlug('melega-dex').ok
        ? (resolveProjectBySlug('melega-dex') as Extract<ReturnType<typeof resolveProjectBySlug>, { ok: true }>).project
        : (null as never),
      document: loaded.document,
      evidencePack: loaded.evidencePack,
      generatedAt: FIXED_AT,
    })
    expect(doc.schemaVersion).toBe(PROJECT_UPDATES_SCHEMA_VERSION)
    const withEvidence = doc.updates.filter((u) => u.evidenceIds.length > 0)
    expect(withEvidence.length).toBeGreaterThan(0)
    const publicIds = new Set(
      loaded.evidencePack.evidence.filter((e) => e.visibility === 'PUBLIC').map((e) => e.evidenceId),
    )
    for (const u of withEvidence) {
      for (const id of u.evidenceIds) {
        expect(publicIds.has(id)).toBe(true)
      }
      expect(u.verification.state).not.toBeUndefined()
      expect(u.provenance.sourceClass).toBeTruthy()
    }
  })

  it('11. public API serialization shape', () => {
    const doc = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    const body = stringify(doc)
    expect(body).toContain('melega.project-updates.v1')
    expect(body).toContain('updatesRevision')
    expect(body).not.toMatch(/likeCount|reaction|commentThread|discord/i)
    expect(body).not.toContain('<script')
  })

  it('12. PP001 summary extension', () => {
    const doc = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    const summary = toUpdatesSummaryForProjectApi(doc)
    expect(summary.totalPublicUpdates).toBe(doc.summary.totalPublicUpdates)
    expect(summary.endpoint).toBe('/api/public/projects/melega-dex/updates/')
    expect(summary.latestPublishedAt).toBe(doc.summary.latestPublishedAt)
    expect(summary.categoriesPresent.length).toBeGreaterThan(0)
    expect(Object.keys(summary).sort()).toEqual(
      [
        'categoriesPresent',
        'endpoint',
        'extension',
        'latestPublishedAt',
        'revision',
        'schemaVersion',
        'totalPublicUpdates',
      ].sort(),
    )
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const body = stringify(
      toPublicProjectJson(loaded.document, {
        updatesSummary: summary as unknown as Record<string, unknown>,
      }),
    )
    expect(body).toContain('updatesSummary')
    expect(stringify(buildProjectJsonLd(loaded.document))).not.toContain('updatesSummary')
  })

  it('13–15. HTML/API parity, accessibility, responsive contracts', () => {
    const ui = readFileSync(path.join(__dirname, '../../../../../views/ProjectPage/ProjectUpdatesSection.tsx'), 'utf8')
    expect(ui).toContain('Latest Updates')
    expect(ui).toContain('Read update')
    expect(ui).toContain('<time dateTime=')
    expect(ui).toContain('aria-labelledby="updates-heading"')
    expect(ui).toContain('flex-direction: column')
    expect(ui).not.toMatch(/likeCount|onLike|reactionButton|commentThread/)
    expect(ui).not.toContain('dangerouslySetInnerHTML')

    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('ProjectUpdatesSection')
    expect(shell).toContain('project-updates-slot')
    const participateIdx = shell.indexOf('project-participate-slot')
    const updatesIdx = shell.indexOf('project-updates-slot')
    const trustIdx = shell.indexOf('project-trust-state')
    expect(updatesIdx).toBeGreaterThan(participateIdx)
    expect(trustIdx).toBeGreaterThan(updatesIdx)
  })
})

describe('PP008 regressions PP001–PP007', () => {
  it('16–22. prior missions remain loadable', () => {
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

    expect(existsSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/updates.ts'))).toBe(true)
    const hq = readFileSync(path.join(__dirname, '../../../../../pages/project-hq/[slug].tsx'), 'utf8')
    expect(hq).toContain('updatesDocument')
    expect(hq).toContain('updatesAlternate')
    const publicApi = readFileSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug].ts'), 'utf8')
    expect(publicApi).toContain('updatesSummary')
  })

  it('content sanitization strips HTML', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const resolved = resolveProjectBySlug('melega-dex')
    if (!resolved.ok) throw new Error('expected melega-dex')
    const doc = buildProjectUpdatesDocument({
      project: resolved.project,
      document: loaded.document,
      evidencePack: loaded.evidencePack,
      generatedAt: FIXED_AT,
    })
    for (const u of doc.updates) {
      expect(u.title).not.toMatch(/<|>/)
      expect(u.summary).not.toMatch(/<|>/)
      expect(u.content).not.toMatch(/<|>/)
    }
  })

  it('alias parity', () => {
    const a = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    const b = loadProjectUpdatesDocument('melega', FIXED_AT)!
    expect(a.projectId).toBe(b.projectId)
    expect(stringify(a.updates.map((u) => u.updateId))).toBe(stringify(b.updates.map((u) => u.updateId)))
  })
})
