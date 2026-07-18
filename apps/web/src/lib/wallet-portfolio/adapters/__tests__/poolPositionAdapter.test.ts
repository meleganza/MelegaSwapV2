import { describe, expect, it } from 'vitest'
import { PORTFOLIO_POSITION_SCHEMA } from '../../contracts'
import { adaptPoolPositionToPortfolioPosition, type PoolPositionFacts } from '../poolPositionAdapter'

const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'
/** Test-only SmartChef / token fixtures. */
const SOUS = '0xdddddddddddddddddddddddddddddddddddddddd'
const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'

function baseFacts(overrides: Partial<PoolPositionFacts> = {}): PoolPositionFacts {
  return {
    wallet: WALLET,
    chainId: 56,
    chainName: 'BNB Chain',
    protocolId: 'melega-v2',
    contractAddress: SOUS,
    sousId: 0,
    sourceId: 'POOL_STAKE',
    poolName: 'MARCO Staking',
    stakeToken: {
      chainId: 56,
      address: MARCO,
      symbol: 'MARCO',
      name: 'MARCO',
      decimals: 18,
      logoURI: null,
    },
    rewardTokens: [
      {
        chainId: 56,
        address: MARCO,
        symbol: 'MARCO',
        name: 'MARCO',
        decimals: 18,
        logoURI: null,
      },
    ],
    stakedBalance: {
      raw: '1000000000000000000000',
      formatted: '1000.0',
      decimals: 18,
    },
    ownershipVerified: true,
    pendingRewards: {
      raw: '250000000000000000',
      formatted: '0.25',
      decimals: 18,
    },
    hasClaimableRewards: true,
    currentValueUsd: null,
    claimableValueUsd: null,
    pendingRewardsValueUsd: null,
    apr: null,
    emission: null,
    unlockState: 'unlocked',
    isLocked: false,
    isPaused: false,
    isEnded: false,
    runtimeUnavailable: false,
    productRoute: '/pools',
    openRoute: '/pools',
    manageRoute: '/pools',
    claimRoute: '/pools?action=claim',
    withdrawRoute: '/pools?action=withdraw',
    analyticsRoute: null,
    observedAt: '2026-07-18T00:00:00.000Z',
    blockNumber: 40_000_002,
    confidence: null,
    ...overrides,
  }
}

