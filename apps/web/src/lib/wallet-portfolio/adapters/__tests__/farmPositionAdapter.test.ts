import { describe, expect, it } from 'vitest'
import { PORTFOLIO_POSITION_SCHEMA } from '../../contracts'
import { adaptFarmPositionToPortfolioPosition, type FarmPositionFacts } from '../farmPositionAdapter'

const WALLET = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'
/** Test-only MasterChef / LP fixtures. */
const MASTERCHEF = '0xcccccccccccccccccccccccccccccccccccccccc'
const LP = '0x01db17c476ad6a4c119f559eab2d1ac9e340278e'
const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'

function baseFacts(overrides: Partial<FarmPositionFacts> = {}): FarmPositionFacts {
  return {
    wallet: WALLET,
    chainId: 56,
    chainName: 'BNB Chain',
    protocolId: 'melega-v2',
    contractAddress: MASTERCHEF,
    pid: 72,
    sourceId: 'FARM_STAKE',
    farmName: 'MM72 Farm',
    stakeToken: {
      chainId: 56,
      address: LP,
      symbol: 'MM72-LP',
      name: 'MM72 / MARCO LP',
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
      raw: '1000000000000000000',
      formatted: '1.0',
      decimals: 18,
    },
    ownershipVerified: true,
    pendingRewards: {
      raw: '500000000000000000',
      formatted: '0.5',
      decimals: 18,
    },
    hasClaimableRewards: true,
    currentValueUsd: null,
    claimableValueUsd: null,
    pendingRewardsValueUsd: null,
    apr: null,
    unlockState: 'unlocked',
    isLocked: false,
    isPaused: false,
    isEnded: false,
    runtimeUnavailable: false,
    productRoute: '/farms',
    openRoute: '/farms',
    manageRoute: '/farms',
    harvestRoute: '/farms?action=harvest',
    withdrawRoute: '/farms?action=withdraw',
    analyticsRoute: null,
    observedAt: '2026-07-18T00:00:00.000Z',
    blockNumber: 40_000_001,
    confidence: null,
    ...overrides,
  }
}

