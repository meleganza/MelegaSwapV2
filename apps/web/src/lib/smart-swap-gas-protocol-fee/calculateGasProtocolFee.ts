import { MELEGA_TREASURY_FEE_DESTINATION, SMART_ROUTER_FEE_FROM_SCHEDULE } from 'config/constants/feeSchedule'
import { MELEGA_TREASURY_WALLET_LABEL, resolveCanonicalFeeBeneficiary } from 'config/dexEconomicAuthority'
import {
  SMART_ROUTER_GAS_PROTOCOL_FEE_BPS,
  SMART_ROUTER_GAS_PROTOCOL_FEE_PERCENT,
  type CalculateSmartRouterGasProtocolFeeInput,
  type SmartRouterFeeAsset,
  type SmartRouterGasProtocolFee,
} from './types'

function toBigInt(value: string | number | bigint): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) throw new Error('Invalid numeric fee input')
    return BigInt(Math.trunc(value))
  }
  const trimmed = String(value).trim()
  if (!/^\d+$/.test(trimmed)) throw new Error(`Invalid wei/units string: ${value}`)
  return BigInt(trimmed)
}

function feeAssetForChain(chainId: number): SmartRouterFeeAsset {
  if (chainId === 56) return 'BNB'
  if (chainId === 8453 || chainId === 1 || chainId === 42161) return 'ETH'
  if (chainId === 137) return 'POL'
  if (chainId === 43114) return 'AVAX'
  throw new Error(`Smart Router gas fee unsupported on chain ${chainId}`)
}

/**
 * Canonical Smart Router protocol fee at confirmation time.
 * feeWei = floor(gasEstimateUnits * gasPriceWei * 2500 / 10000)
 *
 * Final — no later adjustment, no refund vs actual gas used.
 * Economics unchanged across chains; settlement asset is the chain native gas token.
 */
export function calculateSmartRouterGasProtocolFee(
  input: CalculateSmartRouterGasProtocolFeeInput,
): SmartRouterGasProtocolFee {
  const chainId = input.chainId ?? 56
  const beneficiary = resolveCanonicalFeeBeneficiary(chainId)
  if (!beneficiary) {
    throw new Error(`No canonical fee beneficiary for chain ${chainId}`)
  }
  const feeAsset = feeAssetForChain(chainId)

  const gasEstimateUnits = toBigInt(input.gasEstimateUnits)
  const gasPriceWei = toBigInt(input.gasPriceWei)
  if (gasEstimateUnits < 0n || gasPriceWei < 0n) {
    throw new Error('Gas estimate and gas price must be non-negative')
  }

  // Lock schedule truth: Founder fee-schedule.json smartRouter.fee
  if (SMART_ROUTER_FEE_FROM_SCHEDULE.kind !== 'percent_of_dex_gas_fees') {
    throw new Error('Founder schedule smartRouter.fee.kind mismatch')
  }
  if (SMART_ROUTER_FEE_FROM_SCHEDULE.bps !== SMART_ROUTER_GAS_PROTOCOL_FEE_BPS) {
    throw new Error('Founder schedule smartRouter.fee.bps mismatch')
  }

  const estimatedGasCostWei = gasEstimateUnits * gasPriceWei
  const feeWei = (estimatedGasCostWei * BigInt(SMART_ROUTER_GAS_PROTOCOL_FEE_BPS)) / 10_000n

  const recipient = MELEGA_TREASURY_FEE_DESTINATION
  if (recipient.toLowerCase() !== beneficiary.address.toLowerCase()) {
    throw new Error('Treasury recipient mismatch')
  }
  if (recipient.toLowerCase() !== '0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b') {
    throw new Error('Treasury recipient mismatch')
  }

  return {
    schema: 'melega.smart-swap.gas-protocol-fee.v1',
    kind: 'percent_of_dex_gas_fees',
    bps: SMART_ROUTER_GAS_PROTOCOL_FEE_BPS,
    percent: SMART_ROUTER_GAS_PROTOCOL_FEE_PERCENT,
    chainId,
    gasEstimateUnits: gasEstimateUnits.toString(),
    gasPriceWei: gasPriceWei.toString(),
    estimatedGasCostWei: estimatedGasCostWei.toString(),
    feeWei: feeWei.toString(),
    feeAsset,
    recipient,
    recipientLabel: MELEGA_TREASURY_WALLET_LABEL,
    finalizedAtConfirmation: true,
    refundAllowed: false,
    laterAdjustmentAllowed: false,
  }
}

/** Human-readable native amount (up to 8 decimals, trimmed). */
export function formatFeeWeiAsBnb(feeWei: string): string {
  const wei = toBigInt(feeWei)
  // Keep this as a literal: Next/SWC can rewrite bigint exponentiation to
  // Math.pow, which throws in the browser when passed bigint operands.
  const weiPerNativeToken = 1000000000000000000n
  const whole = wei / weiPerNativeToken
  const frac = wei % weiPerNativeToken
  if (frac === 0n) return whole.toString()
  const fracStr = frac.toString().padStart(18, '0').replace(/0+$/, '').slice(0, 8)
  return `${whole}.${fracStr}`
}

export const formatFeeWeiAsNative = formatFeeWeiAsBnb

export function isCanonicalTreasuryRecipient(address: string | null | undefined): boolean {
  if (!address) return false
  return address.toLowerCase() === MELEGA_TREASURY_FEE_DESTINATION.toLowerCase()
}
