import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS } from 'lib/smartswap-universal-engine/assetIdentity'
import { evmNetwork } from 'lib/smartswap-universal-engine/domain'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from 'lib/smartswap-universal-engine/operatingMode'
import { previewFailure } from 'lib/smart-swap-execution-preview'
import type { ShadowCandidate } from 'lib/smartswap-universal-engine/shadowCompetition'
import {
  SHADOW_RUNTIME_ERROR,
  SHADOW_RUNTIME_EXACT_OUT,
  SHADOW_RUNTIME_FOT_UNPROVEN,
  SHADOW_RUNTIME_TIMEOUT,
  acceptShadowGeneration,
  applyShadowRuntimeResult,
  buildShadowRuntimeRequest,
  runShadowRuntimePreflightAttempt,
  shadowRuntimeRequestKey,
} from '../useShadowRuntimePreflight'

const WEB = path.resolve(__dirname, '../../../../../..')
const PREVIEW = path.resolve(__dirname, '..')

const wbnb = {
  isNative: false,
  address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  decimals: 18,
  symbol: 'WBNB',
  chainId: 56,
}
const usdc = {
  isNative: false,
  address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  decimals: 18,
  symbol: 'USDC',
  chainId: 56,
}

function okWinner(venueId: string): ShadowCandidate {
  return {
    venueId,
    status: 'ok',
    quote: null,
    durationMs: 1,
    originalInputAmountRaw: '1000000',
    netVenueInputRaw: '998000',
    structuralRouteCostBps: 25,
    smartSwapFeeBps: 20,
    feeBand: 'standard',
    feeEnforcementState: 'FEE_PREVIEW_ONLY',
    venueFeeSemantics: null,
    sealedFee: null,
    net: null,
    assessment: null,
    error: null,
    kind: 'FACTUAL',
  }
}

