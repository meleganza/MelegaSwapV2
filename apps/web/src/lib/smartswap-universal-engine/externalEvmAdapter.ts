/**
 * External EVM venue adapter (PancakeSwap / Uniswap).
 * QUOTE only. EXECUTE is always false. No wallet / signer / approval.
 */

import { evmNative, type CanonicalAssetId, evmContract } from './assetIdentity'
import { capabilityMap } from './capabilities'
import { EXECUTION_DOMAIN, evmNetwork, isEvmNetwork } from './domain'
import { PROTOCOL_FEE_STATE, SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP, emptyFeeFact } from './fee'
import { VENUE_HEALTH_STATE, healthSnapshot, type VenueHealthSnapshot } from './health'
import { refuseV2Execution, type SmartSwapVenueAdapter, type VenueIdentity } from './venueAdapter'
import { computeMinimumReceived, type NormalizedQuote } from './quote';
import { VENUE_SUPPORT, isQuoteCapable, type CertifiedEvmVenue } from './certifiedVenues'
import { fetchBestV2PathQuote, v2CandidatePaths, type ShadowQuoteSource } from './shadowQuoteSource'

function pathAddress(asset: CanonicalAssetId, wrappedNative: string | undefined): string {
  if (asset.location.kind === 'native') {
    if (!wrappedNative) throw new Error('WRAPPED_NATIVE_UNKNOWN')
    return wrappedNative.toLowerCase()
  }
  if (asset.location.kind !== 'contract') throw new Error('NON_EVM_ASSET')
  return asset.location.address
}

export function createExternalEvmVenueAdapter(
  spec: CertifiedEvmVenue,
  source: ShadowQuoteSource,
): SmartSwapVenueAdapter {
  const identity: VenueIdentity = {
    venueId: spec.venueId,
    label: spec.label,
    executionDomain: EXECUTION_DOMAIN.EVM,
    networks: Object.keys(spec.routers).map((id) => evmNetwork(Number(id))),
  }
  const capabilities = capabilityMap(['QUOTE', 'EXACT_IN', 'EVM'])
  const health: VenueHealthSnapshot = healthSnapshot(spec.venueId, VENUE_HEALTH_STATE.HEALTHY)

  return {
    identity: () => identity,
    capabilities: () => capabilities,
    supportsAssetPair(request) {
      if (request.exactOut) return false
      if (!isEvmNetwork(request.network) || !isEvmNetwork(request.inputAsset.network) || !isEvmNetwork(request.outputAsset.network)) {
        return false
      }
      if (request.network.chainId !== request.inputAsset.network.chainId) return false
      if (request.inputAsset.network.chainId !== request.outputAsset.network.chainId) return false
      const support = spec.support[request.network.chainId]
      return Boolean(support && isQuoteCapable(support) && spec.routers[request.network.chainId])
    },
    async quote(request, context) {
      if (request.exactOut) throw new Error('EXACT_OUT_UNSUPPORTED')
      if (!isEvmNetwork(request.network)) throw new Error('SAME_CHAIN_EVM_ONLY')
      if (request.inputAsset.network.domain !== EXECUTION_DOMAIN.EVM) throw new Error('SAME_CHAIN_EVM_ONLY')
      if (!isEvmNetwork(request.inputAsset.network) || !isEvmNetwork(request.outputAsset.network)) {
        throw new Error('SAME_CHAIN_EVM_ONLY')
      }
      if (request.inputAsset.network.chainId !== request.outputAsset.network.chainId) {
        throw new Error('CROSS_CHAIN_FORBIDDEN')
      }
      if (request.network.chainId !== request.inputAsset.network.chainId) {
        throw new Error('WRONG_CHAIN_ASSET')
      }
      const chainId = request.network.chainId
      const router = spec.routers[chainId]
      const wrapped = spec.wrappedNative[chainId]
      if (!router || !isQuoteCapable(spec.support[chainId] ?? VENUE_SUPPORT.NOT_VERIFIED)) {
        throw new Error(`VENUE_CHAIN_UNSUPPORTED:${spec.venueId}:${chainId}`)
      }
      const tokenIn = pathAddress(request.inputAsset, wrapped)
      const tokenOut = pathAddress(request.outputAsset, wrapped)
      if (tokenIn === tokenOut) throw new Error('NO_ROUTE')
      // Same bounded candidate set as every other certified V2 venue on this chain; exact same input for each path.
      const observation = await fetchBestV2PathQuote(
        source,
        { chainId, router, amountInRaw: request.inputAmountRaw, signal: context.signal },
        v2CandidatePaths(chainId, tokenIn, tokenOut, wrapped),
      )
      if (!observation.amountOutRaw || observation.amountOutRaw === '0') throw new Error('NO_ROUTE')
      const path = observation.path.map((address) => address.toLowerCase())
      const quotedAt = observation.quotedAt || context.nowIso
      const hops = path.slice(1).map((address, index) => ({
        index,
        venueId: spec.venueId,
        poolRef: null,
        tokenIn: index === 0 ? request.inputAsset : evmContract(chainId, path[index], chainId === 56 ? 'WBNB' : undefined, 18),
        tokenOut:
          index === path.length - 2
            ? request.outputAsset
            : evmContract(chainId, address, chainId === 56 ? 'WBNB' : undefined, 18),
      }))
      return {
        quoteId: `${spec.venueId}:${chainId}:${path.join('>')}:${request.inputAmountRaw}`,
        venueId: spec.venueId,
        venueLabel: spec.label,
        executionDomain: EXECUTION_DOMAIN.EVM,
        network: evmNetwork(chainId),
        inputAsset: request.inputAsset,
        outputAsset: request.outputAsset,
        inputAmountRaw: request.inputAmountRaw,
        grossOutputRaw: observation.amountOutRaw,
        netUserOutputRaw: observation.amountOutRaw,
        estimatedGasUnits: observation.gasUnits,
        gasAsset: evmNative(chainId),
        gasCostRaw: null,
        venueFeeRaw: null,
        priceImpactPercent: observation.priceImpactPercent,
        minimumReceivedRaw: computeMinimumReceived(observation.amountOutRaw, request.slippageBps),
        hops,
        quotedAt,
        expiresAt: null,
        stale: false,
        confidence: observation.kind === 'FACTUAL' ? 70 : 50,
        valid: true,
        protocolFee: {
          ...emptyFeeFact(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY, SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP),
          formulaId: 'smartswap-revenue-policy-v1-shadow',
        },
        productionExecutionCapable: false,
      } satisfies NormalizedQuote
    },
    prepareExecution: refuseV2Execution,
    execute: refuseV2Execution,
    async verifyReceipt() {
      return { verified: false, feeCollected: false }
    },
    health: () => health,
  }
}

