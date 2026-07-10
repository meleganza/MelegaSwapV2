import { ChainId, TradeType } from '@pancakeswap/sdk'
import { describe, expect, it } from 'vitest'
import {
  AdapterResolutionError,
  EXECUTION_ADAPTER_COMPATIBILITY,
  EXECUTION_ADAPTER_MATRIX,
  buildExecutionPlan,
  createSmartRouterExecutionAdapter,
  createV2ExecutionAdapter,
  resolveExecutionAdapter,
  resolveExecutionAdapterForSwap,
  resolveRequiredAdapterType,
} from 'lib/melega-smart-router/execution-adapter'
import { prepareMelegaSmartRouterSwap } from 'lib/melega-smart-router'

const MARCO_BSC = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const COLLECTOR = '0x1111111111111111111111111111111111111111'
const V2_MAINNET = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
const SMART_MAINNET = '0xC6665d98Efd81f47B03801187eB46cbC63F328B0'
const V2_TESTNET = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1'

describe('R750 Execution Adapter', () => {
  it('chain 97 always resolves V2ExecutionAdapter', () => {
    const resolved = resolveExecutionAdapterForSwap({
      chainId: ChainId.BSC_TESTNET,
      preferSmartRouter: true,
      inputIsNative: false,
      path: [V2_TESTNET, MARCO_BSC],
    })
    expect(resolved.adapter.routerType()).toBe('V2')
    expect(resolved.adapter.routerAddress().toLowerCase()).toBe(V2_TESTNET.toLowerCase())
  })

  it('chain 56 selects SmartRouterExecutionAdapter when preferSmartRouter', () => {
    const resolved = resolveExecutionAdapterForSwap({
      chainId: ChainId.BSC,
      preferSmartRouter: true,
      inputIsNative: false,
      path: [USDT, MARCO_BSC],
    })
    expect(resolved.adapter.routerType()).toBe('SMART_ROUTER')
    expect(resolved.adapter.routerAddress().toLowerCase()).toBe(SMART_MAINNET.toLowerCase())
  })

  it('chain 56 selects V2ExecutionAdapter when not preferSmartRouter', () => {
    const resolved = resolveExecutionAdapterForSwap({
      chainId: ChainId.BSC,
      preferSmartRouter: false,
      inputIsNative: false,
      path: [USDT, MARCO_BSC],
    })
    expect(resolved.adapter.routerType()).toBe('V2')
    expect(resolved.adapter.routerAddress().toLowerCase()).toBe(V2_MAINNET.toLowerCase())
  })

  it('blocks Smart Router adapter on chain 97 via AdapterResolver', () => {
    const plan = buildExecutionPlan({
      chainId: ChainId.BSC_TESTNET,
      requiredAdapterType: 'SMART_ROUTER',
      inputIsNative: false,
      path: [V2_TESTNET, MARCO_BSC],
    })
    expect(() => resolveExecutionAdapter(plan)).toThrow(AdapterResolutionError)
  })

  it('adapter matrix documents frozen testnet and dual mainnet engines', () => {
    const testnet = EXECUTION_ADAPTER_MATRIX.find((r) => r.chainId === 97)
    const mainnet = EXECUTION_ADAPTER_MATRIX.find((r) => r.chainId === 56)
    expect(testnet?.supportedAdapters).toEqual(['V2'])
    expect(testnet?.frozen).toBe(true)
    expect(mainnet?.supportedAdapters).toEqual(['V2', 'SMART_ROUTER'])
  })

  it('compatibility matrix excludes pricing/treasury from adapters', () => {
    const row = EXECUTION_ADAPTER_COMPATIBILITY.find((r) => r.component.includes('Pricing'))
    expect(row?.chain97).toContain('OUT OF SCOPE')
  })

  it('V2 adapter exposes only execution surface methods', () => {
    const adapter = createV2ExecutionAdapter(56)
    expect(adapter.supports(USDT, MARCO_BSC, true)).toBe(true)
    expect(adapter.supports(USDT, MARCO_BSC, false)).toBe(false)
    expect(adapter.executeExactInput({
      amountIn: '1',
      amountOutMin: '0',
      path: [USDT, MARCO_BSC],
      recipient: COLLECTOR,
      deadline: 9999999999,
      inputIsNative: false,
    }).method).toBe('swapExactTokensForTokens')
  })

  it('Smart Router adapter quote is honestly unsupported on-chain', () => {
    const adapter = createSmartRouterExecutionAdapter(56)
    const quote = adapter.quote({ amountIn: '1', path: [USDT, MARCO_BSC], inputIsNative: false })
    expect(quote.ok).toBe(false)
  })

  it('resolveRequiredAdapterType matches chain policy', () => {
    expect(resolveRequiredAdapterType({ chainId: 97, preferSmartRouter: true })).toBe('V2')
    expect(resolveRequiredAdapterType({ chainId: 56, preferSmartRouter: true })).toBe('SMART_ROUTER')
    expect(resolveRequiredAdapterType({ chainId: 56, preferSmartRouter: false })).toBe('V2')
  })

  it('prepareMelegaSmartRouterSwap uses adapter-resolved router without changing manifest schema', () => {
    process.env.NEXT_PUBLIC_TREASURY_COLLECTOR_BSC = COLLECTOR
    const plan = prepareMelegaSmartRouterSwap({
      chainId: 56,
      tradeType: TradeType.EXACT_INPUT,
      preferSmartRouter: true,
      inputAmount: {
        currency: { isNative: false, symbol: 'USDT', wrapped: { address: USDT } },
        toSignificant: () => '100',
      },
      outputAmount: {
        currency: { isNative: false, symbol: 'MARCO', wrapped: { address: MARCO_BSC } },
        toSignificant: () => '10',
      },
    })
    expect(plan.ok).toBe(true)
    if (plan.ok) {
      expect(plan.underlyingRouter.toLowerCase()).toBe(SMART_MAINNET.toLowerCase())
      expect(plan.executionManifest.schema).toBe('melega.execution-manifest.v1')
    }
  })
})
