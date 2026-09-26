/**
 * P0 SmartSwap V2 execution preview truth: ONE SmartSwap request = ONE execution truth.
 * While BSC V2 is the active public path, the execution preview (route card + metrics, Home and /swap) renders the
 * SAME canonical execution display the form (To), the Swap CTA and the V2 confirmation modal use; never the legacy
 * Melega trade. Fixture mirrors the Founder live bug: 0.001 BNB -> USDC, legacy Melega ~0.60 USDC @ High 22.30%
 * impact vs the factual Pancake V2 winner ~0.769 USDC.
 */
import React from 'react'
import { readFileSync } from 'fs'
import path from 'path'
import { act, render } from '@testing-library/react'
import { getAddress } from '@ethersproject/address'
import { Native, Percent, Token } from '@pancakeswap/sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMelegaDexAdapter, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
import { BSC_V2_PUBLIC_CUTOVER_ENABLED, isProductionCutoverAllowed } from '../operatingMode'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import type { SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition } from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import { V2_EXECUTION_RUNTIME_CONFIG } from '../v2ExecutionRuntimeConfig'
import {
  V2_PUBLIC_ACTION,
  buildV2UserExecutionPlan,
  currentRequestKeyOf,
  resetV2UserLocalNonceStateForTests,
  resolveSmartSwapCtaDecision,
} from '../v2UserExecutionPlan'
import { buildShadowRuntimeRequest } from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight'
import {
  SMARTSWAP_DISPLAY_MODE,
  pinV2Confirmation,
  resolveSmartSwapExecutionDisplay,
  type SmartSwapExecutionDisplay,
  type SmartSwapV2ExecutionDisplay,
} from '../../../views/Swap/SmartSwap/utils/v2ExecutionDisplay'
import {
  SmartSwapExecutionTruthContext,
  SmartSwapExecutionTruthScope,
  usePublishSmartSwapExecutionTruth,
} from '../../../views/Swap/SmartSwap/SmartSwapExecutionTruthContext'
import {
  PREVIEW_TRUTH,
  buildV2ExecutionPreviewView,
  formatV2SmartSwapFee,
  shortV2Router,
} from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/v2PreviewTruth'

