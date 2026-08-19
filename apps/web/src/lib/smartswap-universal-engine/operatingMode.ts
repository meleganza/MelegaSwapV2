/**
 * SmartSwap Universal Engine M1 — operating states.
 * Production execution stays LEGACY_PRODUCTION. V2 is SHADOW only.
 */

export const SMARTSWAP_UNIVERSAL_ENGINE_ID = 'SMARTSWAP_UNIVERSAL_ENGINE_M1' as const
export const SMARTSWAP_UNIVERSAL_ENGINE_M2_ID = 'SMARTSWAP_UNIVERSAL_ENGINE_M2' as const

export const SMARTSWAP_OPERATING_MODE = {
  LEGACY_PRODUCTION: 'LEGACY_PRODUCTION',
  SHADOW: 'SHADOW',
  CANARY: 'CANARY',
  PRODUCTION: 'PRODUCTION',
} as const

export type SmartSwapOperatingMode = (typeof SMARTSWAP_OPERATING_MODE)[keyof typeof SMARTSWAP_OPERATING_MODE]

/** Authoritative user execution path for this mission. */
export const PRODUCTION_EXECUTION_MODE: SmartSwapOperatingMode = SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION

/** Universal engine may observe/normalize/compare only. */
export const UNIVERSAL_ENGINE_MODE: SmartSwapOperatingMode = SMARTSWAP_OPERATING_MODE.SHADOW

export const V2_SHADOW_EXECUTION_FORBIDDEN = 'V2_SHADOW_EXECUTION_FORBIDDEN' as const
export const V2_EXTERNAL_VENUE_NOT_ENABLED = 'V2_EXTERNAL_VENUE_NOT_ENABLED' as const
export const V2_SOLANA_EXECUTION_NOT_ENABLED = 'V2_SOLANA_EXECUTION_NOT_ENABLED' as const

export function isLegacyProductionAuthoritative(): boolean {
  return PRODUCTION_EXECUTION_MODE === SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION
}

export function isUniversalEngineShadowOnly(): boolean {
  return UNIVERSAL_ENGINE_MODE === SMARTSWAP_OPERATING_MODE.SHADOW
}

export function assertV2CannotExecute(mode: SmartSwapOperatingMode = UNIVERSAL_ENGINE_MODE): never {
  throw new Error(`${V2_SHADOW_EXECUTION_FORBIDDEN}: mode=${mode}`)
}

export function isProductionCutoverAllowed(): boolean {
  return false
}
