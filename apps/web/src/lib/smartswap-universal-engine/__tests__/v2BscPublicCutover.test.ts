/**
 * MELEGA-SMARTSWAP-V2-BSC-PUBLIC-CUTOVER — focused final-cutover tests.
 * BSC (56) chain-scoped public V2; Ethereum / other chains / no-chain callers stay LEGACY.
 */
import { act, renderHook } from '@testing-library/react'
import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { Token } from '@pancakeswap/sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { createMelegaDexAdapter, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
import {
  BSC_V2_PUBLIC_CUTOVER_ENABLED,
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
import {
  BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS,
  TEAM_OPERATOR_REF,
  V2_EXECUTION_RUNTIME_CONFIG,
  V2_EXECUTOR_CONFIG_STATUS,
  resolveV2ExecutorConfig,
  type V2ExecutorConfigTable,
} from '../v2ExecutionRuntimeConfig'
import type { UnsignedUserTransaction } from '../v2ExecutionBinding'
import {
  V2_CTA_DECISION,
  V2_PLAN_REASON,
  V2_PUBLIC_ACTION,
  V2_TEST_ONLY_CTA_EXECUTION_GATE,
  buildV2UserExecutionPlan,
  consumePreparedV2UserPlan,
  createV2UserWalletTransactionAdapter,
  currentRequestKeyOf,
  decodeApproveSpender,
  resetV2CtaConsumeLocksForTests,
  resetV2UserLocalNonceStateForTests,
  resolveSmartSwapCtaDecision,
  selectSmartSwapCtaExecution,
  type BuildV2UserExecutionPlanInput,
  type V2ShadowRuntimeFacts,
  type V2UserExecutionPlan,
} from '../v2UserExecutionPlan'
import {
  V2_PLAN_RETIRED,
  isSmartSwapV2PublicCutoverActive,
  useSmartSwapV2CtaBinding,
} from '../../../views/Swap/SmartSwap/hooks/useSmartSwapV2CtaBinding'
import {
  applyShadowRuntimeResult,
  buildShadowRuntimeRequest,
} from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight'
import { releaseNextWalletSend, resetRuntimeMocks, runtimeMocks } from './v2CtaRuntimeBinding.mocks'

/** Synthetic quote sources are stamped 2026-08-20T00:00:00Z; freshness window = 15s. */
const NOW = '2026-08-20T00:00:05.000Z'
const DEADLINE = 1_893_456_000
const GROSS = '1000000'
const USER = '0x1111111111111111111111111111111111111111'
const EXECUTOR = getAddress('0x7c07082839edd5797737640bba6af47992b9861e')
const TEAM = getAddress(TEAM_OPERATOR_REF)
const TREASURY = getAddress(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
const MELEGA_ROUTER = getAddress('0xc25033218D181b27D4a2944Fbb04FC055da4EAB3')
const PANCAKE_ROUTER = getAddress('0x10ED43C718714eb63d5aA57B78B54704E256024E')
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_BSC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const WBNB_CS = getAddress(WBNB)
const USDC_BSC_CS = getAddress(USDC_BSC)
const WETH_CS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const USDC_ETH_CS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const EXECUTE_IFACE = new Interface([
  'function execute((uint256 version,bytes32 policyId,bytes32 policyVersion,uint256 chainId,address user,address inputAsset,address outputAsset,uint256 inputAmount,uint256 minUserOut,bytes32 venueId,address router,bytes32 routeHash,uint16 feeBps,uint256 feeAmount,address feeAsset,address beneficiary,uint256 structuralRouteCostBps,uint256 deadline,uint256 nonce,bool nativeIn,bool nativeOut) intent,address[] path) payable returns (uint256)',
])
const APPROVE_IFACE = new Interface(['function approve(address spender, uint256 amount)'])

vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
  const { runtimeMocks: mocks } = await import('./v2CtaRuntimeBinding.mocks')
  return { ...actual, useAccount: () => ({ address: mocks.user }) }
})

vi.mock('hooks/useActiveChainId', async () => {
  const actual = await vi.importActual<typeof import('hooks/useActiveChainId')>('hooks/useActiveChainId')
  const { runtimeMocks: mocks } = await import('./v2CtaRuntimeBinding.mocks')
  return { ...actual, useActiveChainId: () => ({ chainId: mocks.walletChainId }) }
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

const receiptStatus = { approve: 1, execute: 1 }
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
        if (mocks.walletExecuteFails && tx.to === mocks.executor) throw new Error('execute reverted')
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

const LEGACY_SNAPSHOT: LegacyMelegaQuoteSnapshot = {
  chainId: 56,
  input: { address: WBNB_CS, symbol: 'WBNB', decimals: 18 },
  output: { address: USDC_BSC_CS, symbol: 'USDC', decimals: 18 },
  inputAmountRaw: GROSS,
  expectedOutputRaw: '600000',
  pathAddresses: [WBNB_CS, USDC_BSC_CS],
  freshness: NOW,
  slippageBps: 50,
}

function bscErc20() {
  return buildShadowRuntimeRequest({
    chainId: 56,
    inputCurrency: { isNative: false, address: WBNB_CS, decimals: 18, symbol: 'WBNB', chainId: 56 },
    outputCurrency: { isNative: false, address: USDC_BSC_CS, decimals: 18, symbol: 'USDC', chainId: 56 },
    inputAmountRaw: GROSS,
    exactOut: false,
    slippageBps: 50,
  })
}

function bscNative() {
  return buildShadowRuntimeRequest({
    chainId: 56,
    inputCurrency: { isNative: true, decimals: 18, symbol: 'BNB', chainId: 56 },
    outputCurrency: { isNative: false, address: USDC_BSC_CS, decimals: 18, symbol: 'USDC', chainId: 56 },
    inputAmountRaw: GROSS,
    exactOut: false,
    slippageBps: 50,
  })
}

function ethErc20() {
  return buildShadowRuntimeRequest({
    chainId: 1,
    inputCurrency: { isNative: false, address: WETH_CS, decimals: 18, symbol: 'WETH', chainId: 1 },
    outputCurrency: { isNative: false, address: USDC_ETH_CS, decimals: 6, symbol: 'USDC', chainId: 1 },
    inputAmountRaw: GROSS,
    exactOut: false,
    slippageBps: 50,
  })
}

function readyShadow(request: SmartSwapRequest, winner: ShadowCandidate): V2ShadowRuntimeFacts {
  return { status: 'ready', requestKey: currentRequestKeyOf(request), winner, v2Available: true }
}

async function melegaWinner(request: SmartSwapRequest, nowIso = NOW) {
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [
      createMelegaDexAdapter(
        { ...LEGACY_SNAPSHOT, inputAmountRaw: request.inputAmountRaw, freshness: nowIso },
        { quoteSource: createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '580000' } }) },
      ),
    ],
    nowIso,
  })
  expect(result.shadowWinner?.venueId).toBe('melega-dex')
  return result.shadowWinner!
}

