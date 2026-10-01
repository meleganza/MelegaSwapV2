/**
 * P0 SmartSwap factual V2 price impact. The factual quote source (evmV2Quote) derives impact from the exact quoted
 * V2 path and the SAME venue's pair reserves, with the existing Melega DEX convention (LP fee excluded):
 *   impact = Π(1 − lpFee_i) − amountOut / midOut,  midOut = amountIn * Π(reserveOut_i / reserveIn_i)
 * The chain below is a deterministic in-memory JSON-RPC (router getAmountsOut with the real V2 formula, factory
 * getPair, pair token0/token1/getReserves); every value flows through the real source/adapters/competition/plan.
 */
import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { id } from '@ethersproject/hash'
import { CurrencyAmount, Native, Pair, Route, Token, Trade } from '@pancakeswap/sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MELEGA_BNB_FACTORY } from 'config/melegaChainRegistry'
import { computeTradePriceBreakdown } from 'views/Swap/SmartSwap/utils/exchange'
import { MELEGA_DEX_VENUE, PANCAKE_SWAP_VENUE } from '../certifiedVenues'
import { computeFeeAmountRaw } from '../evaluateRevenuePolicy'
import {
  computeV2MidOutputRaw,
  computeV2PriceImpactPercent,
  createFactualV2QuoteSource,
  resetV2PairMetadataCacheForTests,
  V2_PRICE_IMPACT_GRACE_MS,
} from '../evmV2Quote'
import { createMelegaDexAdapter } from '../melegaDexAdapter'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import type { SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition } from '../shadowCompetition'
import {
  buildV2UserExecutionPlan,
  currentRequestKeyOf,
  resetV2UserLocalNonceStateForTests,
  resolveSmartSwapCtaDecision,
  V2_PUBLIC_ACTION,
} from '../v2UserExecutionPlan'
import { isProductionCutoverAllowed } from '../operatingMode'
import { buildShadowRuntimeRequest } from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight'
import { buildV2ExecutionPreviewView } from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/v2PreviewTruth'
import {
  SMARTSWAP_DISPLAY_MODE,
  pinV2Confirmation,
  resolveSmartSwapExecutionDisplay,
  type SmartSwapV2ExecutionDisplay,
} from '../../../views/Swap/SmartSwap/utils/v2ExecutionDisplay'

const NOW = '2026-09-28T00:00:05.000Z'
const DEADLINE = 1_893_456_000
const USER = '0x1111111111111111111111111111111111111111'
const EXECUTOR = '0x7c07082839edd5797737640bba6af47992b9861e'
const RPC = 'http://fixture-rpc.invalid'
const PANCAKE_ROUTER = PANCAKE_SWAP_VENUE.routers[56]!.toLowerCase()
const PANCAKE_FACTORY = PANCAKE_SWAP_VENUE.v2Factories![56]!.toLowerCase()
const MELEGA_ROUTER = MELEGA_DEX_VENUE.routers[56]!.toLowerCase()
const MELEGA_FACTORY = MELEGA_DEX_VENUE.v2Factories![56]!.toLowerCase()
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const TKA = '0x1000000000000000000000000000000000000001' // sorts below WBNB  -> token0 vs WBNB
const TKB = '0x2000000000000000000000000000000000000002' // sorts below WBNB
const TKZ = '0xf00000000000000000000000000000000000000f' // sorts above everything -> token1
const E18 = BigInt('1000000000000000000')

const ROUTER = new Interface([
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
])
const FACTORY = new Interface(['function getPair(address tokenA, address tokenB) view returns (address pair)'])
const PAIR = new Interface([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
])

interface PoolFixture {
  factory: string
  tokenA: string
  tokenB: string
  reserveA: bigint
  reserveB: bigint
}

interface ChainOptions {
  pools: PoolFixture[]
  hidePairsOn?: string[] // factories whose getPair answers address(0) (router still quotes)
  failReserves?: boolean
  malformedToken0?: boolean
  changedReserves?: boolean
}

