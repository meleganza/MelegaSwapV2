import { TradeType } from '@pancakeswap/sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MELEGA_SMART_ROUTER_ARCHITECTURE,
  computeProtocolFeeAmounts,
  getMarcoRegistryEntry,
  getTreasuryCollectorEntry,
  isBuyMarcoByAddress,
  isSellMarcoByAddress,
  prepareMelegaSmartRouterSwap,
  resolveProtocolFeeBps,
} from 'lib/melega-smart-router'
import { FORBIDDEN_HANDOFF_PAYLOAD_FIELDS } from 'lib/treasury-handoff/ownership'

const MARCO_BSC = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const COLLECTOR = '0x1111111111111111111111111111111111111111'

const mockCurrency = (address?: string, symbol = 'TOKEN', isNative = false) => ({
  isNative,
  symbol,
  decimals: 18,
  wrapped: { address: address ?? '0x0000000000000000000000000000000000000000' },
})

const mockAmount = (value: string, currency: ReturnType<typeof mockCurrency>) => ({
  currency,
  toSignificant: () => value,
})

describe('Melega Smart Router D87 adapter', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_TREASURY_COLLECTOR_BSC', COLLECTOR)
  })

  it('architecture decision is ADAPTER', () => {
    expect(MELEGA_SMART_ROUTER_ARCHITECTURE).toBe('ADAPTER')
  })

  it('standard swap uses 30 bps when output is not MARCO', () => {
    const fee = resolveProtocolFeeBps({
      chainId: 56,
      inputAddress: USDT,
      outputAddress: USDT,
    })
    expect(fee.bps).toBe(30)
    expect(fee.buyMarcoIncentiveApplied).toBe(false)
  })

  it('BUY MARCO uses 20 bps when output is chain MARCO address', () => {
    const fee = resolveProtocolFeeBps({ chainId: 56, outputAddress: MARCO_BSC })
    expect(fee.bps).toBe(20)
    expect(fee.buyMarcoIncentiveApplied).toBe(true)
    expect(isBuyMarcoByAddress(56, MARCO_BSC)).toBe(true)
  })

  it('SELL MARCO uses 30 bps when input is MARCO and output is not', () => {
    expect(isSellMarcoByAddress(56, MARCO_BSC, USDT)).toBe(true)
    const fee = resolveProtocolFeeBps({
      chainId: 56,
      inputAddress: MARCO_BSC,
      outputAddress: USDT,
    })
    expect(fee.bps).toBe(30)
    expect(fee.buyMarcoIncentiveApplied).toBe(false)
  })

  it('never detects BUY MARCO by symbol alone', () => {
    expect(isBuyMarcoByAddress(56, undefined)).toBe(false)
    expect(getMarcoRegistryEntry(56).marcoTokenAddress?.toLowerCase()).toBe(MARCO_BSC.toLowerCase())
  })

  it('computes protocol fee separately from LP fee math', () => {
    const { feeAmount, netAmountIn } = computeProtocolFeeAmounts('1000', 30)
    expect(Number(feeAmount)).toBeCloseTo(3, 5)
    expect(Number(netAmountIn)).toBeCloseTo(997, 5)
  })

  it('emits ProtocolFeeCollected metadata on successful plan', () => {
    const plan = prepareMelegaSmartRouterSwap({
      chainId: 56,
      tradeType: TradeType.EXACT_INPUT,
      inputAmount: mockAmount('100', mockCurrency(USDT, 'USDT')),
      outputAmount: mockAmount('10', mockCurrency(MARCO_BSC, 'MARCO')),
    })
    expect(plan.ok).toBe(true)
    if (!plan.ok) return
    expect(plan.events.protocolFeeCollected.protocolFeeBps).toBe(20)
    expect(plan.events.protocolFeeCollected.treasuryCollector).toBe(COLLECTOR)
    expect(plan.events.protocolFeeCollected.pricingRef).toBe('D87_DEX_PRICING_RATIFIED')
    expect(plan.events.protocolFeeCollected.treasuryPolicyRef).toBe('FSC-01')
  })

  it('forwards protocol fee to treasury collector in plan metadata', () => {
    const plan = prepareMelegaSmartRouterSwap({
      chainId: 56,
      tradeType: TradeType.EXACT_INPUT,
      inputAmount: mockAmount('100', mockCurrency(USDT, 'USDT')),
      outputAmount: mockAmount('10', mockCurrency(MARCO_BSC, 'MARCO')),
    })
    expect(plan.ok).toBe(true)
    if (!plan.ok) return
    expect(plan.treasuryCollector).toBe(COLLECTOR)
    expect(plan.feeAmount).toBeTruthy()
  })

  it('does not execute FSC-01 locally in handoff ownership guard', () => {
    expect(FORBIDDEN_HANDOFF_PAYLOAD_FIELDS).toContain('waterfall')
    expect(FORBIDDEN_HANDOFF_PAYLOAD_FIELDS).toContain('referral_amount')
    expect(FORBIDDEN_HANDOFF_PAYLOAD_FIELDS).toContain('buyback_amount')
  })

  it('blocks when treasury collector missing', () => {
    vi.stubEnv('NEXT_PUBLIC_TREASURY_COLLECTOR_BSC', '')
    const blocked = prepareMelegaSmartRouterSwap({
      chainId: 56,
      tradeType: TradeType.EXACT_INPUT,
      inputAmount: mockAmount('1', mockCurrency(USDT, 'USDT')),
      outputAmount: mockAmount('1', mockCurrency(MARCO_BSC, 'MARCO')),
    })
    expect(blocked.ok).toBe(false)
    if (blocked.ok) return
    expect(blocked.code).toBe('BLOCKED_TREASURY_COLLECTOR_MISSING')
  })

  it('blocks exact-output swaps', () => {
    const blocked = prepareMelegaSmartRouterSwap({
      chainId: 56,
      tradeType: TradeType.EXACT_OUTPUT,
      inputAmount: mockAmount('1', mockCurrency(USDT, 'USDT')),
      outputAmount: mockAmount('1', mockCurrency(MARCO_BSC, 'MARCO')),
    })
    expect(blocked.ok).toBe(false)
    if (blocked.ok) return
    expect(blocked.code).toBe('SMART_ROUTER_EXACT_OUTPUT_UNSUPPORTED')
  })

  it('blocks fee-on-transfer path', () => {
    const blocked = prepareMelegaSmartRouterSwap({
      chainId: 56,
      tradeType: TradeType.EXACT_INPUT,
      feeOnTransfer: true,
      inputAmount: mockAmount('1', mockCurrency(USDT, 'USDT')),
      outputAmount: mockAmount('1', mockCurrency(MARCO_BSC, 'MARCO')),
    })
    expect(blocked.ok).toBe(false)
    if (blocked.ok) return
    expect(blocked.code).toBe('SMART_ROUTER_FEE_ON_TRANSFER_UNSUPPORTED')
  })

  it('blocks when MARCO registry missing on unsupported chain', () => {
    const blocked = prepareMelegaSmartRouterSwap({
      chainId: 99999,
      tradeType: TradeType.EXACT_INPUT,
      inputAmount: mockAmount('1', mockCurrency(USDT, 'USDT')),
      outputAmount: mockAmount('1', mockCurrency(USDT, 'USDT')),
    })
    expect(blocked.ok).toBe(false)
    if (blocked.ok) return
    expect(blocked.code).toBe('BLOCKED_CONFIG_MARCO_TOKEN_MISSING')
  })

  it('treasury collector registry reads env without fabricating addresses', () => {
    const entry = getTreasuryCollectorEntry(56)
    expect(entry.collectorAddress).toBe(COLLECTOR)
    expect(entry.policyRef).toBe('FSC-01')
  })
})
