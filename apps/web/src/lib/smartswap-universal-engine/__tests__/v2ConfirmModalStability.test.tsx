/**
 * P0 SmartSwap confirm-modal stability, with the REAL uikit ModalProvider + useModal (no modal mock).
 * Once Swap is clicked the reviewed V2 plan is pinned; the modal content stays frozen through allowance reads, shadow
 * generation updates, equivalent plan recreation, and transient NOT_READY (wallet flap) with the legacy fallback
 * available; a legacy `confirmSwapModal` hook can never overwrite it; expiry/replacement close once (never hot-swap).
 */
import React, { Profiler } from 'react'
import { ThemeProvider } from 'styled-components'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  // separate harness state per file
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
  }
})
// Exit animations are not the subject: close = unmount immediately (the provider/useModal logic stays real).
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<any>('framer-motion')
  return { ...actual, AnimatePresence: ({ children }: any) => <>{children}</> }
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


// eslint-disable-next-line import/first, import/order
import { ModalProvider, light, useModal } from '@pancakeswap/uikit'

const FRESH_UNTIL_MS = Date.parse('2026-08-20T00:00:15.000Z')

/** ERC20 USDC -> BNB plan (Pancake winner) with a chosen allowance observation / user (same builder as production). */
async function erc20Plan(opts: { amountOutRaw?: string; allowanceRaw?: string; user?: string | null } = {}) {
  const req = request('erc20')
  const result = await runEvmShadowCompetition({
    request: req,
    productionQuote: null,
    adapters: [
      createPancakeSwapVenueAdapter(
        createSyntheticQuoteSource({ [USDC_BNB_KEY]: { amountOutRaw: opts.amountOutRaw ?? '9900000000000000' } }),
      ),
    ],
    nowIso: NOW,
  })
  const user = opts.user === undefined ? USER : opts.user
  const plan = buildV2UserExecutionPlan({
    user: user as any,
    walletChainId: 56,
    request: req,
    requestKey: currentRequestKeyOf(req),
    shadow: { status: 'ready', requestKey: currentRequestKeyOf(req), winner: result.shadowWinner!, v2Available: true },
    observedAllowance: { chainId: 56, token: USDC, owner: USER, spender: EXECUTOR, amountRaw: opts.allowanceRaw ?? '0' },
    allowanceReadStatus: 'ok',
    nowIso: new Date(Date.now()).toISOString(),
    deadline: DEADLINE,
    bscPublicCutoverEnabled: true,
  })
  const decision = resolveSmartSwapCtaDecision({
    planOk: plan.ok,
    cutoverAllowed: isProductionCutoverAllowed(56, true) && plan.productionCutoverAllowed,
    testOnlyExecutionGate: false,
    planReason: plan.reason,
  })
  const display = resolveSmartSwapExecutionDisplay({
    decision,
    plan,
    v2Pending: false,
    inputCurrency: USDC_C,
    outputCurrency: BNB_C,
  })
  return { plan, decision, display }
}

type Counters = { legacyNodeRenders: number; commits: number; modalMounts: number; modalUnmounts: number }
const C: Counters = { legacyNodeRenders: 0, commits: 0, modalMounts: 0, modalUnmounts: 0 }

/** Stand-in for the legacy confirm modal node (legacy Melega trade values). */
function LegacyConfirmNode({ out }: { out: string }) {
  C.legacyNodeRenders += 1
  return <div data-testid="legacy-modal-node">{`Legacy Melega estimated ${out}`}</div>
}

/** Exactly how the legacy SwapCommitButton registers its modal: REAL useModal, same id, updateOnPropsChange=true. */
function LegacyCommitButtonLike({ out = '0.05471' }: { out?: string }) {
  const [present] = useModal(<LegacyConfirmNode out={out} />, true, true, 'confirmSwapModal')
  return (
    <button type="button" data-testid="legacy-cta" onClick={present}>
      Legacy Swap
    </button>
  )
}

/** Counts mounts/unmounts of the confirm modal DOM (a remount = the modal closed/reopened or was replaced). */
function trackModal() {
  let present = false
  const observer = new MutationObserver(() => {
    const now = Boolean(document.querySelector('[data-testid="confirm-modal"]'))
    if (now && !present) C.modalMounts += 1
    if (!now && present) C.modalUnmounts += 1
    present = now
  })
  observer.observe(document.body, { childList: true, subtree: true })
  return observer
}

