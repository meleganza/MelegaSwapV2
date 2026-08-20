import { EVM_CHAIN_IDS } from './domain'
import { PANCAKE_SWAP_VENUE, UNISWAP_VENUE } from './certifiedVenues'

export const EXECUTION_ELIGIBILITY = {
  ELIGIBLE: 'ELIGIBLE',
  NOT_EXECUTION_ELIGIBLE: 'NOT_EXECUTION_ELIGIBLE',
} as const

export type ExecutionEligibility = (typeof EXECUTION_ELIGIBILITY)[keyof typeof EXECUTION_ELIGIBILITY]

export interface ExecutionTarget {
  venueId: 'melega-dex' | 'pancakeswap' | 'uniswap'
  chainId: number
  router: string
  routerFamily: 'melega-v2' | 'pancake-v2' | 'uniswap-v2'
  capability: 'EXACT_IN'
  wrappedNative: string | null
  spender: string
  approval: 'erc20-to-executor'
  nativeIn: 'swapExactETHForTokens'
  nativeOut: 'swapExactTokensForETH'
  provenance: string
  eligibility: ExecutionEligibility
}

const MELEGA_V2: Record<number, string> = {
  [EVM_CHAIN_IDS.BSC]: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3',
  [EVM_CHAIN_IDS.ETHEREUM]: '0xFF8EBf8edf1C533A02d066f852788773BdCD631C',
  [EVM_CHAIN_IDS.BASE]: '0x1B30D21354a082EeBC66c4C5E56320759f7994e5',
  [EVM_CHAIN_IDS.POLYGON]: '0x64935e2A3d8F3840445fB2DdF37FBBfc3b292EFe',
  [EVM_CHAIN_IDS.ARBITRUM]: '0x149ee9245e5ed52a89ea777d19ad3a5d87873680',
  [EVM_CHAIN_IDS.AVAX]: '0x5A38b0B75C2E199fD8098710594115A35ABb6c7F',
}

const WRAPPED: Record<number, string> = {
  [EVM_CHAIN_IDS.BSC]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  [EVM_CHAIN_IDS.ETHEREUM]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
}

export const SMART_ROUTER_BSC = '0xC6665d98Efd81f47B03801187eB46cbC63F328B0' as const

export function executionTargetRegistry(): ExecutionTarget[] {
  const melega = Object.entries(MELEGA_V2).map(([chain, router]) => {
    const chainId = Number(chain)
    return {
      venueId: 'melega-dex' as const,
      chainId,
      router,
      routerFamily: 'melega-v2' as const,
      capability: 'EXACT_IN' as const,
      wrappedNative: WRAPPED[chainId] ?? null,
      spender: 'SmartSwapExecutorV1',
      approval: 'erc20-to-executor' as const,
      nativeIn: 'swapExactETHForTokens' as const,
      nativeOut: 'swapExactTokensForETH' as const,
      provenance: 'apps/web/src/config/constants/exchange.ts ROUTER_ADDRESS',
      eligibility:
        chainId === EVM_CHAIN_IDS.BSC ? EXECUTION_ELIGIBILITY.ELIGIBLE : EXECUTION_ELIGIBILITY.NOT_EXECUTION_ELIGIBLE,
    }
  })
  const pancakeBsc = PANCAKE_SWAP_VENUE.routers[EVM_CHAIN_IDS.BSC]
  const uniEth = UNISWAP_VENUE.routers[EVM_CHAIN_IDS.ETHEREUM]
  const extra: ExecutionTarget[] = []
  if (pancakeBsc) {
    extra.push({
      venueId: 'pancakeswap',
      chainId: EVM_CHAIN_IDS.BSC,
      router: pancakeBsc,
      routerFamily: 'pancake-v2',
      capability: 'EXACT_IN',
      wrappedNative: PANCAKE_SWAP_VENUE.wrappedNative[EVM_CHAIN_IDS.BSC] ?? null,
      spender: 'SmartSwapExecutorV1',
      approval: 'erc20-to-executor',
      nativeIn: 'swapExactETHForTokens',
      nativeOut: 'swapExactTokensForETH',
      provenance: 'Official PancakeSwap V2 Router (M3 certified)',
      eligibility: EXECUTION_ELIGIBILITY.ELIGIBLE,
    })
  }
  if (uniEth) {
    extra.push({
      venueId: 'uniswap',
      chainId: EVM_CHAIN_IDS.ETHEREUM,
      router: uniEth,
      routerFamily: 'uniswap-v2',
      capability: 'EXACT_IN',
      wrappedNative: UNISWAP_VENUE.wrappedNative[EVM_CHAIN_IDS.ETHEREUM] ?? null,
      spender: 'SmartSwapExecutorV1',
      approval: 'erc20-to-executor',
      nativeIn: 'swapExactETHForTokens',
      nativeOut: 'swapExactTokensForETH',
      provenance: 'Official Uniswap V2 Router (M3 certified address; fork simulation unavailable)',
      eligibility: EXECUTION_ELIGIBILITY.NOT_EXECUTION_ELIGIBLE,
    })
  }
  return [...melega, ...extra]
}

export function requireExecutionTarget(venueId: string, chainId: number): ExecutionTarget {
  const hit = executionTargetRegistry().find(
    (row) => row.venueId === venueId && row.chainId === chainId && row.eligibility === EXECUTION_ELIGIBILITY.ELIGIBLE,
  )
  if (!hit) throw new Error(`WRONG_ROUTER:NOT_EXECUTION_ELIGIBLE:${venueId}:${chainId}`)
  return hit
}
