import { describe, expect, it } from 'vitest'

import { verifyKap006cDexGravity } from 'lib/dex-gravity/verifyKap006c'
import { KAP_006C_MARKER, KAP_006E_MARKER } from 'lib/dex-gravity/constants'
import { buildMelegaExchangeReceiptV1 } from 'lib/dex-gravity/buildExchangeReceiptV1'
import { buildExecutionReceiptPayload } from 'lib/treasury-handoff/buildExecutionReceiptPayload'
import { consumeOpportunityRef } from 'lib/dex-gravity/radarConsumption'
import { buildLiquidityCanonicalOwnership } from 'lib/liquidity-runtime/canonicalOwnership'

describe('KAP-006C DEX Gravity validator', () => {
  it('verifyKap006cDexGravity passes all checks', () => {
    const result = verifyKap006cDexGravity()
    expect(result.ok).toBe(true)
    expect(result.marker).toBe(KAP_006C_MARKER)
    expect(result.kap006eClosed).toBe(true)
    expect(result.kap006eMarker).toBe(KAP_006E_MARKER)
    const failed = result.checks.filter((c) => !c.ok)
    expect(failed).toEqual([])
  })

  it('includes KAP-006E closure checks', () => {
    const result = verifyKap006cDexGravity()
    const kap006eIds = result.checks.filter((c) => c.id.startsWith('kap006e-')).map((c) => c.id)
    expect(kap006eIds).toContain('kap006e-v2-commit-facade')
    expect(kap006eIds).toContain('kap006e-cake-enable-ingress-or-exempt')
    expect(kap006eIds).toContain('kap006e-lp-submit-deferral-documented')
    expect(kap006eIds).toContain('kap006e-no-treasury-settlement-computation')
  })
})

describe('KAP-006C treasury handoff backward compatibility', () => {
  it('exchange receipt alias preserves legacy dex-execution-receipt schema', () => {
    const legacy = buildExecutionReceiptPayload({
      chainId: 56,
      transactionHash: '0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890',
      wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      receiptStatus: 1,
      confirmedTime: Date.now(),
      context: {
        schema: 'melega.dex-swap-handoff-context.v1',
        asset: { symbol: 'MARCO', address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b', decimals: 18 },
        amount: '1.0',
        fee: '0.0025',
      },
    })

    const canonical = buildMelegaExchangeReceiptV1(legacy)
    expect(canonical.schema).toBe('melega.exchange-receipt.v1')
    expect(canonical.legacySchema).toBe('melega.dex-execution-receipt.v1')
    expect(legacy.schema).toBe('melega.dex-execution-receipt.v1')
  })
})

describe('KAP-006C liquidity canonicalization', () => {
  it('canonical payload indicates liquidityRuntime ownership', () => {
    const ownership = buildLiquidityCanonicalOwnership('/add')
    expect(ownership.owner).toBe('liquidityRuntime')
    expect(ownership.mintBurnPrimitives).toEqual(['state/mint', 'state/burn'])
    expect(ownership.rewardsOwnership).toBe('farms-pools-separate')
  })
})

describe('KAP-006C radar consumption stub', () => {
  it('consumes opportunityRef without detecting opportunities', () => {
    const result = consumeOpportunityRef('radar:opportunity:123')
    expect(result.source).toBe('radar-consumption')
    expect(result.opportunityRef).toBe('radar:opportunity:123')
  })

  it('fails gracefully when radar URL unavailable', () => {
    const result = consumeOpportunityRef('radar:opportunity:123')
    if (!result.radarAvailable) {
      expect(result.consumed).toBe(false)
    }
  })
})