const pairAddress = (p: PoolFixture) => `0x${id(`${p.factory}:${p.tokenA}:${p.tokenB}`).slice(-40)}`.toLowerCase()
const sorted = (a: string, b: string) => (a.toLowerCase() < b.toLowerCase() ? [a, b] : [b, a])
const routerFactory: Record<string, string> = { [PANCAKE_ROUTER]: PANCAKE_FACTORY, [MELEGA_ROUTER]: MELEGA_FACTORY }

/** Exact UniswapV2Library.getAmountOut with the venue fee (9975/10000 for both certified BSC venues). */
function v2AmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint, feeBps = 25): bigint {
  const withFee = amountIn * BigInt(10_000 - feeBps)
  return (withFee * reserveOut) / (reserveIn * BigInt(10_000) + withFee)
}

function findPool(opts: ChainOptions, factory: string, a: string, b: string) {
  return opts.pools.find(
    (p) => p.factory === factory && ((p.tokenA === a && p.tokenB === b) || (p.tokenA === b && p.tokenB === a)),
  )
}

function oriented(pool: PoolFixture, tokenIn: string) {
  return pool.tokenA === tokenIn ? [pool.reserveA, pool.reserveB] : [pool.reserveB, pool.reserveA]
}

function mockChain(opts: ChainOptions) {
  const log: Array<{ to: string; selector: string; data: string }> = []
  const fetchImpl = (async (_url: string, init: { body: string }) => {
    const { params } = JSON.parse(init.body)
    const to = String(params[0].to).toLowerCase()
    const data = String(params[0].data)
    log.push({ to, selector: data.slice(0, 10), data })
    const ok = (result: string) => ({ ok: true, json: async () => ({ jsonrpc: '2.0', id: 1, result }) })
    const revert = (message: string) => ({
      ok: true,
      json: async () => ({ jsonrpc: '2.0', id: 1, error: { message } }),
    })
    if (routerFactory[to] && data.startsWith(ROUTER.getSighash('getAmountsOut'))) {
      const [amountIn, path] = ROUTER.decodeFunctionData('getAmountsOut', data)
      const amounts = [BigInt(amountIn.toString())]
      const p = (path as string[]).map((x) => x.toLowerCase())
      for (let i = 0; i < p.length - 1; i += 1) {
        const pool = findPool(opts, routerFactory[to], p[i], p[i + 1])
        if (!pool) return revert('execution reverted: PancakeLibrary: INVALID_PATH')
        const [rIn, rOut] = oriented(pool, p[i])
        amounts.push(v2AmountOut(amounts[i], rIn, rOut))
      }
      return ok(ROUTER.encodeFunctionResult('getAmountsOut', [amounts.map((x) => x.toString())]))
    }
    if (Object.values(routerFactory).includes(to) && data.startsWith(FACTORY.getSighash('getPair'))) {
      const [a, b] = FACTORY.decodeFunctionData('getPair', data).map((x: string) => x.toLowerCase())
      const pool = opts.hidePairsOn?.includes(to) ? undefined : findPool(opts, to, a, b)
      return ok(
        FACTORY.encodeFunctionResult('getPair', [
          pool ? pairAddress(pool) : '0x0000000000000000000000000000000000000000',
        ]),
      )
    }
    const pool = opts.pools.find((p) => pairAddress(p) === to)
    if (pool) {
      const [t0, t1] = sorted(pool.tokenA, pool.tokenB)
      if (data.startsWith(PAIR.getSighash('token0')))
        return ok(PAIR.encodeFunctionResult('token0', [opts.malformedToken0 ? USER : t0]))
      if (data.startsWith(PAIR.getSighash('token1'))) return ok(PAIR.encodeFunctionResult('token1', [t1]))
      if (data.startsWith(PAIR.getSighash('getReserves'))) {
        if (opts.failReserves) return revert('rpc overloaded')
        const [r0, r1] = oriented(pool, t0)
        return ok(
          PAIR.encodeFunctionResult('getReserves', [
            (opts.changedReserves ? r0 * BigInt(2) : r0).toString(),
            r1.toString(),
            1,
          ]),
        )
      }
    }
    return revert('execution reverted')
  }) as unknown as typeof fetch
  return { fetchImpl, log }
}

