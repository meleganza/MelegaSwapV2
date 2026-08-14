import { useMemo } from 'react'
import { useGasPrice } from 'state/user/hooks'
import { buildGasProtocolFeeSettlementPlan, type GasProtocolFeeSettlementPlan } from './settleGasProtocolFee'

/** Default swap gas units for pre-confirmation preview (confirmation uses estimateGas). */
export const SMART_SWAP_PREVIEW_GAS_UNITS = 220_000

/**
 * Preview of Founder 25% gas protocol fee for Smart Swap UI.
 * This hook does not collect: atomic settlement requires the deployed wrapper.
 */
export function useSmartSwapGasProtocolFeePreview(
  gasUnits?: number | null,
  chainId?: number,
): GasProtocolFeeSettlementPlan | null {
  const gasPrice = useGasPrice(chainId)

  return useMemo(() => {
    const normalizedChainId = Number(chainId ?? 56)
    const liveGasPrice = gasPrice?.toString?.() ?? ''
    // Keep the fee preview consistent with the gas-cost preview. BNB Chain has
    // a canonical 5 gwei pre-confirmation fallback; wallet confirmation still
    // recomputes from estimateGas and the live wallet gas price.
    const gasPriceWei = /^\d+$/.test(liveGasPrice) && liveGasPrice !== '0'
      ? (normalizedChainId === 56 || normalizedChainId === 97) && Number(liveGasPrice) < 1_000_000_000
        ? String(Number(liveGasPrice) * 1_000_000_000)
        : liveGasPrice
      : normalizedChainId === 56 || normalizedChainId === 97
        ? '5000000000'
        : null
    if (!gasPriceWei) return null
    try {
      return buildGasProtocolFeeSettlementPlan({
        gasEstimateUnits: gasUnits && gasUnits > 0 ? gasUnits : SMART_SWAP_PREVIEW_GAS_UNITS,
        gasPriceWei,
        chainId: normalizedChainId,
      })
    } catch {
      return null
    }
  }, [gasPrice, gasUnits, chainId])
}