async function pancakeWinner(request: SmartSwapRequest, nowIso = NOW) {
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [
      createPancakeSwapVenueAdapter(createSyntheticQuoteSource({ [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '500000' } })),
    ],
    nowIso,
  })
  expect(result.shadowWinner?.venueId).toBe('pancakeswap')
  return result.shadowWinner!
}

async function uniswapWinner(request: SmartSwapRequest) {
  const weth = WETH_CS.toLowerCase()
  const usdc = USDC_ETH_CS.toLowerCase()
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [createUniswapVenueAdapter(createSyntheticQuoteSource({ [`1:${weth}>${usdc}`]: { amountOutRaw: '400000' } }))],
    nowIso: NOW,
  })
  expect(result.shadowWinner?.venueId).toBe('uniswap')
  return result.shadowWinner!
}

/**
 * CONTEXT B: V2-enabled behaviour is proven through the EXISTING rollback/test seam
 * (`bscPublicCutoverEnabled: true`). The production default is the temporary rollback
 * (BSC_V2_PUBLIC_CUTOVER_ENABLED=false, CONTEXT A) and is asserted separately below.
 */
const V2_SEAM = { bscPublicCutoverEnabled: true } as const

/** Production Executor table by default (canonical BSC ExecutorV2, no override); CONTEXT B seam on. */
function bscPlan(
  request: SmartSwapRequest,
  winner: ShadowCandidate,
  extra: Partial<BuildV2UserExecutionPlanInput> = {},
  allowanceRaw = GROSS,
): V2UserExecutionPlan {
  const nativeIn = request.inputAsset.location.kind === 'native'
  return buildV2UserExecutionPlan({
    user: USER,
    walletChainId: 56,
    request,
    requestKey: currentRequestKeyOf(request),
    shadow: readyShadow(request, winner),
    observedAllowance: nativeIn
      ? undefined
      : { chainId: 56, token: WBNB_CS, owner: USER, spender: EXECUTOR, amountRaw: allowanceRaw },
    allowanceReadStatus: nativeIn ? 'native' : 'ok',
    nowIso: NOW,
    deadline: DEADLINE,
    ...V2_SEAM,
    ...extra,
  })
}

function publicDecision(plan: V2UserExecutionPlan, chainId = 56, gate = V2_TEST_ONLY_CTA_EXECUTION_GATE) {
  return resolveSmartSwapCtaDecision({
    planOk: plan.ok,
    cutoverAllowed: isProductionCutoverAllowed(chainId, V2_SEAM.bscPublicCutoverEnabled) && plan.productionCutoverAllowed,
    testOnlyExecutionGate: gate,
    planReason: plan.reason,
  })
}

function recorder(opts: { rejectApprove?: boolean; approveStatus?: number; executeStatus?: number; rejectExecute?: boolean } = {}) {
  const sent: UnsignedUserTransaction[] = []
  return {
    sent,
    submitUserTransaction: async (tx: UnsignedUserTransaction) => {
      sent.push(tx)
      const isApprove = decodeApproveSpender(tx.data) !== null
      if (isApprove && opts.rejectApprove) throw new Error('User rejected approval')
      if (!isApprove && opts.rejectExecute) throw new Error('User rejected execute')
      return { hash: `0x${isApprove ? 'a' : 'e'}${sent.length}` }
    },
    waitForReceipt: async (hash: string) => ({
      status: hash.startsWith('0xa') ? opts.approveStatus ?? 1 : opts.executeStatus ?? 1,
    }),
  }
}

beforeEach(() => {
  resetV2UserLocalNonceStateForTests()
  resetV2CtaConsumeLocksForTests()
  resetRuntimeMocks()
  runtimeMocks.executor = EXECUTOR
  runtimeMocks.allowanceRaw = GROSS
  receiptStatus.approve = 1
  receiptStatus.execute = 1
})

afterEach(() => {
  resetV2CtaConsumeLocksForTests()
  vi.useRealTimers()
})

