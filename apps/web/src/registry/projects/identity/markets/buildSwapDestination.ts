import { NATIVE } from '@pancakeswap/sdk'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { normalizeEvmAddress } from '../caip'
import {
  CANONICAL_SWAP_ROUTE,
  type MarketAvailability,
  type MarketReasonCode,
} from './schema'
import { buildDestinationId } from './ids'
import type { ProjectMarketRecord, SwapDestinationDescriptor } from './types'

const WBNB_BSC = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

function chainQuerySlug(chainId: number): string | null {
  const name = CHAIN_QUERY_NAME[chainId as keyof typeof CHAIN_QUERY_NAME]
  return typeof name === 'string' ? name : null
}

function nativeSymbol(chainId: number): string | null {
  const entry = NATIVE[chainId as keyof typeof NATIVE]
  return entry?.symbol ?? null
}

/**
 * Map wrapped-native quote to native URL currency id when Trade URL supports it.
 * Falls back to checksummed address.
 */
export function currencyParamForAsset(parts: {
  chainId: number
  contractAddress: string | null
  symbol: string
  preferNativeForWrapped?: boolean
}): string | null {
  const addr = parts.contractAddress ? normalizeEvmAddress(parts.contractAddress) : null
  if (parts.preferNativeForWrapped && addr === WBNB_BSC && parts.chainId === 56) {
    return nativeSymbol(56) ?? 'BNB'
  }
  if (addr) {
    // Trade URL parser accepts checksummed or any isAddress()-valid form; lowercase is fine.
    return addr
  }
  const native = nativeSymbol(parts.chainId)
  if (native && parts.symbol.toUpperCase() === native.toUpperCase()) return native
  return null
}

function buildHref(route: string, query: Record<string, string>): string {
  const params = new URLSearchParams()
  // Stable key order for deterministic hrefs
  for (const key of Object.keys(query).sort()) {
    params.set(key, query[key])
  }
  const qs = params.toString()
  return qs ? `${route}?${qs}` : route
}

export function buildMarketSwapDestinations(input: {
  projectId: string
  market: ProjectMarketRecord
  baseAddress: string
  quoteAddress: string
  connectedChainId?: number | null
}): SwapDestinationDescriptor[] {
  const { projectId, market, baseAddress, quoteAddress, connectedChainId } = input
  const destinations: SwapDestinationDescriptor[] = []

  const chainSlug = chainQuerySlug(market.chainId)
  if (!chainSlug) {
    return [
      unavailableDestination({
        projectId,
        market,
        reasonCode: 'CHAIN_UNSUPPORTED',
        label: 'Swap unavailable — unsupported chain',
      }),
    ]
  }

  if (market.availability === 'CONFLICTED' || market.status === 'UNRESOLVED') {
    return [
      unavailableDestination({
        projectId,
        market,
        reasonCode: market.reasonCode ?? 'MARKET_MAPPING_CONFLICTED',
        label: 'Swap destination unavailable',
        availability: 'CONFLICTED',
        status: 'CONFLICTED',
      }),
    ]
  }

  if (market.status === 'PAUSED' || market.status === 'DEPRECATED' || market.status === 'INACTIVE') {
    return [
      unavailableDestination({
        projectId,
        market,
        reasonCode:
          market.status === 'PAUSED'
            ? 'MARKET_PAUSED'
            : market.status === 'DEPRECATED'
              ? 'MARKET_DEPRECATED'
              : 'MARKET_INACTIVE',
        label: `Market ${market.status.toLowerCase()} — swap CTA unavailable`,
        status: 'PAUSED',
        availability: 'UNAVAILABLE',
      }),
    ]
  }

  if (market.availability !== 'AVAILABLE' || market.status !== 'ACTIVE') {
    return [
      unavailableDestination({
        projectId,
        market,
        reasonCode: 'SWAP_DESTINATION_UNAVAILABLE',
        label: 'Swap destination unavailable',
      }),
    ]
  }

  const baseParam = currencyParamForAsset({
    chainId: market.chainId,
    contractAddress: baseAddress,
    symbol: market.baseSymbol,
  })
  const quoteParam = currencyParamForAsset({
    chainId: market.chainId,
    contractAddress: quoteAddress,
    symbol: market.quoteSymbol,
    preferNativeForWrapped: true,
  })

  if (!baseParam || !quoteParam) {
    return [
      unavailableDestination({
        projectId,
        market,
        reasonCode: 'INVALID_ASSET_IDENTIFIER',
        label: 'Swap destination unavailable — invalid asset identifier',
      }),
    ]
  }

  const chainSwitchMayBeRequired =
    connectedChainId != null && connectedChainId !== market.chainId

  // Buy project base with quote/native
  destinations.push(
    makeDestination({
      projectId,
      market,
      direction: 'BUY',
      inputParam: quoteParam,
      outputParam: baseParam,
      inputAssetId: market.quoteAssetId,
      outputAssetId: market.baseAssetId,
      chainSlug,
      chainSwitchMayBeRequired,
      label: `Open Swap · buy ${market.baseSymbol}`,
    }),
  )

  // Sell project base for quote/native
  destinations.push(
    makeDestination({
      projectId,
      market,
      direction: 'SELL',
      inputParam: baseParam,
      outputParam: quoteParam,
      inputAssetId: market.baseAssetId,
      outputAssetId: market.quoteAssetId,
      chainSlug,
      chainSwitchMayBeRequired,
      label: `Open Swap · sell ${market.baseSymbol}`,
    }),
  )

  return destinations
}

