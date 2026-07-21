/**
 * PP014 — AI Agent Interface & Machine Actions tests.
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
import { loadProjectGrowthDocument } from '../../growth'
import { buildWalletRelationshipDocument, disconnectedObservation } from '../../walletRelationship'
import {
  MACHINE_CAPABILITIES,
  MACHINE_INTERFACE_VERSION,
  PROJECT_MACHINE_SCHEMA_VERSION,
  buildMachineInterfaceId,
  buildCapabilityId,
  isMachineCapability,
  loadProjectMachineDocument,
  toMachineSummaryForProjectApi,
} from '../index'

const FIXED_AT = '2026-07-21T00:00:00.000Z'

describe('PP014 machine interface', () => {
  it('deterministic interface and capability IDs', () => {
    const projectId = 'upi://melega/project/melega-dex@1'
    const a = buildMachineInterfaceId({ projectId, version: MACHINE_INTERFACE_VERSION })
    const b = buildMachineInterfaceId({ projectId, version: MACHINE_INTERFACE_VERSION })
    expect(a).toBe(b)
    expect(a.startsWith('mif_')).toBe(true)
    const capA = buildCapabilityId({
      projectId,
      stableKey: 'melega-dex.cap.view-project',
      capability: 'VIEW_PROJECT',
    })
    const capB = buildCapabilityId({
      projectId,
      stableKey: 'melega-dex.cap.view-project',
      capability: 'VIEW_PROJECT',
    })
    expect(capA).toBe(capB)
    expect(capA.startsWith('cap_')).toBe(true)
  })

  it('capability export covers certified Project OS capabilities', () => {
    expect(isMachineCapability('VIEW_PROJECT')).toBe(true)
    expect(isMachineCapability('EXECUTE_SWAP')).toBe(false)
    expect(MACHINE_CAPABILITIES).toContain('SWAP')
    expect(MACHINE_CAPABILITIES).toContain('ADD_LIQUIDITY')
    expect(MACHINE_CAPABILITIES).toContain('VIEW_GROWTH')
    expect(MACHINE_CAPABILITIES).toContain('VIEW_CONTROL_CENTER')
    expect(MACHINE_CAPABILITIES).toContain('VIEW_MACHINE')
    const doc = loadProjectMachineDocument('melega-dex', FIXED_AT)!
    expect(doc.capabilities.length).toBe(MACHINE_CAPABILITIES.length)
    const exported = new Set(doc.capabilities.map((c) => c.capability))
    for (const cap of MACHINE_CAPABILITIES) {
      expect(exported.has(cap)).toBe(true)
    }
    const wallet = doc.capabilities.find((c) => c.capability === 'VIEW_WALLET_RELATIONSHIP')
    expect(wallet?.availability).toBe('NOT_APPLICABLE')
    expect(
      doc.capabilities
        .filter((c) => c.capability !== 'VIEW_WALLET_RELATIONSHIP')
        .every((c) => c.availability === 'AVAILABLE'),
    ).toBe(true)
  })

  it('action descriptors are navigation/discovery only', () => {
    const doc = loadProjectMachineDocument('melega-dex', FIXED_AT)!
    expect(doc.actions.length).toBeGreaterThan(0)
    expect(doc.actions.every((a) => a.walletRequired === false)).toBe(true)
    expect(doc.actions.every((a) => ['NAVIGATE', 'FETCH', 'DISCOVER'].includes(a.kind))).toBe(true)
    for (const action of doc.actions) {
      expect(action).not.toHaveProperty('calldata')
      expect(action).not.toHaveProperty('signature')
      expect(action).not.toHaveProperty('quote')
      expect(action).not.toHaveProperty('txHash')
    }
    const actionPayload = stringify(doc.actions)
    expect(actionPayload).not.toMatch(/"privateKey"|"apiKey"|"signTransaction"|"sendTransaction"/i)
  })

  it('relationship export', () => {
    const doc = loadProjectMachineDocument('melega-dex', FIXED_AT)!
    expect(doc.relationships.length).toBeGreaterThan(0)
    expect(doc.relationships.some((r) => r.relationType === 'USES_CAPABILITY')).toBe(true)
    expect(doc.relationships.some((r) => r.relationType === 'LINKS_SECTION')).toBe(true)
    expect(doc.relationships.some((r) => r.relationType === 'LINKS_ENDPOINT')).toBe(true)
    expect(doc.relationships.every((r) => r.relationId.startsWith('mrel_'))).toBe(true)
  })

  it('public API shape melega.project-machine.v1', () => {
    const doc = loadProjectMachineDocument('melega-dex', FIXED_AT)!
    expect(doc.schemaVersion).toBe(PROJECT_MACHINE_SCHEMA_VERSION)
    expect(doc.machineInterface.version).toBe(MACHINE_INTERFACE_VERSION)
    expect(doc.machineInterface.machineEndpoint).toBe('/api/public/projects/melega-dex/machine/')
    const body = stringify(doc)
    for (const key of [
      'schemaVersion',
      'projectId',
      'revision',
      'generatedAt',
      'machineInterface',
      'capabilities',
      'actions',
      'resources',
      'relationships',
      'warnings',
      'limitations',
    ]) {
      expect(body).toContain(key)
    }
    expect(doc.endpoints.length).toBeGreaterThan(0)
    expect(doc.schemas.some((s) => s.schemaVersion === PROJECT_MACHINE_SCHEMA_VERSION)).toBe(true)
  })

  it('PP001 machineSummary extension', () => {
    const doc = loadProjectMachineDocument('melega-dex', FIXED_AT)!
    const summary = toMachineSummaryForProjectApi(doc)
    expect(summary.interfaceVersion).toBe(MACHINE_INTERFACE_VERSION)
    expect(summary.capabilityCount).toBe(doc.capabilities.length)
    expect(summary.endpoint).toBe('/api/public/projects/melega-dex/machine/')
    expect(summary.revision).toBe(doc.revision)
    expect(Object.keys(summary).sort()).toEqual(
      ['capabilityCount', 'endpoint', 'extension', 'interfaceVersion', 'revision', 'schemaVersion'].sort(),
    )
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    expect(
      stringify(
        toPublicProjectJson(loaded.document, {
          machineSummary: summary as unknown as Record<string, unknown>,
        }),
      ),
    ).toContain('machineSummary')
    expect(stringify(buildProjectJsonLd(loaded.document))).not.toContain('machineSummary')
  })

  it('well-known discovery', () => {
    const wellKnown = path.join(__dirname, '../../../../../../public/.well-known/melega-dex-machine.json')
    expect(existsSync(wellKnown)).toBe(true)
    const json = JSON.parse(readFileSync(wellKnown, 'utf8')) as Record<string, unknown>
    expect(json.schemaVersion).toBe(PROJECT_MACHINE_SCHEMA_VERSION)
    expect(json.machine).toBe('/api/public/projects/melega-dex/machine/')
    expect(json.discovery).toBe('/.well-known/melega-dex-discovery.json')
    const doc = loadProjectMachineDocument('melega-dex', FIXED_AT)!
    expect(doc.machineInterface.wellKnownPath).toBe('/.well-known/melega-dex-machine.json')
  })

  it('HTML/API parity and no execution UI', () => {
    const ui = readFileSync(path.join(__dirname, '../../../../../views/ProjectPage/ProjectMachineSection.tsx'), 'utf8')
    expect(ui).toContain('Machine Interface')
    expect(ui).toContain('machine-api-link')
    expect(ui).toContain('machine-capability-count')
    expect(ui).toContain('machine-discovery-link')
    expect(ui).toContain('machine-version')
    expect(ui).toContain('#developer')
    expect(ui).not.toContain('dangerouslySetInnerHTML')
    expect(ui).not.toMatch(/signTransaction|sendTransaction|approve\(/i)
  })

  it('accessibility and responsive contracts', () => {
    const ui = readFileSync(path.join(__dirname, '../../../../../views/ProjectPage/ProjectMachineSection.tsx'), 'utf8')
    expect(ui).toContain('aria-labelledby="machine-heading"')
    expect(ui).toContain('flex-direction: column')
    expect(ui).toContain('min-height: 44px')
    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('ProjectMachineSection')
    expect(shell).toContain('project-machine-slot')
    expect(shell).toContain("id: 'machine'")
  })

  it('resources link hubs without duplication payloads', () => {
    const doc = loadProjectMachineDocument('melega-dex', FIXED_AT)!
    expect(
      doc.resources.some((r) => r.stableKey === 'melega-dex.mres.openapi' && r.availability === 'UNAVAILABLE'),
    ).toBe(true)
    expect(doc.resources.some((r) => r.stableKey === 'melega-dex.mres.mcp' && r.availability === 'UNAVAILABLE')).toBe(
      true,
    )
    const body = stringify(doc)
    expect(body).not.toMatch(/"programs":\[|"treasuryBalance"|"walletBalances"/i)
  })
})

describe('PP014 regressions PP001–PP013', () => {
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
    expect(loadProjectMachineDocument('melega-dex')).not.toBeNull()

    expect(existsSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/machine.ts'))).toBe(true)
    const hq = readFileSync(path.join(__dirname, '../../../../../pages/project-hq/[slug].tsx'), 'utf8')
    expect(hq).toContain('machineDocument')
    expect(hq).toContain('machineAlternate')
    const publicApi = readFileSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug].ts'), 'utf8')
    expect(publicApi).toContain('machineSummary')
    expect(publicApi).toContain('growthSummary')
  })

  it('alias parity', () => {
    const a = loadProjectMachineDocument('melega-dex', FIXED_AT)!
    const b = loadProjectMachineDocument('melega', FIXED_AT)!
    expect(a.projectId).toBe(b.projectId)
    expect(a.machineInterface.interfaceId).toBe(b.machineInterface.interfaceId)
    expect(stringify(a.capabilities.map((c) => c.capabilityId))).toBe(
      stringify(b.capabilities.map((c) => c.capabilityId)),
    )
  })
})
