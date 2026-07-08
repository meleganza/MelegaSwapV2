import { TradeType } from '@pancakeswap/sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CAPABILITY_MANIFEST_SCHEMA,
  EXECUTION_MANIFEST_SCHEMA,
  POLICY_ENGINE_SCHEMA,
  buildCapabilityManifest,
  describeSmartRouterCapabilities,
  explainFeeCharge,
  explainTreasurySelection,
  prepareMelegaSmartRouterSwap,
  resolvePricingPolicy,
  resolveSmartRouterPolicies,
} from 'lib/melega-smart-router'

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

describe('Melega Smart Router Phase 2.5', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_TREASURY_COLLECTOR_BSC', COLLECTOR)
  })

  it('policy engine externalizes pricing without changing bps', () => {
    const pricing = resolvePricingPolicy()
    expect(pricing.policyRef).toBe('D87_DEX_PRICING_RATIFIED')
    expect(pricing.protocolFeeStandardBps).toBe(30)
    expect(pricing.protocolFeeBuyMarcoBps).toBe(20)
  })

  it('policy bundle includes all constitutional policy references', () => {
    const bundle = resolveSmartRouterPolicies(56)
    expect(bundle.schema).toBe(POLICY_ENGINE_SCHEMA)
    expect(bundle.pricing.policyRef).toBe('D87_DEX_PRICING_RATIFIED')
    expect(bundle.treasury.policyRef).toBe('FSC-01')
    expect(bundle.execution.exactOutput).toBe('blocked')
    expect(bundle.compliance.forwardsGrossProtocolFeeOnly).toBe(true)
    expect(bundle.chain?.chainId).toBe(56)
  })

  it('successful plan emits execution manifest v1', () => {
    const plan = prepareMelegaSmartRouterSwap({
      chainId: 56,
      tradeType: TradeType.EXACT_INPUT,
      inputAmount: mockAmount('100', mockCurrency(USDT, 'USDT')),
      outputAmount: mockAmount('10', mockCurrency(MARCO_BSC, 'MARCO')),
    })
    expect(plan.ok).toBe(true)
    if (!plan.ok) return

    const manifest = plan.executionManifest
    expect(manifest.schema).toBe(EXECUTION_MANIFEST_SCHEMA)
    expect(manifest.executionId).toMatch(/^exec-56-/)
    expect(manifest.executionLayer).toBe('ADAPTER')
    expect(manifest.pricingPolicy).toBe('D87_DEX_PRICING_RATIFIED')
    expect(manifest.treasuryPolicy).toBe('FSC-01')
    expect(manifest.buyMarcoApplied).toBe(true)
    expect(manifest.protocolFee).toBeTruthy()
    expect(manifest.lpFee).toBe('separate-from-protocol-fee')
    expect(manifest.receiptHash).toMatch(/^0x/)
    expect(manifest.status).toBe('prepared')
    expect(manifest.validationState).toBe('valid')
    expect(manifest.machineReadable).toBeTruthy()
  })

  it('blocked plan emits blocked execution manifest', () => {
    vi.stubEnv('NEXT_PUBLIC_TREASURY_COLLECTOR_BSC', '')
    const blocked = prepareMelegaSmartRouterSwap({
      chainId: 56,
      tradeType: TradeType.EXACT_INPUT,
      inputAmount: mockAmount('1', mockCurrency(USDT, 'USDT')),
      outputAmount: mockAmount('1', mockCurrency(MARCO_BSC, 'MARCO')),
    })
    expect(blocked.ok).toBe(false)
    if (blocked.ok) return
    expect(blocked.executionManifest.schema).toBe(EXECUTION_MANIFEST_SCHEMA)
    expect(blocked.executionManifest.status).toBe('blocked')
    expect(blocked.executionManifest.blockCode).toBe('BLOCKED_TREASURY_COLLECTOR_MISSING')
  })

  it('capability manifest describes all constitutional capabilities', () => {
    const manifest = buildCapabilityManifest(56)
    expect(manifest.schema).toBe(CAPABILITY_MANIFEST_SCHEMA)
    const ids = manifest.capabilities.map((c) => c.id)
    expect(ids).toContain('BUY_MARCO')
    expect(ids).toContain('ADAPTER')
    expect(ids).toContain('WRAPPER')
    expect(ids).toContain('EXACT_OUTPUT')
    expect(manifest.capabilities.find((c) => c.id === 'EXACT_OUTPUT')?.blocked).toBe(true)
    expect(manifest.capabilities.find((c) => c.id === 'ADAPTER')?.supported).toBe(true)
  })

  it('AI readability answers fee and treasury questions', () => {
    const fee = explainFeeCharge(true)
    expect(fee.pricingPolicy).toBe('D87_DEX_PRICING_RATIFIED')
    expect(fee.appliedBps).toBe(20)

    const treasury = explainTreasurySelection(56)
    expect(treasury.treasuryPolicy).toBe('FSC-01')
    expect(treasury.collectorAddress).toBe(COLLECTOR)
  })

  it('describeSmartRouterCapabilities returns capability manifest', () => {
    const caps = describeSmartRouterCapabilities(56)
    expect(caps.schema).toBe(CAPABILITY_MANIFEST_SCHEMA)
    expect(caps.capabilities.length).toBeGreaterThanOrEqual(13)
  })
})
