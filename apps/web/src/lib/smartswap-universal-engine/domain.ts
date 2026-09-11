/**
 * Execution-domain abstraction. SmartSwap is not BNB/EVM-only architecturally.
 * Solana is representable; execution and wallet UX are not enabled in M1.
 */

export const EXECUTION_DOMAIN = {
  EVM: 'EVM',
  SOLANA: 'SOLANA',
} as const

export type ExecutionDomain = (typeof EXECUTION_DOMAIN)[keyof typeof EXECUTION_DOMAIN]

/** Currently switchable Melega ecosystem EVM chains (runtime truth: SUPPORT_MULTI_CHAINS). */
export const EVM_CHAIN_IDS = {
  ETHEREUM: 1,
  BSC: 56,
  BSC_TESTNET: 97,
  POLYGON: 137,
  BASE: 8453,
  ARBITRUM: 42161,
  AVAX: 43114,
} as const

export type EvmChainId = (typeof EVM_CHAIN_IDS)[keyof typeof EVM_CHAIN_IDS]

export const SOLANA_CLUSTER = {
  MAINNET: 'solana:mainnet',
  DEVNET: 'solana:devnet',
} as const

export type SolanaCluster = (typeof SOLANA_CLUSTER)[keyof typeof SOLANA_CLUSTER]

export type ExecutionNetwork =
  | { domain: typeof EXECUTION_DOMAIN.EVM; chainId: number }
  | { domain: typeof EXECUTION_DOMAIN.SOLANA; cluster: SolanaCluster }

export function evmNetwork(chainId: number): ExecutionNetwork {
  return { domain: EXECUTION_DOMAIN.EVM, chainId }
}

export function solanaNetwork(cluster: SolanaCluster = SOLANA_CLUSTER.MAINNET): ExecutionNetwork {
  return { domain: EXECUTION_DOMAIN.SOLANA, cluster }
}

export function networkKey(network: ExecutionNetwork): string {
  return network.domain === EXECUTION_DOMAIN.EVM
    ? `evm:${network.chainId}`
    : `solana:${network.cluster}`
}

export function isEvmNetwork(network: ExecutionNetwork): network is Extract<ExecutionNetwork, { domain: 'EVM' }> {
  return network.domain === EXECUTION_DOMAIN.EVM
}

export function isSolanaNetwork(
  network: ExecutionNetwork,
): network is Extract<ExecutionNetwork, { domain: 'SOLANA' }> {
  return network.domain === EXECUTION_DOMAIN.SOLANA
}

export function solanaExecutionEnabled(): boolean {
  return false
}
