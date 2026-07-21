/**
 * PP006 — Liquidity, Farms and Pools Orchestration tests.
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
import {
  buildWalletRelationshipDocument,
  disconnectedObservation,
  walletAccountFromAddressAndChain,
  type LiveWalletObservation,
} from '../../walletRelationship'
import {
  PROJECT_PARTICIPATION_SCHEMA_VERSION,
  STUDIO_DESTINATION_ROUTES,
  buildParticipationId,
  buildProjectParticipationContextualDocument,
  buildProjectParticipationDocument,
  loadProjectParticipationDocument,
  toParticipationSummaryForProjectApi,
} from '../index'

const FIXED_AT = '2026-07-20T20:00:00.000Z'
const WALLET = 'eip155:56:0x1111111111111111111111111111111111111111'
const PAIR = '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e'

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

function participationFor(project: StaticProjectRecord) {
  const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
  return buildProjectParticipationDocument({ project, document, generatedAt: FIXED_AT })
}

describe('PP006 participation identity and attribution', () => {
  it('1. deterministic participation IDs', () => {
    const a = buildParticipationId({
      projectId: 'upi://melega/project/melega-dex@1',
      type: 'LIQUIDITY_POOL',
      chainId: 56,
      subjectKey: `lp:${PAIR}`,
    })
    const b = buildParticipationId({
      projectId: 'upi://melega/project/melega-dex@1',
      type: 'LIQUIDITY_POOL',
      chainId: 56,
      subjectKey: `lp:${PAIR}`,
    })
    expect(a).toBe(b)
    expect(a.startsWith('part_')).toBe(true)
  })

  it('2–5. project / pool / farm / staking attribution for melega-dex', () => {
    const doc = participationFor(cloneProject())
    expect(doc.schemaVersion).toBe(PROJECT_PARTICIPATION_SCHEMA_VERSION)
    expect(doc.pools.length).toBeGreaterThanOrEqual(1)
    expect(doc.farms.length).toBeGreaterThanOrEqual(1)
    expect(doc.stakingPools.length).toBeGreaterThanOrEqual(1)
    expect(doc.pools[0].source).toBe('VENUE_REGISTRY')
    expect(doc.farms[0].farmPid).toBe(1)
    expect(doc.stakingPools[0].sousId).toBe(0)
  })

  it('6–8. unrelated exclusion and symbol-only rejection', () => {
    const orphan = participationFor(
      cloneProject({
        slug: 'orphan-fixture',
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
    expect(orphan.pools).toHaveLength(0)
    expect(orphan.farms).toHaveLength(0)
    expect(orphan.stakingPools).toHaveLength(0)
    expect(orphan.warnings.some((w) => w.reasonCode === 'PROJECT_HAS_NO_PARTICIPATION')).toBe(true)
  })

  it('9–10. duplicate prevention and chain separation', () => {
    const doc = participationFor(cloneProject())
    const ids = [...doc.pools, ...doc.farms, ...doc.stakingPools].map((o) => o.participationId)
    expect(new Set(ids).size).toBe(ids.length)
    const chainIds = buildParticipationId({
      projectId: 'p',
      type: 'FARM',
      chainId: 56,
      subjectKey: 'farm:pid:1',
    })
    const other = buildParticipationId({
      projectId: 'p',
      type: 'FARM',
      chainId: 1,
      subjectKey: 'farm:pid:1',
    })
    expect(chainIds).not.toBe(other)
  })
})

describe('PP006 wallet integration and privacy', () => {
  it('11–14. PP004 integration; public has no wallet; contextual private', () => {
    const project = cloneProject()
    const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
    const evidencePack = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!.evidencePack

    const publicDoc = buildProjectParticipationDocument({ project, document, generatedAt: FIXED_AT })
    expect(stringify(publicDoc)).not.toContain('walletAccount')
    expect(stringify(publicDoc)).not.toContain('userRelationships')
    expect(stringify(publicDoc)).not.toMatch(/"rawAmount"|"stakedRawAmount"/)

    const ctx = buildProjectParticipationContextualDocument({
      project,
      document,
      evidencePack,
      observation: disconnectedObservation(FIXED_AT),
      generatedAt: FIXED_AT,
    })
    expect(ctx.walletConnectionState).toBe('DISCONNECTED')
    expect(ctx.userRelationships).toHaveLength(0)

    const account = walletAccountFromAddressAndChain('0x1111111111111111111111111111111111111111', 56)
    const observation: LiveWalletObservation = {
      walletAccountCaip10: account,
      connectionState: 'CONNECTED',
      activeChainId: 56,
      observedAt: FIXED_AT,
      assetBalances: [],
      assetBalanceAvailability: 'AVAILABLE',
      assetBalanceReason: null,
      liquidityPositions: [
        {
          positionId: 'lp1',
          chainId: 56,
          pairAddress: PAIR,
          pairLabel: 'MARCO/BNB',
          tokenAddresses: ['0x963556de0eb8138e97a85f0a86ee0acd159d210b'],
          lpRawAmount: '1',
          lpFormattedAmount: '1',
          source: 'test',
          observedAt: FIXED_AT,
        },
      ],
      liquidityAvailability: 'AVAILABLE',
      liquidityReason: null,
      farmPositions: [],
      farmAvailability: 'AVAILABLE',
      farmReason: null,
      poolPositions: [],
      poolAvailability: 'AVAILABLE',
      poolReason: null,
    }
    const connected = buildProjectParticipationContextualDocument({
      project,
      document,
      evidencePack,
      observation,
      generatedAt: FIXED_AT,
    })
    expect(connected.walletAccount).toBe(WALLET)
    expect(connected.userRelationships.some((r) => r.type === 'USER_LIQUIDITY_POSITION')).toBe(true)
    expect(stringify(connected.userRelationships)).not.toMatch(/calldata|transactionRequest|approve/i)
  })

  it('15–20. no execution, no fake metrics', () => {
    const doc = participationFor(cloneProject())
    const body = stringify(doc)
    expect(body).not.toMatch(/"apr"|"apy"|"tvlUsd"|"roi"|"yield"/i)
    expect(body).not.toMatch(/executeTx|calldata|transactionRequest/i)
    for (const d of doc.destinations) {
      expect([
        STUDIO_DESTINATION_ROUTES.liquidity,
        STUDIO_DESTINATION_ROUTES.farms,
        STUDIO_DESTINATION_ROUTES.pools,
      ]).toContain(d.href)
    }
  })

  it('21–24. studio deep links', () => {
    const doc = participationFor(cloneProject())
    expect(doc.pools[0].destination?.href).toBe('/liquidity-studio')
    expect(doc.farms[0].destination?.href).toBe('/farms')
    expect(doc.stakingPools[0].destination?.href).toBe('/pools')
    expect(doc.capabilities.ADD_LIQUIDITY).toBe('AVAILABLE')
    expect(doc.capabilities.OPEN_FARM).toBe('AVAILABLE')
    expect(doc.capabilities.OPEN_POOL).toBe('AVAILABLE')
  })
})

describe('PP006 API, UX, regressions', () => {
  it('public summary and SEO privacy', () => {
    const doc = loadProjectParticipationDocument('melega-dex', FIXED_AT)!
    const summary = toParticipationSummaryForProjectApi(doc)
    const project = cloneProject()
    const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
    const publicJson = toPublicProjectJson(document, {
      participationSummary: summary as unknown as Record<string, unknown>,
    })
    expect(stringify(publicJson)).toContain('participationSummary')
    expect(stringify(publicJson)).not.toContain(WALLET)
    expect(stringify(buildProjectJsonLd(document))).not.toContain('participation')
  })

  it('alias parity and deterministic serialization', () => {
    const a = loadProjectParticipationDocument('melega-dex', FIXED_AT)!
    const b = loadProjectParticipationDocument('melega', FIXED_AT)!
    expect(a.projectId).toBe(b.projectId)
    expect(stringify(a.pools)).toBe(stringify(b.pools))
    expect(stringify(a.farms)).toBe(stringify(b.farms))
  })

  it('UX contracts', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectParticipationSection.tsx'),
      'utf8',
    )
    expect(ui).toContain('No Melega DEX participation opportunities are currently registered for this project.')
    expect(ui).toContain('destination.label')
    expect(ui).toContain('participation-liquidity')
    expect(ui).toContain('participation-farms')
    expect(ui).toContain('participation-pools')
    expect(ui).not.toContain('APY')
    expect(ui).not.toContain('Stake Now')
    const doc = participationFor(cloneProject())
    expect(doc.pools[0].destination?.label).toBe('Open Liquidity Studio')
    expect(doc.farms[0].destination?.label).toBe('Open Farms Studio')
    expect(doc.stakingPools[0].destination?.label).toBe('Open Pools Studio')
  })

  it('25–35. PP001–PP005 and frozen surface regressions', () => {
    expect(resolveProjectBySlug('melega-dex').ok).toBe(true)
    expect(loadProjectEvidencePack('melega-dex')).not.toBeNull()
    expect(loadProjectReadinessDocument('melega-dex')).not.toBeNull()
    expect(loadProjectMarketsDocument('melega-dex')).not.toBeNull()
    expect(loadProjectParticipationDocument('melega-dex')).not.toBeNull()

    const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
    const wr = buildWalletRelationshipDocument({
      document: loaded.document,
      evidencePack: loaded.evidencePack,
      observation: disconnectedObservation(FIXED_AT),
      generatedAt: FIXED_AT,
    })
    expect(wr.status).toBe('DISCONNECTED')

    expect(
      existsSync(path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/participation.ts')),
    ).toBe(true)
    expect(existsSync(path.join(__dirname, '../../../../../pages/api/projects/[slug]/participation.ts'))).toBe(
      true,
    )
    expect(
      readFileSync(path.join(__dirname, '../../../../../pages/api/projects/[slug]/participation.ts'), 'utf8'),
    ).toContain('private, no-store')

    const hq = readFileSync(path.join(__dirname, '../../../../../pages/project-hq/[slug].tsx'), 'utf8')
    expect(hq).toContain('participationDocument')
    expect(hq).toContain('participationAlternate')

    for (const rel of [
      'pages/swap/index.tsx',
      'pages/trade/index.tsx',
      'pages/liquidity-studio.tsx',
      'pages/farms',
      'pages/pools',
      'pages/command-center',
      'views/ProjectPage/ProjectMarketsSection.tsx',
      'views/ProjectPage/WalletRelationshipSection.tsx',
      'views/ProjectPage/ReadinessTrustSnapshot.tsx',
    ]) {
      expect(existsSync(path.join(__dirname, '../../../../../', rel))).toBe(true)
    }

    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('ProjectParticipationSection')
    expect(shell).toContain('ProjectMarketsSection')
    const participateIdx = shell.indexOf('project-participate-slot')
    const trustIdx = shell.indexOf('project-trust-state')
    expect(trustIdx).toBeGreaterThan(participateIdx)
  })
})