const signal = new AbortController().signal
function quote(opts: ChainOptions, router: string, path: string[], amountInRaw: bigint) {
  const chain = mockChain(opts)
  const source = createFactualV2QuoteSource({ rpcUrlByChain: { 56: RPC }, fetchImpl: chain.fetchImpl })
  return source
    .fetch({ chainId: 56, router, path, amountInRaw: amountInRaw.toString(), signal })
    .then((o) => ({ ...o, log: chain.log }))
}

/** Independent float closed form of the V2 exact-in impact (LP fee excluded) for cross-checking. */
function closedFormOneHop(amountIn: number, reserveIn: number, fee = 0.0025) {
  const x = amountIn * (1 - fee)
  return (1 - fee) * (x / (reserveIn + x)) * 100
}

function erc20Request(input: string, output: string | 'BNB', amountRaw: bigint): SmartSwapRequest {
  return buildShadowRuntimeRequest({
    chainId: 56,
    inputCurrency: { isNative: false, address: getAddress(input), decimals: 18, symbol: 'IN', chainId: 56 },
    outputCurrency:
      output === 'BNB'
        ? { isNative: true, decimals: 18, symbol: 'BNB', chainId: 56 }
        : { isNative: false, address: getAddress(output), decimals: 18, symbol: 'OUT', chainId: 56 },
    inputAmountRaw: amountRaw.toString(),
    exactOut: false,
    slippageBps: 50,
  }).request!
}

async function compete(opts: ChainOptions, request: SmartSwapRequest) {
  const chain = mockChain(opts)
  const source = createFactualV2QuoteSource({ rpcUrlByChain: { 56: RPC }, fetchImpl: chain.fetchImpl })
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [createMelegaDexAdapter(null, { quoteSource: source }), createPancakeSwapVenueAdapter(source)],
    nowIso: NOW,
  })
  return { result, log: chain.log }
}

beforeEach(() => {
  resetV2PairMetadataCacheForTests()
  resetV2UserLocalNonceStateForTests()
})

