/**
 * Native Melega farm and pool classification.
 * BNB stays active. Polygon, Base, and Ethereum are closed to new deposits in this beta.
 * "Terminated" is a product status only. It does not mean funds moved or contracts were paused.
 */

export const LIVE_FARM_EXIT = 'https://www.melega.finance/farms?view=my'
export const LIVE_POOL_EXIT = 'https://www.melega.finance/pools?view=positions'
export const LIVE_LIQUIDITY_EXIT = 'https://www.melega.finance/liquidity-studio?view=remove'

export type NativeEarnStatus = 'active' | 'terminated'

export interface NativeEarnChain {
  chainId: 56 | 137 | 8453 | 1
  name: string
  status: NativeEarnStatus
  /** Proven farm contract with on-chain bytecode. View only. Not a withdrawal transaction. */
  farmContract: `0x${string}` | null
  explorer: string | null
}

export const NATIVE_EARN_CHAINS: readonly NativeEarnChain[] = [
  {
    chainId: 56,
    name: 'BNB Smart Chain',
    status: 'active',
    farmContract: '0x41D5487836452d23f2c467070244E5842B412794',
    explorer: 'https://bscscan.com/address/0x41D5487836452d23f2c467070244E5842B412794',
  },
  {
    chainId: 137,
    name: 'Polygon',
    status: 'terminated',
    farmContract: '0x130d2BD998767B6091352dd71fEABa4460846D94',
    explorer: 'https://polygonscan.com/address/0x130d2BD998767B6091352dd71fEABa4460846D94',
  },
  {
    chainId: 8453,
    name: 'Base',
    status: 'terminated',
    farmContract: '0x149EE9245E5eD52a89Ea777d19AD3A5D87873680',
    explorer: 'https://basescan.org/address/0x149EE9245E5eD52a89Ea777d19AD3A5D87873680',
  },
  {
    chainId: 1,
    name: 'Ethereum',
    status: 'terminated',
    farmContract: '0x585364c747CaF6cF6441656F803796230fb1d61c',
    explorer: 'https://etherscan.io/address/0x585364c747CaF6cF6441656F803796230fb1d61c',
  },
]

export function nativeEarnChain(chainId: number): NativeEarnChain | null {
  return NATIVE_EARN_CHAINS.find((chain) => chain.chainId === chainId) ?? null
}

export function isNewNativeDepositAllowed(chainId: number): boolean {
  return nativeEarnChain(chainId)?.status === 'active'
}

export function terminatedNativeChains(): NativeEarnChain[] {
  return NATIVE_EARN_CHAINS.filter((chain) => chain.status === 'terminated')
}
