import { MELEGA_FACTORY, MELEGA_ROUTER } from 'lib/liquidity-building-runtime/types'

export { MELEGA_FACTORY, MELEGA_ROUTER }

/** Zero address — never treat as a deployed program. */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export type LiquidityBuildingDeployedAddresses = {
  lbFactory: string | null
  lbAuthorizer: string | null
  lbFeeSink: string | null
  /** Bound program for the connected owner when known; null until Factory lookup succeeds. */
  programAddress: string | null
}

/**
 * Production LB contract bindings.
 * Populated only from verified deployment — never placeholders or test addresses.
 */
export const LB_DEPLOYED_ADDRESSES: LiquidityBuildingDeployedAddresses = {
  lbFactory: null,
  lbAuthorizer: null,
  lbFeeSink: null,
  programAddress: null,
}

export function isDeployedAddress(value: string | null | undefined): value is string {
  if (!value) return false
  const v = value.toLowerCase()
  return v !== ZERO_ADDRESS.toLowerCase() && /^0x[a-f0-9]{40}$/.test(v)
}
