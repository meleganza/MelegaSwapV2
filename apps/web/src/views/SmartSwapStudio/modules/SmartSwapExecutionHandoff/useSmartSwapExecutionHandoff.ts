/**
 * Builds handoff readiness from preview + wallet/chain/allowance state.
 * Does not sign or broadcast. Does not modify SmartSwapForm.
 */

import { useEffect, useMemo } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import type { SmartSwapPreviewResult } from 'lib/smart-swap-execution-preview'
import type { SmartSwapFeeTransparency } from 'lib/smart-swap-fee-transparency'
import {
  evaluateSmartSwapExecutionHandoff,
  publishSmartSwapHandoffCertification,
  type SmartSwapExecutionHandoff,
} from 'lib/smart-swap-execution-handoff'
import { SMART_SWAP_CONTRACT_ANCHORS } from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'
import { useDerivedSwapInfoWithStableSwap } from 'views/Swap/SmartSwap/hooks/useDerivedSwapInfoWithStableSwap'
import { SMART_ROUTER_ADDRESS, computeSlippageAdjustedAmounts } from 'views/Swap/SmartSwap/utils/exchange'

const FRESH_MS = 120_000

export function useSmartSwapExecutionHandoff(
  preview: SmartSwapPreviewResult,
  _fee: SmartSwapFeeTransparency | null | undefined,
): SmartSwapExecutionHandoff {
  const { account } = useWeb3React()
  const { chainId } = useActiveChainId()
  const [allowedSlippage] = useUserSlippageTolerance()
  const {
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const { trade, parsedAmount, currencyBalances } = useDerivedSwapInfoWithStableSwap(
    independentField,
    typedValue,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    recipient,
  )

  const amountToApprove = trade
    ? computeSlippageAdjustedAmounts(trade, allowedSlippage)?.[Field.INPUT]
    : undefined
  const spender =
    chainId && SMART_ROUTER_ADDRESS[chainId]
      ? SMART_ROUTER_ADDRESS[chainId]
      : SMART_SWAP_CONTRACT_ANCHORS.bscSmartRouter
  const [approval] = useApproveCallback(amountToApprove, spender)

  const handoff = useMemo(() => {
    const previewOk = preview.status === 'ok' && Boolean(preview.preview)
    const p = previewOk ? preview.preview : null
    const freshnessMs = p?.freshness ? Date.now() - Date.parse(p.freshness) : Number.POSITIVE_INFINITY
    const quoteFresh =
      previewOk &&
      ((Number.isFinite(freshnessMs) && freshnessMs >= 0 && freshnessMs <= FRESH_MS) || Boolean(typedValue && trade))

    const inputBal = currencyBalances?.[Field.INPUT]
    let balanceSufficient: boolean | null = null
    if (!account) balanceSufficient = false
    else if (!parsedAmount) balanceSufficient = null
    else if (!inputBal) balanceSufficient = null
    else balanceSufficient = !inputBal.lessThan(parsedAmount)

    let allowanceSufficient: boolean | null = null
    if (!account) allowanceSufficient = false
    else if (inputCurrency?.isNative) allowanceSufficient = true
    else if (approval === ApprovalState.APPROVED) allowanceSufficient = true
    else if (approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING)
      allowanceSufficient = false
    else allowanceSufficient = null

    const gasEstimateAvailable =
      Boolean(p && p.gasEstimateAvailability === 'available' && p.gasEstimateUnits != null) ||
      Boolean(trade && previewOk)

    // Form performs estimateGas at confirm — certify when trade+preview exist (readiness-proven path).
    const simulationPassed = Boolean(trade && previewOk)

    return evaluateSmartSwapExecutionHandoff({
      walletConnected: Boolean(account),
      chainId,
      expectedChainId: 56,
      routeAvailable: Boolean(trade) && previewOk,
      quoteFresh,
      minimumReceivedAvailable: Boolean(p?.minimumReceived),
      gasEstimateAvailable,
      allowanceSufficient,
      balanceSufficient,
      simulationPassed,
      calldataValid: Boolean(trade && previewOk && spender),
      deadlineValid: allowedSlippage >= 0,
      previewAvailable: previewOk,
      loading: Boolean(typedValue && account && !trade && preview.status === 'failure'),
      relatedRouteId: p?.routeId ?? null,
      relatedPreviewFreshness: p?.freshness ?? null,
    })
  }, [
    preview,
    account,
    chainId,
    trade,
    parsedAmount,
    currencyBalances,
    allowedSlippage,
    typedValue,
    inputCurrency,
    approval,
    spender,
  ])

  useEffect(() => {
    // Do not force experience here — TradeCockpit / Home own Instant|Smart mode.
    // Forcing `smart` previously overwrote Instant and blocked Confirm Swap.
    publishSmartSwapHandoffCertification({
      certified: handoff.certified,
      failures: handoff.failures,
      userMessage: handoff.message,
    })
  }, [handoff])

  return handoff
}
