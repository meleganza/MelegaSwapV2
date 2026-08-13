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

export function useSmartSwapExecutionPreview(): SmartSwapPreviewResult {
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

  return useMemo(() => {
    if (!typedValue || !parsedAmount) {
      return previewFailure('QUOTE_UNAVAILABLE', 'Enter an amount to preview execution.')
    }
    if (!inputCurrency || !outputCurrency) {
      return previewFailure('PARTIAL_DATA', 'Select input and output tokens.')
    }
    if (!trade) {
      return previewFailure('NO_ROUTE', 'No executable route for this pair and amount.')
    }

    const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
    const parsedImpact = priceImpactWithoutFee ? Number(priceImpactWithoutFee.toFixed(4)) : null
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
  }, [typedValue, parsedAmount, inputCurrency, outputCurrency, trade, allowedSlippage])
}
