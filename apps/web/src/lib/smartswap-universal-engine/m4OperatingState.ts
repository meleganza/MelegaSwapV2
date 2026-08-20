/**
 * M4 operating states. Production remains LEGACY. V2 remains SHADOW.
 * Allowed: SIMULATION | FORK_SIMULATION | CANARY_PREPARED. Forbidden: PRODUCTION.
 */

export const M4_CERTIFICATION_STATE = {
  SIMULATION: 'SIMULATION',
  FORK_SIMULATION: 'FORK_SIMULATION',
  CANARY_PREPARED: 'CANARY_PREPARED',
  PRODUCTION: 'PRODUCTION',
} as const

export type M4CertificationState = (typeof M4_CERTIFICATION_STATE)[keyof typeof M4_CERTIFICATION_STATE]

export const M4_ACTIVE_CERTIFICATION: Exclude<M4CertificationState, 'PRODUCTION'> = M4_CERTIFICATION_STATE.CANARY_PREPARED

export const V2_ROLLOUT_STATE = {
  LEGACY_PRODUCTION: 'LEGACY_PRODUCTION',
  V2_CANARY: 'V2_CANARY',
  V2_PRODUCTION: 'V2_PRODUCTION',
  V2_DISABLED: 'V2_DISABLED',
} as const

export type V2RolloutState = (typeof V2_ROLLOUT_STATE)[keyof typeof V2_ROLLOUT_STATE]

/** M4 does not activate canary or V2 production. */
export const ACTIVE_V2_ROLLOUT: V2RolloutState = V2_ROLLOUT_STATE.LEGACY_PRODUCTION

export const V2_M4_MAINNET_BROADCAST_FORBIDDEN = 'V2_M4_MAINNET_BROADCAST_FORBIDDEN' as const
export const V2_M4_FEE_VERIFIED_FORBIDDEN = 'V2_M4_FEE_VERIFIED_FORBIDDEN' as const

export function isM4ProductionForbidden(): true {
  return true
}

export function assertNoMainnetBroadcast(): never {
  throw new Error(V2_M4_MAINNET_BROADCAST_FORBIDDEN)
}

export function venueExecutionEnabled(venueId: string, enabled: Record<string, boolean>): boolean {
  return enabled[venueId] === true
}
