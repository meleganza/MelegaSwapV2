import { formatUnits } from '@ethersproject/units'
import { evaluateNativeFunds, isNativeFundsBlocked } from './nativeFunds'
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
  nativeFeeWei?: string
  nativeBalanceWei?: string
  gasPriceWei?: string
  approvalRequired?: boolean
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
  if (input.nativeBalanceWei != null && input.nativeFeeWei != null && input.gasPriceWei != null) {
    const verdict = evaluateNativeFunds({
      from: input.from,
      balanceWei: input.nativeBalanceWei,
      nativeFeeWei: input.nativeFeeWei,
      gasPriceWei: input.gasPriceWei,
      approvalRequired: Boolean(input.approvalRequired),
    })
    if (isNativeFundsBlocked(verdict)) {
      throw new MarcoBridgeError(verdict.code, verdict.reason)
    }
    return true
  }
  const nativeDecimals = source.walletFamily === 'solana' ? 9 : 18
  if (!decimalAmountGte(input.nativeGasBalance, input.minimumNativeGas, nativeDecimals)) {
    throw new MarcoBridgeError(
      input.from === 'bnb' ? 'INSUFFICIENT_BNB' : 'INSUFFICIENT_GAS',
      input.from === 'bnb' ? 'INSUFFICIENT BNB' : `Insufficient native gas on ${source.label}.`,
    )
  }
  return true
}

export function preflightNativeDecimalsFromWei(balanceWei: string, requiredWei: string): {
  nativeGasBalance: string
  minimumNativeGas: string
} {
  return {
    nativeGasBalance: formatUnits(balanceWei, 18),
    minimumNativeGas: formatUnits(requiredWei, 18),
  }
}
