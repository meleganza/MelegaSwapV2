import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS } from '../assetIdentity'
import { MELEGA_DEX_VENUE } from '../certifiedVenues'
import { evmNetwork } from '../domain'
import { computeFeeAmountRaw, computeNetVenueInput } from '../evaluateRevenuePolicy'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import {
  MELEGA_DEX_EXACT_QUOTE_ROUTER_MISSING,
  MELEGA_DEX_FOT_UNPROVEN,
  MELEGA_DEX_NET_INPUT_QUOTE_UNAVAILABLE,
  createMelegaDexAdapter,
  type LegacyMelegaQuoteSnapshot,
} from '../melegaDexAdapter'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isLegacyProductionAuthoritative,
  isProductionCutoverAllowed,
  isUniversalEngineShadowOnly,
} from '../operatingMode'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import { computeMinimumReceived, type SmartSwapRequest } from '../quote'
import { FEE_ASSET_SOURCE } from '../quoteFee'
import { runEvmShadowCompetition } from '../shadowCompetition'
import { createSyntheticQuoteSource, type ShadowQuoteRequest } from '../shadowQuoteSource'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import {
  MELEGA_V2_EXECUTION_BINDING_UNAVAILABLE,
  V2_BINDING_QUOTE_STALE,
  buildV2ExecutionBinding,
  v2VenueIdHash,
} from '../v2ExecutionBinding'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'

const WEB = path.resolve(__dirname, '../../../..')
const NOW = '2026-08-20T00:00:05.000Z'
const GROSS_INPUT = '1000000'
const USER = '0x1111111111111111111111111111111111111111'
const DEADLINE = 1_893_456_000
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_BSC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC_ETH = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const MELEGA_ROUTER = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
const UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