describe('MELEGA-SMARTSWAP-V2-BSC-PUBLIC-CUTOVER: config + chain-scoped truth', () => {
  it('1: BSC stored config is CONFIGURED / enabled=true / canonical Executor', () => {
    expect(BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS).toBe('0x7c07082839edd5797737640bba6af47992b9861e')
    expect(V2_EXECUTION_RUNTIME_CONFIG[56]).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
      enabled: true,
      executorAddress: '0x7c07082839edd5797737640bba6af47992b9861e',
    })
    expect(resolveV2ExecutorConfig(56)).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
      enabled: true,
      executorAddress: EXECUTOR,
    })
  })

  it('2: Ethereum stays NOT_CONFIGURED / enabled=false / null; no other chain configured', () => {
    expect(V2_EXECUTION_RUNTIME_CONFIG[1]).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.NOT_CONFIGURED,
      enabled: false,
      executorAddress: null,
    })
    expect(Object.keys(V2_EXECUTION_RUNTIME_CONFIG).sort()).toEqual(['1', '56'])
    expect(resolveV2ExecutorConfig(1)).toEqual({ status: 'NOT_CONFIGURED', enabled: false, executorAddress: null })
    expect(resolveV2ExecutorConfig(137)).toEqual({ status: 'NOT_CONFIGURED', enabled: false, executorAddress: null })
  })

  it('3/4/5: isProductionCutoverAllowed is true only for 56; no-chain/global calls cannot authorize', () => {
    expect(BSC_V2_PUBLIC_CUTOVER_ENABLED).toBe(false)
    expect(isProductionCutoverAllowed(56)).toBe(false)
    expect(isProductionCutoverAllowed(1)).toBe(false)
    expect(isProductionCutoverAllowed(97)).toBe(false)
    expect(isProductionCutoverAllowed(137)).toBe(false)
    expect(isProductionCutoverAllowed()).toBe(false)
    expect(isProductionCutoverAllowed(undefined, true)).toBe(false)
    expect(isProductionCutoverAllowed(1, true)).toBe(false)
    expect(isProductionCutoverAllowed(56, false)).toBe(false)
    // Global descriptors remain fallback/readiness descriptors for SHADOW quote competition + other chains.
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(V2_TEST_ONLY_CTA_EXECUTION_GATE).toBe(false)
  })
})