describe('R791D.2E farmPositionAdapter', () => {
  it('TEST 1 — Positive owned farm stake', () => {
    const position = adaptFarmPositionToPortfolioPosition(baseFacts())
    expect(position).not.toBeNull()
    expect(position?.schema).toBe(PORTFOLIO_POSITION_SCHEMA)
    expect(position?.positionType).toBe('FARM')
  })

  it('TEST 2 — Explicit zero stake → null', () => {
    expect(
      adaptFarmPositionToPortfolioPosition(
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
    expect(adaptFarmPositionToPortfolioPosition(baseFacts({ ownershipVerified: false }))).toBeNull()
  })

  it('TEST 4 — Missing optional metadata still yields position', () => {
    const position = adaptFarmPositionToPortfolioPosition(
      baseFacts({
        apr: null,
        currentValueUsd: null,
        stakeToken: {
          chainId: 56,
          address: LP,
          symbol: null,
          name: null,
          decimals: null,
          logoURI: null,
        },
        farmName: 'MM72 Farm',
      }),
    )
    expect(position).not.toBeNull()
    expect(position?.stakeToken?.symbol).toBeNull()
    expect(position?.apr).toBeNull()
  })

  it('TEST 5 — Missing USD economics → null not zero', () => {
    const position = adaptFarmPositionToPortfolioPosition(
      baseFacts({
        currentValueUsd: null,
        claimableValueUsd: null,
        pendingRewardsValueUsd: null,
        apr: null,
        apy: null,
      }),
    )
    expect(position?.currentValueUsd).toBeNull()
    expect(position?.apr).toBeNull()
    expect(position?.apy).toBeNull()
    expect(position?.currentValueUsd).not.toBe('0')
  })

  it('TEST 6 — Stable identity', () => {
    const a = adaptFarmPositionToPortfolioPosition(baseFacts())
    const b = adaptFarmPositionToPortfolioPosition(
      baseFacts({ wallet: WALLET.toLowerCase(), contractAddress: MASTERCHEF.toUpperCase() }),
    )
    expect(a?.positionId).toBe(b?.positionId)
  })

  it('TEST 7 — Balance changes do not change identity', () => {
    const a = adaptFarmPositionToPortfolioPosition(baseFacts())
    const b = adaptFarmPositionToPortfolioPosition(
      baseFacts({ stakedBalance: { raw: '2', formatted: '2', decimals: 18 } }),
    )
    expect(a?.positionId).toBe(b?.positionId)
  })

  it('TEST 8 — Different pid → different positionId', () => {
    const a = adaptFarmPositionToPortfolioPosition(baseFacts({ pid: 72 }))
    const b = adaptFarmPositionToPortfolioPosition(baseFacts({ pid: 73 }))
    expect(a?.positionId).not.toBe(b?.positionId)
  })

  it('TEST 9 — Lifecycle ACTIVE', () => {
    expect(adaptFarmPositionToPortfolioPosition(baseFacts())?.status).toBe('ACTIVE')
  })

  it('TEST 10 — Lifecycle LOCKED', () => {
    expect(
      adaptFarmPositionToPortfolioPosition(baseFacts({ isLocked: true, unlockState: 'locked' }))?.status,
    ).toBe('LOCKED')
  })

  it('TEST 11 — Lifecycle PAUSED', () => {
    expect(adaptFarmPositionToPortfolioPosition(baseFacts({ isPaused: true }))?.status).toBe('PAUSED')
  })

  it('TEST 12 — Lifecycle ENDED', () => {
    expect(adaptFarmPositionToPortfolioPosition(baseFacts({ isEnded: true }))?.status).toBe('ENDED')
  })

  it('TEST 13 — Lifecycle UNAVAILABLE', () => {
    expect(adaptFarmPositionToPortfolioPosition(baseFacts({ runtimeUnavailable: true }))?.status).toBe(
      'UNAVAILABLE',
    )
  })

  it('TEST 14 — Harvest primary when claimable', () => {
    const position = adaptFarmPositionToPortfolioPosition(baseFacts())
    expect(position?.actions.primary.type).toBe('HARVEST')
    expect(position?.recommendedAction.type).toBe('HARVEST')
    expect(position?.actions.primary.enabled).toBe(true)
  })

  it('TEST 15 — Manage primary when no claimable', () => {
    const position = adaptFarmPositionToPortfolioPosition(
      baseFacts({
        hasClaimableRewards: false,
        pendingRewards: { raw: '0', formatted: '0', decimals: 18 },
        claimableValueUsd: null,
        pendingRewardsValueUsd: null,
      }),
    )
    expect(position?.actions.primary.type).toBe('MANAGE')
  })

  it('TEST 16 — Ended farm primary WITHDRAW', () => {
    const position = adaptFarmPositionToPortfolioPosition(baseFacts({ isEnded: true }))
    expect(position?.actions.primary.type).toBe('WITHDRAW')
  })

  it('TEST 17 — Unavailable → NONE disabled; purity; MM72 fixture', () => {
    const unavailable = adaptFarmPositionToPortfolioPosition(baseFacts({ runtimeUnavailable: true }))
    expect(unavailable?.actions.primary.type).toBe('NONE')
    expect(unavailable?.actions.primary.enabled).toBe(false)
    expect(unavailable?.actions.primary.reasonDisabled).toBeTruthy()
    expect(unavailable?.producer).toBe('farm-runtime')
    expect(unavailable?.dataState).toBe('UNAVAILABLE')

    const facts = baseFacts()
    const snapshot = JSON.stringify(facts)
    const mm72 = adaptFarmPositionToPortfolioPosition(facts)
    expect(JSON.stringify(facts)).toBe(snapshot)
    expect(mm72?.title).toBe('MM72 Farm')
    expect(mm72?.positionType).toBe('FARM')
    expect(mm72?.status).toBe('ACTIVE')
    expect(mm72?.actions.primary.type).toBe('HARVEST')
    expect(mm72?.schema).toBe(PORTFOLIO_POSITION_SCHEMA)
    expect('farmPositions' in (mm72 as object)).toBe(false)
  })

  it('TEST 18 — Partial provenance when optional economics missing', () => {
    const position = adaptFarmPositionToPortfolioPosition(
      baseFacts({ currentValueUsd: null, apr: null, pendingRewards: null }),
    )
    expect(position?.dataState).toBe('PARTIAL')
  })
})
