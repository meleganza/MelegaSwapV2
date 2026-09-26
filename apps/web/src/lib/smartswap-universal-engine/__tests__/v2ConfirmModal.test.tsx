/**
 * P0 #101 follow-up — non-expert BSC SmartSwap V2 confirmation modal (seam on; production flag on).
 * Same ConfirmSwapModal shell in V2 mode, rendering ONLY the pinned certified plan facts; Confirm calls the existing
 * certified consume path (consumePreparedV2UserPlan). Expert = direct; legacy non-expert = legacy modal unchanged.
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { getAddress } from '@ethersproject/address'
import { Interface } from '@ethersproject/abi'
import { CurrencyAmount, Native, Percent, Token, TradeType } from '@pancakeswap/sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApprovalState } from 'hooks/useApproveCallback'
import { WrapType } from 'hooks/useWrapCallback'
import { BSC_V2_PUBLIC_CUTOVER_ENABLED, isProductionCutoverAllowed } from '../operatingMode'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import type { SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition } from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import {
  V2_PUBLIC_ACTION,
  buildV2UserExecutionPlan,
  consumePreparedV2UserPlan,
  currentRequestKeyOf,
  resetV2CtaConsumeLocksForTests,
  resetV2UserLocalNonceStateForTests,
  resolveSmartSwapCtaDecision,
  type V2UserExecutionPlan,
} from '../v2UserExecutionPlan'
import { buildShadowRuntimeRequest } from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight'
import {
  SMARTSWAP_DISPLAY_MODE,
  resolveSmartSwapExecutionDisplay,
  type SmartSwapV2ExecutionDisplay,
} from '../../../views/Swap/SmartSwap/utils/v2ExecutionDisplay'

type Harness = {
  node: React.ReactElement | null
  open: boolean
  bump: (() => void) | null
  legacySwapCalls: number
  sends: { to: string; data: string }[]
}
function H(): Harness {
  const g = globalThis as unknown as { __v2confirm?: Harness }
  if (!g.__v2confirm) g.__v2confirm = { node: null, open: false, bump: null, legacySwapCalls: 0, sends: [] }
  return g.__v2confirm
}

vi.mock('@pancakeswap/localization', async () => {
  const actual = await vi.importActual<any>('@pancakeswap/localization')
  return {
    ...actual,
    useTranslation: () => ({
      t: (s: string, v?: Record<string, string>) =>
        v ? Object.entries(v).reduce((acc, [k, val]) => acc.replace(`%${k}%`, String(val)), s) : s,
    }),
  }
})
vi.mock('@pancakeswap/uikit', async () => {
  const actual = await vi.importActual<any>('@pancakeswap/uikit')
  const ReactLib = await vi.importActual<typeof import('react')>('react')
  const Pass = ({ children }: any) => <span>{children}</span>
  return {
    ...actual,
    Button: ({ children, onClick, disabled, id }: any) => (
      <button type="button" id={id} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
    Text: ({ children }: any) => <span>{children}</span>,
    Flex: Pass,
    Link: Pass,
    LinkExternal: Pass,
    QuestionHelper: () => null,
    ArrowDownIcon: () => null,
    SearchIcon: () => <i data-testid="legacy-route-search" />,
    ChevronRightIcon: () => <span>{'>'}</span>,
    ModalV2: () => null,
    Modal: ({ children, onDismiss }: any) => (
      <div data-testid="confirm-modal">
        <button type="button" data-testid="modal-close" onClick={onDismiss} />
        {children}
      </div>
    ),
    ConfirmationModalContent: ({ topContent, bottomContent }: any) => (
      <div>
        {topContent()}
        {bottomContent()}
      </div>
    ),
    ConfirmationPendingContent: ({ pendingText }: any) => <div data-testid="pending">{pendingText}</div>,
    TransactionErrorContent: ({ message }: any) => <div data-testid="tx-error">{message}</div>,
    confirmPriceImpactWithoutFee: () => true,
    // Minimal ModalProvider semantics: present/dismiss + updateOnPropsChange for the confirm modal node.
    useModal: (node: React.ReactElement, _close?: boolean, _update?: boolean, id?: string) => {
      if (id === 'confirmSwapModal') H().node = node
      ReactLib.useEffect(() => {
        H().bump?.()
      })
      return [
        () => {
          if (id !== 'confirmSwapModal') return
          H().open = true
          H().bump?.()
        },
        () => {
          H().open = false
          H().bump?.()
        },
      ]
    },
  }
})
vi.mock('components/CommitButton', () => ({
  CommitButton: ({ children, onClick, disabled, ...rest }: any) => (
    <button
      type="button"
      data-testid="cta"
      disabled={Boolean(disabled)}
      data-public-action={rest['data-smartswap-public-action']}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}))
vi.mock('components/ConnectWalletButton', () => ({ default: () => <button type="button">Connect Wallet</button> }))
vi.mock('components/Card', () => ({ GreyCard: ({ children }: any) => <div>{children}</div> }))
vi.mock('components/Logo', () => ({ CurrencyLogo: () => null }))
vi.mock('components/Layout/Column', () => ({ AutoColumn: ({ children }: any) => <div>{children}</div> }))
vi.mock('components/Layout/Row', () => ({
  AutoRow: ({ children }: any) => <div>{children}</div>,
  RowBetween: ({ children }: any) => <div>{children}</div>,
  RowFixed: ({ children }: any) => <div>{children}</div>,
}))
vi.mock('components/Loader/CircleLoader', () => ({ default: () => <i /> }))
vi.mock('components/Menu/GlobalSettings/SettingsModal', () => ({
  default: () => null,
  withCustomOnDismiss: () => () => null,
}))
vi.mock('components/Menu/GlobalSettings/types', () => ({ SettingsMode: { SWAP_LIQUIDITY: 'SWAP_LIQUIDITY' } }))
vi.mock('components/TransactionConfirmationModal', () => ({
  TransactionSubmittedContent: ({ hash }: any) => <div data-testid="submitted">{hash}</div>,
}))
vi.mock('components/DexPricing/DexSwapFeeDisclosure', () => ({
  DexSwapFeeDisclosure: () => <div data-testid="legacy-melega-fee-disclosure">Execution router</div>,
}))
vi.mock('../../../views/Swap/components/styleds', () => ({
  SwapCallbackError: ({ error }: any) => <p>{error}</p>,
  TruncatedText: ({ children }: any) => <span>{children}</span>,
}))
vi.mock('../../../views/Swap/components/FormattedPriceImpact', () => ({
  default: ({ priceImpact }: any) => (
    <span data-testid="price-impact">{priceImpact ? `${priceImpact.toFixed(2)}%` : '-'}</span>
  ),
}))
vi.mock('../../../views/Swap/components/RouterViewer', () => ({ RouterViewer: () => null }))
vi.mock('../../../views/Swap/SmartSwap/components/TransactionConfirmSwapContent', () => ({
  default: ({ trade, onConfirm }: any) => (
    <div data-testid="legacy-confirm-content" data-legacy-out={trade?.outputAmount?.toSignificant(3)}>
      <span>{`Legacy estimated ${trade?.outputAmount?.toSignificant(3)}`}</span>
      <button type="button" onClick={onConfirm}>
        Legacy Confirm Swap
      </button>
    </div>
  ),
}))
vi.mock('../../../views/Swap/SmartSwap/utils/exchange', async () => {
  const actual = await vi.importActual<any>('../../../views/Swap/SmartSwap/utils/exchange')
  return {
    ...actual,
    computeTradePriceBreakdown: (trade: any) => ({
      priceImpactWithoutFee: trade?.legacyImpact,
      realizedLPFee: undefined,
    }),
  }
})
vi.mock('hooks/useActiveChainId', () => ({ useActiveChainId: () => ({ chainId: 56 }) }))
vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
  return { ...actual, useAccount: () => ({ address: '0x1111111111111111111111111111111111111111' }) }
})
vi.mock('state/user/hooks', () => ({ useUserSingleHopOnly: () => [false] }))
vi.mock('lib/kerl-constitutional', () => ({
  isKerlRoutingAuthorityEnforced: () => false,
  useKerlConstitutionalSwap: () => ({ callback: null, executionRequest: null }),
}))
vi.mock('lib/routing-layer/facade', () => ({ routeSmartSwapQuoteFromTrade: () => ({ instruction: null }) }))
vi.mock('lib/execution-layer', () => ({
  useSmartSwapExecution: () => ({
    callback: async () => {
      H().legacySwapCalls += 1
      return '0xlegacy'
    },
    error: null,
  }),
}))

// eslint-disable-next-line import/first
import SwapCommitButton from '../../../views/Swap/SmartSwap/components/SmartSwapCommitButton'

const NOW = '2026-08-20T00:00:05.000Z'
const DEADLINE = 1_893_456_000
const USER = '0x1111111111111111111111111111111111111111'
const EXECUTOR = getAddress('0x7c07082839edd5797737640bba6af47992b9861e')
const PANCAKE_ROUTER = getAddress('0x10ED43C718714eb63d5aA57B78B54704E256024E')
const WBNB = getAddress('0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c')
const USDC = getAddress('0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d')
const BNB_C = Native.onChain(56)
const USDC_C = new Token(56, USDC, 18, 'USDC')
const APPROVE = new Interface(['function approve(address spender, uint256 amount)'])
const BNB_USDC_KEY = `56:${WBNB.toLowerCase()}>${USDC.toLowerCase()}`
const USDC_BNB_KEY = `56:${USDC.toLowerCase()}>${WBNB.toLowerCase()}`

/** Legacy Melega trade (the leak that must never appear in the V2 confirmation). */
const LEGACY_TRADE: any = {
  route: {},
  tradeType: TradeType.EXACT_INPUT,
  inputAmount: CurrencyAmount.fromRawAmount(BNB_C, '10000000000000000'),
  outputAmount: CurrencyAmount.fromRawAmount(USDC_C, '1980000000000000000'),
  legacyImpact: new Percent('7395', '10000'),
}