function Ui(props: Record<string, any>) {
  return (
    <ThemeProvider theme={light as any}>
      <ModalProvider>
        <Profiler id="smartswap" onRender={() => { C.commits += 1 }}>
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
            currencies={{ INPUT: USDC_C, OUTPUT: BNB_C } as any}
            isExpertMode={false}
            trade={LEGACY_TRADE}
            swapInputError={undefined as any}
            currencyBalances={{}}
            recipient={null as any}
            allowedSlippage={50}
            parsedIndepentFieldAmount={{ greaterThan: () => true } as any}
            onUserInput={() => undefined}
            legacyFallback={<LegacyCommitButtonLike />}
            {...(props as any)}
          />
          {props.extraLegacyHook ? <LegacyCommitButtonLike out="0.09999" /> : null}
        </Profiler>
      </ModalProvider>
    </ThemeProvider>
  )
}

/** Reviewed values as rendered (input, output, min received, venue, router, route, fee, impact) + Confirm state. */
function snapshot() {
  const root = document.querySelector('[data-testid="confirm-modal"]')
  const confirm = screen.queryByText('Confirm Swap') as HTMLButtonElement | null
  return {
    text: root?.textContent ?? null,
    confirmDisabled: confirm ? confirm.disabled : null,
    legacyVisible: Boolean(screen.queryByTestId('legacy-modal-node')),
  }
}

async function settle(rounds = 20) {
  for (let i = 0; i < rounds; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      // macrotask turn: lets the provider's lazy ModalRenderer chunk resolve (no sleeps; timers stay real, Date is faked)
      await new Promise((resolve) => {
        setTimeout(resolve, 0)
      })
    })
  }
}

/** Condition wait (not a sleep): the provider lazily loads its ModalRenderer chunk on first present. */
async function untilModalOpen() {
  await waitFor(() => expect(document.querySelector('[data-testid="confirm-modal"]')).toBeTruthy(), { timeout: 15000 })
  await settle()
}

