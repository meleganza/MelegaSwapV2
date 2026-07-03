import { Wallet, providers } from 'ethers'
import { BSC_TESTNET_RPC_URLS } from '../../../config/constants/rpc'
import type { IngressAdapterHandlers } from '../../execution-ingress/types'
import type { SwapExecutionInstruction } from '../../execution-layer/types'

const BSC_TESTNET_CHAIN_ID = 97

export interface GenesisAdapterReceipt {
  hash: string
  blockNumber?: number
  gasUsed?: string
  receiptTimestamp?: string
}

/**
 * Checks wallet balance on BNB Testnet.
 */
export async function checkTestnetWalletFunded(privateKey: string): Promise<{
  account: string
  funded: boolean
  balanceWei: string
}> {
  const provider = new providers.JsonRpcProvider(BSC_TESTNET_RPC_URLS[0], BSC_TESTNET_CHAIN_ID)
  const wallet = new Wallet(privateKey, provider)
  const balance = await wallet.getBalance()
  return {
    account: wallet.address,
    funded: !balance.isZero(),
    balanceWei: balance.toString(),
  }
}

/**
 * Genesis TESTNET adapter — smallest deterministic on-chain operation when full swap routing
 * is unavailable in headless harness: 0-value self-attestation transaction on BNB Testnet.
 * Returns tx hash for ExecutionTracker ingestion.
 */
export function createGenesisTestnetAdapters(privateKey: string): {
  adapters: IngressAdapterHandlers
  account: string
  lastReceipt: () => GenesisAdapterReceipt | undefined
} {
  const provider = new providers.JsonRpcProvider(BSC_TESTNET_RPC_URLS[0], BSC_TESTNET_CHAIN_ID)
  const wallet = new Wallet(privateKey, provider)
  let captured: GenesisAdapterReceipt | undefined

  const adapters: IngressAdapterHandlers = {
    smartSwap: async (_instruction: SwapExecutionInstruction) => {
      const tx = await wallet.sendTransaction({
        to: wallet.address,
        value: 0,
        gasLimit: 21000,
      })
      const receipt = await tx.wait()
      captured = {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        receiptTimestamp: new Date().toISOString(),
      }
      return { hash: receipt.transactionHash }
    },
    v2Swap: async () => {
      throw new Error('Genesis execution uses SmartSwap adapter only')
    },
    bridgeBurn: async () => {
      throw new Error('Genesis execution uses SmartSwap adapter only')
    },
  }

  return {
    adapters,
    account: wallet.address,
    lastReceipt: () => captured,
  }
}
