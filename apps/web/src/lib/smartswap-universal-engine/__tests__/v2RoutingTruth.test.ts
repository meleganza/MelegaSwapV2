/**
 * P0 SmartSwap runtime routing truth (BSC). Same request: Melega and Pancake are both quoted on the exact SmartSwap
 * net venue input, over the SAME bounded candidate path set (direct + one hop via WBNB); the highest valid net user
 * output wins, with no venue preference; the winner survives shadow -> V2 plan -> V2 display -> pinned confirmation.
 */
import { getAddress } from '@ethersproject/address'
import { Token } from '@pancakeswap/sdk'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS, evmContract } from '../assetIdentity'
import { evmNetwork } from '../domain'
import { computeNetVenueInput } from '../evaluateRevenuePolicy'
import { createMelegaDexAdapter } from '../melegaDexAdapter'
import { isProductionCutoverAllowed } from '../operatingMode'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import type { SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition } from '../shadowCompetition'
import { createSyntheticQuoteSource, v2CandidatePaths, type ShadowQuoteRequest } from '../shadowQuoteSource'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import { buildV2ExecutionBinding, v2RouteHashOf } from '../v2ExecutionBinding'
import {
  V2_PUBLIC_ACTION,
  buildV2UserExecutionPlan,
  currentRequestKeyOf,
  resolveSmartSwapCtaDecision,
} from '../v2UserExecutionPlan'
import {
  SMARTSWAP_DISPLAY_MODE,
  pinV2Confirmation,
  resolveSmartSwapExecutionDisplay,
  type SmartSwapV2ExecutionDisplay,
} from '../../../views/Swap/SmartSwap/utils/v2ExecutionDisplay'

const NOW = '2026-08-20T00:00:05.000Z'
const USER = '0x1111111111111111111111111111111111111111'
const DEADLINE = 1_893_456_000
const GROSS = '1000000'
const NET = '998000'
const MELEGA_ROUTER = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
const EXECUTOR = getAddress('0x7c07082839edd5797737640bba6af47992b9861e')
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
/** Analogue of the founder's ARO -> MARCO pair: a low-liquidity BEP-20 against MARCO. */
const TOKEN_IN = '0x31b5be085af875b675392f5b37a1d0b8c3860222'
const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const DIRECT = `56:${TOKEN_IN}>${MARCO}`
const VIA_WBNB = `56:${TOKEN_IN}>${WBNB}>${MARCO}`

type Quotes = Record<string, { amountOutRaw: string }>

function recording(quotes: Quotes) {
  const calls: ShadowQuoteRequest[] = []
  const base = createSyntheticQuoteSource(quotes)
  return {
    calls,
    source: {
      async fetch(request: ShadowQuoteRequest) {
        calls.push(request)
        return base.fetch(request)
      },
    },
  }
}

function request(): SmartSwapRequest {
  return {
    requestId: 'p0-routing-truth',
    network: evmNetwork(56),
    inputAsset: evmContract(56, TOKEN_IN, 'AARON', 18),
    outputAsset: evmContract(56, MARCO, 'MARCO', 18),
    inputAmountRaw: GROSS,
    exactOut: false,
    slippageBps: 50,
  }
}

async function compete(melegaQuotes: Quotes, pancakeQuotes: Quotes) {
  const melega = recording(melegaQuotes)
  const pancake = recording(pancakeQuotes)
  const result = await runEvmShadowCompetition({
    request: request(),
    productionQuote: null,
    adapters: [createMelegaDexAdapter(null, { quoteSource: melega.source }), createPancakeSwapVenueAdapter(pancake.source)],
    nowIso: NOW,
  })
  return { result, melega, pancake }
}