describe('MELEGA-SMARTSWAP-V2-BSC-PUBLIC-CUTOVER: plan + public decision', () => {
  it('6: fresh BSC Melega winner -> production-ready plan -> V2_EXECUTE via Melega router', async () => {
    const { request } = bscErc20()
    const plan = bscPlan(request!, await melegaWinner(request!))
    expect(plan.ok).toBe(true)
    expect(plan.decision).toBe(V2_CTA_DECISION.V2_PRODUCTION_READY)
    expect(plan.productionCutoverAllowed).toBe(true)
    expect(plan.productionExecutionCapable).toBe(true)
    expect(plan.productionExecutionMode).toBe(SMARTSWAP_OPERATING_MODE.PRODUCTION)
    expect(plan.executorAddress).toBe(EXECUTOR)
    const decoded = EXECUTE_IFACE.decodeFunctionData('execute', plan.preparation!.swapTransaction.data)
    expect(getAddress(decoded.intent.router)).toBe(MELEGA_ROUTER)
    expect(getAddress(decoded.intent.beneficiary)).toBe(TREASURY)
    const decision = publicDecision(plan)
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    expect(decision.decision).toBe(V2_CTA_DECISION.V2_PRODUCTION_READY)
    expect(decision.reason).not.toBe(V2_CTA_DECISION.V2_CANARY_READY_BUT_DISABLED)
  })

  it('7: fresh BSC Pancake winner -> V2_EXECUTE via Pancake router', async () => {
    const { request } = bscErc20()
    const plan = bscPlan(request!, await pancakeWinner(request!))
    expect(plan.ok).toBe(true)
    expect(plan.productionCutoverAllowed).toBe(true)
    const decoded = EXECUTE_IFACE.decodeFunctionData('execute', plan.preparation!.swapTransaction.data)
    expect(getAddress(decoded.intent.router)).toBe(PANCAKE_ROUTER)
    expect(publicDecision(plan).publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
  })

  it('8: BSC native input -> no approval, single execute to Executor with msg.value', async () => {
    const { request } = bscNative()
    const plan = bscPlan(request!, await pancakeWinner(request!))
    expect(plan.ok).toBe(true)
    expect(plan.approvalSpender).toBeNull()
    expect(plan.preparation!.approvalTransactions).toEqual([])
    const rec = recorder()
    const hash = await consumePreparedV2UserPlan({
      plan,
      testOnlyExecutionGate: false,
      cutoverAllowed: isProductionCutoverAllowed(56, V2_SEAM.bscPublicCutoverEnabled),
      nowIso: NOW,
      ...rec,
    })
    expect(hash).toBe('0xe1')
    expect(rec.sent).toHaveLength(1)
    expect(rec.sent[0].to).toBe(EXECUTOR)
    expect(rec.sent[0].from).toBe(USER)
    expect(BigInt(rec.sent[0].value)).toBe(BigInt(GROSS))
  })

  it('9: BSC ERC20 -> approval spender is ONLY the Executor (exact amount), approval receipt, then execute', async () => {
    const { request } = bscErc20()
    const plan = bscPlan(request!, await melegaWinner(request!), {}, '0')
    expect(plan.ok).toBe(true)
    expect(plan.approvalSpender).toBe(EXECUTOR)
    const rec = recorder()
    await consumePreparedV2UserPlan({ plan, testOnlyExecutionGate: false, cutoverAllowed: true, nowIso: NOW, ...rec })
    expect(rec.sent).toHaveLength(2)
    expect(rec.sent[0].to).toBe(WBNB_CS)
    const approve = APPROVE_IFACE.decodeFunctionData('approve', rec.sent[0].data)
    expect(getAddress(approve.spender)).toBe(EXECUTOR)
    expect(approve.amount.toString()).toBe(GROSS)
    for (const forbidden of [MELEGA_ROUTER, PANCAKE_ROUTER, TEAM, TREASURY]) {
      expect(getAddress(approve.spender)).not.toBe(forbidden)
    }
    expect(rec.sent[1].to).toBe(EXECUTOR)
    expect(rec.sent.every((tx) => tx.from === USER)).toBe(true)
  })

  it('10: BSC V2 unavailable BEFORE submission -> legacy fallback runs, V2 never called', async () => {
    const { request, requestKey } = bscErc20()
    const plan = buildV2UserExecutionPlan({
      user: USER,
      walletChainId: 56,
      request,
      requestKey,
      shadow: { status: 'unavailable', requestKey, winner: null, v2Available: false },
      allowanceReadStatus: 'unread',
      nowIso: NOW,
      deadline: DEADLINE,
    })
    expect(plan.ok).toBe(false)
    expect(plan.reason).toBe(V2_PLAN_REASON.SHADOW_NOT_READY)
    let v2Calls = 0
    const selected = selectSmartSwapCtaExecution({
      decision: publicDecision(plan),
      plan,
      legacyCallback: async () => 'legacy-hash',
      consumeV2: async () => {
        v2Calls += 1
        return 'v2'
      },
    })
    expect(selected.kind).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(await selected.run!()).toBe('legacy-hash')
    expect(v2Calls).toBe(0)
  })

  it('11/12/13: approval rejected, approval receipt status=0, execute rejected/failed -> no execute after failed approval, never legacy', async () => {
    const { request } = bscErc20()
    const winner = await melegaWinner(request!)
    const cases = [
      { opts: { rejectApprove: true }, error: /V2_APPROVAL_REJECTED/, sends: 1 },
      { opts: { approveStatus: 0 }, error: /V2_APPROVAL_FAILED/, sends: 1 },
      { opts: { rejectExecute: true }, error: /V2_EXECUTE_FAILED/, sends: 2 },
      { opts: { executeStatus: 0 }, error: /V2_EXECUTE_FAILED/, sends: 2 },
    ]
    for (const c of cases) {
      resetV2CtaConsumeLocksForTests()
      const plan = bscPlan(request!, winner, {}, '0')
      const rec = recorder(c.opts)
      let legacyCalls = 0
      const selected = selectSmartSwapCtaExecution({
        decision: publicDecision(plan),
        plan,
        legacyCallback: async () => {
          legacyCalls += 1
          return 'legacy'
        },
        consumeV2: () =>
          consumePreparedV2UserPlan({ plan, testOnlyExecutionGate: false, cutoverAllowed: true, nowIso: NOW, ...rec }),
      })
      expect(selected.kind).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
      await expect(selected.run!()).rejects.toThrow(c.error)
      expect(rec.sent).toHaveLength(c.sends)
      if (c.sends === 1) expect(rec.sent.some((tx) => tx.to === EXECUTOR)).toBe(false)
      expect(legacyCalls).toBe(0)
    }
  })

  it('15: stale winner / expired quote / click-time staleness -> no V2 execute', async () => {
    const { request } = bscErc20()
    const winner = await melegaWinner(request!)
    const stale = bscPlan(request!, { ...winner, status: 'stale' })
    expect(stale.ok).toBe(false)
    expect(stale.reason).toBe(V2_PLAN_REASON.SHADOW_STALE)
    expect(publicDecision(stale).publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    const expired = bscPlan(request!, winner, { nowIso: '2026-08-20T00:00:16.000Z' })
    expect(expired.ok).toBe(false)
    expect(expired.reason).toBe(V2_PLAN_REASON.QUOTE_EXPIRED)
    const ready = bscPlan(request!, winner)
    expect(ready.freshUntilIso).toBe('2026-08-20T00:00:15.000Z')
    const rec = recorder()
    await expect(
      consumePreparedV2UserPlan({
        plan: ready,
        testOnlyExecutionGate: false,
        cutoverAllowed: true,
        nowIso: '2026-08-20T00:00:15.001Z',
        ...rec,
      }),
    ).rejects.toThrow('V2_CTA_PLAN_STALE')
    expect(rec.sent).toHaveLength(0)
  })

  it('16: FOT unproven stays fail-closed -> SHADOW unavailable -> no V2 execute', async () => {
    const { request, requestKey } = bscErc20()
    const shadow = applyShadowRuntimeResult({
      startedGeneration: 1,
      currentGeneration: 1,
      requestKey,
      winner: null,
      error: 'MELEGA_DEX_FOT_UNPROVEN',
    })!
    expect(shadow.status).toBe('unavailable')
    expect(shadow.reason).toBe('FOT_UNPROVEN')
    const plan = buildV2UserExecutionPlan({
      user: USER,
      walletChainId: 56,
      request,
      requestKey,
      shadow,
      allowanceReadStatus: 'ok',
      nowIso: NOW,
      deadline: DEADLINE,
    })
    expect(plan.ok).toBe(false)
    expect(publicDecision(plan).publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
  })

  it('17: Ethereum stays legacy: production table not configured; even an enabled override cannot cut over', async () => {
    const { request, requestKey } = ethErc20()
    const winner = await uniswapWinner(request!)
    const production = buildV2UserExecutionPlan({
      user: USER,
      walletChainId: 1,
      request,
      requestKey,
      shadow: readyShadow(request!, winner),
      allowanceReadStatus: 'unread',
      nowIso: NOW,
      deadline: DEADLINE,
    })
    expect(production.ok).toBe(false)
    expect(production.reason).toBe(V2_PLAN_REASON.EXECUTOR_NOT_CONFIGURED)
    const override: V2ExecutorConfigTable = {
      1: { status: 'CONFIGURED', enabled: true, executorAddress: '0x3333333333333333333333333333333333333333' },
    }
    const prepared = buildV2UserExecutionPlan({
      user: USER,
      walletChainId: 1,
      request,
      requestKey,
      shadow: readyShadow(request!, winner),
      observedAllowance: {
        chainId: 1,
        token: WETH_CS,
        owner: USER,
        spender: '0x3333333333333333333333333333333333333333',
        amountRaw: GROSS,
      },
      allowanceReadStatus: 'ok',
      nowIso: NOW,
      deadline: DEADLINE,
      executorConfigByChain: override,
      bscPublicCutoverEnabled: true,
    })
    expect(prepared.ok).toBe(true)
    expect(prepared.productionCutoverAllowed).toBe(false)
    expect(prepared.decision).toBe(V2_CTA_DECISION.V2_CANARY_READY_BUT_DISABLED)
    expect(publicDecision(prepared, 1).publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    await expect(
      consumePreparedV2UserPlan({
        plan: prepared,
        testOnlyExecutionGate: false,
        cutoverAllowed: isProductionCutoverAllowed(1),
        ...recorder(),
      }),
    ).rejects.toThrow('V2_CTA_GATE_DISABLED')
  })

  it('18: Team/Treasury never signer/spender; Team as user or executor fails closed', async () => {
    const { request } = bscErc20()
    const winner = await melegaWinner(request!)
    const plan = bscPlan(request!, winner, {}, '0')
    expect(plan.teamIsSigner).toBe(false)
    expect(plan.teamIsSpender).toBe(false)
    expect(plan.treasuryIsSigner).toBe(false)
    expect(plan.treasuryIsSpender).toBe(false)
    const txs = [...plan.preparation!.approvalTransactions, plan.preparation!.swapTransaction]
    for (const tx of txs) {
      expect([TEAM, TREASURY]).not.toContain(tx.from)
      expect([TEAM, TREASURY]).not.toContain(tx.to)
    }
    expect(decodeApproveSpender(plan.preparation!.approvalTransactions[0].data)).toBe(EXECUTOR)
    expect(bscPlan(request!, winner, { user: TEAM }).reason).toBe(V2_PLAN_REASON.USER_INVALID)
    expect(bscPlan(request!, winner, { user: TREASURY }).reason).toBe(V2_PLAN_REASON.USER_INVALID)
    expect(
      bscPlan(request!, winner, { executorConfigByChain: { 56: { status: 'CONFIGURED', enabled: true, executorAddress: TEAM } } })
        .reason,
    ).toBe(V2_PLAN_REASON.EXECUTOR_NOT_CONFIGURED)
  })

  it('only the canonical ExecutorV2 can receive public cutover; production consume needs cutover AND plan flag', async () => {
    const { request } = bscErc20()
    const winner = await melegaWinner(request!)
    const other = '0x3333333333333333333333333333333333333333'
    const nonCanonical = bscPlan(request!, winner, {
      executorConfigByChain: { 56: { status: 'CONFIGURED', enabled: true, executorAddress: other } },
      observedAllowance: { chainId: 56, token: WBNB_CS, owner: USER, spender: other, amountRaw: GROSS },
    })
    expect(nonCanonical.ok).toBe(true)
    expect(nonCanonical.productionCutoverAllowed).toBe(false)
    expect(publicDecision(nonCanonical).publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    await expect(
      consumePreparedV2UserPlan({ plan: nonCanonical, testOnlyExecutionGate: false, cutoverAllowed: true, ...recorder() }),
    ).rejects.toThrow('V2_CTA_GATE_DISABLED')
    const canonical = bscPlan(request!, winner)
    await expect(
      consumePreparedV2UserPlan({ plan: canonical, testOnlyExecutionGate: false, cutoverAllowed: false, ...recorder() }),
    ).rejects.toThrow('V2_CTA_GATE_DISABLED')
  })

  it('successful execute releases the nonce pin: a later plan for the same request uses a new nonce', async () => {
    const { request } = bscNative()
    const winner = await pancakeWinner(request!)
    const first = bscPlan(request!, winner)
    await consumePreparedV2UserPlan({ plan: first, testOnlyExecutionGate: false, cutoverAllowed: true, nowIso: NOW, ...recorder() })
    const second = bscPlan(request!, winner)
    expect(second.ok).toBe(true)
    expect(second.nonce).not.toBe(first.nonce)
    expect(BigInt(second.nonce!)).toBeGreaterThan(BigInt(first.nonce!))
  })

  it('ROLLBACK: BSC cutover=false or BSC enabled=false returns the public CTA to LEGACY (no redeploy)', async () => {
    const { request } = bscErc20()
    const winner = await melegaWinner(request!)
    const cutoverOff = bscPlan(request!, winner, { bscPublicCutoverEnabled: false })
    expect(cutoverOff.ok).toBe(true)
    expect(cutoverOff.productionCutoverAllowed).toBe(false)
    expect(cutoverOff.decision).toBe(V2_CTA_DECISION.V2_CANARY_READY_BUT_DISABLED)
    expect(
      resolveSmartSwapCtaDecision({
        planOk: cutoverOff.ok,
        cutoverAllowed: isProductionCutoverAllowed(56, false) && cutoverOff.productionCutoverAllowed,
        testOnlyExecutionGate: false,
      }).publicAction,
    ).toBe(V2_PUBLIC_ACTION.LEGACY)
    const disabled = bscPlan(request!, winner, {
      executorConfigByChain: { 56: { ...V2_EXECUTION_RUNTIME_CONFIG[56], enabled: false } },
    })
    expect(disabled.ok).toBe(false)
    expect(disabled.executorAddress).toBeNull()
    expect(publicDecision(disabled).publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
  })
})

describe('MELEGA-SMARTSWAP-V2-BSC-PUBLIC-CUTOVER: real hook binding (CONTEXT B: explicit cutover seam, no test gate)', () => {
  async function mountBsc(kind: 'erc20' | 'native', winnerKind: 'melega' | 'pancake' = 'melega') {
    const built = kind === 'erc20' ? bscErc20() : bscNative()
    const winner =
      winnerKind === 'melega' && kind === 'erc20' ? await melegaWinner(built.request!) : await pancakeWinner(built.request!)
    runtimeMocks.runtime = { request: built.request, requestKey: built.requestKey, shadow: readyShadow(built.request!, winner) }
    return built
  }

  it('hook: BSC ERC20 -> V2_EXECUTE; consume sends approve(Executor) then execute(Executor); never legacy router', async () => {
    await mountBsc('erc20')
    runtimeMocks.allowanceRaw = '0'
    const hook = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE, ...V2_SEAM }))
    expect(hook.result.current.cutoverAllowed).toBe(true)
    expect(hook.result.current.plan.ok).toBe(true)
    expect(hook.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    expect(hook.result.current.decision.decision).toBe(V2_CTA_DECISION.V2_PRODUCTION_READY)
    const executedNonce = hook.result.current.plan.nonce
    let legacyCalls = 0
    const selected = selectSmartSwapCtaExecution({
      decision: hook.result.current.decision,
      plan: hook.result.current.plan,
      legacyCallback: async () => {
        legacyCalls += 1
        return 'legacy'
      },
      consumeV2: hook.result.current.consumeIfGated,
    })
    await act(async () => {
      await selected.run!()
    })
    expect(legacyCalls).toBe(0)
    expect(runtimeMocks.walletSends).toHaveLength(2)
    expect(runtimeMocks.walletSends[0].to).toBe(WBNB_CS)
    expect(getAddress(APPROVE_IFACE.decodeFunctionData('approve', runtimeMocks.walletSends[0].data).spender)).toBe(EXECUTOR)
    expect(runtimeMocks.walletSends[1].to).toBe(EXECUTOR)
    // Executed plan is never offered again: any later plan for this request carries a fresh nonce (no Replay).
    expect(hook.result.current.plan.nonce).not.toBe(executedNonce)
  })

  it('hook: BSC native (Pancake winner) -> V2_EXECUTE; exactly one execute to Executor, no approval', async () => {
    await mountBsc('native', 'pancake')
    const hook = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE, ...V2_SEAM }))
    expect(hook.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    await act(async () => {
      await hook.result.current.consumeIfGated()
    })
    expect(runtimeMocks.walletSends).toEqual([expect.objectContaining({ to: EXECUTOR })])
  })

  it('14 hook: double click while pending -> single in-flight consume, one wallet request', async () => {
    await mountBsc('native', 'pancake')
    runtimeMocks.walletHoldNext = true
    const hook = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE, ...V2_SEAM }))
    let first: Promise<string> | undefined
    let second: Promise<string> | undefined
    act(() => {
      first = hook.result.current.consumeIfGated()
      second = hook.result.current.consumeIfGated()
    })
    expect(first).toBe(second)
    expect(runtimeMocks.walletDeferred).toHaveLength(1)
    await act(async () => {
      releaseNextWalletSend()
      await first
    })
    expect(runtimeMocks.walletSends).toHaveLength(1)
  })

  it('in-flight latch: after V2 submission starts, facts turning unavailable never switch the CTA to legacy', async () => {
    const built = await mountBsc('native', 'pancake')
    runtimeMocks.walletHoldNext = true
    const hook = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE, ...V2_SEAM }))
    let first: Promise<string> | undefined
    act(() => {
      first = hook.result.current.consumeIfGated()
    })
    runtimeMocks.runtime = {
      request: built.request,
      requestKey: built.requestKey,
      shadow: { status: 'unavailable', requestKey: built.requestKey, winner: null, v2Available: false },
    }
    hook.rerender()
    expect(hook.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    expect(hook.result.current.plan.ok).toBe(true)
    let legacyCalls = 0
    let again: Promise<string> | null = null
    act(() => {
      again = selectSmartSwapCtaExecution({
        decision: hook.result.current.decision,
        plan: hook.result.current.plan,
        legacyCallback: async () => {
          legacyCalls += 1
          return 'legacy'
        },
        consumeV2: hook.result.current.consumeIfGated,
      }).run!()
    })
    expect(again).toBe(first)
    expect(legacyCalls).toBe(0)
    expect(runtimeMocks.walletDeferred).toHaveLength(1)
    await act(async () => {
      releaseNextWalletSend()
      await first
    })
    expect(runtimeMocks.walletSends).toHaveLength(1)
    expect(hook.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
  })

  it('hook: approval rejected in wallet -> V2_APPROVAL_REJECTED, no execute, no legacy', async () => {
    await mountBsc('erc20')
    runtimeMocks.allowanceRaw = '0'
    runtimeMocks.walletShouldReject = true
    const hook = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE, ...V2_SEAM }))
    let legacyCalls = 0
    const selected = selectSmartSwapCtaExecution({
      decision: hook.result.current.decision,
      plan: hook.result.current.plan,
      legacyCallback: async () => {
        legacyCalls += 1
        return 'legacy'
      },
      consumeV2: hook.result.current.consumeIfGated,
    })
    await act(async () => {
      await expect(selected.run!()).rejects.toThrow(/V2_APPROVAL_REJECTED/)
    })
    expect(runtimeMocks.walletSends).toHaveLength(0)
    expect(legacyCalls).toBe(0)
  })

  it('hook: execute failure -> V2_EXECUTE_FAILED, no legacy', async () => {
    await mountBsc('native', 'pancake')
    runtimeMocks.walletExecuteFails = true
    const hook = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE, ...V2_SEAM }))
    let legacyCalls = 0
    const selected = selectSmartSwapCtaExecution({
      decision: hook.result.current.decision,
      plan: hook.result.current.plan,
      legacyCallback: async () => {
        legacyCalls += 1
        return 'legacy'
      },
      consumeV2: hook.result.current.consumeIfGated,
    })
    await act(async () => {
      await expect(selected.run!()).rejects.toThrow(/V2_EXECUTE_FAILED/)
    })
    expect(legacyCalls).toBe(0)
  })

  it('hook: Ethereum wallet -> LEGACY; rollback seams -> LEGACY', async () => {
    const built = ethErc20()
    runtimeMocks.walletChainId = 1
    runtimeMocks.runtime = {
      request: built.request,
      requestKey: built.requestKey,
      shadow: readyShadow(built.request!, await uniswapWinner(built.request!)),
    }
    const eth = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE, ...V2_SEAM }))
    expect(eth.result.current.cutoverAllowed).toBe(false)
    expect(eth.result.current.plan.ok).toBe(false)
    expect(eth.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(eth.result.current.v2Pending).toBe(false)
    await expect(eth.result.current.consumeIfGated()).rejects.toThrow()
    expect(runtimeMocks.walletSends).toHaveLength(0)

    runtimeMocks.walletChainId = 56
    await mountBsc('native', 'pancake')
    const cutoverOff = renderHook(() =>
      useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE, bscPublicCutoverEnabled: false }),
    )
    expect(cutoverOff.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    await expect(cutoverOff.result.current.consumeIfGated()).rejects.toThrow('V2_CTA_GATE_DISABLED')
    const disabled = renderHook(() =>
      useSmartSwapV2CtaBinding({
        nowIso: NOW,
        deadline: DEADLINE,
        ...V2_SEAM,
        executorConfigByChain: { 56: { ...V2_EXECUTION_RUNTIME_CONFIG[56], enabled: false } },
      }),
    )
    expect(disabled.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(runtimeMocks.walletSends).toHaveLength(0)
  })

  it('hook: BSC shadow loading -> bounded V2 pending hold (no legacy approval offered first); ETH never pending', async () => {
    const built = bscErc20()
    runtimeMocks.runtime = {
      request: built.request,
      requestKey: built.requestKey,
      shadow: { status: 'loading', requestKey: built.requestKey, winner: null, v2Available: false },
    }
    vi.useFakeTimers()
    const hook = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE, ...V2_SEAM }))
    expect(hook.result.current.v2Pending).toBe(true)
    expect(hook.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    act(() => {
      vi.advanceTimersByTime(12_001)
    })
    expect(hook.result.current.v2Pending).toBe(false)
    const off = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE, bscPublicCutoverEnabled: false }))
    expect(off.result.current.v2Pending).toBe(false)
  })

  it('hook: a ready plan retires when its quote freshness window passes (real clock) -> LEGACY before submission', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(NOW))
    const built = bscNative()
    const winner = await pancakeWinner(built.request!, NOW)
    runtimeMocks.runtime = { request: built.request, requestKey: built.requestKey, shadow: readyShadow(built.request!, winner) }
    const hook = renderHook(() => useSmartSwapV2CtaBinding({ deadline: DEADLINE, ...V2_SEAM }))
    expect(hook.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.V2_EXECUTE)
    act(() => {
      vi.advanceTimersByTime(10_002)
    })
    expect(hook.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(hook.result.current.decision.reason).toBe(V2_PLAN_RETIRED)
    expect(runtimeMocks.walletSends).toHaveLength(0)
  })
})

