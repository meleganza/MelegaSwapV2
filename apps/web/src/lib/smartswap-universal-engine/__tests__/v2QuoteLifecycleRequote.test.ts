/**
 * P0 SmartSwap V2 quote lifecycle: same-request automatic re-competition at the freshness boundary.
 * Real shared SHADOW runtime (sharedShadowEntries + generation guard) + real CTA binding; only the authorized
 * competition, wallet, and swap-form state are mocked. V2 is enabled ONLY through the existing seam
 * (`bscPublicCutoverEnabled: true`); the production flag stays false.
 */
import { act, renderHook } from '@testing-library/react'
import { getAddress } from '@ethersproject/address'
import { Interface } from '@ethersproject/abi'
import { Native, Token } from '@pancakeswap/sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMelegaDexAdapter, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
import { BSC_V2_PUBLIC_CUTOVER_ENABLED } from '../operatingMode'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import type { SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition, type ShadowCandidate } from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import {
  V2_PUBLIC_ACTION,
  resetV2CtaConsumeLocksForTests,
  resetV2UserLocalNonceStateForTests,
} from '../v2UserExecutionPlan'
import { useSmartSwapV2CtaBinding } from '../../../views/Swap/SmartSwap/hooks/useSmartSwapV2CtaBinding'
import {
  resetSharedShadowRuntimeForTests,
  sharedShadowRuntimeEntryCountForTests,
} from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight'
import { resolveSmartSwapExecutionDisplay } from '../../../views/Swap/SmartSwap/utils/v2ExecutionDisplay'

type Pending = {
  request: SmartSwapRequest
  resolve: (winner: ShadowCandidate | null) => void
  reject: (error: Error) => void
}
type LifecycleState = {
  chainId: number
  user: string
  inputId: string
  outputId: string
  amountRaw: string
  allowanceRaw: string | undefined
  competitions: Pending[]
  walletSends: Array<{ to: string; data: string }>
  walletHold: Array<() => void>
  holdWallet: boolean
}
function L(): LifecycleState {
  const g = globalThis as unknown as { __qlfix?: LifecycleState }
  if (!g.__qlfix) {
    g.__qlfix = {
      chainId: 56,
      user: '0x1111111111111111111111111111111111111111',
      inputId: 'BNB',
      outputId: 'USDC',
      amountRaw: '10000000000000000',
      allowanceRaw: undefined,
      competitions: [],
      walletSends: [],
      walletHold: [],
      holdWallet: false,
    }
  }
  return g.__qlfix
}

const WBNB = getAddress('0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c')
const USDC = getAddress('0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d')
const EXECUTOR = getAddress('0x7c07082839edd5797737640bba6af47992b9861e')
const APPROVE_IFACE = new Interface(['function approve(address spender, uint256 amount)'])
const CURRENCIES: Record<string, any> = {
  BNB: Native.onChain(56),
  WBNB: new Token(56, WBNB, 18, 'WBNB'),
  USDC: new Token(56, USDC, 18, 'USDC'),
}
const T0 = Date.parse('2026-08-20T00:00:00.000Z')
const DEADLINE = 1_893_456_000
const SEAM = { deadline: DEADLINE, bscPublicCutoverEnabled: true } as const

vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
  return { ...actual, useAccount: () => ({ address: L().user }) }
})
vi.mock('hooks/useActiveChainId', () => ({ useActiveChainId: () => ({ chainId: L().chainId }) }))
vi.mock('hooks/Tokens', () => ({ useCurrency: (id?: string) => (id ? CURRENCIES[id] : undefined) }))
vi.mock('state/user/hooks', () => ({ useUserSlippageTolerance: () => [50] }))
vi.mock('state/swap/hooks', () => ({
  useSwapState: () => ({
    independentField: 'INPUT',
    typedValue: '0.01',
    recipient: null,
    INPUT: { currencyId: L().inputId },
    OUTPUT: { currencyId: L().outputId },
  }),
}))
vi.mock('views/Swap/SmartSwap/hooks/useDerivedSwapInfoWithStableSwap', () => ({
  useDerivedSwapInfoWithStableSwap: () => ({ parsedAmount: { quotient: BigInt(L().amountRaw) } }),
}))
vi.mock('hooks/useTokenAllowance', async () => {
  const { CurrencyAmount } = await import('@pancakeswap/sdk')
  return {
    default: (token?: Token) => (token && L().allowanceRaw != null ? CurrencyAmount.fromRawAmount(token, L().allowanceRaw!) : undefined),
  }
})
vi.mock('hooks/useProviderOrSigner', () => ({
  useProviderOrSigner: () => ({
    sendTransaction: async (tx: { to: string; data: string }) => {
      if (L().holdWallet) {
        await new Promise<void>((resolve) => L().walletHold.push(resolve))
      }
      L().walletSends.push({ to: tx.to, data: tx.data })
      return { hash: `0x${String(L().walletSends.length).padStart(64, '0')}` }
    },
    waitForTransaction: async () => ({ status: 1 }),
  }),
}))
vi.mock('lib/smartswap-universal-engine/authorizedShadowRun', () => ({
  runAuthorizedEvmShadowCompetition: (input: { request: SmartSwapRequest }) =>
    new Promise((resolve, reject) => {
      L().competitions.push({
        request: input.request,
        resolve: (winner) => resolve({ shadowWinner: winner }),
        reject,
      })
    }),
}))

const LEGACY_SNAPSHOT: LegacyMelegaQuoteSnapshot = {
  chainId: 56,
  input: { address: WBNB, symbol: 'WBNB', decimals: 18 },
  output: { address: USDC, symbol: 'USDC', decimals: 18 },
  inputAmountRaw: '0',
  expectedOutputRaw: '1',
  pathAddresses: [WBNB, USDC],
  freshness: '2026-08-20T00:00:00.000Z',
  slippageBps: 50,
}

/** Factual-shaped winner for `request`, quoted NOW (fake clock). */
async function winnerFor(request: SmartSwapRequest, venue: 'pancake' | 'melega', amountOutRaw: string) {
  const nowIso = new Date(Date.now()).toISOString()
  // Synthetic sources stamp a fixed instant; compete at that instant, then stamp the factual quote time = now.
  const stamp = '2026-08-20T00:00:00.000Z'
  const source = createSyntheticQuoteSource({ [`56:${WBNB.toLowerCase()}>${USDC.toLowerCase()}`]: { amountOutRaw } })
  const adapter =
    venue === 'pancake'
      ? createPancakeSwapVenueAdapter(source)
      : createMelegaDexAdapter(
          { ...LEGACY_SNAPSHOT, inputAmountRaw: request.inputAmountRaw, expectedOutputRaw: amountOutRaw, freshness: stamp },
          { quoteSource: source },
        )
  const result = await runEvmShadowCompetition({ request, productionQuote: null, adapters: [adapter], nowIso: stamp })
  const winner = result.shadowWinner!
  expect(winner.venueId).toBe(venue === 'pancake' ? 'pancakeswap' : 'melega-dex')
  return { ...winner, quote: { ...winner.quote!, quotedAt: nowIso } }
}

async function flush() {
  for (let i = 0; i < 8; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve()
  }
}

async function resolveLatest(venue: 'pancake' | 'melega', amountOutRaw: string, index = L().competitions.length - 1) {
  const pending = L().competitions[index]
  const winner = await winnerFor(pending.request, venue, amountOutRaw)
  await act(async () => {
    pending.resolve(winner)
    await flush()
  })
  return winner
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
    await flush()
  })
}

type Cta = 'V2_EXECUTE' | 'V2_PENDING' | 'LEGACY'
function ctaOf(b: ReturnType<typeof useSmartSwapV2CtaBinding>): Cta {
  // Mirrors SmartSwapCommitButton: V2 active first, then the held pending CTA, else the legacy fallback.
  if (b.decision.publicAction === V2_PUBLIC_ACTION.V2_EXECUTE && b.plan.ok) return 'V2_EXECUTE'
  if (b.v2Pending) return 'V2_PENDING'
  return 'LEGACY'
}

