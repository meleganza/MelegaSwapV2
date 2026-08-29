import { BigNumber, type BigNumberish } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { planMarcoBridgeRoute } from './routePolicy'
import type { CanonicalMmnRouteState } from './routeAuthority'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'
import { MarcoBridgeError, type MarcoBridgeNetworkId, type MarcoBridgeQuote } from './types'
import { destinationToBytes32, formatBridgeAmount, isValidMarcoDestination, parseBridgeAmount } from './validation'

export type MarcoBridgeSendParam = {
  dstEid: number
  to: string
  amountLD: string
  minAmountLD: string
  extraOptions: '0x'
  composeMsg: '0x'
  oftCmd: '0x'
}

export interface MarcoBridgeQuoteReader {
  quoteSend(endpointContract: string, sendParam: MarcoBridgeSendParam): Promise<{ nativeFee: BigNumberish }>
  quoteOft(endpointContract: string, sendParam: MarcoBridgeSendParam): Promise<{ amountReceivedLD: BigNumberish }>
}

export type ReadOnlyQuoteInput = {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  amount: string
  destinationWallet: string
}

export async function readOnlyMarcoBridgeQuote(
  input: ReadOnlyQuoteInput,
  authority: CanonicalMmnRouteState,
  reader: MarcoBridgeQuoteReader,
  quotedAt = new Date().toISOString(),
): Promise<MarcoBridgeQuote> {
  const routePlan = planMarcoBridgeRoute(input.from, input.to)
  if (routePlan.kind !== 'direct') {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'A live quote is available only for certified direct routes.')
  }

  const source = MARCO_WAVE1_NETWORKS[input.from]
  const destination = MARCO_WAVE1_NETWORKS[input.to]
  if (source.walletFamily !== 'evm') {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Read-only Solana source quoting is not available in this EVM client.')
  }
  if (!isValidMarcoDestination(input.destinationWallet, destination.walletFamily)) {
    throw new MarcoBridgeError('INVALID_DESTINATION', `Enter a valid ${destination.label} destination wallet.`)
  }
  const amount = parseBridgeAmount(input.amount, source.tokenDecimals)
  if (!amount) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Enter a dust-free MARCO amount with no more than 6 decimal places.')
  }

  const canonicalRoute = authority.routes.find((route) => route.from === input.from && route.to === input.to)
  if (!canonicalRoute?.certified) {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'The canonical MMN authority has not certified this route.')
  }
  const canonicalSource = authority.networks.find((network) => network.id === input.from)
  if (!canonicalSource) throw new MarcoBridgeError('CANONICAL_CONFIG_MISSING', 'Canonical source binding is missing.')

  const sendParam: MarcoBridgeSendParam = {
    dstEid: destination.layerZeroEid,
    to: destinationToBytes32(input.destinationWallet, destination.walletFamily),
    amountLD: amount.amountLD.toString(),
    minAmountLD: amount.amountLD.toString(),
    extraOptions: '0x',
    composeMsg: '0x',
    oftCmd: '0x',
  }

  const [messagingFee, oftReceipt] = await Promise.all([
    reader.quoteSend(canonicalSource.endpoint_contract, sendParam),
    reader.quoteOft(canonicalSource.endpoint_contract, sendParam),
  ])
  const received = BigNumber.from(oftReceipt.amountReceivedLD)
  const nativeFee = BigNumber.from(messagingFee.nativeFee)

  return {
    amount: amount.normalized,
    expectedReceive: formatBridgeAmount(received, source.tokenDecimals),
    nativeFee: formatUnits(nativeFee, 18),
    nativeFeeSymbol: source.nativeFeeSymbol,
    routeLabel: `${source.shortLabel} → ${destination.shortLabel}`,
    quotedAt,
    live: true,
    routePaused: canonicalRoute.paused,
    publiclyActive: canonicalRoute.publicly_active,
    executionEnabled: authority.global_execution_enabled && canonicalRoute.execution_enabled,
  }
}