function request(kind: 'native' | 'erc20'): SmartSwapRequest {
  const bnb = { isNative: true, decimals: 18, symbol: 'BNB', chainId: 56 }
  const usdc = { isNative: false, address: USDC, decimals: 18, symbol: 'USDC', chainId: 56 }
  return buildShadowRuntimeRequest({
    chainId: 56,
    inputCurrency: kind === 'native' ? bnb : usdc,
    outputCurrency: kind === 'native' ? usdc : bnb,
    inputAmountRaw: kind === 'native' ? '10000000000000000' : '7760000000000000000',
    exactOut: false,
    slippageBps: 77,
  }).request!
}

async function v2Plan(kind: 'native' | 'erc20', amountOutRaw: string, priceImpactPercent: number | null = null) {
  const req = request(kind)
  const result = await runEvmShadowCompetition({
    request: req,
    productionQuote: null,
    adapters: [
      createPancakeSwapVenueAdapter(
        createSyntheticQuoteSource({
          [kind === 'native' ? BNB_USDC_KEY : USDC_BNB_KEY]: { amountOutRaw, priceImpactPercent },
        }),
      ),
    ],
    nowIso: NOW,
  })
  const winner = result.shadowWinner!
  const plan = buildV2UserExecutionPlan({
    user: USER,
    walletChainId: 56,
    request: req,
    requestKey: currentRequestKeyOf(req),
    shadow: { status: 'ready', requestKey: currentRequestKeyOf(req), winner, v2Available: true },
    observedAllowance:
      kind === 'native' ? undefined : { chainId: 56, token: USDC, owner: USER, spender: EXECUTOR, amountRaw: '0' },
    allowanceReadStatus: kind === 'native' ? 'native' : 'ok',
    nowIso: NOW,
    deadline: DEADLINE,
    bscPublicCutoverEnabled: true,
  })
  const decision = resolveSmartSwapCtaDecision({
    planOk: plan.ok,
    cutoverAllowed: isProductionCutoverAllowed(56, true) && plan.productionCutoverAllowed,
    testOnlyExecutionGate: false,
    planReason: plan.reason,
  })
  expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
  const display = resolveSmartSwapExecutionDisplay({
    decision,
    plan,
    v2Pending: false,
    inputCurrency: kind === 'native' ? BNB_C : USDC_C,
    outputCurrency: kind === 'native' ? USDC_C : BNB_C,
  })
  expect(display.mode).toBe(SMARTSWAP_DISPLAY_MODE.V2)
  return { plan, decision, display: display as SmartSwapV2ExecutionDisplay }
}

