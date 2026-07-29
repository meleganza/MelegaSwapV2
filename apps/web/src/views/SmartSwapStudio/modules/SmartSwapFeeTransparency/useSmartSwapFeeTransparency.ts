/**
 * Builds Module 004 fee transparency from shared swap state + Module 003 preview.
 * Does not claim unproven protocol fee collection or Treasury Runtime authority.
 */

import { useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { useDerivedSwapInfoWithStableSwap } from 'views/Swap/SmartSwap/hooks/useDerivedSwapInfoWithStableSwap'
import { resolveSwapProtocolFeeContext } from 'lib/d87-pricing'
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
        treasuryStatus: 'available',
        forceShowDestinationOnly: true,
      })
    }

    let protocolFeeBps: number | null = previewResult.preview.protocolFee.bps
    let buyMarcoApplied: boolean | null =
      previewResult.preview.protocolFee.rule === 'buy-marco'
        ? true
        : previewResult.preview.protocolFee.rule === 'standard'
          ? false
          : null

    if (trade && parsedAmount) {
      try {
        const ctx = resolveSwapProtocolFeeContext(trade, chainId)
        protocolFeeBps = ctx.protocolFeeBps
        buyMarcoApplied = ctx.buyMarcoApplied
      } catch {
        protocolFeeBps = null
      }
    }

    const input = feeTransparencyInputFromPreview({
      preview: previewResult.preview,
      // Protocol fee amount not proven in Pancake/Melega router calldata (wrapper undeployed).
      feeAmount: null,
      treasuryStatus: 'available',
      kerlStatus: 'unavailable',
    })

    if (!input) {
      return buildSmartSwapFeeTransparency({
        unavailableReason: 'Fee information unavailable',
        treasuryStatus: 'available',
        forceShowDestinationOnly: true,
      })
    }

    return buildSmartSwapFeeTransparency({
      ...input,
      protocolFeeBps,
      buyMarcoApplied,
      feeCollectionProven: false,
      forceShowDestinationOnly: true,
      freshness: new Date().toISOString(),
    })
  }, [previewResult, trade, parsedAmount, chainId])
}
