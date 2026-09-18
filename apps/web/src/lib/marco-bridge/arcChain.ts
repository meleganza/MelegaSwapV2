export const ARC_CHAIN_ID = 5042
export const ARC_CHAIN_ID_HEX = '0x13b2'
export const ARC_LAYERZERO_EID = 30417
export const ARC_RPC_URL = 'https://rpc.mainnet.arc.io'
export const ARC_EXPLORER_URL = 'https://explorer.arc.io'
export const ARC_NATIVE_CURRENCY = { name: 'USDC', symbol: 'USDC', decimals: 18 } as const
export const FORBIDDEN_ARC_TESTNET_CHAIN_ID = 5042002
export const FORBIDDEN_ARC_TESTNET_EID = 40434

export const ARC_WALLET_NETWORK = {
  chainId: ARC_CHAIN_ID_HEX,
  chainName: 'Arc',
  nativeCurrency: ARC_NATIVE_CURRENCY,
  rpcUrls: [ARC_RPC_URL],
  blockExplorerUrls: [ARC_EXPLORER_URL],
} as const

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export async function ensureArcWalletNetwork(provider: EthereumProvider): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARC_CHAIN_ID_HEX }],
    })
  } catch (cause) {
    const code = typeof cause === 'object' && cause && 'code' in cause ? Number((cause as { code: number }).code) : 0
    if (code !== 4902) throw cause
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [ARC_WALLET_NETWORK],
    })
  }
}