/** Binding shaped like useSmartSwapV2CtaBinding; consume = the REAL certified consume with a recording mock wallet. */
function bindingFor(plan: V2UserExecutionPlan, publicAction: string, opts: { v2Pending?: boolean } = {}) {
  const consume = vi.fn(() =>
    consumePreparedV2UserPlan({
      plan,
      testOnlyExecutionGate: false,
      cutoverAllowed: true,
      submitUserTransaction: async (tx) => {
        H().sends.push({ to: tx.to, data: tx.data })
        return { hash: `0x${String(H().sends.length).padStart(64, '0')}` }
      },
      waitForReceipt: async () => ({ status: 1 }),
      nowIso: new Date(Date.now()).toISOString(),
    }),
  )
  const refreshV2Quote = vi.fn(() => true)
  return {
    consume,
    refreshV2Quote,
    value: {
      decision: { decision: publicAction, publicAction, reason: plan.reason },
      plan,
      consumeIfGated: consume,
      v2Pending: Boolean(opts.v2Pending),
      cutoverAllowed: true,
      refreshV2Quote,
      shadowGeneration: 1,
      config: {},
    } as any,
  }
}

function ModalHost() {
  const [, setN] = React.useState(0)
  H().bump = () => setN((n) => n + 1)
  const { node } = H()
  if (!H().open || !node) return null
  return (
    <div data-testid="modal-root">
      {React.cloneElement(node, {
        onDismiss: () => {
          H().open = false
          H().bump?.()
        },
      })}
    </div>
  )
}

