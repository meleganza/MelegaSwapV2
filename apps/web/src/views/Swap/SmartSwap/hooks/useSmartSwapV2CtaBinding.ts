/**
 * Real-runtime SmartSwap V2 CTA binding.
 * Consumes the same #82 request + shadow already associated with current SmartSwap UI state.
 * BSC (56) chain-scoped public cutover: a fresh certified plan -> public V2_EXECUTE (user-signed only).
 * Every other chain, or any non-ready plan before submission -> LEGACY. The test-only gate stays false.
 * Once a V2 consume is in flight for the current request the CTA stays latched on V2 (never legacy).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Token } from '@pancakeswap/sdk'
import { getAddress } from '@ethersproject/address'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useProviderOrSigner } from 'hooks/useProviderOrSigner'
import useTokenAllowance from 'hooks/useTokenAllowance'
import { isProductionCutoverAllowed } from 'lib/smartswap-universal-engine/operatingMode'
import { isEvmNetwork } from 'lib/smartswap-universal-engine/domain'
import type { SmartSwapRequest } from 'lib/smartswap-universal-engine/quote'
import {
  isV2ExecutorRuntimeEnabled,
  resolveV2ExecutorConfig,
  type V2ExecutorConfigTable,
} from 'lib/smartswap-universal-engine/v2ExecutionRuntimeConfig'
import type { ObservedAllowanceIdentity } from 'lib/smartswap-universal-engine/v2ExecutionBinding'
import {
  V2_PLAN_REASON,
  V2_TEST_ONLY_CTA_EXECUTION_GATE,
  buildV2UserExecutionPlan,
  consumePreparedV2UserPlan,
  createV2UserWalletTransactionAdapter,
  resolveSmartSwapCtaDecision,
  shouldReadV2ExecutorAllowance,
  type V2ShadowRuntimeFacts,
  type V2UserExecutionPlan,
} from 'lib/smartswap-universal-engine/v2UserExecutionPlan'
import { useSmartSwapShadowRuntimeFacts } from 'views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight'

export interface SmartSwapV2CtaRuntimeFacts {
  user: string | null
  walletChainId: number
  request: SmartSwapRequest | null
  requestKey: string | null
  shadow: V2ShadowRuntimeFacts | null
  observedAllowance?: ObservedAllowanceIdentity
  allowanceReadStatus: 'ok' | 'unread' | 'native'
  nowIso: string
  deadline: number
  executorConfigByChain?: V2ExecutorConfigTable
  bscPublicCutoverEnabled?: boolean
}

/** A ready plan that expired or was executed is never offered again. */
export const V2_PLAN_RETIRED = 'V2_PLAN_RETIRED' as const
/** Upper bound for holding the CTA while BSC V2 facts (shadow / Executor allowance) resolve. */
export const V2_PENDING_MAX_MS = 12_000

/** In-flight slot: reuse while pending, clear after settle, never let an older Promise wipe a newer one. */
export function runExclusiveCtaConsume(
  slot: { current: Promise<string> | null },
  start: () => Promise<string>,
): Promise<string> {
  if (slot.current) return slot.current
  const captured: { promise: Promise<string> | null } = { promise: null }
  const capturedPromise = start().finally(() => {
    if (slot.current === captured.promise) slot.current = null
  })
  captured.promise = capturedPromise
  slot.current = capturedPromise
  return capturedPromise
}

export function bindSmartSwapV2CtaRuntimePlan(facts: SmartSwapV2CtaRuntimeFacts): V2UserExecutionPlan {
  return buildV2UserExecutionPlan({
    user: facts.user,
    walletChainId: facts.walletChainId,
    request: facts.request,
    requestKey: facts.requestKey,
    shadow: facts.shadow,
    observedAllowance: facts.observedAllowance,
    allowanceReadStatus: facts.allowanceReadStatus,
    nowIso: facts.nowIso,
    deadline: facts.deadline,
    executorConfigByChain: facts.executorConfigByChain,
    bscPublicCutoverEnabled: facts.bscPublicCutoverEnabled,
  })
}

/**
 * Chain-scoped V2 public cutover truth for the Swap form: true only for BSC (56) with the explicit BSC cutover flag on
 * and the Executor row enabled. Rollback (BSC enabled=false or cutover=false) -> false -> legacy CTA, no redeploy.
 */
