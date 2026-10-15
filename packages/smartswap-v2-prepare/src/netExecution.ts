/**
 * Net user output. Do not double-count fees already embedded in quoted gross output.
 *
 * Semantics:
 * - AMM quotes typically already deduct LP/venue fees from gross output
 *   (`venueFeesEmbeddedInGross = true`) → do not subtract venueFeeRaw again.
 * - SmartSwap protocol fee is Melega orchestration revenue and is subtracted
 *   unless the adapter declares it already embedded (never true in M2).
 * - Gas is included in net only when expressed in the SAME raw units as output.
 *   Otherwise netExcludesGas = true and gas remains a separate comparable cost.
 */

export interface NetExecutionInput {
  grossOutputRaw: string
  venueFeeRaw: string | null
  venueFeesEmbeddedInGross: boolean
  bridgeCostRaw: string | null
  bridgeCostsEmbeddedInGross: boolean
  gasCostInOutputRaw: string | null
  smartSwapFeeRaw: string | null
  smartSwapFeeEmbeddedInGross: boolean
}

export interface NetExecutionResult {
  grossOutputRaw: string
  subtractedVenueRaw: string
  subtractedBridgeRaw: string
  subtractedGasRaw: string
  subtractedSmartSwapFeeRaw: string
  netUserOutputRaw: string
  netExcludesGas: boolean
}

function asBig(value: string | null | undefined): bigint {
  if (value == null || value === '') return 0n
  if (!/^\d+$/.test(value)) throw new Error(`INVALID_NET_AMOUNT:${value}`)
  return BigInt(value)
}

export function computeNetUserOutput(input: NetExecutionInput): NetExecutionResult {
  const gross = asBig(input.grossOutputRaw)
  const venue = input.venueFeesEmbeddedInGross ? 0n : asBig(input.venueFeeRaw)
  const bridge = input.bridgeCostsEmbeddedInGross ? 0n : asBig(input.bridgeCostRaw)
  const gasComparable = input.gasCostInOutputRaw != null
  const gas = gasComparable ? asBig(input.gasCostInOutputRaw) : 0n
  const protocol = input.smartSwapFeeEmbeddedInGross ? 0n : asBig(input.smartSwapFeeRaw)
  const net = gross - venue - bridge - gas - protocol
  return {
    grossOutputRaw: gross.toString(),
    subtractedVenueRaw: venue.toString(),
    subtractedBridgeRaw: bridge.toString(),
    subtractedGasRaw: gas.toString(),
    subtractedSmartSwapFeeRaw: protocol.toString(),
    netUserOutputRaw: (net < 0n ? 0n : net).toString(),
    netExcludesGas: !gasComparable,
  }
}
