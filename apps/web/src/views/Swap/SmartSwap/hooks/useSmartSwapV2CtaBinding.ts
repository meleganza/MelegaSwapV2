/**
 * Real-runtime SmartSwap V2 CTA binding.
 * Consumes the same #82 request + shadow already associated with current SmartSwap UI state.
 * Production executor config is NOT_CONFIGURED and the test-only gate stays false, so public CTA remains LEGACY.
 */

import { useCallback, useMemo, useRef } from 'react'
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
  resolveV2ExecutorConfig,
  type V2ExecutorConfigTable,
} from 'lib/smartswap-universal-engine/v2ExecutionRuntimeConfig'
import type { ObservedAllowanceIdentity } from 'lib/smartswap-universal-engine/v2ExecutionBinding'
import {
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
}

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
  })
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
}) {
  const { address } = useAccount()
  const { chainId } = useActiveChainId()
  const walletChainId = Number(chainId || 0)
  const runtime = useSmartSwapShadowRuntimeFacts()
  const config = resolveV2ExecutorConfig(walletChainId, options?.executorConfigByChain)
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
    ],
  )

  const decision = useMemo(
    () =>
      resolveSmartSwapCtaDecision({
        planOk: plan.ok,
        cutoverAllowed: isProductionCutoverAllowed(),
        testOnlyExecutionGate,
        planReason: plan.reason,
      }),
    [plan.ok, plan.reason, testOnlyExecutionGate],
  )

  const consumeInflight = useRef<Promise<string> | null>(null)
  const consumeForPlan = useRef(plan)
  const consumeIfGated = useCallback(() => {
    if (consumeForPlan.current !== plan) {
      consumeForPlan.current = plan
      consumeInflight.current = null
    }
    return runExclusiveCtaConsume(consumeInflight, () =>
      consumePreparedV2UserPlan({
        plan,
        testOnlyExecutionGate,
        cutoverAllowed: isProductionCutoverAllowed(),
        submitUserTransaction: adapter.submitUserTransaction,
        waitForReceipt: adapter.waitForReceipt,
      }),
    )
  }, [adapter, plan, testOnlyExecutionGate])

  return { plan, decision, config, consumeIfGated }
}