describe('SHADOW runtime preflight isolation', () => {
  it('builds an exact-in request key from chain, tokens, amount, and slippage', () => {
    const built = buildShadowRuntimeRequest({
      chainId: 56,
      inputCurrency: wbnb,
      outputCurrency: usdc,
      inputAmountRaw: '1000000',
      exactOut: false,
      slippageBps: 50,
    })
    expect(built.unavailableReason).toBeNull()
    expect(built.request?.exactOut).toBe(false)
    expect(built.request?.network).toEqual(evmNetwork(56))
    expect(built.requestKey).toBe(
      shadowRuntimeRequestKey({
        chainId: 56,
        inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
        outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
        inputAmountRaw: '1000000',
        slippageBps: 50,
      }),
    )
    const nextAmount = buildShadowRuntimeRequest({
      chainId: 56,
      inputCurrency: wbnb,
      outputCurrency: usdc,
      inputAmountRaw: '2000000',
      exactOut: false,
      slippageBps: 50,
    })
    const nextSlippage = buildShadowRuntimeRequest({
      chainId: 56,
      inputCurrency: wbnb,
      outputCurrency: usdc,
      inputAmountRaw: '1000000',
      exactOut: false,
      slippageBps: 100,
    })
    expect(nextAmount.requestKey).not.toBe(built.requestKey)
    expect(nextSlippage.requestKey).not.toBe(built.requestKey)
  })

  it('marks exact-out unavailable without inventing a V2 quote', () => {
    const built = buildShadowRuntimeRequest({
      chainId: 56,
      inputCurrency: wbnb,
      outputCurrency: usdc,
      inputAmountRaw: '1000000',
      exactOut: true,
      slippageBps: 50,
    })
    expect(built.request).toBeNull()
    expect(built.unavailableReason).toBe(SHADOW_RUNTIME_EXACT_OUT)
  })

  it('discards a stale generation so an older quote cannot overwrite a newer one', async () => {
    expect(acceptShadowGeneration(1, 2)).toBe(false)
    expect(
      applyShadowRuntimeResult({
        startedGeneration: 1,
        currentGeneration: 2,
        requestKey: 'stale',
        winner: okWinner('pancakeswap'),
      }),
    ).toBeNull()

    let generation = 1
    const stale = await runShadowRuntimePreflightAttempt({
      generation: 1,
      currentGeneration: () => generation,
      request: {
        requestId: 'stale',
        network: evmNetwork(56),
        inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
        outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
        inputAmountRaw: '1000000',
        exactOut: false,
        slippageBps: 50,
      },
      requestKey: '56:old',
      unavailableReason: null,
      runAuthorized: async () => {
        generation = 2
        return {
          productionQuote: null,
          melega: null,
          pancake: null,
          uniswap: null,
          candidates: [],
          shadowWinner: okWinner('melega-dex'),
          grossOutputDifferenceRaw: null,
          netOutputDifferenceRaw: null,
          latencyDifferenceMs: null,
          productionMutated: false,
          sameChain: true,
          decisionEvidence: {} as never,
        }
      },
    })
    expect(stale).toBeNull()

    const current = applyShadowRuntimeResult({
      startedGeneration: 2,
      currentGeneration: 2,
      requestKey: '56:new',
      winner: okWinner('pancakeswap'),
    })
    expect(current?.status).toBe('ready')
    expect(current?.winnerVenueId).toBe('pancakeswap')
    expect(current?.v2Available).toBe(true)
    expect(current?.productionExecutionCapable).toBe(false)
    expect(current?.productionCutoverAllowed).toBe(false)
    expect(current?.productionExecutionMode).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
  })

  it('maps timeout, error, exact-out, and unverified FOT to V2 unavailable', async () => {
    const exactOut = await runShadowRuntimePreflightAttempt({
      generation: 3,
      currentGeneration: () => 3,
      request: null,
      requestKey: null,
      unavailableReason: SHADOW_RUNTIME_EXACT_OUT,
    })
    expect(exactOut).toMatchObject({
      status: 'unavailable',
      reason: SHADOW_RUNTIME_EXACT_OUT,
      v2Available: false,
    })

    const timeout = await runShadowRuntimePreflightAttempt({
      generation: 4,
      currentGeneration: () => 4,
      request: {
        requestId: 'timeout',
        network: evmNetwork(56),
        inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
        outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
        inputAmountRaw: '1000000',
        exactOut: false,
        slippageBps: 50,
      },
      requestKey: '56:timeout',
      unavailableReason: null,
      timeoutMs: 20,
      runAuthorized: () => new Promise(() => undefined),
    })
    expect(timeout).toMatchObject({
      status: 'unavailable',
      reason: SHADOW_RUNTIME_TIMEOUT,
      v2Available: false,
    })

    const error = applyShadowRuntimeResult({
      startedGeneration: 5,
      currentGeneration: 5,
      requestKey: '56:error',
      winner: null,
      error: 'RPC_UNAVAILABLE',
    })
    expect(error).toMatchObject({ status: 'unavailable', reason: SHADOW_RUNTIME_ERROR, v2Available: false })

    const fot = applyShadowRuntimeResult({
      startedGeneration: 6,
      currentGeneration: 6,
      requestKey: '56:fot',
      winner: null,
      error: 'MELEGA_DEX_FOT_UNPROVEN',
    })
    expect(fot).toMatchObject({
      status: 'unavailable',
      reason: SHADOW_RUNTIME_FOT_UNPROVEN,
      v2Available: false,
    })
  })

  it('keeps V2 failure isolated from the legacy preview result and Swap CTA', () => {
    const legacy = previewFailure('NO_ROUTE', 'No executable route for this pair and amount.')
    const shadow = applyShadowRuntimeResult({
      startedGeneration: 7,
      currentGeneration: 7,
      requestKey: '56:fail',
      winner: null,
      error: 'TIMEOUT',
    })
    const combined = { ...legacy, shadowRuntime: shadow }
    expect(combined.status).toBe('failure')
    expect(combined.failure).toBe('NO_ROUTE')
    expect(combined.shadowRuntime?.status).toBe('unavailable')
    expect(combined.shadowRuntime?.v2Available).toBe(false)
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(isProductionCutoverAllowed()).toBe(false)

    const previewHook = readFileSync(path.join(PREVIEW, 'useSmartSwapExecutionPreview.ts'), 'utf8')
    expect(previewHook).toMatch(/const preview = useMemo\(/)
    expect(previewHook).toMatch(/return \{ \.\.\.preview, shadowRuntime \}/)
    expect(previewHook).not.toMatch(/prepareV2UserTransactions/)
    expect(previewHook).toMatch(/\[typedValue, parsedAmount, inputCurrency, outputCurrency, trade, allowedSlippage\]/)

    const moduleSrc = readFileSync(path.join(PREVIEW, 'SmartSwapExecutionPreviewModule.tsx'), 'utf8')
    expect(moduleSrc).toMatch(/Swap CTA lives outside this stack/)
    expect(moduleSrc).not.toMatch(/prepareV2UserTransactions/)
    expect(moduleSrc).not.toMatch(/Execute V2|V2 Swap|Shadow Swap/)

    const form = path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx')
    const callback = path.join(WEB, 'src/views/Swap/SmartSwap/hooks/useSwapCallback.ts')
    const commit = path.join(WEB, 'src/views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx')
    expect(existsSync(form)).toBe(true)
    expect(existsSync(callback)).toBe(true)
    expect(existsSync(commit)).toBe(true)
    expect(readFileSync(form, 'utf8')).not.toContain('useShadowRuntimePreflight')
    expect(readFileSync(callback, 'utf8')).not.toContain('prepareV2UserTransactions')
    expect(readFileSync(commit, 'utf8')).toMatch(/t\('Swap'\)/)
    expect(readFileSync(commit, 'utf8')).not.toContain('useShadowRuntimePreflight')
  })
})