/* ---------- legacy preview fixture (what the preview derived from the legacy Melega trade on main) ---------- */
const LEGACY_PREVIEW = {
  status: 'ok',
  preview: {
    routeId: 'legacy',
    inputAmount: '1000000000000000',
    inputToken: { chainId: 56, symbol: 'BNB', decimals: 18, address: 'BNB' },
    outputToken: { chainId: 56, symbol: 'USDC', decimals: 18, address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
    expectedOutput: '600458253677758832',
    expectedOutputFormatted: '0.600458253677758832',
    minimumReceived: '597455',
    minimumReceivedFormatted: '0.597455',
    slippageBips: 50,
    priceImpactPercent: 22.3,
    priceImpactSeverity: 'HIGH',
    priceImpactAvailability: 'available',
    gasEstimateUnits: 150000,
    gasEstimateAvailability: 'available',
    protocolFee: { bps: null },
    routeHops: [{ poolId: 'melega-bnb-usdc' }],
    liquiditySources: [{ kind: 'v2' }],
    hopVisualization: [
      { kind: 'token', label: 'BNB' },
      { kind: 'pool', label: 'BNB/USDC Pool' },
      { kind: 'token', label: 'USDC' },
    ],
    warnings: [],
    confidence: 80,
    confidenceFactors: [],
    explanation: 'legacy',
    timestamp: '2026-08-20T00:00:05.000Z',
    freshness: null,
  },
  shadowRuntime: { status: 'idle' },
}
vi.mock('views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useSmartSwapExecutionPreview', () => ({
  useSmartSwapExecutionPreview: () => LEGACY_PREVIEW,
}))
vi.mock('views/SmartSwapStudio/modules/SmartSwapFeeTransparency', () => ({
  useSmartSwapFeeTransparency: () => ({ unavailableReason: null }),
}))
vi.mock('views/SmartSwapStudio/modules/SmartSwapAIAssistance', () => ({
  useSmartSwapAIAssistance: () => ({ status: 'unavailable' }),
}))
vi.mock('views/SmartSwapStudio/modules/SmartSwapExecutionHandoff', () => ({
  SmartSwapExecutionHandoffPanel: () => null,
  useSmartSwapExecutionHandoff: () => null,
}))
vi.mock('lib/smart-swap-gas-protocol-fee', () => ({
  SMART_SWAP_PREVIEW_GAS_UNITS: 150000,
  normalizeGasPriceWei: (v: string) => v || null,
  useSmartSwapGasProtocolFeePreview: () => ({
    display: { protocolFeeBnb: '0.00000275', protocolFeeLabel: 'Gas protocol fee' },
    fee: { feeAsset: 'BNB' },
  }),
}))
vi.mock('hooks/useActiveChainId', () => ({ useActiveChainId: () => ({ chainId: 56 }) }))
vi.mock('state/user/hooks', () => ({ useGasPrice: () => '5000000000' }))
vi.mock('state/swap/hooks', () => ({
  useSwapState: () => ({
    independentField: 'INPUT',
    typedValue: '0.001',
    recipient: null,
    INPUT: { currencyId: 'BNB' },
    OUTPUT: { currencyId: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
  }),
}))
vi.mock('hooks/Tokens', () => ({ useCurrency: () => undefined, useToken: () => undefined }))
vi.mock('components/Logo', () => ({ CurrencyLogo: () => null }))
vi.mock('@pancakeswap/uikit', async () => {
  const actual = await vi.importActual<any>('@pancakeswap/uikit')
  return { ...actual, TokenLogo: () => null, useModal: () => [() => undefined] }
})
/* Surface wiring (Home / Trade cockpit) with light shells; the SmartSwap form is a stub using the REAL wiring. */
vi.mock('@pancakeswap/wagmi', async () => {
  const actual = await vi.importActual<any>('@pancakeswap/wagmi')
  return { ...actual, useWeb3React: () => ({ account: '0x1111111111111111111111111111111111111111' }) }
})
vi.mock('wagmi', async () => {
  const actual = await vi.importActual<any>('wagmi')
  return { ...actual, useAccount: () => ({ address: '0x1111111111111111111111111111111111111111' }) }
})
vi.mock('state/swap/useSwapActionHandlers', () => ({ useSwapActionHandlers: () => ({ onCurrencySelection: () => undefined }) }))
vi.mock('views/Swap/hooks/useWarningImport', () => ({ default: () => () => undefined }))
vi.mock('views/Trade/hooks/useTradeWarningImport', () => ({ default: () => () => undefined }))
vi.mock('views/Swap/SwapFeaturesContext', () => ({ SwapFeaturesProvider: ({ children }: any) => <>{children}</> }))
vi.mock('views/SmartSwapStudio/SmartSwapProductActions', () => ({ SmartSwapProductTabs: () => null }))
vi.mock('components/Menu/GlobalSettings/SettingsModal', () => ({ default: () => null }))
vi.mock('lib/smart-swap-execution-handoff', () => ({ publishSwapExperienceMode: () => undefined }))
vi.mock('views/HomeTrade/HomeSwapPanelShell', () => ({
  HomeSwapPanelShell: ({ children }: any) => <div>{children}</div>,
  HomeSwapIconButton: ({ children }: any) => <button type="button">{children}</button>,
}))
const formState: { display: SmartSwapExecutionDisplay } = { display: { mode: 'LEGACY' } as SmartSwapExecutionDisplay }
vi.mock('views/Swap/SmartSwap', async () => {
  const ctx = await vi.importActual<any>('views/Swap/SmartSwap/SmartSwapExecutionTruthContext')
  // Exactly the two wiring statements of the real SmartSwapForm (source-asserted below).
  const SmartSwapForm = ({ executionPreview }: { executionPreview?: React.ReactNode }) => {
    ctx.usePublishSmartSwapExecutionTruth(formState.display)
    return (
      <div id="swap-page">
        {executionPreview ? (
          <ctx.SmartSwapExecutionTruthContext.Provider value={formState.display}>
            {executionPreview}
          </ctx.SmartSwapExecutionTruthContext.Provider>
        ) : null}
      </div>
    )
  }
  return { SmartSwapForm }
})

// eslint-disable-next-line import/first
import { SmartSwapExecutionPreviewModule } from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewModule'
// eslint-disable-next-line import/first
import { HomeSwapPanel } from '../../../views/HomeTrade/HomeSwapPanel'
// eslint-disable-next-line import/first
import { TradeCockpit } from '../../../views/Trade/TradeCockpit'

const WEB = path.resolve(__dirname, '../../../..')
const NOW = '2026-08-20T00:00:05.000Z'
const DEADLINE = 1_893_456_000
const USER = '0x1111111111111111111111111111111111111111'
const EXECUTOR = getAddress('0x7c07082839edd5797737640bba6af47992b9861e')
const PANCAKE_ROUTER = getAddress('0x10ED43C718714eb63d5aA57B78B54704E256024E')
const MELEGA_ROUTER = getAddress('0xc25033218D181b27D4a2944Fbb04FC055da4EAB3')
const WBNB = getAddress('0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c')
const USDC = getAddress('0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d')
const BNB_C = Native.onChain(56)
const USDC_C = new Token(56, USDC, 18, 'USDC')
const PAIR_KEY = `56:${WBNB.toLowerCase()}>${USDC.toLowerCase()}`
const INPUT_RAW = '1000000000000000' // 0.001 BNB
const MELEGA_OUT = '600458253677758832' // ~0.600458 USDC (the legacy Melega economics)
const PANCAKE_OUT = '769398000000000000' // ~0.769398 USDC (the factual Pancake V2 winner)

function nativeToUsdc(): SmartSwapRequest {
  return buildShadowRuntimeRequest({
    chainId: 56,
    inputCurrency: { isNative: true, decimals: 18, symbol: 'BNB', chainId: 56 },
    outputCurrency: { isNative: false, address: USDC, decimals: 18, symbol: 'USDC', chainId: 56 },
    inputAmountRaw: INPUT_RAW,
    exactOut: false,
    slippageBps: 50,
  }).request!
}

function melegaSnapshot(request: SmartSwapRequest): LegacyMelegaQuoteSnapshot {
  return {
    chainId: 56,
    input: { address: WBNB, symbol: 'WBNB', decimals: 18 },
    output: { address: USDC, symbol: 'USDC', decimals: 18 },
    inputAmountRaw: request.inputAmountRaw,
    expectedOutputRaw: MELEGA_OUT,
    pathAddresses: [WBNB, USDC],
    freshness: NOW,
    slippageBps: 50,
  }
}

/** Both venues compete on the same request; the plan binds the factual winner. */
async function competedDisplay(melegaOut: string, pancakeOut: string, opts: { seam?: boolean } = {}) {
  const request = nativeToUsdc()
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [
      createMelegaDexAdapter(melegaSnapshot(request), {
        quoteSource: createSyntheticQuoteSource({ [PAIR_KEY]: { amountOutRaw: melegaOut } }),
      }),
      createPancakeSwapVenueAdapter(createSyntheticQuoteSource({ [PAIR_KEY]: { amountOutRaw: pancakeOut } })),
    ],
    nowIso: NOW,
  })
  const winner = result.shadowWinner!
  const seam = opts.seam === false ? { bscPublicCutoverEnabled: false } : { bscPublicCutoverEnabled: true }
  const plan = buildV2UserExecutionPlan({
    user: USER,
    walletChainId: 56,
    request,
    requestKey: currentRequestKeyOf(request),
    shadow: { status: 'ready', requestKey: currentRequestKeyOf(request), winner, v2Available: true },
    allowanceReadStatus: 'native',
    nowIso: NOW,
    deadline: DEADLINE,
    ...seam,
  })
  const decision = resolveSmartSwapCtaDecision({
    planOk: plan.ok,
    cutoverAllowed: isProductionCutoverAllowed(56, opts.seam !== false) && plan.productionCutoverAllowed,
    testOnlyExecutionGate: false,
    planReason: plan.reason,
  })
  const display = resolveSmartSwapExecutionDisplay({ decision, plan, v2Pending: false, inputCurrency: BNB_C, outputCurrency: USDC_C })
  return { result, winner, plan, decision, display }
}

