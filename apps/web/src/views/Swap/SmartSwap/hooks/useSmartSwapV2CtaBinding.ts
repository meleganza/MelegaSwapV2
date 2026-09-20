/**
 * Minimal CTA binding for SmartSwap V2.
 * Production executor config is NOT_CONFIGURED, so this always fail-closes to LEGACY.
 * Does not run SHADOW preflight or invent an executor address.
 */

import { useCallback, useMemo } from 'react'
import { useAccount, useProvider, useSigner } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { isProductionCutoverAllowed } from 'lib/smartswap-universal-engine/operatingMode'
import { resolveV2ExecutorConfig } from 'lib/smartswap-universal-engine/v2ExecutionRuntimeConfig'
import {
  V2_TEST_ONLY_CTA_EXECUTION_GATE,
  buildV2UserExecutionPlan,
  consumePreparedV2UserPlan,
  resolveSmartSwapCtaDecision,
} from 'lib/smartswap-universal-engine/v2UserExecutionPlan'

export function useSmartSwapV2CtaBinding() {
  const { address } = useAccount()
  const { chainId } = useActiveChainId()
  const { data: signer } = useSigner()
  const provider = useProvider({ chainId })
  const walletChainId = Number(chainId || 0)
  const config = resolveV2ExecutorConfig(walletChainId)

  const plan = useMemo(
    () =>
      buildV2UserExecutionPlan({
        user: address ?? null,
        walletChainId,
        request: null,
        requestKey: null,
        shadow: null,
        allowanceReadStatus: 'unread',
        nowIso: new Date().toISOString(),
        deadline: Math.floor(Date.now() / 1000) + 1_200,
      }),
    [address, walletChainId],
  )

  const decision = useMemo(
    () =>
      resolveSmartSwapCtaDecision({
        planOk: plan.ok,
        cutoverAllowed: isProductionCutoverAllowed(),
        testOnlyExecutionGate: V2_TEST_ONLY_CTA_EXECUTION_GATE,
        planReason: plan.reason,
      }),
    [plan.ok, plan.reason],
  )

  const consumeIfGated = useCallback(() => {
    return consumePreparedV2UserPlan({
      plan,
      testOnlyExecutionGate: V2_TEST_ONLY_CTA_EXECUTION_GATE,
      cutoverAllowed: isProductionCutoverAllowed(),
      submitUserTransaction: async (tx) => {
        if (!signer || typeof signer.sendTransaction !== 'function') {
          throw new Error('V2_WALLET_NOT_CONNECTED')
        }
        const response = await signer.sendTransaction({
          from: tx.from,
          to: tx.to,
          data: tx.data,
          value: tx.value,
          chainId: tx.chainId,
        })
        return { hash: response.hash }
      },
      waitForReceipt: async (hash) => {
        const receipt = await provider.waitForTransaction(hash)
        if (!receipt) throw new Error('V2_TX_NO_RECEIPT')
        return { status: receipt.status ?? 0 }
      },
    })
  }, [plan, provider, signer])

  return { plan, decision, config, consumeIfGated }
}
