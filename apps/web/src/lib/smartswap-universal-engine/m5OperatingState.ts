/**
 * M5 BNB canary-readiness operating states.
 * Production remains LEGACY. V2 remains SHADOW. No mainnet broadcast.
 */

import { PROTOCOL_FEE_STATE, type ProtocolFeeState } from './fee'

export const M5_CERTIFICATION_STATE = {
  PACKAGE_PREPARED: 'PACKAGE_PREPARED',
  FORK_PROVEN: 'FORK_PROVEN',
  CANARY_READY: 'CANARY_READY',
  FEE_VERIFIED: 'FEE_VERIFIED',
  PRODUCTION: 'PRODUCTION',
} as const

export type M5CertificationState = (typeof M5_CERTIFICATION_STATE)[keyof typeof M5_CERTIFICATION_STATE]

/** Highest M5 state. FEE_VERIFIED and PRODUCTION remain forbidden. */
export const M5_ACTIVE_CERTIFICATION: Exclude<M5CertificationState, 'FEE_VERIFIED' | 'PRODUCTION'> =
  M5_CERTIFICATION_STATE.CANARY_READY

export const V2_M5_MAINNET_BROADCAST_FORBIDDEN = 'V2_M5_MAINNET_BROADCAST_FORBIDDEN' as const
export const V2_M5_FEE_VERIFIED_FORBIDDEN = 'V2_M5_FEE_VERIFIED_FORBIDDEN' as const
export const V2_M5_FOUNDER_SIGN_FORBIDDEN = 'V2_M5_FOUNDER_SIGN_FORBIDDEN' as const

export function assertM5NoMainnetBroadcast(): never {
  throw new Error(V2_M5_MAINNET_BROADCAST_FORBIDDEN)
}

export function assertM5NeverFeeVerified(): never {
  throw new Error(V2_M5_FEE_VERIFIED_FORBIDDEN)
}

export function assertM5NoFounderSign(): never {
  throw new Error(V2_M5_FOUNDER_SIGN_FORBIDDEN)
}

export function classifyM5FeeState(input: {
  forkSucceeded: boolean
  mainnetTxHash: string | null
}): ProtocolFeeState {
  if (input.mainnetTxHash) throw new Error(V2_M5_FEE_VERIFIED_FORBIDDEN)
  if (input.forkSucceeded) return PROTOCOL_FEE_STATE.FEE_ENFORCEABLE
  return PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY
}

export const M5_CANARY_ROLLBACK = {
  disableV2Execution: 'pause SmartSwapExecutorV1; leave venue allowlist empty or paused',
  returnAuthority: 'ACTIVE_V2_ROLLOUT remains LEGACY_PRODUCTION',
  uxChange: false,
  userMigration: false,
  legacySmartSwap: 'unchanged production path',
} as const
