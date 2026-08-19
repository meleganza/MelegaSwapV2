/**
 * Certified EVM venue contracts for M3 SHADOW quotes.
 * Melega routers come from this repository. Pancake/Uniswap addresses are
 * the widely published official V2 routers — NOT Melega's inherited smart-router.
 */

import { EVM_CHAIN_IDS } from './domain'

export const VENUE_SUPPORT = {
  SUPPORTED: 'SUPPORTED',
  QUOTE_ONLY: 'QUOTE_ONLY',
  UNSUPPORTED: 'UNSUPPORTED',
  UNAVAILABLE: 'UNAVAILABLE',
  NOT_VERIFIED: 'NOT_VERIFIED',
} as const

export type VenueSupportState = (typeof VENUE_SUPPORT)[keyof typeof VENUE_SUPPORT]

export const PANCAKESWAP_VENUE_ID = 'pancakeswap' as const
export const UNISWAP_VENUE_ID = 'uniswap' as const

export interface CertifiedEvmVenue {
  venueId: typeof PANCAKESWAP_VENUE_ID | typeof UNISWAP_VENUE_ID
  label: string
  /** Published V2 LP fee in bps. Embedded in getAmountsOut output. */
  v2LpFeeBps: number
  quoteMethod: 'v2-getAmountsOut'
  routers: Partial<Record<number, string>>
  wrappedNative: Partial<Record<number, string>>
  support: Record<number, VenueSupportState>
}

export const PANCAKE_SWAP_VENUE: CertifiedEvmVenue = {
  venueId: PANCAKESWAP_VENUE_ID,
  label: 'PancakeSwap',
  v2LpFeeBps: 25,
  quoteMethod: 'v2-getAmountsOut',
  routers: {
    [EVM_CHAIN_IDS.BSC]: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  },
  wrappedNative: {
    [EVM_CHAIN_IDS.BSC]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
  support: {
    [EVM_CHAIN_IDS.BSC]: VENUE_SUPPORT.QUOTE_ONLY,
    [EVM_CHAIN_IDS.ETHEREUM]: VENUE_SUPPORT.NOT_VERIFIED,
    [EVM_CHAIN_IDS.BASE]: VENUE_SUPPORT.NOT_VERIFIED,
    [EVM_CHAIN_IDS.POLYGON]: VENUE_SUPPORT.UNSUPPORTED,
    [EVM_CHAIN_IDS.ARBITRUM]: VENUE_SUPPORT.UNSUPPORTED,
    [EVM_CHAIN_IDS.AVAX]: VENUE_SUPPORT.UNSUPPORTED,
  },
}

export const UNISWAP_VENUE: CertifiedEvmVenue = {
  venueId: UNISWAP_VENUE_ID,
  label: 'Uniswap',
  v2LpFeeBps: 30,
  quoteMethod: 'v2-getAmountsOut',
  routers: {
    [EVM_CHAIN_IDS.ETHEREUM]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  },
  wrappedNative: {
    [EVM_CHAIN_IDS.ETHEREUM]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  support: {
    [EVM_CHAIN_IDS.ETHEREUM]: VENUE_SUPPORT.QUOTE_ONLY,
    [EVM_CHAIN_IDS.BSC]: VENUE_SUPPORT.NOT_VERIFIED,
    [EVM_CHAIN_IDS.BASE]: VENUE_SUPPORT.NOT_VERIFIED,
    [EVM_CHAIN_IDS.POLYGON]: VENUE_SUPPORT.NOT_VERIFIED,
    [EVM_CHAIN_IDS.ARBITRUM]: VENUE_SUPPORT.NOT_VERIFIED,
    [EVM_CHAIN_IDS.AVAX]: VENUE_SUPPORT.NOT_VERIFIED,
  },
}

export const MELEGA_CHAIN_SUPPORT: Record<number, VenueSupportState> = {
  [EVM_CHAIN_IDS.BSC]: VENUE_SUPPORT.SUPPORTED,
  [EVM_CHAIN_IDS.ETHEREUM]: VENUE_SUPPORT.QUOTE_ONLY,
  [EVM_CHAIN_IDS.BASE]: VENUE_SUPPORT.QUOTE_ONLY,
  [EVM_CHAIN_IDS.POLYGON]: VENUE_SUPPORT.QUOTE_ONLY,
  [EVM_CHAIN_IDS.ARBITRUM]: VENUE_SUPPORT.QUOTE_ONLY,
  [EVM_CHAIN_IDS.AVAX]: VENUE_SUPPORT.QUOTE_ONLY,
}

export function isQuoteCapable(state: VenueSupportState): boolean {
  return state === VENUE_SUPPORT.SUPPORTED || state === VENUE_SUPPORT.QUOTE_ONLY
}
