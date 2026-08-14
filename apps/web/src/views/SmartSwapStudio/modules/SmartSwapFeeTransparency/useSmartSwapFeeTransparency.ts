/**
 * Builds Module 004 fee transparency from execution-proven facts only.
 */

import { useMemo } from 'react'
import { useSwapState } from 'state/swap/hooks'
import { buildSmartSwapFeeTransparency, type SmartSwapFeeTransparency } from 'lib/smart-swap-fee-transparency'
import type { SmartSwapPreviewResult } from 'lib/smart-swap-execution-preview'

export function useSmartSwapFeeTransparency(previewResult: SmartSwapPreviewResult): SmartSwapFeeTransparency {
  const { typedValue } = useSwapState()
  return useMemo(() => {
    const idle = !typedValue || !String(typedValue).trim()
    if (idle || previewResult.status !== 'ok' || !previewResult.preview) {
      return buildSmartSwapFeeTransparency({
        unavailableReason: idle
          ? 'Enter an amount to preview execution costs.'
          : 'Separate protocol fee is not collected in the current execution path.',
        treasuryStatus: 'available',
        forceShowDestinationOnly: true,
      })
    }

    return buildSmartSwapFeeTransparency({
      swapAmount: previewResult.preview.expectedOutputFormatted,
      freshness: new Date().toISOString(),
      unavailableReason: 'Separate protocol fee is not collected in the current execution path.',
      treasuryStatus: 'available',
      forceShowDestinationOnly: true,
      feeCollectionProven: false,
    })
  }, [previewResult, typedValue])
}