describe('CONTEXT A: production default = temporary BSC V2 rollback (no seam)', () => {
  it('cutover truth is off: BSC_V2_PUBLIC_CUTOVER_ENABLED=false, isProductionCutoverAllowed(56)=false, form routing legacy', () => {
    expect(BSC_V2_PUBLIC_CUTOVER_ENABLED).toBe(false)
    expect(isProductionCutoverAllowed(56)).toBe(false)
    expect(isProductionCutoverAllowed(1)).toBe(false)
    expect(isSmartSwapV2PublicCutoverActive(56)).toBe(false)
    expect(isSmartSwapV2PublicCutoverActive(1)).toBe(false)
  })

  it('Executor config stays intact: BSC CONFIGURED / enabled / canonical Executor; Ethereum NOT_CONFIGURED', () => {
    expect(V2_EXECUTION_RUNTIME_CONFIG[56].status).toBe('CONFIGURED')
    expect(V2_EXECUTION_RUNTIME_CONFIG[56].enabled).toBe(true)
    expect(V2_EXECUTION_RUNTIME_CONFIG[56].executorAddress?.toLowerCase()).toBe(
      '0x7c07082839edd5797737640bba6af47992b9861e',
    )
    expect(V2_EXECUTION_RUNTIME_CONFIG[1].status).toBe('NOT_CONFIGURED')
    expect(V2_EXECUTION_RUNTIME_CONFIG[1].enabled).toBe(false)
    expect(V2_EXECUTION_RUNTIME_CONFIG[1].executorAddress).toBeNull()
  })

  it('plan built with the production default is never production-cutover and the public decision is LEGACY', async () => {
    const { request } = bscErc20()
    const winner = await melegaWinner(request!)
    const plan = buildV2UserExecutionPlan({
      user: USER,
      walletChainId: 56,
      request,
      requestKey: currentRequestKeyOf(request!),
      shadow: readyShadow(request!, winner),
      observedAllowance: { chainId: 56, token: WBNB_CS, owner: USER, spender: EXECUTOR, amountRaw: '0' },
      allowanceReadStatus: 'ok',
      nowIso: NOW,
      deadline: DEADLINE,
    })
    expect(plan.productionCutoverAllowed).toBe(false)
    expect(
      resolveSmartSwapCtaDecision({
        planOk: plan.ok,
        cutoverAllowed: isProductionCutoverAllowed(56) && plan.productionCutoverAllowed,
        testOnlyExecutionGate: false,
        planReason: plan.reason,
      }).publicAction,
    ).toBe(V2_PUBLIC_ACTION.LEGACY)
    const rec = recorder()
    await expect(
      consumePreparedV2UserPlan({ plan, testOnlyExecutionGate: false, cutoverAllowed: isProductionCutoverAllowed(56), ...rec }),
    ).rejects.toThrow('V2_CTA_GATE_DISABLED')
    expect(rec.sent).toHaveLength(0)
  })

  it('public BSC hook (ERC20 + native) is LEGACY: no Executor approval, no Executor execute reachable', async () => {
    const erc20 = bscErc20()
    runtimeMocks.allowanceRaw = '0'
    runtimeMocks.runtime = {
      request: erc20.request,
      requestKey: erc20.requestKey,
      shadow: readyShadow(erc20.request!, await melegaWinner(erc20.request!)),
    }
    const a = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE }))
    expect(a.result.current.cutoverAllowed).toBe(false)
    expect(a.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(a.result.current.v2Pending).toBe(false)
    await expect(a.result.current.consumeIfGated()).rejects.toThrow('V2_CTA_GATE_DISABLED')

    const native = bscNative()
    runtimeMocks.runtime = {
      request: native.request,
      requestKey: native.requestKey,
      shadow: readyShadow(native.request!, await pancakeWinner(native.request!)),
    }
    const b = renderHook(() => useSmartSwapV2CtaBinding({ nowIso: NOW, deadline: DEADLINE }))
    expect(b.result.current.cutoverAllowed).toBe(false)
    expect(b.result.current.decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    await expect(b.result.current.consumeIfGated()).rejects.toThrow('V2_CTA_GATE_DISABLED')
    expect(runtimeMocks.walletSends).toHaveLength(0)
  })
})

