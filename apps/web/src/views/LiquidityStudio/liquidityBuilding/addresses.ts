/**
 * LB018 / Mainnet Activation — production address binding helpers.
 * Canonical source: apps/web/src/config/constants/liquidityBuildingDeployment.ts
 * Artifact twin: deployments/liquidity-building/chain-56/deployed-addresses.v1.json
 * Bind only verified chain-56 deployments. Never placeholders / test wallets.
 */

import {
  LB_CANONICAL_DEPLOYED_ADDRESSES,
  LB_MELEGA_AMM,
  readCanonicalLbAddresses,
} from 'config/constants/liquidityBuildingDeployment'

export const MELEGA_FACTORY = LB_MELEGA_AMM.factory
export const MELEGA_ROUTER = LB_MELEGA_AMM.router

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
 * Production LB contract bindings — single canonical read.
 * Remains all-null while mainnet deploy has not been verified.
 */
export const LB_DEPLOYED_ADDRESSES: LiquidityBuildingDeployedAddresses = {
  lbFactory: LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory,
  lbAuthorizer: LB_CANONICAL_DEPLOYED_ADDRESSES.lbAuthorizer,
  lbFeeSink: LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeSink,
  programAddress: LB_CANONICAL_DEPLOYED_ADDRESSES.programAddress,
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

/** Runtime readiness from the canonical binding (no fabricated READY). */
export function assessExecutionReadiness(addrs: LiquidityBuildingDeployedAddresses = readCanonicalLbAddresses()): {
  ready: boolean
  status: 'READY' | 'BLOCKED'
  reason: string | null
  missing: string[]
} {
  const missing: string[] = []
  if (!isDeployedAddress(addrs.lbFactory)) missing.push('LB Factory')
  if (!isDeployedAddress(addrs.lbAuthorizer)) missing.push('LB Authorizer')
  if (!isDeployedAddress(addrs.lbFeeSink)) missing.push('LB FeeSink')
  if (missing.length) {
    return {
      ready: false,
      status: 'BLOCKED',
      reason: 'LB_PROGRAM_NOT_DEPLOYED',
      missing,
    }
  }
  return { ready: true, status: 'READY', reason: null, missing: [] }
}
