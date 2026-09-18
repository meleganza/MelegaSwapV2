/**
 * Public Network Switch presentation only.
 * Internal registry / contracts / MELEGA_VISIBLE_SWITCHER_CHAIN_IDS stay intact.
 */
import { ChainId } from '@pancakeswap/sdk'
import { ARC_CHAIN_ID } from 'lib/marco-bridge/arcChain'
import { ROBINHOOD_CHAIN_ID } from 'lib/marco-bridge/robinhoodChain'
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'
import type { MarcoBridgeNetwork } from 'lib/marco-bridge/types'

/** Founder-approved DEX trading rows in the public Network Switch. */
export const MELEGA_PUBLIC_TRADING_SWITCHER_CHAIN_IDS: readonly number[] = [
  ChainId.BSC,
  ChainId.BASE,
  ChainId.POLYGON,
  ChainId.ETHEREUM,
]

/** Founder-approved MARCO Bridge rows — not DEX trading chains. */
export const MELEGA_PUBLIC_BRIDGE_SWITCHER_CHAIN_IDS: readonly number[] = [ROBINHOOD_CHAIN_ID, ARC_CHAIN_ID]

/** Hidden from the public switcher only. Do not delete internal LIVE config. */
export const MELEGA_PUBLIC_SWITCHER_HIDDEN_CHAIN_IDS: readonly number[] = [ChainId.ARBITRUM, ChainId.AVAX]

/** Existing canonical MARCO Bridge page. No new query contract. */
export const MARCO_BRIDGE_PUBLIC_PATH = '/bridge'

export function isMelegaPublicTradingSwitcherChain(chainId: number): boolean {
  return MELEGA_PUBLIC_TRADING_SWITCHER_CHAIN_IDS.includes(chainId)
}

export function isMelegaPublicBridgeSwitcherChain(chainId: number): boolean {
  return MELEGA_PUBLIC_BRIDGE_SWITCHER_CHAIN_IDS.includes(chainId)
}

export function filterMelegaPublicTradingSwitcherChains<T extends { id: number }>(chainList: T[]): T[] {
  return chainList.filter((chain) => isMelegaPublicTradingSwitcherChain(chain.id))
}

export function filterMelegaPublicPreparingChains<T extends { chainId: number }>(rows: readonly T[]): T[] {
  return rows.filter(
    (row) =>
      !MELEGA_PUBLIC_SWITCHER_HIDDEN_CHAIN_IDS.includes(row.chainId) &&
      !isMelegaPublicTradingSwitcherChain(row.chainId) &&
      !isMelegaPublicBridgeSwitcherChain(row.chainId),
  )
}

export function getMelegaPublicBridgeSwitcherRows(): MarcoBridgeNetwork[] {
  const byChainId = new Map(
    Object.values(MARCO_WAVE1_NETWORKS)
      .filter((network): network is MarcoBridgeNetwork & { chainId: number } => network.chainId != null)
      .map((network) => [network.chainId, network]),
  )
  return MELEGA_PUBLIC_BRIDGE_SWITCHER_CHAIN_IDS.flatMap((chainId) => {
    const network = byChainId.get(chainId)
    return network ? [network] : []
  })
}
