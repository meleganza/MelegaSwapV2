/**
 * PP007 — Liquidity Building Orchestration tests.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import stringify from 'fast-json-stable-stringify'
import { STATIC_PROJECTS } from '../../../projects.data'
import type { StaticProjectRecord } from '../../../types'
import { resolveProjectBySlug } from '../../resolveProject'
import { normalizeProjectDocument, toPublicProjectJson, buildProjectJsonLd } from '../../normalizeProject'
import { loadProjectEvidencePack } from '../../evidence'
import { loadProjectReadinessDocument } from '../../readiness'
import { loadProjectMarketsDocument } from '../../markets'
import { loadProjectParticipationDocument } from '../../participation'
import { buildWalletRelationshipDocument, disconnectedObservation } from '../../walletRelationship'
import {
  CERTIFIED_LB_DEPLOYMENT_SNAPSHOT,
  CERTIFIED_LIQUIDITY_BUILDING_BINDINGS,
  LIQUIDITY_BUILDING_DESTINATION_HREF,
  PROJECT_LIQUIDITY_BUILDING_SCHEMA_VERSION,
  buildProjectLiquidityBuildingDocument,
  loadProjectLiquidityBuildingDocument,
  toLiquidityBuildingSummaryForProjectApi,
} from '../index'

const FIXED_AT = '2026-07-20T22:00:00.000Z'
const WALLET = 'eip155:56:0x1111111111111111111111111111111111111111'

function cloneProject(overrides: Partial<StaticProjectRecord> = {}): StaticProjectRecord {
  const base = STATIC_PROJECTS.find((p) => p.slug === 'melega-dex') ?? STATIC_PROJECTS[0]
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
    primaryTokenRefs: overrides.primaryTokenRefs ?? [...base.primaryTokenRefs],
  }
}

function lbFor(project: StaticProjectRecord) {
  const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
  return buildProjectLiquidityBuildingDocument({ project, document, generatedAt: FIXED_AT })
}

describe('PP007 Liquidity Building attribution and capability', () => {
  it('1. capability attribution uses certified binding only', () => {
    expect(CERTIFIED_LIQUIDITY_BUILDING_BINDINGS.some((b) => b.projectSlug === 'melega-dex')).toBe(true)
    const doc = lbFor(cloneProject())
    expect(doc.capability.capabilityId).toBe('LIQUIDITY_BUILDING')
    expect(doc.capability.source).toBe('CERTIFIED_RUNTIME_CONFIGURATION')
    expect(doc.schemaVersion).toBe(PROJECT_LIQUIDITY_BUILDING_SCHEMA_VERSION)
  })

  it('2. unsupported project has no destination', () => {
    const orphan = lbFor(
      cloneProject({
        slug: 'orphan-lb-fixture',
        aliases: [],
        resources: {
          tokens: [
            {
              chainId: 56,
              address: '0x3333333333333333333333333333333333333333',
              symbol: 'ORPH',
              ref: 'token://56/0x3333333333333333333333333333333333333333',
            },
          ],
          liquidityPools: [],
          farms: [],
          stakingPools: [],
        },
        primaryTokenRefs: ['token://56/0x3333333333333333333333333333333333333333'],
      }),
    )
    expect(orphan.availability).toBe('NOT_APPLICABLE')
    expect(orphan.activationState).toBe('UNSUPPORTED')
    expect(orphan.destination).toBeNull()
    expect(orphan.heroActionAllowed).toBe(false)
    expect(orphan.warnings.some((w) => w.reasonCode === 'PROJECT_DOES_NOT_SUPPORT_LIQUIDITY_BUILDING')).toBe(true)
  })

  it('3. supported project (melega-dex) exposes destination and chains', () => {
    const doc = loadProjectLiquidityBuildingDocument('melega-dex', FIXED_AT)!
    expect(doc.availability).toBe('AVAILABLE')
    expect(doc.supportedChains).toContain(56)
    expect(doc.destination?.href).toBe(LIQUIDITY_BUILDING_DESTINATION_HREF)
    expect(doc.destination?.label).toBe('Open Liquidity Building')
  })

  it('4. activation states reflect deployment readiness', () => {
    const doc = loadProjectLiquidityBuildingDocument('melega-dex', FIXED_AT)!
    expect(['ACTIVE', 'ACTIVATION_PENDING', 'BLOCKED', 'UNAVAILABLE']).toContain(doc.activationState)
    // Repository deployment inputs are currently BLOCKED — snapshot must match.
    expect(CERTIFIED_LB_DEPLOYMENT_SNAPSHOT.deploymentReadinessState).toBe('BLOCKED')
    const inputsPath = path.join(
      process.cwd(),
      '../../deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json',
    )
    const altPath = path.join(
      process.cwd(),
      'deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json',
    )
    const resolvedPath = existsSync(inputsPath) ? inputsPath : altPath
    if (existsSync(resolvedPath)) {
      const inputs = JSON.parse(readFileSync(resolvedPath, 'utf8')) as { deploymentReadinessState?: string }
      expect(CERTIFIED_LB_DEPLOYMENT_SNAPSHOT.deploymentReadinessState).toBe(inputs.deploymentReadinessState)
    }
    expect(doc.activationState).toBe('BLOCKED')
    expect(doc.capability.status).toBe('PAUSED')
  })

  it('5. destination validation rejects non-certified hrefs', () => {
    expect(LIQUIDITY_BUILDING_DESTINATION_HREF).toBe('/liquidity-studio?view=building')
    const doc = loadProjectLiquidityBuildingDocument('melega-dex', FIXED_AT)!
    expect(doc.destination?.href).toBe('/liquidity-studio?view=building')
    expect(doc.destination?.href).not.toMatch(/execute|tx|approve/i)
  })

  it('6. API serialization is stable and public-safe', () => {
    const a = loadProjectLiquidityBuildingDocument('melega-dex', FIXED_AT)!
    const b = loadProjectLiquidityBuildingDocument('melega-dex', FIXED_AT)!
    expect(stringify(a.capability)).toBe(stringify(b.capability))
    const body = stringify(a)
    expect(body).not.toContain(WALLET)
    expect(body).not.toMatch(/calldata|transactionRequest|approve\(|signTypedData/i)
    expect(body).not.toMatch(/"eligibleNetBuyFlow"|"grossQuoteTarget"/)
  })

  it('7. PP001 summary extension', () => {
    const doc = loadProjectLiquidityBuildingDocument('melega-dex', FIXED_AT)!
    const summary = toLiquidityBuildingSummaryForProjectApi(doc)
    expect(summary.supported).toBe(true)
    expect(summary.activationState).toBe(doc.activationState)
    expect(summary.endpoint).toBe('/api/public/projects/melega-dex/liquidity-building/')
    expect(summary.revision).toBe(doc.liquidityBuildingRevision)
    expect(Object.keys(summary).sort()).toEqual(
      ['activationState', 'endpoint', 'extension', 'revision', 'schemaVersion', 'supported'].sort(),
    )

    const project = cloneProject()
    const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
    const publicJson = toPublicProjectJson(document, {
      liquidityBuildingSummary: summary as unknown as Record<string, unknown>,
    })
    expect(stringify(publicJson)).toContain('liquidityBuildingSummary')
    expect(stringify(buildProjectJsonLd(document))).not.toContain('liquidityBuilding')
  })

  it('8. Participate rendering contract', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectLiquidityBuildingSection.tsx'),
      'utf8',
    )
    expect(ui).toContain('Open Liquidity Building')
    expect(ui).toContain('lb-open-cta')
    expect(ui).toContain('lb-activation-state')
    expect(ui).not.toContain('confirmTransaction')
    expect(ui).not.toContain('eligible-flow')
    expect(ui).not.toMatch(/useSimulation|runSimulation|SimulationWizard/)

    const participationUi = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectParticipationSection.tsx'),
      'utf8',
    )
    const lbIdx = participationUi.indexOf('<ProjectLiquidityBuildingSection')
    const positionsIdx = participationUi.indexOf('<ProjectParticipationPositions')
    expect(lbIdx).toBeGreaterThan(0)
    expect(positionsIdx).toBeGreaterThan(lbIdx)
  })

  it('9. Hero action rules — Swap remains primary when READY', () => {
    const doc = loadProjectLiquidityBuildingDocument('melega-dex', FIXED_AT)!
    expect(doc.heroActionAllowed).toBe(false)
    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('hero-open-swap')
    expect(shell).toContain('hero-open-liquidity-building')
    expect(shell.indexOf('hero-open-swap')).toBeLessThan(shell.indexOf('hero-open-liquidity-building'))
  })

  it('10. no embedded Liquidity Building runtime', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectLiquidityBuildingSection.tsx'),
      'utf8',
    )
    expect(ui).not.toContain('liquidity-building-runtime')
    expect(ui).not.toContain('assessLiquidityBuilding')
    expect(ui).not.toContain('eligible-flow')
    const builder = readFileSync(path.join(__dirname, '../buildProjectLiquidityBuildingDocument.ts'), 'utf8')
    expect(builder).not.toContain('intent-builder')
    expect(builder).not.toContain('decision-engine')
    expect(builder).not.toContain('signTypedData')
  })
})

describe('PP007 regressions PP001–PP006 and Liquidity Building', () => {
  it('11–16. PP001–PP006 remain loadable', () => {
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
  })

  it('17. Liquidity Building surfaces and API wiring remain', () => {
    expect(
      existsSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/liquidity-building.ts')),
    ).toBe(true)
    expect(existsSync(path.join(__dirname, '../../../../../lib/liquidity-building-runtime'))).toBe(true)
    expect(existsSync(path.join(__dirname, '../../../../../pages/liquidity-studio.tsx'))).toBe(true)

    const hq = readFileSync(path.join(__dirname, '../../../../../pages/project-hq/[slug].tsx'), 'utf8')
    expect(hq).toContain('liquidityBuildingDocument')
    expect(hq).toContain('liquidityBuildingAlternate')

    const publicApi = readFileSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug].ts'), 'utf8')
    expect(publicApi).toContain('liquidityBuildingSummary')

    for (const rel of [
      'pages/swap/index.tsx',
      'pages/trade/index.tsx',
      'pages/liquidity-studio.tsx',
      'pages/farms',
      'pages/pools',
      'views/ProjectPage/ProjectMarketsSection.tsx',
      'views/ProjectPage/ProjectParticipationSection.tsx',
      'views/ProjectPage/WalletRelationshipSection.tsx',
    ]) {
      expect(existsSync(path.join(__dirname, '../../../../../', rel))).toBe(true)
    }
  })

  it('alias parity', () => {
    const a = loadProjectLiquidityBuildingDocument('melega-dex', FIXED_AT)!
    const b = loadProjectLiquidityBuildingDocument('melega', FIXED_AT)!
    expect(a.projectId).toBe(b.projectId)
    expect(stringify(a.capability)).toBe(stringify(b.capability))
  })
})