async function openV2(extra: Record<string, any> = {}) {
  const a = await erc20Plan()
  expect(a.decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
  const b = bindingFor(a.plan, V2_PUBLIC_ACTION.V2_EXECUTE)
  const view = render(<Ui v2Binding={b.value} v2ExecutionDisplay={a.display} {...extra} />)
  await settle()
  fireEvent.click(screen.getByTestId('cta'))
  await untilModalOpen()
  const first = snapshot()
  expect(first.text).toBeTruthy()
  expect(first.confirmDisabled).toBe(false)
  return { a, b, view, first, node: document.querySelector('[data-testid="confirm-modal"]') }
}

describe('P0 SmartSwap confirm modal stability (real uikit ModalProvider/useModal)', () => {
  let observer: MutationObserver
  beforeEach(() => {
    C.legacyNodeRenders = 0
    C.commits = 0
    C.modalMounts = 0
    C.modalUnmounts = 0
    observer = trackModal()
  })
  afterEach(() => observer.disconnect())

  it('A/B/C: allowance transition, shadow generation update, equivalent plan recreation, timers within freshness -> same pinned values, same mounted node, Confirm actionable, no render loop', async () => {
    const { a, b, view, first, node } = await openV2()
    expect(first.text).toContain(a.display.mode === 'V2' ? (a.display as any).outputAmount.toSignificant(6) : 'x')
    const commitsAtOpen = C.commits
    // B: allowance read update (0 -> exact amount): plan rebuilt, same review key
    const allowed = await erc20Plan({ allowanceRaw: '7760000000000000000' })
    view.rerender(<Ui v2Binding={bindingFor(allowed.plan, V2_PUBLIC_ACTION.V2_EXECUTE).value} v2ExecutionDisplay={allowed.display} />)
    await settle()
    expect(snapshot()).toEqual(first)
    // C: same-request background refresh / new shadow generation producing an equivalent plan
    const regen = await erc20Plan()
    view.rerender(
      <Ui v2Binding={{ ...bindingFor(regen.plan, V2_PUBLIC_ACTION.V2_EXECUTE).value, shadowGeneration: 2 }} v2ExecutionDisplay={regen.display} />,
    )
    await settle()
    expect(snapshot()).toEqual(first)
    // A: equivalent plan recreation on every render (new objects, same facts) + timers advancing within freshness
    for (let s = 6; s <= 14; s += 2) {
      vi.setSystemTime(new Date(Date.parse('2026-08-20T00:00:00.000Z') + s * 1000))
      // eslint-disable-next-line no-await-in-loop
      const again = await erc20Plan()
      view.rerender(<Ui v2Binding={bindingFor(again.plan, V2_PUBLIC_ACTION.V2_EXECUTE).value} v2ExecutionDisplay={again.display} />)
      // eslint-disable-next-line no-await-in-loop
      await settle()
      expect(snapshot()).toEqual(first)
    }
    expect(document.querySelector('[data-testid="confirm-modal"]')).toBe(node)
    expect(C.modalMounts).toBe(1)
    expect(C.modalUnmounts).toBe(0)
    expect(C.legacyNodeRenders).toBe(0)
    // bounded commits: ~a handful per rerender, never a loop
    expect(C.commits - commitsAtOpen).toBeLessThan(80)
    expect(b.consume).toHaveBeenCalledTimes(0)
    expect(H().sends).toHaveLength(0)
  })

  it('transient NOT_READY (wallet flap) with the legacy fallback available: the legacy hook never mounts under the open V2 review; values frozen; Confirm disabled once; restored when the same plan returns', async () => {
    const { a, view, first, node } = await openV2()
    const flap = await erc20Plan({ user: null })
    expect(flap.plan.ok).toBe(false)
    const commitsBefore = C.commits
    view.rerender(
      <Ui v2Binding={bindingFor(flap.plan, flap.decision.publicAction).value} v2ExecutionDisplay={flap.display} />,
    )
    await settle(40)
    const during = snapshot()
    expect(during.text).toBe(first.text)
    expect(during.confirmDisabled).toBe(true)
    expect(during.legacyVisible).toBe(false)
    expect(screen.queryByTestId('legacy-cta')).toBeNull()
    expect(C.legacyNodeRenders).toBe(0)
    // no V2 <-> legacy ping-pong: commits stay bounded while NOT_READY persists
    expect(C.commits - commitsBefore).toBeLessThan(20)
    view.rerender(<Ui v2Binding={bindingFor(a.plan, V2_PUBLIC_ACTION.V2_EXECUTE).value} v2ExecutionDisplay={a.display} />)
    await settle()
    expect(snapshot()).toEqual(first)
    expect(document.querySelector('[data-testid="confirm-modal"]')).toBe(node)
    expect(C.modalMounts).toBe(1)
    expect(C.modalUnmounts).toBe(0)
  })

  it('another legacy `confirmSwapModal` hook mounted on the page cannot overwrite the open V2 review', async () => {
    const { first, node } = await openV2({ extraLegacyHook: true })
    const commitsBefore = C.commits
    await settle(40)
    expect(snapshot()).toEqual(first)
    expect(C.legacyNodeRenders).toBe(0)
    expect(document.querySelector('[data-testid="confirm-modal"]')).toBe(node)
    expect(C.commits - commitsBefore).toBeLessThan(10)
  })

  it('D: expiry -> the pinned plan is never confirmable; closes exactly once, ONE refresh trigger, no reopen/oscillation', async () => {
    const { a, b, view } = await openV2()
    vi.setSystemTime(new Date(FRESH_UNTIL_MS + 1000))
    view.rerender(<Ui v2Binding={b.value} v2ExecutionDisplay={a.display} />)
    await settle()
    for (let i = 0; i < 5; i += 1) {
      view.rerender(<Ui v2Binding={b.value} v2ExecutionDisplay={a.display} />)
      // eslint-disable-next-line no-await-in-loop
      await settle()
    }
    expect(document.querySelector('[data-testid="confirm-modal"]')).toBeNull()
    expect(C.modalMounts).toBe(1)
    expect(C.modalUnmounts).toBe(1)
    expect(b.refreshV2Quote).toHaveBeenCalledTimes(1)
    expect(b.consume).toHaveBeenCalledTimes(0)
    expect(H().sends).toHaveLength(0)
  })

  it('E: a materially different new winner/minOut is never hot-swapped into the open modal; it needs a new review', async () => {
    const { first, view } = await openV2()
    const better = await erc20Plan({ amountOutRaw: '9990000000000000' })
    expect(better.plan.ok).toBe(true)
    const bb = bindingFor(better.plan, V2_PUBLIC_ACTION.V2_EXECUTE)
    view.rerender(<Ui v2Binding={bb.value} v2ExecutionDisplay={better.display} />)
    await settle()
    // closed once (REPLACED), never showed the new numbers inside the reviewed modal
    expect(document.querySelector('[data-testid="confirm-modal"]')).toBeNull()
    expect(C.modalMounts).toBe(1)
    expect(C.modalUnmounts).toBe(1)
    expect(bb.consume).toHaveBeenCalledTimes(0)
    // new review shows the new plan
    fireEvent.click(screen.getByTestId('cta'))
    await untilModalOpen()
    const next = snapshot()
    expect(next.text).not.toBe(first.text)
    expect(next.text).toContain((better.display as any).outputAmount.toSignificant(6))
    expect(C.modalMounts).toBe(2)
  })
})
