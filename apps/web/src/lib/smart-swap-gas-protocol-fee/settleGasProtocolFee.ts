import type { BigNumber } from '@ethersproject/bignumber'
import type { Signer } from '@ethersproject/abstract-signer'
import { calculateSmartRouterGasProtocolFee, formatFeeWeiAsBnb } from './calculateGasProtocolFee'
import type { SmartRouterGasProtocolFee } from './types'

export type GasProtocolFeeSettlementPlan = {
  fee: SmartRouterGasProtocolFee
  /** Native BNB transfer tx params — wallet-signed, no server signer. */
  transfer: {
    to: `0x${string}`
    value: string
    data: '0x'
  }
  display: {
    estimatedGasBnb: string
    protocolFeeBnb: string
    protocolFeeLabel: string
    destinationLabel: string
  }
}

/**
 * Build the confirmation-final fee plan from gas estimate + gas price.
 * Does not broadcast. Does not use Treasury Runtime or KERL.
 */
export function buildGasProtocolFeeSettlementPlan(input: {
  gasEstimateUnits: string | number | bigint | BigNumber
  gasPriceWei: string | number | bigint | BigNumber
}): GasProtocolFeeSettlementPlan {
  const gasEstimateUnits =
    typeof input.gasEstimateUnits === 'object' && input.gasEstimateUnits && 'toString' in input.gasEstimateUnits
      ? input.gasEstimateUnits.toString()
      : (input.gasEstimateUnits as string | number | bigint)
  const gasPriceWei =
    typeof input.gasPriceWei === 'object' && input.gasPriceWei && 'toString' in input.gasPriceWei
      ? input.gasPriceWei.toString()
      : (input.gasPriceWei as string | number | bigint)

  const fee = calculateSmartRouterGasProtocolFee({ gasEstimateUnits, gasPriceWei })
  return {
    fee,
    transfer: {
      to: fee.recipient,
      value: fee.feeWei,
      data: '0x',
    },
    display: {
      estimatedGasBnb: formatFeeWeiAsBnb(fee.estimatedGasCostWei),
      protocolFeeBnb: formatFeeWeiAsBnb(fee.feeWei),
      protocolFeeLabel: `${fee.percent}% of estimated gas`,
      destinationLabel: `${fee.recipientLabel} (${fee.recipient})`,
    },
  }
}

/**
 * Wallet-signed native BNB transfer to MELEGA TREASURY WALLET.
 * Must run in the same confirmation flow as the swap (fee finalized from estimate).
 */
export async function settleGasProtocolFeeOnChain(input: {
  signer: Signer
  plan: GasProtocolFeeSettlementPlan
  gasPriceWei?: string
}): Promise<{ hash: string; feeWei: string; recipient: string } | null> {
  const { plan, signer } = input
  if (plan.fee.feeWei === '0') return null

  const tx = await signer.sendTransaction({
    to: plan.transfer.to,
    value: plan.transfer.value,
    data: plan.transfer.data,
    ...(input.gasPriceWei ? { gasPrice: input.gasPriceWei } : {}),
  })

  return {
    hash: tx.hash,
    feeWei: plan.fee.feeWei,
    recipient: plan.fee.recipient,
  }
}
