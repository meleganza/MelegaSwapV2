/**
 * SMARTSWAP_REVENUE_POLICY_V1 — canonical, versioned, machine-readable.
 * One policy. Do not scatter fee percentages. Shadow / non-production until certified.
 */

export const SMARTSWAP_REVENUE_POLICY_ID = 'SMARTSWAP_REVENUE_POLICY_V1' as const
export const SMARTSWAP_REVENUE_POLICY_VERSION = '1.0.0' as const

export const REVENUE_REASON = {
  LOW_COST_ROUTE_MAX_FEE: 'LOW_COST_ROUTE_MAX_FEE',
  MID_COST_ROUTE_REDUCED_FEE: 'MID_COST_ROUTE_REDUCED_FEE',
  HIGH_COST_ROUTE_MIN_FEE: 'HIGH_COST_ROUTE_MIN_FEE',
  FEE_ENFORCEMENT_UNAVAILABLE: 'FEE_ENFORCEMENT_UNAVAILABLE',
  QUOTE_VALUE_UNAVAILABLE: 'QUOTE_VALUE_UNAVAILABLE',
  ROUTE_COST_UNCERTIFIED: 'ROUTE_COST_UNCERTIFIED',
  ZERO_INPUT: 'ZERO_INPUT',
  HOST_CANNOT_OVERRIDE_REVENUE_POLICY: 'HOST_CANNOT_OVERRIDE_REVENUE_POLICY',
  MINIMUM_REVENUE_OBSERVE_ONLY: 'MINIMUM_REVENUE_OBSERVE_ONLY',
} as const

export type RevenueReasonCode = (typeof REVENUE_REASON)[keyof typeof REVENUE_REASON]

export type FeeBandId = 'BAND_0_10' | 'BAND_11_25' | 'BAND_26_40' | 'BAND_41_60' | 'BAND_61_PLUS'

export interface RevenuePolicyBand {
  id: FeeBandId
  /** Inclusive upper bound of structural cost in bps. */
  maxStructuralCostBpsInclusive: number
  feeBps: number
  reason: RevenueReasonCode
}

export const MINIMUM_REVENUE_POLICY = {
  enabled: false,
  mode: 'OBSERVE_ONLY' as const,
  amount: null,
  currency: null,
}

export interface SmartSwapRevenuePolicy {
  id: typeof SMARTSWAP_REVENUE_POLICY_ID
  version: typeof SMARTSWAP_REVENUE_POLICY_VERSION
  /** Maximum standard SmartSwap protocol fee. Not charged on every route. */
  maxProtocolFeeBps: 25
  /** Guidance for venue structural cost + SmartSwap fee, excluding gas. */
  targetStructuralCostPlusFeeBps: 50
  minimumRevenue: typeof MINIMUM_REVENUE_POLICY
  bands: readonly RevenuePolicyBand[]
}

export const SMARTSWAP_REVENUE_POLICY_V1: SmartSwapRevenuePolicy = {
  id: SMARTSWAP_REVENUE_POLICY_ID,
  version: SMARTSWAP_REVENUE_POLICY_VERSION,
  maxProtocolFeeBps: 25,
  targetStructuralCostPlusFeeBps: 50,
  minimumRevenue: MINIMUM_REVENUE_POLICY,
  bands: [
    {
      id: 'BAND_0_10',
      maxStructuralCostBpsInclusive: 10,
      feeBps: 25,
      reason: REVENUE_REASON.LOW_COST_ROUTE_MAX_FEE,
    },
    {
      id: 'BAND_11_25',
      maxStructuralCostBpsInclusive: 25,
      feeBps: 20,
      reason: REVENUE_REASON.MID_COST_ROUTE_REDUCED_FEE,
    },
    {
      id: 'BAND_26_40',
      maxStructuralCostBpsInclusive: 40,
      feeBps: 15,
      reason: REVENUE_REASON.MID_COST_ROUTE_REDUCED_FEE,
    },
    {
      id: 'BAND_41_60',
      maxStructuralCostBpsInclusive: 60,
      feeBps: 10,
      reason: REVENUE_REASON.HIGH_COST_ROUTE_MIN_FEE,
    },
    {
      id: 'BAND_61_PLUS',
      maxStructuralCostBpsInclusive: Number.MAX_SAFE_INTEGER,
      feeBps: 5,
      reason: REVENUE_REASON.HIGH_COST_ROUTE_MIN_FEE,
    },
  ],
}

export function getCanonicalRevenuePolicy(): SmartSwapRevenuePolicy {
  return SMARTSWAP_REVENUE_POLICY_V1
}

/**
 * Hosts (DEX, Space, embeds) must not supply a fee. Engine owns economics.
 */
export function resolveRevenuePolicy(hostOverride?: unknown): SmartSwapRevenuePolicy {
  if (hostOverride !== undefined && hostOverride !== null) {
    throw new Error(REVENUE_REASON.HOST_CANNOT_OVERRIDE_REVENUE_POLICY)
  }
  return SMARTSWAP_REVENUE_POLICY_V1
}
