/**
 * SMART_SWAP_MODULE_003 — Execution Preview tests.
 */
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { normalizeSmartSwapRoute } from 'lib/smart-swap-route-engine'
import type { SmartSwapTradeSnapshot } from 'lib/smart-swap-route-engine'
import { SMART_SWAP_ARCHITECTURE_ID } from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'
import {
  SMART_SWAP_EXECUTION_PREVIEW_OWNERSHIP,
  SMART_SWAP_PREVIEW_FAILURES,
  buildHopVisualization,
  buildSmartSwapExecutionPreview,
  computeMinimumReceivedRaw,
  executionPreviewInputFromRoute,
  formatImpactLabel,
  previewFailure,
} from '../index'
import type { SmartSwapExecutionPreviewInput } from '../types'

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
    input: token(USDT, 'USDT', 18),
    output: token(MARCO, 'MARCO'),
    pathAddresses: [USDT, MARCO],
    pathSymbols: ['USDT', 'MARCO'],
    pairs: [{ address: '0xpairusdtmarco', kind: 'v2', token0: USDT, token1: MARCO }],
    expectedOutputRaw: '1000000000000000000',
    expectedOutputFormatted: '1.0',
    priceImpactPercent: 0.35,
    gasUnits: 210000,
    source: 'smart-router',
    smartRouterRouteType: 'V2',
    freshness: '2026-07-26T02:00:00.000Z',
    ...overrides,
  }
}

function previewInputFromSnapshot(
  snap: SmartSwapTradeSnapshot,
  slippageBips = 50,
  extra: Partial<SmartSwapExecutionPreviewInput> = {},
): SmartSwapExecutionPreviewInput {
  const route = normalizeSmartSwapRoute(snap)
  return {
    ...executionPreviewInputFromRoute({
      route,
      inputAmount: '100',
      slippageBips,
      pathSymbols: snap.pathSymbols,
      nowIso: '2026-07-26T02:00:00.000Z',
    }),
    ...extra,
  }
}