describe('factual V2 price impact: formula', () => {
  it('certified factories: Melega = repo MELEGA_BNB_FACTORY; Pancake V2 factory present; LP fee 25 bps each', () => {
    expect(MELEGA_FACTORY).toBe(MELEGA_BNB_FACTORY.toLowerCase())
    expect(PANCAKE_FACTORY).toBe('0xca143ce32fe78f1f7019d7d551a6402fc5350c73')
    expect(PANCAKE_SWAP_VENUE.v2LpFeeBps).toBe(25)
    expect(MELEGA_DEX_VENUE.v2LpFeeBps).toBe(25)
  })

  it('exact literal: reserves 10000/10000, in 100, out 98 -> mid 100, impact = 0.9975 − 0.98 = 1.75%', () => {
    const hops = [{ reserveIn: BigInt(10_000), reserveOut: BigInt(10_000), lpFeeBps: 25 }]
    expect(computeV2MidOutputRaw(BigInt(100), hops)).toBe(BigInt(100))
    expect(computeV2PriceImpactPercent({ amountInRaw: BigInt(100), amountOutRaw: BigInt(98), hops })).toBe(1.75)
  })

  it('tiny rounding negatives clamp to 0; genuinely inconsistent data (output above mid·(1−fee)) is null, not clamped', () => {
    const hops = [{ reserveIn: E18, reserveOut: E18, lpFeeBps: 25 }]
    // exactly at the fee-adjusted mid -> 0
    expect(computeV2PriceImpactPercent({ amountInRaw: BigInt(10_000), amountOutRaw: BigInt(9_975), hops })).toBe(0)
    // one wei above on a 1e18 trade: −1e-16 %, within one 1e-6 % unit -> rounding -> 0
    expect(
      computeV2PriceImpactPercent({
        amountInRaw: E18,
        amountOutRaw: (E18 * BigInt(9975)) / BigInt(10_000) + BigInt(1),
        hops,
      }),
    ).toBe(0)
    // output 1% above mid·(1−fee): impossible for x*y=k -> null
    expect(computeV2PriceImpactPercent({ amountInRaw: BigInt(10_000), amountOutRaw: BigInt(10_075), hops })).toBeNull()
    // malformed inputs
    expect(computeV2PriceImpactPercent({ amountInRaw: BigInt(0), amountOutRaw: BigInt(1), hops })).toBeNull()
    expect(computeV2PriceImpactPercent({ amountInRaw: BigInt(1), amountOutRaw: BigInt(1), hops: [] })).toBeNull()
    expect(
      computeV2PriceImpactPercent({
        amountInRaw: BigInt(1),
        amountOutRaw: BigInt(1),
        hops: [{ reserveIn: BigInt(0), reserveOut: E18, lpFeeBps: 25 }],
      }),
    ).toBeNull()
  })

  it('LP fee convention == legacy Melega UI (computeTradePriceBreakdown.priceImpactWithoutFee) on the same pools', () => {
    const a = new Token(56, getAddress(TKA), 18, 'A')
    const w = new Token(56, getAddress(WBNB), 18, 'WBNB')
    const b = new Token(56, getAddress(TKZ), 18, 'Z')
    const p1 = new Pair(
      CurrencyAmount.fromRawAmount(a, (BigInt(3_000_000) * E18).toString()),
      CurrencyAmount.fromRawAmount(w, (BigInt(9_000) * E18).toString()),
    )
    const p2 = new Pair(
      CurrencyAmount.fromRawAmount(w, (BigInt(1_200) * E18).toString()),
      CurrencyAmount.fromRawAmount(b, (BigInt(50_000_000) * E18).toString()),
    )
    const amountIn = BigInt(40_000) * E18
    const trade = Trade.exactIn(new Route([p1, p2], a, b), CurrencyAmount.fromRawAmount(a, amountIn.toString()))
    const legacy = computeTradePriceBreakdown(trade as any).priceImpactWithoutFee!
    const ours = computeV2PriceImpactPercent({
      amountInRaw: amountIn,
      amountOutRaw: BigInt(trade.outputAmount.quotient.toString()),
      hops: [
        { reserveIn: BigInt(3_000_000) * E18, reserveOut: BigInt(9_000) * E18, lpFeeBps: 25 },
        { reserveIn: BigInt(1_200) * E18, reserveOut: BigInt(50_000_000) * E18, lpFeeBps: 25 },
      ],
    })!
    expect(ours).toBeGreaterThan(1)
    expect(Math.abs(ours - Number(legacy.toFixed(8)))).toBeLessThan(1e-5)
  })
})

