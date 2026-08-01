/**
 * Gas readiness for Founder-signed mainnet deployment execution.
 * FUNDING_REQUIRED only when estimate AND balance are both known and insufficient.
 */

import { AUTHORIZED_MELEGA_DEPLOYER } from './founderDeployer'

/**
 * 1e18 as a decimal bigint literal (avoid bigint exponentiation operators).
 * Next/SWC rewrites bigint exponentiation to Math.pow, which throws.
 */
export const WEI_PER_BNB = 1000000000000000000n

export const FOUNDER_GAS_BUFFER_NUM = 135n
export const FOUNDER_GAS_BUFFER_DEN = 100n

export type GasEstimateStatus = 'pending' | 'unavailable' | 'ready'

export type PerTxGasEstimate = {
  stepId: string
  contractName: string
  gasUnits: string
  gasPriceWei: string
  costWei: string
  costBnb: string
}

export type FounderGasReadiness = {
  deployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  estimateStatus: GasEstimateStatus
  balanceWei: string | null
  balanceBnb: string | null
  gasPriceWei: string | null
  gasPriceSource: 'rpc' | 'wallet' | 'none'
  perTx: PerTxGasEstimate[]
  estimatedTotalCostWei: string | null
  estimatedTotalCostBnb: string | null
  recommendedMinimumWei: string | null
  recommendedMinimumBnb: string | null
  shortfallWei: string | null
  shortfallBnb: string | null
  safetyBufferMultiplier: string
  fundingSufficient: boolean | null
  /** Set only when estimateStatus=ready AND balance known AND balance < recommended. */
  pauseCode: 'FOUNDER_DEPLOYER_FUNDING_REQUIRED' | null
  error: string | null
  message: string | null
}

export function weiToBnb(wei: bigint): string {
  const whole = wei / WEI_PER_BNB
  const frac = (wei % WEI_PER_BNB).toString().padStart(18, '0').replace(/0+$/, '')
  return frac.length ? `${whole}.${frac}` : whole.toString()
}

/** Invariant helper used by tests and UI. */
export function fundingRequiredAllowed(input: {
  estimateStatus: GasEstimateStatus
  estimatedTotalCostWei: string | null
  balanceWei: string | null
}): boolean {
  return (
    input.estimateStatus === 'ready' &&
    input.estimatedTotalCostWei != null &&
    input.balanceWei != null
  )
}

export function assessFounderGasReadiness(input: {
  balanceWei: bigint | null | undefined
  estimateStatus: GasEstimateStatus
  gasPriceWei?: bigint | null
  gasPriceSource?: 'rpc' | 'wallet' | 'none'
  perTx?: PerTxGasEstimate[]
  estimatedTotalCostWei?: bigint | null
  error?: string | null
}): FounderGasReadiness {
  const balance = input.balanceWei ?? null
  const estimateStatus = input.estimateStatus
  const perTx = input.perTx ?? []
  const total =
    input.estimatedTotalCostWei != null
      ? input.estimatedTotalCostWei
      : estimateStatus === 'ready' && perTx.length
        ? perTx.reduce((acc, t) => acc + BigInt(t.costWei), 0n)
        : null

  if (estimateStatus !== 'ready' || total == null) {
    return {
      deployer: AUTHORIZED_MELEGA_DEPLOYER,
      estimateStatus,
      balanceWei: balance == null ? null : balance.toString(),
      balanceBnb: balance == null ? null : weiToBnb(balance),
      gasPriceWei: input.gasPriceWei != null ? input.gasPriceWei.toString() : null,
      gasPriceSource: input.gasPriceSource ?? 'none',
      perTx,
      estimatedTotalCostWei: null,
      estimatedTotalCostBnb: null,
      recommendedMinimumWei: null,
      recommendedMinimumBnb: null,
      shortfallWei: null,
      shortfallBnb: null,
      safetyBufferMultiplier: '1.35',
      fundingSufficient: null,
      pauseCode: null,
      error: input.error ?? null,
      message:
        estimateStatus === 'pending'
          ? 'Gas estimate pending — click Estimate Deployment Gas.'
          : input.error
            ? `Gas estimate unavailable: ${input.error}`
            : 'Gas estimate unavailable. Retry Gas Estimate.',
    }
  }

  const buffered = (total * FOUNDER_GAS_BUFFER_NUM) / FOUNDER_GAS_BUFFER_DEN
  const fundingSufficient = balance != null ? balance >= buffered : null
  const pauseCode =
    fundingRequiredAllowed({
      estimateStatus,
      estimatedTotalCostWei: total.toString(),
      balanceWei: balance == null ? null : balance.toString(),
    }) && fundingSufficient === false
      ? ('FOUNDER_DEPLOYER_FUNDING_REQUIRED' as const)
      : null
  const shortfall = balance != null && balance < buffered ? buffered - balance : null

  return {
    deployer: AUTHORIZED_MELEGA_DEPLOYER,
    estimateStatus: 'ready',
    balanceWei: balance == null ? null : balance.toString(),
    balanceBnb: balance == null ? null : weiToBnb(balance),
    gasPriceWei: input.gasPriceWei != null ? input.gasPriceWei.toString() : null,
    gasPriceSource: input.gasPriceSource ?? 'wallet',
    perTx,
    estimatedTotalCostWei: total.toString(),
    estimatedTotalCostBnb: weiToBnb(total),
    recommendedMinimumWei: buffered.toString(),
    recommendedMinimumBnb: weiToBnb(buffered),
    shortfallWei: shortfall == null ? null : shortfall.toString(),
    shortfallBnb: shortfall == null ? null : weiToBnb(shortfall),
    safetyBufferMultiplier: '1.35',
    fundingSufficient,
    pauseCode,
    error: null,
    message: pauseCode
      ? `Additional BNB required. Fund ${AUTHORIZED_MELEGA_DEPLOYER}. Current shortfall ≈ ${weiToBnb(
          shortfall ?? 0n,
        )} BNB.`
      : fundingSufficient
        ? 'Balance sufficient for estimated deployment cost + safety buffer.'
        : 'Gas estimate ready — connect wallet to compare balance.',
  }
}
