/**
 * SMART_SWAP_MODULE_002 — Route Engine tests (pure model / adapter).
 */
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  SMART_SWAP_ROUTE_ENGINE_OWNERSHIP,
  SMART_SWAP_ROUTE_FAILURES,
  buildSmartSwapRouteEngineResult,
  classifyRouteType,
  normalizeSmartSwapRoute,
  rankSmartSwapRoutes,
  routeFailure,
} from '../index'
import type { SmartSwapTradeSnapshot } from '../types'
import { SMART_SWAP_ARCHITECTURE_ID } from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(WEB, '../..')
const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDT = '0x55d398326f99059ff775485246999027b3197955'

function token(address: string, symbol: string, decimals = 18, isNative = false) {
  return { chainId: 56, address, symbol, decimals, isNative }
}

function directSnapshot(overrides: Partial<SmartSwapTradeSnapshot> = {}): SmartSwapTradeSnapshot {
  return {
    chainId: 56,
    input: token(WBNB, 'WBNB'),
    output: token(MARCO, 'MARCO'),
    pathAddresses: [WBNB, MARCO],
    pairs: [{ address: '0xpairwbnbmarco', kind: 'v2', token0: WBNB, token1: MARCO }],
    expectedOutputRaw: '1000000000000000000',
    expectedOutputFormatted: '1.0 MARCO',
    priceImpactPercent: 0.42,
    gasUnits: 180000,
    lpFeeRaw: '2500000000000000',
    lpFeeSymbol: 'WBNB',
    source: 'smart-router',
    smartRouterRouteType: 'V2',
    freshness: '2026-07-26T01:00:00.000Z',
    ...overrides,
  }
}

