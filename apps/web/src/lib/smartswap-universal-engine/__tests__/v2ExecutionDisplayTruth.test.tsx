/**
 * P0 SmartSwap V2 display truth: while the BSC V2 CTA is V2_EXECUTE, To (estimated) / Minimum received / Price /
 * Price Impact / Details derive from the certified plan's own winner facts, never from the legacy Melega trade.
 * Fixture mirrors the production observation: legacy Melega 1.98 USDC @ 73.95% impact vs Pancake 7.76 USDC, min ~7.70.
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { getAddress } from '@ethersproject/address'
import { CurrencyAmount, Native, Percent, Token, TradeType } from '@pancakeswap/sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BSC_V2_PUBLIC_CUTOVER_ENABLED, isProductionCutoverAllowed } from '../operatingMode'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import type { SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition } from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import {
  V2_PUBLIC_ACTION,
  buildV2UserExecutionPlan,
  currentRequestKeyOf,
  decodeApproveSpender,
  resetV2UserLocalNonceStateForTests,
  resolveSmartSwapCtaDecision,
  type V2UserExecutionPlan,
} from '../v2UserExecutionPlan'
import { buildShadowRuntimeRequest } from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight'
import {
  SMARTSWAP_DISPLAY_MODE,
  resolveSmartSwapExecutionDisplay,
  shouldRenderLegacyExecutionPreview,
  type SmartSwapV2ExecutionDisplay,
} from '../../../views/Swap/SmartSwap/utils/v2ExecutionDisplay'

vi.mock('@pancakeswap/localization', async () => {
  const actual = await vi.importActual<any>('@pancakeswap/localization')
  return { ...actual, useTranslation: () => ({ t: (s: string) => s }) }
})
vi.mock('@pancakeswap/uikit', async () => {
  const actual = await vi.importActual<any>('@pancakeswap/uikit')
  const Pass = ({ children }: any) => <span>{children}</span>
  return {
    ...actual,
    Text: ({ children, ...p }: any) => <span data-v2-venue={p['data-smartswap-v2-venue'] ? 'true' : undefined}>{children}</span>,
    Flex: Pass,
    QuestionHelper: () => null,
    SearchIcon: () => <i data-testid="legacy-route-search" />,
    ModalV2: () => null,
    Modal: () => null,
    Link: Pass,
    ChevronDownIcon: () => null,
    ChevronUpIcon: () => null,
    ChevronRightIcon: () => <span>{'>'}</span>,
  }
})
vi.mock('components/Layout/Column', () => ({ AutoColumn: ({ children, ...p }: any) => <div {...p}>{children}</div> }))
vi.mock('components/Layout/Row', () => ({
  RowBetween: ({ children }: any) => <div>{children}</div>,
  RowFixed: ({ children }: any) => <div>{children}</div>,
}))
vi.mock('hooks/useExecutionDetailsOpen', () => ({
  useExecutionDetailsOpen: () => ({ executionDetailsOpen: true, toggleExecutionDetailsOpen: () => undefined }),
}))
vi.mock('components/DexPricing/DexSwapFeeDisclosure', () => ({
  DexSwapFeeDisclosure: () => <div data-testid="legacy-melega-fee-disclosure">Execution router</div>,
}))
vi.mock('../../../views/Swap/components/FormattedPriceImpact', () => ({
  default: ({ priceImpact }: any) => <span data-testid="price-impact">{priceImpact ? `${priceImpact.toFixed(2)}%` : '-'}</span>,
}))
vi.mock('../../../views/Swap/components/RouterViewer', () => ({ RouterViewer: () => null }))

// eslint-disable-next-line import/first
import AdvancedSwapDetailsDropdown from '../../../views/Swap/components/AdvancedSwapDetailsDropdown'

const NOW = '2026-08-20T00:00:05.000Z'
const DEADLINE = 1_893_456_000
const USER = '0x1111111111111111111111111111111111111111'
const EXECUTOR = getAddress('0x7c07082839edd5797737640bba6af47992b9861e')
const PANCAKE_ROUTER = getAddress('0x10ED43C718714eb63d5aA57B78B54704E256024E')
const WBNB = getAddress('0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c')
const USDC = getAddress('0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d')
const BNB_C = Native.onChain(56)
const USDC_C = new Token(56, USDC, 18, 'USDC')
const WBNB_C = new Token(56, WBNB, 18, 'WBNB')
const SLIPPAGE_BPS = 77 // 7.76 * (1 - 0.0077) = 7.700248 -> "min ~7.70"
const SEAM = { bscPublicCutoverEnabled: true } as const

/** Legacy Melega trade the form would show from the legacy route (the leak we must never display under V2). */
const LEGACY_OUT = CurrencyAmount.fromRawAmount(USDC_C, '1980000000000000000')
const LEGACY_MIN = CurrencyAmount.fromRawAmount(USDC_C, '1970000000000000000')
const LEGACY_IMPACT = new Percent('7395', '10000')