function mount(options: Parameters<typeof useSmartSwapV2CtaBinding>[0] = SEAM) {
  const history: Cta[] = []
  const hook = renderHook(() => {
    const binding = useSmartSwapV2CtaBinding(options)
    const display = resolveSmartSwapExecutionDisplay({
      decision: binding.decision,
      plan: binding.plan,
      v2Pending: binding.v2Pending,
      inputCurrency: CURRENCIES[L().inputId],
      outputCurrency: CURRENCIES[L().outputId],
    })
    const cta = ctaOf(binding)
    if (history[history.length - 1] !== cta) history.push(cta)
    return { binding, display, cta }
  })
  return { hook, history }
}

beforeEach(async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(T0))
  resetSharedShadowRuntimeForTests()
  resetV2UserLocalNonceStateForTests()
  resetV2CtaConsumeLocksForTests()
  const s = L()
  s.chainId = 56
  s.inputId = 'BNB'
  s.outputId = 'USDC'
  s.amountRaw = '10000000000000000'
  s.allowanceRaw = undefined
  s.competitions.length = 0
  s.walletSends.length = 0
  s.walletHold.length = 0
  s.holdWallet = false
})

afterEach(() => {
  resetV2CtaConsumeLocksForTests()
  vi.useRealTimers()
})