describe('R791D.2F poolPositionAdapter', () => {
  it('TEST 1 — Positive owned pool stake', () => {
    const position = adaptPoolPositionToPortfolioPosition(baseFacts())
    expect(position).not.toBeNull()
    expect(position?.schema).toBe(PORTFOLIO_POSITION_SCHEMA)
    expect(position?.positionType).toBe('POOL')
  })

  it('TEST 2 — Explicit zero stake → null', () => {
    expect(
      adaptPoolPositionToPortfolioPosition(
        baseFacts({
          stakedBalanceIsZero: true,
          stakedBalance: { raw: '0', formatted: '0', decimals: 18 },
          hasClaimableRewards: false,
          pendingRewards: { raw: '0', formatted: '0', decimals: 18 },
        }),
      ),
    ).toBeNull()
  })

  it('TEST 3 — Explicit ownership false → null', () => {
    expect(adaptPoolPositionToPortfolioPosition(baseFacts({ ownershipVerified: false }))).toBeNull()
  })

  it('TEST 4 — Missing optional metadata still yields position', () => {
    const position = adaptPoolPositionToPortfolioPosition(
      baseFacts({
        apr: null,
        emission: null,
        currentValueUsd: null,
        stakeToken: {
          chainId: 56,
          address: MARCO,
          symbol: null,
          name: null,
          decimals: null,
          logoURI: null,
        },
        poolName: 'MARCO Staking',
      }),
    )
    expect(position).not.toBeNull()
    expect(position?.stakeToken?.symbol).toBeNull()
    expect(position?.apr).toBeNull()
  })

  it('TEST 5 — Missing USD economics → null not zero', () => {
    const position = adaptPoolPositionToPortfolioPosition(
      baseFacts({
        currentValueUsd: null,
        claimableValueUsd: null,
        pendingRewardsValueUsd: null,
        apr: null,
        apy: null,
        emission: null,
      }),
    )
    expect(position?.currentValueUsd).toBeNull()
    expect(position?.apr).toBeNull()
    expect(position?.apy).toBeNull()
    expect(position?.currentValueUsd).not.toBe('0')
  })

  it('TEST 6 — Stable identity', () => {
    const a = adaptPoolPositionToPortfolioPosition(baseFacts())
    const b = adaptPoolPositionToPortfolioPosition(
      baseFacts({ wallet: WALLET.toLowerCase(), contractAddress: SOUS.toUpperCase() }),
    )
    expect(a?.positionId).toBe(b?.positionId)
  })

  it('TEST 7 — Balance changes do not change identity', () => {
    const a = adaptPoolPositionToPortfolioPosition(baseFacts())
    const b = adaptPoolPositionToPortfolioPosition(
      baseFacts({ stakedBalance: { raw: '2', formatted: '2', decimals: 18 } }),
    )
    expect(a?.positionId).toBe(b?.positionId)
  })

  it('TEST 8 — Different sousId → different positionId', () => {
    const a = adaptPoolPositionToPortfolioPosition(baseFacts({ sousId: 0 }))
    const b = adaptPoolPositionToPortfolioPosition(baseFacts({ sousId: 1 }))
    expect(a?.positionId).not.toBe(b?.positionId)
  })

  it('TEST 9 — Lifecycle ACTIVE', () => {
    expect(adaptPoolPositionToPortfolioPosition(baseFacts())?.status).toBe('ACTIVE')
  })

  it('TEST 10 — Lifecycle LOCKED', () => {
    expect(
      adaptPoolPositionToPortfolioPosition(baseFacts({ isLocked: true, unlockState: 'locked' }))?.status,
    ).toBe('LOCKED')
  })

  it('TEST 11 — Lifecycle PAUSED', () => {
    expect(adaptPoolPositionToPortfolioPosition(baseFacts({ isPaused: true }))?.status).toBe('PAUSED')
  })

  it('TEST 12 — Lifecycle ENDED', () => {
    expect(adaptPoolPositionToPortfolioPosition(baseFacts({ isEnded: true }))?.status).toBe('ENDED')
  })

  it('TEST 13 — Lifecycle UNAVAILABLE', () => {
    expect(adaptPoolPositionToPortfolioPosition(baseFacts({ runtimeUnavailable: true }))?.status).toBe(
      'UNAVAILABLE',
    )
  })

  it('TEST 14 — Claim primary when claimable', () => {
    const position = adaptPoolPositionToPortfolioPosition(baseFacts())
    expect(position?.actions.primary.type).toBe('CLAIM')
    expect(position?.recommendedAction.type).toBe('CLAIM')
    expect(position?.actions.primary.enabled).toBe(true)
  })

  it('TEST 15 — Manage primary when no claimable', () => {
    const position = adaptPoolPositionToPortfolioPosition(
      baseFacts({
        hasClaimableRewards: false,
        pendingRewards: { raw: '0', formatted: '0', decimals: 18 },
        claimableValueUsd: null,
        pendingRewardsValueUsd: null,
      }),
    )
    expect(position?.actions.primary.type).toBe('MANAGE')
  })

  it('TEST 16 — Ended pool primary WITHDRAW', () => {
    const position = adaptPoolPositionToPortfolioPosition(baseFacts({ isEnded: true }))
    expect(position?.actions.primary.type).toBe('WITHDRAW')
  })

  it('TEST 17 — Unavailable → NONE; purity; MARCO Staking fixture', () => {
    const unavailable = adaptPoolPositionToPortfolioPosition(baseFacts({ runtimeUnavailable: true }))
    expect(unavailable?.actions.primary.type).toBe('NONE')
    expect(unavailable?.actions.primary.enabled).toBe(false)
    expect(unavailable?.actions.primary.reasonDisabled).toBeTruthy()
    expect(unavailable?.producer).toBe('pool-runtime')
    expect(unavailable?.dataState).toBe('UNAVAILABLE')

    const facts = baseFacts()
    const snapshot = JSON.stringify(facts)
    const marco = adaptPoolPositionToPortfolioPosition(facts)
    expect(JSON.stringify(facts)).toBe(snapshot)
    expect(marco?.title).toBe('MARCO Staking')
    expect(marco?.positionType).toBe('POOL')
    expect(marco?.status).toBe('ACTIVE')
    expect(marco?.actions.primary.type).toBe('CLAIM')
    expect(marco?.schema).toBe(PORTFOLIO_POSITION_SCHEMA)
    expect('poolPositions' in (marco as object)).toBe(false)
  })

  it('TEST 18 — Partial provenance when optional economics missing', () => {
    const position = adaptPoolPositionToPortfolioPosition(
      baseFacts({ currentValueUsd: null, apr: null, emission: null, pendingRewards: null }),
    )
    expect(position?.dataState).toBe('PARTIAL')
  })
})