function asV2(display: SmartSwapExecutionDisplay): SmartSwapV2ExecutionDisplay {
  expect(display.mode).toBe(SMARTSWAP_DISPLAY_MODE.V2)
  return display as SmartSwapV2ExecutionDisplay
}

function Preview() {
  return <SmartSwapExecutionPreviewModule mode="smart" showSmartTransparency compact />
}

function renderPreviewWith(display: SmartSwapExecutionDisplay | null) {
  return render(
    <SmartSwapExecutionTruthContext.Provider value={display}>
      <Preview />
    </SmartSwapExecutionTruthContext.Provider>,
  )
}

function readPreview(container: HTMLElement) {
  const stack = container.querySelector('[data-smart-transparency-stack]') as HTMLElement
  const metrics: Record<string, string> = {}
  stack.querySelectorAll('[data-smart-compact-metrics] > div').forEach((cell) => {
    const k = (cell.children[0] as HTMLElement)?.textContent?.trim()
    const v = (cell.children[1] as HTMLElement)?.textContent?.trim()
    if (k) metrics[k] = v ?? ''
  })
  return {
    truth: stack.getAttribute('data-smartswap-preview-truth'),
    venue: stack.getAttribute('data-smartswap-preview-venue'),
    router: stack.getAttribute('data-smartswap-preview-router'),
    expectedRaw: stack.getAttribute('data-smartswap-preview-expected-raw'),
    minRaw: stack.getAttribute('data-smartswap-preview-min-raw'),
    source: stack.querySelector('[data-execution-source]')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
    hops: [...stack.querySelectorAll('[data-route-hop]')].map((n) => n.textContent),
    metrics,
    text: stack.textContent ?? '',
  }
}

