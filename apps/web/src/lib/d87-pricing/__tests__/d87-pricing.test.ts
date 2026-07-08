import { describe, expect, it } from 'vitest'
import {
  D87_PRICING_CODEX_ID,
  FSC_01_POLICY_REF,
  SRD_01_POLICY_REF,
  formatServicePricingRows,
  getBuildStudioPricingSummary,
  getD87PricingCodex,
  getFsc01Constitution,
  getServicePriceLabel,
  getSwapProtocolFeeBps,
  isBuyMarcoSwap,
  resolveSwapProtocolFeeContextFromFields,
} from 'lib/d87-pricing'

describe('D87 pricing codex consumption', () => {
  it('loads ratified codex id and service SKUs without hardcoded drift', () => {
    const codex = getD87PricingCodex()
    expect(codex.id).toBe(D87_PRICING_CODEX_ID)
    expect(codex.services.token_creation.standardUsdc).toBe(5)
    expect(codex.services.token_creation.marcoUsdcEquivalent).toBe(4)
    expect(codex.services.farm_creation.standardUsdc).toBe(10)
    expect(codex.services.farm_creation.marcoUsdcEquivalent).toBe(8)
    expect(codex.services.token_self_listing.free).toBe(true)
    expect(codex.services.pool_creation.free).toBe(true)
    expect(codex.services.liquidity_provision.free).toBe(true)
    expect(codex.services.launchpad_integration.free).toBe(true)
    expect(codex.services.swap.protocolFeeStandardBps).toBe(30)
    expect(codex.services.swap.protocolFeeBuyMarcoBps).toBe(20)
    expect(codex.referrals.spec).toBe('SRD-01')
    expect(codex.referrals.localImplementation).toBe(false)
    expect(codex.feeSplit.constitution).toBe('FSC-01')
  })

  it('formats service price labels from codex', () => {
    expect(getServicePriceLabel('token_creation', 'standard')).toBe('5 USDC')
    expect(getServicePriceLabel('token_creation', 'marco')).toBe('4 USDC equivalent (MARCO)')
    expect(getServicePriceLabel('pool_creation')).toBe('FREE')
    expect(getServicePriceLabel('farm_creation', 'marco')).toBe('8 USDC equivalent (MARCO)')
  })

  it('detects buy MARCO by output token address and chainId only', () => {
    expect(
      isBuyMarcoSwap({
        chainId: 56,
        outputAddress: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      }),
    ).toBe(true)
    expect(isBuyMarcoSwap({ chainId: 56, outputSymbol: 'MARCO' })).toBe(false)
    expect(getSwapProtocolFeeBps({ chainId: 56, outputAddress: '0x963556de0eb8138E97A85F0A86eE0acD159D210b' })).toBe(20)
    expect(getSwapProtocolFeeBps({ chainId: 56, outputAddress: '0x55d398326f99059fF775485246999027B3197955' })).toBe(30)
  })

  it('build studio pricing summary derives from codex', () => {
    const summary = getBuildStudioPricingSummary()
    expect(summary.tokenCreation).toBe('5 USDC')
    expect(summary.tokenCreationMarco).toBe('4 USDC equivalent (MARCO)')
    expect(summary.selfListing).toBe('FREE')
    expect(summary.farmCreationMarco).toBe('8 USDC equivalent (MARCO)')
  })

  it('service pricing rows include swap protocol fees from codex bps', () => {
    const rows = formatServicePricingRows()
    const swap = rows.find((r) => r.service === 'swap')
    expect(swap?.standard).toBe('0.30% protocol fee')
    expect(swap?.marco).toBe('0.20% protocol fee (buy MARCO)')
  })
})

describe('FSC-01 constitution consumption', () => {
  it('loads treasury runtime split policy without local DEX splits', () => {
    const fsc = getFsc01Constitution()
    expect(fsc.policyRef).toBe(FSC_01_POLICY_REF)
    expect(fsc.owner).toBe('Treasury Runtime')
    expect(fsc.splits.map((s) => s.percent)).toEqual([52.5, 22.5, 10, 10, 5])
    expect(fsc.splits.find((s) => s.destination === 'referral_distribution')?.referralSpec).toBe('SRD-01')
  })

  it('resolveSwapProtocolFeeContextFromFields attaches FSC-01 ref', () => {
    const ctx = resolveSwapProtocolFeeContextFromFields({
      chainId: 56,
      outputAddress: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    })
    expect(ctx.codexId).toBe(D87_PRICING_CODEX_ID)
    expect(ctx.feeSplitPolicyRef).toBe(FSC_01_POLICY_REF)
    expect(ctx.protocolFeeBps).toBe(20)
    expect(ctx.buyMarcoApplied).toBe(true)
  })
})
