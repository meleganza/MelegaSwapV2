/**
 * MELEGA_DEX_V1_PASSPORT_ZERO_REBUILD — focused contracts (20 scenarios).
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { buildPassportHeroIdentityViewModel } from 'views/PassportStudio/buildPassportHeroIdentityViewModel'
import type { PassportLiquidityPosition } from 'views/PassportStudio/passportLiquidityTypes'
import type { FarmsWalletPosition } from 'views/FarmsStudio/modules/farmsMyFarmsTypes'
import type { PoolsWalletPosition } from 'views/PoolsStudio/modules/poolsMyPositionsTypes'
import type { PassportProjectCardModel } from 'views/PassportStudio/passportProjectsTypes'
import {
  assertPositionDomainSeparation,
  buildClaimables,
  buildHeroCtas,
  buildPassportV1Model,
  buildPortfolioSummary,
} from '../buildPassportV1Model'
import {
  clearOnWalletChange,
  passportCacheKey,
  resolvePassportSurfaceState,
  shouldRejectStaleResponse,
} from '../passportState'
import {
  LIST_CLAIM_PROJECT_HREF,
  LIST_CREATE_PROJECT_HREF,
  explorerAddressUrl,
} from '../helpers'

const V1 = path.resolve(__dirname, '..')
const ARCHIVED = path.resolve(__dirname, '../../_archived_wave04_consumer')
const PAGE = path.resolve(__dirname, '../../../../pages/passport/index.tsx')

const baseIdentity = (overrides: Parameters<typeof buildPassportHeroIdentityViewModel>[0] = {}) =>
  buildPassportHeroIdentityViewModel(overrides)

const emptyDomains = {
  identityLoading: false,
  liquidityLoading: false,
  farmsLoading: false,
  poolsLoading: false,
  projectsLoading: false,
  anyDomainError: false,
  anyDomainPartial: false,
  hasLastGoodPositions: false,
}

function liq(partial: Partial<PassportLiquidityPosition> & { id: string }): PassportLiquidityPosition {
  return {
    type: 'Manual',
    pairLabel: 'MARCO / BNB',
    token0Symbol: 'MARCO',
    token1Symbol: 'BNB',
    token0LogoUrl: null,
    token1LogoUrl: null,
    chainLabel: 'BNB Chain',
    supportingLine: '',
    estimatedValue: '—',
    estimatedValueState: 'unavailable',
    sharePrimary: '—',
    shareSecondary: null,
    feesOrProgressLabel: 'Fees',
    feesOrProgressKind: 'unavailable',
    feesOrProgressValue: '—',
    status: 'Active',
    statusTone: 'active',
    actionLabel: 'Manage',
    actionHref: '/liquidity-studio?view=positions',
    actionAriaLabel: 'Manage',
    destination: '/liquidity-studio',
    freshness: 'indexed',
    source: 'wallet-lp',
    dedupeKey: partial.id,
    ...partial,
  }
}

function farm(partial: Partial<FarmsWalletPosition> & { positionId: string }): FarmsWalletPosition {
  const token = {
    symbol: 'MARCO',
    address: '0x1' as string | null,
    decimals: 18,
    chainId: 56,
  }
  return {
    farmId: '1',
    pid: 1,
    masterChef: '0x1111111111111111111111111111111111111111',
    chainId: 56,
    lpToken: { ...token, symbol: 'LP' },
    token0: token,
    token1: { ...token, symbol: 'BNB' },
    rewardToken: { ...token, symbol: 'MARCO' },
    stakedRaw: '1',
    stakedFormatted: '1.0 LP',
    stakedValue: '($10.00)',
    pendingRaw: '0',
    pendingFormatted: '—',
    pendingValue: null,
    farmStatus: 'ACTIVE',
    positionStatus: 'ACTIVE',
    statusLabel: 'Active',
    apr: null,
    tvl: null,
    multiplier: null,
    actions: [],
    source: 'masterchef',
    freshness: 'live',
    partialData: false,
    partialReasons: [],
    provenance: 'test',
    sourceCard: {} as FarmsWalletPosition['sourceCard'],
    sortPendingUsd: 0,
    sortStakedUsd: 10,
    title: 'MARCO / BNB LP',
    subtitle: 'Earn MARCO',
    farmStateLine: 'Active',
    ...partial,
  }
}

function pool(partial: Partial<PoolsWalletPosition> & { positionId: string }): PoolsWalletPosition {
  const token = {
    symbol: 'MARCO',
    address: '0x1' as string | null,
    decimals: 18,
    chainId: 56,
  }
  return {
    poolId: '1',
    poolContract: '0x2222222222222222222222222222222222222222',
    chainId: 56,
    stakeToken: token,
    rewardToken: { ...token, symbol: 'USDT' },
    stakedRaw: '1',
    stakedFormatted: '100 MARCO',
    stakedValue: '($50.00)',
    claimableRaw: '0',
    claimableFormatted: '—',
    claimableValue: null,
    unlockLine: null,
    lockType: 'flexible',
    poolStatus: 'ACTIVE',
    positionStatus: 'ACTIVE',
    statusLabel: 'Active',
    actions: [],
    source: 'smartchef',
    freshness: 'live',
    partialData: false,
    partialReasons: [],
    errorState: null,
    provenance: 'test',
    sourceCard: {} as PoolsWalletPosition['sourceCard'],
    sortClaimableUsd: 0,
    sortStakedUsd: 50,
    title: 'MARCO Pool',
    subtitle: 'Earn USDT',
    ...partial,
  }
}

describe('Passport Zero Rebuild V1', () => {
  it('archives prior consumer and mounts v1 shell from /passport', () => {
    expect(existsSync(path.join(ARCHIVED, 'PassportScreen.tsx'))).toBe(true)
    expect(existsSync(path.join(V1, 'PassportV1Shell.tsx'))).toBe(true)
    const page = readFileSync(PAGE, 'utf8')
    expect(page).toContain('PassportV1Shell')
    expect(page).not.toContain('PassportScreen')
  })

  it('declares all seven sections without Command Center or greeting', () => {
    const shell = readFileSync(path.join(V1, 'PassportV1Shell.tsx'), 'utf8')
    expect(shell).toContain('data-passport-rebuild="zero-rebuild-v1"')
    expect(shell).toContain('data-passport-nav="none"')
    for (const section of [
      'hero',
      'portfolio',
      'positions',
      'claimables',
      'projects',
      'benefits',
      'account',
    ]) {
      expect(shell).toContain(`data-passport-section="${section}"`)
    }
    expect(shell).toContain('data-passport-command-center="removed"')
    expect(shell).not.toContain('CommandCenterScreen')
    expect(shell).not.toContain('Good morning')
    expect(shell).not.toContain('Active Sessions')
    expect(shell).not.toContain('Recovery Methods')
    expect(shell).not.toContain('Security Alerts')
  })

  it('1. disconnected Passport', () => {
    const identity = baseIdentity({ address: null })
    const model = buildPassportV1Model({
      identity,
      chainId: null,
      liquidity: [],
      farms: [],
      pools: [],
      projects: [],
      projectsEmptyExplanation: 'No verified projects are controlled by this wallet.',
      domains: emptyDomains,
    })
    expect(model.surfaceState).toBe('DISCONNECTED')
    expect(model.heroCtas.some((c) => c.kind === 'connect')).toBe(true)
    expect(model.summary.every((m) => m.value === '—' || m.status === 'unavailable')).toBe(true)
    expect(model.liquidity).toHaveLength(0)
  })

  it('2. connected wallet portfolio (no Passport identity CTAs)', () => {
    const identity = baseIdentity({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    const model = buildPassportV1Model({
      identity,
      chainId: 56,
      liquidity: [],
      farms: [],
      pools: [],
      projects: [],
      projectsEmptyExplanation: 'No verified projects are controlled by this wallet.',
      domains: emptyDomains,
    })
    expect(identity.passportExists).toBe(false)
    expect(model.surfaceState).toBe('CONNECTED_NO_PASSPORT')
    expect(model.heroCtas.some((c) => c.kind === 'create')).toBe(false)
    expect(model.heroCtas.some((c) => c.label.includes('Passport'))).toBe(false)
    expect(model.heroCtas.some((c) => c.kind === 'connect')).toBe(false)
    expect(model.heroCtas.some((c) => c.href === '/farms')).toBe(true)
  })

  it('3. verified wallet portfolio CTAs point to Farms/Pools', () => {
    const identity = baseIdentity({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
      fixture: {
        passportExists: true,
        verificationState: 'verified',
        verificationLabel: 'ID VERIFIED',
        handleDisplay: '@marco',
        managementRoute: '/passport',
      },
    })
    const model = buildPassportV1Model({
      identity,
      chainId: 56,
      liquidity: [],
      farms: [],
      pools: [],
      projects: [],
      projectsEmptyExplanation: 'No verified projects are controlled by this wallet.',
      domains: emptyDomains,
    })
    expect(model.surfaceState).toBe('CONNECTED_PASSPORT_VERIFIED')
    expect(model.heroCtas.some((c) => c.kind === 'view')).toBe(true)
    expect(model.heroCtas.every((c) => !/Passport|Verify Identity/i.test(c.label))).toBe(true)
  })

  it('4. wallet with Liquidity positions', () => {
    const identity = baseIdentity({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    const model = buildPassportV1Model({
      identity,
      chainId: 56,
      liquidity: [liq({ id: 'lp-1', estimatedValue: '$12.00', estimatedValueState: 'indexed' })],
      farms: [],
      pools: [],
      projects: [],
      projectsEmptyExplanation: 'No verified projects are controlled by this wallet.',
      domains: emptyDomains,
    })
    expect(model.liquidity).toHaveLength(1)
    expect(model.summary.find((m) => m.id === 'liquidity')?.value).toBe('1')
  })

  it('5. wallet with Farm positions', () => {
    const identity = baseIdentity({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    const model = buildPassportV1Model({
      identity,
      chainId: 56,
      liquidity: [],
      farms: [farm({ positionId: 'farm-1' })],
      pools: [],
      projects: [],
      projectsEmptyExplanation: 'No verified projects are controlled by this wallet.',
      domains: emptyDomains,
    })
    expect(model.farms).toHaveLength(1)
    expect(model.summary.find((m) => m.id === 'farms')?.value).toBe('1')
  })

  it('6. wallet with Pool positions', () => {
    const identity = baseIdentity({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    const model = buildPassportV1Model({
      identity,
      chainId: 56,
      liquidity: [],
      farms: [],
      pools: [pool({ positionId: 'pool-1' })],
      projects: [],
      projectsEmptyExplanation: 'No verified projects are controlled by this wallet.',
      domains: emptyDomains,
    })
    expect(model.pools).toHaveLength(1)
  })

  it('7. wallet with mixed positions', () => {
    const identity = baseIdentity({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    const model = buildPassportV1Model({
      identity,
      chainId: 56,
      liquidity: [liq({ id: 'lp-1' })],
      farms: [farm({ positionId: 'farm-1' })],
      pools: [pool({ positionId: 'pool-1' })],
      projects: [],
      projectsEmptyExplanation: 'No verified projects are controlled by this wallet.',
      domains: emptyDomains,
    })
    expect(model.liquidity).toHaveLength(1)
    expect(model.farms).toHaveLength(1)
    expect(model.pools).toHaveLength(1)
    const sep = assertPositionDomainSeparation({
      liquidityIds: model.liquidity.map((p) => p.id),
      farmIds: model.farms.map((p) => p.positionId),
      poolIds: model.pools.map((p) => p.positionId),
    })
    expect(sep.ok).toBe(true)
  })

  it('8. wallet with claimable rewards', () => {
    const rows = buildClaimables({
      farms: [
        farm({
          positionId: 'farm-1',
          pendingFormatted: '2.5 MARCO',
          pendingValue: '($1.00)',
        }),
      ],
      pools: [
        pool({
          positionId: 'pool-1',
          claimableFormatted: '3 USDT',
          claimableValue: '($3.00)',
        }),
      ],
    })
    expect(rows).toHaveLength(2)
    expect(rows.every((r) => r.amount !== '—')).toBe(true)
  })

  it('9. wallet with no claimable rewards', () => {
    const rows = buildClaimables({
      farms: [farm({ positionId: 'farm-1', pendingFormatted: '—' })],
      pools: [pool({ positionId: 'pool-1', claimableFormatted: '0 USDT' })],
    })
    expect(rows).toHaveLength(0)
  })

  it('10. wallet with controlled project', () => {
    const project: PassportProjectCardModel = {
      id: 'demo',
      name: 'Demo',
      category: 'Token',
      status: 'Live',
      role: 'Owner',
      kpiKind: 'market_cap',
      kpiLabel: 'Market',
      kpiValue: '—',
      logoLabel: 'D',
      actionKind: 'manage',
      actionLabel: 'Manage Project',
      actionHref: '/list?intent=create-project',
    }
    const identity = baseIdentity({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    const model = buildPassportV1Model({
      identity,
      chainId: 56,
      liquidity: [],
      farms: [],
      pools: [],
      projects: [project],
      projectsEmptyExplanation: 'No verified projects are controlled by this wallet.',
      domains: emptyDomains,
    })
    expect(model.projects).toHaveLength(1)
    expect(model.summary.find((m) => m.id === 'projects')?.value).toBe('1')
  })

  it('11. wallet with no controlled projects', () => {
    const identity = baseIdentity({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    const model = buildPassportV1Model({
      identity,
      chainId: 56,
      liquidity: [],
      farms: [],
      pools: [],
      projects: [],
      projectsEmptyExplanation: 'No verified projects are controlled by this wallet.',
      domains: emptyDomains,
    })
    expect(model.projects).toHaveLength(0)
    expect(model.projectsEmptyCopy).toContain('No verified projects are controlled by this wallet')
  })

  it('12. partial price coverage', () => {
    const summary = buildPortfolioSummary({
      walletConnected: true,
      liquidity: [
        liq({ id: 'a', estimatedValue: '$10.00', estimatedValueState: 'indexed' }),
        liq({ id: 'b', estimatedValue: '—', estimatedValueState: 'unavailable' }),
      ],
      farms: [],
      pools: [],
      claimables: [],
      projectCount: 0,
      domains: emptyDomains,
    })
    expect(summary.partialValuation).toBe(true)
    expect(summary.metrics.find((m) => m.id === 'portfolio')?.status).toBe('partial')
  })

  it('13. Passport runtime unavailable', () => {
    const identity = baseIdentity({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
      sourceUnavailable: true,
    })
    const model = buildPassportV1Model({
      identity,
      chainId: 56,
      liquidity: [liq({ id: 'lp-1', estimatedValue: '$5.00', estimatedValueState: 'indexed' })],
      farms: [],
      pools: [],
      projects: [],
      projectsEmptyExplanation: 'No verified projects are controlled by this wallet.',
      domains: { ...emptyDomains, anyDomainError: true },
    })
    expect(identity.sourceAvailable).toBe(false)
    expect(model.liquidity).toHaveLength(1)
    expect(model.surfaceState).toBe('PARTIAL_WITH_FACTUAL_DATA')
  })

  it('14. wallet change clears prior scope', () => {
    expect(
      clearOnWalletChange({
        previousWallet: '0xaaa',
        nextWallet: '0xbbb',
      }),
    ).toBe(true)
    expect(
      clearOnWalletChange({
        previousWallet: '0xAAA',
        nextWallet: '0xaaa',
      }),
    ).toBe(false)
  })

  it('15. stale response rejection', () => {
    expect(
      shouldRejectStaleResponse({
        requestWallet: '0xaaa',
        requestChainId: 56,
        currentWallet: '0xbbb',
        currentChainId: 56,
        requestGeneration: 1,
        currentGeneration: 1,
      }),
    ).toBe(true)
    expect(
      shouldRejectStaleResponse({
        requestWallet: '0xaaa',
        requestChainId: 56,
        currentWallet: '0xaaa',
        currentChainId: 56,
        requestGeneration: 1,
        currentGeneration: 2,
      }),
    ).toBe(true)
  })

  it('16. last-good retention surface state', () => {
    const state = resolvePassportSurfaceState(
      {
        walletConnected: true,
        walletLoading: false,
        passportExists: false,
        verificationState: 'not_verified',
        sourceAvailable: true,
        walletAddress: '0xabc',
      },
      {
        ...emptyDomains,
        anyDomainError: true,
        hasLastGoodPositions: true,
        hasAnyFactualPositions: true,
      },
    )
    expect(state).toBe('ERROR_WITH_LAST_GOOD')
  })

  it('17. no cross-wallet leakage in cache keys', () => {
    const a = passportCacheKey({ chainId: 56, wallet: '0xAAA', domain: 'farms' })
    const b = passportCacheKey({ chainId: 56, wallet: '0xBBB', domain: 'farms' })
    expect(a).not.toBe(b)
    expect(a).toContain('0xaaa')
  })

  it('18. no position-domain substitution', () => {
    const sep = assertPositionDomainSeparation({
      liquidityIds: ['lp:1'],
      farmIds: ['farm:1'],
      poolIds: ['pool:1'],
    })
    expect(sep.ok).toBe(true)
    const bad = assertPositionDomainSeparation({
      liquidityIds: ['x'],
      farmIds: ['x'],
      poolIds: [],
    })
    expect(bad.ok).toBe(false)
  })

  it('19. List CTA deep links', () => {
    expect(LIST_CLAIM_PROJECT_HREF).toBe('/list?intent=claim-project')
    expect(LIST_CREATE_PROJECT_HREF).toBe('/list?intent=create-project')
    const shell = readFileSync(path.join(V1, 'PassportV1Shell.tsx'), 'utf8')
    expect(shell).toContain('claim-project')
    expect(shell).toContain('create-project')
  })

  it('20. BscScan contract links', () => {
    expect(explorerAddressUrl('0x2222222222222222222222222222222222222222', 56)).toBe(
      'https://bscscan.com/address/0x2222222222222222222222222222222222222222',
    )
    const rows = buildClaimables({
      farms: [
        farm({
          positionId: 'farm-1',
          pendingFormatted: '1 MARCO',
        }),
      ],
      pools: [],
    })
    expect(rows[0]?.contractHref).toContain('bscscan.com/address/')
  })

  it('hero CTAs never contradict a connected wallet', () => {
    const identity = baseIdentity({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    const ctas = buildHeroCtas(identity)
    expect(ctas.every((c) => c.kind !== 'connect')).toBe(true)
  })
})
