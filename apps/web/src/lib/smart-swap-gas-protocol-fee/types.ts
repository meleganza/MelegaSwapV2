/**
 * Founder Smart Router protocol fee — 25% of estimated DEX gas fee,
 * settled as the chain's native gas asset directly to MELEGA TREASURY WALLET.
 * Economics (25% / 2500 bps) are chain-invariant; settlement asset follows the active chain.
 */

export const SMART_ROUTER_GAS_PROTOCOL_FEE_BPS = 2500 as const
export const SMART_ROUTER_GAS_PROTOCOL_FEE_PERCENT = 25 as const

export type SmartRouterFeeAsset = 'BNB' | 'ETH' | 'POL' | 'AVAX'

export type SmartRouterGasProtocolFee = {
  schema: 'melega.smart-swap.gas-protocol-fee.v1'
  kind: 'percent_of_dex_gas_fees'
  bps: typeof SMART_ROUTER_GAS_PROTOCOL_FEE_BPS
  percent: typeof SMART_ROUTER_GAS_PROTOCOL_FEE_PERCENT
  chainId: number
  gasEstimateUnits: string
  gasPriceWei: string
  /** estimatedGasCostWei = gasEstimateUnits * gasPriceWei */
  estimatedGasCostWei: string
  /** feeWei = estimatedGasCostWei * bps / 10_000 */
  feeWei: string
  feeAsset: SmartRouterFeeAsset
  recipient: `0x${string}`
  recipientLabel: 'MELEGA TREASURY WALLET'
  finalizedAtConfirmation: true
  refundAllowed: false
  laterAdjustmentAllowed: false
}

export type CalculateSmartRouterGasProtocolFeeInput = {
  gasEstimateUnits: string | number | bigint
  gasPriceWei: string | number | bigint
  /** Active wallet chain — 56 ⇒ BNB, 8453 ⇒ ETH. Unsupported ⇒ throw. */
  chainId?: number
}
