import type { MarcoBridgePreflight, MarcoBridgeQuote } from './types'
import { MarcoBridgeError } from './errors'
import { getMarcoBridgeNetwork } from './wave1Registry'

export function assertBridgePreflight(quote: MarcoBridgeQuote, preflight: MarcoBridgePreflight): void {
  const source = getMarcoBridgeNetwork(quote.intent.from)
  if (preflight.connectedWalletFamily !== source.walletFamily) {
    throw new MarcoBridgeError('WRONG_WALLET_FAMILY', `Connect a ${source.walletFamily.toUpperCase()} source wallet.`)
  }
  if (source.walletFamily === 'evm' && preflight.connectedChainId !== source.chainId) {
    throw new MarcoBridgeError('WRONG_SOURCE_NETWORK', `Switch the wallet to ${source.name}.`)
  }
  if (preflight.marcoBalance.lt(quote.amount.sendLD)) {
    throw new MarcoBridgeError('INSUFFICIENT_MARCO', 'Insufficient MARCO balance.')
  }
  if (preflight.nativeBalance.lt(quote.nativeFee)) {
    throw new MarcoBridgeError('INSUFFICIENT_GAS', `Insufficient ${source.nativeFeeSymbol} for the bridge fee.`)
  }
}

export function requiresMarcoApproval(quote: MarcoBridgeQuote, preflight: MarcoBridgePreflight): boolean {
  return quote.intent.from === 'bnb' && (preflight.allowance?.lt(quote.amount.sendLD) ?? true)
}