describe('SMART_SWAP_MODULE_003 Execution Preview', () => {
  it('keeps Architecture freeze + SmartSwapForm unchanged', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-execution-preview')
    expect(form).not.toContain('SmartSwapExecutionPreview')

    const arch = path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts')
    expect(existsSync(arch)).toBe(true)
    expect(createHash('sha256').update(readFileSync(arch)).digest('hex').length).toBe(64)

    const cockpit = readFileSync(path.join(WEB, 'src/views/Trade/TradeCockpit.tsx'), 'utf8')
    expect(cockpit).toContain('SmartSwapExecutionPreviewModule')
    expect(cockpit).toContain('SmartSwapForm')

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\//)
    expect(status).not.toMatch(/melega-smart-router\//)
    expect(status).not.toMatch(/d87-pricing\//)
    expect(status).not.toMatch(/treasury-handoff\//)
    expect(status).not.toMatch(/kerl/)
  })

  it('builds ERC20 swap preview with fee + slippage + route explanation', () => {
    const result = buildSmartSwapExecutionPreview(previewInputFromSnapshot(directSnapshot()))
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    const p = result.preview
    expect(p.inputToken.symbol).toBe('USDT')
    expect(p.outputToken.symbol).toBe('MARCO')
    expect(p.expectedOutput).toBe('1000000000000000000')
    expect(p.slippageBips).toBe(50)
    expect(p.minimumReceived).toBe(computeMinimumReceivedRaw('1000000000000000000', 50))
    expect(p.protocolFee.bps).toBe(20) // buy MARCO
    expect(p.protocolFee.note).toContain('Treasury Runtime')
    expect(p.explanation).toMatch(/If confirmed/)
    expect(p.confidenceFactors.length).toBeGreaterThan(0)
    expect(p.hopVisualization[0].label).toBe('USDT')
    expect(p.hopVisualization[p.hopVisualization.length - 1].label).toBe('MARCO')
  })

  it('builds native route preview', () => {
    const result = buildSmartSwapExecutionPreview(
      previewInputFromSnapshot(
        directSnapshot({
          input: token(WBNB, 'BNB', 18, true),
          output: token(MARCO, 'MARCO'),
          pathAddresses: [WBNB, MARCO],
          pathSymbols: ['BNB', 'MARCO'],
          isNativeRoute: true,
          pairs: [{ address: '0xpairbnbmarco', kind: 'v2', token0: WBNB, token1: MARCO }],
        }),
        100,
        { isBuyMarco: true },
      ),
    )
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.preview.inputToken.symbol).toBe('BNB')
    expect(result.preview.inputToken.isNative).toBe(true)
    expect(result.preview.slippageBips).toBe(100)
    expect(result.preview.minimumReceived).toBe(computeMinimumReceivedRaw('1000000000000000000', 100))
  })

  it('visualizes multi-hop route without technical noise', () => {
    const snap = directSnapshot({
      pathAddresses: [USDT, WBNB, MARCO],
      pathSymbols: ['USDT', 'BNB', 'MARCO'],
      pairs: [
        { address: '0xp1', kind: 'v2', token0: USDT, token1: WBNB },
        { address: '0xp2', kind: 'v2', token0: WBNB, token1: MARCO },
      ],
    })
    const route = normalizeSmartSwapRoute(snap)
    const viz = buildHopVisualization({
      inputToken: route.inputToken,
      outputToken: route.outputToken,
      hops: route.hops,
      pools: route.pools,
      pathSymbols: snap.pathSymbols,
    })
    const labels = viz.map((v) => v.label)
    expect(labels[0]).toBe('USDT')
    expect(labels).toContain('USDT/BNB Pool')
    expect(labels).toContain('BNB')
    expect(labels).toContain('BNB/MARCO Pool')
    expect(labels[labels.length - 1]).toBe('MARCO')
    expect(labels.join(' ')).not.toMatch(/0x[a-f0-9]{40}/i)

    const result = buildSmartSwapExecutionPreview(
      executionPreviewInputFromRoute({
        route,
        inputAmount: '50',
        slippageBips: 50,
        pathSymbols: snap.pathSymbols,
      }),
    )
    expect(result.status).toBe('ok')
    if (result.status === 'ok') expect(result.preview.routeHops).toHaveLength(2)
  })

  it('fails clearly on no route / quote unavailable / partial / stale', () => {
    expect(buildSmartSwapExecutionPreview(null).status).toBe('failure')
    expect(buildSmartSwapExecutionPreview(previewInputFromSnapshot(directSnapshot()), 'NO_ROUTE').failure).toBe(
      'NO_ROUTE',
    )
    const noRoute = buildSmartSwapExecutionPreview(
      previewInputFromSnapshot(directSnapshot(), 50, { routeUnavailable: true }),
    )
    expect(noRoute.status).toBe('failure')
    if (noRoute.status === 'failure') {
      expect(noRoute.failure).toBe('NO_ROUTE')
      expect(noRoute.preview).toBeNull()
    }

    const noQuote = buildSmartSwapExecutionPreview(
      previewInputFromSnapshot(directSnapshot({ expectedOutputRaw: '0' })),
    )
    expect(noQuote.status).toBe('failure')

    const partial = buildSmartSwapExecutionPreview(
      previewInputFromSnapshot(directSnapshot(), 50, { partialData: true, hops: [], pools: [] }),
    )
    expect(partial.status).toBe('failure')
    if (partial.status === 'failure') expect(partial.failure).toBe('PARTIAL_DATA')

    const stale = buildSmartSwapExecutionPreview(
      previewInputFromSnapshot(directSnapshot({ expectedOutputRaw: '0' }), 50, { stale: true }),
    )
    expect(stale.status).toBe('failure')
  })

  it('never hides high price impact and never maps unavailable to zero', () => {
    const high = buildSmartSwapExecutionPreview(
      previewInputFromSnapshot(directSnapshot({ priceImpactPercent: 7.5 })),
    )
    expect(high.status).toBe('ok')
    if (high.status === 'ok') {
      expect(high.preview.priceImpactSeverity).toBe('HIGH')
      expect(high.preview.priceImpactPercent).toBe(7.5)
      expect(high.preview.warnings.some((w) => w.code === 'HIGH_PRICE_IMPACT')).toBe(true)
      expect(formatImpactLabel(high.preview.priceImpactPercent, high.preview.priceImpactSeverity)).toMatch(/High/)
    }

    const unavailable = buildSmartSwapExecutionPreview(
      previewInputFromSnapshot(directSnapshot({ priceImpactPercent: null })),
    )
    expect(unavailable.status).toBe('ok')
    if (unavailable.status === 'ok') {
      expect(unavailable.preview.priceImpactAvailability).toBe('unavailable')
      expect(unavailable.preview.priceImpactPercent).toBeNull()
      expect(unavailable.preview.priceImpactSeverity).toBe('UNAVAILABLE')
      expect(formatImpactLabel(null, 'UNAVAILABLE')).toBe('—')
    }
  })

  it('keeps preview when gas estimation is unavailable (no fake gas)', () => {
    const result = buildSmartSwapExecutionPreview(
      previewInputFromSnapshot(directSnapshot({ gasUnits: null })),
    )
    expect(result.status).toBe('ok')
    if (result.status === 'ok') {
      expect(result.preview.gasEstimateAvailability).toBe('unavailable')
      expect(result.preview.gasEstimateUnits).toBeNull()
      expect(result.preview.warnings.some((w) => w.code === 'GAS_ESTIMATION_UNAVAILABLE')).toBe(true)
      expect(result.preview.expectedOutput).toBe('1000000000000000000')
    }
    const gasFailure = previewFailure('GAS_UNAVAILABLE')
    expect(gasFailure.status).toBe('failure')
    expect(gasFailure.preview).toBeNull()
  })

  it('displays factual protocol fee without modifying D87', () => {
    const standard = buildSmartSwapExecutionPreview(
      previewInputFromSnapshot(
        directSnapshot({
          output: token(WBNB, 'WBNB'),
          pathAddresses: [USDT, WBNB],
          pathSymbols: ['USDT', 'WBNB'],
          pairs: [{ address: '0xp', kind: 'v2', token0: USDT, token1: WBNB }],
        }),
        50,
        { isBuyMarco: false },
      ),
    )
    expect(standard.status).toBe('ok')
    if (standard.status === 'ok') {
      expect(standard.preview.protocolFee.bps).toBe(30)
      expect(standard.preview.protocolFee.rule).toBe('standard')
    }
  })

  it('supports all required failure states without empty success', () => {
    expect([...SMART_SWAP_PREVIEW_FAILURES]).toEqual([
      'NO_ROUTE',
      'QUOTE_UNAVAILABLE',
      'EXECUTION_UNAVAILABLE',
      'GAS_UNAVAILABLE',
      'PARTIAL_DATA',
      'STALE_DATA',
    ])
    for (const f of SMART_SWAP_PREVIEW_FAILURES) {
      const r = previewFailure(f)
      expect(r.status).toBe('failure')
      expect(r.preview).toBeNull()
    }
  })

  it('documents ownership — explanation only, no custody / fee override', () => {
    expect(SMART_SWAP_EXECUTION_PREVIEW_OWNERSHIP.owns).toEqual(
      expect.arrayContaining(['execution explanation', 'preview presentation', 'route transparency']),
    )
    expect(SMART_SWAP_EXECUTION_PREVIEW_OWNERSHIP.doesNotOwn).toEqual(
      expect.arrayContaining([
        'swap execution',
        'Router contract calls',
        'fee settlement',
        'D87 / FSC-01 modification',
        'KERL attribution',
        'custody',
        'signing',
      ]),
    )
    expect(SMART_SWAP_EXECUTION_PREVIEW_OWNERSHIP.engine).toMatch(/SmartSwapForm unchanged/)
  })
})
