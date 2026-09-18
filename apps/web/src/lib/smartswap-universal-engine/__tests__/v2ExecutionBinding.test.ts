import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS, evmNative } from '../assetIdentity'
import { evmNetwork } from '../domain'
import { computeFeeAmountRaw, computeNetVenueInput } from '../evaluateRevenuePolicy'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { createMelegaDexAdapter, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
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
import { runEvmShadowCompetition, type ShadowCandidate } from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import {
  MELEGA_V2_EXECUTION_BINDING_UNAVAILABLE,
  V2_BINDING_ECONOMICS_MISSING,
  V2_BINDING_FEE_MISMATCH,
  V2_BINDING_INPUT_MISMATCH,
  V2_BINDING_MIN_OUT_MISSING,
  V2_BINDING_NET_INPUT_MISMATCH,
  V2_BINDING_QUOTE_INVALID,
  V2_BINDING_QUOTE_MISSING,
  V2_BINDING_QUOTE_STALE,
  V2_BINDING_ROUTER_MISSING,
  V2_BINDING_UNSUPPORTED_VENUE,
  V2_BINDING_VENUE_MISMATCH,
  V2_BINDING_WINNER_MISSING,
  V2_BINDING_WINNER_NOT_OK,
  V2_INTENT_VERSION,
  V2_NATIVE_ASSET,
  V2_POLICY_ID_HASH,
  V2_POLICY_VERSION_HASH,
  assertNoV1SignerFields,
  buildV2ExecutionBinding,
  v2RouteHashOf,
  v2VenueIdHash,
} from '../v2ExecutionBinding'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'

const WEB = path.resolve(__dirname, '../../../..')
const ENGINE = path.join(WEB, 'src/lib/smartswap-universal-engine')
const NOW = '2026-08-20T00:00:05.000Z'
const GROSS_INPUT = '1000000'
const USER = '0x1111111111111111111111111111111111111111'
const DEADLINE = 1_893_456_000
const NONCE = 7

const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_BSC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC_ETH = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
const UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const WBNB_CHECKSUM = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const USDC_BSC_CHECKSUM = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const WETH_CHECKSUM = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const USDC_ETH_CHECKSUM = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

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

function bscErc20Request(): SmartSwapRequest {
  return {
    requestId: 'v2-bind-pancake-erc20',
    network: evmNetwork(56),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw: GROSS_INPUT,
    exactOut: false,
    slippageBps: 50,
  }
}

function bscNativeInRequest(): SmartSwapRequest {
  return {
    requestId: 'v2-bind-pancake-native-in',
    network: evmNetwork(56),
    inputAsset: evmNative(56, 'BNB', 18),
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw: GROSS_INPUT,
    exactOut: false,
    slippageBps: 50,
  }
}

function bscNativeOutRequest(): SmartSwapRequest {
  return {
    requestId: 'v2-bind-pancake-native-out',
    network: evmNetwork(56),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    outputAsset: evmNative(56, 'BNB', 18),
    inputAmountRaw: GROSS_INPUT,
    exactOut: false,
    slippageBps: 50,
  }
}

function ethErc20Request(): SmartSwapRequest {
  return {
    requestId: 'v2-bind-uni-erc20',
    network: evmNetwork(1),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.weth,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
    inputAmountRaw: GROSS_INPUT,
    exactOut: false,
    slippageBps: 50,
  }
}

function bindArgs(request: SmartSwapRequest, winner: ShadowCandidate | null) {
  return { request, winner, user: USER, deadline: DEADLINE, nonce: NONCE, nowIso: NOW }
}

async function pancakeWinner(request: SmartSwapRequest, pathKey: string, amountOutRaw = '500000') {
  const adapter = createPancakeSwapVenueAdapter(
    createSyntheticQuoteSource({
      [pathKey]: { amountOutRaw },
    }),
  )
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [adapter],
    nowIso: NOW,
  })
  expect(result.shadowWinner?.venueId).toBe('pancakeswap')
  return result.shadowWinner!
}

