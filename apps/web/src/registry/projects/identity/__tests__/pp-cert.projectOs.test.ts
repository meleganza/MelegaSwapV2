/**
 * PP-CERT — Project Operating System integration certification.
 * Read-mostly: verifies coherence of PP001–PP014. No new product features.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import stringify from 'fast-json-stable-stringify'
import { resolveProjectBySlug } from '../resolveProject'
import { toPublicProjectJson, buildProjectJsonLd } from '../normalizeProject'
import { loadProjectEvidencePack } from '../evidence'
import { loadProjectReadinessDocument } from '../readiness'
import { loadProjectMarketsDocument } from '../markets'
import { loadProjectParticipationDocument } from '../participation'
import { loadProjectLiquidityBuildingDocument } from '../liquidityBuilding'
import { loadProjectUpdatesDocument } from '../updates'
import { loadProjectEcosystemDocument } from '../ecosystem'
import { loadProjectDeveloperDocument } from '../developer'
import { loadProjectGovernanceDocument } from '../governance'
import { loadProjectControlCenterDocument } from '../controlCenter'
import { loadProjectGrowthDocument } from '../growth'
import { loadProjectMachineDocument, toMachineSummaryForProjectApi, MACHINE_INTERFACE_VERSION } from '../machine'
import {
  toEvidenceSummaryForProjectApi,
  toReadinessSummaryForProjectApi,
  toTrustSnapshotSummaryForProjectApi,
  buildWalletRelationshipSupportMetadata,
  toMarketsSummaryForProjectApi,
  toParticipationSummaryForProjectApi,
  toLiquidityBuildingSummaryForProjectApi,
  toUpdatesSummaryForProjectApi,
  toEcosystemSummaryForProjectApi,
  toDeveloperSummaryForProjectApi,
  toGovernanceSummaryForProjectApi,
  toControlCenterSummaryForProjectApi,
  toGrowthSummaryForProjectApi,
} from '../index'
import { buildWalletRelationshipDocument, disconnectedObservation } from '../walletRelationship'

const FIXED_AT = '2026-07-21T00:00:00.000Z'
const ROOT = path.join(__dirname, '../../../../')

const PUBLIC_API_FILES = [
  '[slug].ts',
  'evidence.ts',
  'readiness.ts',
  'markets.ts',
  'participation.ts',
  'liquidity-building.ts',
  'updates.ts',
  'ecosystem.ts',
  'developer.ts',
  'governance.ts',
  'control-center.ts',
  'growth.ts',
  'machine.ts',
] as const

const SCHEMA_VERSIONS = [
  'melega.project-page.v1',
  'melega.project-evidence.v1',
  'melega.project-readiness.v1',
  'melega.project-wallet-relationship.v1',
  'melega.project-markets.v1',
  'melega.project-participation.v1',
  'melega.project-liquidity-building.v1',
  'melega.project-updates.v1',
  'melega.project-ecosystem.v1',
  'melega.project-developer.v1',
  'melega.project-governance.v1',
  'melega.project-control-center.v1',
  'melega.project-growth.v1',
  'melega.project-machine.v1',
] as const

describe('PP-CERT Project Operating System', () => {
  it('shared projectId across all hubs', () => {
    const evidence = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const projectId = evidence.document.projectId
    expect(projectId.startsWith('upi://')).toBe(true)
    expect(loadProjectReadinessDocument('melega-dex', { generatedAt: FIXED_AT })!.projectId).toBe(projectId)
    expect(loadProjectMarketsDocument('melega-dex', { generatedAt: FIXED_AT })!.projectId).toBe(projectId)
    expect(loadProjectParticipationDocument('melega-dex', FIXED_AT)!.projectId).toBe(projectId)
    expect(loadProjectLiquidityBuildingDocument('melega-dex', FIXED_AT)!.projectId).toBe(projectId)
    expect(loadProjectUpdatesDocument('melega-dex', FIXED_AT)!.projectId).toBe(projectId)
    expect(loadProjectEcosystemDocument('melega-dex', FIXED_AT)!.projectId).toBe(projectId)
    expect(loadProjectDeveloperDocument('melega-dex', FIXED_AT)!.projectId).toBe(projectId)
    expect(loadProjectGovernanceDocument('melega-dex', FIXED_AT)!.projectId).toBe(projectId)
    expect(loadProjectControlCenterDocument('melega-dex', FIXED_AT)!.projectId).toBe(projectId)
    expect(loadProjectGrowthDocument('melega-dex', FIXED_AT)!.projectId).toBe(projectId)
    expect(loadProjectMachineDocument('melega-dex', FIXED_AT)!.projectId).toBe(projectId)
  })

  it('alias slug resolves to same projectId', () => {
    expect(resolveProjectBySlug('melega').ok).toBe(true)
    expect(loadProjectMachineDocument('melega', FIXED_AT)!.projectId).toBe(
      loadProjectMachineDocument('melega-dex', FIXED_AT)!.projectId,
    )
    expect(loadProjectGrowthDocument('melega', FIXED_AT)!.projectId).toBe(
      loadProjectGrowthDocument('melega-dex', FIXED_AT)!.projectId,
    )
  })

  it('unknown slug is not loadable (404 semantics)', () => {
    expect(resolveProjectBySlug('not-a-real-project-xyz').ok).toBe(false)
    expect(loadProjectMachineDocument('not-a-real-project-xyz', FIXED_AT)).toBeNull()
    expect(loadProjectEvidencePack('not-a-real-project-xyz')).toBeNull()
  })

  it('PP001 additive summaries are complete and non-duplicative of JSON-LD', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const readiness = loadProjectReadinessDocument('melega-dex', { generatedAt: FIXED_AT })!
    const markets = loadProjectMarketsDocument('melega-dex', { generatedAt: FIXED_AT })!
    const participation = loadProjectParticipationDocument('melega-dex', FIXED_AT)!
    const lb = loadProjectLiquidityBuildingDocument('melega-dex', FIXED_AT)!
    const updates = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    const ecosystem = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    const developer = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    const governance = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    const controlCenter = loadProjectControlCenterDocument('melega-dex', FIXED_AT)!
    const growth = loadProjectGrowthDocument('melega-dex', FIXED_AT)!
    const machine = loadProjectMachineDocument('melega-dex', FIXED_AT)!

    const publicJson = toPublicProjectJson(loaded.document, {
      evidenceSummary: toEvidenceSummaryForProjectApi(loaded.evidencePack) as unknown as Record<string, unknown>,
      readinessSummary: toReadinessSummaryForProjectApi(readiness) as unknown as Record<string, unknown>,
      trustSnapshotSummary: toTrustSnapshotSummaryForProjectApi(readiness) as unknown as Record<string, unknown>,
      walletRelationshipSupport: buildWalletRelationshipSupportMetadata(loaded.document.slug) as unknown as Record<
        string,
        unknown
      >,
      marketsSummary: toMarketsSummaryForProjectApi(markets) as unknown as Record<string, unknown>,
      participationSummary: toParticipationSummaryForProjectApi(participation) as unknown as Record<string, unknown>,
      liquidityBuildingSummary: toLiquidityBuildingSummaryForProjectApi(lb) as unknown as Record<string, unknown>,
      updatesSummary: toUpdatesSummaryForProjectApi(updates) as unknown as Record<string, unknown>,
      ecosystemSummary: toEcosystemSummaryForProjectApi(ecosystem) as unknown as Record<string, unknown>,
      developerSummary: toDeveloperSummaryForProjectApi(developer) as unknown as Record<string, unknown>,
      governanceSummary: toGovernanceSummaryForProjectApi(governance) as unknown as Record<string, unknown>,
      controlCenterSummary: toControlCenterSummaryForProjectApi(controlCenter) as unknown as Record<string, unknown>,
      growthSummary: toGrowthSummaryForProjectApi(growth) as unknown as Record<string, unknown>,
      machineSummary: toMachineSummaryForProjectApi(machine) as unknown as Record<string, unknown>,
    })

    const body = stringify(publicJson)
    for (const key of [
      'evidenceSummary',
      'readinessSummary',
      'trustSnapshotSummary',
      'walletRelationshipSupport',
      'marketsSummary',
      'participationSummary',
      'liquidityBuildingSummary',
      'updatesSummary',
      'ecosystemSummary',
      'developerSummary',
      'governanceSummary',
      'controlCenterSummary',
      'growthSummary',
      'machineSummary',
    ]) {
      expect(body).toContain(key)
    }
    expect(publicJson.schemaVersion).toBe('melega.project-page.v1')
    const jsonLd = stringify(buildProjectJsonLd(loaded.document))
    expect(jsonLd).not.toContain('machineSummary')
    expect(jsonLd).not.toContain('growthSummary')
  })

  it('all public project API handlers exist', () => {
    const dir = path.join(ROOT, 'pages/api/public/projects')
    for (const file of PUBLIC_API_FILES) {
      const full = file === '[slug].ts' ? path.join(dir, file) : path.join(dir, '[slug]', file)
      expect(existsSync(full), full).toBe(true)
    }
  })

  it('canonical IA section order on Project Page', () => {
    const shell = readFileSync(path.join(ROOT, 'views/ProjectPage/ProjectIdentityShell.tsx'), 'utf8')
    expect(shell).toContain('id="identity"')
    expect(shell).toContain("id: 'identity'")
    expect(shell).toContain("id: 'wallet-relationship'")
    const order = [
      'project-identity-hero',
      'project-wallet-relationship-slot',
      'project-overview',
      'project-participate-slot',
      'project-trust-state',
      'project-updates-slot',
      'project-ecosystem-slot',
      'project-developer-slot',
      'project-governance-slot',
      'project-growth-slot',
      'project-machine-slot',
    ]
    let prev = -1
    for (const marker of order) {
      const idx = shell.indexOf(marker)
      expect(idx, marker).toBeGreaterThan(prev)
      prev = idx
    }
  })

  it('machine model includes PP004 schema and navigation-only actions', () => {
    const machine = loadProjectMachineDocument('melega-dex', FIXED_AT)!
    expect(machine.machineInterface.version).toBe(MACHINE_INTERFACE_VERSION)
    expect(machine.schemas.some((s) => s.hub === 'PP004')).toBe(true)
    expect(machine.schemas.map((s) => s.schemaVersion).sort()).toEqual([...SCHEMA_VERSIONS].sort())
    expect(machine.actions.every((a) => a.walletRequired === false)).toBe(true)
    expect(machine.actions.every((a) => ['NAVIGATE', 'FETCH', 'DISCOVER'].includes(a.kind))).toBe(true)
    for (const action of machine.actions) {
      if (!action.route) continue
      const pathOnly = action.route.split('#')[0]
      expect(pathOnly.startsWith('/') || pathOnly.startsWith('/.')).toBe(true)
    }
  })

  it('well-known machine discovery exists', () => {
    const wk = path.join(ROOT, '../public/.well-known/melega-dex-machine.json')
    expect(existsSync(wk)).toBe(true)
    const json = JSON.parse(readFileSync(wk, 'utf8')) as Record<string, unknown>
    expect(json.machine).toBe('/api/public/projects/melega-dex/machine/')
  })

  it('HQ Meta discovers control-center alternate', () => {
    const hq = readFileSync(path.join(ROOT, 'pages/project-hq/[slug].tsx'), 'utf8')
    expect(hq).toContain('controlCenterAlternate')
    expect(hq).toContain('/control-center/')
  })

  it('wallet relationship remains contextual (no public balances leak)', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const wr = buildWalletRelationshipDocument({
      document: loaded.document,
      evidencePack: loaded.evidencePack,
      observation: disconnectedObservation(FIXED_AT),
      generatedAt: FIXED_AT,
    })
    expect(wr.status).toBe('DISCONNECTED')
    expect(stringify(wr)).not.toMatch(/"balance"|"privateKey"/i)
    expect(existsSync(path.join(ROOT, 'pages/api/public/projects/[slug]/wallet-relationship.ts'))).toBe(false)
  })

  it('canonical documentation set exists', () => {
    const docs = [
      'PROJECT_OS_ARCHITECTURE.md',
      'PROJECT_OS_ENTITY_MODEL.md',
      'PROJECT_OS_API_REFERENCE.md',
      'PROJECT_OS_MACHINE_MODEL.md',
      'PROJECT_OS_UX_INFORMATION_ARCHITECTURE.md',
      'PROJECT_OS_CERTIFICATION.md',
    ]
    for (const name of docs) {
      expect(existsSync(path.join(ROOT, '../docs/runtime', name)), name).toBe(true)
    }
  })
})
