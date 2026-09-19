import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { Interface } from '@ethersproject/abi'
import { CANONICAL_EXAMPLE_ASSETS } from '../assetIdentity'
import { runAuthorizedEvmShadowCompetition } from '../authorizedShadowRun'
import { evmNetwork } from '../domain'
import { computeNetVenueInput } from '../evaluateRevenuePolicy'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from '../operatingMode'
import type { SmartSwapRequest } from '../quote'
import { bindAuthorizedHostSession } from '../widget'

const WEB = path.resolve(__dirname, '../../../..')
const ENGINE = path.join(WEB, 'src/lib/smartswap-universal-engine')
const PREVIEW = path.join(WEB, 'src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview')
function freshNowIso(): string {
  return new Date().toISOString()
}
const GROSS_INPUT = '1000000'
const MELEGA_ROUTER = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
const UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

const V2_AMOUNTS_OUT = new Interface([
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
])

function encodeAmountsOutResult(amounts: string[]): string {
  return V2_AMOUNTS_OUT.encodeFunctionResult('getAmountsOut', [amounts])
}

function decodeGetAmountsOutCall(data: string): { amountIn: string; path: string[] } {
  const decoded = V2_AMOUNTS_OUT.decodeFunctionData('getAmountsOut', data)
  return {
    amountIn: decoded[0].toString(),
    path: (decoded[1] as string[]).map((address) => address.toLowerCase()),
  }
}

function authorizedHost(network = evmNetwork(56)) {
  return {
    walletConnected: false,
    walletAddress: null,
    network,
    requestedInput: null,
    requestedOutput: null,
    runtimeEnvironment: 'melega-dex' as const,
  }
}

function bscRequest(inputAmountRaw = GROSS_INPUT): SmartSwapRequest {
  return {
    requestId: 'shadow-preflight-bsc',
    network: evmNetwork(56),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw,
    exactOut: false,
    slippageBps: 50,
  }
}

function ethRequest(inputAmountRaw = GROSS_INPUT): SmartSwapRequest {
  return {
    requestId: 'shadow-preflight-eth',
    network: evmNetwork(1),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.weth,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
    inputAmountRaw,
    exactOut: false,
    slippageBps: 50,
  }
}

type RecordedCall = { router: string; amountIn: string; rpc: string }

function recordingFetch(outputByRouter: Record<string, string>) {
  const calls: RecordedCall[] = []
  const lookup = Object.fromEntries(Object.entries(outputByRouter).map(([router, out]) => [router.toLowerCase(), out]))
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as {
      params: [{ to: string; data: string }]
    }
    const router = body.params[0].to
    const decoded = decodeGetAmountsOutCall(body.params[0].data)
    calls.push({ router: router.toLowerCase(), amountIn: decoded.amountIn, rpc: String(input) })
    const amountOut = lookup[router.toLowerCase()]
    if (!amountOut) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ jsonrpc: '2.0', id: 1, error: { message: 'NO_ROUTE' } }),
      } as Response
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        jsonrpc: '2.0',
        id: 1,
        result: encodeAmountsOutResult([decoded.amountIn, amountOut]),
      }),
    } as Response
  }) as typeof fetch
  return { calls, fetchImpl }
}

function amountsFor(router: string, calls: RecordedCall[]): string[] {
  return calls.filter((row) => row.router === router.toLowerCase()).map((row) => row.amountIn)
}

