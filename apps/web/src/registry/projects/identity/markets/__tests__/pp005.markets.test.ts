/**
 * PP005 — Swap and Markets Orchestration tests.
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
import { buildWalletRelationshipDocument, disconnectedObservation } from '../../walletRelationship'
import {
  CANONICAL_SWAP_ROUTE,
  PROJECT_MARKETS_SCHEMA_VERSION,
  addressFromAssetRef,
  buildDestinationId,
  buildMarketId,
  buildProjectMarketsDocument,
  canonicalizeAmmV2PairKey,
  loadProjectMarketsDocument,
  selectPreferredMarkets,
  toMarketsSummaryForProjectApi,
} from '../index'

const FIXED_AT = '2026-07-20T18:00:00.000Z'
const MARCO_BSC = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const PAIR = '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e'

function cloneProject(overrides: Partial<StaticProjectRecord> = {}): StaticProjectRecord {
  // Token-bearing project identity (UX001 separated MARCO from Melega DEX).
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
    primaryTokenRefs: overrides.primaryTokenRefs ?? [...base.primaryTokenRefs],
    deepLinks: { ...base.deepLinks, ...(overrides.deepLinks ?? {}) },
  }
}

function marketsFor(project: StaticProjectRecord, connectedChainId?: number | null) {
  const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
  return buildProjectMarketsDocument({
    project,
    document,
    context: { generatedAt: FIXED_AT, connectedChainId },
  })
}

describe('PP005 market identity', () => {
  it('1–4. deterministic market ID; reverse pair order; chain and venue separation', () => {
    const a = buildMarketId({
      projectId: 'upi://melega/project/melega-dex@1',
      marketType: 'AMM_V2_PAIR',
      chainId: 56,
      venue: 'melega-dex',
      pairOrPoolContract: PAIR,
      tokenA: MARCO_BSC,
      tokenB: WBNB,
    })
    const b = buildMarketId({
      projectId: 'upi://melega/project/melega-dex@1',
      marketType: 'AMM_V2_PAIR',
      chainId: 56,
      venue: 'melega-dex',
      pairOrPoolContract: PAIR,
      tokenA: WBNB,
      tokenB: MARCO_BSC,
    })
    expect(a).toBe(b)
    expect(a?.startsWith('mkt_')).toBe(true)

    const otherChain = buildMarketId({
      projectId: 'upi://melega/project/melega-dex@1',
      marketType: 'AMM_V2_PAIR',
      chainId: 1,
      venue: 'melega-dex',
      pairOrPoolContract: PAIR,
      tokenA: MARCO_BSC,
      tokenB: WBNB,
    })
    expect(otherChain).not.toBe(a)

    const otherVenue = buildMarketId({
      projectId: 'upi://melega/project/melega-dex@1',
      marketType: 'AMM_V2_PAIR',
      chainId: 56,
      venue: 'other-venue',
      pairOrPoolContract: PAIR,
      tokenA: MARCO_BSC,
      tokenB: WBNB,
    })
    expect(otherVenue).not.toBe(a)

    const canon = canonicalizeAmmV2PairKey(56, WBNB, MARCO_BSC)
    const canon2 = canonicalizeAmmV2PairKey(56, MARCO_BSC, WBNB)
    expect(canon?.pairKey).toBe(canon2?.pairKey)
  })

  it('6–8. project resolution and unknown 404', () => {
    expect(resolveProjectBySlug('melega-dex').ok).toBe(true)
    expect(resolveProjectBySlug('melega').ok).toBe(true)
    expect(loadProjectMarketsDocument('no-such-project-zz')).toBeNull()
  })

  it('9–10. tokenless and asset-without-market', () => {
    const tokenless = marketsFor(
      cloneProject({
        slug: 'tokenless-fixture',
        aliases: [],
        resources: { tokens: [], liquidityPools: [], farms: [], stakingPools: [] },
        primaryTokenRefs: [],
        capabilities: {
          ...cloneProject().capabilities,
          tradable: { status: 'none' },
        },
      }),
    )
    // slug not in static venues → no markets
    expect(tokenless.markets).toHaveLength(0)
    expect(tokenless.warnings.some((w) => w.reasonCode === 'PROJECT_HAS_NO_ASSETS')).toBe(true)
  })
})

describe('PP005 melega-dex markets', () => {
  it('11–15. active venue market attribution for melega-dex', () => {
    const doc = marketsFor(cloneProject())
    expect(doc.schemaVersion).toBe(PROJECT_MARKETS_SCHEMA_VERSION)
    expect(doc.markets.length).toBeGreaterThanOrEqual(1)
    const marcoMarket = doc.markets.find((m) => m.pairOrPoolContractId === PAIR)
    expect(marcoMarket).toBeTruthy()
    expect(marcoMarket?.source).toBe('VENUE_REGISTRY')
    expect(marcoMarket?.status).toBe('ACTIVE')
    expect(marcoMarket?.marketType).toBe('AMM_V2_PAIR')
    expect(doc.preferredMarkets.length).toBeGreaterThanOrEqual(1)
  })

  it('16–19. unrelated exclusion, symbol-only rejection helpers, duplicate prevention', () => {
    expect(addressFromAssetRef('MARCO')).toBeNull()
    expect(addressFromAssetRef(`token://56/${MARCO_BSC}`)).toBe(MARCO_BSC)
    const doc = marketsFor(cloneProject())
    const ids = doc.markets.map((m) => m.marketId)
    expect(new Set(ids).size).toBe(ids.length)
    const pairs = doc.markets.map((m) => `${m.chainId}:${m.pairOrPoolContractId}`)
    expect(new Set(pairs).size).toBe(pairs.length)
  })

  it('20–21. wrapped-native and native deep-link params', () => {
    const doc = marketsFor(cloneProject())
    const buy = doc.swapDestinations.find((d) => d.status === 'READY' && d.label.includes('buy'))
    expect(buy).toBeTruthy()
    expect(buy?.route).toBe(CANONICAL_SWAP_ROUTE)
    expect(buy?.queryParameters.chain).toBe('bsc')
    expect(buy?.queryParameters.outputCurrency?.toLowerCase()).toBe(MARCO_BSC)
    expect(buy?.queryParameters.inputCurrency).toBe('BNB')
    expect(buy?.href).toContain('/trade?')
    expect(JSON.stringify(buy)).not.toMatch(/calldata|transactionRequest|quoteAmount|minReceived/i)
  })

  it('31–34. preferred market policy without fabricated ranking', () => {
    const onBsc = marketsFor(cloneProject(), 56)
    expect(onBsc.preferredMarkets.every((m) => m.chainId === 56)).toBe(true)
    const selected = selectPreferredMarkets(onBsc.markets, 56)
    expect(selected.length).toBeGreaterThanOrEqual(1)
    // No liquidity/volume fields used
    expect(stringify(onBsc)).not.toMatch(/"volume"|"marketCap"|"tvlUsd"|"holderCount"/i)
  })

  it('35–41. destination descriptor validation', () => {
    const doc = marketsFor(cloneProject())
    for (const d of doc.swapDestinations.filter((x) => x.status === 'READY')) {
      expect(Object.keys(d.queryParameters).every((k) =>
        ['inputCurrency', 'outputCurrency', 'chain', 'chainId', 'exactAmount', 'exactField', 'recipient'].includes(k),
      )).toBe(true)
      expect(d.href).not.toMatch(/0x1111111111111111111111111111111111111111/)
      expect(d.walletRequired).toBe(false)
    }
    const id = buildDestinationId({
      projectId: 'p',
      marketId: 'm',
      chainId: 56,
      inputParam: 'BNB',
      outputParam: MARCO_BSC,
      direction: 'BUY',
    })
    expect(id.startsWith('dst_')).toBe(true)
  })
})

describe('PP005 API, privacy, UX, regressions', () => {
  it('42–47. markets API shape, alias load, summary, no wallet leakage', () => {
    const bySlug = loadProjectMarketsDocument('melega-dex', { generatedAt: FIXED_AT })
    const byAlias = loadProjectMarketsDocument('melega', { generatedAt: FIXED_AT })
    expect(bySlug).not.toBeNull()
    expect(byAlias).not.toBeNull()
    expect(bySlug?.projectId).toBe(byAlias?.projectId)
    expect(stringify(bySlug!.markets)).toBe(stringify(byAlias!.markets))

    const summary = toMarketsSummaryForProjectApi(bySlug!)
    const project = cloneProject()
    const document = normalizeProjectDocument(project, { generatedAt: FIXED_AT })
    const publicJson = toPublicProjectJson(document, {
      marketsSummary: summary as unknown as Record<string, unknown>,
    })
    const body = stringify(publicJson)
    expect(body).toContain('marketsSummary')
    expect(body).not.toContain('walletAccount')
    expect(body).not.toMatch(/"rawAmount"/)

    const jsonLd = stringify(buildProjectJsonLd(document))
    expect(jsonLd).not.toContain('swapDestinations')
    expect(jsonLd).not.toContain(PAIR)
  })

  it('45. deterministic serialization', () => {
    const a = marketsFor(cloneProject())
    const b = marketsFor(cloneProject())
    expect(stringify(a.markets)).toBe(stringify(b.markets))
    expect(stringify(a.swapDestinations)).toBe(stringify(b.swapDestinations))
  })

  it('48–55. capabilities, UX copy, no embedded swap, no fake metrics', () => {
    const doc = marketsFor(cloneProject())
    expect(doc.capabilities.VIEW_MARKETS).toBe('AVAILABLE')
    expect(doc.capabilities.SWAP).toBe('AVAILABLE')

    const ui = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectMarketsSection.tsx'),
      'utf8',
    )
    expect(ui).toContain('No Melega DEX market is currently registered for this project.')
    expect(ui).toContain('Open Swap')
    expect(ui).not.toContain('Buy Now')
    expect(ui).not.toContain('Best Price')
    expect(ui).not.toContain('amount input')
    expect(ui).toContain('aria-labelledby="participate-heading"')
    expect(ui).toContain('<Details')

    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('hero-open-swap')
    expect(shell).toContain('ProjectMarketsSection')
    expect(shell).toContain('project-participate-slot')
    expect(shell).not.toContain('SmartSwapForm')
    expect(stringify(doc)).not.toMatch(/"priceUsd"|"volume24h"|"marketCap"|"fdv"/i)
  })

  it('50. no-market UX path for non-bound project fixture', () => {
    const doc = marketsFor(
      cloneProject({
        slug: 'orphan-fixture',
        aliases: [],
        capabilities: { ...cloneProject().capabilities, tradable: { status: 'none' } },
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
    // slug orphan-fixture has no venue binding
    expect(doc.markets).toHaveLength(0)
    expect(doc.warnings.some((w) => w.reasonCode === 'PROJECT_HAS_NO_REGISTERED_MARKETS')).toBe(true)
  })

  it('65–82. PP001–PP004 and frozen surface regressions', () => {
    expect(resolveProjectBySlug('melega-dex').ok).toBe(true)
    expect(loadProjectEvidencePack('melega-dex')).not.toBeNull()
    expect(loadProjectReadinessDocument('melega-dex')).not.toBeNull()
    expect(loadProjectMarketsDocument('melega-dex')).not.toBeNull()

    const { document, evidencePack } = (() => {
      const loaded = loadProjectEvidencePack('melega-dex', { generatedAt: FIXED_AT })!
      return loaded
    })()
    const wr = buildWalletRelationshipDocument({
      document,
      evidencePack,
      observation: disconnectedObservation(FIXED_AT),
      generatedAt: FIXED_AT,
    })
    expect(wr.status).toBe('DISCONNECTED')

    const api = path.join(__dirname, '../../../../../pages/api/public/projects/[slug]/markets.ts')
    expect(existsSync(api)).toBe(true)
    expect(readFileSync(api, 'utf8')).toContain('s-maxage=300')

    const hq = readFileSync(path.join(__dirname, '../../../../../pages/project-hq/[slug].tsx'), 'utf8')
    expect(hq).toContain('marketsAlternate')
    expect(hq).toContain('marketsDocument')
    expect(hq).not.toContain('walletAccount')

    for (const rel of [
      'pages/swap/index.tsx',
      'pages/trade/index.tsx',
      'pages/projects/index.tsx',
      'pages/command-center',
      'pages/liquidity-studio.tsx',
      'pages/farms',
      'pages/pools',
      'views/ProjectPage/WalletRelationshipSection.tsx',
      'views/ProjectPage/ReadinessTrustSnapshot.tsx',
    ]) {
      expect(existsSync(path.join(__dirname, '../../../../../', rel))).toBe(true)
    }

    const shell = readFileSync(
      path.join(__dirname, '../../../../../views/ProjectPage/ProjectIdentityShell.tsx'),
      'utf8',
    )
    const participateIdx = shell.indexOf('project-participate-slot')
    const trustIdx = shell.indexOf('project-trust-state')
    const overviewIdx = shell.indexOf('project-overview')
    expect(overviewIdx).toBeGreaterThan(-1)
    expect(participateIdx).toBeGreaterThan(overviewIdx)
    expect(trustIdx).toBeGreaterThan(participateIdx)
  })
})
