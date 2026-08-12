import { validateDestinationWallet } from './address'
import { canonicalizeBridgeAmount } from './amounts'
import { MarcoBridgeError } from './errors'
import { resolveCertifiedDirectRoute } from './routePolicy'
import type { CanonicalBridgeAmount, MarcoBridgeIntent, MarcoBridgeRoute } from './types'
import { getMarcoBridgeNetwork } from './wave1Registry'

export interface ValidatedMarcoBridgeIntent {
  intent: MarcoBridgeIntent
  route: MarcoBridgeRoute
  amount: CanonicalBridgeAmount
}

export function validateMarcoBridgeIntent(intent: MarcoBridgeIntent): ValidatedMarcoBridgeIntent {
  const route = resolveCertifiedDirectRoute(intent)
  const source = getMarcoBridgeNetwork(intent.from)
  const destination = getMarcoBridgeNetwork(intent.to)
  let sourceWallet: string
  try {
    sourceWallet = validateDestinationWallet(intent.sourceWallet, source.walletFamily)
  } catch (error) {
    throw new MarcoBridgeError(
      'WRONG_WALLET_FAMILY',
      error instanceof Error ? error.message : 'Connect the correct source wallet before bridging.',
    )
  }
  let destinationWallet: string
  try {
    destinationWallet = validateDestinationWallet(intent.destinationWallet, destination.walletFamily)
  } catch (error) {
    throw new MarcoBridgeError(
      'INVALID_DESTINATION',
      error instanceof Error ? error.message : 'Enter a valid destination wallet.',
    )
  }
  let amount: CanonicalBridgeAmount
  try {
    amount = canonicalizeBridgeAmount(intent.amount, source.decimals, destination.decimals)
  } catch (error) {
    throw new MarcoBridgeError('INVALID_AMOUNT', error instanceof Error ? error.message : 'Enter a valid MARCO amount.')
  }
  return {
    intent: { ...intent, sourceWallet, destinationWallet },
    route,
    amount,
  }
}
