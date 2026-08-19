/**
 * Future SmartSwap protocol-fee enforcement possibilities.
 * M3 documents only. Does not implement collection.
 */

export const FEE_ENFORCEMENT_POSSIBILITY = {
  VENUE_NATIVE_INTEGRATOR_FEE: 'venue-native integrator fee',
  WRAPPER_EXECUTOR: 'wrapper executor',
  INPUT_SPLIT: 'input split',
  OUTPUT_SETTLEMENT: 'output settlement',
  AGGREGATOR_SUPPORTED_FEE: 'aggregator-supported fee',
  SETTLEMENT_CONTRACT: 'settlement contract',
  UNSUPPORTED: 'unsupported',
} as const

export type FeeEnforcementPossibility =
  (typeof FEE_ENFORCEMENT_POSSIBILITY)[keyof typeof FEE_ENFORCEMENT_POSSIBILITY]

export const VENUE_FEE_ENFORCEMENT_FUTURE: Record<
  string,
  { primary: FeeEnforcementPossibility; also: FeeEnforcementPossibility[]; implemented: false }
> = {
  'melega-dex': {
    primary: FEE_ENFORCEMENT_POSSIBILITY.VENUE_NATIVE_INTEGRATOR_FEE,
    also: [
      FEE_ENFORCEMENT_POSSIBILITY.WRAPPER_EXECUTOR,
      FEE_ENFORCEMENT_POSSIBILITY.SETTLEMENT_CONTRACT,
    ],
    implemented: false,
  },
  pancakeswap: {
    primary: FEE_ENFORCEMENT_POSSIBILITY.WRAPPER_EXECUTOR,
    also: [FEE_ENFORCEMENT_POSSIBILITY.INPUT_SPLIT, FEE_ENFORCEMENT_POSSIBILITY.OUTPUT_SETTLEMENT],
    implemented: false,
  },
  uniswap: {
    primary: FEE_ENFORCEMENT_POSSIBILITY.WRAPPER_EXECUTOR,
    also: [
      FEE_ENFORCEMENT_POSSIBILITY.AGGREGATOR_SUPPORTED_FEE,
      FEE_ENFORCEMENT_POSSIBILITY.INPUT_SPLIT,
    ],
    implemented: false,
  },
}
