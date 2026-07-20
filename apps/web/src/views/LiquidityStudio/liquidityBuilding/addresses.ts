/**
 * LB018 — production address binding helpers.
 * Bind only verified chain-56 deployments. Never placeholders / test wallets.
 */

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
 * LB018: remains all-null while `DEPLOYMENT_INPUTS_BLOCKED`.
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

export type DeploymentBindingCandidate = {
  chainId: number
  deploymentReadinessState: string
  activationAuthorized: boolean
  lbFactory: string | null
  lbAuthorizer: string | null
  lbFeeSink: string | null
  programAddress?: string | null
}

export type BindingResult =
  | { ok: true; addresses: LiquidityBuildingDeployedAddresses }
  | { ok: false; reason: string }

/**
 * Accept binding only when inputs are VALID/DEPLOYED, activation path authorized,
 * and all core addresses are real non-zero addresses on chain 56.
 * Rejects temporary / test / placeholder candidates.
 */
export function resolveProductionBinding(candidate: DeploymentBindingCandidate): BindingResult {
  if (candidate.chainId !== 56) {
    return { ok: false, reason: 'WRONG_CHAIN' }
  }
  if (candidate.deploymentReadinessState !== 'VALID' && candidate.deploymentReadinessState !== 'DEPLOYED') {
    return { ok: false, reason: 'DEPLOYMENT_INPUTS_BLOCKED' }
  }
  if (!candidate.activationAuthorized) {
    return { ok: false, reason: 'ACTIVATION_NOT_AUTHORIZED' }
  }
  if (!isDeployedAddress(candidate.lbFactory)) {
    return { ok: false, reason: 'LB_FACTORY_MISSING' }
  }
  if (!isDeployedAddress(candidate.lbAuthorizer)) {
    return { ok: false, reason: 'LB_AUTHORIZER_MISSING' }
  }
  if (!isDeployedAddress(candidate.lbFeeSink)) {
    return { ok: false, reason: 'LB_FEE_SINK_MISSING' }
  }
  return {
    ok: true,
    addresses: {
      lbFactory: candidate.lbFactory,
      lbAuthorizer: candidate.lbAuthorizer,
      lbFeeSink: candidate.lbFeeSink,
      programAddress: isDeployedAddress(candidate.programAddress ?? null) ? candidate.programAddress! : null,
    },
  }
}
