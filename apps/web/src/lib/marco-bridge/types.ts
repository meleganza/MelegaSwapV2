export type MarcoBridgeNetworkId = 'bnb' | 'base' | 'solana' | 'robinhood'
export type MarcoWalletFamily = 'evm' | 'solana'

export type MarcoBridgeNetwork = {
  id: MarcoBridgeNetworkId
  label: string
  shortLabel: string
  walletFamily: MarcoWalletFamily
  chainId: number | null
  layerZeroEid: number | null
  marcoIdentity: string | null
  explorerUrl: string | null
  protectivePaused?: boolean
}

export type MarcoBridgeRoute = {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  direct: boolean
  enabled: boolean
}

export type MarcoBridgeQuote = {
  amount: string
  expectedReceive: string
  nativeFee: string
  nativeFeeSymbol: string
  estimatedSeconds: number
  routeLabel: string
}

export type MarcoBridgeProgress =
  | 'idle'
  | 'review'
  | 'confirming'
  | 'submitted'
  | 'source-confirmed'
  | 'verifying'
  | 'destination-executing'
  | 'delivered'
  | 'action-required'
  | 'source-failed'

export type MarcoBridgeTracking = {
  status: MarcoBridgeProgress
  sourceTx?: string
  guid?: string
  destinationTx?: string
  message?: string
}

export type MarcoBridgeFailureCode =
  | 'PUBLIC_ACTIVATION_REQUIRED'
  | 'CANONICAL_CONFIG_MISSING'
  | 'UNSUPPORTED_ROUTE'
  | 'INVALID_DESTINATION'
  | 'WRONG_SOURCE_NETWORK'
  | 'INSUFFICIENT_MARCO'
  | 'INSUFFICIENT_GAS'
  | 'QUOTE_FAILED'
  | 'SOURCE_FAILED'

export class MarcoBridgeError extends Error {
  constructor(public readonly code: MarcoBridgeFailureCode, message: string) {
    super(message)
    this.name = 'MarcoBridgeError'
  }
}
