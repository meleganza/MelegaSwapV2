import { describe, expect, it } from 'vitest'
import type { SmartSwapExecutionPreview } from 'lib/smart-swap-execution-preview'
import { resolveExecutionSourceLabel } from '../resolveExecutionSourceLabel'

function preview(partial: Partial<SmartSwapExecutionPreview>): SmartSwapExecutionPreview {
  return {
    routeId: 't',
    inputAmount: '1',
    inputToken: { address: '0x1', symbol: 'BNB', decimals: 18 },
    outputToken: { address: '0x2', symbol: 'MARCO', decimals: 18 },
    expectedOutput: '1',
    expectedOutputFormatted: '1',
    minimumReceived: '1',
    minimumReceivedFormatted: '1',
    slippageBips: 50,
    priceImpactPercent: 0.01,
    priceImpactSeverity: 'LOW',
    priceImpactAvailability: 'available',
    gasEstimateUnits: null,
    gasEstimateAvailability: 'unavailable',
    protocolFee: {
      bps: 20,
      availability: 'available',
      label: '20 bps',
      note: 'Display only — beneficiary is MELEGA TREASURY WALLET per FSC-01 policy',
      rule: 'standard',
    },
    routeHops: [],
    liquiditySources: [],
    hopVisualization: [],
    warnings: [],
    confidence: 70,
    confidenceFactors: [],
    explanation: '',
    timestamp: new Date().toISOString(),
    freshness: null,
    ...partial,
  }
}

describe('resolveExecutionSourceLabel', () => {
  it('returns silent idle labels when no preview hops', () => {
    const r = resolveExecutionSourceLabel(null)
    expect(r.kind).toBe('idle')
    expect(r.label).toBe('')
    expect(r.label).not.toMatch(/unavailable/i)
  })

  it('labels direct single hop as Melega Router · Direct Pool', () => {
    const r = resolveExecutionSourceLabel(
      preview({
        routeHops: [
          {
            index: 0,
            pool: { address: '0xp', kind: 'v2', token0: '0x1', token1: '0x2' },
            tokenIn: '0x1',
            tokenOut: '0x2',
          },
        ],
        liquiditySources: [{ address: '0xp', kind: 'v2', token0: '0x1', token1: '0x2' }],
      }),
    )
    expect(r.label).toBe('Melega Router')
    expect(r.detail).toBe('Direct Pool')
    expect(r.label).not.toBe('Direct pool')
  })

  it('labels multi-hop as Melega Smart Router', () => {
    const r = resolveExecutionSourceLabel(
      preview({
        routeHops: [
          {
            index: 0,
            pool: { address: '0xa', kind: 'v2', token0: '0x1', token1: '0x3' },
            tokenIn: '0x1',
            tokenOut: '0x3',
          },
          {
            index: 1,
            pool: { address: '0xb', kind: 'v2', token0: '0x3', token1: '0x2' },
            tokenIn: '0x3',
            tokenOut: '0x2',
          },
        ],
        liquiditySources: [
          { address: '0xa', kind: 'v2', token0: '0x1', token1: '0x3' },
          { address: '0xb', kind: 'v2', token0: '0x3', token1: '0x2' },
        ],
      }),
    )
    expect(r.label).toBe('Melega Smart Router')
  })
})
