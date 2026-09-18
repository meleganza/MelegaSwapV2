import { Web3Provider } from '@ethersproject/providers'
import { MarcoBridgeError } from './types'

export type InjectedEthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export type ReboundInjectedSigner = {
  getAddress(): Promise<string>
  sendTransaction(tx: { to: string; data: string; value?: string; chainId?: number }): Promise<{
    hash: string
    wait?: (confirms?: number) => Promise<{ status?: number | null } | null>
  }>
  provider?: {
    getBalance(address: string): Promise<{ toString(): string } | string>
    getGasPrice(): Promise<{ toString(): string } | string>
    getNetwork(): Promise<{ chainId: number; name: string }>
    call?(tx: { to: string; data: string }): Promise<string>
    waitForTransaction?(hash: string): Promise<{ status?: number | null } | null>
  }
}

/**
 * Recreate an ethers v5 signer from the current injected EIP-1193 provider.
 * Never reuse a wagmi/ethers signer that was constructed before wallet_switchEthereumChain.
 */
export async function bindInjectedSignerAfterNetworkSwitch(
  ethereum: InjectedEthereumProvider,
  expectedChainId: number,
): Promise<ReboundInjectedSigner> {
  const provider = new Web3Provider(ethereum, 'any')
  const network = await provider.getNetwork()
  if (network.chainId !== expectedChainId) {
    throw new MarcoBridgeError(
      'WRONG_SOURCE_NETWORK',
      expectedChainId === 5042
        ? `Switch your wallet to Arc. Detected chainId ${network.chainId}.`
        : `Switch your wallet to the source network. Detected chainId ${network.chainId}.`,
    )
  }
  return provider.getSigner()
}
