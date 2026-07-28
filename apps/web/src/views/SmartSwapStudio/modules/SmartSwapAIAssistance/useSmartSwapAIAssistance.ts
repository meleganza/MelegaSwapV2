/**
 * Builds Module 006 assistance from preview + fee transparency (read-only).
 * Optional — never blocks execution.
 */

import { useMemo } from 'react'
import type { SmartSwapPreviewResult } from 'lib/smart-swap-execution-preview'
import type { SmartSwapFeeTransparency } from 'lib/smart-swap-fee-transparency'
import {
  aiContextFromPreviewAndFee,
  buildSmartSwapAIAssistance,
  type SmartSwapAIAssistanceResult,
} from 'lib/smart-swap-ai-assistance'

export function useSmartSwapAIAssistance(
  preview: SmartSwapPreviewResult,
  fee: SmartSwapFeeTransparency | null | undefined,
): SmartSwapAIAssistanceResult {
  return useMemo(() => {
    const ctx = aiContextFromPreviewAndFee({ preview, fee })
    return buildSmartSwapAIAssistance(ctx)
  }, [preview, fee])
}
