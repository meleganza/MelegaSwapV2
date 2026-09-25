import { readFileSync } from 'fs'
import path from 'path'
import { act, renderHook } from '@testing-library/react'
import { Token } from '@pancakeswap/sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { createMelegaDexAdapter, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from '../operatingMode'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import type { SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition, type ShadowCandidate } from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import { V2_EXECUTOR_CONFIG_STATUS, type V2ExecutorConfigTable } from '../v2ExecutionRuntimeConfig'
import {
  V2_PLAN_REASON,
  V2_PUBLIC_ACTION,
  V2_TEST_ONLY_CTA_EXECUTION_GATE,
  V2_USER_LOCAL_NONCE_SOURCE,
  allocateV2UserPlanNonce,
  createV2UserLocalNonceClock,
  createV2UserWalletTransactionAdapter,
  currentRequestKeyOf,
  resetV2CtaConsumeLocksForTests,
  resetV2UserLocalNonceStateForTests,
  resolveSmartSwapCtaDecision,
  selectSmartSwapCtaExecution,
  shouldReadV2ExecutorAllowance,
  type V2ShadowRuntimeFacts,
} from '../v2UserExecutionPlan'
import {
  bindSmartSwapV2CtaRuntimePlan,
  runExclusiveCtaConsume,
  useSmartSwapV2CtaBinding,
} from '../../../views/Swap/SmartSwap/hooks/useSmartSwapV2CtaBinding'
import { buildShadowRuntimeRequest } from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight'
import { releaseNextWalletSend, resetRuntimeMocks, runtimeMocks } from './v2CtaRuntimeBinding.mocks'

const WEB = path.resolve(__dirname, '../../../..')
const HOOK = path.join(WEB, 'src/views/Swap/SmartSwap/hooks/useSmartSwapV2CtaBinding.ts')
const NOW = '2026-08-20T00:00:05.000Z'
const GROSS_INPUT = '1000000'
const USER = '0x1111111111111111111111111111111111111111'
const EXECUTOR = '0x3333333333333333333333333333333333333333'
const DEADLINE = 1_893_456_000
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_BSC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC_ETH = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const WBNB_CHECKSUM = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const USDC_BSC_CHECKSUM = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const WETH_CHECKSUM = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const USDC_ETH_CHECKSUM = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

const LEGACY: LegacyMelegaQuoteSnapshot = {
  chainId: 56,
  input: { address: WBNB_CHECKSUM, symbol: 'WBNB', decimals: 18 },
  output: { address: USDC_BSC_CHECKSUM, symbol: 'USDC', decimals: 18 },
  inputAmountRaw: GROSS_INPUT,
  expectedOutputRaw: '600000',
  pathAddresses: [WBNB_CHECKSUM, USDC_BSC_CHECKSUM],
  freshness: NOW,
  slippageBps: 50,
}

vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
  const { runtimeMocks: mocks } = await import('./v2CtaRuntimeBinding.mocks')
  return {
    ...actual,
    useAccount: () => ({ address: mocks.user }),
  }
})

vi.mock('hooks/useActiveChainId', async () => {
  const actual = await vi.importActual<typeof import('hooks/useActiveChainId')>('hooks/useActiveChainId')
  const { runtimeMocks: mocks } = await import('./v2CtaRuntimeBinding.mocks')
  return {
    ...actual,
    useActiveChainId: () => ({ chainId: mocks.walletChainId }),
  }
})

vi.mock('hooks/useTokenAllowance', async () => {
  const { CurrencyAmount } = await import('@pancakeswap/sdk')
  const { runtimeMocks: mocks } = await import('./v2CtaRuntimeBinding.mocks')
  return {
    default: (token?: Token) => {
      if (!token || mocks.allowanceRaw == null) return undefined
      return CurrencyAmount.fromRawAmount(token, mocks.allowanceRaw)
    },
  }
})