describe('P0 V2 quote lifecycle: same requestKey auto re-competition (seam on, production flag off)', () => {
  it('production default stays off (this suite only uses the seam)', () => {
    expect(BSC_V2_PUBLIC_CUTOVER_ENABLED).toBe(false)
  })

  it('1-6,15: gen1 ready -> expiry retires gen1 -> gen2 auto-starts for the SAME key (V2_PENDING, never LEGACY) -> new winner used; freshUntil = real quote time + 15s', async () => {
    const { hook, history } = mount()
    expect(L().competitions).toHaveLength(1)
    expect(hook.result.current.cta).toBe('V2_PENDING')
    const key = hook.result.current.binding.plan.requestKey

    // 1: generation 1 ready
    const g1 = await resolveLatest('pancake', '7760000000000000000')
    const plan1 = hook.result.current.binding.plan
    expect(hook.result.current.cta).toBe('V2_EXECUTE')
    expect(plan1.requestKey).toBe(key)
    expect(plan1.winnerQuote?.grossOutputRaw).toBe('7760000000000000000')
    const gen1 = hook.result.current.binding.shadowGeneration
    // 15: freshness is the factual quote time + 15s (no artificial extension)
    expect(plan1.freshUntilIso).toBe(new Date(Date.parse(g1.quote.quotedAt) + 15_000).toISOString())

    // 2/3/4: freshness boundary -> gen1 retired, gen2 starts automatically for the same requestKey, CTA pending
    await advance(15_001)
    expect(L().competitions).toHaveLength(2)
    expect(L().competitions[1].request.inputAmountRaw).toBe(L().competitions[0].request.inputAmountRaw)
    expect(hook.result.current.binding.shadowGeneration).toBeGreaterThan(gen1)
    expect(hook.result.current.cta).toBe('V2_PENDING')
    expect(hook.result.current.binding.plan.ok).toBe(false)
    expect(hook.result.current.display.mode).toBe('V2_PENDING')

    // 5/6: gen2 resolves with a DIFFERENT factual winner/output -> V2_EXECUTE with the NEW winner
    await advance(1_200)
    const g2 = await resolveLatest('pancake', '7810000000000000000')
    const plan2 = hook.result.current.binding.plan
    expect(hook.result.current.cta).toBe('V2_EXECUTE')
    expect(plan2.requestKey).toBe(key)
    expect(plan2).not.toBe(plan1)
    expect(plan2.winnerQuote?.grossOutputRaw).toBe('7810000000000000000')
    expect(plan2.freshUntilIso).toBe(new Date(Date.parse(g2.quote.quotedAt) + 15_000).toISOString())
    expect(Date.parse(plan2.freshUntilIso!)).toBeGreaterThan(Date.parse(plan1.freshUntilIso!))

    // No LEGACY render at any point of the refresh lifecycle.
    expect(history).toEqual(['V2_PENDING', 'V2_EXECUTE', 'V2_PENDING', 'V2_EXECUTE'])
    expect(L().walletSends).toHaveLength(0)
  })

  it('6: the refreshed generation may pick a DIFFERENT venue (Melega -> Pancake) and the NEW winner is used (WBNB -> USDC)', async () => {
    L().inputId = 'WBNB'
    L().allowanceRaw = '1000000000000000000000'
    const { hook, history } = mount()
    await resolveLatest('melega', '7900000000000000000')
    expect(hook.result.current.cta).toBe('V2_EXECUTE')
    expect(hook.result.current.binding.plan.winnerVenueId).toBe('melega-dex')
    await advance(15_001)
    expect(hook.result.current.cta).toBe('V2_PENDING')
    await resolveLatest('pancake', '7760000000000000000')
    expect(hook.result.current.cta).toBe('V2_EXECUTE')
    expect(hook.result.current.binding.plan.winnerVenueId).toBe('pancakeswap')
    expect(hook.result.current.binding.plan.binding?.intent.router).toBe(getAddress('0x10ED43C718714eb63d5aA57B78B54704E256024E'))
    expect(hook.result.current.display.mode).toBe('V2')
    expect(history).toEqual(['V2_PENDING', 'V2_EXECUTE', 'V2_PENDING', 'V2_EXECUTE'])
    expect(L().walletSends).toHaveLength(0)
  })

  it('4 cycles in a row keep refreshing the same request without LEGACY and with one competition per expiry', async () => {
    const { hook, history } = mount()
    for (let cycle = 0; cycle < 4; cycle += 1) {
      // eslint-disable-next-line no-await-in-loop
      await resolveLatest('pancake', `${7_700 + cycle}000000000000000`)
      expect(hook.result.current.cta).toBe('V2_EXECUTE')
      // eslint-disable-next-line no-await-in-loop
      await advance(15_001)
      expect(L().competitions).toHaveLength(cycle + 2)
      expect(hook.result.current.cta).toBe('V2_PENDING')
    }
    expect(history.includes('LEGACY')).toBe(false)
    expect(new Set(L().competitions.map((c) => c.request.inputAmountRaw)).size).toBe(1)
  })

  it('7: a late superseded generation result cannot overwrite the newest generation', async () => {
    const { hook } = mount()
    // gen1 hangs past the 8s preflight timeout -> unavailable (pre-submission fallback)
    await advance(8_001)
    expect(hook.result.current.binding.plan.ok).toBe(false)
    // user-requested refresh -> gen2
    act(() => {
      expect(hook.result.current.binding.refreshV2Quote()).toBe(true)
    })
    expect(L().competitions).toHaveLength(2)
    await resolveLatest('pancake', '7760000000000000000', 1)
    expect(hook.result.current.binding.plan.winnerQuote?.grossOutputRaw).toBe('7760000000000000000')
    // the hung gen1 now resolves late with a different output: ignored
    await resolveLatest('pancake', '1980000000000000000', 0)
    expect(hook.result.current.cta).toBe('V2_EXECUTE')
    expect(hook.result.current.binding.plan.winnerQuote?.grossOutputRaw).toBe('7760000000000000000')
  })

  it('8: no duplicate concurrent competition for the same requestKey (two consumers, repeated refresh, expiry during refresh)', async () => {
    const a = mount()
    const b = mount()
    expect(L().competitions).toHaveLength(1)
    await resolveLatest('pancake', '7760000000000000000')
    act(() => {
      expect(a.hook.result.current.binding.refreshV2Quote()).toBe(true)
      expect(a.hook.result.current.binding.refreshV2Quote()).toBe(false)
      expect(b.hook.result.current.binding.refreshV2Quote()).toBe(false)
    })
    await advance(5_000)
    act(() => {
      expect(a.hook.result.current.binding.refreshV2Quote()).toBe(false)
    })
    expect(L().competitions).toHaveLength(2)
    expect(a.hook.result.current.cta).toBe('V2_PENDING')
    expect(b.hook.result.current.cta).toBe('V2_PENDING')
  })

  it('9: manual Refresh price while fresh starts a new factual competition for the same key, no wallet prompt', async () => {
    const { hook, history } = mount()
    await resolveLatest('pancake', '7760000000000000000')
    const gen = hook.result.current.binding.shadowGeneration
    const key = hook.result.current.binding.plan.requestKey
    await advance(3_000)
    act(() => {
      expect(hook.result.current.binding.refreshV2Quote()).toBe(true)
    })
    expect(L().competitions).toHaveLength(2)
    expect(hook.result.current.cta).toBe('V2_PENDING')
    await resolveLatest('pancake', '7770000000000000000')
    expect(hook.result.current.cta).toBe('V2_EXECUTE')
    expect(hook.result.current.binding.shadowGeneration).toBeGreaterThan(gen)
    expect(hook.result.current.binding.plan.requestKey).toBe(key)
    expect(hook.result.current.binding.plan.winnerQuote?.grossOutputRaw).toBe('7770000000000000000')
    expect(history.includes('LEGACY')).toBe(false)
    expect(L().walletSends).toHaveLength(0)
  })

  it('10/11: amount change -> normal new requestKey; returning to an old amount starts fresh (no expired cache resurrection); cache bounded', async () => {
    const { hook } = mount()
    await resolveLatest('pancake', '7760000000000000000')
    const keyA = hook.result.current.binding.plan.requestKey
    L().amountRaw = '20000000000000000'
    hook.rerender()
    await act(async () => {
      await flush()
    })
    expect(L().competitions).toHaveLength(2)
    expect(hook.result.current.binding.plan.requestKey).not.toBe(keyA)
    expect(hook.result.current.cta).toBe('V2_PENDING')
    await resolveLatest('pancake', '15500000000000000000')
    expect(sharedShadowRuntimeEntryCountForTests()).toBe(1)

    await advance(20_000) // amount A's old quote is long expired
    L().amountRaw = '10000000000000000'
    hook.rerender()
    await act(async () => {
      await flush()
    })
    expect(hook.result.current.binding.plan.requestKey).toBe(keyA)
    expect(hook.result.current.cta).toBe('V2_PENDING')
    expect(hook.result.current.binding.plan.ok).toBe(false)
    expect(L().competitions.length).toBeGreaterThanOrEqual(3)
    expect(L().competitions[L().competitions.length - 1].request.inputAmountRaw).toBe('10000000000000000')
    expect(sharedShadowRuntimeEntryCountForTests()).toBe(1)
  })

  it('12: an automatic refresh that times out surfaces the existing fallback once; no loop, no RPC hammering; manual retry allowed', async () => {
    const { hook } = mount()
    await resolveLatest('pancake', '7760000000000000000')
    await advance(15_001)
    expect(L().competitions).toHaveLength(2)
    await advance(8_001) // gen2 preflight timeout
    expect(hook.result.current.binding.plan.ok).toBe(false)
    expect(hook.result.current.cta).toBe('LEGACY')
    await advance(120_000)
    expect(L().competitions).toHaveLength(2)
    act(() => {
      expect(hook.result.current.binding.refreshV2Quote()).toBe(true)
    })
    expect(L().competitions).toHaveLength(3)
    expect(hook.result.current.cta).toBe('V2_PENDING')
  })

  it('13: unmount ignores an obsolete result and evicts the entry; a remount starts a fresh competition', async () => {
    const { hook } = mount()
    const pending = L().competitions[0]
    hook.unmount()
    await act(async () => {
      await flush()
    })
    expect(sharedShadowRuntimeEntryCountForTests()).toBe(0)
    const late = await winnerFor(pending.request, 'pancake', '1000')
    await act(async () => {
      pending.resolve(late)
      await flush()
    })
    const again = mount()
    expect(L().competitions).toHaveLength(2)
    expect(again.hook.result.current.cta).toBe('V2_PENDING')
    expect(again.hook.result.current.binding.plan.ok).toBe(false)
    // Refresh after unmount is a no-op.
    const unmounted = hook.result.current.binding
    expect(unmounted.refreshV2Quote()).toBe(false)
  })

  it('14: while a V2 consume is in flight, expiry never re-quotes under the latch; refresh happens only after release', async () => {
    const { hook, history } = mount()
    await resolveLatest('pancake', '7760000000000000000')
    const latched = hook.result.current.binding.plan
    L().holdWallet = true
    let consume: Promise<string> | undefined
    act(() => {
      consume = hook.result.current.binding.consumeIfGated()
    })
    await advance(20_000)
    expect(L().competitions).toHaveLength(1)
    act(() => {
      expect(hook.result.current.binding.refreshV2Quote()).toBe(false)
    })
    const during = hook.result.current.binding.plan
    expect(during).toBe(latched)
    expect(during.nonce).toBe(latched.nonce)
    expect(during.binding?.intent.router).toBe(latched.binding?.intent.router)
    expect(during.binding?.intent.minUserOut).toBe(latched.binding?.intent.minUserOut)
    expect(during.preparation?.swapTransaction.data).toBe(latched.preparation?.swapTransaction.data)
    expect(hook.result.current.cta).toBe('V2_EXECUTE')
    await act(async () => {
      L().walletHold.forEach((release) => release())
      await consume
      await flush()
    })
    expect(L().walletSends).toHaveLength(1)
    expect(L().walletSends[0].to).toBe(EXECUTOR)
    expect(L().competitions).toHaveLength(2)
    expect(hook.result.current.cta).toBe('V2_PENDING')
    expect(history.includes('LEGACY')).toBe(false)
  })

  it('stale tx safety: an expired plan is never submitted (fail-closed), a refresh is requested instead', async () => {
    const { hook } = mount()
    await resolveLatest('pancake', '7760000000000000000')
    const stalePlan = hook.result.current.binding
    vi.setSystemTime(new Date(Date.now() + 16_000)) // clock passes freshUntil before the retire timer runs
    await act(async () => {
      await expect(stalePlan.consumeIfGated()).rejects.toThrow('V2_CTA_PLAN_STALE')
      await flush()
    })
    expect(L().walletSends).toHaveLength(0)
    expect(L().competitions).toHaveLength(2)
  })

  it('ERC20 -> BNB: refresh cycles are read-only (no approval request); approval spender stays the Executor only', async () => {
    L().inputId = 'USDC'
    L().outputId = 'BNB'
    L().allowanceRaw = '0'
    L().amountRaw = '7760000000000000000'
    const { hook, history } = mount()
    const pending = L().competitions[0]
    const nowIso = new Date(Date.now()).toISOString()
    const source = createSyntheticQuoteSource({
      [`56:${USDC.toLowerCase()}>${WBNB.toLowerCase()}`]: { amountOutRaw: '9900000000000000' },
    })
    const result = await runEvmShadowCompetition({
      request: pending.request,
      productionQuote: null,
      adapters: [createPancakeSwapVenueAdapter(source)],
      nowIso: '2026-08-20T00:00:00.000Z',
    })
    const winner = { ...result.shadowWinner!, quote: { ...result.shadowWinner!.quote!, quotedAt: nowIso } }
    await act(async () => {
      pending.resolve(winner)
      await flush()
    })
    expect(hook.result.current.cta).toBe('V2_EXECUTE')
    const plan = hook.result.current.binding.plan
    expect(plan.approvalSpender).toBe(EXECUTOR)
    for (const tx of plan.preparation!.approvalTransactions) {
      expect(getAddress(APPROVE_IFACE.decodeFunctionData('approve', tx.data).spender)).toBe(EXECUTOR)
    }
    await advance(15_001)
    expect(L().competitions).toHaveLength(2)
    expect(hook.result.current.cta).toBe('V2_PENDING')
    act(() => {
      hook.result.current.binding.refreshV2Quote()
    })
    expect(L().walletSends).toHaveLength(0)
    expect(history.includes('LEGACY')).toBe(false)
  })

  it('plan re-derived past freshness before the expiry timer (allowance re-read) -> same single refresh, V2_PENDING, never LEGACY', async () => {
    // Browser-observed race (ERC20, mobile): the allowance re-read rebuilt the plan as QUOTE_EXPIRED just before the timer.
    L().inputId = 'USDC'
    L().outputId = 'BNB'
    L().allowanceRaw = '0'
    L().amountRaw = '7760000000000000000'
    const { hook, history } = mount()
    const first = L().competitions[0]
    const source = createSyntheticQuoteSource({
      [`56:${USDC.toLowerCase()}>${WBNB.toLowerCase()}`]: { amountOutRaw: '9900000000000000' },
    })
    const compete = async (request: SmartSwapRequest) => {
      const result = await runEvmShadowCompetition({
        request,
        productionQuote: null,
        adapters: [createPancakeSwapVenueAdapter(source)],
        nowIso: '2026-08-20T00:00:00.000Z',
      })
      return { ...result.shadowWinner!, quote: { ...result.shadowWinner!.quote!, quotedAt: new Date(Date.now()).toISOString() } }
    }
    const w1 = await compete(first.request)
    await act(async () => {
      first.resolve(w1)
      await flush()
    })
    expect(hook.result.current.cta).toBe('V2_EXECUTE')
    // Clock passes the boundary WITHOUT the timer firing, then a re-render re-derives the plan.
    vi.setSystemTime(new Date(Date.parse(hook.result.current.binding.plan.freshUntilIso!) + 50))
    L().allowanceRaw = '1'
    await act(async () => {
      hook.rerender()
      await flush()
    })
    expect(L().competitions).toHaveLength(2)
    expect(hook.result.current.cta).toBe('V2_PENDING')
    expect(hook.result.current.display.mode).toBe('V2_PENDING')
    // The original timer firing afterwards does not start a duplicate competition.
    await advance(1_000)
    expect(L().competitions).toHaveLength(2)
    const w2 = await compete(L().competitions[1].request)
    await act(async () => {
      L().competitions[1].resolve(w2)
      await flush()
    })
    expect(hook.result.current.cta).toBe('V2_EXECUTE')
    expect(hook.result.current.binding.plan.freshUntilIso).toBe(new Date(Date.parse(w2.quote.quotedAt) + 15_000).toISOString())
    expect(history).toEqual(['V2_PENDING', 'V2_EXECUTE', 'V2_PENDING', 'V2_EXECUTE'])
    expect(L().walletSends).toHaveLength(0)
  })

  it('production default (no seam): BSC stays LEGACY, expiry never auto-refreshes, manual refresh is a no-op', async () => {
    const { hook, history } = mount({ deadline: DEADLINE })
    await resolveLatest('pancake', '7760000000000000000')
    expect(hook.result.current.cta).toBe('LEGACY')
    expect(hook.result.current.binding.v2Pending).toBe(false)
    expect(hook.result.current.display.mode).toBe('LEGACY')
    await advance(60_000)
    act(() => {
      expect(hook.result.current.binding.refreshV2Quote()).toBe(false)
    })
    expect(L().competitions).toHaveLength(1)
    expect(history).toEqual(['LEGACY'])
    expect(L().walletSends).toHaveLength(0)
  })

  it('Ethereum stays LEGACY even with the seam: no pending, no auto refresh, no V2 display', async () => {
    L().chainId = 1
    const { hook, history } = mount()
    expect(hook.result.current.binding.cutoverAllowed).toBe(false)
    expect(hook.result.current.binding.v2Pending).toBe(false)
    expect(hook.result.current.display.mode).toBe('LEGACY')
    act(() => {
      expect(hook.result.current.binding.refreshV2Quote()).toBe(false)
    })
    await advance(60_000)
    expect(history).toEqual(['LEGACY'])
    expect(L().walletSends).toHaveLength(0)
  })
})
