/**
 * Uniswap second-venue SHADOW/READINESS catalog.
 * Derives the first canonical EVM target from the certified venue table.
 * Does not choose a chain, router, provider, or fee band.
 * Does not execute, collect fees, or activate production.
 */

import {
  UNISWAP_VENUE,
  UNISWAP_VENUE_ID,
  VENUE_SUPPORT,
  isQuoteCapable,
  type VenueSupportState,
} from './certifiedVenues'
import { V2_M3_SHADOW_QUOTE_ONLY } from './evmShadowRegistry'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from './operatingMode'
import { VENUE_FEE_ENFORCEMENT_FUTURE } from './venueFeeEnforcementFuture'
import type { VenueRegistryEntry } from './venueRegistry'

export const UNISWAP_NEXT_REQUIRED_GATE = 'UNISWAP_ETHEREUM_V2_FEE_ENFORCEABLE_CANARY' as const

export interface UniswapCanonicalEvmTarget {
  chainId: number
  support: VenueSupportState
  router: string
  wrappedNative: string
}

export interface UniswapSecondVenueCatalog extends VenueRegistryEntry {
  venueId: typeof UNISWAP_VENUE_ID
  label: string
  firstCanonicalChainId: number
  support: typeof VENUE_SUPPORT.QUOTE_ONLY
  operatingMode: typeof SMARTSWAP_OPERATING_MODE.SHADOW
  executionEnabled: false
  certifiedRouter: string
  wrappedNative: string
  quoteMethod: typeof UNISWAP_VENUE.quoteMethod
  v2LpFeeBps: number
  feeEnforcementImplemented: false
  feeBeneficiary: typeof CANONICAL_SMARTSWAP_FEE_BENEFICIARY
  nextRequiredGate: typeof UNISWAP_NEXT_REQUIRED_GATE
}

function certifiedUniswapQuoteTargets(): UniswapCanonicalEvmTarget[] {
  return Object.keys(UNISWAP_VENUE.support)
    .map((key) => Number(key))
    .filter((chainId) => {
      const support = UNISWAP_VENUE.support[chainId]
      return Boolean(
        support &&
          isQuoteCapable(support) &&
          UNISWAP_VENUE.routers[chainId] &&
          UNISWAP_VENUE.wrappedNative[chainId],
      )
    })
    .map((chainId) => ({
      chainId,
      support: UNISWAP_VENUE.support[chainId] as VenueSupportState,
      router: UNISWAP_VENUE.routers[chainId] as string,
      wrappedNative: UNISWAP_VENUE.wrappedNative[chainId] as string,
    }))
}

/**
 * First canonical Uniswap EVM target is the single certified QUOTE_ONLY chain.
 * If the certified table is empty or ambiguous, fail closed — do not pick one.
 */
export function uniswapFirstCanonicalEvmTarget(): UniswapCanonicalEvmTarget {
  const targets = certifiedUniswapQuoteTargets()
  if (targets.length === 0) throw new Error('UNISWAP_CANONICAL_TARGET_MISSING')
  if (targets.length !== 1) throw new Error('UNISWAP_CANONICAL_TARGET_NOT_UNIQUE')
  return targets[0]
}

export function uniswapProductionExecutionEnabled(): false {
  return false
}

export function buildUniswapSecondVenueCatalog(): UniswapSecondVenueCatalog {
  if (PRODUCTION_EXECUTION_MODE !== SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION) {
    throw new Error('UNISWAP_REQUIRES_LEGACY_PRODUCTION')
  }
  if (UNIVERSAL_ENGINE_MODE !== SMARTSWAP_OPERATING_MODE.SHADOW) {
    throw new Error('UNISWAP_REQUIRES_SHADOW_ENGINE')
  }
  if (isProductionCutoverAllowed()) throw new Error('UNISWAP_CUTOVER_FORBIDDEN')
  const target = uniswapFirstCanonicalEvmTarget()
  if (target.support !== VENUE_SUPPORT.QUOTE_ONLY) {
    throw new Error(`UNISWAP_SUPPORT_NOT_QUOTE_ONLY:${target.support}`)
  }
  return {
    venueId: UNISWAP_VENUE_ID,
    label: UNISWAP_VENUE.label,
    enabled: false,
    productionEnabled: false,
    shadowQuoteEnabled: true,
    reason: V2_M3_SHADOW_QUOTE_ONLY,
    firstCanonicalChainId: target.chainId,
    support: VENUE_SUPPORT.QUOTE_ONLY,
    operatingMode: SMARTSWAP_OPERATING_MODE.SHADOW,
    executionEnabled: false,
    certifiedRouter: target.router,
    wrappedNative: target.wrappedNative,
    quoteMethod: UNISWAP_VENUE.quoteMethod,
    v2LpFeeBps: UNISWAP_VENUE.v2LpFeeBps,
    feeEnforcementImplemented: VENUE_FEE_ENFORCEMENT_FUTURE.uniswap.implemented,
    feeBeneficiary: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
    nextRequiredGate: UNISWAP_NEXT_REQUIRED_GATE,
  }
}

export function uniswapShadowRegistryEntry(): VenueRegistryEntry {
  const catalog = buildUniswapSecondVenueCatalog()
  return {
    venueId: catalog.venueId,
    enabled: catalog.enabled,
    productionEnabled: catalog.productionEnabled,
    shadowQuoteEnabled: catalog.shadowQuoteEnabled,
    reason: catalog.reason,
  }
}