function makeDestination(parts: {
  projectId: string
  market: ProjectMarketRecord
  direction: 'BUY' | 'SELL'
  inputParam: string
  outputParam: string
  inputAssetId: string
  outputAssetId: string
  chainSlug: string
  chainSwitchMayBeRequired: boolean
  label: string
}): SwapDestinationDescriptor {
  const queryParameters: Record<string, string> = {
    inputCurrency: parts.inputParam,
    outputCurrency: parts.outputParam,
    chain: parts.chainSlug,
  }
  const destinationId = buildDestinationId({
    projectId: parts.projectId,
    marketId: parts.market.marketId,
    chainId: parts.market.chainId,
    inputParam: parts.inputParam,
    outputParam: parts.outputParam,
    direction: parts.direction,
  })
  return {
    destinationId,
    projectId: parts.projectId,
    marketId: parts.market.marketId,
    chainId: parts.market.chainId,
    inputAssetId: parts.inputAssetId,
    outputAssetId: parts.outputAssetId,
    inputCurrencyParam: parts.inputParam,
    outputCurrencyParam: parts.outputParam,
    route: CANONICAL_SWAP_ROUTE,
    href: buildHref(CANONICAL_SWAP_ROUTE, queryParameters),
    queryParameters,
    walletRequired: false,
    chainSwitchMayBeRequired: parts.chainSwitchMayBeRequired,
    availability: 'AVAILABLE',
    status: 'READY',
    reasonCode: null,
    label: parts.label,
    limitations: [
      'Navigation context only — opens the existing Melega DEX swap surface.',
      'No quote or execution authorization is included.',
    ],
  }
}

function unavailableDestination(parts: {
  projectId: string
  market: ProjectMarketRecord
  reasonCode: MarketReasonCode
  label: string
  availability?: MarketAvailability
  status?: SwapDestinationDescriptor['status']
}): SwapDestinationDescriptor {
  const destinationId = buildDestinationId({
    projectId: parts.projectId,
    marketId: parts.market.marketId,
    chainId: parts.market.chainId,
    inputParam: 'none',
    outputParam: 'none',
    direction: 'OPEN',
  })
  return {
    destinationId,
    projectId: parts.projectId,
    marketId: parts.market.marketId,
    chainId: parts.market.chainId,
    inputAssetId: parts.market.baseAssetId,
    outputAssetId: parts.market.quoteAssetId,
    inputCurrencyParam: '',
    outputCurrencyParam: '',
    route: CANONICAL_SWAP_ROUTE,
    href: CANONICAL_SWAP_ROUTE,
    queryParameters: {},
    walletRequired: false,
    chainSwitchMayBeRequired: false,
    availability: parts.availability ?? 'UNAVAILABLE',
    status: parts.status ?? 'UNAVAILABLE',
    reasonCode: parts.reasonCode,
    label: parts.label,
    limitations: ['No active swap destination for this market state.'],
  }
}

/** Asset-level destination when tradable but no registered pair market. */
export function buildAssetTradableDestination(input: {
  projectId: string
  chainId: number
  assetId: string
  tokenAddress: string
  symbol: string
  connectedChainId?: number | null
}): SwapDestinationDescriptor | null {
  const chainSlug = chainQuerySlug(input.chainId)
  const outputParam = normalizeEvmAddress(input.tokenAddress)
  if (!chainSlug || !outputParam) return null
  const native = nativeSymbol(input.chainId)
  const queryParameters: Record<string, string> = {
    outputCurrency: outputParam,
    chain: chainSlug,
  }
  if (native) queryParameters.inputCurrency = native
  const destinationId = buildDestinationId({
    projectId: input.projectId,
    marketId: null,
    chainId: input.chainId,
    inputParam: queryParameters.inputCurrency ?? 'native',
    outputParam,
    direction: 'BUY',
  })
  return {
    destinationId,
    projectId: input.projectId,
    marketId: null,
    chainId: input.chainId,
    inputAssetId: native ? `native:${input.chainId}` : 'unknown',
    outputAssetId: input.assetId,
    inputCurrencyParam: queryParameters.inputCurrency ?? '',
    outputCurrencyParam: outputParam,
    route: CANONICAL_SWAP_ROUTE,
    href: buildHref(CANONICAL_SWAP_ROUTE, queryParameters),
    queryParameters,
    walletRequired: false,
    chainSwitchMayBeRequired:
      input.connectedChainId != null && input.connectedChainId !== input.chainId,
    availability: 'AVAILABLE',
    status: 'READY',
    reasonCode: 'ASSET_TRADABLE_WITHOUT_REGISTERED_MARKET',
    label: `Trade ${input.symbol} on Melega DEX`,
    limitations: [
      'No registered pair market — destination preselects the project asset only.',
      'Navigation context only — no quote or execution authorization.',
    ],
  }
}
