/**
 * Explicit SmartSwap V2 executor runtime configuration.
 * BSC ExecutorV2 is registered as CONFIGURED_DISABLED. Ethereum has no address.
 * No environment fallback to guessed addresses.
 */

import { getAddress } from '@ethersproject/address'
import { EVM_CHAIN_IDS } from './domain'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'

export const V2_EXECUTOR_CONFIG_STATUS = {
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  CONFIGURED: 'CONFIGURED',
} as const

export type V2ExecutorConfigStatus =
  (typeof V2_EXECUTOR_CONFIG_STATUS)[keyof typeof V2_EXECUTOR_CONFIG_STATUS]

export const TEAM_OPERATOR_REF = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0' as const
export const V2_EXECUTOR_ZERO = '0x0000000000000000000000000000000000000000' as const

export interface V2ExecutorChainConfig {
  status: V2ExecutorConfigStatus
  enabled: boolean
  executorAddress: string | null
}

export type V2ExecutorConfigTable = Partial<Record<number, V2ExecutorChainConfig>>

const NOT_CONFIGURED: V2ExecutorChainConfig = {
  status: V2_EXECUTOR_CONFIG_STATUS.NOT_CONFIGURED,
  enabled: false,
  executorAddress: null,
}

/** Production table. BSC is CONFIGURED_DISABLED; Ethereum stays NOT_CONFIGURED. */
/** BSC SmartSwapExecutorV2: CONFIGURED_DISABLED (address registered, execution off). */
export const BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS =
  '0x7c07082839edd5797737640bba6af47992b9861e' as const

export const V2_EXECUTION_RUNTIME_CONFIG: Record<
  typeof EVM_CHAIN_IDS.BSC | typeof EVM_CHAIN_IDS.ETHEREUM,
  V2ExecutorChainConfig
> = {
  [EVM_CHAIN_IDS.BSC]: {
    status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
    enabled: false,
    executorAddress: BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS,
  },
  [EVM_CHAIN_IDS.ETHEREUM]: { ...NOT_CONFIGURED },
}

export function forbiddenExecutorAddress(address: string | null | undefined): boolean {
  if (!address) return true
  let checksum: string
  try {
    checksum = getAddress(address)
  } catch {
    return true
  }
  return (
    checksum === V2_EXECUTOR_ZERO ||
    checksum === getAddress(TEAM_OPERATOR_REF) ||
    checksum === getAddress(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
  )
}

export function resolveV2ExecutorConfig(
  chainId: number,
  override?: V2ExecutorConfigTable,
): V2ExecutorChainConfig {
  const table = override ?? V2_EXECUTION_RUNTIME_CONFIG
  const row = Number.isInteger(chainId) ? table[chainId] : undefined
  if (!row) return { ...NOT_CONFIGURED }
  if (row.status !== V2_EXECUTOR_CONFIG_STATUS.CONFIGURED) return { ...NOT_CONFIGURED }
  if (row.enabled !== true) {
    return { status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED, enabled: false, executorAddress: null }
  }
  if (!row.executorAddress || forbiddenExecutorAddress(row.executorAddress)) {
    return { ...NOT_CONFIGURED }
  }
  return {
    status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
    enabled: true,
    executorAddress: getAddress(row.executorAddress),
  }
}

export function isV2ExecutorRuntimeEnabled(config: V2ExecutorChainConfig): boolean {
  return (
    config.status === V2_EXECUTOR_CONFIG_STATUS.CONFIGURED &&
    config.enabled === true &&
    typeof config.executorAddress === 'string' &&
    !forbiddenExecutorAddress(config.executorAddress)
  )
}
