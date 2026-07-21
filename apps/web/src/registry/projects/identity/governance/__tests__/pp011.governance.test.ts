/**
 * PP011 — Governance & Treasury Transparency tests.
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
import { buildWalletRelationshipDocument, disconnectedObservation } from '../../walletRelationship'
import {
  DISCLOSURE_LEVELS,
  GOVERNANCE_MODELS,
  PROJECT_GOVERNANCE_SCHEMA_VERSION,
  TREASURY_TYPES,
  UPGRADEABILITY_MODELS,
  buildGovernanceId,
  buildTreasuryId,
  isDisclosureLevel,
  isGovernanceModel,
  isTreasuryType,
  isUpgradeabilityModel,
  loadProjectGovernanceDocument,
  toGovernanceSummaryForProjectApi,
} from '../index'

const FIXED_AT = '2026-07-21T00:00:00.000Z'

describe('PP011 governance & treasury transparency', () => {
  it('1. deterministic governance IDs', () => {
    const a = buildGovernanceId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.gov.primary',
      governanceModel: 'UNKNOWN',
    })
    const b = buildGovernanceId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.gov.primary',
      governanceModel: 'UNKNOWN',
    })
    expect(a).toBe(b)
    expect(a.startsWith('gov_')).toBe(true)
  })

  it('2. deterministic treasury IDs', () => {
    const a = buildTreasuryId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.treasury.intake-97',
      treasuryType: 'REVENUE',
      chainId: 97,
    })
    const b = buildTreasuryId({
      projectId: 'upi://melega/project/melega-dex@1',
      stableKey: 'melega-dex.treasury.intake-97',
      treasuryType: 'REVENUE',
      chainId: 97,
    })
    expect(a).toBe(b)
    expect(a.startsWith('tre_')).toBe(true)
  })

  it('3. governance model validation', () => {
    expect(isGovernanceModel('UNKNOWN')).toBe(true)
    expect(isGovernanceModel('DAO')).toBe(true)
    expect(isGovernanceModel('TOKEN_HOLDER')).toBe(false)
    expect(GOVERNANCE_MODELS).toContain('TIMELOCK')
    expect(GOVERNANCE_MODELS).toContain('HYBRID')
  })

  it('4. treasury type validation', () => {
    expect(isTreasuryType('REVENUE')).toBe(true)
    expect(isTreasuryType('PROTOCOL_TREASURY')).toBe(true)
    expect(isTreasuryType('HOT_WALLET')).toBe(false)
    expect(TREASURY_TYPES).toContain('GRANTS')
  })

  it('5. disclosure validation', () => {
    expect(isDisclosureLevel('PUBLIC_DECLARED')).toBe(true)
    expect(isDisclosureLevel('PUBLIC_VERIFIED')).toBe(true)
    expect(isDisclosureLevel('VERIFIED')).toBe(false)
    expect(DISCLOSURE_LEVELS).toContain('UNAVAILABLE')
    const doc = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    expect(doc.treasury.some((t) => t.disclosureLevel === 'PUBLIC_VERIFIED')).toBe(false)
  })

  it('6. upgradeability validation', () => {
    expect(isUpgradeabilityModel('IMMUTABLE')).toBe(true)
    expect(isUpgradeabilityModel('PROXY')).toBe(true)
    expect(isUpgradeabilityModel('UUPS')).toBe(false)
    expect(UPGRADEABILITY_MODELS).toContain('UNKNOWN')
    const doc = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    expect(doc.upgradeability.some((u) => u.upgradeability === 'IMMUTABLE')).toBe(true)
    expect(doc.upgradeability.some((u) => u.upgradeability === 'UNKNOWN')).toBe(true)
  })

  it('7. public API shape', () => {
    const doc = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    expect(doc.schemaVersion).toBe(PROJECT_GOVERNANCE_SCHEMA_VERSION)
    const body = stringify(doc)
    expect(body).toContain('governance')
    expect(body).toContain('treasury')
    expect(body).toContain('ownership')
    expect(body).toContain('upgradeability')
    expect(body).toContain('relationships')
    expect(body).not.toMatch(/"balanceUsd"|"portfolioAllocation"|"inflow"|"outflow"|"tvl"/i)
    expect(body).not.toMatch(/apiKey|privateKey|webhookSecret/i)
    expect(doc.treasury.every((t) => !('balance' in t) && !('usdValue' in t))).toBe(true)
  })

  it('8. PP001 summary extension', () => {
    const doc = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    const summary = toGovernanceSummaryForProjectApi(doc)
    expect(summary.endpoint).toBe('/api/public/projects/melega-dex/governance/')
    expect(summary.governanceModel).toBe('UNKNOWN')
    expect(Object.keys(summary).sort()).toEqual(
      ['disclosureState', 'endpoint', 'extension', 'governanceModel', 'revision', 'schemaVersion'].sort(),
    )
    expect(stringify(summary)).not.toContain('treasury')
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    expect(
      stringify(
        toPublicProjectJson(loaded.document, {
          governanceSummary: summary as unknown as Record<string, unknown>,
        }),
      ),
    ).toContain('governanceSummary')
    expect(stringify(buildProjectJsonLd(loaded.document))).not.toContain('governanceSummary')
  })

  it('9. HTML/API parity', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectGovernanceSection.tsx'),
      'utf8',
    )
    expect(ui).toContain('Governance')
    expect(ui).toContain('Treasury Transparency')
    expect(ui).toContain('Ownership')
    expect(ui).toContain('Upgradeability')
    expect(ui).toContain('Resources')
    expect(ui).not.toContain('dangerouslySetInnerHTML')
    expect(ui).toContain('intentionally not shown')
    expect(ui).not.toMatch(/balanceUsd|portfolioAllocation|inflowChart/i)
    const doc = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    expect(doc.governance.length).toBeGreaterThan(0)
    expect(doc.treasury.length).toBeGreaterThan(0)
  })

  it('10. evidence integration', () => {
    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const doc = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    const publicIds = new Set(
      loaded.evidencePack.evidence.filter((e) => e.visibility === 'PUBLIC').map((e) => e.evidenceId),
    )
    for (const rel of doc.relationships.filter((r) => r.relationType === 'LINKS_EVIDENCE')) {
      expect(publicIds.has(rel.toId)).toBe(true)
    }
    for (const entity of doc.governance) {
      expect(entity.provenance.sourceClass).toBeTruthy()
      for (const id of entity.evidence) expect(publicIds.has(id)).toBe(true)
    }
  })

  it('11. documentation integration', () => {
    const doc = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    const about = doc.resources.find((r) => r.stableKey === 'melega-dex.gov.res.docs-about')!
    expect(about.kind).toBe('DOCUMENTATION')
    expect(about.url).toContain('melega.finance/about')
    expect(about.lifecycle).toBe('ACTIVE')
  })

  it('12. ecosystem integration', () => {
    const eco = loadProjectEcosystemDocument('melega-dex', FIXED_AT)!
    const gov = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    const serviceLinks = gov.relationships.filter((r) => r.relationType === 'LINKS_SERVICE')
    expect(serviceLinks.length).toBeGreaterThan(0)
    expect(eco.services.some((s) => serviceLinks.some((r) => r.toId === s.serviceId))).toBe(true)
  })

  it('13. updates integration', () => {
    const updates = loadProjectUpdatesDocument('melega-dex', FIXED_AT)!
    const gov = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    const updateLinks = gov.relationships.filter((r) => r.relationType === 'LINKS_UPDATE')
    expect(updateLinks.length).toBeGreaterThan(0)
    expect(updates.updates.some((u) => updateLinks.some((r) => r.toId === u.updateId))).toBe(true)
  })

  it('14–15. accessibility and responsive contracts', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectGovernanceSection.tsx'),
      'utf8',
    )
    expect(ui).toContain('aria-labelledby="governance-heading"')
    expect(ui).toContain('flex-direction: column')
    expect(ui).toContain('<time dateTime=')
    expect(ui).toContain('min-height: 44px')
    expect(ui).toContain('Treasury Transparency')
    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('ProjectGovernanceSection')
    expect(shell).toContain('project-governance-slot')
  })

  it('canonical wallet reference for testnet intake', () => {
    const doc = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    const intake = doc.treasury.find((t) => t.stableKey === 'melega-dex.treasury.intake-97')!
    expect(intake.disclosureLevel).toBe('PUBLIC_DECLARED')
    expect(intake.walletReference.caip10).toBe('eip155:97:0xe674b1d925d79f5a0053e40cc7cded7841ad4164')
    expect(intake.walletReference.address).toBe('0xe674b1d925d79f5a0053e40cc7cded7841ad4164')
  })

  it('developer hub cross-links', () => {
    const gov = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    const dev = loadProjectDeveloperDocument('melega-dex', FIXED_AT)!
    const developerLinks = gov.relationships.filter((r) => r.relationType === 'LINKS_DEVELOPER')
    expect(developerLinks.length).toBeGreaterThan(0)
    expect(dev.resources.some((r) => developerLinks.some((l) => l.toId === r.resourceId))).toBe(true)
  })
})

describe('PP011 regressions PP001–PP010', () => {
  it('16–25. prior missions remain loadable', () => {
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

    expect(existsSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/governance.ts'))).toBe(true)
    const hq = readFileSync(path.join(__dirname, '../../../../../pages/project-hq/[slug].tsx'), 'utf8')
    expect(hq).toContain('governanceDocument')
    expect(hq).toContain('governanceAlternate')
    const publicApi = readFileSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug].ts'), 'utf8')
    expect(publicApi).toContain('governanceSummary')
    expect(publicApi).toContain('developerSummary')
  })

  it('alias parity', () => {
    const a = loadProjectGovernanceDocument('melega-dex', FIXED_AT)!
    const b = loadProjectGovernanceDocument('melega', FIXED_AT)!
    expect(a.projectId).toBe(b.projectId)
    expect(stringify(a.governance.map((g) => g.governanceId))).toBe(stringify(b.governance.map((g) => g.governanceId)))
    expect(stringify(a.treasury.map((t) => t.treasuryId))).toBe(stringify(b.treasury.map((t) => t.treasuryId)))
  })
})
