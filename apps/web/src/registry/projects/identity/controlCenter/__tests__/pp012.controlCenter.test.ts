/**
 * PP012 — Project Control Center tests.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import stringify from 'fast-json-stable-stringify'
import type { NextApiRequest } from 'next'
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
import { buildWalletRelationshipDocument, disconnectedObservation } from '../../walletRelationship'
import {
  CLAIM_STATES,
  OWNER_PERMISSIONS,
  OWNER_ROLES,
  PROJECT_CONTROL_CENTER_SCHEMA_VERSION,
  ROLE_PERMISSIONS,
  authenticateControlCenterRequest,
  buildOwnerId,
  isClaimState,
  isOwnerPermission,
  isOwnerRole,
  listAuditRecords,
  loadProjectControlCenterDocument,
  permissionsForRoles,
  resetAuditForTests,
  resetRateLimitForTests,
  resetStagingForTests,
  stageDeveloperMutation,
  stageEcosystemMutation,
  stageProfileMutation,
  stageResourceMutation,
  stageUpdatePublication,
  toControlCenterSummaryForProjectApi,
} from '../index'
import type { ControlCenterAuthContext } from '../types'

const FIXED_AT = '2026-07-21T12:00:00.000Z'
const SECRET = 'pp012-test-operator-secret-key'

function mockReq(headers: Record<string, string> = {}): NextApiRequest {
  return { headers, method: 'GET', query: {}, socket: { remoteAddress: '127.0.0.1' } } as unknown as NextApiRequest
}

function ownerAuth(slug = 'melega-dex'): ControlCenterAuthContext {
  const loaded = loadProjectEvidencePack(slug, { generatedAt: FIXED_AT })!
  const auth = authenticateControlCenterRequest({
    req: mockReq({
      authorization: `Bearer ${SECRET}`,
      'x-melega-owner-key': 'melega-dex.owner.platform-operator',
    }),
    projectId: loaded.document.projectId,
    slug: loaded.document.slug,
  })
  expect(auth.authorized).toBe(true)
  return auth as ControlCenterAuthContext
}

beforeEach(() => {
  process.env.PROJECT_CONTROL_OPERATOR_SECRET = SECRET
  resetStagingForTests()
  resetAuditForTests()
  resetRateLimitForTests()
})

describe('PP012 control center', () => {
  it('claim lifecycle vocabulary', () => {
    expect(isClaimState('UNCLAIMED')).toBe(true)
    expect(isClaimState('CLAIMED')).toBe(true)
    expect(isClaimState('VERIFIED')).toBe(true)
    expect(isClaimState('OWNED')).toBe(false)
    expect(CLAIM_STATES).toContain('CLAIM_PENDING')
    const doc = loadProjectControlCenterDocument('melega-dex', FIXED_AT)!
    expect(doc.claimState).toBe('CLAIMED')
  })

  it('roles and permissions matrix', () => {
    expect(isOwnerRole('OWNER')).toBe(true)
    expect(isOwnerRole('SUPERUSER')).toBe(false)
    expect(isOwnerPermission('EDIT_PROFILE')).toBe(true)
    expect(isOwnerPermission('EXECUTE_TREASURY')).toBe(false)
    expect(OWNER_ROLES).toContain('PUBLISHER')
    expect(OWNER_PERMISSIONS).toContain('VIEW_AUDIT')
    expect(ROLE_PERMISSIONS.AUDITOR).toEqual(['VIEW_AUDIT'])
    expect(permissionsForRoles(['PUBLISHER'])).toEqual(['EDIT_RESOURCES', 'PUBLISH_UPDATE'].sort())
  })

  it('deterministic owner IDs', () => {
    const a = buildOwnerId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.owner.platform-operator',
      identityType: 'OPERATOR',
    })
    const b = buildOwnerId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.owner.platform-operator',
      identityType: 'OPERATOR',
    })
    expect(a).toBe(b)
    expect(a.startsWith('ownr_')).toBe(true)
  })

  it('authentication required', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const denied = authenticateControlCenterRequest({
      req: mockReq({}),
      projectId: loaded.document.projectId,
      slug: 'melega-dex',
    })
    expect(denied.authorized).toBe(false)
    if (denied.authorized !== true) expect(denied.reasonCode).toBe('UNAUTHORIZED')

    const ok = authenticateControlCenterRequest({
      req: mockReq({ authorization: `Bearer ${SECRET}` }),
      projectId: loaded.document.projectId,
      slug: 'melega-dex',
    })
    expect(ok.authorized).toBe(true)
  })

  it('server-side permission enforcement', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const auditor = authenticateControlCenterRequest({
      req: mockReq({
        authorization: `Bearer ${SECRET}`,
        'x-melega-owner-key': 'melega-dex.owner.auditor',
      }),
      projectId: loaded.document.projectId,
      slug: 'melega-dex',
    })
    expect(auditor.authorized).toBe(true)
    if (auditor.authorized !== true) return
    const denied = stageProfileMutation({
      projectId: loaded.document.projectId,
      slug: 'melega-dex',
      auth: auditor,
      payload: { displayName: 'Nope' },
      now: FIXED_AT,
    })
    expect(denied.ok).toBe(false)
    if (denied.ok !== true) expect(denied.reasonCode).toBe('INVALID_PERMISSION')
  })

  it('profile editing stages draft + audit', () => {
    const auth = ownerAuth()
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const result = stageProfileMutation({
      projectId: loaded.document.projectId,
      slug: 'melega-dex',
      auth,
      payload: { displayName: 'Melega DEX Staged', summary: 'Staged summary' },
      now: FIXED_AT,
    })
    expect(result.ok).toBe(true)
    if (result.ok !== true) return
    expect(result.data.displayName).toBe('Melega DEX Staged')
    const audit = listAuditRecords('melega-dex')
    expect(audit.some((a) => a.action === 'PROFILE_STAGE' && a.auditId === result.auditId)).toBe(true)
  })

  it('resource updates', () => {
    const auth = ownerAuth()
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const result = stageResourceMutation({
      projectId: loaded.document.projectId,
      slug: 'melega-dex',
      auth,
      payload: {
        resourceKey: 'github',
        kind: 'github',
        title: 'GitHub',
        url: 'https://github.com/meleganza/MelegaSwapV2',
        summary: 'Official repository',
      },
      now: FIXED_AT,
    })
    expect(result.ok).toBe(true)
    const unsafe = stageResourceMutation({
      projectId: loaded.document.projectId,
      slug: 'melega-dex',
      auth,
      payload: {
        resourceKey: 'evil',
        kind: 'website',
        title: 'Evil',
        url: 'javascript:alert(1)',
        summary: 'bad',
      },
      now: FIXED_AT,
    })
    expect(unsafe.ok).toBe(false)
  })

  it('update publication creates canonical staged object', () => {
    const auth = ownerAuth()
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const result = stageUpdatePublication({
      projectId: loaded.document.projectId,
      slug: 'melega-dex',
      auth,
      payload: {
        stableKey: 'melega-dex.staged.control-center-open',
        version: '1.0.0',
        title: 'Control Center staging notice',
        summary: 'Staged update for PP008-compatible timeline.',
        content: 'Does not mutate frozen public updates registry.',
        category: 'INFRASTRUCTURE',
      },
      now: FIXED_AT,
    })
    expect(result.ok).toBe(true)
    if (result.ok !== true) return
    expect(result.data.status).toBe('STAGED')
    expect(result.data.category).toBe('INFRASTRUCTURE')
    expect(result.data.authorType).toBe('PROJECT')
    // Frozen PP008 public document remains unchanged.
    const publicUpdates = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    expect(publicUpdates.updates.some((u) => u.stableKey === 'melega-dex.staged.control-center-open')).toBe(false)
  })

  it('ecosystem and developer staging', () => {
    const auth = ownerAuth()
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    expect(
      stageEcosystemMutation({
        projectId: loaded.document.projectId,
        slug: 'melega-dex',
        auth,
        payload: {
          serviceKey: 'melega-dex.service.staged',
          title: 'Staged Service',
          summary: 'Staging only',
          route: '/status',
          externalUrl: null,
        },
        now: FIXED_AT,
      }).ok,
    ).toBe(true)
    expect(
      stageDeveloperMutation({
        projectId: loaded.document.projectId,
        slug: 'melega-dex',
        auth,
        payload: {
          resourceKey: 'melega-dex.dev.staged',
          title: 'Staged docs',
          summary: 'Staging only',
          category: 'DOCUMENTATION',
          url: 'https://www.melega.finance/about',
          route: null,
        },
        now: FIXED_AT,
      }).ok,
    ).toBe(true)
  })

  it('audit records are immutable append-only', () => {
    const auth = ownerAuth()
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    stageProfileMutation({
      projectId: loaded.document.projectId,
      slug: 'melega-dex',
      auth,
      payload: { displayName: 'A' },
      now: '2026-07-21T12:00:01.000Z',
    })
    stageProfileMutation({
      projectId: loaded.document.projectId,
      slug: 'melega-dex',
      auth,
      payload: { displayName: 'B' },
      now: '2026-07-21T12:00:02.000Z',
    })
    const audit = listAuditRecords('melega-dex')
    expect(audit.length).toBeGreaterThanOrEqual(2)
    const ids = audit.map((a) => a.auditId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('public API exposes only claimState and ownerVerification', () => {
    const doc = loadProjectControlCenterDocument('melega-dex', FIXED_AT)!
    const summary = toControlCenterSummaryForProjectApi(doc)
    expect(summary.schemaVersion).toBe(PROJECT_CONTROL_CENTER_SCHEMA_VERSION)
    expect(Object.keys(summary).sort()).toEqual(
      ['claimState', 'extension', 'ownerVerification', 'revision', 'schemaVersion'].sort(),
    )
    expect(stringify(summary)).not.toContain('stagedProfile')
    expect(stringify(summary)).not.toContain('permissions')
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const publicJson = toPublicProjectJson(loaded.document, {
      controlCenterSummary: summary as unknown as Record<string, unknown>,
    })
    expect(stringify(publicJson)).toContain('controlCenterSummary')
    expect(stringify(buildProjectJsonLd(loaded.document))).not.toContain('controlCenterSummary')
  })

  it('Manage Project never SSR public', () => {
    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('ClientManageEntry')
    expect(shell).toContain('ssr: false')
    const entry = readFileSync(path.join(__dirname, '../../../../../views/ProjectPage/ProjectManageEntry.tsx'), 'utf8')
    expect(entry).toContain('Manage Project is never shown publicly without authentication')
    expect(entry).not.toContain('dangerouslySetInnerHTML')
  })

  it('control center accessibility contracts', () => {
    const ui = readFileSync(path.join(__dirname, '../../../../../views/ProjectPage/ProjectControlCenter.tsx'), 'utf8')
    expect(ui).toContain('aria-labelledby="cc-heading"')
    expect(ui).toContain('min-height: 44px')
    expect(ui).toContain('Audit History')
    expect(ui).toContain('flex-direction: column')
  })
})

describe('PP012 regressions PP001–PP011', () => {
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

    expect(
      existsSync(path.join(__dirname, '../../../../../pages/api/private/projects/[slug]/control-center/profile.ts')),
    ).toBe(true)
    expect(existsSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/control-center.ts'))).toBe(
      true,
    )
    const publicApi = readFileSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug].ts'), 'utf8')
    expect(publicApi).toContain('controlCenterSummary')
    expect(publicApi).toContain('governanceSummary')
  })
})