function nativeToUsdc(amountRaw = '10000000000000000'): SmartSwapRequest {
  return buildShadowRuntimeRequest({
    chainId: 56,
    inputCurrency: { isNative: true, decimals: 18, symbol: 'BNB', chainId: 56 },
    outputCurrency: { isNative: false, address: USDC, decimals: 18, symbol: 'USDC', chainId: 56 },
    inputAmountRaw: amountRaw,
    exactOut: false,
    slippageBps: SLIPPAGE_BPS,
  }).request!
}

function usdcToNative(amountRaw = '7760000000000000000'): SmartSwapRequest {
  return buildShadowRuntimeRequest({
    chainId: 56,
    inputCurrency: { isNative: false, address: USDC, decimals: 18, symbol: 'USDC', chainId: 56 },
    outputCurrency: { isNative: true, decimals: 18, symbol: 'BNB', chainId: 56 },
    inputAmountRaw: amountRaw,
    exactOut: false,
    slippageBps: SLIPPAGE_BPS,
  }).request!
}

async function pancakePlan(
  request: SmartSwapRequest,
  pathKey: string,
  amountOutRaw: string,
  extra: { priceImpactPercent?: number | null; allowanceRaw?: string; seam?: boolean; walletChainId?: number } = {},
) {
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [
      createPancakeSwapVenueAdapter(
        createSyntheticQuoteSource({ [pathKey]: { amountOutRaw, priceImpactPercent: extra.priceImpactPercent ?? null } }),
      ),
    ],
    nowIso: NOW,
  })
  const winner = result.shadowWinner!
  expect(winner.venueId).toBe('pancakeswap')
  const nativeIn = request.inputAsset.location.kind === 'native'
  const plan = buildV2UserExecutionPlan({
    user: USER,
    walletChainId: extra.walletChainId ?? 56,
    request,
    requestKey: currentRequestKeyOf(request),
    shadow: { status: 'ready', requestKey: currentRequestKeyOf(request), winner, v2Available: true },
    observedAllowance: nativeIn
      ? undefined
      : { chainId: 56, token: USDC, owner: USER, spender: EXECUTOR, amountRaw: extra.allowanceRaw ?? '0' },
    allowanceReadStatus: nativeIn ? 'native' : 'ok',
    nowIso: NOW,
    deadline: DEADLINE,
    ...(extra.seam === false ? { bscPublicCutoverEnabled: false } : SEAM),
  })
  const decision = resolveSmartSwapCtaDecision({
    planOk: plan.ok,
    cutoverAllowed: isProductionCutoverAllowed(56, extra.seam === false ? false : true) && plan.productionCutoverAllowed,
    testOnlyExecutionGate: false,
    planReason: plan.reason,
  })
  return { plan, decision, winner }
}

const BNB_USDC_KEY = `56:${WBNB.toLowerCase()}>${USDC.toLowerCase()}`
const USDC_BNB_KEY = `56:${USDC.toLowerCase()}>${WBNB.toLowerCase()}`