const LEGACY: LegacyMelegaQuoteSnapshot = {
  chainId: 56,
  input: { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', symbol: 'WBNB', decimals: 18 },
  output: { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', decimals: 18 },
  inputAmountRaw: GROSS_INPUT,
  expectedOutputRaw: '600000',
  pathAddresses: [
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  ],
  freshness: NOW,
  slippageBps: 50,
}

function bscRequest(): SmartSwapRequest {
  return {
    requestId: 'melega-bsc-exact',
    network: evmNetwork(56),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw: GROSS_INPUT,
    exactOut: false,
    slippageBps: 50,
  }
}

function recordingSource(quotes: Record<string, { amountOutRaw: string }>) {
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

function bind(request: SmartSwapRequest, winner: Parameters<typeof buildV2ExecutionBinding>[0]['winner']) {
  return buildV2ExecutionBinding({
    request,
    winner,
    user: USER,
    deadline: DEADLINE,
    nonce: 7,
    nowIso: NOW,
  })
}

describe('Melega BSC exact-amount quote and V2 binding', () => {
  it('A/D/E: same BSC request quotes exact net input for Melega and Pancake and ranks those outputs', async () => {
    const melega = recordingSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '410000' } })
    const pancake = recordingSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '420000' } })
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: null,
      adapters: [
        createMelegaDexAdapter(LEGACY, { quoteSource: melega.source }),
        createPancakeSwapVenueAdapter(pancake.source),
      ],
      nowIso: NOW,
    })
    expect(computeNetVenueInput(GROSS_INPUT, 20)).toEqual({ feeAmountRaw: '2000', netVenueInputRaw: '998000' })
    expect(melega.calls.map((row) => row.amountInRaw)).toEqual(['998000'])
    expect(pancake.calls.map((row) => row.amountInRaw)).toEqual(['998000'])
    expect(melega.calls[0].router).toBe(MELEGA_ROUTER)
    expect(pancake.calls[0].router).toBe(PANCAKE_ROUTER)
    expect(result.melega?.quote?.inputAmountRaw).toBe('998000')
    expect(result.pancake?.quote?.inputAmountRaw).toBe('998000')
    expect(result.melega?.net?.subtractedSmartSwapFeeRaw).toBe('0')
    expect(result.pancake?.net?.subtractedSmartSwapFeeRaw).toBe('0')
    expect(result.melega?.net?.netUserOutputRaw).toBe('410000')
    expect(result.pancake?.net?.netUserOutputRaw).toBe('420000')
    expect(result.shadowWinner?.venueId).toBe('pancakeswap')
  })

  it('B: Melega can win the same-pair ranking', async () => {
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: null,
      adapters: [
        createMelegaDexAdapter(LEGACY, {
          quoteSource: createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '510000' } }),
        }),
        createPancakeSwapVenueAdapter(
          createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '500000' } }),
        ),
      ],
      nowIso: NOW,
    })
    expect(result.shadowWinner?.venueId).toBe('melega-dex')
    expect(result.melega?.quote?.inputAmountRaw).toBe('998000')
    expect(result.melega?.sealedFee?.feeAssetSource).toBe(FEE_ASSET_SOURCE.INPUT)
  })

  it('C: Pancake can win the same-pair ranking', async () => {
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: null,
      adapters: [
        createMelegaDexAdapter(LEGACY, {
          quoteSource: createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '490000' } }),
        }),
        createPancakeSwapVenueAdapter(
          createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '505000' } }),
        ),
      ],
      nowIso: NOW,
    })
    expect(result.shadowWinner?.venueId).toBe('pancakeswap')
  })

  it('F/G: Melega winner binds to ExecutorV2 intent with certified metadata', async () => {
    const request = bscRequest()
    const result = await runEvmShadowCompetition({
      request,
      productionQuote: null,
      adapters: [
        createMelegaDexAdapter(LEGACY, {
          quoteSource: createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '580000' } }),
        }),
      ],
      nowIso: NOW,
    })
    const binding = bind(request, result.shadowWinner)
    expect(binding.intent.version).toBe(2)
    expect(binding.intent.venueId).toBe(v2VenueIdHash('melega-dex'))
    expect(binding.intent.router).toBe(MELEGA_ROUTER)
    expect(binding.path).toEqual([
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    ])
    expect(binding.intent.inputAmount).toBe(GROSS_INPUT)
    expect(binding.intent.inputAmount).not.toBe(result.shadowWinner?.netVenueInputRaw)
    expect(binding.intent.feeBps).toBe(20)
    expect(binding.intent.feeAmount).toBe(computeFeeAmountRaw(GROSS_INPUT, 20))
    expect(binding.intent.minUserOut).toBe(computeMinimumReceived('580000', 50))
    expect(binding.intent.beneficiary).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(binding.intent.structuralRouteCostBps).toBe(25)
    expect('engineSeal' in binding.intent).toBe(false)
    expect('signature' in binding.intent).toBe(false)
  })

  it('H: Pancake binding stays on the certified Pancake router', async () => {
    const request = bscRequest()
    const result = await runEvmShadowCompetition({
      request,
      productionQuote: null,
      adapters: [
        createPancakeSwapVenueAdapter(
          createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '500000' } }),
        ),
      ],
      nowIso: NOW,
    })
    const binding = bind(request, result.shadowWinner)
    expect(binding.intent.router).toBe(PANCAKE_ROUTER)
    expect(binding.intent.venueId).toBe(v2VenueIdHash('pancakeswap'))
    expect(binding.intent.feeBps).toBe(20)
  })

  it('I: Uniswap Ethereum binding stays unchanged', async () => {
    const request: SmartSwapRequest = {
      requestId: 'uni-eth',
      network: evmNetwork(1),
      inputAsset: CANONICAL_EXAMPLE_ASSETS.weth,
      outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
      inputAmountRaw: GROSS_INPUT,
      exactOut: false,
      slippageBps: 50,
    }
    const result = await runEvmShadowCompetition({
      request,
      productionQuote: null,
      adapters: [
        createUniswapVenueAdapter(
          createSyntheticQuoteSource({ [`1:${WETH}>${USDC_ETH}`]: { amountOutRaw: '400000' } }),
        ),
      ],
      nowIso: NOW,
    })
    const binding = bind(request, result.shadowWinner)
    expect(binding.intent.router).toBe(UNISWAP_ROUTER)
    expect(binding.intent.chainId).toBe(1)
    expect(binding.intent.feeBps).toBe(15)
    expect(binding.intent.feeAmount).toBe('1500')
  })

  it('J: missing Melega router metadata fails closed', async () => {
    expect(MELEGA_DEX_VENUE.routers[1]).toBeUndefined()
    const adapter = createMelegaDexAdapter(null, {
      quoteSource: createSyntheticQuoteSource({ [`1:${WETH}>${USDC_ETH}`]: { amountOutRaw: '1' } }),
    })
    await expect(
      adapter.quote(
        {
          requestId: 'melega-eth',
          network: evmNetwork(1),
          inputAsset: CANONICAL_EXAMPLE_ASSETS.weth,
          outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
          inputAmountRaw: '998000',
          exactOut: false,
          slippageBps: 50,
        },
        { signal: new AbortController().signal, nowIso: NOW },
      ),
    ).rejects.toThrow(MELEGA_DEX_EXACT_QUOTE_ROUTER_MISSING)
  })

  it('K: stale Melega winner fails closed at binding', async () => {
    const request = bscRequest()
    const result = await runEvmShadowCompetition({
      request,
      productionQuote: null,
      adapters: [
        createMelegaDexAdapter(LEGACY, {
          quoteSource: createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '580000' } }),
        }),
      ],
      nowIso: NOW,
    })
    const stale = {
      ...result.shadowWinner!,
      status: 'stale' as const,
    }
    expect(() => bind(request, stale)).toThrow(V2_BINDING_QUOTE_STALE)
  })

  it('L: snapshot amount mismatch still fails closed when no exact quote source exists', async () => {
    const adapter = createMelegaDexAdapter(LEGACY)
    await expect(
      adapter.quote(
        { ...bscRequest(), inputAmountRaw: '998000' },
        { signal: new AbortController().signal, nowIso: NOW },
      ),
    ).rejects.toThrow(MELEGA_DEX_NET_INPUT_QUOTE_UNAVAILABLE)
  })

  it('M: fee-on-transfer-unproven routes fail closed instead of fabricating output', async () => {
    const adapter = createMelegaDexAdapter(LEGACY, {
      quoteSource: createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '580000' } }),
      feeOnTransferUnproven: true,
    })
    await expect(
      adapter.quote(
        { ...bscRequest(), inputAmountRaw: '998000' },
        { signal: new AbortController().signal, nowIso: NOW },
      ),
    ).rejects.toThrow(MELEGA_DEX_FOT_UNPROVEN)
  })

  it('production modes stay frozen and UI is not wired', () => {
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(isLegacyProductionAuthoritative()).toBe(true)
    expect(isUniversalEngineShadowOnly()).toBe(true)
    expect(isProductionCutoverAllowed()).toBe(false)
    expect(SMARTSWAP_UX_FREEZE_FILES.length).toBeGreaterThan(0)
    for (const rel of [
      'src/views/Swap/SmartSwap/index.tsx',
      'src/views/Swap/SmartSwap/hooks/useSwapCallback.ts',
      'src/views/Trade/TradeCockpit.tsx',
    ]) {
      const abs = path.join(WEB, rel)
      if (!existsSync(abs)) continue
      expect(readFileSync(abs, 'utf8')).not.toContain('resolveMelegaExactQuotePath')
    }
    expect(MELEGA_V2_EXECUTION_BINDING_UNAVAILABLE).toBe('MELEGA_V2_EXECUTION_BINDING_UNAVAILABLE')
  })
})