export function isSmartSwapV2PublicCutoverActive(chainId: number | undefined): boolean {
  const id = Number(chainId || 0)
  return isProductionCutoverAllowed(id) && resolveV2ExecutorConfig(id).enabled
}

function erc20AllowanceToken(request: SmartSwapRequest | null, walletChainId: number): Token | undefined {
  if (!request || !isEvmNetwork(request.network)) return undefined
  if (request.network.chainId !== walletChainId) return undefined
  if (request.inputAsset.location.kind !== 'contract') return undefined
  const decimals = request.inputAsset.decimals
  if (decimals == null || !Number.isInteger(decimals)) return undefined
  try {
    return new Token(
      request.network.chainId,
      getAddress(request.inputAsset.location.address),
      decimals,
      request.inputAsset.symbol,
    )
  } catch {
    return undefined
  }
}

export function useSmartSwapV2CtaBinding(options?: {
  testOnlyExecutionGate?: boolean
  executorConfigByChain?: V2ExecutorConfigTable
  nowIso?: string
  deadline?: number
  /** Rollback/test seam; production uses BSC_V2_PUBLIC_CUTOVER_ENABLED. */
  bscPublicCutoverEnabled?: boolean
}) {
  const { address } = useAccount()
  const { chainId } = useActiveChainId()
  const walletChainId = Number(chainId || 0)
  const runtime = useSmartSwapShadowRuntimeFacts()
  const config = resolveV2ExecutorConfig(walletChainId, options?.executorConfigByChain)
  const bscPublicCutoverEnabled = options?.bscPublicCutoverEnabled
  const chainCutoverAllowed = isProductionCutoverAllowed(walletChainId, bscPublicCutoverEnabled)
  const nativeIn = runtime.request?.inputAsset.location.kind === 'native'
  const readAllowance = shouldReadV2ExecutorAllowance({
    config,
    request: runtime.request,
    requestKey: runtime.requestKey,
    shadow: runtime.shadow,
    user: address ?? null,
    walletChainId,
  })
  const allowanceToken = readAllowance ? erc20AllowanceToken(runtime.request, walletChainId) : undefined
  const allowanceOwner = readAllowance ? address ?? undefined : undefined
  const allowanceSpender = readAllowance && config.executorAddress ? config.executorAddress : undefined
  const currentAllowance = useTokenAllowance(allowanceToken, allowanceOwner, allowanceSpender)
  const walletTransport = useProviderOrSigner()
  const adapter = useMemo(() => createV2UserWalletTransactionAdapter(walletTransport), [walletTransport])
  const testOnlyExecutionGate = options?.testOnlyExecutionGate ?? V2_TEST_ONLY_CTA_EXECUTION_GATE

  const observedAllowance = useMemo<ObservedAllowanceIdentity | undefined>(() => {
    if (!readAllowance || !allowanceToken || !allowanceOwner || !allowanceSpender || !currentAllowance) {
      return undefined
    }
    return {
      chainId: walletChainId,
      token: allowanceToken.address,
      owner: getAddress(allowanceOwner),
      spender: getAddress(allowanceSpender),
      amountRaw: currentAllowance.quotient.toString(),
    }
  }, [readAllowance, allowanceToken, allowanceOwner, allowanceSpender, currentAllowance, walletChainId])

  const allowanceReadStatus: 'ok' | 'unread' | 'native' = nativeIn
    ? 'native'
    : observedAllowance
      ? 'ok'
      : 'unread'

  const plan = useMemo(
    () =>
      bindSmartSwapV2CtaRuntimePlan({
        user: address ?? null,
        walletChainId,
        request: runtime.request,
        requestKey: runtime.requestKey,
        shadow: runtime.shadow,
        observedAllowance,
        allowanceReadStatus,
        nowIso: options?.nowIso ?? new Date().toISOString(),
        deadline: options?.deadline ?? Math.floor(Date.now() / 1000) + 1_200,
        executorConfigByChain: options?.executorConfigByChain,
        bscPublicCutoverEnabled,
      }),
    [
      address,
      walletChainId,
      runtime.request,
      runtime.requestKey,
      runtime.shadow,
      observedAllowance,
      allowanceReadStatus,
      options?.executorConfigByChain,
      options?.nowIso,
      options?.deadline,
      bscPublicCutoverEnabled,
    ],
  )

  // Retire expired / executed plans so the public CTA honestly falls back before any new submission.
  const [retiredPlans] = useState(() => new WeakSet<V2UserExecutionPlan>())
  const [, setRetiredCount] = useState(0)
  const retirePlan = useCallback(
    (target: V2UserExecutionPlan) => {
      if (retiredPlans.has(target)) return
      retiredPlans.add(target)
      setRetiredCount((n) => n + 1)
    },
    [retiredPlans],
  )
  const fixedNowIso = options?.nowIso
  useEffect(() => {
    if (fixedNowIso || !plan.ok || !plan.freshUntilIso) return undefined
    const remaining = Date.parse(plan.freshUntilIso) - Date.now()
    if (!Number.isFinite(remaining) || remaining <= 0) {
      retirePlan(plan)
      return undefined
    }
    const timer = setTimeout(() => retirePlan(plan), remaining + 1)
    return () => clearTimeout(timer)
  }, [plan, fixedNowIso, retirePlan])

  // In-flight latch: while V2 approval/execute runs for this request, the CTA never switches to legacy.
  const [busyPlan, setBusyPlan] = useState<V2UserExecutionPlan | null>(null)
  const busyPlanRef = useRef<V2UserExecutionPlan | null>(null)
  const latchedPlan = busyPlan && busyPlan.requestKey === plan.requestKey ? busyPlan : null
  const activePlan = latchedPlan ?? plan
  const planRetired = !latchedPlan && plan.ok && retiredPlans.has(plan)
  const activePlanOk = latchedPlan ? true : plan.ok && !planRetired

  const decision = useMemo(
    () =>
      resolveSmartSwapCtaDecision({
        planOk: activePlanOk,
        cutoverAllowed: chainCutoverAllowed && activePlan.productionCutoverAllowed,
        testOnlyExecutionGate,
        planReason: planRetired ? V2_PLAN_RETIRED : activePlan.reason,
      }),
    [activePlanOk, activePlan, chainCutoverAllowed, planRetired, testOnlyExecutionGate],
  )

  // Hold the single CTA (bounded) while BSC V2 facts resolve, so legacy router approval is not offered first.
  const shadowStatus = runtime.shadow?.status
  const pendingCandidate =
    chainCutoverAllowed &&
    isV2ExecutorRuntimeEnabled(config) &&
    !latchedPlan &&
    Boolean(runtime.requestKey) &&
    (shadowStatus === 'loading' || (shadowStatus === 'ready' && plan.reason === V2_PLAN_REASON.ALLOWANCE_UNREAD))
  const [pendingExpiredKey, setPendingExpiredKey] = useState<string | null>(null)
  const pendingKey = runtime.requestKey
  useEffect(() => {
    if (!pendingCandidate || !pendingKey) return undefined
    const timer = setTimeout(() => setPendingExpiredKey(pendingKey), V2_PENDING_MAX_MS)
    return () => clearTimeout(timer)
  }, [pendingCandidate, pendingKey])
  const v2Pending = pendingCandidate && pendingExpiredKey !== pendingKey

  const consumeInflight = useRef<Promise<string> | null>(null)
  const consumeForPlan = useRef(plan)
  const consumeIfGated = useCallback(() => {
    const latched = busyPlanRef.current
    const target = latched && latched.requestKey === plan.requestKey ? latched : plan
    if (consumeForPlan.current !== target) {
      consumeForPlan.current = target
      consumeInflight.current = null
    }
    return runExclusiveCtaConsume(consumeInflight, () => {
      busyPlanRef.current = target
      setBusyPlan(target)
      return consumePreparedV2UserPlan({
        plan: target,
        testOnlyExecutionGate,
        cutoverAllowed: chainCutoverAllowed,
        submitUserTransaction: adapter.submitUserTransaction,
        waitForReceipt: adapter.waitForReceipt,
        nowIso: fixedNowIso ?? new Date().toISOString(),
      })
        .then((hash) => {
          retirePlan(target)
          return hash
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : String(error)
          if (message === 'V2_CTA_PLAN_STALE') retirePlan(target)
          throw error
        })
        .finally(() => {
          if (busyPlanRef.current === target) {
            busyPlanRef.current = null
            setBusyPlan(null)
          }
        })
    })
  }, [adapter, plan, testOnlyExecutionGate, chainCutoverAllowed, fixedNowIso, retirePlan])

  return { plan: activePlan, decision, config, consumeIfGated, v2Pending, cutoverAllowed: chainCutoverAllowed }
}