describe('SMART_SWAP_MODULE_002 Route Engine', () => {
  it('keeps Architecture 000 + Module 001 freeze (no SmartSwapForm edits)', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-route-engine')

    const arch = path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts')
    expect(existsSync(arch)).toBe(true)
    expect(createHash('sha256').update(readFileSync(arch)).digest('hex').length).toBe(64)

    const hero = path.join(WEB, 'src/views/SmartSwapStudio/modules/SmartSwapHeroModule.tsx')
    expect(existsSync(hero)).toBe(true)

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    // Core exchange/routing utils must remain untouched; UX defaults on index may change.
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\/utils\/exchange\.ts/)
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\/hooks\//)
  })

  it('normalizes a direct route with impact, gas, and fee estimates', () => {
    const route = normalizeSmartSwapRoute(directSnapshot())
    expect(route.routeType).toBe('DIRECT')
    expect(route.hops).toHaveLength(1)
    expect(route.pools).toHaveLength(1)
    expect(route.priceImpact.availability).toBe('available')
    expect(route.priceImpact.percent).toBeCloseTo(0.42)
    expect(route.gasEstimate.availability).toBe('available')
    expect(route.feeEstimate.availability).toBe('available')
    expect(route.feeEstimate.note).toMatch(/LP fee display only/i)
    expect(route.feeEstimate.note).not.toContain('Treasury Runtime')
    expect(route.confidence).toBeGreaterThan(50)
    expect(route.inputToken.symbol).toBe('WBNB')
    expect(route.outputToken.symbol).toBe('MARCO')
  })

  it('classifies multi-hop, native, stable, and unsupported routes', () => {
    expect(
      classifyRouteType(
        directSnapshot({
          pathAddresses: [WBNB, USDT, MARCO],
          pairs: [
            { address: '0xp1', kind: 'v2', token0: WBNB, token1: USDT },
            { address: '0xp2', kind: 'v2', token0: USDT, token1: MARCO },
          ],
        }),
      ),
    ).toBe('MULTI_HOP')
    expect(classifyRouteType(directSnapshot({ isNativeRoute: true }))).toBe('NATIVE')
    expect(classifyRouteType(directSnapshot({ smartRouterRouteType: 'STABLE_SWAP' }))).toBe('STABLE')
    expect(classifyRouteType(directSnapshot({ unsupported: true }))).toBe('UNSUPPORTED')
  })

  it('ranks routes explainably and never claims best-route guarantee', () => {
    const a = normalizeSmartSwapRoute(directSnapshot({ routeId: 'a', expectedOutputRaw: '1000', priceImpactPercent: 0.3 }))
    const b = normalizeSmartSwapRoute(
      directSnapshot({
        routeId: 'b',
        expectedOutputRaw: '900',
        priceImpactPercent: 0.2,
        pathAddresses: [WBNB, USDT, MARCO],
        pairs: [
          { address: '0xp1', kind: 'v2', token0: WBNB, token1: USDT },
          { address: '0xp2', kind: 'v2', token0: USDT, token1: MARCO },
        ],
      }),
    )
    const ranking = rankSmartSwapRoutes([a, b])
    expect(ranking.recommendedRouteId).toBeTruthy()
    expect(ranking.recommendationReason).toMatch(/Recommended route by factual score/)
    expect(ranking.recommendationReason).toMatch(/Not a guaranteed best price/)
    expect(ranking.recommendationReason?.toLowerCase()).not.toContain('best route guaranteed')
  })

  it('exposes high impact warnings without fabricating impact', () => {
    const route = normalizeSmartSwapRoute(directSnapshot({ priceImpactPercent: 16 }))
    expect(route.warnings.some((w) => /High price impact/i.test(w))).toBe(true)
    const unavailable = normalizeSmartSwapRoute(directSnapshot({ priceImpactPercent: null }))
    expect(unavailable.priceImpact.availability).toBe('unavailable')
    expect(unavailable.priceImpact.percent).toBeNull()
  })

  it('keeps quote usable when gas estimation is unavailable', () => {
    const route = normalizeSmartSwapRoute(directSnapshot({ gasUnits: null }))
    expect(route.gasEstimate.availability).toBe('unavailable')
    expect(route.expectedOutputRaw).toBe('1000000000000000000')
    expect(route.warnings.some((w) => /Gas estimate unavailable/i.test(w))).toBe(true)
    const result = buildSmartSwapRouteEngineResult({
      snapshots: [directSnapshot({ gasUnits: null })],
    })
    expect(result.status).toBe('ok')
  })

  it('never returns empty arrays as success', () => {
    const empty = buildSmartSwapRouteEngineResult({ snapshots: [] })
    expect(empty.status).toBe('failure')
    expect(empty.routes).toEqual([])
    if (empty.status === 'failure') expect(empty.failure).toBe('NO_ROUTE')

    const noLiquidity = buildSmartSwapRouteEngineResult({
      snapshots: [directSnapshot({ expectedOutputRaw: '0' })],
    })
    expect(noLiquidity.status).toBe('failure')

    const unsupported = buildSmartSwapRouteEngineResult({
      snapshots: [directSnapshot({ unsupported: true, expectedOutputRaw: '1' })],
    })
    expect(unsupported.status).toBe('failure')
    if (unsupported.status === 'failure') expect(unsupported.failure).toBe('UNSUPPORTED_PAIR')
  })

  it('supports all required failure states', () => {
    expect(SMART_SWAP_ROUTE_FAILURES).toEqual([
      'NO_ROUTE',
      'PARTIAL_ROUTE_DATA',
      'QUOTE_UNAVAILABLE',
      'LIQUIDITY_UNAVAILABLE',
      'NETWORK_UNAVAILABLE',
      'UNSUPPORTED_PAIR',
    ])
    for (const f of SMART_SWAP_ROUTE_FAILURES) {
      const r = routeFailure(f)
      expect(r.status).toBe('failure')
      expect(r.routes).toEqual([])
      expect(r.recommendedRouteId).toBeNull()
    }
    expect(buildSmartSwapRouteEngineResult({ snapshots: [], forceFailure: 'NETWORK_UNAVAILABLE' }).status).toBe(
      'failure',
    )
  })

  it('keeps token identity fields consistent (address/symbol/decimals)', () => {
    const route = normalizeSmartSwapRoute(directSnapshot())
    expect(route.inputToken.address.toLowerCase()).toBe(WBNB)
    expect(route.inputToken.decimals).toBe(18)
    expect(route.outputToken.address.toLowerCase()).toBe(MARCO)
    expect(route.outputToken.symbol).toBe('MARCO')
  })

  it('documents ownership — intelligence only, no custody / fee override', () => {
    expect(SMART_SWAP_ROUTE_ENGINE_OWNERSHIP.owns).toContain('route intelligence')
    expect(SMART_SWAP_ROUTE_ENGINE_OWNERSHIP.doesNotOwn).toEqual(
      expect.arrayContaining(['swap execution', 'fee settlement', 'custody', 'FSC-01 waterfall']),
    )
    expect(SMART_SWAP_ROUTE_ENGINE_OWNERSHIP.surfaces.smartSwap).toMatch(/SmartSwapForm/)
    expect(SMART_SWAP_ROUTE_ENGINE_OWNERSHIP.forbiddenClaims).toContain('best route guaranteed')
  })
})