describe('factual V2 price impact: quote source over V2 reserves', () => {
  const ONE_HOP: PoolFixture = {
    factory: PANCAKE_FACTORY,
    tokenA: USDC,
    tokenB: WBNB,
    reserveA: BigInt(20_000_000) * E18,
    reserveB: BigInt(33_000) * E18,
  }

  it('A one-hop: known reserves + known getAmountsOut output -> expected impact (LP fee excluded)', async () => {
    const amountIn = BigInt(500) * E18
    const o = await quote({ pools: [ONE_HOP] }, PANCAKE_ROUTER, [USDC, WBNB], amountIn)
    const expectedOut = v2AmountOut(amountIn, ONE_HOP.reserveA, ONE_HOP.reserveB)
    expect(o.amountOutRaw).toBe(expectedOut.toString())
    expect(o.priceImpactPercent).not.toBeNull()
    expect(o.priceImpactPercent!).toBeCloseTo(closedFormOneHop(500, 20_000_000), 5) // ≈ 0.002494 %
    // the raw deviation (incl. LP fee) would be ≈ 0.2525 %; the displayed curve impact excludes the 0.25 % LP fee
    const mid = computeV2MidOutputRaw(amountIn, [
      { reserveIn: ONE_HOP.reserveA, reserveOut: ONE_HOP.reserveB, lpFeeBps: 25 },
    ])!
    const rawDeviation = Number(((mid - expectedOut) * BigInt(1e10)) / mid) / 1e8
    expect(rawDeviation - o.priceImpactPercent!).toBeCloseTo(0.25, 4)
    // reads: getAmountsOut + getPair + token0 + token1 + getReserves, all eth_call (read-only)
    expect(o.log.map((c) => c.selector).sort()).toEqual(
      [
        ROUTER.getSighash('getAmountsOut'),
        FACTORY.getSighash('getPair'),
        PAIR.getSighash('token0'),
        PAIR.getSighash('token1'),
        PAIR.getSighash('getReserves'),
      ].sort(),
    )
  })

  it('B two-hop TOKEN->WBNB->TOKEN: composed hop mid prices -> expected impact', async () => {
    const pools: PoolFixture[] = [
      {
        factory: MELEGA_FACTORY,
        tokenA: TKA,
        tokenB: WBNB,
        reserveA: BigInt(2_000_000) * E18,
        reserveB: BigInt(400) * E18,
      },
      {
        factory: MELEGA_FACTORY,
        tokenA: WBNB,
        tokenB: TKB,
        reserveA: BigInt(250) * E18,
        reserveB: BigInt(9_000_000) * E18,
      },
    ]
    const amountIn = BigInt(10_000) * E18
    const o = await quote({ pools }, MELEGA_ROUTER, [TKA, WBNB, TKB], amountIn)
    const hop1 = v2AmountOut(amountIn, pools[0].reserveA, pools[0].reserveB)
    const out = v2AmountOut(hop1, pools[1].reserveA, pools[1].reserveB)
    expect(o.amountOutRaw).toBe(out.toString())
    // independent float: mid = in * (400/2e6) * (9e6/250); impact = 0.9975^2 − out/mid
    const midF = 10_000 * (400 / 2_000_000) * (9_000_000 / 250)
    const expected = (0.9975 ** 2 - Number(out / BigInt(1e9)) / 1e9 / midF) * 100
    expect(o.priceImpactPercent!).toBeCloseTo(expected, 4)
    expect(o.priceImpactPercent!).toBeGreaterThan(0.5)
    expect(
      computeV2MidOutputRaw(amountIn, [
        { reserveIn: pools[0].reserveA, reserveOut: pools[0].reserveB, lpFeeBps: 25 },
        { reserveIn: pools[1].reserveA, reserveOut: pools[1].reserveB, lpFeeBps: 25 },
      ]),
    ).toBe(BigInt(72_000) * E18)
  })

  it('C reserve orientation: tokenIn as token1 gives the same impact as tokenIn as token0', async () => {
    const amountIn = BigInt(1_000) * E18
    const asToken0 = await quote(
      {
        pools: [
          {
            factory: PANCAKE_FACTORY,
            tokenA: TKA,
            tokenB: WBNB,
            reserveA: BigInt(800_000) * E18,
            reserveB: BigInt(120) * E18,
          },
        ],
      },
      PANCAKE_ROUTER,
      [TKA, WBNB],
      amountIn,
    )
    resetV2PairMetadataCacheForTests()
    const asToken1 = await quote(
      {
        pools: [
          {
            factory: PANCAKE_FACTORY,
            tokenA: TKZ,
            tokenB: WBNB,
            reserveA: BigInt(800_000) * E18,
            reserveB: BigInt(120) * E18,
          },
        ],
      },
      PANCAKE_ROUTER,
      [TKZ, WBNB],
      amountIn,
    )
    expect(TKA < WBNB && TKZ > WBNB).toBe(true)
    expect(asToken1.amountOutRaw).toBe(asToken0.amountOutRaw)
    expect(asToken0.priceImpactPercent!).toBeCloseTo(closedFormOneHop(1_000, 800_000), 5)
    expect(asToken1.priceImpactPercent).toBe(asToken0.priceImpactPercent)
  })

  it('D missing pair (factory returns address(0)): quote stays valid, impact null', async () => {
    const o = await quote({ pools: [ONE_HOP], hidePairsOn: [PANCAKE_FACTORY] }, PANCAKE_ROUTER, [USDC, WBNB], E18)
    expect(o.amountOutRaw).toBe(v2AmountOut(E18, ONE_HOP.reserveA, ONE_HOP.reserveB).toString())
    expect(o.priceImpactPercent).toBeNull()
  })

  it('E reserve RPC failure / malformed pair / unsupported router: quote valid, impact null', async () => {
    const failed = await quote({ pools: [ONE_HOP], failReserves: true }, PANCAKE_ROUTER, [USDC, WBNB], E18)
    expect(failed.amountOutRaw).toBe(v2AmountOut(E18, ONE_HOP.reserveA, ONE_HOP.reserveB).toString())
    expect(failed.priceImpactPercent).toBeNull()
    resetV2PairMetadataCacheForTests()
    const malformed = await quote({ pools: [ONE_HOP], malformedToken0: true }, PANCAKE_ROUTER, [USDC, WBNB], E18)
    expect(malformed.amountOutRaw).toBe(failed.amountOutRaw)
    expect(malformed.priceImpactPercent).toBeNull()
    // a router with no certified factory metadata: no guessed factory, impact unavailable, no pair reads at all
    const chain = mockChain({ pools: [ONE_HOP] })
    routerFactory['0x9999999999999999999999999999999999999999'] = PANCAKE_FACTORY
    try {
      const source = createFactualV2QuoteSource({ rpcUrlByChain: { 56: RPC }, fetchImpl: chain.fetchImpl })
      const o = await source.fetch({
        chainId: 56,
        router: '0x9999999999999999999999999999999999999999',
        path: [USDC, WBNB],
        amountInRaw: E18.toString(),
        signal,
      })
      expect(o.amountOutRaw).toBe(failed.amountOutRaw)
      expect(o.priceImpactPercent).toBeNull()
      expect(chain.log.map((c) => c.selector)).toEqual([ROUTER.getSighash('getAmountsOut')])
    } finally {
      delete routerFactory['0x9999999999999999999999999999999999999999']
    }
  })

  it('reserve changes between reads keep the router quote but omit inconsistent impact', async () => {
    const result = await quote({ pools: [ONE_HOP], changedReserves: true }, PANCAKE_ROUTER, [USDC, WBNB], E18)
    expect(result.amountOutRaw).toBe(v2AmountOut(E18, ONE_HOP.reserveA, ONE_HOP.reserveB).toString())
    expect(result.priceImpactPercent).toBeNull()
  })

  it('cached token metadata still rereads reserves and supports reverse direction', async () => {
    await quote({ pools: [ONE_HOP] }, PANCAKE_ROUTER, [USDC, WBNB], E18)
    const reverse = await quote({ pools: [ONE_HOP] }, PANCAKE_ROUTER, [WBNB, USDC], E18)
    expect(reverse.priceImpactPercent).toBeCloseTo(closedFormOneHop(1, 33_000), 5)
    expect(reverse.log.map((c) => c.selector).sort()).toEqual(
      [ROUTER.getSighash('getAmountsOut'), PAIR.getSighash('getReserves')].sort(),
    )
    const changed = { ...ONE_HOP, reserveA: ONE_HOP.reserveA * BigInt(2) }
    const refreshed = await quote({ pools: [changed] }, PANCAKE_ROUTER, [USDC, WBNB], BigInt(500) * E18)
    expect(refreshed.priceImpactPercent).toBeCloseTo(closedFormOneHop(500, 40_000_000), 5)
  })

  it('hung reserve RPC cannot discard a router quote arriving near the 1200ms adapter deadline', async () => {
    const chain = mockChain({ pools: [ONE_HOP] })
    let reserveSignal: AbortSignal | undefined
    const diagnostics: string[] = []
    const source = createFactualV2QuoteSource({
      rpcUrlByChain: { 56: RPC },
      onImpactDiagnostic: (event) => diagnostics.push(`${event.failureCode}:${event.failedOperation}`),
      fetchImpl: (async (url, init) => {
        const { params } = JSON.parse(String(init!.body))
        if (params[0].to.toLowerCase() !== PANCAKE_ROUTER) {
          reserveSignal = init!.signal as AbortSignal
          return new Promise(() => {}) // even a transport ignoring abort is bounded
        }
        await new Promise((resolve) => setTimeout(resolve, 1050))
        return chain.fetchImpl(url, init)
      }) as typeof fetch,
    })
    const { collectBoundedParallel } = await import('../latency')
    vi.useFakeTimers()
    try {
      const pending = collectBoundedParallel([
        {
          id: 'pancakeswap',
          run: (requestSignal) =>
            source.fetch({
              chainId: 56,
              router: PANCAKE_ROUTER,
              path: [USDC, WBNB],
              amountInRaw: E18.toString(),
              signal: requestSignal,
            }),
        },
      ])
      await vi.advanceTimersByTimeAsync(V2_PRICE_IMPACT_GRACE_MS)
      const [result] = await pending
      expect(result.status).toBe('ok')
      if (result.status !== 'ok') throw new Error('router quote lost')
      expect(result.value.amountOutRaw).toBe(v2AmountOut(E18, ONE_HOP.reserveA, ONE_HOP.reserveB).toString())
      expect(result.value.priceImpactPercent).toBeNull()
      expect(reserveSignal!.aborted).toBe(true)
      expect(diagnostics).toEqual(['RESERVE_READ_TIMEOUT:readV2PathReserves'])
    } finally {
      vi.useRealTimers()
    }
  })

  it('getAmountsOut failure still fails the quote exactly as before (impact never rescues or invents a route)', async () => {
    await expect(quote({ pools: [] }, PANCAKE_ROUTER, [USDC, WBNB], E18)).rejects.toThrow(/INVALID_PATH/)
  })
})

