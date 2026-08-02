/**
 * Founder Smart Router protocol fee — 25% of estimated DEX gas fee,
 * settled as native BNB directly to MELEGA TREASURY WALLET.
 */

export const SMART_ROUTER_GAS_PROTOCOL_FEE_BPS = 2500 as const
export const SMART_ROUTER_GAS_PROTOCOL_FEE_PERCENT = 25 as const

export type SmartRouterGasProtocolFee = {
  schema: 'melega.smart-swap.gas-protocol-fee.v1'
  kind: 'percent_of_dex_gas_fees'
  bps: typeof SMART_ROUTER_GAS_PROTOCOL_FEE_BPS
  percent: typeof SMART_ROUTER_GAS_PROTOCOL_FEE_PERCENT
  gasEstimateUnits: string
  gasPriceWei: string
  /** estimatedGasCostWei = gasEstimateUnits * gasPriceWei */
  estimatedGasCostWei: string
  /** feeWei = estimatedGasCostWei * bps / 10_000 */
  feeWei: string
  feeAsset: 'BNB'
  recipient: `0x${string}`
  recipientLabel: 'MELEGA TREASURY WALLET'
  finalizedAtConfirmation: true
  refundAllowed: false
  laterAdjustmentAllowed: false
}

export type CalculateSmartRouterGasProtocolFeeInput = {
  gasEstimateUnits: string | number | bigint
  gasPriceWei: string | number | bigint
}
