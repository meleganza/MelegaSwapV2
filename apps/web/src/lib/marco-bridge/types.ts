import type { BigNumber } from '@ethersproject/bignumber'

export type MarcoBridgeNetworkId = 'bnb' | 'base' | 'solana' | 'robinhood'
export type MarcoWalletFamily = 'evm' | 'solana'

export interface MarcoBridgeIdentity {
  consumerTokenOrMint: string
  protocolContractOrStore: string
}

export interface MarcoBridgeNetwork {
  id: MarcoBridgeNetworkId
  name: string
  shortName: string
  walletFamily: MarcoWalletFamily
  chainId: number | null
  layerZeroEid: number
  decimals: number
  sharedDecimals: 6
  nativeFeeSymbol: string
  identity: MarcoBridgeIdentity
  explorerAddressUrl?: string
  explorerTransactionUrl?: string
  certified: boolean
  publiclyActive: boolean
  executionEnabled: boolean
  protectivePaused: boolean
}

export interface MarcoBridgeRoute {
  id: string
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  direct: true
  certified: boolean
  publiclyActive: boolean
  executionEnabled: boolean
}

export interface MarcoBridgeIntent {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  sourceWallet: string
  destinationWallet: string
  amount: string
}

export interface CanonicalBridgeAmount {
  requestedLD: BigNumber
  sendLD: BigNumber
  dustLD: BigNumber
  amountSD: BigNumber
  receiveLD: BigNumber
  sourceDecimals: number
  destinationDecimals: number
  sharedDecimals: 6
}

export interface MarcoBridgeQuote {
  intent: MarcoBridgeIntent
  amount: CanonicalBridgeAmount
  nativeFee: BigNumber
  lzTokenFee: BigNumber
  nativeFeeSymbol: string
  quotedAt: number
  quoteId: string
}

export type MarcoBridgeActionState =
  | 'CONNECT_WALLET'
  | 'CONNECT_DESTINATION_WALLET'
  | 'SWITCH_NETWORK'
  | 'ENTER_AMOUNT'
  | 'INSUFFICIENT_MARCO'
  | 'INSUFFICIENT_GAS'
  | 'REVIEW_BRIDGE'
  | 'BRIDGE_MARCO'
  | 'CONFIRM_IN_WALLET'
  | 'TRANSACTION_SUBMITTED'
  | 'BRIDGING'
  | 'DELIVERED'
  | 'ACTION_REQUIRED'

export type MarcoBridgeProgress =
  | 'TRANSACTION_SUBMITTED'
  | 'SOURCE_CONFIRMED'
  | 'CROSS_CHAIN_VERIFICATION'
  | 'DESTINATION_EXECUTION'
  | 'MARCO_DELIVERED'

export interface MarcoBridgeTracking {
  guid: string
  status: MarcoBridgeProgress
  sourceTransactionHash: string
  destinationTransactionHash?: string
  updatedAt: number
}

export interface MarcoBridgeSubmission {
  guid: string
  sourceTransactionHash: string
}

export interface EvmTransactionRequest {
  chainId: number
  to: string
  data: string
  value: BigNumber
}

export interface MarcoBridgePreflight {
  connectedChainId: number | null
  connectedWalletFamily: MarcoWalletFamily
  nativeBalance: BigNumber
  marcoBalance: BigNumber
  allowance?: BigNumber
}

export interface SolanaBridgeInstructionPlan {
  oftStore: string
  destinationEid: number
  destinationBytes32: string
  amountLD: BigNumber
  minAmountLD: BigNumber
  nativeFee: BigNumber
  quoteId: string
}
