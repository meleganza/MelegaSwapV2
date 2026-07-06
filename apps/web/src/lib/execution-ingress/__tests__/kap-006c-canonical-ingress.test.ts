import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { createSmartSwapExecutionInstruction } from 'lib/routing-layer'
import { submitSwapViaIngress } from 'lib/execution-ingress/canonicalSubmit'
import {
  dispatchExecutionInstruction,
  setCanonicalIngressEnabledForHarness,
  resetInternalIngressActivation,
} from 'lib/execution-ingress'
import { ExecutionTracker } from 'lib/execution-tracker/tracker'

describe('KAP-006C canonical execution ingress', () => {
  beforeEach(() => {
    ExecutionTracker.resetForTests()
    setCanonicalIngressEnabledForHarness(true)
  })

  afterEach(() => {
    resetInternalIngressActivation()
    ExecutionTracker.resetForTests()
    vi.restoreAllMocks()
  })

  it('submitSwapViaIngress routes through dispatch adapter', async () => {
    const trade = {
      inputAmount: { currency: { symbol: 'BNB' }, quotient: { toString: () => '1000' } },
      outputAmount: { currency: { symbol: 'MARCO' }, quotient: { toString: () => '500' } },
      route: { routeType: 'V2' },
      tradeType: 0,
    }
    const instruction = createSmartSwapExecutionInstruction({
      trade: trade as any,
      allowedSlippage: 50,
      recipient: null,
    })

    const legacy = vi.fn(async () => '0xlegacyhash')
    const hash = await submitSwapViaIngress(instruction, legacy, {
      account: '0xuser',
      chainId: 56,
    })

    expect(hash).toBe('0xlegacyhash')
    expect(legacy).toHaveBeenCalledOnce()
  })

  it('dispatch selects smartSwap adapter handler', async () => {
    const trade = {
      inputAmount: { currency: { symbol: 'BNB' }, quotient: { toString: () => '1000' } },
      outputAmount: { currency: { symbol: 'MARCO' }, quotient: { toString: () => '500' } },
      route: { routeType: 'V2' },
      tradeType: 0,
    }
    const instruction = createSmartSwapExecutionInstruction({
      trade: trade as any,
      allowedSlippage: 50,
      recipient: null,
    })

    const smartSwap = vi.fn(async () => '0xsmarthash')
    const result = await dispatchExecutionInstruction(instruction, {
      account: '0xuser',
      chainId: 56,
      adapters: { smartSwap },
    })

    expect(result.ok).toBe(true)
    expect(smartSwap).toHaveBeenCalledOnce()
  })

  it('falls back to legacy callback when canonical ingress disabled', async () => {
    setCanonicalIngressEnabledForHarness(false)
    const instruction = createSmartSwapExecutionInstruction({
      trade: {
        inputAmount: { currency: { symbol: 'BNB' }, quotient: { toString: () => '1' } },
        outputAmount: { currency: { symbol: 'MARCO' }, quotient: { toString: () => '1' } },
        route: { routeType: 'V2' },
        tradeType: 0,
      } as any,
      allowedSlippage: 50,
      recipient: null,
    })

    const legacy = vi.fn(async () => '0xfallback')
    const hash = await submitSwapViaIngress(instruction, legacy, { account: '0xuser', chainId: 56 })
    expect(hash).toBe('0xfallback')
    expect(legacy).toHaveBeenCalledOnce()
  })
})