function v2(display: ReturnType<typeof resolveSmartSwapExecutionDisplay>): SmartSwapV2ExecutionDisplay {
  expect(display.mode).toBe(SMARTSWAP_DISPLAY_MODE.V2)
  return display as SmartSwapV2ExecutionDisplay
}

function renderLegacyDetails() {
  return render(
    <AdvancedSwapDetailsDropdown
      hasStablePair={false}
      path={[BNB_C, USDC_C]}
      priceImpactWithoutFee={LEGACY_IMPACT}
      realizedLPFee={CurrencyAmount.fromRawAmount(BNB_C, '25000000000000')}
      slippageAdjustedAmounts={{ INPUT: CurrencyAmount.fromRawAmount(BNB_C, '10000000000000000'), OUTPUT: LEGACY_MIN }}
      inputAmount={CurrencyAmount.fromRawAmount(BNB_C, '10000000000000000')}
      outputAmount={LEGACY_OUT}
      tradeType={TradeType.EXACT_INPUT}
    />,
  )
}

function v2DetailsElement(d: SmartSwapV2ExecutionDisplay) {
  // Exactly the props SmartSwapForm passes while the V2 display is active.
  return (
    <AdvancedSwapDetailsDropdown
      hasStablePair={false}
      path={d.path}
      priceImpactWithoutFee={d.priceImpact}
      slippageAdjustedAmounts={{ INPUT: d.inputAmount, OUTPUT: d.minimumReceived }}
      inputAmount={d.inputAmount}
      outputAmount={d.outputAmount}
      tradeType={d.tradeType}
      v2Execution={{ venueLabel: d.venueLabel, router: d.router, feeAmount: d.feeAmount, feeBps: d.feeBps }}
    />
  )
}

beforeEach(() => {
  resetV2UserLocalNonceStateForTests()
})