function Ui(props: Record<string, any>) {
  return (
    <>
      <SwapCommitButton
        swapIsUnsupported={false}
        account={USER}
        showWrap={false}
        wrapInputError=""
        onWrap={async () => undefined}
        wrapType={WrapType.NOT_APPLICABLE}
        approval={ApprovalState.NOT_APPROVED}
        approveCallback={async () => undefined}
        approvalSubmitted={false}
        currencies={{ INPUT: BNB_C, OUTPUT: USDC_C } as any}
        isExpertMode={false}
        trade={LEGACY_TRADE}
        swapInputError={undefined as any}
        currencyBalances={{}}
        recipient={null as any}
        allowedSlippage={50}
        parsedIndepentFieldAmount={{ greaterThan: () => true } as any}
        onUserInput={() => undefined}
        {...(props as any)}
      />
      <ModalHost />
    </>
  )
}

async function flush() {
  for (let i = 0; i < 10; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await Promise.resolve()
    })
  }
}

function modalText() {
  return screen.queryByTestId('confirm-modal')?.textContent ?? ''
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(NOW))
  resetV2UserLocalNonceStateForTests()
  resetV2CtaConsumeLocksForTests()
  const h = H()
  h.node = null
  h.open = false
  h.bump = null
  h.legacySwapCalls = 0
  h.sends.length = 0
})
afterEach(() => {
  vi.useRealTimers()
})

