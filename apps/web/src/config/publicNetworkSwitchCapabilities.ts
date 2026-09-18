/**
 * Public Network Switch presentation only.
 * Internal registry / contracts / MELEGA_VISIBLE_SWITCHER_CHAIN_IDS stay intact.
 */
import { ChainId } from '@pancakeswap/sdk'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
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

/**
 * /bridge page classification only. Do not add 4663/5042 to SUPPORT_MULTI_CHAINS
 * or any DEX trading / farms / SmartSwap allowlist.
 */
export const MELEGA_BRIDGE_PAGE_CHAIN_IDS: readonly number[] = Array.from(
  new Set<number>([...SUPPORT_MULTI_CHAINS, ...MELEGA_PUBLIC_BRIDGE_SWITCHER_CHAIN_IDS]),
)

export function isMelegaBridgePageChain(chainId: number): boolean {
  return MELEGA_BRIDGE_PAGE_CHAIN_IDS.includes(chainId)
}

export function isMarcoBridgePublicPath(pathname: string | undefined | null): boolean {
  if (!pathname) return false
  return pathname === MARCO_BRIDGE_PUBLIC_PATH || pathname.startsWith(`${MARCO_BRIDGE_PUBLIC_PATH}/`)
}

/** Wallet-recognized bridge-only chains. Not DEX trading-ready. */
export function isMelegaRecognizedWalletChain(chainId: number): boolean {
  return isMelegaPublicBridgeSwitcherChain(chainId)
}

export function getMelegaPublicBridgeNetwork(
  chainId: number,
): (MarcoBridgeNetwork & { chainId: number }) | undefined {
  return getMelegaPublicBridgeSwitcherRows().find(
    (row): row is MarcoBridgeNetwork & { chainId: number } => row.chainId === chainId,
  )
}

export function isBridgeOnlyWalletOnBridgePage(pathname: string | undefined | null, chainId?: number): boolean {
  return typeof chainId === 'number' && isMarcoBridgePublicPath(pathname) && isMelegaPublicBridgeSwitcherChain(chainId)
}

/** Legacy UnsupportedNetworkModal must stay closed for Robinhood/Arc on /bridge. */
export function shouldOpenUnsupportedNetworkModal(input: {
  pathname: string
  chainId?: number
  wagmiUnsupported: boolean
  isPageNotSupported: boolean
}): boolean {
  if (isBridgeOnlyWalletOnBridgePage(input.pathname, input.chainId)) return false
  return input.wagmiUnsupported || input.isPageNotSupported
}
