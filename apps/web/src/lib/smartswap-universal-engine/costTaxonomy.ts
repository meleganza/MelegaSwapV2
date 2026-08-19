/**
 * Cost taxonomy. Never merge venue, bridge, gas, and SmartSwap fee into one opaque value.
 * Gas is excluded from STRUCTURAL_ROUTE_COST (fee-band) and included in TOTAL_EXECUTION_COST.
 */

export interface RouteCostInputs {
  /** Venue / LP / aggregator fees in bps of notional. Null = uncertified. */
  venueFeesBps: number | null
  /** Bridge / messaging / relayer protocol costs in bps. Null = none or uncertified. */
  bridgeCostsBps: number | null
  /** Network gas in bps of notional. Used in total execution cost only. */
  gasCostBps: number | null
  /** True when quoted gross output already deducted venue/LP fees. */
  venueFeesEmbeddedInGross: boolean
  /** True when quoted gross already deducted bridge costs. */
  bridgeCostsEmbeddedInGross: boolean
}

export interface StructuralRouteCost {
  kind: 'STRUCTURAL_ROUTE_COST'
  venueFeesBps: number | null
  bridgeCostsBps: number | null
  /** venue + bridge. Gas excluded. Null if venue fees are uncertified. */
  structuralRouteCostBps: number | null
  certified: boolean
}

export interface TotalExecutionCost {
  kind: 'TOTAL_EXECUTION_COST'
  structuralRouteCostBps: number | null
  gasCostBps: number | null
  smartSwapFeeBps: number | null
  totalExecutionCostBps: number | null
}

export function computeStructuralRouteCost(input: RouteCostInputs): StructuralRouteCost {
  const venue = input.venueFeesBps
  if (venue == null) {
    return {
      kind: 'STRUCTURAL_ROUTE_COST',
      venueFeesBps: null,
      bridgeCostsBps: input.bridgeCostsBps,
      structuralRouteCostBps: null,
      certified: false,
    }
  }
  const bridge = input.bridgeCostsBps ?? 0
  return {
    kind: 'STRUCTURAL_ROUTE_COST',
    venueFeesBps: venue,
    bridgeCostsBps: input.bridgeCostsBps,
    structuralRouteCostBps: venue + bridge,
    certified: true,
  }
}

export function computeTotalExecutionCost(input: {
  structural: StructuralRouteCost
  gasCostBps: number | null
  smartSwapFeeBps: number | null
}): TotalExecutionCost {
  const structural = input.structural.structuralRouteCostBps
  const totalExecutionCostBps =
    structural == null || input.smartSwapFeeBps == null
      ? null
      : structural + (input.gasCostBps ?? 0) + input.smartSwapFeeBps
  return {
    kind: 'TOTAL_EXECUTION_COST',
    structuralRouteCostBps: structural,
    gasCostBps: input.gasCostBps,
    smartSwapFeeBps: input.smartSwapFeeBps,
    totalExecutionCostBps,
  }
}