async function uniswapEthWinner(amountOutRaw = '400000') {
  const request = ethErc20Request()
  const adapter = createUniswapVenueAdapter(
    createSyntheticQuoteSource({
      [`1:${WETH}>${USDC_ETH}`]: { amountOutRaw },
    }),
  )
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [adapter],
    nowIso: NOW,
  })
  expect(result.shadowWinner?.venueId).toBe('uniswap')
  return { request, winner: result.shadowWinner! }
}

function cloneWinner(winner: ShadowCandidate): ShadowCandidate {
  return {
    ...winner,
    quote: winner.quote ? { ...winner.quote, hops: winner.quote.hops.map((hop) => ({ ...hop })) } : null,
    sealedFee: winner.sealedFee ? { ...winner.sealedFee } : null,
  }
}

describe('SmartSwap V2 local winner execution binding', () => {
  it('1: Pancake SHADOW winner maps to ExecutorV2 intent + certified path', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const binding = buildV2ExecutionBinding(bindArgs(request, winner))
    expect(binding.intent.version).toBe(V2_INTENT_VERSION)
    expect(binding.intent.version).toBe(2)
    expect(binding.intent.policyId).toBe(V2_POLICY_ID_HASH)
    expect(binding.intent.policyVersion).toBe(V2_POLICY_VERSION_HASH)
    expect(binding.intent.chainId).toBe(56)
    expect(binding.intent.user).toBe(USER)
    expect(binding.intent.inputAmount).toBe(GROSS_INPUT)
    expect(binding.intent.inputAmount).not.toBe(winner.netVenueInputRaw)
    expect(binding.intent.inputAmount).toBe(winner.originalInputAmountRaw)
    expect(binding.intent.feeBps).toBe(20)
    expect(binding.intent.feeBps).toBe(winner.smartSwapFeeBps)
    expect(binding.intent.feeAmount).toBe('2000')
    expect(binding.intent.feeAmount).toBe(winner.sealedFee?.feeAmountRaw)
    expect(binding.intent.feeAmount).toBe(computeFeeAmountRaw(GROSS_INPUT, 20))
    expect(binding.intent.structuralRouteCostBps).toBe(25)
    expect(binding.intent.minUserOut).toBe(computeMinimumReceived('500000', 50))
    expect(binding.intent.minUserOut).toBe(winner.quote?.minimumReceivedRaw)
    expect(binding.intent.router).toBe(PANCAKE_ROUTER)
    expect(binding.intent.venueId).toBe(v2VenueIdHash('pancakeswap'))
    expect(binding.path).toEqual([WBNB_CHECKSUM, USDC_BSC_CHECKSUM])
    expect(binding.intent.routeHash).toBe(v2RouteHashOf(binding.path, false, false))
    expect(binding.intent.nativeIn).toBe(false)
    expect(binding.intent.nativeOut).toBe(false)
    expect(binding.intent.inputAsset).toBe(WBNB_CHECKSUM)
    expect(binding.intent.outputAsset).toBe(USDC_BSC_CHECKSUM)
    expect(binding.intent.feeAsset).toBe(WBNB_CHECKSUM)
    expect(binding.intent.beneficiary).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(binding.intent.deadline).toBe(DEADLINE)
    expect(binding.intent.nonce).toBe(String(NONCE))
    expect(binding.executeArgs.method).toBe('execute')
    expect(binding.executeArgs.path).toEqual(binding.path)
    expect(binding.productionActivation).toBe(false)
    expect(binding.productionCutoverAllowed).toBe(false)
    assertNoV1SignerFields(binding.intent)
    expect('engineSeal' in binding.intent).toBe(false)
    expect('intentSigner' in binding.intent).toBe(false)
  })

  it('2: Uniswap SHADOW winner maps to ExecutorV2 intent + certified Ethereum router', async () => {
    const { request, winner } = await uniswapEthWinner()
    const binding = buildV2ExecutionBinding(bindArgs(request, winner))
    expect(binding.intent.version).toBe(2)
    expect(binding.intent.chainId).toBe(1)
    expect(binding.intent.router).toBe(UNISWAP_ROUTER)
    expect(binding.intent.venueId).toBe(v2VenueIdHash('uniswap'))
    expect(binding.intent.feeBps).toBe(15)
    expect(binding.intent.feeAmount).toBe('1500')
    expect(binding.intent.feeAmount).toBe(winner.sealedFee?.feeAmountRaw)
    expect(binding.intent.structuralRouteCostBps).toBe(30)
    expect(binding.intent.inputAmount).toBe(GROSS_INPUT)
    expect(binding.intent.minUserOut).toBe(computeMinimumReceived('400000', 50))
    expect(binding.path).toEqual([WETH_CHECKSUM, USDC_ETH_CHECKSUM])
    expect(binding.intent.routeHash).toBe(v2RouteHashOf([WETH_CHECKSUM, USDC_ETH_CHECKSUM], false, false))
    expect(binding.intent.feeAsset).toBe(WETH_CHECKSUM)
    expect(binding.venueIdLabel).toBe('uniswap')
  })

  it('3/4: policy hashes match Solidity keccak of canonical strings', () => {
    expect(V2_POLICY_ID_HASH).toBe(keccak256(toUtf8Bytes('SMARTSWAP_REVENUE_POLICY_V1')))
    expect(V2_POLICY_VERSION_HASH).toBe(keccak256(toUtf8Bytes('1.0.0')))
    expect(v2VenueIdHash('pancakeswap')).toBe(keccak256(toUtf8Bytes('pancakeswap')))
    expect(v2VenueIdHash('uniswap')).toBe(keccak256(toUtf8Bytes('uniswap')))
    expect(v2VenueIdHash('melega-dex')).toBe(keccak256(toUtf8Bytes('melega-dex')))
  })

  it('5/6: inputAmount is original user input and fee matches #76 + ExecutorV2 floor', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const binding = buildV2ExecutionBinding(bindArgs(request, winner))
    expect(winner.netVenueInputRaw).toBe('998000')
    expect(binding.intent.inputAmount).toBe('1000000')
    expect(computeNetVenueInput('1000000', 20)).toEqual({ feeAmountRaw: '2000', netVenueInputRaw: '998000' })
    expect(binding.intent.feeAmount).toBe(winner.sealedFee?.feeAmountRaw)
    expect(binding.intent.feeBps).toBe(winner.smartSwapFeeBps)
    expect(winner.sealedFee?.feeAssetSource).toBe(FEE_ASSET_SOURCE.INPUT)
  })

  it('7: minUserOut is minimumReceived from the net-input quote', async () => {
    const request = bscErc20Request()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`, '500000')
    const binding = buildV2ExecutionBinding(bindArgs(request, winner))
    expect(winner.quote?.inputAmountRaw).toBe('998000')
    expect(binding.intent.minUserOut).toBe('497500')
  })

  it('8: routeHash uses abi.encode not packed, and is deterministic', () => {
    const erc20 = v2RouteHashOf([WBNB_CHECKSUM, USDC_BSC_CHECKSUM], false, false)
    const nativeIn = v2RouteHashOf([WBNB_CHECKSUM, USDC_BSC_CHECKSUM], true, false)
    const nativeOut = v2RouteHashOf([USDC_BSC_CHECKSUM, WBNB_CHECKSUM], false, true)
    expect(erc20).toMatch(/^0x[a-f0-9]{64}$/)
    expect(erc20).not.toBe(nativeIn)
    expect(erc20).not.toBe(nativeOut)
    expect(v2RouteHashOf([WBNB.toLowerCase(), USDC_BSC.toLowerCase()], false, false)).toBe(erc20)
    expect(erc20).toBe('0x03acd7f030e88592939ebd720a2704354c6dfd4d1d55e07e62bf3d18b6bc9e9f')
    expect(nativeIn).toBe('0x3c02b43ea145fbec00b7713bf95774a86a1ec935cfa2c897ad882cf976f783d7')
    expect(nativeOut).toBe('0xea0db4a9725bb2f74d1e228dd22b71a6f686aea94bd0eb954efdc305bfc9a425')
  })

  it('10: native input path starts with certified wrapped native and feeAsset is NATIVE', async () => {
    const request = bscNativeInRequest()
    const winner = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)
    const binding = buildV2ExecutionBinding(bindArgs(request, winner))
    expect(binding.intent.nativeIn).toBe(true)
    expect(binding.intent.nativeOut).toBe(false)
    expect(binding.path).toEqual([WBNB_CHECKSUM, USDC_BSC_CHECKSUM])
    expect(binding.intent.inputAsset).toBe(V2_NATIVE_ASSET)
    expect(binding.intent.feeAsset).toBe(V2_NATIVE_ASSET)
    expect(binding.intent.outputAsset).toBe(USDC_BSC_CHECKSUM)
    expect(binding.intent.routeHash).toBe(v2RouteHashOf(binding.path, true, false))
    expect(binding.intent.router).toBe(PANCAKE_ROUTER)
  })

  it('11: native output path ends with certified wrapped native', async () => {
    const request = bscNativeOutRequest()
    const winner = await pancakeWinner(request, `56:${USDC_BSC}>${WBNB}`)
    const binding = buildV2ExecutionBinding(bindArgs(request, winner))
    expect(binding.intent.nativeIn).toBe(false)
    expect(binding.intent.nativeOut).toBe(true)
    expect(binding.path).toEqual([USDC_BSC_CHECKSUM, WBNB_CHECKSUM])
    expect(binding.intent.outputAsset).toBe(V2_NATIVE_ASSET)
    expect(binding.intent.inputAsset).toBe(USDC_BSC_CHECKSUM)
    expect(binding.intent.feeAsset).toBe(USDC_BSC_CHECKSUM)
    expect(binding.intent.routeHash).toBe(v2RouteHashOf(binding.path, false, true))
  })

  it('12: missing winner fails closed', async () => {
    await expect(Promise.resolve().then(() => buildV2ExecutionBinding(bindArgs(bscErc20Request(), null)))).rejects.toThrow(
      V2_BINDING_WINNER_MISSING,
    )
  })

  it('13: unsupported venue fails closed', async () => {
    const request = bscErc20Request()
    const winner = cloneWinner(await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`))
    winner.venueId = 'sushiswap'
    winner.quote!.venueId = 'sushiswap'
    winner.quote!.hops[0].venueId = 'sushiswap'
    expect(() => buildV2ExecutionBinding(bindArgs(request, winner))).toThrow(V2_BINDING_UNSUPPORTED_VENUE)
  })

  it('14: Uniswap-on-BSC has no certified router and fails closed', async () => {
    const request = bscErc20Request()
    const winner = cloneWinner(await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`))
    winner.venueId = 'uniswap'
    winner.quote!.venueId = 'uniswap'
    winner.quote!.hops[0].venueId = 'uniswap'
    winner.structuralRouteCostBps = 30
    winner.smartSwapFeeBps = 15
    winner.sealedFee = {
      ...winner.sealedFee!,
      feeBps: 15,
      feeAmountRaw: computeFeeAmountRaw(GROSS_INPUT, 15),
    }
    winner.netVenueInputRaw = computeNetVenueInput(GROSS_INPUT, 15).netVenueInputRaw
    winner.quote!.inputAmountRaw = winner.netVenueInputRaw
    expect(() => buildV2ExecutionBinding(bindArgs(request, winner))).toThrow(V2_BINDING_ROUTER_MISSING)
  })

  it('15: stale / invalid / non-ok / missing quote fail closed', async () => {
    const request = bscErc20Request()
    const base = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)

    const staleStatus = cloneWinner(base)
    staleStatus.status = 'stale'
    expect(() => buildV2ExecutionBinding(bindArgs(request, staleStatus))).toThrow(V2_BINDING_QUOTE_STALE)

    const notOk = cloneWinner(base)
    notOk.status = 'error'
    expect(() => buildV2ExecutionBinding(bindArgs(request, notOk))).toThrow(V2_BINDING_WINNER_NOT_OK)

    const missingQuote = cloneWinner(base)
    missingQuote.quote = null
    expect(() => buildV2ExecutionBinding(bindArgs(request, missingQuote))).toThrow(V2_BINDING_QUOTE_MISSING)

    const invalid = cloneWinner(base)
    invalid.quote!.valid = false
    expect(() => buildV2ExecutionBinding(bindArgs(request, invalid))).toThrow(V2_BINDING_QUOTE_INVALID)

    const staleFlag = cloneWinner(base)
    staleFlag.quote!.stale = true
    expect(() => buildV2ExecutionBinding(bindArgs(request, staleFlag))).toThrow(V2_BINDING_QUOTE_STALE)

    const venueMismatch = cloneWinner(base)
    venueMismatch.quote!.venueId = 'uniswap'
    expect(() => buildV2ExecutionBinding(bindArgs(request, venueMismatch))).toThrow(V2_BINDING_VENUE_MISMATCH)
  })

  it('16: fee / economics / input evidence mismatches fail closed', async () => {
    const request = bscErc20Request()
    const base = await pancakeWinner(request, `56:${WBNB}>${USDC_BSC}`)

    const noEcon = cloneWinner(base)
    noEcon.sealedFee = null
    expect(() => buildV2ExecutionBinding(bindArgs(request, noEcon))).toThrow(V2_BINDING_ECONOMICS_MISSING)

    const feeAmt = cloneWinner(base)
    feeAmt.sealedFee = { ...feeAmt.sealedFee!, feeAmountRaw: '1999' }
    expect(() => buildV2ExecutionBinding(bindArgs(request, feeAmt))).toThrow(V2_BINDING_FEE_MISMATCH)

    const input = cloneWinner(base)
    expect(() =>
      buildV2ExecutionBinding({ ...bindArgs({ ...request, inputAmountRaw: '999999' }, input) }),
    ).toThrow(V2_BINDING_INPUT_MISMATCH)

    const net = cloneWinner(base)
    net.netVenueInputRaw = '997000'
    expect(() => buildV2ExecutionBinding(bindArgs(request, net))).toThrow(V2_BINDING_NET_INPUT_MISMATCH)

    const minOut = cloneWinner(base)
    minOut.quote!.minimumReceivedRaw = null
    expect(() => buildV2ExecutionBinding(bindArgs(request, minOut))).toThrow(V2_BINDING_MIN_OUT_MISSING)
  })

  it('Melega winner fails closed: no certified executable router/path', async () => {
    const request = bscErc20Request()
    const adapter = createMelegaDexAdapter({
      ...LEGACY,
      inputAmountRaw: '998000',
      expectedOutputRaw: '580000',
    })
    const result = await runEvmShadowCompetition({
      request,
      productionQuote: null,
      adapters: [adapter],
      nowIso: NOW,
    })
    expect(result.shadowWinner?.venueId).toBe('melega-dex')
    expect(() => buildV2ExecutionBinding(bindArgs(request, result.shadowWinner))).toThrow(
      MELEGA_V2_EXECUTION_BINDING_UNAVAILABLE,
    )
  })

  it('17/18: V2 builder does not import V1 intent/signer or wallet send', () => {
    const src = readFileSync(path.join(ENGINE, 'v2ExecutionBinding.ts'), 'utf8')
    expect(src).not.toMatch(/from ['"]\.\/executionIntent['"]/)
    expect(src).not.toContain('INTENT_VERSION = 1')
    expect(src).not.toContain('sendTransaction')
    expect(src).not.toContain('window.ethereum')
    expect(src).not.toContain('useSwapCallback')
    expect(src).not.toContain('SmartSwapForm')
    expect(src).not.toContain('TradeCockpit')
    expect(src).not.toMatch(/import\s+\{[^}]*engineSeal/)
    expect(src).not.toMatch(/import\s+\{[^}]*intentSigner/)
  })

  it('19: LEGACY_PRODUCTION / SHADOW / cutover=false stay unchanged', () => {
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
      const text = readFileSync(abs, 'utf8')
      expect(text).not.toContain('buildV2ExecutionBinding')
      expect(text).not.toContain('v2ExecutionBinding')
    }
  })
})
