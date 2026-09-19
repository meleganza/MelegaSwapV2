/**
 * Builds Module 003 preview from shared swap state (same atoms as SmartSwapForm).
 * Does not modify SmartSwapForm or execute swaps.
 */

import { useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { useDerivedSwapInfoWithStableSwap } from 'views/Swap/SmartSwap/hooks/useDerivedSwapInfoWithStableSwap'
import { computeTradePriceBreakdown } from 'views/Swap/SmartSwap/utils/exchange'
import { SMART_SWAP_PREVIEW_GAS_UNITS } from 'lib/smart-swap-gas-protocol-fee'
import {
  buildSmartSwapExecutionPreview,
  buildPreviewInputFromTrade,
  previewFailure,
  type SmartSwapPreviewResult,
} from 'lib/smart-swap-execution-preview'
import { useShadowRuntimePreflight, type ShadowRuntimePreflight } from './useShadowRuntimePreflight'

export type SmartSwapExecutionPreviewWithShadow = SmartSwapPreviewResult & {
  shadowRuntime: ShadowRuntimePreflight
}

export function useSmartSwapExecutionPreview(): SmartSwapExecutionPreviewWithShadow {
  const {
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const [allowedSlippage] = useUserSlippageTolerance()

  const { trade, parsedAmount } = useDerivedSwapInfoWithStableSwap(
    independentField,
    typedValue,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    recipient,
  )
  const shadowRuntime = useShadowRuntimePreflight()

  const preview = useMemo(() => {
    try {
      if (!typedValue || !parsedAmount) {
        return previewFailure('QUOTE_UNAVAILABLE', 'Enter an amount to preview execution.')
      }
      if (!inputCurrency || !outputCurrency) {
        return previewFailure('PARTIAL_DATA', 'Select input and output tokens.')
      }
      if (!trade) {
        return previewFailure('NO_ROUTE', 'No executable route for this pair and amount.')
      }

      let parsedImpact: number | null = null
      try {
        const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
        parsedImpact = priceImpactWithoutFee ? Number(priceImpactWithoutFee.toFixed(4)) : null
      } catch {
        parsedImpact = null
      }
      const hopCount = Math.max(1, trade.route?.pairs?.length ?? 1)
      // Pre-confirmation estimate: the wallet confirmation flow still performs the
      // authoritative live estimateGas call. Scale the preview with the actual route.
      const gasUnits = SMART_SWAP_PREVIEW_GAS_UNITS + Math.max(0, hopCount - 1) * 70_000

      const input = buildPreviewInputFromTrade({
        trade,
        slippageBips: allowedSlippage,
        gasUnits,
        priceImpactPercent: Number.isFinite(parsedImpact) ? parsedImpact : null,
        freshness: new Date().toISOString(),
        nowIso: new Date().toISOString(),
      })

      if (!input) {
        return previewFailure('EXECUTION_UNAVAILABLE', 'Could not adapt trade into execution preview.')
      }

      return buildSmartSwapExecutionPreview(input)
    } catch {
      return previewFailure('EXECUTION_UNAVAILABLE', 'Could not adapt trade into execution preview.')
    }
  }, [typedValue, parsedAmount, inputCurrency, outputCurrency, trade, allowedSlippage])

  return { ...preview, shadowRuntime }
}
