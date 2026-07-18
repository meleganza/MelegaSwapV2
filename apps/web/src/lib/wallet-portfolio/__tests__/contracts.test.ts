import { describe, expect, it, vi } from 'vitest'
import {
  buildPortfolioPositionId,
  createEmptyWalletPortfolio,
  createNonePortfolioAction,
  PORTFOLIO_POSITION_SCHEMA,
  WALLET_PORTFOLIO_SCHEMA,
  type PortfolioPositionAction,
  type WalletPortfolio,
} from '../contracts'

describe('R791D.2C canonical portfolio contracts', () => {
  it('TEST 1 — Schema identifiers', () => {
    expect(WALLET_PORTFOLIO_SCHEMA).toBe('melega.wallet-portfolio.v1')
    expect(PORTFOLIO_POSITION_SCHEMA).toBe('melega.portfolio-position.v1')
  })

  it('TEST 2 — Empty portfolio root has positions only (no product arrays)', () => {
    const portfolio = createEmptyWalletPortfolio({
      wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      generatedAt: '2026-07-18T00:00:00.000Z',
    })

    expect(Array.isArray(portfolio.positions)).toBe(true)
    expect(portfolio.positions).toEqual([])

    const root = portfolio as WalletPortfolio & Record<string, unknown>
    expect('liquidityPositions' in root).toBe(false)
    expect('farmPositions' in root).toBe(false)
    expect('poolPositions' in root).toBe(false)
    expect('liquidity' in root).toBe(false)
    expect('farms' in root).toBe(false)
    expect('pools' in root).toBe(false)

    expect(root.schema).toBe(WALLET_PORTFOLIO_SCHEMA)
  })

  it('TEST 3 — Null economics (not fabricated zero)', () => {
    const portfolio = createEmptyWalletPortfolio({
      wallet: '0xabc',
      generatedAt: '2026-07-18T00:00:00.000Z',
    })

    expect(portfolio.summary.netValueUsd).toBeNull()
    expect(portfolio.summary.claimableValueUsd).toBeNull()
    expect(portfolio.summary.activePositionCount).toBe(0)
    expect(portfolio.summary.historicalPositionCount).toBe(0)
    expect(portfolio.summary.attentionPositionCount).toBe(0)
    expect(portfolio.summary.pendingActionCount).toBe(0)
  })

  it('TEST 4 — Stable identity', () => {
    const a = buildPortfolioPositionId({
      wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      chainId: 56,
      positionType: 'LIQUIDITY',
      protocolId: 'melega-v2',
      contractOrSourceId: '0x01dB17c476ad6a4c119f559eAb2d1AC9e340278E',
      subPositionId: null,
    })
    const b = buildPortfolioPositionId({
      wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      chainId: 56,
      positionType: 'LIQUIDITY',
      protocolId: 'melega-v2',
      contractOrSourceId: '0x01dB17c476ad6a4c119f559eAb2d1AC9e340278E',
      subPositionId: null,
    })
    expect(a).toBe(b)
  })

  it('TEST 5 — Address normalization (mixed-case → same ID)', () => {
    const mixed = buildPortfolioPositionId({
      wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      chainId: 56,
      positionType: 'FARM',
      protocolId: 'Melega-V2',
      contractOrSourceId: '0x01dB17c476ad6a4c119f559eAb2d1AC9e340278E',
    })
    const lower = buildPortfolioPositionId({
      wallet: '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
      chainId: 56,
      positionType: 'FARM',
      protocolId: 'melega-v2',
      contractOrSourceId: '0x01db17c476ad6a4c119f559eab2d1ac9e340278e',
    })
    expect(mixed).toBe(lower)
  })

  it('TEST 6 — Chain isolation', () => {
    const mainnet = buildPortfolioPositionId({
      wallet: '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
      chainId: 56,
      positionType: 'POOL',
      protocolId: 'melega-v2',
      contractOrSourceId: '0x01db17c476ad6a4c119f559eab2d1ac9e340278e',
    })
    const testnet = buildPortfolioPositionId({
      wallet: '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
      chainId: 97,
      positionType: 'POOL',
      protocolId: 'melega-v2',
      contractOrSourceId: '0x01db17c476ad6a4c119f559eab2d1ac9e340278e',
    })
    expect(mainnet).not.toBe(testnet)
  })

  it('TEST 7 — Type isolation', () => {
    const liquidity = buildPortfolioPositionId({
      wallet: '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
      chainId: 56,
      positionType: 'LIQUIDITY',
      protocolId: 'melega-v2',
      contractOrSourceId: '0x01db17c476ad6a4c119f559eab2d1ac9e340278e',
    })
    const farm = buildPortfolioPositionId({
      wallet: '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
      chainId: 56,
      positionType: 'FARM',
      protocolId: 'melega-v2',
      contractOrSourceId: '0x01db17c476ad6a4c119f559eab2d1ac9e340278e',
    })
    expect(liquidity).not.toBe(farm)
  })

  it('TEST 8 — Sub-position isolation', () => {
    const a = buildPortfolioPositionId({
      wallet: '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
      chainId: 56,
      positionType: 'FARM',
      protocolId: 'melega-v2',
      contractOrSourceId: '0xmasterchef',
      subPositionId: '72',
    })
    const b = buildPortfolioPositionId({
      wallet: '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
      chainId: 56,
      positionType: 'FARM',
      protocolId: 'melega-v2',
      contractOrSourceId: '0xmasterchef',
      subPositionId: '73',
    })
    expect(a).not.toBe(b)
  })

  it('TEST 9 — No timestamp identity', () => {
    const base = {
      wallet: '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
      chainId: 56,
      positionType: 'LIQUIDITY' as const,
      protocolId: 'melega-v2',
      contractOrSourceId: '0x01db17c476ad6a4c119f559eab2d1ac9e340278e',
    }
    const id1 = buildPortfolioPositionId(base)
    const portfolioA = createEmptyWalletPortfolio({
      wallet: base.wallet,
      generatedAt: '2026-01-01T00:00:00.000Z',
    })
    const portfolioB = createEmptyWalletPortfolio({
      wallet: base.wallet,
      generatedAt: '2026-12-31T23:59:59.000Z',
    })
    const id2 = buildPortfolioPositionId(base)
    expect(id1).toBe(id2)
    expect(portfolioA.generatedAt).not.toBe(portfolioB.generatedAt)
    expect(id1).toBe(id2)
  })

  it('TEST 10 — Empty portfolio purity', () => {
    const dateSpy = vi.spyOn(Date, 'now')
    const fetchSpy =
      typeof globalThis.fetch === 'function' ? vi.spyOn(globalThis, 'fetch') : null

    const input = {
      wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      generatedAt: '2026-07-18T12:00:00.000Z',
    }
    const frozen = { ...input }
    const a = createEmptyWalletPortfolio(input)
    const b = createEmptyWalletPortfolio(input)

    expect(input).toEqual(frozen)
    expect(a.positions).not.toBe(b.positions)
    expect(a.claimables).not.toBe(b.claimables)
    expect(a.approvals).not.toBe(b.approvals)
    expect(a.recentActivity).not.toBe(b.recentActivity)
    expect(a.quickActions).not.toBe(b.quickActions)
    expect(dateSpy).not.toHaveBeenCalled()
    if (fetchSpy) {
      expect(fetchSpy).not.toHaveBeenCalled()
      fetchSpy.mockRestore()
    }
    dateSpy.mockRestore()
  })

  it('TEST 11 — Section status initialization', () => {
    const disconnected = createEmptyWalletPortfolio({
      wallet: null,
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    expect(disconnected.sectionStatus.positions.status).toBe('WALLET_NOT_CONNECTED')
    expect(disconnected.sectionStatus.summary.status).toBe('WALLET_NOT_CONNECTED')
    expect(disconnected.sectionStatus.positions.errorCode).toBeNull()
    expect(disconnected.sectionStatus.positions.message).toBeNull()

    const connected = createEmptyWalletPortfolio({
      wallet: '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
      generatedAt: '2026-07-18T00:00:00.000Z',
    })
    expect(connected.sectionStatus.positions.status).toBe('EMPTY')
    expect(connected.sectionStatus.claimables.status).toBe('EMPTY')
    expect(connected.sectionStatus.activity.updatedAt).toBe('2026-07-18T00:00:00.000Z')
  })

  it('TEST 12 — Action shape', () => {
    const enabled: PortfolioPositionAction = {
      type: 'MANAGE',
      label: 'Manage',
      priority: 1,
      route: '/liquidity-studio',
      enabled: true,
      reasonDisabled: null,
    }
    expect(enabled.enabled).toBe(true)
    expect(enabled.route).toBe('/liquidity-studio')
    expect(enabled.reasonDisabled).toBeNull()

    const disabled: PortfolioPositionAction = {
      type: 'REMOVE_LIQUIDITY',
      label: 'Remove Liquidity',
      priority: 2,
      route: null,
      enabled: false,
      reasonDisabled: 'Wallet not connected',
    }
    expect(disabled.enabled).toBe(false)
    expect(disabled.reasonDisabled).toBe('Wallet not connected')

    const none = createNonePortfolioAction()
    expect(none.type).toBe('NONE')
    expect(none.enabled).toBe(false)
    expect(none.route).toBeNull()
    expect(none.reasonDisabled).toBeTruthy()
  })
})