describe('P0 SmartSwap routing truth: highest valid net user output wins (BSC)', () => {
  it('Case 1: Melega 100 / Pancake 120 -> pancakeswap; both quoted on the exact net venue input and certified routers', async () => {
    const { result, melega, pancake } = await compete({ [DIRECT]: { amountOutRaw: '100' } }, { [DIRECT]: { amountOutRaw: '120' } })
    expect(computeNetVenueInput(GROSS, 20)).toEqual({ feeAmountRaw: '2000', netVenueInputRaw: NET })
    expect([...melega.calls, ...pancake.calls].every((call) => call.amountInRaw === NET)).toBe(true)
    expect(melega.calls.every((call) => call.router === MELEGA_ROUTER)).toBe(true)
    expect(pancake.calls.every((call) => call.router === PANCAKE_ROUTER)).toBe(true)
    expect(result.melega?.net?.netUserOutputRaw).toBe('100')
    expect(result.pancake?.net?.netUserOutputRaw).toBe('120')
    expect(result.melega?.net?.subtractedSmartSwapFeeRaw).toBe('0')
    expect(result.pancake?.net?.subtractedSmartSwapFeeRaw).toBe('0')
    expect(result.shadowWinner?.venueId).toBe('pancakeswap')
  })

  it('Case 2: Melega 120 / Pancake 100 -> melega-dex (no venue preference either way)', async () => {
    const { result } = await compete({ [DIRECT]: { amountOutRaw: '120' } }, { [DIRECT]: { amountOutRaw: '100' } })
    expect(result.shadowWinner?.venueId).toBe('melega-dex')
  })

  it('Case 3: Pancake fails factually, Melega valid -> melega-dex, Pancake failure reason preserved', async () => {
    const { result } = await compete({ [DIRECT]: { amountOutRaw: '120' } }, {})
    expect(result.shadowWinner?.venueId).toBe('melega-dex')
    expect(result.pancake?.status).toBe('no_route')
    expect(result.pancake?.error).toBe('NO_ROUTE')
    expect(result.pancake?.quote).toBeNull()
  })

  it('Case 4: both invalid -> no fake winner', async () => {
    const { result } = await compete({}, {})
    expect(result.shadowWinner).toBeNull()
    expect(result.melega?.status).not.toBe('ok')
    expect(result.pancake?.status).not.toBe('ok')
  })

  it('symmetric candidates: both venues quote direct AND via WBNB with the same net input (no direct-only venue)', async () => {
    const { melega, pancake } = await compete({ [DIRECT]: { amountOutRaw: '100' } }, { [DIRECT]: { amountOutRaw: '120' } })
    const paths = (calls: ShadowQuoteRequest[]) => calls.map((call) => call.path.join('>')).sort()
    expect(paths(melega.calls)).toEqual([`${TOKEN_IN}>${MARCO}`, `${TOKEN_IN}>${WBNB}>${MARCO}`].sort())
    expect(paths(pancake.calls)).toEqual(paths(melega.calls))
  })

  it('multi-hop: Pancake has no direct pool but a better route via WBNB -> pancakeswap with the exact 3-address bound path', async () => {
    const { result } = await compete(
      { [DIRECT]: { amountOutRaw: '316313065945248296' }, [VIA_WBNB]: { amountOutRaw: '315560587672644939' } },
      { [VIA_WBNB]: { amountOutRaw: '317169293125850609' } },
    )
    expect(result.shadowWinner?.venueId).toBe('pancakeswap')
    expect(result.pancake?.net?.netUserOutputRaw).toBe('317169293125850609')
    expect(result.melega?.net?.netUserOutputRaw).toBe('316313065945248296')
    const quote = result.shadowWinner!.quote!
    expect(quote.hops.map((hop) => hop.venueId)).toEqual(['pancakeswap', 'pancakeswap'])
    const binding = buildV2ExecutionBinding({ request: request(), winner: result.shadowWinner, user: USER, deadline: DEADLINE, nonce: 7, nowIso: NOW })
    const path = [getAddress(TOKEN_IN), getAddress(WBNB), getAddress(MARCO)]
    expect(binding.path).toEqual(path)
    expect(binding.intent.router).toBe(PANCAKE_ROUTER)
    expect(binding.intent.routeHash).toBe(v2RouteHashOf(path, false, false))
    expect(binding.intent.inputAmount).toBe(GROSS)
    expect(binding.intent.feeAmount).toBe('2000')
  })

  it('multi-hop: Melega via WBNB best -> melega-dex via WBNB (same rule, no preference)', async () => {
    const { result } = await compete(
      { [VIA_WBNB]: { amountOutRaw: '130' }, [DIRECT]: { amountOutRaw: '90' } },
      { [DIRECT]: { amountOutRaw: '120' }, [VIA_WBNB]: { amountOutRaw: '110' } },
    )
    expect(result.shadowWinner?.venueId).toBe('melega-dex')
    expect(result.shadowWinner?.quote?.hops).toHaveLength(2)
    expect(result.pancake?.net?.netUserOutputRaw).toBe('120')
  })

  it('native / wrapped-native ends and non-BSC chains keep the single direct candidate', () => {
    expect(v2CandidatePaths(56, WBNB, MARCO, WBNB)).toEqual([[WBNB, MARCO]])
    expect(v2CandidatePaths(56, MARCO, WBNB, WBNB)).toEqual([[MARCO, WBNB]])
    expect(v2CandidatePaths(1, TOKEN_IN, MARCO, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')).toHaveLength(1)
    expect(v2CandidatePaths(56, TOKEN_IN, MARCO, WBNB)).toEqual([[TOKEN_IN, MARCO], [TOKEN_IN, WBNB, MARCO]])
  })

  it('Ethereum Uniswap shadow quoting is unchanged (direct only)', async () => {
    const weth = CANONICAL_EXAMPLE_ASSETS.weth
    const usdc = CANONICAL_EXAMPLE_ASSETS.usdcEthereum
    const src = recording({ [`1:${(weth.location as any).address}>${(usdc.location as any).address}`]: { amountOutRaw: '5' } })
    await createUniswapVenueAdapter(src.source).quote(
      { requestId: 'eth', network: evmNetwork(1), inputAsset: weth, outputAsset: usdc, inputAmountRaw: NET, exactOut: false, slippageBps: 50 },
      { signal: new AbortController().signal, nowIso: NOW } as any,
    )
    expect(src.calls).toHaveLength(1)
  })

  it('Case 5: the Pancake winner stays the same through shadow result -> V2 plan -> V2 display -> pinned confirmation', async () => {
    const { result } = await compete(
      { [DIRECT]: { amountOutRaw: '316313065945248296' } },
      { [VIA_WBNB]: { amountOutRaw: '317169293125850609' } },
    )
    const req = request()
    const plan = buildV2UserExecutionPlan({
      user: USER,
      walletChainId: 56,
      request: req,
      requestKey: currentRequestKeyOf(req),
      shadow: { status: 'ready', requestKey: currentRequestKeyOf(req), winner: result.shadowWinner, v2Available: true },
      observedAllowance: { chainId: 56, token: getAddress(TOKEN_IN), owner: USER, spender: EXECUTOR, amountRaw: '0' },
      allowanceReadStatus: 'ok',
      nowIso: NOW,
      deadline: DEADLINE,
      bscPublicCutoverEnabled: true,
    })
    expect(plan.ok).toBe(true)
    expect(plan.winnerVenueId).toBe('pancakeswap')
    expect(plan.binding?.intent.router).toBe(PANCAKE_ROUTER)
    const decision = resolveSmartSwapCtaDecision({
      planOk: plan.ok,
      cutoverAllowed: isProductionCutoverAllowed(56, true) && plan.productionCutoverAllowed,
      testOnlyExecutionGate: false,
      planReason: plan.reason,
    })
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    const inputCurrency = new Token(56, getAddress(TOKEN_IN), 18, 'AARON')
    const outputCurrency = new Token(56, getAddress(MARCO), 18, 'MARCO')
    const display = resolveSmartSwapExecutionDisplay({ decision, plan, v2Pending: false, inputCurrency, outputCurrency })
    expect(display.mode).toBe(SMARTSWAP_DISPLAY_MODE.V2)
    const v2 = display as SmartSwapV2ExecutionDisplay
    expect(v2.venueId).toBe('pancakeswap')
    expect(v2.router).toBe(PANCAKE_ROUTER)
    expect(v2.outputAmount.quotient.toString()).toBe('317169293125850609')
    expect(v2.path.map((c) => c.symbol)).toEqual(['AARON', 'WBNB', 'MARCO'])
    const pinned = pinV2Confirmation(plan, v2)
    expect(pinned?.display.venueId).toBe('pancakeswap')
    expect(pinned?.plan.winnerVenueId).toBe('pancakeswap')
    expect(pinned?.reviewKey).toContain('pancakeswap')
    expect(pinned?.reviewKey).toContain(PANCAKE_ROUTER)
  })
})
