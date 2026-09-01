export type MarcoBridgeNetworkId = 'bnb' | 'base' | 'solana' | 'robinhood'
export type MarcoWalletFamily = 'evm' | 'solana'

export type MarcoBridgeNetwork = {
  id: MarcoBridgeNetworkId
  label: string
  shortLabel: string
  walletFamily: MarcoWalletFamily
  chainId: number | null
  layerZeroEid: number
  marcoIdentity: string
  endpointContract: string
  tokenDecimals: 9 | 18
  sharedDecimals: 6
  nativeFeeSymbol: 'BNB' | 'ETH' | 'SOL'
  explorerUrl: string | null
  protectivePaused?: boolean
}

export type MarcoBridgeRoute = {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  direct: boolean
  enabled: boolean
}

export type MarcoBridgeQuoteBinding = {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  sourceWallet: string
  destinationWallet: string
  amount: string
  amountLD: string
  dstEid: number
  toBytes32: string
  store: string
  programId: string
  mint: string
  escrow: string
  tokenAccount: string
  /** Caller-supplied extra options. Canonical MARCO sends intentionally use none. */
  optionsHex: string
  /** Live on-chain enforced options, bound for config freshness but never re-sent as extra options. */
  enforcedOptionsHex: string
  nativeFeeWei: string
  lookupTable: string
  expiresAt: string
  identity: string
}

export type MarcoBridgeQuote = {
  amount: string
  expectedReceive: string
  nativeFee: string
  nativeFeeWei: string
  nativeFeeSymbol: string
  routeLabel: string
  quotedAt: string
  expiresAt?: string
  live: true
  routePaused: boolean
  publiclyActive: boolean
  executionEnabled: boolean
  binding?: MarcoBridgeQuoteBinding
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
  | 'INSUFFICIENT_BNB'
  | 'APPROVAL_FAILED'
  | 'QUOTE_FAILED'
  | 'SOURCE_FAILED'
  | 'SOLANA_PAUSED'
  | 'WALLET_REQUIRED'

export class MarcoBridgeError extends Error {
  constructor(public readonly code: MarcoBridgeFailureCode, message: string) {
    super(message)
    this.name = 'MarcoBridgeError'
  }
}