describe('BSC public cutover — real ethers-style signer transport', () => {
  it('wallet adapter invokes sendTransaction / waitForTransaction as methods (this-bound signer)', async () => {
    class ThisBoundProvider {
      readonly receipts = new Map<string, number>([['0xfeed', 1]])
      async waitForTransaction(hash: string) {
        return { status: this.receipts.get(hash) ?? 0 }
      }
    }
    class ThisBoundSigner {
      readonly provider = new ThisBoundProvider()
      readonly sent: unknown[] = []
      async sendTransaction(tx: unknown) {
        // ethers Signer reads this.provider; an unbound call throws "reading 'provider'".
        if (!this.provider) throw new Error('no provider')
        this.sent.push(tx)
        return { hash: '0xfeed' }
      }
    }
    const signer = new ThisBoundSigner()
    const adapter = createV2UserWalletTransactionAdapter(signer)
    const tx = {
      from: USER,
      to: EXECUTOR,
      data: '0x',
      value: '0x1',
      chainId: 56,
    } as unknown as UnsignedUserTransaction
    await expect(adapter.submitUserTransaction(tx)).resolves.toEqual({ hash: '0xfeed' })
    await expect(adapter.waitForReceipt('0xfeed')).resolves.toEqual({ status: 1 })
    expect(signer.sent).toHaveLength(1)
  })
})

describe('BSC public cutover — Swap form routing truth', () => {
  it('only BSC 56 routes the form to the SmartSwap V2 CTA; Ethereum, other chains and no-chain stay on legacy routing', () => {
    expect(isSmartSwapV2PublicCutoverActive(56)).toBe(false)
    expect(isSmartSwapV2PublicCutoverActive(1)).toBe(false)
    expect(isSmartSwapV2PublicCutoverActive(97)).toBe(false)
    expect(isSmartSwapV2PublicCutoverActive(137)).toBe(false)
    expect(isSmartSwapV2PublicCutoverActive(undefined)).toBe(false)
  })
})
