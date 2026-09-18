import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS } from '../assetIdentity'
import { UNISWAP_VENUE, VENUE_SUPPORT } from '../certifiedVenues'
import { evmNetwork } from '../domain'
import { computeFeeAmountRaw, computeNetVenueInput, evaluateRevenuePolicy } from '../evaluateRevenuePolicy'
import { createExternalEvmVenueAdapter } from '../externalEvmAdapter'
import { PROTOCOL_FEE_STATE } from '../fee'
import { VENUE_HEALTH_STATE, healthSnapshot } from '../health'
import { DEFAULT_LATENCY_BUDGET } from '../latency'
import {
  MELEGA_DEX_NET_INPUT_QUOTE_UNAVAILABLE,
  createMelegaDexAdapter,
  normalizeMelegaLegacyQuote,
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
import { SMARTSWAP_REVENUE_POLICY_V1 } from '../revenuePolicy'
import { ScopedVenueHealth } from '../scopedHealth'
import { createSyntheticQuoteSource, type ShadowQuoteRequest } from '../shadowQuoteSource'
import { runEvmShadowCompetition } from '../shadowCompetition'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'

const WEB = path.resolve(__dirname, '../../../..')
const ENGINE = path.join(WEB, 'src/lib/smartswap-universal-engine')
const NOW = '2026-09-18T16:00:00.000Z'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_BSC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const GROSS_INPUT = '1000000'

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

function bscRequest(inputAmountRaw = GROSS_INPUT): SmartSwapRequest {
  return {
    requestId: 'net-input-econ',
    network: evmNetwork(56),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw,
    exactOut: false,
    slippageBps: 50,
  }
}

function recordingPancake(amountOutRaw: string) {
  const amountInCalls: string[] = []
  const base = createSyntheticQuoteSource({
    [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw },
  })
  const adapter = createPancakeSwapVenueAdapter({
    async fetch(request: ShadowQuoteRequest) {
      amountInCalls.push(request.amountInRaw)
      return base.fetch(request)
    },
  })
  return { adapter, amountInCalls }
}

function sameChainUniswap(amountOutRaw: string) {
  const amountInCalls: string[] = []
  const base = createSyntheticQuoteSource({
    [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw },
  })
  const adapter = createExternalEvmVenueAdapter(
    {
      ...UNISWAP_VENUE,
      routers: { 56: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' },
      wrappedNative: { 56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
      support: { 56: VENUE_SUPPORT.QUOTE_ONLY },
    },
    {
      async fetch(request: ShadowQuoteRequest) {
        amountInCalls.push(request.amountInRaw)
        return base.fetch(request)
      },
    },
  )
  return { adapter, amountInCalls }
}

function melegaExact(inputAmountRaw: string, expectedOutputRaw = '600000'): ReturnType<typeof createMelegaDexAdapter> {
  return createMelegaDexAdapter({ ...LEGACY, inputAmountRaw, expectedOutputRaw })
}

describe('SmartSwap SHADOW net-input quote economics', () => {
  it('A: cost 25 quotes the venue with 998000 after a 20 bps input fee', async () => {
    const { adapter, amountInCalls } = recordingPancake('500000')
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters: [adapter],
      nowIso: NOW,
    })
    expect(result.pancake?.structuralRouteCostBps).toBe(25)
    expect(result.pancake?.smartSwapFeeBps).toBe(20)
    expect(result.pancake?.sealedFee?.feeAmountRaw).toBe('2000')
    expect(result.pancake?.netVenueInputRaw).toBe('998000')
    expect(amountInCalls).toEqual(['998000'])
    expect(result.pancake?.quote?.inputAmountRaw).toBe('998000')
  })

  it('B: cost 30 quotes the venue with 998500 after a 15 bps input fee', async () => {
    const { adapter, amountInCalls } = sameChainUniswap('400000')
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters: [adapter],
      nowIso: NOW,
    })
    expect(result.uniswap?.structuralRouteCostBps).toBe(30)
    expect(result.uniswap?.smartSwapFeeBps).toBe(15)
    expect(result.uniswap?.sealedFee?.feeAmountRaw).toBe('1500')
    expect(result.uniswap?.netVenueInputRaw).toBe('998500')
    expect(amountInCalls).toEqual(['998500'])
    expect(result.uniswap?.quote?.inputAmountRaw).toBe('998500')
  })

  it('C/D: ranking uses net-input quote outputs and does not subtract protocol fee again', async () => {
    const pancake = recordingPancake('410000')
    const uniswap = sameChainUniswap('420000')
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters: [pancake.adapter, uniswap.adapter],
      nowIso: NOW,
    })
    expect(pancake.amountInCalls).toEqual(['998000'])
    expect(uniswap.amountInCalls).toEqual(['998500'])
    expect(result.pancake?.net?.netUserOutputRaw).toBe('410000')
    expect(result.uniswap?.net?.netUserOutputRaw).toBe('420000')
    expect(result.pancake?.net?.subtractedSmartSwapFeeRaw).toBe('0')
    expect(result.uniswap?.net?.subtractedSmartSwapFeeRaw).toBe('0')
    expect(result.pancake?.quote?.netUserOutputRaw).toBe(result.pancake?.quote?.grossOutputRaw)
    expect(result.shadowWinner?.venueId).toBe('uniswap')
  })

  it('E: sealed fee evidence is INPUT-side and matches ExecutorV2 floor math', async () => {
    const { adapter } = recordingPancake('500000')
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters: [adapter],
      nowIso: NOW,
    })
    const fee = result.pancake?.sealedFee
    expect(fee?.feeAssetSource).toBe(FEE_ASSET_SOURCE.INPUT)
    expect(fee?.feeAsset).toEqual(CANONICAL_EXAMPLE_ASSETS.wbnb)
    expect(fee?.feeBps).toBe(20)
    expect(fee?.feeAmountRaw).toBe(computeFeeAmountRaw(GROSS_INPUT, 20))
    expect(result.pancake?.quote?.protocolFee.amountRaw).toBe('2000')
    expect(result.pancake?.originalInputAmountRaw).toBe(GROSS_INPUT)
  })

  it('F: minimumReceived is computed from the net-input quote and existing slippage', async () => {
    const { adapter } = recordingPancake('500000')
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters: [adapter],
      nowIso: NOW,
    })
    expect(result.pancake?.quote?.grossOutputRaw).toBe('500000')
    expect(result.pancake?.quote?.minimumReceivedRaw).toBe(computeMinimumReceived('500000', 50))
    expect(result.pancake?.quote?.minimumReceivedRaw).toBe('497500')
  })

  it('G: Melega snapshot mismatch fails closed; exact net snapshot is reusable', async () => {
    const mismatched = createMelegaDexAdapter(LEGACY)
    await expect(
      mismatched.quote(bscRequest('998000'), { signal: new AbortController().signal, nowIso: NOW }),
    ).rejects.toThrow(MELEGA_DEX_NET_INPUT_QUOTE_UNAVAILABLE)

    const closed = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters: [mismatched],
      nowIso: NOW,
    })
    expect(closed.melega?.status).toBe('error')
    expect(closed.melega?.error).toBe(MELEGA_DEX_NET_INPUT_QUOTE_UNAVAILABLE)
    expect(closed.melega?.quote).toBeNull()
    expect(closed.shadowWinner).toBeNull()

    const exact = melegaExact('998000', '580000')
    const reusable = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters: [exact],
      nowIso: NOW,
    })
    expect(reusable.melega?.status).toBe('ok')
    expect(reusable.melega?.quote?.inputAmountRaw).toBe('998000')
    expect(reusable.melega?.quote?.grossOutputRaw).toBe('580000')
    expect(reusable.melega?.net?.netUserOutputRaw).toBe('580000')
    expect(reusable.shadowWinner?.venueId).toBe('melega-dex')
  })

  it('H: old gross/output-fee ranking would pick A; net-input ranking picks B', async () => {
    const venueA = recordingPancake('100000')
    const venueB = sameChainUniswap('99950')
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters: [venueA.adapter, venueB.adapter],
      nowIso: NOW,
    })

    const oldA = 100000n - (100000n * 20n) / 10000n
    const oldB = 99950n - (99950n * 15n) / 10000n
    expect(oldB).toBeGreaterThan(oldA)
    expect(result.pancake?.net?.netUserOutputRaw).toBe('100000')
    expect(result.uniswap?.net?.netUserOutputRaw).toBe('99950')
    expect(result.shadowWinner?.venueId).toBe('pancakeswap')
    expect(venueA.amountInCalls).toEqual(['998000'])
    expect(venueB.amountInCalls).toEqual(['998500'])
  })

  it('I: fee-band boundaries match ExecutorV2 authorizedFeeBps', () => {
    const cases: Array<[number, number]> = [
      [0, 25],
      [10, 25],
      [11, 20],
      [25, 20],
      [26, 15],
      [40, 15],
      [41, 10],
      [60, 10],
      [61, 5],
      [100, 5],
    ]
    for (const [cost, feeBps] of cases) {
      const assessment = evaluateRevenuePolicy({
        structuralRouteCostBps: cost,
        swapValueNormalized: null,
        inputAmountRaw: GROSS_INPUT,
        feeEnforcementState: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
      })
      expect(assessment.feeBps, `cost ${cost}`).toBe(feeBps)
      expect(assessment.feeBps! <= SMARTSWAP_REVENUE_POLICY_V1.maxProtocolFeeBps).toBe(true)
    }
  })

  it('J: floor arithmetic is exact for ExecutorV2 fee and net-in', () => {
    expect(computeNetVenueInput('1000000', 20)).toEqual({ feeAmountRaw: '2000', netVenueInputRaw: '998000' })
    expect(computeNetVenueInput('1000000', 15)).toEqual({ feeAmountRaw: '1500', netVenueInputRaw: '998500' })
    expect(computeNetVenueInput('1000001', 20)).toEqual({ feeAmountRaw: '2000', netVenueInputRaw: '998001' })
    expect(computeNetVenueInput('999', 25)).toEqual({ feeAmountRaw: '2', netVenueInputRaw: '997' })
    expect(computeNetVenueInput('3', 5)).toEqual({ feeAmountRaw: '0', netVenueInputRaw: '3' })
  })

  it('K: timeout, readiness skip, and circuit-breaker isolation stay unchanged', async () => {
    const timeoutHealth = new ScopedVenueHealth({ failureThreshold: 2, cooldownMs: 60_000 })
    const slow = createPancakeSwapVenueAdapter({
      async fetch(request) {
        await new Promise<void>((_resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('ADAPTER_TIMEOUT')), 5_000)
          request.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new Error('ADAPTER_TIMEOUT'))
          })
        })
        throw new Error('unreachable')
      },
    })
    const timed = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters: [melegaExact('998000'), slow],
      health: timeoutHealth,
      budget: { ...DEFAULT_LATENCY_BUDGET, quoteTimeoutMs: 40, overallBudgetMs: 120 },
      nowIso: NOW,
    })
    expect(timed.pancake?.status).toBe('timeout')
    expect(timed.melega?.status).toBe('ok')
    expect(timed.shadowWinner?.venueId).toBe('melega-dex')

    const breakerHealth = new ScopedVenueHealth({ failureThreshold: 2, cooldownMs: 60_000 })
    const failing = createPancakeSwapVenueAdapter({
      async fetch() {
        throw new Error('RPC_DOWN')
      },
    })
    const adapters = [melegaExact('998000'), failing]
    await runEvmShadowCompetition({ request: bscRequest(), productionQuote: null, adapters, health: breakerHealth, nowIso: NOW })
    await runEvmShadowCompetition({ request: bscRequest(), productionQuote: null, adapters, health: breakerHealth, nowIso: NOW })
    const skipped = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: null,
      adapters,
      health: breakerHealth,
      nowIso: NOW,
    })
    expect(skipped.pancake?.status).toBe('skipped')
    expect(skipped.pancake?.error).toContain('CIRCUIT_BREAKER_OPEN')

    const blocked = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: null,
      adapters: [melegaExact('998000'), recordingPancake('1').adapter],
      nowIso: NOW,
      readinessProbe: async ({ adapter }) => {
        if (adapter.identity().venueId === 'pancakeswap') {
          return healthSnapshot('pancakeswap', VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-unavailable', {
            providerHealthy: false,
          }, NOW)
        }
        return null
      },
    })
    expect(blocked.pancake?.status).toBe('skipped')
    expect(blocked.pancake?.error).toBe('VENUE_READINESS_BLOCKED:rpc-unavailable')
    expect(blocked.melega?.status).toBe('ok')
  })

  it('L: no UI/production execution binding and operating modes stay frozen', () => {
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(isLegacyProductionAuthoritative()).toBe(true)
    expect(isUniversalEngineShadowOnly()).toBe(true)
    expect(isProductionCutoverAllowed()).toBe(false)
    const competition = readFileSync(path.join(ENGINE, 'shadowCompetition.ts'), 'utf8')
    expect(competition).not.toContain('useSwapCallback')
    expect(competition).not.toContain('SmartSwapForm')
    expect(competition).not.toContain('TradeCockpit')
    expect(competition).not.toContain('window.ethereum')
    for (const rel of [
      'src/views/Swap/SmartSwap/index.tsx',
      'src/views/Swap/SmartSwap/hooks/useSwapCallback.ts',
      'src/views/Trade/TradeCockpit.tsx',
    ]) {
      const abs = path.join(WEB, rel)
      if (!existsSync(abs)) continue
      const text = readFileSync(abs, 'utf8')
      expect(text).not.toContain('computeNetVenueInput')
      expect(text).not.toContain('runEvmShadowCompetition')
    }
    expect(SMARTSWAP_UX_FREEZE_FILES.length).toBeGreaterThan(0)
  })
})
