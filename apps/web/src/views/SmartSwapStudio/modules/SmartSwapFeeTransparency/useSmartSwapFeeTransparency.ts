/**
 * Builds Module 004 fee transparency from shared swap state + Module 003 preview.
 * Consumes canonical fee engine for amounts/rates — does not mutate fees.
 */

import { useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { useDerivedSwapInfoWithStableSwap } from 'views/Swap/SmartSwap/hooks/useDerivedSwapInfoWithStableSwap'
import { computeGrossProtocolFeeAmount, resolveSwapProtocolFeeContext } from 'lib/d87-pricing'
import {
  buildSmartSwapFeeTransparency,
  feeTransparencyInputFromPreview,
  type SmartSwapFeeTransparency,
} from 'lib/smart-swap-fee-transparency'
import type { SmartSwapPreviewResult } from 'lib/smart-swap-execution-preview'
import { useActiveChainId } from 'hooks/useActiveChainId'

export function useSmartSwapFeeTransparency(previewResult: SmartSwapPreviewResult): SmartSwapFeeTransparency {
  const {
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const { chainId } = useActiveChainId()

  const { trade, parsedAmount } = useDerivedSwapInfoWithStableSwap(
    independentField,
    typedValue,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    recipient,
  )

  return useMemo(() => {
    if (previewResult.status !== 'ok' || !previewResult.preview) {
      return buildSmartSwapFeeTransparency({
        unavailableReason: 'Fee information unavailable',
      })
    }

    let feeAmount: string | null = null
    let protocolFeeBps: number | null = previewResult.preview.protocolFee.bps
    let buyMarcoApplied: boolean | null =
      previewResult.preview.protocolFee.rule === 'buy-marco'
        ? true
        : previewResult.preview.protocolFee.rule === 'standard'
          ? false
          : null

    if (trade && parsedAmount) {
      try {
        // Canonical fee engine — Smart Swap does not implement fee math.
        feeAmount = computeGrossProtocolFeeAmount(trade as Parameters<typeof computeGrossProtocolFeeAmount>[0])
        const ctx = resolveSwapProtocolFeeContext(trade, chainId)
        protocolFeeBps = ctx.protocolFeeBps
        buyMarcoApplied = ctx.buyMarcoApplied
      } catch {
        feeAmount = null
      }
    }

    const input = feeTransparencyInputFromPreview({
      preview: previewResult.preview,
      feeAmount,
      // Display-only policy path is factual (owner = Treasury Runtime). No settlement call.
      treasuryStatus: 'available',
      // KERL attribution status is known as the attribution layer; rewards are never shown.
      kerlStatus: 'available',
    })

    if (!input) {
      return buildSmartSwapFeeTransparency({
        unavailableReason: 'Fee information unavailable',
      })
    }

    return buildSmartSwapFeeTransparency({
      ...input,
      protocolFeeBps,
      buyMarcoApplied,
      freshness: new Date().toISOString(),
    })
  }, [previewResult, trade, parsedAmount, chainId])
}
