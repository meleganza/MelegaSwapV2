/**
 * Builds Module 004 fee transparency from Founder Smart Router gas protocol fee.
 * 25% of estimated gas → MELEGA TREASURY WALLET. Direct wallet settlement only.
 */

import { useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import {
  MELEGA_TREASURY_WALLET_ADDRESS,
  MELEGA_TREASURY_WALLET_LABEL,
  DEX_ECONOMIC_AUTHORITY,
} from 'config/dexEconomicAuthority'
import {
  buildSmartSwapFeeTransparency,
  type SmartSwapFeeTransparency,
} from 'lib/smart-swap-fee-transparency'
import type { SmartSwapPreviewResult } from 'lib/smart-swap-execution-preview'
import { useSmartSwapGasProtocolFeePreview } from 'lib/smart-swap-gas-protocol-fee'

export function useSmartSwapFeeTransparency(previewResult: SmartSwapPreviewResult): SmartSwapFeeTransparency {
  const {
    typedValue,
  } = useSwapState()
  const gasFeePlan = useSmartSwapGasProtocolFeePreview(
    previewResult.status === 'ok' ? previewResult.preview?.gasEstimateUnits ?? null : null,
  )

  return useMemo(() => {
    const idle = !typedValue || !String(typedValue).trim()
    if (idle || previewResult.status !== 'ok' || !previewResult.preview) {
      return buildSmartSwapFeeTransparency({
        unavailableReason: idle ? 'Enter an amount to preview protocol fee.' : 'Fee information unavailable',
        treasuryStatus: 'available',
        forceShowDestinationOnly: true,
      })
    }

    if (!gasFeePlan) {
      return buildSmartSwapFeeTransparency({
        unavailableReason: 'Gas price unavailable — protocol fee pending',
        treasuryStatus: 'available',
        forceShowDestinationOnly: true,
      })
    }

    const feeBnb = gasFeePlan.display.protocolFeeBnb
    const gasBnb = gasFeePlan.display.estimatedGasBnb

    return {
      swapAmount: previewResult.preview.expectedOutputFormatted,
      feeAmount: feeBnb,
      feeAsset: 'BNB',
      feeRate: '2500 bps (25% of estimated gas)',
      protocolFee: {
        bps: 2500,
        label: `${feeBnb} BNB (25% of estimated gas)`,
        buyMarcoApplied: null,
      },
      treasuryDestination: `${MELEGA_TREASURY_WALLET_LABEL} (${MELEGA_TREASURY_WALLET_ADDRESS})`,
      allocationStatus: 'factual' as const,
      economicAttribution: null,
      source: 'melega.founder-fee-schedule.smartRouter',
      freshness: new Date().toISOString(),
      unavailableReason: null,
      state: 'AVAILABLE' as const,
      explanation: `Smart Router protocol fee is 25% of estimated DEX gas (${gasBnb} BNB est.). Settles as native BNB to ${MELEGA_TREASURY_WALLET_LABEL}. Finalized at wallet confirmation. Direct on-chain transfer — no intermediary settlement authority.`,
      flowSteps: [
        { label: 'Estimated gas', value: `${gasBnb} BNB` },
        { label: 'Protocol fee', value: `${feeBnb} BNB · 25% of estimated gas` },
        {
          label: 'Fee destination',
          value: `${MELEGA_TREASURY_WALLET_LABEL} (${MELEGA_TREASURY_WALLET_ADDRESS})`,
        },
        { label: 'Execution', value: DEX_ECONOMIC_AUTHORITY.executionModel },
      ],
    }
  }, [previewResult, gasFeePlan, typedValue])
}