describe('authorized SHADOW runtime preflight', () => {
  it('passes the factual source as melegaSource so Melega and Pancake quote net input', async () => {
    const net = computeNetVenueInput(GROSS_INPUT, 20)
    expect(net).toEqual({ feeAmountRaw: '2000', netVenueInputRaw: '998000' })
    const { calls, fetchImpl } = recordingFetch({
      [MELEGA_ROUTER]: '410000',
      [PANCAKE_ROUTER]: '420000',
    })
    const result = await runAuthorizedEvmShadowCompetition({
      session: bindAuthorizedHostSession(authorizedHost()),
      request: bscRequest(),
      productionQuote: null,
      melegaSnapshot: null,
      nowIso: freshNowIso(),
      rpcUrlByChain: { 56: 'https://bsc-dataseed.binance.org' },
      fetchImpl,
    })
    expect(amountsFor(MELEGA_ROUTER, calls)).toEqual(['998000'])
    expect(amountsFor(PANCAKE_ROUTER, calls)).toEqual(['998000'])
    expect(result.melega?.status).toBe('ok')
    expect(result.pancake?.status).toBe('ok')
    expect(result.melega?.quote?.inputAmountRaw).toBe('998000')
    expect(result.pancake?.quote?.inputAmountRaw).toBe('998000')
    expect(result.melega?.netVenueInputRaw).toBe('998000')
    expect(result.pancake?.netVenueInputRaw).toBe('998000')
    expect(result.productionMutated).toBe(false)
  })

  it('lets Pancake win the authorized BSC net-input competition', async () => {
    const { fetchImpl } = recordingFetch({
      [MELEGA_ROUTER]: '410000',
      [PANCAKE_ROUTER]: '420000',
    })
    const result = await runAuthorizedEvmShadowCompetition({
      session: bindAuthorizedHostSession(authorizedHost()),
      request: bscRequest(),
      productionQuote: null,
      melegaSnapshot: null,
      nowIso: freshNowIso(),
      rpcUrlByChain: { 56: 'https://bsc-dataseed.binance.org' },
      fetchImpl,
    })
    expect(result.shadowWinner?.venueId).toBe('pancakeswap')
    expect(result.shadowWinner?.status).toBe('ok')
    expect(result.pancake?.net?.netUserOutputRaw).toBe('420000')
    expect(result.melega?.net?.netUserOutputRaw).toBe('410000')
  })

  it('lets Melega win the authorized BSC net-input competition', async () => {
    const { fetchImpl } = recordingFetch({
      [MELEGA_ROUTER]: '510000',
      [PANCAKE_ROUTER]: '500000',
    })
    const result = await runAuthorizedEvmShadowCompetition({
      session: bindAuthorizedHostSession(authorizedHost()),
      request: bscRequest(),
      productionQuote: null,
      melegaSnapshot: null,
      nowIso: freshNowIso(),
      rpcUrlByChain: { 56: 'https://bsc-dataseed.binance.org' },
      fetchImpl,
    })
    expect(result.shadowWinner?.venueId).toBe('melega-dex')
    expect(result.shadowWinner?.status).toBe('ok')
    expect(result.melega?.net?.netUserOutputRaw).toBe('510000')
    expect(result.pancake?.net?.netUserOutputRaw).toBe('500000')
  })

  it('keeps Uniswap Ethereum quoting unchanged and does not invent a Melega ETH route', async () => {
    const uniNet = computeNetVenueInput(GROSS_INPUT, 15)
    expect(uniNet).toEqual({ feeAmountRaw: '1500', netVenueInputRaw: '998500' })
    const { calls, fetchImpl } = recordingFetch({
      [UNISWAP_ROUTER]: '400000',
    })
    const result = await runAuthorizedEvmShadowCompetition({
      session: bindAuthorizedHostSession(authorizedHost(evmNetwork(1))),
      request: ethRequest(),
      productionQuote: null,
      melegaSnapshot: null,
      nowIso: freshNowIso(),
      rpcUrlByChain: { 1: 'https://rpc.ankr.com/eth' },
      fetchImpl,
    })
    expect(amountsFor(UNISWAP_ROUTER, calls)).toEqual(['998500'])
    expect(amountsFor(MELEGA_ROUTER, calls)).toEqual([])
    expect(amountsFor(PANCAKE_ROUTER, calls)).toEqual([])
    expect(result.uniswap?.status).toBe('ok')
    expect(result.uniswap?.quote?.inputAmountRaw).toBe('998500')
    expect(result.shadowWinner?.venueId).toBe('uniswap')
    expect(result.melega?.status).not.toBe('ok')
    expect(result.pancake?.status).not.toBe('ok')
    expect(result.productionMutated).toBe(false)
  })

  it('does not prepare V2 transactions or invent an executor in the public runtime path', () => {
    const files = [
      path.join(ENGINE, 'authorizedShadowRun.ts'),
      path.join(PREVIEW, 'useSmartSwapExecutionPreview.ts'),
      path.join(PREVIEW, 'useShadowRuntimePreflight.ts'),
      path.join(PREVIEW, 'SmartSwapExecutionPreviewModule.tsx'),
    ]
    for (const file of files) {
      expect(existsSync(file)).toBe(true)
      const src = readFileSync(file, 'utf8')
      expect(src).not.toContain('prepareV2UserTransactions')
      expect(src).not.toMatch(/executorAddress\s*[:=]/)
    }
    const runner = readFileSync(path.join(ENGINE, 'authorizedShadowRun.ts'), 'utf8')
    expect(runner).toMatch(/melegaSource:\s*source/)
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(isProductionCutoverAllowed()).toBe(false)
  })
})
