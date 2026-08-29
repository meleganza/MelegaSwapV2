export const ROBINHOOD_CHAIN_ID = 4663
export const ROBINHOOD_CHAIN_ID_HEX = '0x1237'
export const ROBINHOOD_RPC_URL = 'https://rpc.mainnet.chain.robinhood.com'
export const ROBINHOOD_EXPLORER_URL = 'https://robinhoodchain.blockscout.com'
export const RETIRED_ROBINHOOD_CHAIN_ID = 62831

export const ROBINHOOD_WALLET_NETWORK = {
  chainId: ROBINHOOD_CHAIN_ID_HEX,
  chainName: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: [ROBINHOOD_RPC_URL],
  blockExplorerUrls: [ROBINHOOD_EXPLORER_URL],
} as const

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export async function ensureRobinhoodWalletNetwork(provider: EthereumProvider): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ROBINHOOD_CHAIN_ID_HEX }],
    })
  } catch (cause) {
    const code = typeof cause === 'object' && cause && 'code' in cause ? Number((cause as { code: number }).code) : 0
    if (code !== 4902) throw cause
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [ROBINHOOD_WALLET_NETWORK],
    })
  }
}