vi.mock('hooks/useProviderOrSigner', async () => {
  const { runtimeMocks: mocks } = await import('./v2CtaRuntimeBinding.mocks')
  return {
    useProviderOrSigner: () => ({
      sendTransaction: async (tx: { to: string; data: string }) => {
        if (mocks.walletShouldReject) throw new Error('Transaction rejected.')
        if (mocks.walletHoldNext) {
          return new Promise<{ hash: string }>((resolve, reject) => {
            mocks.walletDeferred.push({ tx, resolve, reject })
          })
        }
        mocks.walletSends.push({ to: tx.to, data: tx.data })
        if (mocks.walletExecuteFails && mocks.walletSends.length > 0 && tx.to === mocks.executor) {
          throw new Error('execute reverted')
        }
        return { hash: `0x${String(mocks.walletSends.length).padStart(64, '0')}` }
      },
      waitForTransaction: async () => ({ status: 1 }),
    }),
  }
})

vi.mock('views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight', async () => {
  const actual = await vi.importActual<
    typeof import('../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight')
  >('views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight')
  const { runtimeMocks: mocks } = await import('./v2CtaRuntimeBinding.mocks')
  return {
    ...actual,
    useSmartSwapShadowRuntimeFacts: () => mocks.runtime,
    useShadowRuntimePreflight: () => mocks.runtime.shadow,
  }
})

function testExecutorTable(chainId: number, executor = EXECUTOR): V2ExecutorConfigTable {
  return {
    [chainId]: {
      status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
      enabled: true,
      executorAddress: executor,
    },
  }
}

function bscFormRequest(amount = GROSS_INPUT, slippageBps = 50) {
  return buildShadowRuntimeRequest({
    chainId: 56,
    inputCurrency: {
      isNative: false,
      address: WBNB_CHECKSUM,
      decimals: 18,
      symbol: 'WBNB',
      chainId: 56,
    },
    outputCurrency: {
      isNative: false,
      address: USDC_BSC_CHECKSUM,
      decimals: 18,
      symbol: 'USDC',
      chainId: 56,
    },
    inputAmountRaw: amount,
    exactOut: false,
    slippageBps,
  })
}

function bscNativeFormRequest() {
  return buildShadowRuntimeRequest({
    chainId: 56,
    inputCurrency: { isNative: true, decimals: 18, symbol: 'BNB', chainId: 56 },
    outputCurrency: {
      isNative: false,
      address: USDC_BSC_CHECKSUM,
      decimals: 18,
      symbol: 'USDC',
      chainId: 56,
    },
    inputAmountRaw: GROSS_INPUT,
    exactOut: false,
    slippageBps: 50,
  })
}

function ethFormRequest() {
  return buildShadowRuntimeRequest({
    chainId: 1,
    inputCurrency: {
      isNative: false,
      address: WETH_CHECKSUM,
      decimals: 18,
      symbol: 'WETH',
      chainId: 1,
    },
    outputCurrency: {
      isNative: false,
      address: USDC_ETH_CHECKSUM,
      decimals: 6,
      symbol: 'USDC',
      chainId: 1,
    },
    inputAmountRaw: GROSS_INPUT,
    exactOut: false,
    slippageBps: 50,
  })
}

function readyShadow(request: SmartSwapRequest, winner: ShadowCandidate): V2ShadowRuntimeFacts {
  return {
    status: 'ready',
    requestKey: currentRequestKeyOf(request),
    winner,
    v2Available: true,
  }
}

async function melegaWinner(request: SmartSwapRequest) {
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [
      createMelegaDexAdapter(
        { ...LEGACY, inputAmountRaw: request.inputAmountRaw },
        { quoteSource: createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '580000' } }) },
      ),
    ],
    nowIso: NOW,
  })
  expect(result.shadowWinner?.venueId).toBe('melega-dex')
  return result.shadowWinner!
}

