import { MARCO_WAVE1_NETWORKS } from './wave1Registry'
import { planMarcoBridgeRoute } from './routePolicy'
import { MarcoBridgeError, type MarcoBridgeNetworkId } from './types'
import { decimalAmountGte, isValidMarcoDestination, validateBridgeAmount } from './validation'

export type MarcoBridgePreflight = {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  amount: string
  marcoBalance: string
  nativeGasBalance: string
  minimumNativeGas: string
  connectedEvmChainId: number | null
  destinationWallet: string
}

export function assertMarcoBridgePreflight(input: MarcoBridgePreflight): true {
  const source = MARCO_WAVE1_NETWORKS[input.from]
  const destination = MARCO_WAVE1_NETWORKS[input.to]
  if (planMarcoBridgeRoute(input.from, input.to).kind !== 'direct') {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'Select a certified direct route through BNB.')
  }
  if (source.walletFamily === 'evm' && source.chainId !== input.connectedEvmChainId) {
    throw new MarcoBridgeError('WRONG_SOURCE_NETWORK', `Switch your wallet to ${source.label}.`)
  }
  if (!isValidMarcoDestination(input.destinationWallet, destination.walletFamily)) {
    throw new MarcoBridgeError('INVALID_DESTINATION', `Enter a valid ${destination.label} wallet.`)
  }
  if (
    !validateBridgeAmount(input.amount, source.tokenDecimals) ||
    !decimalAmountGte(input.marcoBalance, input.amount, source.tokenDecimals)
  ) {
    throw new MarcoBridgeError('INSUFFICIENT_MARCO', 'Insufficient MARCO balance.')
  }
  const nativeDecimals = source.walletFamily === 'solana' ? 9 : 18
  if (!decimalAmountGte(input.nativeGasBalance, input.minimumNativeGas, nativeDecimals)) {
    throw new MarcoBridgeError('INSUFFICIENT_GAS', `Insufficient native gas on ${source.label}.`)
  }
  return true
}
