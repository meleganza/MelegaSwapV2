import { StaticJsonRpcProvider } from '@ethersproject/providers'

export const ETH_PROD_NODE = 'https://eth.llamarpc.com'
export const BSC_PROD_NODE = process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://bsc.nodereal.io'
export const BASE_PROD_NODE = 'https://base-rpc.publicnode.com'
export const POLYGON_PROD_NODE = 'https://polygon.drpc.org'

const CHAIN_RPC: Record<number, { url: string; name: string }> = {
  1: { url: ETH_PROD_NODE, name: 'homestead' },
  56: { url: BSC_PROD_NODE, name: 'bnb' },
  137: { url: POLYGON_PROD_NODE, name: 'matic' },
  8453: { url: BASE_PROD_NODE, name: 'base' },
}

const providers = new Map<number, StaticJsonRpcProvider>()

/**
 * Construct a chain provider only when a caller actually reads that chain.
 * The explicit network skips ethers detectNetwork, which otherwise sends
 * eth_chainId/net_version as soon as the provider object is created.
 */
export function getChainRpcProvider(chainId: number): StaticJsonRpcProvider | null {
  const config = CHAIN_RPC[chainId]
  if (!config) return null
  let provider = providers.get(chainId)
  if (!provider) {
    provider = new StaticJsonRpcProvider(config.url, { chainId, name: config.name })
    providers.set(chainId, provider)
  }
  return provider
}

function lazyChainProvider(chainId: number): StaticJsonRpcProvider {
  return new Proxy({} as StaticJsonRpcProvider, {
    get(_target, prop) {
      const provider = getChainRpcProvider(chainId)
      if (!provider) return undefined
      const value = provider[prop as keyof StaticJsonRpcProvider]
      return typeof value === 'function' ? value.bind(provider) : value
    },
  })
}

export const ethRpcProvider = lazyChainProvider(1)
export const bscRpcProvider = lazyChainProvider(56)
export const polygonRpcProvider = lazyChainProvider(137)
export const baseRpcProvider = lazyChainProvider(8453)

export default null
