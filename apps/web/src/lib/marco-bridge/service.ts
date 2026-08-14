import { planMarcoBridgeRoute } from './routePolicy'
import { MarcoBridgeError, type MarcoBridgeNetworkId, type MarcoBridgeQuote, type MarcoBridgeTracking } from './types'
import { MARCO_WAVE1_NETWORKS, MARCO_WAVE1_PUBLIC_ACTIVATION, wave1ActivationBlockers } from './wave1Registry'
import { isValidMarcoDestination, validateBridgeAmount } from './validation'

export type MarcoBridgeQuoteRequest = {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  amount: string
  sourceWallet: string
  destinationWallet: string
}

export interface MarcoBridgeService {
  quote(request: MarcoBridgeQuoteRequest): Promise<MarcoBridgeQuote>
  submit(request: MarcoBridgeQuoteRequest, quote: MarcoBridgeQuote): Promise<MarcoBridgeTracking>
  track(guid: string): Promise<MarcoBridgeTracking>
}

function assertReady(request: MarcoBridgeQuoteRequest) {
  const route = planMarcoBridgeRoute(request.from, request.to)
  if (route.kind !== 'direct') {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'This route requires a BNB intermediate step.')
  }
  if (!validateBridgeAmount(request.amount)) throw new MarcoBridgeError('QUOTE_FAILED', 'Enter a valid MARCO amount.')
  const destination = MARCO_WAVE1_NETWORKS[request.to]
  if (!isValidMarcoDestination(request.destinationWallet, destination.walletFamily)) {
    throw new MarcoBridgeError('INVALID_DESTINATION', `Enter a valid ${destination.label} destination wallet.`)
  }
  const blockers = wave1ActivationBlockers()
  if (blockers.some((item) => item !== 'Explicit public activation gate')) {
    throw new MarcoBridgeError('CANONICAL_CONFIG_MISSING', 'Certified bridge configuration has not been imported.')
  }
  if (!MARCO_WAVE1_PUBLIC_ACTIVATION.enabled || !route.enabled) {
    throw new MarcoBridgeError('PUBLIC_ACTIVATION_REQUIRED', 'This route is certified but not publicly activated.')
  }
}

/**
 * Fail-closed adapter. No fabricated quote or transaction can escape while
 * canonical identities and the approved transport are unavailable.
 */
export const marcoBridgeService: MarcoBridgeService = {
  async quote(request) {
    assertReady(request)
    throw new MarcoBridgeError('QUOTE_FAILED', 'Bridge quote transport is not activated.')
  },
  async submit(request) {
    assertReady(request)
    throw new MarcoBridgeError('PUBLIC_ACTIVATION_REQUIRED', 'Public bridge submission is not activated.')
  },
  async track(guid) {
    if (!guid) throw new MarcoBridgeError('QUOTE_FAILED', 'A LayerZero transfer identifier is required.')
    return { status: 'action-required', guid, message: 'Tracking transport is awaiting public activation.' }
  },
}
