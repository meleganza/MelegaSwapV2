/**
 * PP004 — Wallet Relationship Layer tests.
 * Uses deterministic fixtures and mocked live observations (no production registry pollution).
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import stringify from 'fast-json-stable-stringify'
import { STATIC_PROJECTS } from '../../../projects.data'
import type { StaticProjectRecord } from '../../../types'
import { resolveProjectBySlug } from '../../resolveProject'
import { normalizeProjectDocument, toPublicProjectJson, buildProjectJsonLd } from '../../normalizeProject'
import { buildProjectEvidencePack, loadProjectEvidencePack } from '../../evidence'
import { loadProjectReadinessDocument } from '../../readiness'
import {
  PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION,
  WALLET_RELATIONSHIP_RESOLVER_REVISION,
  buildRelationshipId,
  buildWalletRelationshipDocument,
  buildWalletRelationshipSupportMetadata,
  disconnectedObservation,
  normalizeWalletAccountInput,
  walletAccountFromAddressAndChain,
  type LiveWalletObservation,
} from '../index'

const FIXED_AT = '2026-07-20T15:00:00.000Z'
const WALLET_56 = 'eip155:56:0x1111111111111111111111111111111111111111'
const WALLET_1 = 'eip155:1:0x1111111111111111111111111111111111111111'
const MARCO_BSC = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const UNRELATED = '0x2222222222222222222222222222222222222222'

function cloneProject(overrides: Partial<StaticProjectRecord> = {}): StaticProjectRecord {
  const base = STATIC_PROJECTS.find((p) => p.slug === 'marco') ?? STATIC_PROJECTS[0]
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
  }
}

function packFor(project: StaticProjectRecord) {
  const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
  const evidencePack = buildProjectEvidencePack(document, project, { generatedAt: FIXED_AT, asOf: FIXED_AT })
  return { document, evidencePack }
}

function connectedBase(overrides: Partial<LiveWalletObservation> = {}): LiveWalletObservation {
  return {
    walletAccountCaip10: WALLET_56,
    connectionState: 'CONNECTED',
    activeChainId: 56,
    observedAt: FIXED_AT,
    assetBalances: [],
    assetBalanceAvailability: 'AVAILABLE',
    assetBalanceReason: null,
    liquidityPositions: [],
    liquidityAvailability: 'AVAILABLE',
    liquidityReason: null,
    farmPositions: [],
    farmAvailability: 'AVAILABLE',
    farmReason: null,
    poolPositions: [],
    poolAvailability: 'AVAILABLE',
    poolReason: null,
    ...overrides,
  }
}

function resolveDoc(observation: LiveWalletObservation, project = cloneProject()) {
  const { document, evidencePack } = packFor(project)
  return buildWalletRelationshipDocument({ document, evidencePack, observation, generatedAt: FIXED_AT })
}

describe('PP004 relationship IDs and CAIP', () => {
  it('1. deterministic relationship ID generation', () => {
    const a = buildRelationshipId({
      projectId: 'upi://melega/project/melega-dex@1',
      walletAccount: WALLET_56,
      relationshipType: 'ASSET_HOLDING',
      subjectId: 'asset-a',
      chainId: 56,
    })
    const b = buildRelationshipId({
      projectId: 'upi://melega/project/melega-dex@1',
      walletAccount: WALLET_56,
      relationshipType: 'ASSET_HOLDING',
      subjectId: 'asset-a',
      chainId: 56,
    })
    expect(a).toBe(b)
    expect(a.startsWith('wr_')).toBe(true)
  })

  it('2–5. canonical project / slug / alias / unknown', () => {
    expect(resolveProjectBySlug('melega-dex').ok).toBe(true)
    expect(resolveProjectBySlug('Melega-DEX').ok).toBe(true)
    const alias = resolveProjectBySlug('melega')
    expect(alias.ok).toBe(true)
    if (alias.ok) expect(alias.slug).toBe('melega-dex')
    expect(resolveProjectBySlug('no-such-project-zz').ok).toBe(false)
    expect(loadProjectEvidencePack('no-such-project-zz')).toBeNull()
  })

  it('6–8. malformed account rejection and CAIP-10 normalization', () => {
    expect(normalizeWalletAccountInput('0x1111111111111111111111111111111111111111')).toBeNull()
    expect(normalizeWalletAccountInput('not-an-account')).toBeNull()
    expect(normalizeWalletAccountInput(WALLET_56)).toBe(WALLET_56)
    expect(
      normalizeWalletAccountInput('eip155:56:0x1111111111111111111111111111111111111111'),
    ).toBe(WALLET_56)
    expect(walletAccountFromAddressAndChain('0x1111111111111111111111111111111111111111', 56)).toBe(
      WALLET_56,
    )
  })

  it('8. cross-chain address separation', () => {
    const id56 = buildRelationshipId({
      projectId: 'p',
      walletAccount: WALLET_56,
      relationshipType: 'ASSET_HOLDING',
      subjectId: 'x',
      chainId: 56,
    })
    const id1 = buildRelationshipId({
      projectId: 'p',
      walletAccount: WALLET_1,
      relationshipType: 'ASSET_HOLDING',
      subjectId: 'x',
      chainId: 1,
    })
    expect(id56).not.toBe(id1)
    expect(WALLET_56).not.toBe(WALLET_1)
  })
})

describe('PP004 connection and holding states', () => {
  it('9. disconnected wallet state', () => {
    const doc = resolveDoc(disconnectedObservation(FIXED_AT))
    expect(doc.status).toBe('DISCONNECTED')
    expect(doc.walletAccount).toBeNull()
    expect(doc.relationships).toEqual([])
    expect(doc.errors.some((e) => e.reasonCode === 'WALLET_DISCONNECTED')).toBe(true)
  })

  it('10. connecting wallet state', () => {
    const obs = { ...disconnectedObservation(FIXED_AT), connectionState: 'CONNECTING' as const }
    const doc = resolveDoc(obs)
    expect(doc.walletConnectionState).toBe('CONNECTING')
    expect(doc.status).toBe('DISCONNECTED')
  })

  it('11. connected with no relationship', () => {
    const doc = resolveDoc(connectedBase())
    expect(doc.status).toBe('OK')
    expect(doc.summary.detectedRelationshipCount).toBe(0)
    expect(doc.walletAccount).toBe(WALLET_56)
  })

  it('12–13. one and multiple asset holdings', () => {
    const { document } = packFor(cloneProject())
    const assets = document.assets.filter((a) => a.chainId === 56)
    expect(assets.length).toBeGreaterThan(0)
    const one = resolveDoc(
      connectedBase({
        assetBalances: [
          {
            assetId: assets[0].assetId,
            chainId: 56,
            contractAddress: MARCO_BSC,
            symbol: 'MARCO',
            rawAmount: '1000000000000000000',
            formattedAmount: '1',
            decimals: 18,
            source: 'test',
            observedAt: FIXED_AT,
          },
        ],
      }),
    )
    expect(one.summary.activeHoldingCount).toBe(1)
    expect(one.relationships.some((r) => r.relationshipType === 'ASSET_HOLDING' && r.status === 'ACTIVE')).toBe(
      true,
    )

    const multiAssets = document.assets.slice(0, 2)
    const multi = resolveDoc(
      connectedBase({
        assetBalances: multiAssets.map((a, i) => ({
          assetId: a.assetId,
          chainId: a.chainId,
          contractAddress: a.contractAddress ?? MARCO_BSC,
          symbol: 'MARCO',
          rawAmount: String(i + 1),
          formattedAmount: String(i + 1),
          decimals: 18,
          source: 'test',
          observedAt: FIXED_AT,
        })),
      }),
    )
    expect(multi.summary.activeHoldingCount).toBe(multiAssets.length)
  })

  it('14. tokenless project', () => {
    const project = cloneProject({
      slug: 'tokenless-fixture',
      aliases: [],
      resources: { tokens: [], liquidityPools: [], farms: [], stakingPools: [] },
      primaryTokenRefs: [],
    })
    // tokenless fixture may not be in STATIC — use normalize only
    const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
    const evidencePack = buildProjectEvidencePack(document, project, { generatedAt: FIXED_AT, asOf: FIXED_AT })
    const doc = buildWalletRelationshipDocument({
      document,
      evidencePack,
      observation: connectedBase(),
      generatedAt: FIXED_AT,
    })
    expect(doc.errors.some((e) => e.reasonCode === 'PROJECT_HAS_NO_REGISTERED_ASSETS')).toBe(true)
  })

  it('15. zero token balance is INACTIVE not error', () => {
    const { document } = packFor(cloneProject())
    const asset = document.assets.find((a) => a.chainId === 56)!
    const doc = resolveDoc(
      connectedBase({
        assetBalances: [
          {
            assetId: asset.assetId,
            chainId: 56,
            contractAddress: MARCO_BSC,
            symbol: 'MARCO',
            rawAmount: '0',
            formattedAmount: '0',
            decimals: 18,
            source: 'test',
            observedAt: FIXED_AT,
          },
        ],
      }),
    )
    const holding = doc.relationships.find((r) => r.relationshipType === 'ASSET_HOLDING')
    expect(holding?.status).toBe('INACTIVE')
    expect(holding?.reasonCode).toBe('ZERO_BALANCE')
    expect(doc.summary.activeHoldingCount).toBe(0)
  })

  it('16. unavailable token balance', () => {
    const doc = resolveDoc(
      connectedBase({
        assetBalances: null,
        assetBalanceAvailability: 'UNAVAILABLE',
        assetBalanceReason: 'BALANCE_READ_UNAVAILABLE',
      }),
    )
    expect(doc.status).toBe('PARTIAL')
    expect(doc.errors.some((e) => e.reasonCode === 'BALANCE_READ_UNAVAILABLE')).toBe(true)
    expect(doc.relationships.every((r) => r.relationshipType !== 'ASSET_HOLDING')).toBe(true)
  })

  it('17–19. multi-chain, partial, unsupported chain reason surface', () => {
    const { document } = packFor(cloneProject())
    expect(document.chains.length).toBeGreaterThan(1)
    const doc = resolveDoc(
      connectedBase({
        assetBalances: null,
        assetBalanceReason: 'PARTIAL_CHAIN_COVERAGE',
        liquidityPositions: null,
        liquidityReason: 'CHAIN_UNSUPPORTED',
      }),
    )
    expect(doc.summary.partial).toBe(true)
    expect(doc.errors.some((e) => e.reasonCode === 'PARTIAL_CHAIN_COVERAGE')).toBe(true)
    expect(doc.errors.some((e) => e.reasonCode === 'CHAIN_UNSUPPORTED')).toBe(true)
  })

  it('20–21. duplicate asset mapping / balance prevention', () => {
    const { document } = packFor(cloneProject())
    const asset = document.assets.find((a) => a.chainId === 56)!
    const doc = resolveDoc(
      connectedBase({
        assetBalances: [
          {
            assetId: asset.assetId,
            chainId: 56,
            contractAddress: MARCO_BSC,
            symbol: 'MARCO',
            rawAmount: '5',
            formattedAmount: '5',
            decimals: 18,
            source: 'test',
            observedAt: FIXED_AT,
          },
          {
            assetId: asset.assetId,
            chainId: 56,
            contractAddress: MARCO_BSC.toUpperCase(),
            symbol: 'MARCO',
            rawAmount: '99',
            formattedAmount: '99',
            decimals: 18,
            source: 'test-dup',
            observedAt: FIXED_AT,
          },
        ],
      }),
    )
    expect(doc.summary.activeHoldingCount).toBe(1)
  })
})

describe('PP004 positions and rewards', () => {
  it('22–23. liquidity attribution and unrelated exclusion', () => {
    const withLp = resolveDoc(
      connectedBase({
        liquidityPositions: [
          {
            positionId: 'lp1',
            chainId: 56,
            pairAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            pairLabel: 'MARCO/BNB',
            tokenAddresses: [MARCO_BSC, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
            lpRawAmount: '1000',
            lpFormattedAmount: '0.001',
            source: 'test',
            observedAt: FIXED_AT,
          },
          {
            positionId: 'lp2',
            chainId: 56,
            pairAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            pairLabel: 'OTHER/BNB',
            tokenAddresses: [UNRELATED, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
            lpRawAmount: '1000',
            lpFormattedAmount: '0.001',
            source: 'test',
            observedAt: FIXED_AT,
          },
        ],
      }),
    )
    expect(withLp.summary.liquidityPositionCount).toBe(1)
    expect(withLp.relationships.filter((r) => r.relationshipType === 'LIQUIDITY_POSITION')).toHaveLength(1)
  })

  it('24–26. farm attribution, unrelated exclusion, claimable', () => {
    const doc = resolveDoc(
      connectedBase({
        farmPositions: [
          {
            positionId: 'farm:1',
            chainId: 56,
            farmId: '1',
            label: 'MARCO-BNB',
            stakedRawAmount: '10',
            stakedFormattedAmount: '10',
            pendingRewardRaw: '3',
            pendingRewardFormatted: '3',
            relatedTokenAddresses: [MARCO_BSC],
            source: 'test',
            observedAt: FIXED_AT,
          },
          {
            positionId: 'farm:9',
            chainId: 56,
            farmId: '9',
            label: 'OTHER',
            stakedRawAmount: '10',
            stakedFormattedAmount: '10',
            pendingRewardRaw: null,
            pendingRewardFormatted: null,
            relatedTokenAddresses: [UNRELATED],
            source: 'test',
            observedAt: FIXED_AT,
          },
        ],
      }),
    )
    expect(doc.summary.farmPositionCount).toBe(1)
    expect(doc.summary.claimableCount).toBe(1)
  })

  it('27–28. pool attribution and unrelated exclusion', () => {
    const doc = resolveDoc(
      connectedBase({
        poolPositions: [
          {
            positionId: 'pool:1',
            chainId: 56,
            poolId: '1',
            label: 'MARCO pool',
            stakedRawAmount: '5',
            stakedFormattedAmount: '5',
            pendingRewardRaw: '0',
            pendingRewardFormatted: '0',
            relatedTokenAddresses: [MARCO_BSC],
            source: 'test',
            observedAt: FIXED_AT,
          },
          {
            positionId: 'pool:2',
            chainId: 56,
            poolId: '2',
            label: 'Other',
            stakedRawAmount: '5',
            stakedFormattedAmount: '5',
            pendingRewardRaw: null,
            pendingRewardFormatted: null,
            relatedTokenAddresses: [UNRELATED],
            source: 'test',
            observedAt: FIXED_AT,
          },
        ],
      }),
    )
    expect(doc.summary.poolPositionCount).toBe(1)
  })

  it('29–31. claimable, zero claimable, unavailable reward reader', () => {
    const claimable = resolveDoc(
      connectedBase({
        farmPositions: [
          {
            positionId: 'farm:1',
            chainId: 56,
            farmId: '1',
            label: 'MARCO',
            stakedRawAmount: '1',
            stakedFormattedAmount: '1',
            pendingRewardRaw: '2',
            pendingRewardFormatted: '2',
            relatedTokenAddresses: [MARCO_BSC],
            source: 'test',
            observedAt: FIXED_AT,
          },
        ],
      }),
    )
    expect(claimable.summary.claimableCount).toBe(1)

    const zero = resolveDoc(
      connectedBase({
        farmPositions: [
          {
            positionId: 'farm:1',
            chainId: 56,
            farmId: '1',
            label: 'MARCO',
            stakedRawAmount: '1',
            stakedFormattedAmount: '1',
            pendingRewardRaw: '0',
            pendingRewardFormatted: '0',
            relatedTokenAddresses: [MARCO_BSC],
            source: 'test',
            observedAt: FIXED_AT,
          },
        ],
      }),
    )
    expect(zero.summary.claimableCount).toBe(0)

    const unavailable = resolveDoc(
      connectedBase({
        farmPositions: null,
        farmAvailability: 'UNAVAILABLE',
        farmReason: 'REWARD_READER_UNAVAILABLE',
      }),
    )
    expect(unavailable.errors.some((e) => e.reasonCode === 'REWARD_READER_UNAVAILABLE')).toBe(true)
  })

  it('24. LP and farm are separate relationship types (no merge)', () => {
    const doc = resolveDoc(
      connectedBase({
        liquidityPositions: [
          {
            positionId: 'lp1',
            chainId: 56,
            pairAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            pairLabel: 'MARCO/BNB',
            tokenAddresses: [MARCO_BSC],
            lpRawAmount: '1',
            lpFormattedAmount: '1',
            source: 'test',
            observedAt: FIXED_AT,
          },
        ],
        farmPositions: [
          {
            positionId: 'farm:1',
            chainId: 56,
            farmId: '1',
            label: 'MARCO-BNB',
            stakedRawAmount: '1',
            stakedFormattedAmount: '1',
            pendingRewardRaw: null,
            pendingRewardFormatted: null,
            relatedTokenAddresses: [MARCO_BSC],
            source: 'test',
            observedAt: FIXED_AT,
          },
        ],
      }),
    )
    expect(doc.summary.liquidityPositionCount).toBe(1)
    expect(doc.summary.farmPositionCount).toBe(1)
    expect(doc.summary.detectedRelationshipCount).toBe(2)
  })
})

describe('PP004 governance, control, capabilities, privacy', () => {
  it('32–34. governance / control / contributor unavailable without inventing rights', () => {
    const doc = resolveDoc(connectedBase())
    const gov = doc.relationships.find((r) => r.relationshipType === 'GOVERNANCE_ELIGIBILITY')
    const control = doc.relationships.find((r) => r.relationshipType === 'PROJECT_CONTROL')
    const contrib = doc.relationships.find((r) => r.relationshipType === 'CONTRIBUTOR_ROLE')
    expect(gov?.availability).toBe('UNAVAILABLE')
    expect(gov?.reasonCode).toBe('GOVERNANCE_NOT_REGISTERED')
    expect(control?.availability).toBe('UNAVAILABLE')
    expect(control?.reasonCode).toBe('CONTROL_EVIDENCE_UNAVAILABLE')
    expect(contrib?.reasonCode).toBe('CONTRIBUTOR_ROLE_UNAVAILABLE')
    expect(doc.summary.unavailableCategories).toEqual(
      expect.arrayContaining(['GOVERNANCE_ELIGIBILITY', 'PROJECT_CONTROL', 'CONTRIBUTOR_ROLE']),
    )
  })

  it('37–38. capability relevance without executable descriptors', () => {
    const { document } = packFor(cloneProject())
    const asset = document.assets.find((a) => a.chainId === 56)!
    const doc = resolveDoc(
      connectedBase({
        assetBalances: [
          {
            assetId: asset.assetId,
            chainId: 56,
            contractAddress: MARCO_BSC,
            symbol: 'MARCO',
            rawAmount: '1',
            formattedAmount: '1',
            decimals: 18,
            source: 'test',
            observedAt: FIXED_AT,
          },
        ],
      }),
    )
    expect(doc.relevantCapabilities.some((c) => c.relevance === 'RELEVANT')).toBe(true)
    const serialized = stringify(doc)
    expect(serialized).not.toMatch(/executeTx|transactionRequest|calldata|signTypedData/i)
    expect(doc.relationships.every((r) => !('tx' in r) && !('calldata' in r))).toBe(true)
  })

  it('39–41. no wallet-specific data in PP001 project JSON, SEO, JSON-LD', () => {
    const project = cloneProject()
    const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
    const support = buildWalletRelationshipSupportMetadata(document.slug)
    const publicJson = toPublicProjectJson(document, {
      walletRelationshipSupport: support as unknown as Record<string, unknown>,
    })
    const body = stringify(publicJson)
    expect(body).toContain('walletRelationshipSupport')
    expect(body).not.toContain(WALLET_56)
    expect(body).not.toMatch(/"rawAmount"|"formattedAmount"|"walletAccount"/)
    const jsonLd = stringify(buildProjectJsonLd(document))
    expect(jsonLd).not.toContain(WALLET_56)
    expect(jsonLd).not.toContain('wallet-relationship')
  })

  it('42–44. support metadata, no raw RPC strings, deterministic serialization', () => {
    const meta = buildWalletRelationshipSupportMetadata('melega-dex')
    expect(meta.schemaVersion).toBe(PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION)
    expect(meta.resolverRevision).toBe(WALLET_RELATIONSHIP_RESOLVER_REVISION)
    expect(meta.contextualApiPath).toContain('/api/projects/melega-dex/wallet-relationship/')
    const a = resolveDoc(connectedBase())
    const b = resolveDoc(connectedBase())
    expect(stringify(a)).toBe(stringify(b))
    expect(stringify(a)).not.toMatch(/ECONNREFUSED|JSON-RPC|eth_call failed/i)
  })

  it('45. HTML/resolver parity via shared builder', () => {
    const obs = connectedBase()
    const { document, evidencePack } = packFor(cloneProject())
    const client = buildWalletRelationshipDocument({ document, evidencePack, observation: obs, generatedAt: FIXED_AT })
    const apiStyle = buildWalletRelationshipDocument({ document, evidencePack, observation: obs, generatedAt: FIXED_AT })
    expect(stringify(client)).toBe(stringify(apiStyle))
  })
})

describe('PP004 UX language and invalidation semantics', () => {
  it('47. no-relationship language is neutral', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/WalletRelationshipSection.tsx'),
      'utf8',
    )
    expect(ui).toContain(
      'No active relationship with this project was detected from the currently supported live sources.',
    )
    expect(ui).not.toContain('You own nothing')
    expect(ui).not.toContain('You are not part of this project')
  })

  it('46,48,49. loading a11y, partial disclosure, keyboard details', () => {
    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/WalletRelationshipSection.tsx'),
      'utf8',
    )
    expect(ui).toContain('aria-live')
    expect(ui).toContain('role="status"')
    expect(ui).toContain('Partial or unavailable reads')
    expect(ui).toContain('<Details')
    expect(ui).toContain('<Summary')
    expect(ui).toContain('aria-labelledby="wallet-relationship-heading"')
  })

  it('51–52. wallet/chain account change yields different document identity', () => {
    const a = resolveDoc(connectedBase({ walletAccountCaip10: WALLET_56, activeChainId: 56 }))
    const b = resolveDoc(connectedBase({ walletAccountCaip10: WALLET_1, activeChainId: 1 }))
    expect(a.walletAccount).not.toBe(b.walletAccount)
  })

  it('53. public page still builds when observation fails partially', () => {
    const doc = resolveDoc(
      connectedBase({
        assetBalances: null,
        liquidityPositions: null,
        farmPositions: null,
        poolPositions: null,
        assetBalanceReason: 'RPC_UNAVAILABLE',
        liquidityReason: 'RPC_UNAVAILABLE',
        farmReason: 'RPC_UNAVAILABLE',
        poolReason: 'RPC_UNAVAILABLE',
      }),
    )
    expect(doc.status).toBe('PARTIAL')
    expect(doc.projectId).toBeTruthy()
    expect(doc.slug).toBe('marco')
  })
})

describe('PP004 API route and regressions', () => {
  it('42. endpoint uses private no-store cache headers', () => {
    const api = readFileSync(
      path.join(__dirname, '../../../../../pages/api/projects/[slug]/wallet-relationship.ts'),
      'utf8',
    )
    expect(api).toContain('private, no-store')
    expect(api).toContain('ACCOUNT_INVALID')
    expect(api).toContain('LIVE_READ_CLIENT_REQUIRED')
  })

  it('54–58. PP001–PP003 regressions', () => {
    expect(resolveProjectBySlug('melega-dex').ok).toBe(true)
    expect(loadProjectEvidencePack('melega-dex')).not.toBeNull()
    expect(loadProjectReadinessDocument('melega-dex')).not.toBeNull()
    const publicPath = path.join(__dirname, '../../../../../pages/api/public/projects/[slug].ts')
    const evidenceApi = path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/evidence.ts')
    const readinessApi = path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/readiness.ts')
    expect(existsSync(publicPath)).toBe(true)
    expect(existsSync(evidenceApi)).toBe(true)
    expect(existsSync(readinessApi)).toBe(true)
    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('ReadinessTrustSnapshot')
    expect(shell).toContain('TrustEvidencePanel')
    expect(shell).toContain('ClientWalletRelationship')
    expect(shell).toContain('project-wallet-relationship-slot')
  })

  it('59–65. frozen surface paths unchanged (presence regression)', () => {
    const roots = [
      'pages/project-hq/[slug].tsx',
      'pages/projects/index.tsx',
      'pages/command-center',
      'pages/liquidity-studio.tsx',
      'pages/farms',
      'pages/pools',
      'views/CommandCenter',
      'views/LiquidityStudio',
      'views/FarmsStudio',
      'views/PoolsStudio',
    ]
    for (const rel of roots) {
      const full = path.join(__dirname, '../../../../../', rel)
      expect(existsSync(full)).toBe(true)
    }
    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    // Trust remains after overview; wallet slot before overview
    const walletIdx = shell.indexOf('project-wallet-relationship-slot')
    const overviewIdx = shell.indexOf('project-overview')
    const trustIdx = shell.indexOf('project-trust-state')
    expect(walletIdx).toBeGreaterThan(-1)
    expect(overviewIdx).toBeGreaterThan(walletIdx)
    expect(trustIdx).toBeGreaterThan(overviewIdx)
  })

  it('invalid account observation', () => {
    const doc = resolveDoc(connectedBase({ walletAccountCaip10: 'bad' }))
    expect(doc.status).toBe('INVALID_ACCOUNT')
    expect(doc.errors.some((e) => e.reasonCode === 'ACCOUNT_INVALID')).toBe(true)
  })

  it('schema version present', () => {
    const doc = resolveDoc(connectedBase())
    expect(doc.schemaVersion).toBe('melega.project-wallet-relationship.v1')
    expect(doc.resolverRevision).toBe('PP004_WALLET_RELATIONSHIP_V1')
  })
})
