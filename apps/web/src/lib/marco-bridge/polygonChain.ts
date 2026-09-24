export const POLYGON_CHAIN_ID = 137
export const POLYGON_CHAIN_ID_HEX = '0x89'
export const POLYGON_LAYERZERO_EID = 30109
export const POLYGON_RPC_URL = 'https://polygon-bor-rpc.publicnode.com'
export const POLYGON_EXPLORER_URL = 'https://polygonscan.com'
export const POLYGON_NATIVE_CURRENCY = { name: 'POL', symbol: 'POL', decimals: 18 } as const

export const POLYGON_WALLET_NETWORK = {
  chainId: POLYGON_CHAIN_ID_HEX,
  chainName: 'Polygon',
  nativeCurrency: POLYGON_NATIVE_CURRENCY,
  rpcUrls: [POLYGON_RPC_URL],
  blockExplorerUrls: [POLYGON_EXPLORER_URL],
} as const

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export async function ensurePolygonWalletNetwork(provider: EthereumProvider): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_CHAIN_ID_HEX }],
    })
  } catch (cause) {
    const code = typeof cause === 'object' && cause && 'code' in cause ? Number((cause as { code: number }).code) : 0
    if (code !== 4902) throw cause
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [POLYGON_WALLET_NETWORK],
    })
  }
}