describe('P0 #101 follow-up: non-expert V2 confirmation modal (seam on; production flag on)', () => {
  it('production flag is on (BSC 56 only); the explicit false seam still turns it off', () => {
    expect(BSC_V2_PUBLIC_CUTOVER_ENABLED).toBe(true)
    expect(isProductionCutoverAllowed(56)).toBe(true)
    expect(isProductionCutoverAllowed(56, false)).toBe(false)
    expect(isProductionCutoverAllowed(1)).toBe(false)
  })

  it('1-9: NON-EXPERT + V2_EXECUTE (BNB -> USDC): Swap opens the modal with exact V2 facts; no legacy output/impact; unknown impact not invented', async () => {
    const { plan, display } = await v2Plan('native', '7760000000000000000', null)
    const b = bindingFor(plan, V2_PUBLIC_ACTION.V2_EXECUTE)
    render(<Ui v2Binding={b.value} v2ExecutionDisplay={display} />)
    expect(screen.queryByTestId('confirm-modal')).toBeNull()
    fireEvent.click(screen.getByTestId('cta'))
    await flush()
    // 1: modal open (V2 mode), nothing consumed/sent by opening it
    expect(screen.getByTestId('confirm-modal')).toBeTruthy()
    expect(screen.queryByTestId('legacy-confirm-content')).toBeNull()
    expect(b.consume).toHaveBeenCalledTimes(0)
    const text = modalText()
    // 2: output = factual winner output
    expect(text).toContain(display.outputAmount.toSignificant(6))
    expect(display.outputAmount.quotient.toString()).toBe(plan.winnerQuote!.grossOutputRaw)
    // 3: minimum = intent.minUserOut (exact; same toSignificant as the page Details)
    expect(display.minimumReceived.quotient.toString()).toBe(plan.binding!.intent.minUserOut)
    expect(text).toContain(`Minimum received${display.minimumReceived.toSignificant(4)} USDC`)
    expect(text).toContain(`at least ${display.minimumReceived.toSignificant(6)} USDC`)
    // 4: venue = V2 winner
    expect(text).toContain(`Venue${plan.winnerQuote!.venueLabel}`)
    // 5: exact V2 fee (amount + bps)
    expect(text).toContain(
      `SmartSwap fee${display.feeAmount.toSignificant(4)} BNB (${(plan.binding!.intent.feeBps / 100).toFixed(2)}%)`,
    )
    expect(display.feeAmount.quotient.toString()).toBe(plan.binding!.intent.feeAmount)
    // 6: router + route = V2 binding
    expect(plan.binding!.intent.router).toBe(PANCAKE_ROUTER)
    expect(text).toContain(`Router${PANCAKE_ROUTER.slice(0, 6)}…${PANCAKE_ROUTER.slice(-4)}`)
    expect(text).toMatch(/RouteBNB>USDC/)
    // 7/8: no legacy output, no legacy impact, no legacy fee panel/route search
    expect(text).not.toContain('1.98')
    expect(text).not.toContain('73.95')
    expect(screen.queryByTestId('legacy-melega-fee-disclosure')).toBeNull()
    expect(screen.queryByTestId('legacy-route-search')).toBeNull()
    // 9: unknown V2 impact -> no impact row at all
    expect(text).not.toContain('Price Impact')
    expect(H().sends).toHaveLength(0)
  })

  it('9b: a factual winner impact is shown (and only that one)', async () => {
    const { plan, display } = await v2Plan('native', '7760000000000000000', 0.42)
    const b = bindingFor(plan, V2_PUBLIC_ACTION.V2_EXECUTE)
    render(<Ui v2Binding={b.value} v2ExecutionDisplay={display} />)
    fireEvent.click(screen.getByTestId('cta'))
    await flush()
    expect(modalText()).toContain('Price Impact0.42%')
    expect(modalText()).not.toContain('73.95')
  })

  it('10/12/15: Confirm starts exactly ONE existing V2 consume (native: no approval, execute to the Executor); double confirm stays single', async () => {
    const { plan, display } = await v2Plan('native', '7760000000000000000')
    const b = bindingFor(plan, V2_PUBLIC_ACTION.V2_EXECUTE)
    render(<Ui v2Binding={b.value} v2ExecutionDisplay={display} />)
    fireEvent.click(screen.getByTestId('cta'))
    await flush()
    const confirm = screen.getByText('Confirm Swap')
    fireEvent.click(confirm)
    fireEvent.click(confirm)
    await flush()
    expect(b.consume).toHaveBeenCalledTimes(1)
    expect(H().legacySwapCalls).toBe(0)
    expect(plan.preparation!.approvalTransactions).toHaveLength(0)
    expect(H().sends).toHaveLength(1)
    expect(getAddress(H().sends[0].to)).toBe(EXECUTOR)
    expect(H().sends[0].data).toBe(plan.preparation!.swapTransaction.data)
    expect(screen.getByTestId('submitted')).toBeTruthy()
  })

  it('11: ERC20 (USDC -> BNB): same modal truth; Confirm -> approval to the Executor ONLY, then execute; no legacy approval', async () => {
    const { plan, display } = await v2Plan('erc20', '9900000000000000')
    const b = bindingFor(plan, V2_PUBLIC_ACTION.V2_EXECUTE)
    const approveCallback = vi.fn(async () => undefined)
    render(
      <Ui
        v2Binding={b.value}
        v2ExecutionDisplay={display}
        currencies={{ INPUT: USDC_C, OUTPUT: BNB_C }}
        approveCallback={approveCallback}
      />,
    )
    fireEvent.click(screen.getByTestId('cta'))
    await flush()
    const text = modalText()
    expect(text).toContain(display.outputAmount.toSignificant(6))
    expect(text).toContain(`Minimum received${display.minimumReceived.toSignificant(4)} BNB`)
    expect(text).toContain(`SmartSwap fee${display.feeAmount.toSignificant(4)} USDC`)
    expect(text).toMatch(/RouteUSDC>BNB/)
    expect(H().sends).toHaveLength(0)
    fireEvent.click(screen.getByText('Confirm Swap'))
    await flush()
    expect(b.consume).toHaveBeenCalledTimes(1)
    expect(approveCallback).not.toHaveBeenCalled()
    expect(H().sends).toHaveLength(2)
    expect(getAddress(H().sends[0].to)).toBe(USDC)
    expect(getAddress(APPROVE.decodeFunctionData('approve', H().sends[0].data).spender)).toBe(EXECUTOR)
    expect(getAddress(H().sends[1].to)).toBe(EXECUTOR)
  })

  it('13: dismiss -> zero wallet requests, zero consume', async () => {
    const { plan, display } = await v2Plan('erc20', '9900000000000000')
    const b = bindingFor(plan, V2_PUBLIC_ACTION.V2_EXECUTE)
    render(<Ui v2Binding={b.value} v2ExecutionDisplay={display} currencies={{ INPUT: USDC_C, OUTPUT: BNB_C }} />)
    fireEvent.click(screen.getByTestId('cta'))
    await flush()
    fireEvent.click(screen.getByTestId('modal-close'))
    await flush()
    expect(screen.queryByTestId('confirm-modal')).toBeNull()
    expect(b.consume).toHaveBeenCalledTimes(0)
    expect(H().sends).toHaveLength(0)
  })

  it('14a: plan expires before Confirm (timer not yet fired): zero stale execute, modal closes, fresh re-quote requested, no legacy', async () => {
    const { plan, display } = await v2Plan('native', '7760000000000000000')
    const b = bindingFor(plan, V2_PUBLIC_ACTION.V2_EXECUTE)
    render(<Ui v2Binding={b.value} v2ExecutionDisplay={display} />)
    fireEvent.click(screen.getByTestId('cta'))
    await flush()
    vi.setSystemTime(new Date(Date.parse(plan.freshUntilIso!) + 1))
    fireEvent.click(screen.getByText('Confirm Swap'))
    await flush()
    expect(b.consume).toHaveBeenCalledTimes(0)
    expect(H().sends).toHaveLength(0)
    expect(H().legacySwapCalls).toBe(0)
    expect(screen.queryByTestId('confirm-modal')).toBeNull()
    expect(b.refreshV2Quote).toHaveBeenCalledTimes(1)
  })

  it('14b: expiry while the modal is open (binding retired -> V2_PENDING refresh): modal closes by itself, never submits, no extra refresh', async () => {
    const { plan, display } = await v2Plan('native', '7760000000000000000')
    const b = bindingFor(plan, V2_PUBLIC_ACTION.V2_EXECUTE)
    const view = render(<Ui v2Binding={b.value} v2ExecutionDisplay={display} />)
    fireEvent.click(screen.getByTestId('cta'))
    await flush()
    vi.setSystemTime(new Date(Date.parse(plan.freshUntilIso!) + 1))
    // The binding's expiry: retired plan + same-request refresh in flight (V2_PENDING), display pending.
    const retired = {
      ...b.value,
      decision: { ...b.value.decision, publicAction: V2_PUBLIC_ACTION.LEGACY },
      v2Pending: true,
    }
    view.rerender(<Ui v2Binding={retired} v2ExecutionDisplay={null} />)
    await flush()
    expect(screen.queryByTestId('confirm-modal')).toBeNull()
    expect(screen.getByTestId('cta').getAttribute('data-public-action')).toBe('V2_PENDING')
    expect(b.consume).toHaveBeenCalledTimes(0)
    expect(H().sends).toHaveLength(0)
    expect(H().legacySwapCalls).toBe(0)
    expect(b.refreshV2Quote).toHaveBeenCalledTimes(0)
  })

  it('pinned: a refresh updating the form never mutates the open modal; a transient not-ready plan only disables Confirm; a new fresh plan closes it', async () => {
    const g1 = await v2Plan('native', '7760000000000000000')
    const b1 = bindingFor(g1.plan, V2_PUBLIC_ACTION.V2_EXECUTE)
    const view = render(<Ui v2Binding={b1.value} v2ExecutionDisplay={g1.display} />)
    fireEvent.click(screen.getByTestId('cta'))
    await flush()
    // transient (e.g. allowance re-read): same pinned facts, Confirm disabled
    const transient = {
      ...b1.value,
      decision: { ...b1.value.decision, publicAction: V2_PUBLIC_ACTION.LEGACY },
      v2Pending: true,
      plan: { ...g1.plan, ok: false },
    }
    view.rerender(<Ui v2Binding={transient} v2ExecutionDisplay={null} />)
    await flush()
    expect(modalText()).toContain(g1.display.outputAmount.toSignificant(6))
    expect((screen.getByText('Confirm Swap') as HTMLButtonElement).disabled).toBe(true)
    // a different fresh plan (new quote) replaces the pinned one: the modal closes, nothing sent
    vi.setSystemTime(new Date(Date.parse(NOW) + 1_000))
    const g2 = await v2Plan('native', '7810000000000000000')
    const b2 = bindingFor(
      { ...g2.plan, freshUntilIso: new Date(Date.parse(g1.plan.freshUntilIso!) + 1_000).toISOString() },
      V2_PUBLIC_ACTION.V2_EXECUTE,
    )
    view.rerender(<Ui v2Binding={b2.value} v2ExecutionDisplay={g2.display} />)
    await flush()
    expect(screen.queryByTestId('confirm-modal')).toBeNull()
    expect(b1.consume).toHaveBeenCalledTimes(0)
    expect(b2.consume).toHaveBeenCalledTimes(0)
    expect(H().sends).toHaveLength(0)
    expect(b2.refreshV2Quote).toHaveBeenCalledTimes(0)
  })

  it('16: EXPERT mode: direct certified consume on Swap (no modal), unchanged', async () => {
    const { plan, display } = await v2Plan('native', '7760000000000000000')
    const b = bindingFor(plan, V2_PUBLIC_ACTION.V2_EXECUTE)
    render(<Ui v2Binding={b.value} v2ExecutionDisplay={display} isExpertMode />)
    fireEvent.click(screen.getByTestId('cta'))
    await flush()
    expect(screen.queryByTestId('confirm-modal')).toBeNull()
    expect(b.consume).toHaveBeenCalledTimes(1)
    expect(H().sends).toHaveLength(1)
  })

  it('17: LEGACY non-expert: the legacy confirmation modal is unchanged (legacy content, legacy callback, no V2 content)', async () => {
    const { plan } = await v2Plan('native', '7760000000000000000')
    const legacyPlan = { ...plan, ok: false, reason: 'SHADOW_NOT_READY' } as V2UserExecutionPlan
    const b = bindingFor(legacyPlan, V2_PUBLIC_ACTION.LEGACY)
    render(
      <Ui
        v2Binding={b.value}
        v2ExecutionDisplay={null}
        approval={ApprovalState.APPROVED}
        trade={{ ...LEGACY_TRADE, legacyImpact: new Percent('10', '10000') }}
      />,
    )
    expect(screen.getByTestId('cta').getAttribute('data-public-action')).toBe('LEGACY')
    fireEvent.click(screen.getByTestId('cta'))
    await flush()
    expect(screen.getByTestId('legacy-confirm-content').getAttribute('data-legacy-out')).toBe('1.98')
    expect(document.querySelector('[data-smartswap-v2-confirm]')).toBeNull()
    fireEvent.click(screen.getByText('Legacy Confirm Swap'))
    await flush()
    expect(H().legacySwapCalls).toBe(1)
    expect(b.consume).toHaveBeenCalledTimes(0)
    expect(H().sends).toHaveLength(0)
  })
})