async function pancakeWinner(request: SmartSwapRequest) {
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [
      createPancakeSwapVenueAdapter(
        createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '500000' } }),
      ),
    ],
    nowIso: NOW,
  })
  expect(result.shadowWinner?.venueId).toBe('pancakeswap')
  return result.shadowWinner!
}

async function uniswapWinner(request: SmartSwapRequest) {
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [
      createUniswapVenueAdapter(createSyntheticQuoteSource({ [`1:${WETH}>${USDC_ETH}`]: { amountOutRaw: '400000' } })),
    ],
    nowIso: NOW,
  })
  expect(result.shadowWinner?.venueId).toBe('uniswap')
  return result.shadowWinner!
}

function runtimePlan(
  request: SmartSwapRequest,
  requestKey: string | null,
  winner: ShadowCandidate,
  extra: Partial<Parameters<typeof bindSmartSwapV2CtaRuntimePlan>[0]> = {},
) {
  const nativeIn = request.inputAsset.location.kind === 'native'
  return bindSmartSwapV2CtaRuntimePlan({
    user: USER,
    walletChainId: request.network.domain === 'EVM' ? request.network.chainId : 0,
    request,
    requestKey,
    shadow: readyShadow(request, winner),
    observedAllowance: nativeIn
      ? undefined
      : {
          chainId: request.network.domain === 'EVM' ? request.network.chainId : 0,
          token:
            request.network.domain === 'EVM' && request.network.chainId === 1 ? WETH_CHECKSUM : WBNB_CHECKSUM,
          owner: USER,
          spender: EXECUTOR,
          amountRaw: GROSS_INPUT,
        },
    allowanceReadStatus: nativeIn ? 'native' : 'ok',
    nowIso: NOW,
    deadline: DEADLINE,
    executorConfigByChain: testExecutorTable(request.network.domain === 'EVM' ? request.network.chainId : 0),
    ...extra,
  })
}

beforeEach(() => {
  resetV2UserLocalNonceStateForTests()
  resetV2CtaConsumeLocksForTests()
  resetRuntimeMocks()
})

afterEach(() => {
  resetV2CtaConsumeLocksForTests()
})

