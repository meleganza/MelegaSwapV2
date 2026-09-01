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
  track(guid: string): Promise<MarcoBridgeTracking>
}

type QuoteFetch = (
  input: string,
  init: { method: 'POST'; headers: { 'content-type': 'application/json' }; body: string },
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

export type PreparedSolanaBridge = {
  quote: MarcoBridgeQuote
  serializedTransaction: string
}

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

export async function prepareSolanaMarcoBridge(
  request: MarcoBridgeQuoteRequest,
  fetcher: QuoteFetch = fetch as QuoteFetch,
): Promise<PreparedSolanaBridge> {
  assertQuoteReady(request)
  if (request.from !== 'solana' || request.to !== 'bnb') {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'Only Solana → BNB uses prepared wallet transactions.')
  }
  const response = await fetcher('/api/marco-bridge/build', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...request, prepare: true }),
  })
  const payload = (await response.json()) as {
    quote?: MarcoBridgeQuote
    message?: string
    transactions?: Array<{ family?: string; serializedTransaction?: string }>
  }
  const transaction = payload.transactions?.find((item) => item.family === 'solana')
  if (!response.ok || payload.quote?.live !== true || !transaction?.serializedTransaction) {
    throw new MarcoBridgeError(
      'QUOTE_FAILED',
      payload.message || `Solana wallet preparation failed with HTTP ${response.status}.`,
    )
  }
  return { quote: payload.quote, serializedTransaction: transaction.serializedTransaction }
}

export const marcoBridgeService: MarcoBridgeService = {
  quote: requestMarcoBridgeQuote,
  async submit(request) {
    if (request.from === 'base' || request.to === 'base') {
      throw new MarcoBridgeError('PUBLIC_ACTIVATION_REQUIRED', 'Base routes are not activated.')
    }
    throw new MarcoBridgeError(
      'WALLET_REQUIRED',
      'Confirm the unsigned bridge transactions in the connected wallet. The server never broadcasts.',
    )
  },
  async track(guid) {
    if (!guid) throw new MarcoBridgeError('QUOTE_FAILED', 'A LayerZero transfer identifier is required.')
    return {
      status: 'source-confirmed',
      guid,
      message: 'Source transaction is confirmed. Delivery is still progressing; do not resend this bridge transfer.',
    }
  },
}
