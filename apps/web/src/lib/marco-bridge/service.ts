import { planMarcoBridgeRoute } from './routePolicy'
import { MarcoBridgeError, type MarcoBridgeNetworkId, type MarcoBridgeQuote, type MarcoBridgeTracking } from './types'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'
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
  track(sourceTx: string): Promise<MarcoBridgeTracking>
}

type QuoteFetch = (
  input: string,
  init: { method: 'POST'; headers: { 'content-type': 'application/json' }; body: string },
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

function assertQuoteReady(request: MarcoBridgeQuoteRequest) {
  const route = planMarcoBridgeRoute(request.from, request.to)
  if (route.kind !== 'direct') {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'This route requires a BNB intermediate step.')
  }
  const source = MARCO_WAVE1_NETWORKS[request.from]
  const destination = MARCO_WAVE1_NETWORKS[request.to]
  if (!validateBridgeAmount(request.amount, source.tokenDecimals)) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Enter a dust-free MARCO amount with at most 6 decimal places.')
  }
  if (!isValidMarcoDestination(request.sourceWallet, source.walletFamily)) {
    throw new MarcoBridgeError('QUOTE_FAILED', `Enter a valid ${source.label} source wallet.`)
  }
  if (!isValidMarcoDestination(request.destinationWallet, destination.walletFamily)) {
    throw new MarcoBridgeError('INVALID_DESTINATION', `Enter a valid ${destination.label} destination wallet.`)
  }
}

export async function requestMarcoBridgeQuote(
  request: MarcoBridgeQuoteRequest,
  fetcher: QuoteFetch = fetch as QuoteFetch,
): Promise<MarcoBridgeQuote> {
  assertQuoteReady(request)
  const response = await fetcher('/api/marco-bridge/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  })
  const payload = (await response.json()) as Partial<MarcoBridgeQuote> & { message?: string }
  if (!response.ok || payload.live !== true) {
    throw new MarcoBridgeError(
      'QUOTE_FAILED',
      payload.message || `LayerZero quote failed with HTTP ${response.status}.`,
    )
  }
  return payload as MarcoBridgeQuote
}

export const marcoBridgeService: MarcoBridgeService = {
  quote: requestMarcoBridgeQuote,
  async submit() {
    throw new MarcoBridgeError('PUBLIC_ACTIVATION_REQUIRED', 'Public bridge submission is disabled.')
  },
  async track(sourceTx) {
    if (!sourceTx) throw new MarcoBridgeError('QUOTE_FAILED', 'A source transaction is required for tracking.')
    const response = await fetch(`/api/marco-bridge/track?sourceTx=${encodeURIComponent(sourceTx)}`, {
      method: 'GET',
      cache: 'no-store',
    })
    const payload = (await response.json()) as MarcoBridgeTracking & { message?: string }
    if (!response.ok) throw new MarcoBridgeError('QUOTE_FAILED', payload.message || 'LayerZero tracking failed.')
    return payload
  },
}