describe('real-runtime SmartSwap V2 CTA binding', () => {
  it('fails on reviewed HEAD because the hook no longer binds null request/shadow', () => {
    const src = readFileSync(HOOK, 'utf8')
    expect(src).toContain('useSmartSwapShadowRuntimeFacts')
    expect(src).toContain('bindSmartSwapV2CtaRuntimePlan')
    expect(src).toContain('createV2UserWalletTransactionAdapter')
    expect(src).toContain('runExclusiveCtaConsume')
    expect(src).toContain('slot.current === captured.promise')
    expect(src).not.toMatch(/request:\s*null/)
    expect(src).not.toMatch(/requestKey:\s*null/)
    expect(src).not.toMatch(/shadow:\s*null/)
    expect(src).not.toContain('runAuthorizedEvmShadowCompetition')
    expect(src).not.toContain('runShadowRuntimePreflightAttempt')
    expect(src).not.toContain('useSigner')
    expect(src).not.toContain('sendTransaction')
    expect(src).not.toMatch(/process\.env/)
    expect(V2_TEST_ONLY_CTA_EXECUTION_GATE).toBe(false)
  })

  it('1: #82 BSC request + actual Melega shadow winner produces a ready plan through the hook binder', async () => {
    const built = bscFormRequest()
    expect(built.request).not.toBeNull()
    const plan = runtimePlan(built.request!, built.requestKey, await melegaWinner(built.request!))
    expect(plan.ok).toBe(true)
    expect(plan.winnerVenueId).toBe('melega-dex')
    expect(plan.requestKey).toBe(built.requestKey)
    expect(plan.nonceSource).toBe(V2_USER_LOCAL_NONCE_SOURCE)
  })

  it('2: #82 BSC request + actual Pancake shadow winner produces a ready plan through the hook binder', async () => {
    const built = bscFormRequest()
    const plan = runtimePlan(built.request!, built.requestKey, await pancakeWinner(built.request!))
    expect(plan.ok).toBe(true)
    expect(plan.winnerVenueId).toBe('pancakeswap')
  })

  it('3: #82 ETH request + actual Uniswap shadow winner produces a ready plan through the hook binder', async () => {
    const built = ethFormRequest()
    const plan = runtimePlan(built.request!, built.requestKey, await uniswapWinner(built.request!))
    expect(plan.ok).toBe(true)
    expect(plan.winnerVenueId).toBe('uniswap')
    expect(plan.preparation?.swapTransaction.chainId).toBe(1)
  })

  it('integration hook: mocked #82 facts produce a ready plan and would fail when request/shadow stay null', async () => {
    const built = bscFormRequest()
    const winner = await melegaWinner(built.request!)
    runtimeMocks.runtime = {
      request: built.request,
      requestKey: built.requestKey,
      shadow: readyShadow(built.request!, winner),
    }

    const missing = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    expect(missing.result.current.plan.ok).toBe(true)
    expect(missing.result.current.plan.winnerVenueId).toBe('melega-dex')
    expect(missing.result.current.plan.requestKey).toBe(built.requestKey)
    expect(missing.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)

    runtimeMocks.runtime = { request: null, requestKey: null, shadow: null }
    const nullFacts = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    expect(nullFacts.result.current.plan.ok).toBe(false)
    expect(nullFacts.result.current.plan.reason).toBe(V2_PLAN_REASON.REQUEST_MISMATCH)
  })

  it('4: changing token/input/slippage invalidates the previous plan identity', async () => {
    const first = bscFormRequest('1000000', 50)
    const nextAmount = bscFormRequest('2000000', 50)
    const nextSlippage = bscFormRequest('1000000', 100)
    expect(first.requestKey).not.toBe(nextAmount.requestKey)
    expect(first.requestKey).not.toBe(nextSlippage.requestKey)
    const winner = await pancakeWinner(first.request!)
    const staleOnNewAmount = runtimePlan(nextAmount.request!, nextAmount.requestKey, winner)
    expect(staleOnNewAmount.ok).toBe(false)
  })

  it('5: stale shadow cannot execute', async () => {
    const built = bscFormRequest()
    const winner = await pancakeWinner(built.request!)
    const plan = runtimePlan(built.request!, built.requestKey, { ...winner, status: 'stale' })
    expect(plan.ok).toBe(false)
    expect(plan.reason).toBe(V2_PLAN_REASON.SHADOW_STALE)
  })

  it('6: wrong wallet chain cannot execute', async () => {
    const built = bscFormRequest()
    const plan = runtimePlan(built.request!, built.requestKey, await pancakeWinner(built.request!), {
      walletChainId: 1,
      executorConfigByChain: { ...testExecutorTable(56), ...testExecutorTable(1) },
    })
    expect(plan.ok).toBe(false)
    expect(plan.reason).toBe(V2_PLAN_REASON.CHAIN_MISMATCH)
  })

  it('7/9: ERC20 allowance is user->Executor; native skips the read', async () => {
    const erc20 = bscFormRequest()
    const native = bscNativeFormRequest()
    expect(
      shouldReadV2ExecutorAllowance({
        config: {
          status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
          enabled: true,
          executorAddress: EXECUTOR,
        },
        request: erc20.request,
        requestKey: erc20.requestKey,
        shadow: readyShadow(erc20.request!, await pancakeWinner(erc20.request!)),
        user: USER,
        walletChainId: 56,
      }),
    ).toBe(true)
    expect(
      shouldReadV2ExecutorAllowance({
        config: {
          status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
          enabled: true,
          executorAddress: EXECUTOR,
        },
        request: native.request,
        requestKey: native.requestKey,
        shadow: readyShadow(native.request!, await pancakeWinner(native.request!)),
        user: USER,
        walletChainId: 56,
      }),
    ).toBe(false)
    const nativePlan = runtimePlan(native.request!, native.requestKey, await pancakeWinner(native.request!))
    expect(nativePlan.ok).toBe(true)
    expect(nativePlan.approvalSpender).toBeNull()
    expect(nativePlan.preparation?.approvalTransactions).toEqual([])
  })

  it('8: missing executor config does not authorize an allowance read and stays legacy', async () => {
    const built = bscFormRequest()
    expect(
      shouldReadV2ExecutorAllowance({
        config: { status: V2_EXECUTOR_CONFIG_STATUS.NOT_CONFIGURED, enabled: false, executorAddress: null },
        request: built.request,
        requestKey: built.requestKey,
        shadow: readyShadow(built.request!, await melegaWinner(built.request!)),
        user: USER,
        walletChainId: 56,
      }),
    ).toBe(false)
    // BSC is enabled after cutover; the disabled (rollback) row keeps the fail-closed assertion.
    const production = bindSmartSwapV2CtaRuntimePlan({
      user: USER,
      walletChainId: 56,
      request: built.request,
      requestKey: built.requestKey,
      shadow: readyShadow(built.request!, await melegaWinner(built.request!)),
      allowanceReadStatus: 'unread',
      nowIso: NOW,
      deadline: DEADLINE,
      executorConfigByChain: {
        56: { status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED, enabled: false, executorAddress: EXECUTOR },
      },
    })
    expect(production.ok).toBe(false)
    expect(production.reason).toBe(V2_PLAN_REASON.EXECUTOR_NOT_CONFIGURED)
    const selected = selectSmartSwapCtaExecution({
      decision: resolveSmartSwapCtaDecision({
        planOk: production.ok,
        cutoverAllowed: false,
        testOnlyExecutionGate: false,
        planReason: production.reason,
      }),
      plan: production,
      legacyCallback: async () => 'legacy-hash',
      consumeV2: async () => 'v2-hash',
    })
    expect(selected.kind).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(await selected.run?.()).toBe('legacy-hash')
  })

  it('10/11: production CTA stays legacy; injected test gate consumes the runtime plan via the wallet adapter', async () => {
    const built = bscFormRequest()
    const winner = await pancakeWinner(built.request!)
    runtimeMocks.runtime = {
      request: built.request,
      requestKey: built.requestKey,
      shadow: readyShadow(built.request!, winner),
    }
    const production = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    expect(V2_TEST_ONLY_CTA_EXECUTION_GATE).toBe(false)
    expect(production.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    await expect(production.result.current.consumeIfGated()).rejects.toThrow('V2_CTA_GATE_DISABLED')
    expect(runtimeMocks.walletSends).toHaveLength(0)

    const gated = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        testOnlyExecutionGate: true,
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    expect(gated.result.current.plan.ok).toBe(true)
    expect(gated.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    let hash = ''
    await act(async () => {
      hash = await gated.result.current.consumeIfGated()
    })
    expect(hash).toMatch(/^0x0+1$/)
    expect(runtimeMocks.walletSends).toHaveLength(1)
    expect(runtimeMocks.walletSends[0].to).toBe(EXECUTOR)
  })

  it('12/13/14: approval then execute; reject/fail never falls back to legacy', async () => {
    const built = bscFormRequest()
    const winner = await pancakeWinner(built.request!)
    runtimeMocks.allowanceRaw = '0'
    runtimeMocks.runtime = {
      request: built.request,
      requestKey: built.requestKey,
      shadow: readyShadow(built.request!, winner),
    }
    const gated = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        testOnlyExecutionGate: true,
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    expect(gated.result.current.plan.preparation?.approvalTransactions.length).toBeGreaterThan(0)
    let hash = ''
    await act(async () => {
      hash = await gated.result.current.consumeIfGated()
    })
    expect(runtimeMocks.walletSends[0].to).toBe(WBNB_CHECKSUM)
    expect(runtimeMocks.walletSends[runtimeMocks.walletSends.length - 1].to).toBe(EXECUTOR)
    expect(hash).toBeTruthy()

    resetV2CtaConsumeLocksForTests()
    runtimeMocks.walletSends.length = 0
    runtimeMocks.walletShouldReject = true
    runtimeMocks.allowanceRaw = '0'
    const rejected = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        testOnlyExecutionGate: true,
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    let legacyCalls = 0
    const selectedReject = selectSmartSwapCtaExecution({
      decision: rejected.result.current.decision,
      plan: rejected.result.current.plan,
      legacyCallback: async () => {
        legacyCalls += 1
        return 'legacy-hash'
      },
      consumeV2: rejected.result.current.consumeIfGated,
    })
    await expect(selectedReject.run?.()).rejects.toThrow(/V2_APPROVAL_REJECTED/)
    expect(legacyCalls).toBe(0)

    resetV2CtaConsumeLocksForTests()
    runtimeMocks.walletShouldReject = false
    runtimeMocks.walletExecuteFails = true
    runtimeMocks.allowanceRaw = GROSS_INPUT
    const failed = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        testOnlyExecutionGate: true,
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    const selectedFail = selectSmartSwapCtaExecution({
      decision: failed.result.current.decision,
      plan: failed.result.current.plan,
      legacyCallback: async () => {
        legacyCalls += 1
        return 'legacy-hash'
      },
      consumeV2: failed.result.current.consumeIfGated,
    })
    await expect(selectedFail.run?.()).rejects.toThrow(/V2_EXECUTE_FAILED/)
    expect(legacyCalls).toBe(0)
  })

  it('15/16: Team/Treasury are never signer/spender and production modes stay unchanged', async () => {
    const built = bscFormRequest()
    const plan = runtimePlan(built.request!, built.requestKey, await melegaWinner(built.request!))
    expect(plan.teamIsSigner).toBe(false)
    expect(plan.teamIsSpender).toBe(false)
    expect(plan.treasuryIsSigner).toBe(false)
    expect(plan.treasuryIsSpender).toBe(false)
    expect(plan.preparation?.swapTransaction.to).not.toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(isProductionCutoverAllowed()).toBe(false)
  })

  it('A: double-click while pending submits once and both callers share the result', async () => {
    const built = bscFormRequest()
    runtimeMocks.runtime = {
      request: built.request,
      requestKey: built.requestKey,
      shadow: readyShadow(built.request!, await pancakeWinner(built.request!)),
    }
    runtimeMocks.walletHoldNext = true
    const gated = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        testOnlyExecutionGate: true,
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    let first: Promise<string> | undefined
    let second: Promise<string> | undefined
    act(() => {
      first = gated.result.current.consumeIfGated()
      second = gated.result.current.consumeIfGated()
    })
    expect(first).toBe(second)
    expect(runtimeMocks.walletDeferred).toHaveLength(1)
    expect(runtimeMocks.walletSends).toHaveLength(0)
    let hash = ''
    await act(async () => {
      releaseNextWalletSend()
      hash = await first!
    })
    expect(await second).toBe(hash)
    expect(runtimeMocks.walletSends).toHaveLength(1)
  })

  it('B: after successful completion a later CTA can execute a NEW plan', async () => {
    const firstBuilt = bscFormRequest(GROSS_INPUT, 50)
    const nextBuilt = bscFormRequest(GROSS_INPUT, 100)
    runtimeMocks.runtime = {
      request: firstBuilt.request,
      requestKey: firstBuilt.requestKey,
      shadow: readyShadow(firstBuilt.request!, await pancakeWinner(firstBuilt.request!)),
    }
    const gated = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        testOnlyExecutionGate: true,
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    let firstHash = ''
    await act(async () => {
      firstHash = await gated.result.current.consumeIfGated()
    })
    expect(firstHash).toMatch(/^0x0+1$/)
    expect(runtimeMocks.walletSends).toHaveLength(1)

    runtimeMocks.runtime = {
      request: nextBuilt.request,
      requestKey: nextBuilt.requestKey,
      shadow: readyShadow(nextBuilt.request!, await pancakeWinner(nextBuilt.request!)),
    }
    gated.rerender()
    expect(gated.result.current.plan.requestKey).toBe(nextBuilt.requestKey)
    let secondHash = ''
    await act(async () => {
      secondHash = await gated.result.current.consumeIfGated()
    })
    expect(secondHash).not.toBe(firstHash)
    expect(secondHash).toMatch(/^0x[0-9a-f]+$/)
    expect(runtimeMocks.walletSends).toHaveLength(2)
  })

  it('C: after failed consumption a later CTA can execute a NEW plan with no legacy fallback', async () => {
    const firstBuilt = bscFormRequest(GROSS_INPUT, 50)
    const nextBuilt = bscFormRequest(GROSS_INPUT, 100)
    runtimeMocks.runtime = {
      request: firstBuilt.request,
      requestKey: firstBuilt.requestKey,
      shadow: readyShadow(firstBuilt.request!, await pancakeWinner(firstBuilt.request!)),
    }
    runtimeMocks.walletShouldReject = true
    const gated = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        testOnlyExecutionGate: true,
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    let legacyCalls = 0
    const selectedFail = selectSmartSwapCtaExecution({
      decision: gated.result.current.decision,
      plan: gated.result.current.plan,
      legacyCallback: async () => {
        legacyCalls += 1
        return 'legacy-hash'
      },
      consumeV2: gated.result.current.consumeIfGated,
    })
    await expect(selectedFail.run?.()).rejects.toThrow(/V2_EXECUTE_FAILED|V2_APPROVAL_REJECTED/)
    expect(legacyCalls).toBe(0)

    runtimeMocks.walletShouldReject = false
    runtimeMocks.runtime = {
      request: nextBuilt.request,
      requestKey: nextBuilt.requestKey,
      shadow: readyShadow(nextBuilt.request!, await pancakeWinner(nextBuilt.request!)),
    }
    gated.rerender()
    const selectedRetry = selectSmartSwapCtaExecution({
      decision: gated.result.current.decision,
      plan: gated.result.current.plan,
      legacyCallback: async () => {
        legacyCalls += 1
        return 'legacy-hash'
      },
      consumeV2: gated.result.current.consumeIfGated,
    })
    let hash = ''
    await act(async () => {
      hash = await selectedRetry.run!()
    })
    expect(hash).toMatch(/^0x[0-9a-f]+$/)
    expect(legacyCalls).toBe(0)
    expect(runtimeMocks.walletSends).toHaveLength(1)
  })

  it('D: an older Promise settling after a plan change cannot clear a newer in-flight Promise', async () => {
    const slot: { current: Promise<string> | null } = { current: null }
    let resolveOld: ((value: string) => void) | undefined
    let resolveNew: ((value: string) => void) | undefined
    const oldPromise = runExclusiveCtaConsume(
      slot,
      () =>
        new Promise<string>((resolve) => {
          resolveOld = resolve
        }),
    )
    expect(slot.current).toBe(oldPromise)
    const newerPromise = new Promise<string>((resolve) => {
      resolveNew = resolve
    })
    slot.current = newerPromise
    resolveOld!('old-hash')
    await expect(oldPromise).resolves.toBe('old-hash')
    expect(slot.current).toBe(newerPromise)
    resolveNew!('new-hash')
    await expect(newerPromise).resolves.toBe('new-hash')

    const firstBuilt = bscFormRequest(GROSS_INPUT, 50)
    const nextBuilt = bscFormRequest(GROSS_INPUT, 100)
    runtimeMocks.walletHoldNext = true
    runtimeMocks.runtime = {
      request: firstBuilt.request,
      requestKey: firstBuilt.requestKey,
      shadow: readyShadow(firstBuilt.request!, await pancakeWinner(firstBuilt.request!)),
    }
    const gated = renderHook(() =>
      useSmartSwapV2CtaBinding({
        executorConfigByChain: testExecutorTable(56),
        testOnlyExecutionGate: true,
        nowIso: NOW,
        deadline: DEADLINE,
      }),
    )
    let first: Promise<string> | undefined
    act(() => {
      first = gated.result.current.consumeIfGated()
    })
    expect(runtimeMocks.walletDeferred).toHaveLength(1)
    runtimeMocks.runtime = {
      request: nextBuilt.request,
      requestKey: nextBuilt.requestKey,
      shadow: readyShadow(nextBuilt.request!, await pancakeWinner(nextBuilt.request!)),
    }
    gated.rerender()
    let second: Promise<string> | undefined
    act(() => {
      second = gated.result.current.consumeIfGated()
    })
    expect(second).not.toBe(first)
    expect(runtimeMocks.walletDeferred).toHaveLength(2)
    expect(first).toBeTruthy()
    expect(second).toBeTruthy()
    act(() => {
      releaseNextWalletSend('0xold')
    })
    await act(async () => {
      await first
    })
    expect(runtimeMocks.walletDeferred).toHaveLength(1)
    act(() => {
      releaseNextWalletSend('0xnew')
    })
    await expect(second).resolves.toBe('0xnew')
  })
})

describe('USER_LOCAL_MONOTONIC nonce collision safety', () => {
  it('same-millisecond constructions, rebuild after approval, and tab isolation', () => {
    const sharedLast = new Map<string, bigint>()
    const tabA = createV2UserLocalNonceClock({ lastIssuedByUser: sharedLast, pins: new Map(), persistBrowser: false })
    const tabB = createV2UserLocalNonceClock({ lastIssuedByUser: sharedLast, pins: new Map(), persistBrowser: false })
    const key = '56:token:usdc:1000000:50'
    const first = tabA.allocate(USER, key, 1_700_000_000_000)
    const sameMs = tabA.next(1_700_000_000_000, USER)
    expect(sameMs).not.toBe(first)
    expect(BigInt(sameMs)).toBe(BigInt(first) + BigInt(1))
    const rebuild = tabA.allocate(USER, key, 1_700_000_000_005)
    expect(rebuild).toBe(first)
    const otherPlan = tabA.allocate(USER, '56:token:usdc:2000000:50', 1_700_000_000_000)
    expect(otherPlan).not.toBe(first)
    const otherTab = tabB.allocate(USER, key, 1_700_000_000_000)
    expect(otherTab).not.toBe(first)
    expect(/^\d+$/.test(first)).toBe(true)
    expect(first).toBe(BigInt(first).toString(10))
    const defaultFirst = allocateV2UserPlanNonce(USER, key, 1_700_000_000_000)
    const defaultRebuild = allocateV2UserPlanNonce(USER, key, 1_700_000_000_123)
    expect(defaultRebuild).toBe(defaultFirst)
  })
})

describe('wallet-style consume adapter', () => {
  it('uses the injected wallet submit/wait pair and does not invent a second adapter API', async () => {
    const sent: string[] = []
    const adapter = createV2UserWalletTransactionAdapter({
      sendTransaction: async (tx) => {
        sent.push(tx.to)
        return { hash: '0xabc' }
      },
      waitForTransaction: async () => ({ status: 1 }),
    })
    expect(await adapter.submitUserTransaction({
      from: USER,
      to: EXECUTOR,
      chainId: 56,
      data: '0x',
      value: '0x0',
    })).toEqual({ hash: '0xabc' })
    expect(await adapter.waitForReceipt('0xabc')).toEqual({ status: 1 })
    expect(sent).toEqual([EXECUTOR])
  })
})