beforeEach(() => {
  resetV2UserLocalNonceStateForTests()
  formState.display = { mode: SMARTSWAP_DISPLAY_MODE.LEGACY }
})

describe('P0 V2 execution preview truth (one request = one execution truth)', () => {
  it('production config unchanged: cutover on, BSC Executor, Ethereum NOT_CONFIGURED', () => {
    expect(BSC_V2_PUBLIC_CUTOVER_ENABLED).toBe(true)
    expect(V2_EXECUTION_RUNTIME_CONFIG[56].executorAddress?.toLowerCase()).toBe(EXECUTOR.toLowerCase())
    expect(V2_EXECUTION_RUNTIME_CONFIG[56].enabled).toBe(true)
    expect(V2_EXECUTION_RUNTIME_CONFIG[1].enabled).toBe(false)
    expect(V2_EXECUTION_RUNTIME_CONFIG[1].executorAddress).toBeNull()
  })

  it('main-branch leak reproduced: with no V2 truth the preview shows the legacy Melega route / 0.60 / High 22.30%', () => {
    const view = readPreview(renderPreviewWith(null).container)
    expect(view.truth).toBe(PREVIEW_TRUTH.LEGACY)
    expect(view.source).toBe('Melega RouterDirect Pool') // label "Melega Router" + detail "Direct Pool"
    expect(view.metrics['Expected output']).toBe('0.600458253677758832 USDC')
    expect(view.metrics['Price impact']).toBe('High (22.30%)')
  })

  it('(a) PANCAKE WIN: form output, preview route/venue/router/expected/min/fee = V2 winner; no legacy impact; modal pin = same Pancake display; target = Executor', async () => {
    const { plan, decision, display, result } = await competedDisplay(MELEGA_OUT, PANCAKE_OUT)
    expect(result.melega?.net?.netUserOutputRaw).toBe(MELEGA_OUT)
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    const d = asV2(display)
    expect(d.venueId).toBe('pancakeswap')
    expect(d.router).toBe(PANCAKE_ROUTER)
    expect(plan.binding!.intent.router).toBe(PANCAKE_ROUTER)
    expect(plan.preparation!.swapTransaction.to.toLowerCase()).toBe(EXECUTOR.toLowerCase())
    // the form's To (estimated) is exactly this string (SmartSwapForm: parsedAmounts[OUTPUT].toSignificant(6))
    const formTo = d.outputAmount.toSignificant(6)
    expect(formTo).toBe('0.769398')

    const view = readPreview(renderPreviewWith(d).container)
    expect(view.truth).toBe(PREVIEW_TRUTH.V2)
    expect(view.venue).toBe('pancakeswap')
    expect(view.router).toBe(PANCAKE_ROUTER)
    expect(view.source).toContain(plan.winnerQuote!.venueLabel)
    expect(view.source).toContain(`Router ${shortV2Router(PANCAKE_ROUTER)}`)
    expect(view.source).toContain('Direct pool')
    expect(view.hops).toEqual(['BNBToken', 'USDCToken'])
    expect(view.expectedRaw).toBe(PANCAKE_OUT)
    expect(view.expectedRaw).toBe(plan.winnerQuote!.grossOutputRaw)
    expect(view.metrics['Expected output']).toBe(`${formTo} USDC`)
    expect(view.minRaw).toBe(plan.binding!.intent.minUserOut)
    expect(view.metrics['Minimum received']).toBe(`${d.minimumReceived.toSignificant(6)} USDC`)
    expect(view.metrics['Protocol fee']).toBe(formatV2SmartSwapFee(d.feeAmount, d.feeBps))
    expect(view.metrics['Protocol fee']).toBe('0.000002 BNB (0.20%)')
    expect(d.feeAmount.quotient.toString()).toBe(plan.binding!.intent.feeAmount)
    expect(d.feeBps).toBe(plan.binding!.intent.feeBps)
    // winner reported no impact -> neutral, never the legacy 22.30%
    expect(view.metrics['Price impact']).toBe('—')
    expect(view.text).not.toContain('22.30')
    expect(view.text).not.toContain('0.600458')
    expect(view.text).not.toContain('0.597455')
    expect(view.text).not.toContain('Melega')
    expect(view.text).not.toContain('Direct Pool')
    expect(view.text).not.toContain('~0.00000275')
    // confirmation modal pins exactly this display
    const pinned = pinV2Confirmation(plan, d)
    expect(pinned?.display).toBe(d)
    expect(pinned?.display.venueLabel).toBe(plan.winnerQuote!.venueLabel)
    expect(pinned?.display.router).toBe(PANCAKE_ROUTER)
  })

  it('(a2) factual winner impact is shown (and only that): 0.12% -> Low (0.12%)', async () => {
    const d = asV2((await competedDisplay(MELEGA_OUT, PANCAKE_OUT)).display)
    const factual: SmartSwapV2ExecutionDisplay = { ...d, priceImpact: new Percent('12', '10000') }
    const view = readPreview(renderPreviewWith(factual).container)
    expect(view.metrics['Price impact']).toBe('Low (0.12%)')
    expect(view.text).not.toContain('22.30')
  })

  it('(b) MELEGA WIN (reverse fixture): every surface Melega, no hardcoded Pancake', async () => {
    const { plan, decision, display } = await competedDisplay('800000000000000000', PANCAKE_OUT)
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    const d = asV2(display)
    expect(d.venueId).toBe('melega-dex')
    expect(d.router).toBe(MELEGA_ROUTER)
    expect(plan.preparation!.swapTransaction.to.toLowerCase()).toBe(EXECUTOR.toLowerCase())
    const view = readPreview(renderPreviewWith(d).container)
    expect(view.truth).toBe(PREVIEW_TRUTH.V2)
    expect(view.venue).toBe('melega-dex')
    expect(view.router).toBe(MELEGA_ROUTER)
    expect(view.source).toContain(plan.winnerQuote!.venueLabel)
    expect(view.source).toContain(shortV2Router(MELEGA_ROUTER))
    expect(view.expectedRaw).toBe('800000000000000000')
    expect(view.metrics['Expected output']).toBe(`${d.outputAmount.toSignificant(6)} USDC`)
    expect(view.minRaw).toBe(plan.binding!.intent.minUserOut)
    expect(view.text).not.toMatch(/pancake/i)
    expect(view.text).not.toContain(shortV2Router(PANCAKE_ROUTER))
    expect(pinV2Confirmation(plan, d)?.display.router).toBe(MELEGA_ROUTER)
  })

  it('(c) REQUOTE CHANGES WINNER: gen1 Pancake -> V2_PENDING (neutral, no legacy, no gen1 values) -> gen2 Melega', async () => {
    const g1 = asV2((await competedDisplay(MELEGA_OUT, PANCAKE_OUT)).display)
    const g2run = await competedDisplay('800000000000000000', PANCAKE_OUT)
    const g2 = asV2(g2run.display)
    const view = renderPreviewWith(g1)
    const v1 = readPreview(view.container)
    expect(v1.venue).toBe('pancakeswap')
    view.rerender(
      <SmartSwapExecutionTruthContext.Provider value={{ mode: SMARTSWAP_DISPLAY_MODE.V2_PENDING }}>
        <Preview />
      </SmartSwapExecutionTruthContext.Provider>,
    )
    const pending = readPreview(view.container)
    expect(pending.truth).toBe(PREVIEW_TRUTH.V2_PENDING)
    expect(pending.venue).toBeNull()
    expect(pending.expectedRaw).toBeNull()
    expect(pending.hops).toEqual([])
    expect(Object.values(pending.metrics).every((v) => v === '—')).toBe(true)
    expect(pending.text).not.toContain('Melega Router')
    expect(pending.text).not.toContain('0.600458')
    expect(pending.text).not.toContain('22.30')
    expect(pending.text).not.toContain(g1.outputAmount.toSignificant(6))
    view.rerender(
      <SmartSwapExecutionTruthContext.Provider value={g2}>
        <Preview />
      </SmartSwapExecutionTruthContext.Provider>,
    )
    const v2 = readPreview(view.container)
    expect(v2.truth).toBe(PREVIEW_TRUTH.V2)
    expect(v2.venue).toBe('melega-dex')
    expect(v2.router).toBe(MELEGA_ROUTER)
    expect(v2.expectedRaw).toBe('800000000000000000')
    expect(v2.minRaw).toBe(g2run.plan.binding!.intent.minUserOut)
    expect(v2.text).not.toContain(g1.outputAmount.toSignificant(6))
    expect(v2.text).not.toContain(shortV2Router(PANCAKE_ROUTER))
  })

  it('(d) ROLLBACK seam bscPublicCutoverEnabled=false: LEGACY display -> the legacy preview stays functional', async () => {
    const { decision, display } = await competedDisplay(MELEGA_OUT, PANCAKE_OUT, { seam: false })
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(display).toEqual({ mode: SMARTSWAP_DISPLAY_MODE.LEGACY })
    expect(buildV2ExecutionPreviewView(display)).toBeNull()
    const view = readPreview(renderPreviewWith(display).container)
    expect(view.truth).toBe(PREVIEW_TRUTH.LEGACY)
    expect(view.source).toBe('Melega RouterDirect Pool') // label "Melega Router" + detail "Direct Pool"
    expect(view.metrics['Expected output']).toBe('0.600458253677758832 USDC')
    expect(view.metrics['Minimum received']).toBe('0.597455 USDC')
    expect(view.metrics['Price impact']).toBe('High (22.30%)')
    expect(view.metrics['Protocol fee']).toBe('~0.00000275 BNB')
  })

  it('(e) ETHEREUM stays legacy: no BSC V2 display is ever injected into the preview', async () => {
    const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    const usdcEth = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    const ethReq = buildShadowRuntimeRequest({
      chainId: 1,
      inputCurrency: { isNative: false, address: weth, decimals: 18, symbol: 'WETH', chainId: 1 },
      outputCurrency: { isNative: false, address: usdcEth, decimals: 6, symbol: 'USDC', chainId: 1 },
      inputAmountRaw: '1000000',
      exactOut: false,
      slippageBps: 50,
    }).request!
    const ethResult = await runEvmShadowCompetition({
      request: ethReq,
      productionQuote: null,
      adapters: [createUniswapVenueAdapter(createSyntheticQuoteSource({ [`1:${weth.toLowerCase()}>${usdcEth.toLowerCase()}`]: { amountOutRaw: '400000' } }))],
      nowIso: NOW,
    })
    const ethPlan = buildV2UserExecutionPlan({
      user: USER,
      walletChainId: 1,
      request: ethReq,
      requestKey: currentRequestKeyOf(ethReq),
      shadow: { status: 'ready', requestKey: currentRequestKeyOf(ethReq), winner: ethResult.shadowWinner, v2Available: true },
      allowanceReadStatus: 'ok',
      nowIso: NOW,
      deadline: DEADLINE,
      bscPublicCutoverEnabled: true,
    })
    expect(ethPlan.ok).toBe(false)
    const display = resolveSmartSwapExecutionDisplay({
      decision: { publicAction: V2_PUBLIC_ACTION.V2_EXECUTE },
      plan: ethPlan,
      v2Pending: false,
      inputCurrency: new Token(1, weth, 18, 'WETH'),
      outputCurrency: new Token(1, usdcEth, 6, 'USDC'),
    })
    expect(display.mode).toBe(SMARTSWAP_DISPLAY_MODE.LEGACY)
    const view = readPreview(renderPreviewWith(display).container)
    expect(view.truth).toBe(PREVIEW_TRUTH.LEGACY)
    expect(view.venue).toBeNull()
    expect(view.router).toBeNull()
    expect(view.text.toLowerCase()).not.toContain(EXECUTOR.toLowerCase())
    expect(view.text).not.toContain('PancakeSwap')
  })

  it('(f) HOME vs /swap PARITY: the same V2 display through HomeSwapPanel (sibling scope) and TradeCockpit (form slot) renders identical preview values', async () => {
    const run = await competedDisplay(MELEGA_OUT, PANCAKE_OUT)
    const d = asV2(run.display)
    formState.display = d
    const home = render(<HomeSwapPanel />)
    const cockpit = render(<TradeCockpit productAction="swap" onProductActionChange={() => undefined} />)
    const h = readPreview(home.container)
    const c = readPreview(cockpit.container)
    expect(h.truth).toBe(PREVIEW_TRUTH.V2)
    expect(c.truth).toBe(PREVIEW_TRUTH.V2)
    expect(h).toEqual(c)
    expect(h.venue).toBe('pancakeswap')
    expect(h.expectedRaw).toBe(PANCAKE_OUT)
    expect(h.minRaw).toBe(run.plan.binding!.intent.minUserOut)
    // Home: the preview is a sibling of the form (outside #swap-page); cockpit: inside the form slot
    expect(home.container.querySelector('#swap-page [data-smart-transparency-stack]')).toBeNull()
    expect(cockpit.container.querySelector('#swap-page [data-smart-transparency-stack]')).not.toBeNull()

    // same request re-quotes on both surfaces: pending then a new generation, identical again
    act(() => {
      formState.display = { mode: SMARTSWAP_DISPLAY_MODE.V2_PENDING }
      home.rerender(<HomeSwapPanel />)
      cockpit.rerender(<TradeCockpit productAction="swap" onProductActionChange={() => undefined} />)
    })
    expect(readPreview(home.container).truth).toBe(PREVIEW_TRUTH.V2_PENDING)
    expect(readPreview(cockpit.container).truth).toBe(PREVIEW_TRUTH.V2_PENDING)
    const g2 = asV2((await competedDisplay('800000000000000000', PANCAKE_OUT)).display)
    act(() => {
      formState.display = g2
      home.rerender(<HomeSwapPanel />)
      cockpit.rerender(<TradeCockpit productAction="swap" onProductActionChange={() => undefined} />)
    })
    const h2 = readPreview(home.container)
    expect(h2.venue).toBe('melega-dex')
    expect(h2).toEqual(readPreview(cockpit.container))

    // rollback / legacy on both surfaces: identical legacy preview
    act(() => {
      formState.display = { mode: SMARTSWAP_DISPLAY_MODE.LEGACY }
      home.rerender(<HomeSwapPanel />)
      cockpit.rerender(<TradeCockpit productAction="swap" onProductActionChange={() => undefined} />)
    })
    const h3 = readPreview(home.container)
    expect(h3.truth).toBe(PREVIEW_TRUTH.LEGACY)
    expect(h3).toEqual(readPreview(cockpit.container))
  })

  it('scope publish: the sibling preview follows the form display and clears when the form unmounts', () => {
    function Form({ display }: { display: SmartSwapExecutionDisplay }) {
      usePublishSmartSwapExecutionTruth(display)
      return null
    }
    function Surface({ display, showForm }: { display: SmartSwapExecutionDisplay; showForm: boolean }) {
      return (
        <SmartSwapExecutionTruthScope>
          {showForm ? <Form display={display} /> : null}
          <Preview />
        </SmartSwapExecutionTruthScope>
      )
    }
    const pending = { mode: SMARTSWAP_DISPLAY_MODE.V2_PENDING } as const
    const view = render(<Surface display={pending} showForm />)
    expect(readPreview(view.container).truth).toBe(PREVIEW_TRUTH.V2_PENDING)
    view.rerender(<Surface display={pending} showForm={false} />)
    expect(readPreview(view.container).truth).toBe(PREVIEW_TRUTH.LEGACY)
  })

  it('wiring is presentation-only: the real form publishes + provides its single display; the preview never builds a plan / nonce / allowance / competition', () => {
    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toMatch(/usePublishSmartSwapExecutionTruth\(v2Display\)/)
    expect(form).toMatch(/<SmartSwapExecutionTruthContext\.Provider value=\{v2Display\}>\s*\{executionPreview\}/)
    expect((form.match(/useSmartSwapV2CtaBinding\(/g) ?? []).length).toBe(1)
    const home = readFileSync(path.join(WEB, 'src/views/HomeTrade/HomeSwapPanel.tsx'), 'utf8')
    expect(home).toMatch(/<SmartSwapExecutionTruthScope>\s*<HomeSwapInner \/>/)
    const previewDir = path.join(WEB, 'src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview')
    for (const f of ['SmartSwapExecutionPreviewModule.tsx', 'v2PreviewTruth.ts']) {
      const src = readFileSync(path.join(previewDir, f), 'utf8')
      expect(src).not.toMatch(/useSmartSwapV2CtaBinding|buildV2UserExecutionPlan|prepareV2UserTransactions|useTokenAllowance|runEvmShadowCompetition|refreshSharedShadowRuntime|nonce/i)
    }
    const ctx = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/SmartSwapExecutionTruthContext.tsx'), 'utf8')
    expect(ctx).not.toMatch(/useSmartSwapV2CtaBinding\(|buildV2UserExecutionPlan\(|prepareV2UserTransactions|useTokenAllowance\(/)
  })
})