describe('P0 V2 display truth (seam on; production flag on)', () => {
  it('production flag is on (BSC public cutover re-enabled)', () => {
    expect(BSC_V2_PUBLIC_CUTOVER_ENABLED).toBe(true)
  })

  it('BNB -> USDC, V2_EXECUTE (Pancake): To (estimated)=7.76 V2 output, Minimum received = plan minUserOut ~7.70, price from V2, no legacy 1.98', async () => {
    const { plan, decision } = await pancakePlan(nativeToUsdc(), BNB_USDC_KEY, '7760000000000000000')
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    const d = v2(resolveSmartSwapExecutionDisplay({ decision, plan, v2Pending: false, inputCurrency: BNB_C, outputCurrency: USDC_C }))
    expect(d.venueId).toBe('pancakeswap')
    expect(d.outputAmount.quotient.toString()).toBe('7760000000000000000')
    expect(d.outputAmount.toSignificant(3)).toBe('7.76')
    expect(d.outputAmount.equalTo(LEGACY_OUT)).toBe(false)
    // one execution truth: the displayed minimum IS the intent minUserOut (no second computation)
    expect(d.minimumReceived.quotient.toString()).toBe(plan.binding!.intent.minUserOut)
    expect(d.minimumReceived.toSignificant(3)).toBe('7.7')
    expect(d.inputAmount.quotient.toString()).toBe('10000000000000000')
    expect(d.executionPrice.toSignificant(4)).toBe('776')
    expect(d.router).toBe(PANCAKE_ROUTER)
    expect(d.path.map((c) => c.symbol)).toEqual(['BNB', 'USDC'])
    expect(d.freshUntilIso).toBe(plan.freshUntilIso)
    // venue reported no impact -> none displayed (never the legacy 73.95%)
    expect(d.priceImpact).toBeUndefined()
  })

  it('winner price impact is shown only when the venue factually reported it', async () => {
    const { plan, decision } = await pancakePlan(nativeToUsdc(), BNB_USDC_KEY, '7760000000000000000', { priceImpactPercent: 0.12 })
    const d = v2(resolveSmartSwapExecutionDisplay({ decision, plan, v2Pending: false, inputCurrency: BNB_C, outputCurrency: USDC_C }))
    expect(d.priceImpact?.toFixed(2)).toBe('0.12')
  })

  it('Details render: V2 minimum, V2 venue/router/fee, V2 route; the legacy 73.95% impact / 1.98 min / Melega fee panel never leak (even right after a legacy render)', async () => {
    const { plan, decision } = await pancakePlan(nativeToUsdc(), BNB_USDC_KEY, '7760000000000000000')
    const d = v2(resolveSmartSwapExecutionDisplay({ decision, plan, v2Pending: false, inputCurrency: BNB_C, outputCurrency: USDC_C }))
    const view = renderLegacyDetails()
    expect(view.container.textContent).toContain('73.95%')
    view.rerender(v2DetailsElement(d))
    const text = view.container.textContent ?? ''
    expect(text).toContain(`Minimum received${d.minimumReceived.toSignificant(4)} USDC`)
    expect(text).toContain('7.7 USDC')
    expect(text).not.toContain('73.95')
    expect(text).not.toContain('1.97')
    expect(text).not.toContain('1.98')
    expect(text).not.toContain('Price Impact')
    expect(text).not.toContain('Liquidity Provider Fee')
    expect(screen.queryByTestId('legacy-melega-fee-disclosure')).toBeNull()
    expect(screen.queryByTestId('legacy-route-search')).toBeNull()
    expect(text).toContain('Venue')
    expect(text).toContain(plan.winnerQuote!.venueLabel)
    expect(text).toContain('SmartSwap fee')
    expect(text).toContain(`${PANCAKE_ROUTER.slice(0, 6)}…${PANCAKE_ROUTER.slice(-4)}`)
    expect(text).toContain('Route')
    expect(text).toMatch(/BNB>USDC/)
  })

  it('USDC -> BNB (ERC20 in), V2_EXECUTE: display from the V2 winner; approval spender is the Executor only; display derivation sends nothing', async () => {
    const { plan, decision } = await pancakePlan(usdcToNative(), USDC_BNB_KEY, '9900000000000000', { allowanceRaw: '0' })
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    expect(plan.approvalSpender).toBe(EXECUTOR)
    expect(plan.preparation!.approvalTransactions.length).toBeGreaterThan(0)
    for (const tx of plan.preparation!.approvalTransactions) expect(decodeApproveSpender(tx.data)).toBe(EXECUTOR)
    const d = v2(resolveSmartSwapExecutionDisplay({ decision, plan, v2Pending: false, inputCurrency: USDC_C, outputCurrency: BNB_C }))
    expect(d.outputAmount.currency.isNative).toBe(true)
    expect(d.outputAmount.quotient.toString()).toBe('9900000000000000')
    expect(d.minimumReceived.quotient.toString()).toBe(plan.binding!.intent.minUserOut)
    expect(d.feeAmount.currency.symbol).toBe('USDC')
    expect(d.path.map((c) => c.symbol)).toEqual(['USDC', 'BNB'])
  })

  it('transition: V2_EXECUTE gen1 -> V2_PENDING (numbers hidden: no stale gen1, no legacy) -> V2_EXECUTE gen2 values', async () => {
    const g1 = await pancakePlan(nativeToUsdc(), BNB_USDC_KEY, '7760000000000000000')
    const d1 = v2(resolveSmartSwapExecutionDisplay({ decision: g1.decision, plan: g1.plan, v2Pending: false, inputCurrency: BNB_C, outputCurrency: USDC_C }))
    expect(d1.outputAmount.toSignificant(3)).toBe('7.76')
    // refresh in flight: the binding reports v2Pending with a not-ready plan
    const pending = resolveSmartSwapExecutionDisplay({
      decision: { publicAction: V2_PUBLIC_ACTION.LEGACY },
      plan: { ...g1.plan, ok: false },
      v2Pending: true,
      inputCurrency: BNB_C,
      outputCurrency: USDC_C,
    })
    expect(pending).toEqual({ mode: SMARTSWAP_DISPLAY_MODE.V2_PENDING })
    // legacy execution preview (Melega route card: Expected output / Minimum received / Price impact) never renders under V2
    expect(shouldRenderLegacyExecutionPreview(d1)).toBe(false)
    expect(shouldRenderLegacyExecutionPreview(pending)).toBe(false)
    expect(shouldRenderLegacyExecutionPreview({ mode: SMARTSWAP_DISPLAY_MODE.LEGACY })).toBe(true)
    const g2 = await pancakePlan(nativeToUsdc(), BNB_USDC_KEY, '7810000000000000000')
    const d2 = v2(resolveSmartSwapExecutionDisplay({ decision: g2.decision, plan: g2.plan, v2Pending: false, inputCurrency: BNB_C, outputCurrency: USDC_C }))
    expect(d2.outputAmount.quotient.toString()).toBe('7810000000000000000')
    expect(d2.minimumReceived.quotient.toString()).toBe(g2.plan.binding!.intent.minUserOut)
    expect(d2.minimumReceived.quotient.toString()).not.toBe(d1.minimumReceived.quotient.toString())
  })

  it('legacy regression: rollback seam (explicit false) -> LEGACY display; Ethereum -> LEGACY display; V2 failure -> LEGACY display', async () => {
    const off = await pancakePlan(nativeToUsdc(), BNB_USDC_KEY, '7760000000000000000', { seam: false })
    expect(off.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(resolveSmartSwapExecutionDisplay({ decision: off.decision, plan: off.plan, v2Pending: false, inputCurrency: BNB_C, outputCurrency: USDC_C })).toEqual({
      mode: SMARTSWAP_DISPLAY_MODE.LEGACY,
    })
    // Ethereum: even a (hypothetical) V2_EXECUTE decision with an Ethereum-bound plan never gets the BSC override.
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
      ...SEAM,
    })
    expect(ethPlan.ok).toBe(false)
    expect(
      resolveSmartSwapExecutionDisplay({
        decision: { publicAction: V2_PUBLIC_ACTION.V2_EXECUTE },
        plan: ethPlan,
        v2Pending: false,
        inputCurrency: new Token(1, weth, 18, 'WETH'),
        outputCurrency: new Token(1, usdcEth, 6, 'USDC'),
      }).mode,
    ).toBe(SMARTSWAP_DISPLAY_MODE.LEGACY)
    const bscAsEthPlan = { ...(await pancakePlan(nativeToUsdc(), BNB_USDC_KEY, '7760000000000000000')).plan }
    const forgedEth: V2UserExecutionPlan = {
      ...bscAsEthPlan,
      binding: { ...bscAsEthPlan.binding!, intent: { ...bscAsEthPlan.binding!.intent, chainId: 1 } },
    }
    expect(
      resolveSmartSwapExecutionDisplay({ decision: { publicAction: V2_PUBLIC_ACTION.V2_EXECUTE }, plan: forgedEth, v2Pending: false, inputCurrency: BNB_C, outputCurrency: USDC_C }).mode,
    ).toBe(SMARTSWAP_DISPLAY_MODE.LEGACY)
    // genuine V2 unavailability before submission: legacy display (consistent with the legacy fallback CTA)
    expect(
      resolveSmartSwapExecutionDisplay({ decision: { publicAction: V2_PUBLIC_ACTION.LEGACY }, plan: { ...bscAsEthPlan, ok: false }, v2Pending: false, inputCurrency: BNB_C, outputCurrency: USDC_C }).mode,
    ).toBe(SMARTSWAP_DISPLAY_MODE.LEGACY)
  })

  it('mismatched form currencies never render V2 numbers against the wrong asset (hidden instead of legacy)', async () => {
    const { plan, decision } = await pancakePlan(nativeToUsdc(), BNB_USDC_KEY, '7760000000000000000')
    expect(
      resolveSmartSwapExecutionDisplay({ decision, plan, v2Pending: false, inputCurrency: WBNB_C, outputCurrency: USDC_C }).mode,
    ).toBe(SMARTSWAP_DISPLAY_MODE.V2_PENDING)
  })
})
