/**
 * Gas readiness for Founder-signed mainnet deployment execution.
 * Estimates only — never auto-transfers BNB. Funding pauses are operational, not code blockers.
 */

import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_MINIMUM_DEPLOY_BALANCE_WEI,
} from './founderDeployer'
import type { SubsystemId } from './types'

/** Conservative gas units per subsystem (multi-tx packages use sum of CREATE txs). */
export const FOUNDER_GAS_UNITS_BY_SUBSYSTEM: Record<SubsystemId, bigint> = {
  liquidity_builder: 12_000_000n, // Authorizer + FeeSink + Factory + Program sequence
  create_token: 4_500_000n,
  public_farm_factory: 5_500_000n,
}

/** Default gas price when RPC unavailable (3 gwei). */
export const FOUNDER_DEFAULT_GAS_PRICE_WEI = 3_000_000_000n

/**
 * 1e18 as a decimal bigint literal (avoid bigint exponentiation operators).
 * Next/SWC rewrites bigint exponentiation to Math.pow, which throws:
 * TypeError: Cannot convert a BigInt value to a number
 */
export const WEI_PER_BNB = 1000000000000000000n

/** Safety buffer multiplier numerator/denominator (1.35x). */
export const FOUNDER_GAS_BUFFER_NUM = 135n
export const FOUNDER_GAS_BUFFER_DEN = 100n

export type FounderGasReadiness = {
  deployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  balanceWei: string | null
  balanceBnb: string | null
  gasPriceWei: string
  gasPriceSource: 'rpc' | 'default'
  estimates: Array<{
    subsystemId: SubsystemId
    gasUnits: string
    costWei: string
    costBnb: string
  }>
  estimatedTotalCostWei: string
  estimatedTotalCostBnb: string
  recommendedMinimumWei: string
  recommendedMinimumBnb: string
  safetyBufferMultiplier: string
  fundingSufficient: boolean
  pauseCode: 'FOUNDER_DEPLOYER_FUNDING_REQUIRED' | null
  message: string | null
}

export function weiToBnb(wei: bigint): string {
  const whole = wei / WEI_PER_BNB
  const frac = (wei % WEI_PER_BNB).toString().padStart(18, '0').replace(/0+$/, '')
  return frac.length ? `${whole}.${frac}` : whole.toString()
}

export function estimateSubsystemDeployCostWei(
  subsystemId: SubsystemId,
  gasPriceWei: bigint = FOUNDER_DEFAULT_GAS_PRICE_WEI,
): bigint {
  return FOUNDER_GAS_UNITS_BY_SUBSYSTEM[subsystemId] * gasPriceWei
}

export function assessFounderGasReadiness(input: {
  balanceWei: bigint | null | undefined
  gasPriceWei?: bigint | null
  remainingSubsystems?: SubsystemId[]
}): FounderGasReadiness {
  try {
    const gasPrice = input.gasPriceWei && input.gasPriceWei > 0n ? input.gasPriceWei : FOUNDER_DEFAULT_GAS_PRICE_WEI
    const gasPriceSource: 'rpc' | 'default' =
      input.gasPriceWei && input.gasPriceWei > 0n ? 'rpc' : 'default'
    const remaining =
      input.remainingSubsystems ??
      (['liquidity_builder', 'create_token', 'public_farm_factory'] as SubsystemId[])

    const estimates = remaining.map((subsystemId) => {
      const gasUnits = FOUNDER_GAS_UNITS_BY_SUBSYSTEM[subsystemId]
      const costWei = gasUnits * gasPrice
      return {
        subsystemId,
        gasUnits: gasUnits.toString(),
        costWei: costWei.toString(),
        costBnb: weiToBnb(costWei),
      }
    })

    const estimatedTotalCostWei = estimates.reduce((acc, e) => acc + BigInt(e.costWei), 0n)
    const buffered = (estimatedTotalCostWei * FOUNDER_GAS_BUFFER_NUM) / FOUNDER_GAS_BUFFER_DEN
    const recommendedMinimumWei =
      buffered > FOUNDER_MINIMUM_DEPLOY_BALANCE_WEI ? buffered : FOUNDER_MINIMUM_DEPLOY_BALANCE_WEI

    const balance = input.balanceWei ?? null
    const fundingSufficient = balance != null && balance >= recommendedMinimumWei
    const pauseCode =
      balance != null && !fundingSufficient ? ('FOUNDER_DEPLOYER_FUNDING_REQUIRED' as const) : null

    return {
      deployer: AUTHORIZED_MELEGA_DEPLOYER,
      balanceWei: balance == null ? null : balance.toString(),
      balanceBnb: balance == null ? null : weiToBnb(balance),
      gasPriceWei: gasPrice.toString(),
      gasPriceSource,
      estimates,
      estimatedTotalCostWei: estimatedTotalCostWei.toString(),
      estimatedTotalCostBnb: weiToBnb(estimatedTotalCostWei),
      recommendedMinimumWei: recommendedMinimumWei.toString(),
      recommendedMinimumBnb: weiToBnb(recommendedMinimumWei),
      safetyBufferMultiplier: '1.35',
      fundingSufficient,
      pauseCode,
      message: pauseCode
        ? `Fund MELEGA DEPLOYER ${AUTHORIZED_MELEGA_DEPLOYER} with at least ${weiToBnb(
            recommendedMinimumWei,
          )} BNB (estimated deployment cost ${weiToBnb(estimatedTotalCostWei)} BNB + safety buffer). Do not auto-transfer.`
        : null,
    }
  } catch {
    // Never throw into React render — gas panel degrades gracefully.
    return {
      deployer: AUTHORIZED_MELEGA_DEPLOYER,
      balanceWei: input.balanceWei == null ? null : input.balanceWei.toString(),
      balanceBnb: null,
      gasPriceWei: FOUNDER_DEFAULT_GAS_PRICE_WEI.toString(),
      gasPriceSource: 'default',
      estimates: [],
      estimatedTotalCostWei: '0',
      estimatedTotalCostBnb: '0',
      recommendedMinimumWei: FOUNDER_MINIMUM_DEPLOY_BALANCE_WEI.toString(),
      recommendedMinimumBnb: weiToBnb(FOUNDER_MINIMUM_DEPLOY_BALANCE_WEI),
      safetyBufferMultiplier: '1.35',
      fundingSufficient: false,
      pauseCode: null,
      message: 'Gas estimate temporarily unavailable.',
    }
  }
}
