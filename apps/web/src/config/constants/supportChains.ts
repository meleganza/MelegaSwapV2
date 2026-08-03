import { ChainId } from '@pancakeswap/sdk'

export const SUPPORT_MULTI_CHAINS = [ChainId.ETHEREUM, ChainId.BSC, ChainId.BSC_TESTNET, ChainId.BASE, ChainId.POLYGON]
export const SUPPORT_FARMS = [ChainId.ETHEREUM, ChainId.BSC, ChainId.BSC_TESTNET, ChainId.BASE, ChainId.POLYGON]
export const SUPPORT_ONLY_BSC = [ChainId.BSC]
export const SUPPORT_ILO = [ChainId.BSC]
export const SUPPORT_CHAIN_NFT = [ChainId.BSC]
export const SUPPORT_ZAP = [ChainId.BSC]

/** LIVE switchables only. PREPARING shown as Coming soon. */
export const MELEGA_VISIBLE_SWITCHER_CHAIN_IDS: readonly number[] = [
  ChainId.BSC,
  ChainId.BASE,
  ChainId.POLYGON,
  ChainId.ETHEREUM,
]

export function filterMelegaVisibleSwitcherChains<T extends { id: number }>(chainList: T[]): T[] {
  return chainList.filter((chain) => MELEGA_VISIBLE_SWITCHER_CHAIN_IDS.includes(chain.id))
}