describe('factual V2 price impact: engine integration', () => {
  it('F SmartSwap fee isolation: the router is quoted with netVenueInputRaw; the 20 bps fee is not AMM impact', async () => {
    const pool: PoolFixture = {
      factory: PANCAKE_FACTORY,
      tokenA: USDC,
      tokenB: WBNB,
      reserveA: BigInt(20_000_000) * E18,
      reserveB: BigInt(33_000) * E18,
    }
    const gross = BigInt(5) * E18
    const { result, log } = await compete({ pools: [pool] }, erc20Request(USDC, 'BNB', gross))
    const winner = result.shadowWinner!
    expect(winner.venueId).toBe('pancakeswap')
    const net = gross - BigInt(computeFeeAmountRaw(gross.toString(), 20))
    expect(winner.netVenueInputRaw).toBe(net.toString())
    expect(net).toBe(gross - (gross * BigInt(20)) / BigInt(10_000))
    const quoted = log
      .filter((c) => c.to === PANCAKE_ROUTER)
      .map((c) => ROUTER.decodeFunctionData('getAmountsOut', c.data)[0].toString())
    expect(new Set(quoted)).toEqual(new Set([net.toString()]))
    const impact = winner.quote!.priceImpactPercent!
    // result resolution is 1e-6 of a percentage point (truncated)
    expect(Math.abs(impact - closedFormOneHop(Number(net) / 1e18, 20_000_000))).toBeLessThanOrEqual(1e-6)
    expect(impact).toBeLessThan(0.001) // counting the 20 bps SmartSwap fee would be >= 0.20 %
  })

  it('G routing neutrality: identical winner/order/net with impact present or null (winner even has the HIGHER impact)', async () => {
    // Pancake: better price but shallow pool (higher impact) still gives the highest net output -> must win.
    const pools: PoolFixture[] = [
      {
        factory: PANCAKE_FACTORY,
        tokenA: TKA,
        tokenB: TKB,
        reserveA: BigInt(100_000) * E18,
        reserveB: BigInt(130_000) * E18,
      },
      {
        factory: MELEGA_FACTORY,
        tokenA: TKA,
        tokenB: TKB,
        reserveA: BigInt(10_000_000) * E18,
        reserveB: BigInt(10_000_000) * E18,
      },
    ]
    const request = erc20Request(TKA, TKB, BigInt(1_000) * E18)
    const withImpact = await compete({ pools }, request)
    resetV2PairMetadataCacheForTests()
    const withoutImpact = await compete({ pools, hidePairsOn: [PANCAKE_FACTORY, MELEGA_FACTORY] }, request)
    const w1 = withImpact.result.shadowWinner!
    const w0 = withoutImpact.result.shadowWinner!
    expect(w1.venueId).toBe('pancakeswap')
    const melega = withImpact.result.melega!
    expect(melega.status).toBe('ok')
    expect(w1.quote!.priceImpactPercent!).toBeGreaterThan(melega.quote!.priceImpactPercent!)
    expect(withoutImpact.result.melega!.quote!.priceImpactPercent).toBeNull()
    expect(withoutImpact.result.candidates.map((c) => c.quote?.quoteId)).toEqual(
      withImpact.result.candidates.map((c) => c.quote?.quoteId),
    )
    expect(w0.quote!.priceImpactPercent).toBeNull()
    expect(w0.venueId).toBe(w1.venueId)
    expect(w0.quote!.quoteId).toBe(w1.quote!.quoteId)
    expect(w0.quote!.netUserOutputRaw).toBe(w1.quote!.netUserOutputRaw)
    expect(w0.quote!.hops.map((h) => h.tokenOut)).toEqual(w1.quote!.hops.map((h) => h.tokenOut))
    // everything except the informational impact and wall-clock/latency stamps is identical
    const VOLATILE =
      /^(priceImpactPercent|quotedAt|quoteTimestamp|quoteExpiry|observedAt|checkedAt|latencyMs|elapsedMs|durationMs)$/
    const strip = (r: unknown) => JSON.stringify(r, (k, v) => (VOLATILE.test(k) ? null : v))
    expect(strip(w0)).toBe(strip(w1))
    expect(strip(withoutImpact.result.decisionEvidence)).toBe(strip(withImpact.result.decisionEvidence))
  })

  it('H display plumbing: factual winner impact -> winnerPriceImpactPercent -> V2 display -> preview "Low (x%)" and the pinned confirmation', async () => {
    const pool: PoolFixture = {
      factory: PANCAKE_FACTORY,
      tokenA: USDC,
      tokenB: WBNB,
      reserveA: BigInt(200_000) * E18,
      reserveB: BigInt(330) * E18,
    }
    const request = erc20Request(USDC, 'BNB', BigInt(500) * E18)
    const { result } = await compete({ pools: [pool] }, request)
    const winner = result.shadowWinner!
    const impact = winner.quote!.priceImpactPercent!
    expect(impact).toBeGreaterThan(0.2)
    expect(impact).toBeLessThan(1)
    const plan = buildV2UserExecutionPlan({
      user: USER,
      walletChainId: 56,
      request,
      requestKey: currentRequestKeyOf(request),
      shadow: { status: 'ready', requestKey: currentRequestKeyOf(request), winner, v2Available: true },
      observedAllowance: {
        chainId: 56,
        token: getAddress(USDC),
        owner: USER,
        spender: getAddress(EXECUTOR),
        amountRaw: '0',
      },
      allowanceReadStatus: 'ok',
      nowIso: NOW,
      deadline: DEADLINE,
      bscPublicCutoverEnabled: true,
    })
    expect(plan.ok).toBe(true)
    expect(plan.winnerPriceImpactPercent).toBe(impact)
    const decision = resolveSmartSwapCtaDecision({
      planOk: plan.ok,
      cutoverAllowed: isProductionCutoverAllowed(56, true) && plan.productionCutoverAllowed,
      testOnlyExecutionGate: false,
      planReason: plan.reason,
    })
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    const usdcC = new Token(56, getAddress(USDC), 18, 'USDC')
    const display = resolveSmartSwapExecutionDisplay({
      decision,
      plan,
      v2Pending: false,
      inputCurrency: usdcC,
      outputCurrency: Native.onChain(56),
    })
    expect(display.mode).toBe(SMARTSWAP_DISPLAY_MODE.V2)
    const d = display as SmartSwapV2ExecutionDisplay
    const shown = (Math.round(impact * 100) / 100).toFixed(2)
    expect(d.priceImpact?.toFixed(2)).toBe(shown)
    const view = buildV2ExecutionPreviewView(display)!
    const row = view.metrics.find((m) => m.label === 'Price impact')!
    expect(row.value).toBe(`Low (${shown}%)`)
    expect(row.value).not.toBe('—')
    const pinned = pinV2Confirmation(plan, d)!
    expect(pinned.display.priceImpact?.toFixed(2)).toBe(shown)
    expect(pinned.display).toBe(d)
  })
})
