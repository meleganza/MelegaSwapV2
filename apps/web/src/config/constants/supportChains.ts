import { ChainId } from '@pancakeswap/sdk'

export const SUPPORT_MULTI_CHAINS = [ChainId.ETHEREUM, ChainId.BSC, ChainId.BSC_TESTNET, ChainId.BASE, ChainId.POLYGON]
export const SUPPORT_FARMS = [ChainId.ETHEREUM, ChainId.BSC, ChainId.BSC_TESTNET, ChainId.BASE, ChainId.POLYGON]
export const SUPPORT_ONLY_BSC = [ChainId.BSC]
export const SUPPORT_ILO = [ChainId.BSC]
export const SUPPORT_CHAIN_NFT = [ChainId.BSC]
export const SUPPORT_ZAP = [ChainId.BSC]

/** R765 — network switcher shows BNB Smart Chain only until multichain activation. */
export const MELEGA_VISIBLE_SWITCHER_CHAIN_IDS: readonly number[] = [ChainId.BSC]

export function filterMelegaVisibleSwitcherChains<T extends { id: number }>(chainList: T[]): T[] {
  return chainList.filter((chain) => MELEGA_VISIBLE_SWITCHER_CHAIN_IDS.includes(chain.id))
}
