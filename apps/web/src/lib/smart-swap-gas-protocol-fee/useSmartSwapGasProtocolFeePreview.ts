import { useMemo } from 'react'
import { useGasPrice } from 'state/user/hooks'
import { buildGasProtocolFeeSettlementPlan, type GasProtocolFeeSettlementPlan } from './settleGasProtocolFee'

/** Default swap gas units for pre-confirmation preview (confirmation uses estimateGas). */
export const SMART_SWAP_PREVIEW_GAS_UNITS = 220_000

/**
 * Preview of Founder 25% gas protocol fee for Smart Swap UI.
 * Confirmation-time fee is recomputed from the live estimateGas result.
 */
export function useSmartSwapGasProtocolFeePreview(gasUnits?: number | null): GasProtocolFeeSettlementPlan | null {
  const gasPrice = useGasPrice()

  return useMemo(() => {
    if (!gasPrice || gasPrice === '0') return null
    try {
      return buildGasProtocolFeeSettlementPlan({
        gasEstimateUnits: gasUnits && gasUnits > 0 ? gasUnits : SMART_SWAP_PREVIEW_GAS_UNITS,
        gasPriceWei: gasPrice,
      })
    } catch {
      return null
    }
  }, [gasPrice, gasUnits])
}
